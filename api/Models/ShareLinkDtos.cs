namespace Cocktail.Api.Models;

public sealed record CreateShareLinkRequest(string? Label);

/// <summary>
/// <c>Id</c> is the link's RowKey — a SHA-256 hash of the raw token, safe to return
/// (one-way; cannot be turned back into a working link) and needed so DELETE /share/{id}
/// has something real to look up. This is a different value from the raw token that
/// appears once in <see cref="CreatedShareLinkResponse.Url"/>.
/// </summary>
public sealed record ShareLinkResponse(string Id, string? Label, DateTime CreatedUtc, DateTime ExpiresUtc)
{
    public static ShareLinkResponse From(ShareLinkEntity e) => new(e.RowKey, e.Label, e.CreatedUtc, e.ExpiresUtc);
}

/// <summary>Returned only once, at creation — the raw token embedded in Url is never stored or shown again.</summary>
public sealed record CreatedShareLinkResponse(string Url, DateTime ExpiresUtc);
