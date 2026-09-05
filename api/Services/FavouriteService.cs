using Azure.Data.Tables;
using Cocktail.Api.Models;

namespace Cocktail.Api.Services;

public sealed class FavouriteService(TableStore tables)
{
    private const int MaxFavouritesPerUser = 200;

    /// <summary>Newest first — ascending RowKey order is newest-first, see SortableRowKey.</summary>
    public async Task<List<FavouriteEntity>> ListAsync(string userId, CancellationToken ct = default)
    {
        var table = await tables.FavouritesAsync(ct);
        var items = new List<FavouriteEntity>();
        await foreach (var item in table.QueryAsync<FavouriteEntity>(e => e.PartitionKey == userId, cancellationToken: ct))
        {
            items.Add(item);
        }
        return items;
    }

    public async Task<(FavouriteEntity? Created, string? Error)> CreateAsync(
        string userId,
        string name,
        string description,
        string ingredientsJson,
        string stepsJson,
        string? sourcePrompt,
        CancellationToken ct = default)
    {
        var table = await tables.FavouritesAsync(ct);

        var count = await CountAsync(userId, table, ct);
        if (count >= MaxFavouritesPerUser)
        {
            return (null, $"You've reached the {MaxFavouritesPerUser}-favourite limit. Remove one to add another.");
        }

        var entity = new FavouriteEntity
        {
            PartitionKey = userId,
            RowKey = SortableRowKey.NewKey(),
            Name = name,
            Description = description,
            IngredientsJson = ingredientsJson,
            StepsJson = stepsJson,
            SourcePrompt = sourcePrompt,
            SavedUtc = DateTime.UtcNow
        };
        await table.AddEntityAsync(entity, ct);
        return (entity, null);
    }

    public async Task DeleteAsync(string userId, string id, CancellationToken ct = default)
    {
        var table = await tables.FavouritesAsync(ct);
        await table.DeleteEntityAsync(userId, id, cancellationToken: ct);
    }

    private static async Task<int> CountAsync(string userId, TableClient table, CancellationToken ct)
    {
        var count = 0;
        await foreach (var _ in table.QueryAsync<FavouriteEntity>(
            e => e.PartitionKey == userId, select: ["PartitionKey"], cancellationToken: ct))
        {
            count++;
        }
        return count;
    }
}
