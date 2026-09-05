using Azure;
using Azure.Data.Tables;

namespace Cocktail.Api.Models;

/// <summary>
/// Table: ShareLinks. PK "share", RK SHA-256 hex of the raw token — same "never store the
/// raw token" rule as LoginTokens. See docs/IMPLEMENTATION_PLAN.md §3 and CLAUDE.md
/// "Security".
/// </summary>
public sealed class ShareLinkEntity : ITableEntity
{
    public string PartitionKey { get; set; } = "share";
    public string RowKey { get; set; } = default!; // SHA-256 hex of the raw token
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    public string OwnerUserId { get; set; } = default!;
    public DateTime CreatedUtc { get; set; }
    public DateTime ExpiresUtc { get; set; }
    public DateTime? RevokedUtc { get; set; }
    public string? Label { get; set; }
}
