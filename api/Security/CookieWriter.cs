using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http;

namespace Cocktail.Api.Security;

public static class CookieNames
{
    public const string Session = "cm_session";
    public const string Guest = "cm_guest";

    // Exact names chosen so Angular's HttpClient attaches the CSRF header for free — do
    // not rename. See CLAUDE.md "Security".
    public const string Xsrf = "XSRF-TOKEN";
    public const string XsrfHeader = "X-XSRF-TOKEN";
}

/// <summary>Sets and clears the session/guest/CSRF cookies, and validates CSRF on mutating requests.</summary>
public static class CookieWriter
{
    private static CookieOptions Options(bool httpOnly, DateTimeOffset expires) => new()
    {
        HttpOnly = httpOnly,
        Secure = true,
        SameSite = SameSiteMode.Lax,
        Path = "/",
        Expires = expires
    };

    public static void SetSession(HttpResponse response, string token, DateTime expiresUtc) =>
        response.Cookies.Append(CookieNames.Session, token, Options(httpOnly: true, expiresUtc));

    public static void SetGuest(HttpResponse response, string token, DateTime expiresUtc) =>
        response.Cookies.Append(CookieNames.Guest, token, Options(httpOnly: true, expiresUtc));

    /// <summary>Not HttpOnly — Angular's HttpClient reads this cookie to set the CSRF header.</summary>
    public static void SetXsrf(HttpResponse response, DateTime expiresUtc)
    {
        var value = Convert.ToBase64String(RandomNumberGenerator.GetBytes(24))
            .Replace('+', '-').Replace('/', '_').TrimEnd('=');
        response.Cookies.Append(CookieNames.Xsrf, value, Options(httpOnly: false, expiresUtc));
    }

    public static void ClearAll(HttpResponse response)
    {
        var expired = DateTimeOffset.UnixEpoch;
        response.Cookies.Append(CookieNames.Session, "", Options(httpOnly: true, expired));
        response.Cookies.Append(CookieNames.Guest, "", Options(httpOnly: true, expired));
        response.Cookies.Append(CookieNames.Xsrf, "", Options(httpOnly: false, expired));
    }

    /// <summary>
    /// Every mutating endpoint calls this. True only if the X-XSRF-TOKEN header matches
    /// the XSRF-TOKEN cookie exactly — an attacker's cross-site form post can send the
    /// cookie automatically but cannot read it to set the matching header.
    /// </summary>
    public static bool ValidateXsrf(HttpRequest request)
    {
        if (!request.Cookies.TryGetValue(CookieNames.Xsrf, out var cookieValue) || string.IsNullOrEmpty(cookieValue))
        {
            return false;
        }

        if (!request.Headers.TryGetValue(CookieNames.XsrfHeader, out var headerValues))
        {
            return false;
        }

        var headerValue = headerValues.ToString();
        if (string.IsNullOrEmpty(headerValue))
        {
            return false;
        }

        // FixedTimeEquals returns false (not an exception) for mismatched lengths, so this
        // is safe without a length pre-check.
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(cookieValue),
            Encoding.UTF8.GetBytes(headerValue));
    }
}
