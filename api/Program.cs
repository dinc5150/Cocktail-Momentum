using Cocktail.Api.Security;
using Cocktail.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = FunctionsApplication.CreateBuilder(args);

// ASP.NET Core integration: HTTP-triggered functions use HttpRequest / IActionResult
// instead of HttpRequestData / HttpResponseData.
builder.ConfigureFunctionsWebApplication();

// Both calls are required — ConfigureFunctionsApplicationInsights() alone throws
// OptionsValidationException at startup ("Application Insights SDK has not been added"),
// caught by actually running the Functions host locally, not by `dotnet build` (which
// doesn't exercise DI option validation). See CLAUDE.md and
// docs/IMPLEMENTATION_PLAN.md Phase 3.
builder.Services.AddApplicationInsightsTelemetryWorkerService();
builder.Services.ConfigureFunctionsApplicationInsights();

// AppConfig is read once from environment variables and validated here, at startup, so
// a missing setting fails loudly on cold start rather than on the first request that
// happens to need it. Never call Environment.GetEnvironmentVariable from a function body
// — inject AppConfig instead. See CLAUDE.md "API (C#)" conventions.
builder.Services.AddSingleton(_ => AppConfig.FromEnvironment());
builder.Services.AddSingleton<TableStore>();

// Phase 4 — auth. CallerContext is scoped: it holds per-request state set once by
// Resolve(), so it must not be a singleton (that would leak one request's caller into
// another's) and must not be transient (every service in one request needs the same
// instance). See Security/CallerContext.cs.
builder.Services.AddSingleton<JwtService>();
builder.Services.AddScoped<CallerContext>();
builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<TokenService>();
builder.Services.AddSingleton<MailService>();
builder.Services.AddSingleton<RateLimitStore>();

// Phase 5 — pantry. PantrySeedCatalog reads the embedded seed JSON once; safe as a
// singleton since it never changes at runtime.
builder.Services.AddSingleton<PantryService>();
builder.Services.AddSingleton<PantrySeedCatalog>();

// Phase 6 / 6a — generation + quota.
builder.Services.AddSingleton<CocktailAi>();
builder.Services.AddSingleton<QuotaService>();

// Phase 7 — favourites.
builder.Services.AddSingleton<FavouriteService>();

// Phase 8 — share links. This completes the API surface from
// docs/IMPLEMENTATION_PLAN.md §4.
builder.Services.AddSingleton<ShareLinkService>();

builder.Build().Run();
