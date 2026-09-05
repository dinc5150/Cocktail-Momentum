using System.Text.Json;
using Cocktail.Api.Models;
using Cocktail.Api.Security;
using Cocktail.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;

namespace Cocktail.Api.Functions;

public sealed class ShareLinkFunctions(CallerContext caller, ShareLinkService shareLinks, JwtService jwt, AppConfig config)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    [Function("ShareList")]
    public async Task<IActionResult> List(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "share")] HttpRequest req,
        CancellationToken ct)
    {
        caller.Resolve(req);
        var authError = caller.RequireUser();
        if (authError is not null) return authError;

        // There is no timer trigger on managed functions (CLAUDE.md "Hard platform
        // constraints") — this is where expired links actually get cleaned up.
        await shareLinks.PurgeExpiredAsync(ct);

        var links = await shareLinks.ListActiveAsync(caller.UserId!, ct);
        return new OkObjectResult(links.Select(ShareLinkResponse.From));
    }

    [Function("ShareCreate")]
    public async Task<IActionResult> Create(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "share")] HttpRequest req,
        CancellationToken ct)
    {
        caller.Resolve(req);
        var authError = caller.RequireUser();
        if (authError is not null) return authError;
        if (!CookieWriter.ValidateXsrf(req)) return ApiResults.Forbidden("Missing or invalid CSRF token.");

        var body = await JsonSerializer.DeserializeAsync<CreateShareLinkRequest>(req.Body, JsonOptions, ct);
        var (rawToken, entity) = await shareLinks.CreateAsync(caller.UserId!, body?.Label?.Trim(), ct);

        // The raw token is returned exactly once, here — it is never stored (only its
        // hash is) and this response is the only place it will ever appear again.
        var url = $"{config.AppBaseUrl}/s/{rawToken}";
        return new ObjectResult(new CreatedShareLinkResponse(url, entity.ExpiresUtc))
        {
            StatusCode = StatusCodes.Status201Created
        };
    }

    [Function("ShareRevoke")]
    public async Task<IActionResult> Revoke(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "share/{id}")] HttpRequest req,
        string id,
        CancellationToken ct)
    {
        caller.Resolve(req);
        var authError = caller.RequireUser();
        if (authError is not null) return authError;
        if (!CookieWriter.ValidateXsrf(req)) return ApiResults.Forbidden("Missing or invalid CSRF token.");

        await shareLinks.RevokeAsync(caller.UserId!, id, ct);
        return new NoContentResult();
    }

    /// <summary>
    /// Anonymous — this IS the login step for a guest. Validates the raw token from the
    /// URL path, and on success sets a guest session cookie scoped to the owner, expiring
    /// with the link (never later than SHARE_LINK_TTL_HOURS from now regardless of when
    /// the link was created). See docs/IMPLEMENTATION_PLAN.md Phase 8.
    /// </summary>
    [Function("ShareSession")]
    public async Task<IActionResult> CreateGuestSession(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "share/{token}/session")] HttpRequest req,
        string token,
        CancellationToken ct)
    {
        var redeemed = await shareLinks.RedeemAsync(token, ct);
        if (redeemed is null)
        {
            return ApiResults.NotFound("This link is invalid, expired, or has been revoked.");
        }

        var (ownerUserId, shareLinkId, expiresUtc) = redeemed.Value;
        var guestToken = jwt.IssueGuestSession(ownerUserId, shareLinkId, expiresUtc);
        CookieWriter.SetGuest(req.HttpContext.Response, guestToken, expiresUtc);

        return new OkObjectResult(new { ok = true, expiresUtc });
    }
}
