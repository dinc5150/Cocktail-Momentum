# Cocktail Momentum V2 — Implementation Plan

Target audience: **Claude Code**, building this repo from empty.
Companion document: [CLAUDE.md](../CLAUDE.md) holds the conventions, contracts and
commands you must follow while executing this plan. Read it before Phase 0.
Visual language: [docs/STYLE_GUIDE.md](STYLE_GUIDE.md).

---

## 0. Decisions already made

These were settled with the product owner. Do not relitigate them.

| Area | Decision |
|---|---|
| Host | Azure Static Web Apps (Standard plan), **managed** functions |
| API | C# Azure Functions v4, **isolated worker**, `dotnet-isolated:8.0` |
| Front end | Angular (standalone + signals), PWA-installable |
| Data | Azure Table Storage |
| AI | Azure AI Foundry → Azure OpenAI, `gpt-5-nano` (`2025-08-07`), Global Standard |
| Email | SendGrid |
| Infra | Bicep, provisioned via `azd` |
| Deploy | GitHub Actions → SWA (front end + managed API in one workflow) |
| Session | Magic-link → HS256 JWT in a `Secure; HttpOnly; SameSite=Lax` cookie, 30 days |
| Share link | 12h, **generate-only, pantry read-only**, cannot write anything |
| AI quota | **10 generations per user per rolling 24h**; whitelisted emails are unlimited |
| Seed pantry | ~70 curated items as versioned JSON in the repo |
| Tests | **None for now.** Note where they belong; do not write them. |

### Open items to confirm with the owner before Phase 1

1. **Angular version.** Current stable is **22.x**; the npm `lts` dist-tags sit on
   **21** and **20**. "Latest LTS" is therefore ambiguous. This plan assumes **Angular 22**
   (current stable, full support). If the owner meant the literal LTS tag, use 21 — the
   plan is otherwise unchanged.
2. **.NET runtime risk.** SWA managed functions support at most `dotnet-isolated:9.0`;
   .NET 10 is unsupported with no published timeline. .NET 9 left support May 2026 and
   .NET 8 LTS ends **November 2026**. This plan targets `dotnet-isolated:8.0` because it is
   the newest option supported by both .NET and SWA, and confines runtime-specific code so
   the escape hatch stays cheap. Escape hatches, in preference order: switch the API to
   `node:22` (fully current on SWA), or move to bring-your-own Functions on .NET 10
   (needs the SWA Standard plan, which we already provision, plus a separate deploy).
3. **Azure region, subscription and resource-group naming**, and whether an Azure AI
   Foundry hub already exists or Bicep should create the account.
4. **SendGrid**: API key, verified sender identity/domain, and whether a dynamic template
   ID should be used or the HTML lives in the repo.
5. **Custom domain**, if any — affects the magic-link base URL and the cookie domain.
6. **The initial `UNLIMITED_EMAILS` whitelist** — which addresses go in at first deploy.
   The owner's own address is the obvious first entry.

---

## 1. Architecture

```
Cocktail-Momentum-V2/
├─ CLAUDE.md                       # conventions — read first
├─ azure.yaml                      # azd project definition
├─ .github/workflows/deploy.yml    # build Angular + publish .NET API + SWA deploy
├─ infra/
│  ├─ main.bicep                   # subscription-scope entry point
│  ├─ main.parameters.json
│  └─ modules/
│     ├─ storage.bicep             # Storage account + 7 tables
│     ├─ openai.bicep              # Cognitive Services account + gpt-5-nano deployment
│     └─ swa.bicep                 # Static Web App (Standard) + app settings
├─ api/                            # C# .NET 8 isolated Functions
│  ├─ Cocktail.Api.csproj
│  ├─ Program.cs
│  ├─ host.json
│  ├─ local.settings.json          # gitignored
│  ├─ Functions/                   # one file per endpoint group
│  ├─ Services/                    # TableStore, TokenService, MailService, CocktailAi, QuotaService
│  ├─ Models/                      # entities + DTOs
│  └─ Security/                    # JWT issue/validate, CallerContext, CSRF
├─ app/                            # Angular workspace
│  ├─ src/app/{core,features,shared}/
│  ├─ src/styles.scss              # design tokens (STYLE_GUIDE §2.1)
│  └─ public/staticwebapp.config.json
├─ data/pantry-seed.json           # ~70 curated ingredients
└─ docs/{STYLE_GUIDE.md, IMPLEMENTATION_PLAN.md}
```

### Request flow

```
Browser ──/api/*──> SWA edge ──> managed Functions (Windows, .NET 8 isolated)
                                      ├─> Azure Table Storage   (connection string)
                                      ├─> Azure OpenAI          (endpoint + key)
                                      └─> SendGrid              (api key)
```

Everything is same-origin under the SWA, so there is **no CORS** and cookies flow without
`withCredentials`.

---

## 2. Platform constraints you must design around

Verified against Microsoft Learn, September 2026. These are not negotiable.

