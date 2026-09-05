using Azure.Data.Tables;
using Cocktail.Api.Models;

namespace Cocktail.Api.Services;

/// <summary>
/// Shared low-level counter over the RateLimit table, used for both login rate limiting
/// (Phase 4) and the daily generation quota (Phase 6a). Each row is one event; a window
/// count is a single OData-filtered range query over one partition — Table Storage applies
/// the filter server-side, so this never fetches rows outside the window.
///
/// RowKey ordering — read this before touching the comparisons below:
/// RowKey = reverseTicks(eventTime) = (DateTime.MaxValue.Ticks - eventTime.Ticks), so a
/// NEWER event has a SMALLER RowKey (verified empirically while writing this class — the
/// intuitive direction is easy to get backwards and there are no tests to catch it, see
/// CLAUDE.md "Testing"). Consequently:
///   - "events at or after sinceUtc" (within the window)  → RowKey le RK(sinceUtc)
///   - "events strictly before cutoffUtc" (safe to purge) → RowKey gt RK(cutoffUtc)
/// </summary>
public sealed class RateLimitStore
{
    private readonly TableStore _tables;

    public RateLimitStore(TableStore tables) => _tables = tables;

    public async Task RecordAsync(string partitionKey, string? viaShareId = null, CancellationToken ct = default)
    {
        var table = await _tables.RateLimitAsync(ct);
        var entity = new RateLimitEntity
        {
            PartitionKey = partitionKey,
            RowKey = SortableRowKey.NewKey(),
            AtUtc = DateTime.UtcNow,
            ViaShareId = viaShareId
        };
        await table.AddEntityAsync(entity, ct);
    }

    /// <summary>Counts events in <paramref name="partitionKey"/> from the last <paramref name="window"/>.</summary>
    public async Task<int> CountSinceAsync(string partitionKey, TimeSpan window, CancellationToken ct = default)
    {
        var table = await _tables.RateLimitAsync(ct);
        var sinceUtc = DateTime.UtcNow - window;
        var rowKeyCeiling = SortableRowKey.ReverseTicks(sinceUtc);

        var filter = TableClient.CreateQueryFilter(
            $"PartitionKey eq {partitionKey} and RowKey le {rowKeyCeiling}");

        var count = 0;
        await foreach (var _ in table.QueryAsync<RateLimitEntity>(filter, cancellationToken: ct))
        {
            count++;
        }
        return count;
    }

    /// <summary>
    /// The moment the oldest event still inside <paramref name="window"/> ages out — i.e.
    /// when one more slot frees up. Null if the partition is empty or fully outside the
    /// window (nothing will free up on its own).
    /// </summary>
    public async Task<DateTime?> OldestInWindowAsync(string partitionKey, TimeSpan window, CancellationToken ct = default)
    {
        var table = await _tables.RateLimitAsync(ct);
        var sinceUtc = DateTime.UtcNow - window;
        var rowKeyCeiling = SortableRowKey.ReverseTicks(sinceUtc);

        // Oldest-in-window = largest RowKey among rows still inside the window. Table
        // Storage has no descending-order query, so take the last matching row.
        var filter = TableClient.CreateQueryFilter(
            $"PartitionKey eq {partitionKey} and RowKey le {rowKeyCeiling}");

        DateTime? oldest = null;
        await foreach (var entity in table.QueryAsync<RateLimitEntity>(filter, cancellationToken: ct))
        {
            oldest = entity.AtUtc;
        }
        return oldest is null ? null : oldest.Value + window;
    }

    /// <summary>Deletes events in <paramref name="partitionKey"/> older than <paramref name="olderThan"/>.</summary>
    public async Task PurgeOlderThanAsync(string partitionKey, TimeSpan olderThan, CancellationToken ct = default)
    {
        var table = await _tables.RateLimitAsync(ct);
        var cutoffUtc = DateTime.UtcNow - olderThan;
        var rowKeyFloor = SortableRowKey.ReverseTicks(cutoffUtc);

        var filter = TableClient.CreateQueryFilter(
            $"PartitionKey eq {partitionKey} and RowKey gt {rowKeyFloor}");

        await foreach (var entity in table.QueryAsync<RateLimitEntity>(filter, cancellationToken: ct))
        {
            await table.DeleteEntityAsync(entity.PartitionKey, entity.RowKey, cancellationToken: ct);
        }
    }
}
