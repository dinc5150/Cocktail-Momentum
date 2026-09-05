using Azure;
using Azure.Data.Tables;

namespace Cocktail.Api.Models;

/// <summary>Table: Pantry. PK userId, RK ingredientId. See docs/IMPLEMENTATION_PLAN.md §3.</summary>
public sealed class PantryItemEntity : ITableEntity
{
    public string PartitionKey { get; set; } = default!; // userId
    public string RowKey { get; set; } = default!; // ingredientId (guid)
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    public string Name { get; set; } = default!;
    public string NameNormalized { get; set; } = default!;
    public string Category { get; set; } = default!;
    public bool InStock { get; set; }
    public bool ToOrder { get; set; }
    public DateTime CreatedUtc { get; set; }
    public DateTime UpdatedUtc { get; set; }
}
