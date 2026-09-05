using System.Text;

namespace Cocktail.Api.Services;

/// <summary>
/// The single source of truth for turning an ingredient name into its dedupe/matching
/// key: lowercase, trimmed, punctuation stripped, internal whitespace collapsed. Used by
/// pantry CRUD (exact-duplicate detection) and, from Phase 6, by AI generation (matching
/// a model-returned ingredient name against the pantry). Never reimplement this
/// elsewhere — see CLAUDE.md "Data".
/// </summary>
public static class IngredientNormalizer
{
    public static string Normalize(string name)
    {
        var trimmed = name.Trim().ToLowerInvariant();
        var sb = new StringBuilder(trimmed.Length);
        var lastWasSpace = false;

        foreach (var c in trimmed)
        {
            if (char.IsLetterOrDigit(c))
            {
                sb.Append(c);
                lastWasSpace = false;
            }
            else if (char.IsWhiteSpace(c) && !lastWasSpace && sb.Length > 0)
            {
                sb.Append(' ');
                lastWasSpace = true;
            }
            // All other punctuation (commas, parens, apostrophes, slashes) is dropped.
        }

        return sb.ToString().TrimEnd();
    }
}
