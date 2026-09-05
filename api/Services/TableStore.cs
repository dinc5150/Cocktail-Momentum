using System.Collections.Concurrent;
using Azure.Data.Tables;

namespace Cocktail.Api.Services;

/// <summary>
/// One <see cref="TableServiceClient"/> for the whole app, with lazily-created,
/// per-process-cached <see cref="TableClient"/>s. <c>CreateIfNotExistsAsync</c> is
/// idempotent, so a benign race between two concurrent cold-start requests creating the
/// same table twice is harmless — see docs/IMPLEMENTATION_PLAN.md Phase 3.
/// </summary>
public sealed class TableStore
{
    private readonly TableServiceClient _serviceClient;
    private readonly ConcurrentDictionary<string, Task<TableClient>> _clients = new();

    public TableStore(AppConfig config)
    {
        _serviceClient = new TableServiceClient(config.StorageConnectionString);
    }

    public Task<TableClient> GetTableAsync(string tableName, CancellationToken ct = default) =>
        _clients.GetOrAdd(tableName, name => EnsureCreatedAsync(name, ct));

    private async Task<TableClient> EnsureCreatedAsync(string tableName, CancellationToken ct)
    {
        var client = _serviceClient.GetTableClient(tableName);
        await client.CreateIfNotExistsAsync(cancellationToken: ct);
        return client;
    }

    // Named accessors for the seven tables — keep this list in sync with
    // docs/IMPLEMENTATION_PLAN.md §3.
    public Task<TableClient> UsersAsync(CancellationToken ct = default) => GetTableAsync("Users", ct);
    public Task<TableClient> UserIndexAsync(CancellationToken ct = default) => GetTableAsync("UserIndex", ct);
    public Task<TableClient> PantryAsync(CancellationToken ct = default) => GetTableAsync("Pantry", ct);
    public Task<TableClient> FavouritesAsync(CancellationToken ct = default) => GetTableAsync("Favourites", ct);
    public Task<TableClient> LoginTokensAsync(CancellationToken ct = default) => GetTableAsync("LoginTokens", ct);
    public Task<TableClient> ShareLinksAsync(CancellationToken ct = default) => GetTableAsync("ShareLinks", ct);
    public Task<TableClient> RateLimitAsync(CancellationToken ct = default) => GetTableAsync("RateLimit", ct);

    /// <summary>Used by <c>GET /api/health</c> — true if Table Storage is reachable.</summary>
    public async Task<bool> PingAsync(CancellationToken ct = default)
    {
        try
        {
            await UsersAsync(ct);
            return true;
        }
        catch
        {
            return false;
        }
    }
}