1. **Every API request must finish inside 45 seconds.** Applies to all SWA backends.
   The generate endpoint must budget for it (see Phase 6).
2. **Managed functions support HTTP triggers only.** No timers, no queues, no Durable
   Functions. Any cleanup work must be piggybacked onto request handling.
3. **No managed identity and no Key Vault references in managed functions.** All secrets
   are plain SWA application settings written by Bicep at deploy time.
4. **Reserved app-setting prefixes**: `APPSETTING_`, `AZUREBLOBSTORAGE_`,
   `AZUREFILESSTORAGE_`, `AZURE_FUNCTION_`, `CONTAINER_`, `DIAGNOSTICS_`, `DOCKER_`,
   `FUNCTIONS_`, `IDENTITY_`, `MACHINEKEY_`, `MAINSITE_`, `MSDEPLOY_`, `SCMSITE_`, `SCM_`,
   `WEBSITES_`, `WEBSITE_`, `WEBSOCKET_`, `AzureWeb`. Our names avoid all of these.
5. **The API route prefix is fixed at `/api`.**
6. **Table Storage has no TTL.** Expired magic-link and share tokens must be filtered on
   read and purged opportunistically.
7. **`gpt-5-nano` is Global Standard only** in `australiaeast`. It is a reasoning model:
   use `max_completion_tokens` (not `max_tokens`) and set a low `reasoning_effort`.

---

## 3. Data model — Azure Table Storage

Seven tables. `PK` = PartitionKey, `RK` = RowKey. All timestamps are UTC ISO-8601 strings.

### `Users`
| | |
|---|---|
| PK | `"user"` |
| RK | `userId` (GUID, no dashes) |
| Props | `Email`, `CreatedUtc`, `LastLoginUtc`, `OnboardedUtc` (null until onboarding completes) |

### `UserIndex` — email → userId lookup
| | |
|---|---|
| PK | `"email"` |
| RK | lowercased, trimmed email |
| Props | `UserId` |

> Email addresses contain no characters illegal in a RowKey (`/ \ # ?`), so they are used
> directly. Reject any submitted email containing those characters as invalid anyway.

### `Pantry`
| | |
|---|---|
| PK | `userId` |
| RK | `ingredientId` (GUID) |
| Props | `Name`, `NameNormalized`, `Category`, `InStock` (bool), `ToOrder` (bool), `CreatedUtc`, `UpdatedUtc` |

Partition-per-user means the whole pantry is one cheap partition query.
`NameNormalized` (lowercase, trimmed, punctuation stripped) is the dedupe and
AI-matching key.

### `Favourites`
| | |
|---|---|
| PK | `userId` |
| RK | `{reverseTicks}-{guid}` so a partition scan returns newest-first |
| Props | `Name`, `Description`, `IngredientsJson`, `StepsJson`, `SourcePrompt`, `SavedUtc` |

### `LoginTokens`
| | |
|---|---|
| PK | `"magic"` |
| RK | SHA-256 hex of the raw token |
| Props | `UserId`, `ExpiresUtc`, `ConsumedUtc` (null until used), `RequestedIp` |

**Never store the raw token.** 15-minute expiry, single use.

### `ShareLinks`
| | |
|---|---|
| PK | `"share"` |
| RK | SHA-256 hex of the raw token |
| Props | `OwnerUserId`, `CreatedUtc`, `ExpiresUtc`, `RevokedUtc`, `Label` |

Listing a user's links filters on `OwnerUserId` within the single partition — acceptable
at this scale, and recorded in §7 as a known scaling limit.

