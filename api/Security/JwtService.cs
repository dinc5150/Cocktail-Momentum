using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Cocktail.Api.Services;
using Microsoft.IdentityModel.Tokens;

namespace Cocktail.Api.Security;

/// <summary>
/// Issues and validates the two kinds of session JWT: a full user session (cm_session
/// cookie) and a scoped guest session (cm_guest cookie, minted from a share link). See
/// docs/IMPLEMENTATION_PLAN.md Phase 4 and Phase 8.
/// </summary>
public sealed class JwtService
{
    public const string ScopeUser = "user";
    public const string ScopeGuest = "guest";
    private const string ScopeClaim = "scope";
    private const string OwnerClaim = "owner";
    private const string ShareLinkClaim = "shareLink";

    private readonly SymmetricSecurityKey _key;
    private readonly SigningCredentials _signingCredentials;
    private readonly AppConfig _config;

    public JwtService(AppConfig config)
    {
        _config = config;
        _key = new SymmetricSecurityKey(Convert.FromBase64String(config.JwtSigningKey));
        _signingCredentials = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256);
    }

    public (string Token, DateTime ExpiresUtc) IssueUserSession(string userId, string email)
    {
        var expiresUtc = DateTime.UtcNow.AddDays(_config.SessionTtlDays);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId),
            new(JwtRegisteredClaimNames.Email, email),
            new(ScopeClaim, ScopeUser),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N"))
        };
        return (WriteToken(claims, expiresUtc), expiresUtc);
    }

    /// <summary>
    /// A guest's own <c>sub</c> is a synthetic per-session id — it identifies nothing and
    /// is never looked up. <paramref name="ownerUserId"/> is what matters: every guest
    /// action (pantry reads, generations, quota) resolves against the owner, not the
    /// guest. <paramref name="shareLinkId"/> (the link's RowKey — a token hash, not the
    /// raw token) tags a guest's recorded generations with which link produced them. See
    /// CLAUDE.md "AI" quota rules and docs/IMPLEMENTATION_PLAN.md Phase 6a.1 / Phase 8.
    /// </summary>
    public string IssueGuestSession(string ownerUserId, string shareLinkId, DateTime expiresUtc)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, $"guest:{Guid.NewGuid():N}"),
            new(ScopeClaim, ScopeGuest),
            new(OwnerClaim, ownerUserId),
            new(ShareLinkClaim, shareLinkId),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N"))
        };
        return WriteToken(claims, expiresUtc);
    }

    private string WriteToken(IEnumerable<Claim> claims, DateTime expiresUtc)
    {
        var handler = new JwtSecurityTokenHandler();
        var token = new JwtSecurityToken(
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expiresUtc,
            signingCredentials: _signingCredentials);
        return handler.WriteToken(token);
    }

    /// <summary>Returns null on any validation failure — expired, malformed, wrong signature.</summary>
    public ClaimsPrincipal? Validate(string token)
    {
        // MapInboundClaims defaults to true, which silently rewrites short claim names
        // (sub, email, ...) to long legacy WS-Federation URIs on validation — e.g. "sub"
        // becomes "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier".
        // Subject()/EmailOf() below look up the raw short names we actually wrote in
        // WriteToken(), so without this, every token fails to resolve a caller and every
        // request looks unauthenticated. Caught by actually issuing and validating a real
        // token against a running host — dotnet build has no way to catch this, since both
        // sides compile fine; it's a runtime claims-collection mismatch. See
        // docs/IMPLEMENTATION_PLAN.md Phase 10 (verification notes).
        var handler = new JwtSecurityTokenHandler { MapInboundClaims = false };
        var parameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = _key,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
        try
        {
            return handler.ValidateToken(token, parameters, out _);
        }
        catch (SecurityTokenException)
        {
            return null;
        }
        catch (ArgumentException)
        {
            // Malformed token string (not even well-formed JWT shape).
            return null;
        }
    }

    public static string? Scope(ClaimsPrincipal principal) => principal.FindFirst(ScopeClaim)?.Value;
    public static string? Owner(ClaimsPrincipal principal) => principal.FindFirst(OwnerClaim)?.Value;
    public static string? ShareLinkId(ClaimsPrincipal principal) => principal.FindFirst(ShareLinkClaim)?.Value;
    public static string? Subject(ClaimsPrincipal principal) => principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
    public static string? EmailOf(ClaimsPrincipal principal) => principal.FindFirst(JwtRegisteredClaimNames.Email)?.Value;
}
