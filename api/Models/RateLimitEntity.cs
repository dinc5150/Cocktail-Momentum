using Azure;
using Azure.Data.Tables;

namespace Cocktail.Api.Models;

/// <summary>
/// Table: RateLimit — one row per counted event (a login request or a successful
/// generation). PK is <c>generate:{userId}</c> or <c>login:{email}</c> / <c>login:{ip}</c>;
/// RK is <c>{reverseTicks}-{guid}</c> so ascending RowKey order is newest-first. See
/// docs/IMPLEMENTATION_PLAN.md §3 and Services/RateLimitStore.cs.
/// </summary>
public sealed class RateLimitEntity : ITableEntity
{
    public string PartitionKey { get; set; } = default!;
    public string RowKey { get; set; } = default!;
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    public DateTime AtUtc { get; set; }

    /// <summary>Set when this event was a guest generation via a share link; null otherwise.</summary>
    public string? ViaShareId { get; set; }
}
