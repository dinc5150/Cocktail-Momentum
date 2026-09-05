using Azure;
using Azure.Data.Tables;

namespace Cocktail.Api.Models;

/// <summary>
/// Table: Favourites. PK userId, RK {reverseTicks}-{guid} so a partition scan returns
/// newest-first. See docs/IMPLEMENTATION_PLAN.md §3 and Services/SortableRowKey.cs.
/// </summary>
public sealed class FavouriteEntity : ITableEntity
{
    public string PartitionKey { get; set; } = default!; // userId
    public string RowKey { get; set; } = default!; // {reverseTicks}-{guid}
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    public string Name { get; set; } = default!;
    public string Description { get; set; } = default!;
    public string IngredientsJson { get; set; } = default!;
    public string StepsJson { get; set; } = default!;
    public string? SourcePrompt { get; set; }
    public DateTime SavedUtc { get; set; }
}
