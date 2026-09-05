# Cocktail Momentum

An AI cocktail generator. A user logs in with an emailed magic link, keeps a pantry of
ingredients, and asks `gpt-5-nano` for 3–5 cocktails constrained by what they actually
have. They can favourite recipes and share a 12-hour, read-only link that lets someone
else generate against their bar.

See [CLAUDE.md](CLAUDE.md) for conventions and hard platform constraints, and
[docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) for the full architecture and
build history.

## Stack

| | |
|---|---|
| Host | Azure Static Web Apps, Standard plan, managed functions |
| API | C# Azure Functions v4, isolated worker, `dotnet-isolated:8.0`, in `api/` |
| Front end | Angular 22, standalone + signals, zoneless, in `app/` |
| Data | Azure Table Storage — 7 tables |
| AI | Azure OpenAI `gpt-5-nano`, Global Standard |
| Email | SendGrid |
| Infra | Bicep in `infra/`, provisioned with `azd` |

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 22](https://nodejs.org/) and npm
- [Azure Functions Core Tools v4](https://learn.microsoft.com/azure/azure-functions/functions-run-local) (`func`)
- [Azurite](https://learn.microsoft.com/azure/storage/common/storage-use-azurite) — the local Table Storage emulator
- [Azure Static Web Apps CLI](https://azure.github.io/static-web-apps-cli/) (`swa`)
- [Azure Developer CLI](https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd) (`azd`) — only needed for provisioning/deployment, not local dev

Install the CLIs globally:

```bash
npm install -g azurite azure-functions-core-tools@4 @azure/static-web-apps-cli
```

## Running locally

Everything is driven through the SWA CLI proxy on **port 4280** — this is not optional.
The proxy is what wires up the `/api` route prefix and the auth cookies the way
production does; hitting the Angular dev server directly on `:4200` will not have a
working `/api`.

### 1. First-time setup

```bash
cd app && npm install
cd ../api && dotnet restore
cp local.settings.json.example local.settings.json
```

Edit `api/local.settings.json` and fill in:

- `JWT_SIGNING_KEY` — any random base64 string, e.g. `openssl rand -base64 32`
- `AZURE_OPENAI_ENDPOINT` / `AZURE_OPENAI_KEY` / `AZURE_OPENAI_DEPLOYMENT` — only required
  to actually exercise generation; the rest of the app runs fine without a real key, and
  a bad/unreachable endpoint fails cleanly with `ai_unavailable`.
- `SENDGRID_API_KEY` / `SENDGRID_FROM_EMAIL` — only required to actually receive magic-link
  emails. Without a real key, the request-link flow still returns `202` and issues a token
  row, it just won't send an email — see "Testing auth without SendGrid" below.

`local.settings.json` is gitignored and never committed — it holds real secrets.

### 2. Start three things, in order, in three terminals

`swa start` does **not** launch the Angular dev server for you when you point it at a URL
— it just polls that port and fails fast if nothing answers. Start the dev server first.
`--api-location api` tells `swa start` to launch the Functions host for the API itself —
do **not** also run `func start` separately, it'll just fight `swa start` over port 7071.

```bash
# Terminal 1 — Table Storage emulator, from the repo root
azurite --silent --location .azurite

# Terminal 2 — the Angular dev server, from app/
npm start

# Terminal 3 — the SWA proxy, from the repo root (start this only once :4200 is up;
# it starts the API for you)
swa start http://localhost:4200 --api-location api
```

Open **http://localhost:4280** — not `:4200`, not `:7071`.

### 3. Everyday loop

Once the three processes above are running, editing `app/src/**` hot-reloads through
Angular's dev server, and editing `api/**` hot-reloads through the Functions host
`swa start` launched for you. Azurite never needs restarting for ordinary code changes;
the API does after changing `local.settings.json` — stop and restart `swa start` (app
settings are read once at startup, see CLAUDE.md).

### Testing auth without SendGrid

Without a real SendGrid key, `POST /api/auth/request-link` still returns `202` and writes
a row to the `LoginTokens` table in Azurite — it just can't send the email. To redeem a
link locally, read the token's hash out of Azurite directly (e.g. with
[Azure Storage Explorer](https://azure.microsoft.com/features/storage-explorer/) pointed
at the Azurite emulator, or the `@azure/data-tables` SDK) and hit
`GET /api/auth/callback?token=<raw-value>` — but note the table only stores the SHA-256
hash of the token, never the raw value, so you'll need to insert a test row yourself with
a known raw token and its hash rather than reading a real one back out.

## Build

```bash
cd app && npm run build                              # → app/dist/app/browser
dotnet publish api/Cocktail.Api.csproj -c Release -o api_publish
```

## Deployment

Provisioning and application deployment are separate, deliberately:

- **Infrastructure** (`infra/`) is provisioned with `azd`.
- **Application code** deploys via GitHub Actions (`.github/workflows/deploy.yml`), which
  builds the Angular app and publishes the .NET API itself, then hands both to
  `Azure/static-web-apps-deploy@v1` with `skip_api_build: true`. Letting the SWA build
  service compile a .NET isolated project itself is the most common failure mode for this
  stack — don't remove that flag.

First-time infrastructure setup:

```bash
azd env new <environment-name>
azd env set SENDGRID_API_KEY <key>
azd env set SENDGRID_FROM_EMAIL <verified-sender@example.com>
azd env set JWT_SIGNING_KEY $(openssl rand -base64 32)
azd env set UNLIMITED_EMAILS "you@example.com"   # optional, comma-separated, can be empty

azd provision --preview   # what-if
azd up                    # provision + deploy the front end
                           # (the managed API deploys via GitHub Actions, not azd)
```

## Application settings

Written into the SWA by Bicep; `api/local.settings.json` mirrors them for local work.

| Setting | Notes |
|---|---|
| `STORAGE_CONNECTION_STRING` | Table Storage connection string |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Optional locally — absent is a silent no-op, not a startup failure |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI resource endpoint |
| `AZURE_OPENAI_KEY` | Azure OpenAI key — no managed identity on managed functions |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-5-nano` |
| `SENDGRID_API_KEY` | Never committed |
| `SENDGRID_FROM_EMAIL` | Must be a verified sender |
| `SENDGRID_FROM_NAME` | `Cocktail Momentum` |
| `JWT_SIGNING_KEY` | ≥32 random bytes, base64 |
| `APP_BASE_URL` | Used to build magic-link URLs |
| `MAGIC_LINK_TTL_MINUTES` | `15` |
| `SESSION_TTL_DAYS` | `30` |
| `SHARE_LINK_TTL_HOURS` | `12` |
| `DAILY_GENERATION_LIMIT` | `10` — generations per rolling 24h |
| `UNLIMITED_EMAILS` | Comma-separated whitelist, lowercased. May be empty. |

`UNLIMITED_EMAILS` is the one setting edited routinely in production. Editing it in SWA
Configuration needs no redeploy, but the app parses it at startup, so the functions host
must restart before the change takes effect.

## .NET 8 end-of-support note

.NET 8 LTS ends **November 2026**, and Azure Static Web Apps' managed functions support at
most `dotnet-isolated:9.0` — there is no published .NET 10 timeline for the SWA managed
host. Runtime-specific code in `api/` is kept confined so that, if support lags, moving to
`node:22` or a bring-your-own-Functions host (which does support newer runtimes) stays a
contained migration rather than a rewrite. See CLAUDE.md's platform-constraints section
and IMPLEMENTATION_PLAN §7 for the full reasoning.

## Testing

No automated tests exist yet — a deliberate decision by the project owner. See CLAUDE.md's
Testing section for the priority-ordered list of what to cover first when they're added.
