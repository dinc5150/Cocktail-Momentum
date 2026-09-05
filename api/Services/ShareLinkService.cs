using System.Security.Cryptography;
using System.Text;
using Azure;
using Azure.Data.Tables;
using Cocktail.Api.Models;

namespace Cocktail.Api.Services;

/// <summary>
/// 12h, generate-only, pantry-read-only share links. See docs/IMPLEMENTATION_PLAN.md
/// Phase 8 and §0 ("generate-only, pantry read-only — cannot write anything").
/// </summary>
public sealed class ShareLinkService(TableStore tables, AppConfig config)
{
    private static string GenerateRawToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes).Replace('+', '-').Replace('/', '_').TrimEnd('=');
    }

    private static string Hash(string rawToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    /// <summary>Creates a new share link. The raw token is returned once and never stored — only its hash.</summary>
    public async Task<(string RawToken, ShareLinkEntity Entity)> CreateAsync(
        string ownerUserId, string? label, CancellationToken ct = default)
    {
        var table = await tables.ShareLinksAsync(ct);
        var raw = GenerateRawToken();
        var now = DateTime.UtcNow;
        var entity = new ShareLinkEntity
        {
            RowKey = Hash(raw),
            OwnerUserId = ownerUserId,
            CreatedUtc = now,
            ExpiresUtc = now.AddHours(config.ShareLinkTtlHours),
            RevokedUtc = null,
            Label = label
        };
        await table.AddEntityAsync(entity, ct);
        return (raw, entity);
    }

    /// <summary>
    /// Active (unexpired, unrevoked) links owned by <paramref name="ownerUserId"/>. Scans
    /// the whole "share" partition filtered by owner — an accepted scaling limit at this
    /// table's size, see docs/IMPLEMENTATION_PLAN.md §3 and §7.
    /// </summary>
    public async Task<List<ShareLinkEntity>> ListActiveAsync(string ownerUserId, CancellationToken ct = default)
    {
        var table = await tables.ShareLinksAsync(ct);
        var now = DateTime.UtcNow;
        var items = new List<ShareLinkEntity>();
        await foreach (var item in table.QueryAsync<ShareLinkEntity>(
            e => e.PartitionKey == "share" && e.OwnerUserId == ownerUserId, cancellationToken: ct))
        {
            if (item.RevokedUtc is null && item.ExpiresUtc > now)
            {
                items.Add(item);
            }
        }
        return items;
    }

    /// <summary>Revokes a link the caller owns. A no-op — not an error — if it's missing, already revoked, or not theirs.</summary>
    public async Task RevokeAsync(string ownerUserId, string id, CancellationToken ct = default)
    {
        var table = await tables.ShareLinksAsync(ct);
        ShareLinkEntity entity;
        try
        {
            var response = await table.GetEntityAsync<ShareLinkEntity>("share", id, cancellationToken: ct);
            entity = response.Value;
        }
        catch (RequestFailedException e) when (e.Status == 404)
        {
            return;
        }

        // Not this caller's link — treated exactly like "not found" rather than confirming
        // a link with this id exists for someone else.
        if (entity.OwnerUserId != ownerUserId || entity.RevokedUtc is not null)
        {
            return;
        }

        entity.RevokedUtc = DateTime.UtcNow;
        try
        {
            await table.UpdateEntityAsync(entity, entity.ETag, TableUpdateMode.Replace, ct);
        }
        catch (RequestFailedException e) when (e.Status is 412 or 404)
        {
            // Revoked or deleted concurrently by another request — already the outcome we wanted.
        }
    }

    /// <summary>Validates a raw token. Returns null if unknown, revoked, or expired.</summary>
    public async Task<(string OwnerUserId, string ShareLinkId, DateTime ExpiresUtc)?> RedeemAsync(
        string rawToken, CancellationToken ct = default)
    {
        var table = await tables.ShareLinksAsync(ct);
        var hash = Hash(rawToken);

        try
        {
            var response = await table.GetEntityAsync<ShareLinkEntity>("share", hash, cancellationToken: ct);
            var entity = response.Value;
            if (entity.RevokedUtc is not null || entity.ExpiresUtc <= DateTime.UtcNow)
            {
                return null;
            }
            return (entity.OwnerUserId, entity.RowKey, entity.ExpiresUtc);
        }
        catch (RequestFailedException e) when (e.Status == 404)
        {
            return null;
        }
    }

    /// <summary>Opportunistic cleanup, called from GET /share — deletes links that expired more than 24h ago.</summary>
    public async Task PurgeExpiredAsync(CancellationToken ct = default)
    {
        var table = await tables.ShareLinksAsync(ct);
        var cutoff = DateTime.UtcNow.AddHours(-24);
        var filter = TableClient.CreateQueryFilter<ShareLinkEntity>(
            e => e.PartitionKey == "share" && e.ExpiresUtc < cutoff);

        await foreach (var entity in table.QueryAsync<ShareLinkEntity>(filter, cancellationToken: ct))
        {
            await table.DeleteEntityAsync(entity.PartitionKey, entity.RowKey, cancellationToken: ct);
        }
    }
}