### `RateLimit`
| | |
|---|---|
| PK | `generate:{userId}`, `login:{email}` or `login:{ip}` |
| RK | `{reverseTicks}-{guid}` so the newest rows sort first |
| Props | `AtUtc`, `ViaShareId` (null for the owner's own generations) |

One row per counted event. Because the RowKey leads with reverse ticks, a window count is
a bounded range query over one partition — take rows while `RK < reverseTicks(now - window)`
and stop. Never scan the whole partition.

**Guest generations are written under the owner's `generate:{userId}` partition**, with
`ViaShareId` set. That is what stops a share link from being an unlimited-quota bypass; see
Phase 6.

Rows older than 48h are deleted opportunistically whenever a partition is read.

---

## 4. API surface

All routes are under `/api`. Auth column: **U** = user cookie required, **G** = guest
cookie accepted, **—** = anonymous.

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/request-link` | — | Body `{ email }`. Always returns `202`, never reveals whether the account exists. Creates the user if new. |
| GET | `/auth/callback?token=` | — | Validates, consumes, sets the session cookie, `302` to `/onboarding` or `/generate`. |
| POST | `/auth/logout` | U | Clears cookies. |
| GET | `/me` | U/G | `{ userId, email, onboarded, isGuest, ownerLabel, quota }` or `401`. `quota` is `{ used, limit, unlimited, resetsUtc }` — see Phase 6. |
| POST | `/me/onboarded` | U | Stamps `OnboardedUtc`. |
| GET | `/pantry` | U/G | Guests receive **in-stock items only**, with `toOrder` stripped. |
| POST | `/pantry` | U | `{ name, category? }` → created item. Rejects duplicates by `NameNormalized`. |
| PATCH | `/pantry/{id}` | U | `{ name?, inStock?, toOrder? }`, partial. |
| DELETE | `/pantry/{id}` | U | |
| POST | `/pantry/seed` | U | `{ mode: "onboarding" \| "examples" }`. Adds seed items absent from the pantry; never duplicates, never overwrites flags. |
| POST | `/cocktails/generate` | U/G | `{ prompt, strictness, count? }` → validated cocktails. |
| GET | `/favourites` | U | Newest first. |
| POST | `/favourites` | U | Body is one cocktail object. |
| DELETE | `/favourites/{id}` | U | |
| GET | `/share` | U | Active (unexpired, unrevoked) links. |
| POST | `/share` | U | Creates a 12h link → `{ url, expiresUtc }`. The raw token is returned **once**. |
| DELETE | `/share/{id}` | U | Revokes. |
| POST | `/share/{token}/session` | — | Validates the token, sets a guest cookie scoped to the owner, `expiry = min(linkExpiry, now + 12h)`. |

**Guests are rejected with `403` on every mutating route.** Enforce this in one place
(`Security/CallerContext.cs`), not per-endpoint.

---

## 5. Phases

Each phase ends with a **Checkpoint**. Do not start the next phase until the checkpoint
passes. If a checkpoint cannot pass, stop and report rather than working around it.

---

### Phase 0 — Repository scaffold

1. `git init`; add a `.gitignore` covering `node_modules/`, `bin/`, `obj/`, `dist/`,
   `.azure/`, `local.settings.json`, `.env`, `*.user`.
2. Create the directory tree from §1 (empty placeholder folders are fine).
3. Author `data/pantry-seed.json`: **~70 items**, each
   `{ "name": string, "category": string }`. Categories, in this order:
   `Spirits`, `Liqueurs`, `Fortified & Bitters`, `Mixers`, `Juices & Citrus`,
   `Syrups & Sweeteners`, `Garnishes`, `Fresh & Dairy`.
   Cover at minimum: gin, vodka, white/dark/spiced rum, blanco and reposado tequila,
   bourbon, rye, Scotch, brandy/cognac, mezcal, Aperol, Campari, triple sec/Cointreau,
   amaretto, coffee liqueur, Irish cream, elderflower liqueur, peach schnapps, dry and
   sweet vermouth, prosecco, Angostura and orange bitters, soda water, tonic, cola, ginger
   beer, ginger ale, lemonade, lime/lemon/orange/cranberry/pineapple/tomato juice, simple
   syrup, grenadine, agave, honey, sugar cubes, mint, basil, lime and lemon and orange
   wedges, maraschino cherries, olives, celery, cucumber, salt, pepper, egg white, cream,
   milk, coconut cream, espresso, ice.
4. Confirm `CLAUDE.md` matches what you are about to build; update it if the plan drifts.

**Checkpoint:** the tree matches §1; `data/pantry-seed.json` parses and holds ≥65 items
with no duplicate `name`.

---

### Phase 1 — Infrastructure (Bicep + azd)

1. `azure.yaml` declaring one service, `web`, of host `staticwebapp`.
2. `infra/modules/storage.bicep`: Storage account (`Standard_LRS`, minimum TLS 1.2, public
   blob access disabled) plus the seven tables from §3.
3. `infra/modules/openai.bicep`: `Microsoft.CognitiveServices/accounts` of kind `OpenAI`,
   sku `S0`, with a deployment:
   ```bicep
   model: { format: 'OpenAI', name: 'gpt-5-nano', version: '2025-08-07' }
   sku:   { name: 'GlobalStandard', capacity: 50 }
   ```
   The location must be a region where `gpt-5-nano` Global Standard exists —
   `australiaeast` is confirmed available.
4. `infra/modules/swa.bicep`: `Microsoft.Web/staticSites`, **sku `Standard`**, with a
   `config` child resource carrying the app settings in §6. Output the default hostname.
5. `infra/main.bicep` wires the modules and passes the storage key and OpenAI key into the
   SWA settings. Parameterise `location`, `namePrefix`, `sendGridApiKey` (secure),
   `sendGridFromEmail`, `jwtSigningKey` (secure).
6. Document `azd up` in `CLAUDE.md`.

> **Why keys rather than managed identity:** SWA managed functions support neither managed
> identity nor Key Vault references (verified). Mark `@secure()` on every secret parameter
> so values stay out of deployment history.

**Checkpoint:** `azd provision --preview` succeeds; after a real `azd up`, the SWA, the
storage account with seven tables, and a `gpt-5-nano` deployment all exist, and the SWA's
Configuration blade shows every setting from §6.

---

### Phase 2 — CI/CD

`.github/workflows/deploy.yml`, triggered on push to `main` and on pull requests:

1. `actions/checkout@v4`
2. Node 22 → `npm ci` → `npm run build` in `app/` (output `app/dist/app/browser`)
3. `actions/setup-dotnet@v4` with `8.0.x` →
   `dotnet publish api/Cocktail.Api.csproj -c Release -o api_publish`
4. `Azure/static-web-apps-deploy@v1` with:
   ```yaml
   app_location: "app/dist/app/browser"
   api_location: "api_publish"
   skip_app_build: true
   skip_api_build: true
   ```

> **Build the API yourself and set `skip_api_build: true`.** Letting the SWA build service
> compile a .NET isolated project is the single most common failure mode for this stack.
> Pre-publishing removes it entirely.

Store `AZURE_STATIC_WEB_APPS_API_TOKEN` as a repository secret. Add the PR-close job that
tears down preview environments.

**Checkpoint:** a push to `main` deploys successfully and the SWA serves a placeholder
page. Do not proceed until a deploy is green — debugging this later, on top of application
bugs, is much worse.

---

### Phase 3 — API foundation

1. `Cocktail.Api.csproj`: `net8.0`, with `Microsoft.Azure.Functions.Worker`,
   `Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore`, `Azure.Data.Tables`,
   `Azure.AI.OpenAI`, `SendGrid`, `System.IdentityModel.Tokens.Jwt`.
2. `Program.cs`: `FunctionsApplication.CreateBuilder`, ASP.NET Core integration, and DI
   registration of `TableStore`, `TokenService`, `MailService`, `CocktailAi`,
   `QuotaService` and `AppConfig` (strongly-typed settings, validated at startup with a
   clear message naming any missing setting; `UNLIMITED_EMAILS` is parsed here into a
   case-insensitive set).
3. `Services/TableStore.cs`: one `TableServiceClient`, lazily-created `TableClient`s, with
   `CreateIfNotExists` guarded so it runs once per table per process.
4. `GET /api/health` returning `{ status, version, tablesReachable }`.
5. A consistent error shape — `{ "error": { "code": "...", "message": "..." } }` — with the
   codes `unauthorized`, `forbidden`, `not_found`, `invalid_request`, `rate_limited`,
   `quota_exceeded`, `ai_unavailable`, `ai_timeout`, `internal`.

**Checkpoint:** `swa start` runs locally against Azurite and `/api/health` returns 200 with
`tablesReachable: true`.

---

### Phase 4 — Authentication

1. `Security/JwtService.cs` — issue and validate HS256 tokens. Claims: `sub` (userId),
   `email`, `scope` (`user` | `guest`), `owner` (guest only), `jti`, `iat`, `exp`. The key
   comes from `JWT_SIGNING_KEY` (≥32 bytes, base64).
2. `Security/CallerContext.cs` — resolves the caller from `cm_session` or `cm_guest` and
   exposes `UserId`, `IsGuest`, `RequireUser()` and `RequireAnyCaller()`. **Every endpoint
   goes through this.**
3. `POST /auth/request-link`:
   - Validate and normalise the email; reject anything containing `/ \ # ?`.
   - Look up or create the user (`Users` + `UserIndex`).
   - Generate 32 cryptographically random bytes → a base64url raw token. Store **only**
     its SHA-256 hash in `LoginTokens`, with a 15-minute expiry.
   - Send via SendGrid: `{APP_BASE_URL}/api/auth/callback?token={raw}`.
   - Rate-limit to 5 requests per email per hour and 20 per IP per hour.
   - **Always** return `202` with the same body, whatever happened.
4. `GET /auth/callback`:
   - Hash the supplied token, look it up, and reject if missing, consumed or expired —
     redirecting to `/welcome?error=link_invalid` rather than returning JSON.
   - Mark it consumed and stamp `LastLoginUtc`.
   - Set `cm_session`: `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`.
   - Set `XSRF-TOKEN`: readable (not HttpOnly), random per session.
   - `302` to `/onboarding` if `OnboardedUtc` is null, otherwise `/generate`.
5. `POST /auth/logout` clears both cookies.
6. `GET /me`.
7. **CSRF:** every mutating endpoint requires an `X-XSRF-TOKEN` header matching the
   `XSRF-TOKEN` cookie. These exact names let Angular's `HttpClient` attach the header
   automatically with no client code.
8. Opportunistic cleanup: on each `request-link` call, delete `LoginTokens` rows older than
   24 hours (there is no TTL and no timer trigger).

**Checkpoint:** request a link locally, retrieve the URL from the SendGrid sandbox or the
logs, open it, and confirm `GET /me` returns the user. Confirm that a second use of the
same link fails, and that an expired link fails.

---

### Phase 5 — Pantry API

Implement `GET/POST/PATCH/DELETE /pantry`, `POST /pantry/seed` and `POST /me/onboarded`
per §4.

- Dedupe on `NameNormalized` within the user's partition; a `POST` of an existing name
  returns `409` with the existing item.
- `seed` with `mode: "onboarding"` adds every seed item as `InStock: false`;
  `mode: "examples"` adds only items whose `NameNormalized` is absent. Neither ever
  modifies an existing row.
- Guests: `GET` only, filtered to `InStock: true`, with `ToOrder` stripped from the
  response.

**Checkpoint:** full CRUD works via `curl` with a real session cookie; a guest cookie gets
a filtered list and `403` on every write.

---

### Phase 6 — Cocktail generation

The most delicate phase. Two rules dominate: **the 45-second ceiling**, and **the model
will invent ingredients no matter what the prompt says.**

1. `Services/CocktailAi.cs`, using `Azure.AI.OpenAI` against the `gpt-5-nano` deployment.
2. **Structured outputs.** Use a strict `json_schema` response format:
   ```jsonc
   {
     "cocktails": [{
       "name": "string",
       "description": "string",          // exactly one sentence
       "ingredients": [{ "name": "string", "measure": "string" }],
       "steps": ["string"]               // numbered by position
     }]
   }
   ```
   Mark every property required, with `additionalProperties: false`.
3. **Budget.** `reasoning_effort: "low"`, `max_completion_tokens ≈ 2500`, and a
   `CancellationToken` cancelling at **40 s** so we return a clean `ai_timeout` instead of
   the SWA's opaque 45s failure. One call — no retries inside the request, because a retry
   cannot fit in the budget.
4. **Prompt.** The system message states: you are a bartender; use only the supplied
   ingredients unless told otherwise; give 3–5 cocktails; a one-sentence description;
   measurements in millilitres plus common bar units; numbered steps. The user message
   carries the owner's prompt, the strictness rule, and the pantry list (in-stock names;
   for `strictness: "any"`, out-of-stock names too, clearly labelled).
