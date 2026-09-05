namespace Cocktail.Api.Models;

/// <summary>
/// The strict JSON schema gpt-5-nano's structured-output mode must conform to. Every
/// object lists ALL its properties in "required" and sets additionalProperties false —
/// both are mandatory for OpenAI/Azure OpenAI strict structured outputs. See
/// docs/IMPLEMENTATION_PLAN.md Phase 6.
/// </summary>
public static class CocktailSchema
{
    public static readonly object Schema = new
    {
        type = "object",
        properties = new
        {
            cocktails = new
            {
                type = "array",
                items = new
                {
                    type = "object",
                    properties = new
                    {
                        name = new { type = "string" },
                        description = new { type = "string" },
                        ingredients = new
                        {
                            type = "array",
                            items = new
                            {
                                type = "object",
                                properties = new
                                {
                                    name = new { type = "string" },
                                    measure = new { type = "string" }
                                },
                                required = new[] { "name", "measure" },
                                additionalProperties = false
                            }
                        },
                        steps = new { type = "array", items = new { type = "string" } }
                    },
                    required = new[] { "name", "description", "ingredients", "steps" },
                    additionalProperties = false
                }
            }
        },
        required = new[] { "cocktails" },
        additionalProperties = false
    };
}
