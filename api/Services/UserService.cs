using Azure;
using Azure.Data.Tables;
using Cocktail.Api.Models;

namespace Cocktail.Api.Services;

/// <summary>Users + UserIndex: lookup, creation, login/onboarding stamps.</summary>
public sealed class UserService(TableStore tables)
{
    // Characters illegal in a Table Storage RowKey — the plan stores the email directly
    // as UserIndex's RowKey, so a submitted address containing any of these is rejected
    // as invalid rather than silently mangled. See docs/IMPLEMENTATION_PLAN.md §3.
    private static readonly char[] IllegalRowKeyChars = ['/', '\\', '#', '?'];

    public static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    public static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return false;
        var trimmed = email.Trim();
        if (trimmed.Length > 254) return false;
        if (trimmed.IndexOfAny(IllegalRowKeyChars) >= 0) return false;
        if (trimmed.Contains(' ')) return false;

        var at = trimmed.IndexOf('@');
        if (at <= 0 || at >= trimmed.Length - 1) return false;
        if (trimmed.IndexOf('@', at + 1) >= 0) return false; // exactly one '@'

        var domain = trimmed[(at + 1)..];
        return domain.Contains('.');
    }

    /// <summary>
    /// Looks up a user by email, creating one if none exists. The UserIndex entry is
    /// created first and is the source of truth for "does this email already have an
    /// account" — if two signups race for the same new email, the loser's AddEntityAsync
    /// on UserIndex fails with 409 and it re-reads the winner instead of creating an
    /// orphaned Users row.
    /// </summary>
    public async Task<UserEntity> GetOrCreateByEmailAsync(string email, CancellationToken ct = default)
    {
        var normalized = NormalizeEmail(email);
        var indexTable = await tables.UserIndexAsync(ct);
        var usersTable = await tables.UsersAsync(ct);

        try
        {
            var existingIndex = await indexTable.GetEntityAsync<UserIndexEntity>("email", normalized, cancellationToken: ct);
            var existingUser = await usersTable.GetEntityAsync<UserEntity>("user", existingIndex.Value.UserId, cancellationToken: ct);
            return existingUser.Value;
        }
        catch (RequestFailedException e) when (e.Status == 404)
        {
            // No account yet — fall through to create one.
        }

        var userId = Guid.NewGuid().ToString("N");
        try
        {
            await indexTable.AddEntityAsync(new UserIndexEntity { RowKey = normalized, UserId = userId }, ct);
        }
        catch (RequestFailedException e) when (e.Status == 409)
        {
            var winningIndex = await indexTable.GetEntityAsync<UserIndexEntity>("email", normalized, cancellationToken: ct);
            var winner = await usersTable.GetEntityAsync<UserEntity>("user", winningIndex.Value.UserId, cancellationToken: ct);
            return winner.Value;
        }

        var user = new UserEntity { RowKey = userId, Email = normalized, CreatedUtc = DateTime.UtcNow };
        await usersTable.AddEntityAsync(user, ct);
        return user;
    }

    public async Task<UserEntity?> GetByIdAsync(string userId, CancellationToken ct = default)
    {
        var table = await tables.UsersAsync(ct);
        try
        {
            var response = await table.GetEntityAsync<UserEntity>("user", userId, cancellationToken: ct);
            return response.Value;
        }
        catch (RequestFailedException e) when (e.Status == 404)
        {
            return null;
        }
    }

    public async Task MarkLoginAsync(UserEntity user, CancellationToken ct = default)
    {
        var table = await tables.UsersAsync(ct);
        user.LastLoginUtc = DateTime.UtcNow;
        await table.UpdateEntityAsync(user, user.ETag, TableUpdateMode.Merge, ct);
    }

    public async Task MarkOnboardedAsync(UserEntity user, CancellationToken ct = default)
    {
        var table = await tables.UsersAsync(ct);
        user.OnboardedUtc = DateTime.UtcNow;
        await table.UpdateEntityAsync(user, user.ETag, TableUpdateMode.Merge, ct);
    }
}