5. **Server-side enforcement — do not trust the model.** Match each returned ingredient
   against the pantry by `NameNormalized`, then:

   | `strictness` | Rule |
   |---|---|
   | `strict` | Discard any cocktail using an ingredient that is not in stock |
   | `nearly` | Allow at most **2** out-of-stock or unknown ingredients per cocktail |
   | `any` | Keep everything |

   Annotate every ingredient in the response with `inPantry` and `inStock` so the UI can
   mark them, and return `missingCount` per cocktail.
6. If fewer than 3 cocktails survive in `strict` mode, return those that did plus a
   `notice` field explaining why — never silently return one cocktail, and never retry.
7. **Daily quota — see §6a below.** Enforce it *before* calling the model, and record the
   attempt only once the call succeeds.
8. Guests are allowed here, scoped to the owner's pantry. Never persist a guest's recipes,
   prompts or results — the **only** thing a guest writes is the owner's quota row (§6a).

**Checkpoint:** all three strictness modes behave correctly, including the case where the
model returns an out-of-stock ingredient in `strict` mode — verify by temporarily loosening
the prompt so that it does. Confirm p95 latency sits comfortably under 40s.

---

### Phase 6a — Generation quota and whitelist

`Services/QuotaService.cs`. This is the only thing standing between the app and an
open-ended Azure OpenAI bill, so it is enforced server-side on every path, with no client
involvement.

