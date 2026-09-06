using System.ClientModel;
using System.ClientModel.Primitives;
using System.Text.Json;
using Azure.AI.OpenAI;
using Cocktail.Api.Models;
using OpenAI.Chat;

namespace Cocktail.Api.Services;

public sealed class CocktailAiTimeoutException() : Exception("The AI call exceeded its time budget.");

public sealed class CocktailAiUnavailableException(string message, Exception? inner = null)
    : Exception(message, inner);

/// <summary>
/// Calls gpt-5-nano for cocktail suggestions.
///
/// gpt-5-nano is a reasoning model, needing <c>reasoning_effort</c> and
/// <c>max_completion_tokens</c> (not <c>max_tokens</c>) in the request. As of OpenAI SDK
/// 2.1.0 — the newest version Azure.AI.OpenAI has a STABLE release against; every newer
/// Azure.AI.OpenAI is beta-only (verified against NuGet, 2026-09) — the typed
/// ChatCompletionOptions has no ReasoningEffort property at all. Rather than fight an
/// incomplete typed surface or take a dependency on a beta package, this uses the SDK's
/// protocol-method overload (ChatClient.CompleteChatAsync(BinaryContent, RequestOptions))
/// and builds the request JSON by hand — the officially supported escape hatch for
/// exactly this situation, not a workaround. Revisit once Azure.AI.OpenAI ships a stable
/// release with ReasoningEffort in the typed options.
/// </summary>
public sealed class CocktailAi
{
    private readonly ChatClient _chatClient;

    private const int MaxCompletionTokens = 2500;

    // Stays under the platform's hard 45s request ceiling (CLAUDE.md "Hard platform
    // constraints") with margin for the rest of the handler — one call, no retries; a
    // retry cannot fit in the remaining budget.
    private static readonly TimeSpan CallBudget = TimeSpan.FromSeconds(40);

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public CocktailAi(AppConfig config)
    {
        var client = new AzureOpenAIClient(
            new Uri(config.AzureOpenAiEndpoint),
            new ApiKeyCredential(config.AzureOpenAiKey));
        _chatClient = client.GetChatClient(config.AzureOpenAiDeployment);
    }

    /// <summary>
    /// Returns the model's raw, unfiltered suggestions — the caller (CocktailFilter) is
    /// responsible for matching ingredients against the pantry and applying strictness.
    /// This method never trims or validates against pantry data; it only talks to the model.
    /// </summary>
    public async Task<RawCocktailSuggestions> GenerateAsync(
        string prompt,
        string strictness,
        IReadOnlyList<string> inStockNames,
        IReadOnlyList<string> outOfStockNames,
        CancellationToken callerCt)
    {
        using var budget = CancellationTokenSource.CreateLinkedTokenSource(callerCt);
        budget.CancelAfter(CallBudget);

        var requestBody = BuildRequestBody(prompt, strictness, inStockNames, outOfStockNames);
        var content = BinaryContent.Create(BinaryData.FromObjectAsJson(requestBody, JsonOptions));

        ClientResult result;
        try
        {
            result = await _chatClient.CompleteChatAsync(content, new RequestOptions { CancellationToken = budget.Token });
        }
        catch (OperationCanceledException) when (!callerCt.IsCancellationRequested)
        {
            // Our own budget tripped, not the caller's — that's a timeout, not a cancel.
            throw new CocktailAiTimeoutException();
        }
        catch (ClientResultException ex)
        {
            throw new CocktailAiUnavailableException($"Azure OpenAI returned status {ex.Status}.", ex);
        }
        catch (OperationCanceledException) when (callerCt.IsCancellationRequested)
        {
            // The caller's own request was cancelled (e.g. they navigated away) — let this
            // propagate as-is rather than reporting it as an AI failure.
            throw;
        }
        catch (Exception ex)
        {
            // A DNS failure, connection refused, TLS error, or any other transport-level
            // fault throws AggregateException/HttpRequestException here, NOT
            // ClientResultException — the SDK only wraps a response it actually got back
            // in ClientResultException. Missing this catch meant the function crashed
            // with an unhandled 500 and no JSON error body at all, rather than the clean
            // ai_unavailable response CocktailFunctions expects. Caught by actually
            // pointing this at an unreachable endpoint and watching it happen — a fake
            // key alone (still a reachable host) would not have surfaced this path.
            throw new CocktailAiUnavailableException("Could not reach Azure OpenAI.", ex);
        }

        var messageContent = ExtractMessageContent(result.GetRawResponse().Content);
        if (string.IsNullOrWhiteSpace(messageContent))
        {
            throw new CocktailAiUnavailableException("The model returned an empty response.");
        }

        try
        {
            return JsonSerializer.Deserialize<RawCocktailSuggestions>(messageContent, JsonOptions)
                ?? throw new CocktailAiUnavailableException("The model's response deserialized to null.");
        }
        catch (JsonException ex)
        {
            throw new CocktailAiUnavailableException("The model's response was not valid JSON.", ex);
        }
    }

