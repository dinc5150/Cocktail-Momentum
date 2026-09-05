using Cocktail.Api.Models;

namespace Cocktail.Api.Services;

/// <summary>
/// Server-side enforcement of strictness. The model's own instructions (CocktailAi) are a
/// hint; this is the actual contract — every ingredient the model returns is matched
/// against the pantry by NameNormalized, and cocktails are filtered AFTER the call. Never
/// trust that the model respected "use only these ingredients". See CLAUDE.md "AI" and
/// docs/IMPLEMENTATION_PLAN.md Phase 6.5.
/// </summary>
public static class CocktailFilter
{
    public static GenerateCocktailsResponse Apply(
        RawCocktailSuggestions raw, IReadOnlyList<PantryItemEntity> pantry, string strictness)
    {
        var inStockKeys = pantry.Where(p => p.InStock).Select(p => p.NameNormalized).ToHashSet();
        var anyPantryKeys = pantry.Select(p => p.NameNormalized).ToHashSet();

        var annotated = raw.Cocktails.Select(c => Annotate(c, inStockKeys, anyPantryKeys)).ToList();

        var kept = strictness switch
        {
            "strict" => annotated.Where(c => c.MissingCount == 0).ToList(),
            "nearly" => annotated.Where(c => c.MissingCount <= 2).ToList(),
            _ => annotated
        };

        // Never silently return nothing, and never retry — see
        // docs/IMPLEMENTATION_PLAN.md Phase 6.6. A short, honest notice instead. The
        // `kept.Count == 0` branch matters even when `annotated.Count == 0` too — a model
        // response with zero suggestions to begin with used to fall through both
        // conditions below silently: quota charged, spinner cleared, nothing shown and no
        // explanation. Caught by actually running a real generation, not by reasoning
        // about the code. Phase 15.
        string? notice;
        if (kept.Count == 0)
        {
            notice = annotated.Count == 0
                ? "The model didn't return any suggestions for that request — try rephrasing it."
                : strictness == "strict"
                    ? "Only recipes using exactly what's in stock were kept, which ruled all of them out — try a less strict setting."
                    : "None of the suggestions stayed within the allowed missing ingredients — try a less strict setting.";
        }
        else if (strictness != "any" && kept.Count < 3 && annotated.Count > kept.Count)
        {
            notice = strictness == "strict"
                ? "Only recipes using exactly what's in stock were kept, which ruled some out — showing what's left."
                : "A few suggestions needed more missing ingredients than allowed — showing what's left.";
        }
        else
        {
            notice = null;
        }

        return new GenerateCocktailsResponse(kept, notice);
    }

    private static CocktailResponse Annotate(RawCocktail c, HashSet<string> inStockKeys, HashSet<string> anyPantryKeys)
    {
        var ingredients = c.Ingredients.Select(i =>
        {
            var key = IngredientNormalizer.Normalize(i.Name);
            return new CocktailIngredientResponse(
                Name: i.Name,
                Measure: i.Measure,
                InPantry: anyPantryKeys.Contains(key),
                InStock: inStockKeys.Contains(key));
        }).ToList();

        // "Missing" = out of stock OR entirely unknown to the pantry — both count against
        // strictness, since an unknown ingredient is exactly the failure mode this filter
        // exists to catch.
        var missingCount = ingredients.Count(i => !i.InStock);

        return new CocktailResponse(c.Name, c.Description, ingredients, c.Steps, missingCount);
    }
}
