using System.Text.Json;

namespace Cocktail.Api.Models;

public sealed record FavouriteIngredientDto(string Name, string Measure, bool? InPantry, bool? InStock);

public sealed record SaveFavouriteRequest(
    string? Name,
    string? Description,
    List<FavouriteIngredientDto>? Ingredients,
    List<string>? Steps,
    string? SourcePrompt);

public sealed record FavouriteResponse(
    string Id,
    string Name,
    string Description,
    List<FavouriteIngredientDto> Ingredients,
    List<string> Steps,
    string? SourcePrompt,
    DateTime SavedUtc)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public static FavouriteResponse From(FavouriteEntity e)
    {
        var ingredients = JsonSerializer.Deserialize<List<FavouriteIngredientDto>>(e.IngredientsJson, JsonOptions) ?? [];
        var steps = JsonSerializer.Deserialize<List<string>>(e.StepsJson, JsonOptions) ?? [];
        return new FavouriteResponse(e.RowKey, e.Name, e.Description, ingredients, steps, e.SourcePrompt, e.SavedUtc);
    }
}
