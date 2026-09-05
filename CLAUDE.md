# CLAUDE.md — Cocktail Momentum V2

Conventions and contracts for anyone (human or Claude Code) working in this repo.
The build sequence lives in [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md);
the visual language lives in [docs/STYLE_GUIDE.md](docs/STYLE_GUIDE.md). Read this file
first — it is the short one.

---

## What this is

An AI cocktail generator. A user logs in with an emailed magic link, keeps a pantry of
ingredients in Azure Table Storage, and asks `gpt-5-nano` for 3–5 cocktails constrained by
what they actually have. They can favourite recipes and share a 12-hour, read-only link
that lets someone else generate against their bar.

## Stack

| | |
|---|---|
| Host | Azure Static Web Apps, **Standard** plan, **managed** functions |
| API | C# Azure Functions v4, isolated worker, `dotnet-isolated:8.0`, in `api/` |
| Front end | Angular 22, standalone + signals, zoneless, no SSR, in `app/` |
| Data | Azure Table Storage — 7 tables, no other database |
| AI | Azure OpenAI `gpt-5-nano` (`2025-08-07`), Global Standard, `australiaeast` |
| Email | SendGrid |
| Infra | Bicep in `infra/`, provisioned with `azd` |
| Deploy | GitHub Actions → `Azure/static-web-apps-deploy@v1` |

---

## Commands

```bash
# Local development — needs Azurite running and api/local.settings.json populated
azurite --silent --location .azurite &
cd app && npm start                       # Angular dev server on :4200
swa start http://localhost:4200 --api-location api   # proxy on :4280 — use this URL

# Build
cd app && npm run build                   # → app/dist/app/browser
dotnet publish api/Cocktail.Api.csproj -c Release -o api_publish

# Infrastructure — first time, set the secrets infra/main.parameters.json needs:
azd env new <environment-name>
azd env set SENDGRID_API_KEY <key>
azd env set SENDGRID_FROM_EMAIL <verified-sender@example.com>
azd env set JWT_SIGNING_KEY $(openssl rand -base64 32)
azd env set UNLIMITED_EMAILS "you@example.com"   # optional, comma-separated, can be empty

azd provision --preview                   # what-if
azd up                                    # provision + deploy the front end
                                           # (the managed API deploys via GitHub Actions,
                                           #  not azd — see azure.yaml and Phase 2)
```

**Always exercise the app through the SWA CLI on `:4280`, never `:4200` directly.** Auth
cookies and `/api` routing only work through the proxy.

---

## Hard platform constraints

Verified against Microsoft Learn, September 2026. Do not design around them being false.

1. **45-second ceiling on every API request.** No exceptions, no plan upgrade that lifts it.
2. **HTTP triggers only** in managed functions — no timers, no queues, no Durable Functions.
   Cleanup work is piggybacked onto request handling.
3. **No managed identity, no Key Vault references.** Secrets are plain SWA app settings.
4. **`/api` is the only allowed route prefix.**
5. **Table Storage has no TTL.** Expiry is enforced on read and purged opportunistically.
6. **SWA supports at most `dotnet-isolated:9.0`.** There is no .NET 10 support and no
   published timeline. .NET 8 LTS ends **November 2026** — keep runtime-specific code
   confined so a move to `node:22` or bring-your-own Functions stays cheap.
7. **Reserved app-setting prefixes** (never use): `APPSETTING_`, `AZUREBLOBSTORAGE_`,
   `AZUREFILESSTORAGE_`, `AZURE_FUNCTION_`, `CONTAINER_`, `DIAGNOSTICS_`, `DOCKER_`,
   `FUNCTIONS_`, `IDENTITY_`, `MACHINEKEY_`, `MAINSITE_`, `MSDEPLOY_`, `SCMSITE_`, `SCM_`,
   `WEBSITES_`, `WEBSITE_`, `WEBSOCKET_`, `AzureWeb`.

---

## Non-negotiable rules

### Security

