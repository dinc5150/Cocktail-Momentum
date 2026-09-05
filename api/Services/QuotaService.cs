namespace Cocktail.Api.Services;

public sealed record QuotaStatus(int Used, int? Limit, bool Unlimited, DateTime? ResetsUtc, bool Allowed);

/// <summary>
/// Enforces the daily generation quota — 10 per user per rolling 24h, unlimited for
/// whitelisted emails. Checked BEFORE the model is called; a slot is recorded only after
/// a successful generation. See docs/IMPLEMENTATION_PLAN.md Phase 6a and CLAUDE.md "AI".
/// </summary>
public sealed class QuotaService(RateLimitStore rateLimits, UserService users, AppConfig config)
{
    private static readonly TimeSpan Window = TimeSpan.FromHours(24);

    /// <param name="quotaUserId">
    /// CallerContext.QuotaUserId — for a guest this is the pantry OWNER's id, never the
    /// guest's own. A share link spends the owner's quota; see Phase 6a.1.
    /// </param>
    public async Task<QuotaStatus> CheckAsync(string quotaUserId, CancellationToken ct = default)
    {
        // Checked against the stored Users row email, not a JWT claim — a guest's own
        // token carries the guest's context, not the owner's, so the owner's record has
        // to be read regardless. One code path for both caller kinds. See CLAUDE.md "AI".
        var owner = await users.GetByIdAsync(quotaUserId, ct);
        var unlimited = owner is not null && config.IsEmailUnlimited(owner.Email);
        if (unlimited)
        {
            return new QuotaStatus(Used: 0, Limit: null, Unlimited: true, ResetsUtc: null, Allowed: true);
        }

        var partitionKey = $"generate:{quotaUserId}";
        var used = await rateLimits.CountSinceAsync(partitionKey, Window, ct);
        var allowed = used < config.DailyGenerationLimit;

        DateTime? resetsUtc = allowed ? null : await rateLimits.OldestInWindowAsync(partitionKey, Window, ct);

        return new QuotaStatus(used, config.DailyGenerationLimit, Unlimited: false, resetsUtc, allowed);
    }

    /// <summary>
    /// Call ONLY after a generation actually produced a usable result — a timeout, an AI
    /// error, or an empty response must never cost the user a slot. See CLAUDE.md "AI".
    /// </summary>
    /// <param name="viaShareId">CallerContext.ShareLinkId for a guest; null for a signed-in user.</param>
    public Task RecordSuccessAsync(string quotaUserId, string? viaShareId, CancellationToken ct = default) =>
        rateLimits.RecordAsync($"generate:{quotaUserId}", viaShareId, ct);
}