**The rule.** A general user gets **10 successful generations per rolling 24 hours**.
An email on the whitelist is **unlimited**.

1. **Whose quota is it?** Resolve a single `quotaUserId` at the top of the generate
   handler:
   - a normal caller → their own `userId`
   - a guest on a share link → the **owner's** `userId` (from the `owner` JWT claim)

   Guests spend the owner's quota. Without this, generating a share link would be a
   trivial unlimited-generation bypass — anyone could mint a link and hand it around.
   Handle it here, in one place, rather than as a separate guest limit.

2. **Is the quota holder whitelisted?** `UNLIMITED_EMAILS` is a comma-separated app
   setting. Parse it once at startup into a case-insensitive `HashSet<string>` of trimmed,
   lowercased addresses on `AppConfig`. At request time, read the `Users` row for
   `quotaUserId` (a single point read by PK+RK) and test its `Email` against the set.

   > **Check the stored email, not the JWT claim.** The JWT is ours and is trustworthy, but
   > a guest's token carries the *guest's* context, not the owner's — so the owner's email
   > has to be read anyway. Using one code path for both cases removes a whole class of
   > bug. It also means whitelist edits take effect on the next request, with no session
   > invalidation and no stored flag to drift out of date.

3. **Count the window.** Range-query `RateLimit` partition `generate:{quotaUserId}` for
   rows newer than `now - 24h`, using the reverse-ticks RowKey so the query stops as soon
   as it passes the boundary. Count them.

4. **Decide.** If unlimited, proceed. Otherwise, if `count >= DAILY_GENERATION_LIMIT`
   (default `10`), return **`429`** with:
   ```json
   { "error": { "code": "quota_exceeded",
                "message": "You've used all 10 cocktail generations for today.",
                "quota": { "used": 10, "limit": 10, "unlimited": false,
                           "resetsUtc": "2026-09-05T04:12:00Z" } } }
   ```
   `resetsUtc` is when the **oldest** row in the window ages out — that is the moment one
   generation actually frees up. Add `quota_exceeded` to the error-code list from Phase 3.