- **Never store a raw token.** Magic-link and share tokens are stored as SHA-256 hex only.
  The raw value exists in the outgoing email or the one-time response, and nowhere else.
- **Never log a token, a cookie value, a signing key or an API key.**
- **Every endpoint resolves its caller through `Security/CallerContext.cs`.** Do not read
  cookies or parse JWTs anywhere else.
- **Guests (`scope: "guest"`) get `403` on every mutating route** and see only in-stock
  pantry items with `toOrder` stripped. Enforce centrally, not per-endpoint.
- **`POST /auth/request-link` always returns `202`** with an identical body regardless of
  whether the account exists. No user enumeration.
- Session cookie: `HttpOnly; Secure; SameSite=Lax; Path=/`.
- CSRF: mutating routes require `X-XSRF-TOKEN` matching the `XSRF-TOKEN` cookie. Those
  exact names are chosen so Angular's `HttpClient` attaches the header for free — do not
  rename them.

### AI

- **Never trust model output.** Every returned ingredient is matched against the pantry by
  `NameNormalized` server-side, and cocktails are filtered by strictness *after* the call.
  The prompt is a hint; the filter is the contract.
- One call per request. No retries — a retry does not fit inside 45 seconds.
- Cancel at **40 s** and return `ai_timeout`. Never let the SWA's own timeout surface.
- `gpt-5-nano` is a reasoning model: use `max_completion_tokens`, not `max_tokens`, and
  keep `reasoning_effort` low.
