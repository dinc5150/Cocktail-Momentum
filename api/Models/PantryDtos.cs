namespace Cocktail.Api.Models;

public sealed record CreatePantryItemRequest(string? Name, string? Category);

public sealed record UpdatePantryItemRequest(string? Name, bool? InStock, bool? ToOrder);

/// <summary>Mode is "onboarding" or "examples" — see docs/IMPLEMENTATION_PLAN.md Phase 5.</summary>
public sealed record SeedPantryRequest(string? Mode);

public sealed record PantryItemResponse(
    string Id,
    string Name,
    string Category,
    bool InStock,
    bool ToOrder,
    DateTime CreatedUtc,
    DateTime UpdatedUtc)
{
    public static PantryItemResponse From(PantryItemEntity e) =>
        new(e.RowKey, e.Name, e.Category, e.InStock, e.ToOrder, e.CreatedUtc, e.UpdatedUtc);
}