    private static string? ExtractMessageContent(BinaryData rawResponse)
    {
        using var doc = JsonDocument.Parse(rawResponse);
        return doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();
    }

    private static object BuildRequestBody(
        string prompt, string strictness, IReadOnlyList<string> inStockNames, IReadOnlyList<string> outOfStockNames)
    {
        const string systemMessage =
            "You are an expert bartender. Suggest 3 to 5 cocktails using only the " +
            "ingredients the user says they have, unless told otherwise. If the user's " +
            "request names (or is) a specific, well-known cocktail — e.g. \"a Negroni\" or " +
            "\"gin and tonic\" — the first cocktail in your response must be that exact " +
            "classic, using its standard recipe adjusted only per the ingredient rules " +
            "below; fill any remaining slots with other cocktails that fit the request. " +
            "For each cocktail give: a short name, a description in exactly one sentence, " +
            "a list of ingredients with realistic measurements (millilitres, plus a common " +
            "bar unit such as a dash, splash, or wedge where natural), and numbered " +
            "step-by-step instructions. Only use ingredient names from the pantry list " +
            "provided — do not invent ingredients or brands not listed.";

        return new
        {
            messages = new object[]
            {
                new { role = "system", content = systemMessage },
                new { role = "user", content = BuildUserMessage(prompt, strictness, inStockNames, outOfStockNames) }
            },
            max_completion_tokens = MaxCompletionTokens,
            reasoning_effort = "low",
            response_format = new
            {
                type = "json_schema",
                json_schema = new
                {
                    name = "cocktail_suggestions",
                    strict = true,
                    schema = CocktailSchema.Schema
                }
            }
        };
    }

    private static string BuildUserMessage(
        string prompt, string strictness, IReadOnlyList<string> inStockNames, IReadOnlyList<string> outOfStockNames)
    {
        // The prompt is a hint to the model, not the enforcement mechanism — CocktailFilter
        // is what actually guarantees the strictness contract. See CLAUDE.md "AI".
        var strictnessInstruction = strictness switch
        {
            "strict" => "Use ONLY ingredients from the in-stock list below. Do not suggest anything requiring an ingredient not listed.",
            "nearly" => "Prefer the in-stock list below, but a cocktail may use up to 2 ingredients not on it.",
            _ => "Prefer the in-stock list below, but feel free to suggest cocktails needing other ingredients too."
        };

        var lines = new List<string>
        {
            $"Request: {prompt}",
            strictnessInstruction,
            string.Empty,
            "In-stock ingredients:",
            inStockNames.Count > 0 ? string.Join(", ", inStockNames) : "(none listed)"
        };

        if (strictness == "any" && outOfStockNames.Count > 0)
        {
            lines.Add(string.Empty);
            lines.Add("Also in the wider pantry, but currently out of stock:");
            lines.Add(string.Join(", ", outOfStockNames));
        }

        return string.Join('\n', lines);
    }
}
