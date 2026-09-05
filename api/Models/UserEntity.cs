using Azure;
using Azure.Data.Tables;

namespace Cocktail.Api.Models;

/// <summary>Table: Users. PK "user", RK userId. See docs/IMPLEMENTATION_PLAN.md §3.</summary>
public sealed class UserEntity : ITableEntity
{
    public string PartitionKey { get; set; } = "user";
    public string RowKey { get; set; } = default!; // userId
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    public string Email { get; set; } = default!;
    public DateTime CreatedUtc { get; set; }
    public DateTime? LastLoginUtc { get; set; }
    public DateTime? OnboardedUtc { get; set; }
}
