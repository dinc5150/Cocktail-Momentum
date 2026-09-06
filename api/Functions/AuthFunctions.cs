using System.Text.Json;
using Cocktail.Api.Models;
using Cocktail.Api.Security;
using Cocktail.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace Cocktail.Api.Functions;

public sealed class AuthFunctions(
    UserService users,
    TokenService tokens,
    MailService mail,
    JwtService jwt,
    RateLimitStore rateLimits,
    AppConfig config,
    ILogger<AuthFunctions> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    // The response is identical on every path through this function — malformed email,
    // rate-limited, brand-new account, existing account, or an internal failure. That is
    // deliberate: request-link must never reveal whether an address has an account. See
    // CLAUDE.md "Security".
    private static readonly ObjectResult GenericAccepted =
        ApiResults.Accepted(new { message = "If that address has an account, a sign-in link is on its way." });

    [Function("AuthRequestLink")]
    public async Task<IActionResult> RequestLink(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/request-link")] HttpRequest req,
        CancellationToken ct)
    {
        try
        {
            var body = await JsonSerializer.DeserializeAsync<RequestLinkRequest>(req.Body, JsonOptions, ct);
            var email = body?.Email?.Trim() ?? string.Empty;

            if (!UserService.IsValidEmail(email))
            {
                return GenericAccepted;
            }

            var normalized = UserService.NormalizeEmail(email);
            var clientIp = req.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            var byEmail = await rateLimits.CountSinceAsync($"login:{normalized}", TimeSpan.FromHours(1), ct);
            var byIp = await rateLimits.CountSinceAsync($"login:{clientIp}", TimeSpan.FromHours(1), ct);
            if (byEmail >= 5 || byIp >= 20)
            {
                logger.LogWarning("Login rate limit hit (ip={Ip})", clientIp);
                return GenericAccepted;
            }

            var user = await users.GetOrCreateByEmailAsync(normalized, ct);
            var rawToken = await tokens.IssueMagicLinkAsync(user.RowKey, clientIp, ct);
            var link = $"{config.AppBaseUrl}/api/auth/callback?token={rawToken}";

            await mail.SendMagicLinkAsync(user.Email, link, ct);

            // Recorded only after a successful send — same "don't charge the user for our
            // own failures" principle as the AI quota (CLAUDE.md "AI"). Confirmed by
            // actually running this against Azurite with an invalid SendGrid key: the send
            // throws, the outer catch below still returns 202, and — correctly — no
            // RateLimit row is written, so a real SendGrid outage never eats into a user's
            // legitimate rate-limit budget.
            await rateLimits.RecordAsync($"login:{normalized}", ct: ct);
            await rateLimits.RecordAsync($"login:{clientIp}", ct: ct);
            await tokens.PurgeExpiredAsync(ct);
        }
        catch (Exception ex)
        {
            // Never let a failure change the response — see CLAUDE.md "Security".
            logger.LogError(ex, "auth/request-link failed");
        }

        return GenericAccepted;
    }

    // wantsJson lets the installed PWA consume this same endpoint via fetch instead of a
    // full-page navigation: a magic link opened by a mail app almost never lands in an
    // installed PWA window (Android/Windows link capturing is unreliable, and an
    // iOS "Add to Home Screen" app doesn't share cookie storage with Safari at all), so
    // the app offers a paste-the-link fallback (see CheckEmail) that hits this route with
    // Accept: application/json and applies the same Set-Cookie itself. A real browser
    // navigation never sends that Accept value, so the redirect path is untouched.
    [Function("AuthCallback")]
    public async Task<IActionResult> Callback(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "auth/callback")] HttpRequest req,
        CancellationToken ct)
    {
        var wantsJson = req.Headers.TryGetValue("Accept", out var accept) &&
            accept.ToString().Contains("application/json", StringComparison.OrdinalIgnoreCase);

        const string invalidMessage = "That link has expired or was already used — request a new one.";

        var rawToken = req.Query["token"].ToString();
        if (string.IsNullOrEmpty(rawToken))
        {
            return wantsJson
                ? ApiResults.InvalidRequest(invalidMessage)
                : new RedirectResult("/welcome?error=link_invalid");
        }

        var userId = await tokens.ConsumeMagicLinkAsync(rawToken, ct);
        var user = userId is null ? null : await users.GetByIdAsync(userId, ct);
        if (user is null)
        {
            return wantsJson
                ? ApiResults.InvalidRequest(invalidMessage)
                : new RedirectResult("/welcome?error=link_invalid");
        }

        await users.MarkLoginAsync(user, ct);

        var (sessionToken, expiresUtc) = jwt.IssueUserSession(user.RowKey, user.Email);
        CookieWriter.SetSession(req.HttpContext.Response, sessionToken, expiresUtc);
        CookieWriter.SetXsrf(req.HttpContext.Response, expiresUtc);

        var destination = user.OnboardedUtc is null ? "/onboarding" : "/generate";
        return wantsJson ? new OkObjectResult(new { destination }) : new RedirectResult(destination);
    }

    // No CSRF check here — logout has no consequence worth defending against (worst case
    // a forced logout, not a state change that matters), and exempting it means a session
    // that outlives its XSRF-TOKEN cookie (e.g. cleared by the browser) can still log out.
    [Function("AuthLogout")]
    public IActionResult Logout(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/logout")] HttpRequest req)
    {
        CookieWriter.ClearAll(req.HttpContext.Response);
        return new OkResult();
    }
}
