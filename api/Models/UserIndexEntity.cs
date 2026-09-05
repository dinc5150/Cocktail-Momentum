using Azure;
using Azure.Data.Tables;

namespace Cocktail.Api.Models;

/// <summary>
/// Table: UserIndex — email to userId lookup. PK "email", RK lowercased/trimmed email.
/// See docs/IMPLEMENTATION_PLAN.md §3.
/// </summary>
public sealed class UserIndexEntity : ITableEntity
{
    public string PartitionKey { get; set; } = "email";
    public string RowKey { get; set; } = default!; // lowercased, trimmed email
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    public string UserId { get; set; } = default!;
}
