using System.Security.Cryptography;
using System.Text;
using Azure;
using Azure.Data.Tables;
using Cocktail.Api.Models;

namespace Cocktail.Api.Services;

/// <summary>
/// Magic-link login tokens. The raw token is generated here, handed to the caller once
/// (to email), and never stored — only its SHA-256 hash goes in LoginTokens. See
/// docs/IMPLEMENTATION_PLAN.md Phase 4 and CLAUDE.md "Security".
/// </summary>
public sealed class TokenService(TableStore tables, AppConfig config)
{
    private static string GenerateRawToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes)
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');
    }

    private static string Hash(string rawToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    /// <summary>Creates and stores a new magic-link token, returning the raw value to email.</summary>
    public async Task<string> IssueMagicLinkAsync(string userId, string? requestedIp, CancellationToken ct = default)
    {
        var raw = GenerateRawToken();
        var table = await tables.LoginTokensAsync(ct);
        var entity = new LoginTokenEntity
        {
            RowKey = Hash(raw),
            UserId = userId,
            ExpiresUtc = DateTime.UtcNow.AddMinutes(config.MagicLinkTtlMinutes),
            ConsumedUtc = null,
            RequestedIp = requestedIp
        };
        await table.AddEntityAsync(entity, ct);
        return raw;
    }

    /// <summary>
    /// Validates and single-use-consumes a raw token. Returns the associated userId, or
    /// null if the token is unknown, already consumed, or expired.
    /// </summary>
    public async Task<string?> ConsumeMagicLinkAsync(string rawToken, CancellationToken ct = default)
    {
        var table = await tables.LoginTokensAsync(ct);
        var hash = Hash(rawToken);

        LoginTokenEntity entity;
        try
        {
            var response = await table.GetEntityAsync<LoginTokenEntity>("magic", hash, cancellationToken: ct);
            entity = response.Value;
        }
        catch (RequestFailedException e) when (e.Status == 404)
        {
            return null;
        }

        if (entity.ConsumedUtc is not null || entity.ExpiresUtc < DateTime.UtcNow)
        {
            return null;
        }

        entity.ConsumedUtc = DateTime.UtcNow;
        try
        {
            await table.UpdateEntityAsync(entity, entity.ETag, TableUpdateMode.Replace, ct);
        }
        catch (RequestFailedException e) when (e.Status == 412)
        {
            // Lost a race to consume the same link twice concurrently — the other
            // request wins, this one is treated as already-used.
            return null;
        }

        return entity.UserId;
    }

    /// <summary>
    /// Opportunistic cleanup, called from the request-link endpoint — there is no timer
    /// trigger on managed functions (CLAUDE.md "Hard platform constraints"). Deletes
    /// tokens that expired more than 24h ago.
    /// </summary>
    public async Task PurgeExpiredAsync(CancellationToken ct = default)
    {
        var table = await tables.LoginTokensAsync(ct);
        var cutoff = DateTime.UtcNow.AddHours(-24);
        var filter = TableClient.CreateQueryFilter<LoginTokenEntity>(
            e => e.PartitionKey == "magic" && e.ExpiresUtc < cutoff);

        await foreach (var entity in table.QueryAsync<LoginTokenEntity>(filter, cancellationToken: ct))
        {
            await table.DeleteEntityAsync(entity.PartitionKey, entity.RowKey, cancellationToken: ct);
        }
    }
}