5. **Record only on success.** Write the `RateLimit` row *after* the model returns a usable
   result. A failed, timed-out or empty generation must not cost the user a slot; that
   would burn quota on our own outages. Set `ViaShareId` when the caller is a guest.

6. **Report the quota.** Both `GET /me` and a successful `POST /cocktails/generate` return
   `{ used, limit, unlimited, resetsUtc }`. When `unlimited` is true, send `used` as the
   real count and `limit` as `null` — the UI needs to distinguish "unlimited" from "limit
   of zero".

7. **Rolling window, not calendar day.** A rolling 24h avoids picking a timezone for a
   product with no stated locale, and cannot be gamed by generating ten times either side
   of local midnight. If the owner would rather it reset at midnight, that is a one-line
   change to the window calculation plus a timezone decision — raise it, do not assume it.

**Checkpoint:** a non-whitelisted user is blocked on the 11th generation of a rolling day
and the message names the reset time; adding that user's email to `UNLIMITED_EMAILS` and
restarting lifts the limit without any other change; a guest link burns the *owner's*
quota and is blocked once the owner is exhausted; and a forced AI timeout leaves the count
unchanged.

---

### Phase 7 — Favourites API

`GET/POST/DELETE /favourites` per §4. `POST` accepts one cocktail object and stores
ingredients and steps as JSON strings, capped at 200 per user. Guests get `403`.

**Checkpoint:** save, list newest-first, delete.

---

### Phase 8 — Share links

1. `POST /share`: 32 random bytes → a base64url token; store the **hash** with
   `ExpiresUtc = now + 12h`. Return the full URL **once** — it can never be shown again.
2. `GET /share` lists active links with `expiresUtc` and a masked identifier.
3. `DELETE /share/{id}` sets `RevokedUtc`.
4. `POST /share/{token}/session`: validates the hash, expiry and revocation, then sets
   `cm_guest` — a JWT with `scope: "guest"`, `owner: ownerUserId`, and
   `exp = min(linkExpiry, now + 12h)`. The cookie `Max-Age` matches the JWT expiry exactly.
5. Purge expired share rows opportunistically on `GET /share`.

**Checkpoint:** a guest link permits `GET /pantry` (in-stock only) and
`POST /cocktails/generate`, and returns `403` on every write. After expiry the link is
rejected, and revocation takes effect immediately.

---

### Phase 9 — Angular scaffold and design system

1. `ng new app --standalone --style=scss --ssr=false --zoneless` (Angular 22).
   No SSR: this is a PWA on a static host.
2. `src/styles.scss` declares the tokens from **STYLE_GUIDE §2.1** on `:root`, plus the
   global reset, Playfair Display and Inter from Google Fonts, and a `body` background of
   `--bg-page`. Angular uses emulated encapsulation, so `:root` tokens inherit into every
   component — **components read tokens, they never redeclare them** (STYLE_GUIDE §8.2).
3. Build the shared primitives in `shared/ui/`, each matching the guide exactly:
   `cm-card`, `cm-button` (primary/secondary/outline/ghost/icon/destructive per §6.2),
   `cm-input`, `cm-pill`, `cm-empty-state`, `cm-spinner`, `cm-notice`.
4. **Navigation — the one documented extension to the style guide.** The guide describes a
   no-navigation single-column app (§1.3); V2 needs four destinations. Build `cm-nav`:
   - ≤600px: a fixed bottom bar, `--bg-card`, `1px solid var(--border)` top border, with
     four items (Generate · Pantry · Favourites · Share).
   - \>600px: an inline row, right-aligned in the header beneath the title.
   - Items: Inter `0.72rem`, weight 500, `0.09em` tracking, uppercase, `--text-secondary`.
   - Active: `--accent-light` text with a `1px solid var(--accent)` underline.
     *Not* 2px — the guide forbids 2px borders (§5).
   - Transition `0.15s`, colour only (§7).
   - The column keeps `max-width: 680px`; the bottom bar adds page `padding-bottom` so the
     last card clears it, replacing the existing `80px`.
5. **Update `docs/STYLE_GUIDE.md` in the same commit**: add §6.7 documenting `cm-nav`, and
   replace §8 — which describes Lit, `static styles = css`, shadow DOM and bubbling
   `CustomEvent`s — with the Angular equivalents: component-scoped `.scss`, `input()` /
   `output()` signals, and stores. Keep §§1–7 verbatim; they transfer unchanged. Leave the
   "Known inconsistencies" list, but note that the Lit fallback-value issue no longer
   applies.

**Checkpoint:** a styled shell renders with working navigation, and the style guide
describes what was actually built.

---

### Phase 10 — Auth and onboarding UI

Routes: `/welcome`, `/check-email`, `/onboarding`, `/generate`, `/pantry`, `/favourites`,
`/share`, `/s/:token`, and `**` → not-found.

