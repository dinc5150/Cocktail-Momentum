using Cocktail.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace Cocktail.Api.Functions;

public sealed class HealthFunctions(TableStore tableStore, ILogger<HealthFunctions> logger)
{
    // AuthorizationLevel.Anonymous is correct for every function in this app: SWA's own
    // edge is what the public reaches (only /api/* is exposed, per the fixed route
    // prefix), and our own CallerContext/JWT layer — not the Functions host — is what
    // actually authorises a request. See CLAUDE.md "Hard platform constraints".
    [Function("Health")]
    public async Task<IActionResult> Health(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "health")] HttpRequest req,
        CancellationToken ct)
    {
        var tablesReachable = await tableStore.PingAsync(ct);
        if (!tablesReachable)
        {
            logger.LogWarning("Health check: Table Storage unreachable.");
        }

        return new OkObjectResult(new
        {
            status = tablesReachable ? "ok" : "degraded",
            version = typeof(HealthFunctions).Assembly.GetName().Version?.ToString() ?? "dev",
            tablesReachable
        });
    }
}
