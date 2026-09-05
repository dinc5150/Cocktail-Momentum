using Cocktail.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Cocktail.Api.Security;

/// <summary>
/// Resolves the caller from the request's cookies. Every endpoint goes through this —
/// never read cookies or parse JWTs anywhere else (CLAUDE.md "Security"). Registered
/// scoped: one instance per function invocation, call <see cref="Resolve"/> once at the
/// top of the function body before using anything else on this type.
/// </summary>
public sealed class CallerContext(JwtService jwt)
{
    /// <summary>
    /// For a signed-in user, their own id. For a guest, a synthetic per-session id that
    /// identifies nothing — use <see cref="QuotaUserId"/> / <see cref="OwnerUserId"/> for
    /// anything that touches the pantry owner's data.
    /// </summary>
    public string? UserId { get; private set; }
    public string? Email { get; private set; }
    public bool IsGuest { get; private set; }
    public string? OwnerUserId { get; private set; }

    /// <summary>The share link's id (a token hash) that produced this guest session; null for a signed-in user.</summary>
    public string? ShareLinkId { get; private set; }
    public bool IsAuthenticated => UserId is not null;

    /// <summary>
    /// The id everything guest-visible actually resolves against: the pantry to read, and
    /// the account whose daily generation quota is spent. See
    /// docs/IMPLEMENTATION_PLAN.md Phase 6a.1 — guests spend the OWNER's quota, never
    /// their own, or a share link would be an unlimited-generation bypass.
    /// </summary>
    public string? QuotaUserId => IsGuest ? OwnerUserId : UserId;

    public void Resolve(HttpRequest request)
    {
        if (TryValidate(request, "cm_session", JwtService.ScopeUser, out var principal) && principal is not null)
        {
            UserId = JwtService.Subject(principal);
            Email = JwtService.EmailOf(principal);
            IsGuest = false;
            return;
        }

        if (TryValidate(request, "cm_guest", JwtService.ScopeGuest, out var guestPrincipal) && guestPrincipal is not null)
        {
            UserId = JwtService.Subject(guestPrincipal);
            OwnerUserId = JwtService.Owner(guestPrincipal);
            ShareLinkId = JwtService.ShareLinkId(guestPrincipal);
            IsGuest = true;
        }
    }

    private bool TryValidate(HttpRequest request, string cookieName, string expectedScope, out System.Security.Claims.ClaimsPrincipal? principal)
    {
        principal = null;
        if (!request.Cookies.TryGetValue(cookieName, out var token) || string.IsNullOrEmpty(token))
        {
            return false;
        }

        var validated = jwt.Validate(token);
        if (validated is null || JwtService.Scope(validated) != expectedScope)
        {
            return false;
        }

        principal = validated;
        return true;
    }

    /// <summary>A real signed-in user only. Use for every mutating endpoint. Returns null when the caller may proceed.</summary>
    public ObjectResult? RequireUser()
    {
        if (UserId is null) return ApiResults.Unauthorized();
        if (IsGuest) return ApiResults.Forbidden("Guests can't do this — sign in to manage your own account.");
        return null;
    }

    /// <summary>A signed-in user OR a valid guest session. Use for read/generate endpoints guests may reach.</summary>
    public ObjectResult? RequireAnyCaller()
    {
        if (UserId is null) return ApiResults.Unauthorized();
        return null;
    }
}