1. `core/auth.store.ts` — a signal store holding `me()`, `isGuest()` and `loading()`.
2. `authGuard` (redirect to `/welcome`), `onboardingGuard` (force `/onboarding` while
   `onboarded` is false), and `guestBlockGuard` (guests may only reach `/generate`).
3. `/welcome`: a single card with an email input and a "Send me a link" primary button. On
   success → `/check-email`, with a calm confirmation that does **not** reveal whether the
   account exists.
4. `/onboarding`: calls `POST /pantry/seed { mode: "onboarding" }`, shows the ~70 items
   grouped by category with in-stock toggles, then `POST /me/onboarded` → `/generate`.
5. `provideHttpClient(withFetch(), withXsrfConfiguration({ cookieName: 'XSRF-TOKEN',
   headerName: 'X-XSRF-TOKEN' }))`. A `401` interceptor clears the store and routes to
   `/welcome`.

**Checkpoint:** the full first-run journey — email → link → onboarding → generate — works
end to end against the deployed environment.

---

### Phase 11 — Pantry UI

Per STYLE_GUIDE §6.4. Three zones per row: status pill (a button, which toggles) · name
(flex, truncating) · actions (edit, order flag, delete).

- A search box using the secondary focus treatment — border only (§6.3).
- Filter pills: All · In stock · Out of stock · To order. The active pill uses the accent.
- "Add example bar items" as a ghost link (§6.2), calling
  `POST /pantry/seed { mode: "examples" }`, then reporting how many were added.
- Inline rename using the primary focus halo.
- Optimistic updates, with rollback on failure.
- An empty state that says what to do next (§6.5).

**Checkpoint:** add, rename, toggle stock, toggle order, delete, search and all four
filters behave, and the list survives a reload.

---

### Phase 12 — Generate UI

- A card with a description/name input, a strictness selector (three options — *Only what I
  have* · *Almost everything I have* · *Anything goes*), and a primary Generate button.
- While generating: a spinner and progress affordance per §6.5. **There is no streaming** —
  the response arrives whole — so use the spinner and a progress bar, and do not build the
  blinking caret, which only makes sense for streamed text.
- Results: one card per cocktail — the name as a heading, the one-sentence description,
  ingredients with measurements (out-of-stock ones marked with the §2.3 out-of-stock
  treatment), numbered steps, and a `♡` save action.
- Surface `notice` when strict mode returned fewer than 3.
- **Quota indicator.** Show remaining generations beside the Generate button as a meta line
  (§3 typography, `0.72rem`, `--text-muted`) — "7 of 10 left today". Read it from
  `/me` on load and from each generate response. Hide the line entirely when
  `quota.unlimited` is true; a whitelisted user should never see a counter at all.
  Because `--text-muted` fails AA (§2.4), the count must not be the only warning — at zero,
  disable the Generate button (§6.2: prefer disabling to hiding) and show the reset time
  in a `cm-notice`.
- Handle `ai_timeout`, `ai_unavailable`, `rate_limited` and `quota_exceeded` with distinct,
  plain-language notices (§6.5) — never a raw error code. `quota_exceeded` is the one a
  real user will actually hit, so it gets the clearest copy: what the limit is, and when
  it resets. In guest mode it must say the *owner's* daily limit is spent, not the guest's.

**Checkpoint:** all three strictness modes render correctly, including a strict run that
returns two cocktails plus a notice.

---

### Phase 13 — Favourites, sharing, guest mode

1. `/favourites`: list newest-first, expand to the full recipe, remove. Empty state.
2. `/share`: "Create share link" shows the URL **once** with a copy button and a clear
   "expires in 12 hours" line, then lists active links with countdowns and a revoke action.
   Copying uses the Clipboard API with a text-selection fallback.
3. `/s/:token`: calls `POST /share/{token}/session`, then routes to `/generate` in guest
   mode. Guest mode shows a persistent amber notice (§2.3 warning treatment) explaining
   whose bar this is and that nothing can be saved; `cm-nav` collapses to Generate only.
   An invalid or expired token gets its own explanatory page, not a generic error.

**Checkpoint:** a link opened in a private window generates cocktails from the owner's
stock, shows no write affordances anywhere, and stops working after revocation.

---

### Phase 14 — PWA

1. `ng add @angular/pwa`.
2. `manifest.webmanifest`: name "Cocktail Momentum", `theme_color` `#c8922a`,
   `background_color` `#0d0d0d`, `display: standalone`, icons at 192 and 512 plus maskable.
   **STYLE_GUIDE §2.1 requires these to match the tokens — change one, change all four.**
3. `ngsw-config.json`: prefetch the app shell, lazy-cache the Google Fonts, and
   **never cache `/api/*`**.
4. `staticwebapp.config.json`:
   ```jsonc
   {
     "platform": { "apiRuntime": "dotnet-isolated:8.0" },
     "navigationFallback": {
       "rewrite": "/index.html",
       "exclude": ["/api/*", "*.{css,js,json,webmanifest,png,svg,ico}"]
     },
     "globalHeaders": {
       "X-Content-Type-Options": "nosniff",
       "X-Frame-Options": "DENY",
       "Referrer-Policy": "strict-origin-when-cross-origin"
     },
     "routes": [{ "route": "/ngsw.json", "headers": { "Cache-Control": "no-cache" } }]
   }
   ```
