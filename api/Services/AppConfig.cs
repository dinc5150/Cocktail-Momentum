namespace Cocktail.Api.Services;

/// <summary>
/// Strongly-typed application settings, read once from environment variables and
/// validated at startup. Function bodies must never call
/// <see cref="Environment.GetEnvironmentVariable(string)"/> directly — inject this
/// instead. See CLAUDE.md "API (C#)" conventions and "Application settings".
/// </summary>
public sealed class AppConfig
{
    public required string StorageConnectionString { get; init; }
    public required string AzureOpenAiEndpoint { get; init; }
    public required string AzureOpenAiKey { get; init; }
    public required string AzureOpenAiDeployment { get; init; }
    public required string SendGridApiKey { get; init; }
    public required string SendGridFromEmail { get; init; }
    public required string SendGridFromName { get; init; }
    public required string JwtSigningKey { get; init; }
    public required string AppBaseUrl { get; init; }
    public required int MagicLinkTtlMinutes { get; init; }
    public required int SessionTtlDays { get; init; }
    public required int ShareLinkTtlHours { get; init; }
    public required int DailyGenerationLimit { get; init; }

    /// <summary>Lowercased, trimmed. Source: UNLIMITED_EMAILS (comma-separated).</summary>
    public required IReadOnlySet<string> UnlimitedEmails { get; init; }

    /// <summary>
    /// Checked against a user's stored <c>Users</c> row email, never against a JWT claim —
    /// a guest's token carries the guest's own identity, not the pantry owner's. See
    /// docs/IMPLEMENTATION_PLAN.md Phase 6a.2.
    /// </summary>
    public bool IsEmailUnlimited(string email) =>
        UnlimitedEmails.Contains(email.Trim().ToLowerInvariant());

    public static AppConfig FromEnvironment()
    {
        var missing = new List<string>();

        string Require(string key)
        {
            var value = Environment.GetEnvironmentVariable(key);
            if (string.IsNullOrWhiteSpace(value))
            {
                missing.Add(key);
                return string.Empty;
            }
            return value;
        }

        int OptionalInt(string key, int fallback)
        {
            var raw = Environment.GetEnvironmentVariable(key);
            return !string.IsNullOrWhiteSpace(raw) && int.TryParse(raw, out var parsed)
                ? parsed
                : fallback;
        }

        var storageConnectionString = Require("STORAGE_CONNECTION_STRING");
        var azureOpenAiEndpoint = Require("AZURE_OPENAI_ENDPOINT");
        var azureOpenAiKey = Require("AZURE_OPENAI_KEY");
        var azureOpenAiDeployment = Require("AZURE_OPENAI_DEPLOYMENT");
        var sendGridApiKey = Require("SENDGRID_API_KEY");
        var sendGridFromEmail = Require("SENDGRID_FROM_EMAIL");
        var jwtSigningKey = Require("JWT_SIGNING_KEY");
        var appBaseUrl = Require("APP_BASE_URL");

        if (missing.Count > 0)
        {
            throw new InvalidOperationException(
                $"Missing required application setting(s): {string.Join(", ", missing)}. " +
                "See CLAUDE.md \"Application settings\" for the full list, and " +
                "api/local.settings.json.example for local development.");
        }

        var sendGridFromName = Environment.GetEnvironmentVariable("SENDGRID_FROM_NAME");
        if (string.IsNullOrWhiteSpace(sendGridFromName))
        {
            sendGridFromName = "Cocktail Momentum";
        }

        var unlimitedEmails = (Environment.GetEnvironmentVariable("UNLIMITED_EMAILS") ?? string.Empty)
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(e => e.ToLowerInvariant())
            .ToHashSet();

        return new AppConfig
        {
            StorageConnectionString = storageConnectionString,
            AzureOpenAiEndpoint = azureOpenAiEndpoint,
            AzureOpenAiKey = azureOpenAiKey,
            AzureOpenAiDeployment = azureOpenAiDeployment,
            SendGridApiKey = sendGridApiKey,
            SendGridFromEmail = sendGridFromEmail,
            SendGridFromName = sendGridFromName,
            JwtSigningKey = jwtSigningKey,
            AppBaseUrl = appBaseUrl.TrimEnd('/'),
            MagicLinkTtlMinutes = OptionalInt("MAGIC_LINK_TTL_MINUTES", 15),
            SessionTtlDays = OptionalInt("SESSION_TTL_DAYS", 30),
            ShareLinkTtlHours = OptionalInt("SHARE_LINK_TTL_HOURS", 12),
            DailyGenerationLimit = OptionalInt("DAILY_GENERATION_LIMIT", 10),
            UnlimitedEmails = unlimitedEmails
        };
    }
}
