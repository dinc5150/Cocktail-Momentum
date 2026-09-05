using Azure;
using Azure.Data.Tables;
using Cocktail.Api.Models;

namespace Cocktail.Api.Services;

public sealed class PantryService(TableStore tables)
{
    public async Task<List<PantryItemEntity>> ListAsync(string userId, CancellationToken ct = default)
    {
        var table = await tables.PantryAsync(ct);
        var items = new List<PantryItemEntity>();
        await foreach (var item in table.QueryAsync<PantryItemEntity>(e => e.PartitionKey == userId, cancellationToken: ct))
        {
            items.Add(item);
        }
        return items;
    }

    private async Task<PantryItemEntity?> FindByNormalizedNameAsync(string userId, string nameNormalized, CancellationToken ct)
    {
        var table = await tables.PantryAsync(ct);
        await foreach (var item in table.QueryAsync<PantryItemEntity>(
            e => e.PartitionKey == userId && e.NameNormalized == nameNormalized, cancellationToken: ct))
        {
            return item;
        }
        return null;
    }

    /// <summary>
    /// Returns (null, existing) if an item with the same normalized name already exists —
    /// callers turn that into a 409 carrying the existing item, per
    /// docs/IMPLEMENTATION_PLAN.md §4.
    /// </summary>
    public async Task<(PantryItemEntity? Created, PantryItemEntity? Existing)> CreateAsync(
        string userId, string name, string category, CancellationToken ct = default)
    {
        var normalized = IngredientNormalizer.Normalize(name);
        var existing = await FindByNormalizedNameAsync(userId, normalized, ct);
        if (existing is not null)
        {
            return (null, existing);
        }

        var table = await tables.PantryAsync(ct);
        var now = DateTime.UtcNow;
        var entity = new PantryItemEntity
        {
            PartitionKey = userId,
            RowKey = Guid.NewGuid().ToString("N"),
            Name = name.Trim(),
            NameNormalized = normalized,
            Category = category,
            InStock = false,
            ToOrder = false,
            CreatedUtc = now,
            UpdatedUtc = now
        };

        try
        {
            await table.AddEntityAsync(entity, ct);
        }
        catch (RequestFailedException e) when (e.Status == 409)
        {
            // Lost a race with a concurrent create of the same ingredient — return the winner.
            var winner = await FindByNormalizedNameAsync(userId, normalized, ct);
            return (null, winner);
        }

        return (entity, null);
    }

    public async Task<PantryItemEntity?> GetAsync(string userId, string id, CancellationToken ct = default)
    {
        var table = await tables.PantryAsync(ct);
        try
        {
            var response = await table.GetEntityAsync<PantryItemEntity>(userId, id, cancellationToken: ct);
            return response.Value;
        }
        catch (RequestFailedException e) when (e.Status == 404)
        {
            return null;
        }
    }

    public async Task<PantryItemEntity> UpdateAsync(
        PantryItemEntity item, string? name, bool? inStock, bool? toOrder, CancellationToken ct = default)
    {
        var table = await tables.PantryAsync(ct);

        if (!string.IsNullOrWhiteSpace(name))
        {
            item.Name = name.Trim();
            item.NameNormalized = IngredientNormalizer.Normalize(name);
        }
        if (inStock is not null) item.InStock = inStock.Value;
        if (toOrder is not null) item.ToOrder = toOrder.Value;
        item.UpdatedUtc = DateTime.UtcNow;

        await table.UpdateEntityAsync(item, item.ETag, TableUpdateMode.Replace, ct);
        return item;
    }

    public async Task DeleteAsync(string userId, string id, CancellationToken ct = default)
    {
        var table = await tables.PantryAsync(ct);
        await table.DeleteEntityAsync(userId, id, cancellationToken: ct);
    }

    /// <summary>
    /// Adds every seed item absent from the user's pantry (matched by normalized name).
    /// Never overwrites an existing row or its flags — both "onboarding" and "examples"
    /// modes share this exact behaviour; the distinction is purely which screen calls it,
    /// not different server logic. See docs/IMPLEMENTATION_PLAN.md Phase 5.
    /// </summary>
    public async Task<int> SeedAsync(
        string userId, IReadOnlyList<(string Name, string Category)> seedItems, CancellationToken ct = default)
    {
        var table = await tables.PantryAsync(ct);
        var existing = await ListAsync(userId, ct);
        var existingNormalized = existing.Select(e => e.NameNormalized).ToHashSet();

        var added = 0;
        var now = DateTime.UtcNow;
        foreach (var (name, category) in seedItems)
        {
            var normalized = IngredientNormalizer.Normalize(name);
            if (!existingNormalized.Add(normalized))
            {
                // Already in the pantry, or a duplicate within the seed list itself.
                continue;
            }

            var entity = new PantryItemEntity
            {
                PartitionKey = userId,
                RowKey = Guid.NewGuid().ToString("N"),
                Name = name,
                NameNormalized = normalized,
                Category = category,
                InStock = false,
                ToOrder = false,
                CreatedUtc = now,
                UpdatedUtc = now
            };
            await table.AddEntityAsync(entity, ct);
            added++;
        }
        return added;
    }
}
