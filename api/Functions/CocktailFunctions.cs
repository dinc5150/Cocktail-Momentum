using System.Text.Json;
using Cocktail.Api.Models;
using Cocktail.Api.Security;
using Cocktail.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace Cocktail.Api.Functions;

public sealed class CocktailFunctions(
    CallerContext caller,
    PantryService pantry,
    CocktailAi ai,
    QuotaService quota,
    ILogger<CocktailFunctions> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private static readonly HashSet<string> ValidStrictness = ["strict", "nearly", "any"];

    [Function("CocktailsGenerate")]
    public async Task<IActionResult> Generate(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "cocktails/generate")] HttpRequest req,
        CancellationToken ct)
    {
        caller.Resolve(req);
        var authError = caller.RequireAnyCaller();
        if (authError is not null) return authError;

        // A signed-in user still goes through the normal mutating-route CSRF contract.
        // Guests never carry an XSRF-TOKEN cookie (they never onboard or log in) and
        // nothing is persisted on their behalf, so there is nothing for CSRF to protect
        // here — the quota charge lands on the owner's account regardless of this check.
        if (!caller.IsGuest && !CookieWriter.ValidateXsrf(req))
        {
            return ApiResults.Forbidden("Missing or invalid CSRF token.");
        }

        var body = await JsonSerializer.DeserializeAsync<GenerateCocktailsRequest>(req.Body, JsonOptions, ct);
        var prompt = body?.Prompt?.Trim();
        var strictness = body?.Strictness?.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(prompt))
        {
            return ApiResults.InvalidRequest("prompt is required.");
        }
        if (strictness is null || !ValidStrictness.Contains(strictness))
        {
            return ApiResults.InvalidRequest("strictness must be \"strict\", \"nearly\", or \"any\".");
        }

        // The pantry read, the quota charged, and the ingredients matched against are all
        // the OWNER's — for a guest this is OwnerUserId, never the guest's own identity.
        // See Security/CallerContext.cs.
        var quotaUserId = caller.QuotaUserId!;

        var quotaStatus = await quota.CheckAsync(quotaUserId, ct);
        if (!quotaStatus.Allowed)
        {
            var resetText = quotaStatus.ResetsUtc is { } resets ? $" It resets at {resets:HH:mm} UTC." : string.Empty;
            var whoseLimit = caller.IsGuest ? "This bar's" : "Your";
            return ApiResults.QuotaExceeded(
                $"{whoseLimit} daily limit of {quotaStatus.Limit} cocktail generations has been used.{resetText}");
        }

        var pantryItems = await pantry.ListAsync(quotaUserId, ct);
        var inStockNames = pantryItems.Where(p => p.InStock).Select(p => p.Name).ToList();
        var outOfStockNames = pantryItems.Where(p => !p.InStock).Select(p => p.Name).ToList();

        RawCocktailSuggestions raw;
        try
        {
            raw = await ai.GenerateAsync(prompt, strictness, inStockNames, outOfStockNames, ct);
        }
        catch (CocktailAiTimeoutException)
        {
            return ApiResults.AiTimeout();
        }
        catch (CocktailAiUnavailableException ex)
        {
            logger.LogError(ex, "Cocktail generation failed");
            return ApiResults.AiUnavailable();
        }

        var result = CocktailFilter.Apply(raw, pantryItems, strictness);

        // Charged only now that the call actually produced a usable result — see
        // CLAUDE.md "AI". Reported optimistically as +1 rather than re-querying.
        await quota.RecordSuccessAsync(quotaUserId, caller.IsGuest ? caller.ShareLinkId : null, ct);

        return new OkObjectResult(new
        {
            cocktails = result.Cocktails,
            notice = result.Notice,
            quota = new
            {
                used = quotaStatus.Unlimited ? 0 : quotaStatus.Used + 1,
                limit = quotaStatus.Limit,
                unlimited = quotaStatus.Unlimited,
                resetsUtc = quotaStatus.ResetsUtc
            }
        });
    }
}
