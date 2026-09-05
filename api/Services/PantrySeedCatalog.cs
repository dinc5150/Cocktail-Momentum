using System.Reflection;
using System.Text.Json;

namespace Cocktail.Api.Services;

/// <summary>
/// The curated seed list from data/pantry-seed.json, embedded into the assembly at build
/// time (Cocktail.Api.csproj) so it doesn't depend on a relative file path on the
/// deployed host. Read once at startup and cached — the list never changes at runtime.
/// See docs/IMPLEMENTATION_PLAN.md Phase 0.3 and Phase 5.
/// </summary>
public sealed class PantrySeedCatalog
{
    private const string ResourceName = "data.pantry-seed.json";
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public IReadOnlyList<(string Name, string Category)> Items { get; }

    public PantrySeedCatalog()
    {
        using var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(ResourceName)
            ?? throw new InvalidOperationException(
                $"Embedded resource '{ResourceName}' not found. Check the EmbeddedResource " +
                "entry in Cocktail.Api.csproj.");

        var items = JsonSerializer.Deserialize<List<SeedItem>>(stream, JsonOptions)
            ?? throw new InvalidOperationException("data/pantry-seed.json deserialized to null.");

        Items = items.Select(i => (i.Name, i.Category)).ToList();
    }

    private sealed record SeedItem(string Name, string Category);
}
