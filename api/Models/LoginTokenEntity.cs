using Azure;
using Azure.Data.Tables;

namespace Cocktail.Api.Models;

/// <summary>
/// Table: LoginTokens — magic-link login tokens. PK "magic", RK SHA-256 hex of the raw
/// token. The raw token itself is NEVER stored — only its hash. See
/// docs/IMPLEMENTATION_PLAN.md §3 and CLAUDE.md "Security".
/// </summary>
public sealed class LoginTokenEntity : ITableEntity
{
    public string PartitionKey { get; set; } = "magic";
    public string RowKey { get; set; } = default!; // SHA-256 hex of the raw token
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    public string UserId { get; set; } = default!;
    public DateTime ExpiresUtc { get; set; }
    public DateTime? ConsumedUtc { get; set; }
    public string? RequestedIp { get; set; }
}