5. An install prompt styled as the outline button from §6.2, shown only when
   `beforeinstallprompt` fires.

**Checkpoint:** Lighthouse rates the app installable; it launches standalone; and reloading
offline serves the shell and shows a clear offline notice rather than failing silently.

---

### Phase 15 — Hardening and handover

1. **`prefers-reduced-motion`** — STYLE_GUIDE §7 says to add this once anything joins the
   spinner. Add it now, disabling the loops.
2. Accessibility: real `<label>`s on every input, `aria-live` on generate results and
   errors, visible focus everywhere, and a check that no information is carried only by
   `--text-muted` (§2.4 — it fails AA).
3. Enable Application Insights on the SWA (the only way to get managed-function logs) and
   confirm that no secret or raw token is ever logged.
4. Security sweep: cookie flags, CSRF on every mutating route, guest `403`s, no user
   enumeration on `/auth/request-link`, rate limits active, and the daily quota enforced on
   both the direct and the share-link path.
5. `README.md`: local development (`swa start` plus Azurite), `azd up`, the app-settings
   table from §6, and the .NET 8 end-of-support note with the migration options from §0.
6. Record in `CLAUDE.md` exactly where tests belong when they are eventually written —
   token issue/verify, share expiry, strictness enforcement, pantry dedupe.

**Checkpoint:** deployed, installable, and every flow works against production.

---

## 6. Application settings

Written by Bicep into the SWA. None collide with a reserved prefix (§2.4).

| Setting | Source | Notes |
|---|---|---|
| `STORAGE_CONNECTION_STRING` | Bicep, from the storage account key | |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Bicep, from a workspace-based App Insights component (`modules/monitoring.bicep`) | Read directly by the App Insights SDK, not `AppConfig` — absent locally is a no-op, not a startup failure. Phase 15. |
| `AZURE_OPENAI_ENDPOINT` | Bicep, from the Cognitive Services account | |
| `AZURE_OPENAI_KEY` | Bicep, `listKeys()` | No managed identity available |
| `AZURE_OPENAI_DEPLOYMENT` | Bicep | `gpt-5-nano` |
| `SENDGRID_API_KEY` | `@secure()` parameter | Never committed |
| `SENDGRID_FROM_EMAIL` | parameter | Must be a verified sender |
| `SENDGRID_FROM_NAME` | parameter | `Cocktail Momentum` |
| `JWT_SIGNING_KEY` | `@secure()` parameter | ≥32 random bytes, base64 |
| `APP_BASE_URL` | Bicep output or custom domain | Builds magic-link URLs |
| `MAGIC_LINK_TTL_MINUTES` | parameter | `15` |
| `SESSION_TTL_DAYS` | parameter | `30` |
| `SHARE_LINK_TTL_HOURS` | parameter | `12` |
| `DAILY_GENERATION_LIMIT` | parameter | `10` — generations per rolling 24h |
| `UNLIMITED_EMAILS` | parameter | Comma-separated whitelist, lowercased. May be empty. |

> `UNLIMITED_EMAILS` is the one setting that will be edited routinely. It lives in SWA
> Configuration, so a change needs no redeploy — but the app parses it at startup, so the
> functions host must restart before it takes effect. Note that in the README.

Validate all of these at startup (Phase 3) and fail loudly, naming the missing setting —
except `APPLICATIONINSIGHTS_CONNECTION_STRING`, which bypasses `AppConfig` entirely (see
above).

---

## 7. Known risks

| Risk | Mitigation |
|---|---|
| .NET 8 leaves support in Nov 2026; SWA has no .NET 10 | Runtime-specific code confined; documented escape to `node:22` or bring-your-own Functions |
| 45s request ceiling on generation | 40s cancellation, low reasoning effort, capped output tokens, a single attempt |
| The model invents ingredients | Server-side pantry matching and filtering (Phase 6.5) — never trust the model |
| Secrets are plain app settings | Unavoidable on managed functions; `@secure()` parameters, rotated via `azd` |
| No timer triggers for cleanup | Opportunistic purges on read paths |
| Share links are bearer tokens | 12h expiry, hashes at rest, revocation, rate limits, read-only scope |
| Share links used to dodge the AI quota | Guest generations are charged to the **owner's** quota (Phase 6a.1) |
| Unbounded Azure OpenAI spend | 10 generations per user per 24h, enforced server-side before the model call; whitelist is an explicit, deliberate exception |
| Quota check is read-then-write, not atomic | Two concurrent requests can both pass on the last slot. Accepted: the overrun is one generation, and Table Storage has no cheap atomic counter. Do **not** add locking. |
| Table Storage has no secondary indexes | `UserIndex` maintained by hand; share listing scans one small partition |
