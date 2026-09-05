namespace Cocktail.Api.Services;

/// <summary>
/// Generates a RowKey that sorts newest-first under Table Storage's only order (ascending
/// RowKey). Shared by every table with a "whole partition, newest first" read pattern —
/// Favourites, RateLimit, and ShareLinks. See docs/IMPLEMENTATION_PLAN.md §3.
///
/// A NEWER event has a SMALLER key — unintuitive, and verified empirically rather than
/// just reasoned about (see Services/RateLimitStore.cs, which found this exact direction
/// easy to get backwards).
/// </summary>
public static class SortableRowKey
{
    public static string ReverseTicks(DateTime utc) => $"{DateTime.MaxValue.Ticks - utc.Ticks:D19}";

    public static string NewKey(DateTime? atUtc = null) =>
        $"{ReverseTicks(atUtc ?? DateTime.UtcNow)}-{Guid.NewGuid():N}";
}
