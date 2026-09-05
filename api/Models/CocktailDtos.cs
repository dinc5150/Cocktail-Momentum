namespace Cocktail.Api.Models;

// --- What the model returns, matching CocktailSchema.Schema exactly. Never trust these
// values against the pantry without going through CocktailFilter — see CLAUDE.md "AI". ---
public sealed record RawCocktailSuggestions(List<RawCocktail> Cocktails);
public sealed record RawCocktail(string Name, string Description, List<RawIngredient> Ingredients, List<string> Steps);
public sealed record RawIngredient(string Name, string Measure);

// --- What the API actually returns, after CocktailFilter has matched every ingredient
// against the pantry and applied the strictness rule. ---
public sealed record CocktailIngredientResponse(string Name, string Measure, bool InPantry, bool InStock);

public sealed record CocktailResponse(
    string Name, string Description, List<CocktailIngredientResponse> Ingredients, List<string> Steps, int MissingCount);

public sealed record GenerateCocktailsResponse(List<CocktailResponse> Cocktails, string? Notice);

public sealed record GenerateCocktailsRequest(string? Prompt, string? Strictness);