- Use strict `json_schema` structured outputs. Never parse free-form text.
- **Quota: 10 generations per user per rolling 24h; whitelisted emails are unlimited.**
  Enforced in `Services/QuotaService.cs` before the model is called — never client-side.
  Three rules that are easy to get wrong:
  1. **Guests spend the owner's quota**, not their own. Resolve one `quotaUserId` (the
     `owner` claim for guests, `sub` otherwise) and charge everything to it. Otherwise a
     share link is an unlimited-generation bypass.
  2. **Record only on success.** A timeout, an error or an empty result must not cost a
     slot — that charges users for our outages.
  3. **The whitelist is checked against the `Users` row email**, not the JWT claim, so the
     same code path works for guests (whose token carries the guest's context, not the
     owner's). Source is the `UNLIMITED_EMAILS` app setting.

### Data

- Partition keys are chosen so the common read is a single-partition query. Keep it that
  way; do not introduce cross-partition scans.
- `NameNormalized` (lowercase, trimmed, punctuation stripped) is the only dedupe and
  matching key for ingredients. Compute it in one shared helper.
- Seeding never overwrites an existing row or its flags.

---

## Code conventions

### API (C#)

- One file per endpoint group in `Functions/` (`AuthFunctions.cs`, `PantryFunctions.cs`, …).
- Business logic lives in `Services/`; functions stay thin — parse, authorise, delegate,
  shape the response.
- Entities in `Models/` implement `ITableEntity`. DTOs are separate records — **never
  return a table entity directly**, or you leak `ETag`, `Timestamp` and internal fields.
- Every error response uses the shared shape:
  ```json
  { "error": { "code": "invalid_request", "message": "Human-readable, no internals." } }
  ```
  Codes: `unauthorized`, `forbidden`, `not_found`, `invalid_request`, `rate_limited`,
  `quota_exceeded`, `ai_unavailable`, `ai_timeout`, `internal`.
- Configuration is read once into `AppConfig` and validated at startup. Never call
  `Environment.GetEnvironmentVariable` from a function body.
- `async`/`await` throughout, with `CancellationToken` threaded to every I/O call.

### Front end (Angular)

- Standalone components only. No `NgModule`.
- Signals for state: `signal()`, `computed()`, `input()`, `output()`. No `BehaviorSubject`
  stores, no `zone.js` patterns.
- New control flow (`@if`, `@for`, `@switch`), never `*ngIf` / `*ngFor`.
- `core/` = services, stores, guards, interceptors. `features/` = one folder per route.
  `shared/ui/` = presentational primitives that take inputs and emit outputs, and hold no
  business logic.
- HTTP calls only from a service in `core/`, never from a component.
- Component styles are scoped `.scss` in the component. There is exactly one global
  stylesheet, `src/styles.scss`, and it holds the design tokens and reset only.

### Styling

- **Read tokens, never redeclare them.** Only `src/styles.scss` defines custom properties.
  A component that needs a new colour gets a new token at the root, not a literal.
- Follow [docs/STYLE_GUIDE.md](docs/STYLE_GUIDE.md) precisely: the four-step elevation ramp
  (§2.2), the spacing set `2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 36, 44, 48, 80` (§4), the
  radius scale (§5), and the motion durations (§7).
- **One accent.** Brass marks the primary action, focus, active state — nothing else. Two
  brass things side by side means one is wrong.
- No 2px borders. No drop shadows except the accent glow.
- `--text-muted` fails AA. It may carry counts, hints and timestamps that have a duplicate
  affordance; it must never be the only description of a form field.
- Playfair Display is for the `<h1>` and nothing else.
- **If you change the brass or the page background, change all four places**: the token,
  the PWA `theme_color`, the icon stroke, and `<meta name="theme-color">`.
- If you extend the system, update `docs/STYLE_GUIDE.md` in the same commit. The guide
  currently describes the previous Lit implementation in §8 — that section gets replaced
  with Angular equivalents during Phase 9. §§1–7 transfer unchanged.

---

## Testing

**No tests for now** — a deliberate decision by the owner, not an oversight. When they are
added, these are the places that matter, in priority order:

1. `TokenService` — magic-link issue, verify, single-use, expiry.
2. `JwtService` / `CallerContext` — guest scoping and the mutating-route `403`.
3. `QuotaService` — the 24h window boundary, the whitelist bypass, guest generations
   charged to the owner, and no slot consumed on a failed call.
4. Share-link expiry and revocation boundaries.
5. `CocktailAi` strictness enforcement, especially `strict` discarding an out-of-stock
   ingredient the model invented.
6. Pantry `NameNormalized` dedupe and the seed no-overwrite rule.

Everything on that list fails silently in production if it is wrong, which is why it is
the list.

---

## Application settings

Bicep writes these into the SWA; `api/local.settings.json` mirrors them for local work and
is gitignored.

`STORAGE_CONNECTION_STRING`, `APPLICATIONINSIGHTS_CONNECTION_STRING`,
`AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY`,
`AZURE_OPENAI_DEPLOYMENT`, `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME`,
`JWT_SIGNING_KEY`, `APP_BASE_URL`, `MAGIC_LINK_TTL_MINUTES`, `SESSION_TTL_DAYS`,
`SHARE_LINK_TTL_HOURS`, `DAILY_GENERATION_LIMIT`, `UNLIMITED_EMAILS`.

`APPLICATIONINSIGHTS_CONNECTION_STRING` is read directly by the Application Insights SDK
(`Microsoft.Azure.Functions.Worker.ApplicationInsights`, wired in `Program.cs`) — it is
never read through `AppConfig`, so leaving it unset locally is a silent no-op, not a
startup failure.

`UNLIMITED_EMAILS` is comma-separated and lowercased, and is the one setting that gets
edited routinely. Editing it in SWA Configuration needs no redeploy, but the app parses it
at startup, so the functions host must restart before the change takes effect.

See IMPLEMENTATION_PLAN §6 for sources and notes.

---

## Deployment gotcha

Publish the .NET API yourself in CI and set **`skip_api_build: true`** on
`Azure/static-web-apps-deploy@v1`. Letting the SWA build service compile a .NET isolated
project is the most common failure mode for this stack, and the error messages it produces
are unhelpful.

---

## Working agreements

- Follow the plan's phases in order and stop at each **Checkpoint**. If a checkpoint cannot
  pass, report it rather than working around it.
- Do not add dependencies not named in the plan without asking.
- Do not commit or push unless asked.
- `local.settings.json`, `.env` and anything holding a real key stay out of git.
