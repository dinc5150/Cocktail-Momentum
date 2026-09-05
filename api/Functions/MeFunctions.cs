using Cocktail.Api.Models;
using Cocktail.Api.Security;
using Cocktail.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;

namespace Cocktail.Api.Functions;

/// <summary>
/// GET /me and POST /me/onboarded. Built here in Phase 4 rather than Phase 5 as first
/// drafted — both are session/identity concerns that need only CallerContext, which
/// exists as of this phase; Phase 5 wires pantry seeding to call /me/onboarded rather
/// than re-implementing it. See docs/IMPLEMENTATION_PLAN.md Phase 5.
/// </summary>
public sealed class MeFunctions(CallerContext caller, UserService users, QuotaService quota)
{
    [Function("Me")]
    public async Task<IActionResult> Get(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "me")] HttpRequest req,
        CancellationToken ct)
    {
        caller.Resolve(req);
        var authError = caller.RequireAnyCaller();
        if (authError is not null) return authError;

        // QuotaUserId is the OWNER for a guest, never the guest's own identity — a guest
        // sees the bar's real remaining count, not an unrelated number. See
        // Security/CallerContext.cs and docs/IMPLEMENTATION_PLAN.md Phase 6a.1.
        var quotaStatus = await quota.CheckAsync(caller.QuotaUserId!, ct);
        var quotaBody = new
        {
            used = quotaStatus.Used,
            limit = quotaStatus.Limit,
            unlimited = quotaStatus.Unlimited,
            resetsUtc = quotaStatus.ResetsUtc
        };

        if (caller.IsGuest)
        {
            var owner = await users.GetByIdAsync(caller.OwnerUserId!, ct);
            return new OkObjectResult(new
            {
                userId = caller.UserId,
                email = (string?)null,
                onboarded = true,
                isGuest = true,
                ownerLabel = owner is not null ? Mask(owner.Email) : "this bar",
                quota = quotaBody
            });
        }

        var user = await users.GetByIdAsync(caller.UserId!, ct);
        if (user is null) return ApiResults.Unauthorized();

        return new OkObjectResult(new
        {
            userId = user.RowKey,
            email = user.Email,
            onboarded = user.OnboardedUtc is not null,
            isGuest = false,
            ownerLabel = (string?)null,
            quota = quotaBody
        });
    }

    [Function("MeOnboarded")]
    public async Task<IActionResult> MarkOnboarded(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "me/onboarded")] HttpRequest req,
        CancellationToken ct)
    {
        caller.Resolve(req);
        var authError = caller.RequireUser();
        if (authError is not null) return authError;

        if (!CookieWriter.ValidateXsrf(req))
        {
            return ApiResults.Forbidden("Missing or invalid CSRF token.");
        }

        var user = await users.GetByIdAsync(caller.UserId!, ct);
        if (user is null) return ApiResults.Unauthorized();

        await users.MarkOnboardedAsync(user, ct);
        return new OkObjectResult(new { onboarded = true });
    }

    /// <summary>"d•••@example.com" — enough for a guest to recognise whose bar this is
    /// without the full address sitting in a screen share.</summary>
    private static string Mask(string email)
    {
        var at = email.IndexOf('@');
        if (at <= 1) return "•••" + email[at..];
        return email[..1] + "•••" + email[at..];
    }
}
