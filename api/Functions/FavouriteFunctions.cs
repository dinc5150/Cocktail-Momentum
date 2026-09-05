using System.Text.Json;
using Cocktail.Api.Models;
using Cocktail.Api.Security;
using Cocktail.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;

namespace Cocktail.Api.Functions;

public sealed class FavouriteFunctions(CallerContext caller, FavouriteService favourites)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    [Function("FavouritesList")]
    public async Task<IActionResult> List(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "favourites")] HttpRequest req,
        CancellationToken ct)
    {
        caller.Resolve(req);
        var authError = caller.RequireUser();
        if (authError is not null) return authError;

        var items = await favourites.ListAsync(caller.UserId!, ct);
        return new OkObjectResult(items.Select(FavouriteResponse.From));
    }

    [Function("FavouritesCreate")]
    public async Task<IActionResult> Create(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "favourites")] HttpRequest req,
        CancellationToken ct)
    {
        caller.Resolve(req);
        var authError = caller.RequireUser();
        if (authError is not null) return authError;
        if (!CookieWriter.ValidateXsrf(req)) return ApiResults.Forbidden("Missing or invalid CSRF token.");

        var body = await JsonSerializer.DeserializeAsync<SaveFavouriteRequest>(req.Body, JsonOptions, ct);
        if (string.IsNullOrWhiteSpace(body?.Name) ||
            body.Ingredients is not { Count: > 0 } ||
            body.Steps is not { Count: > 0 })
        {
            return ApiResults.InvalidRequest("name, at least one ingredient, and at least one step are required.");
        }

        var ingredientsJson = JsonSerializer.Serialize(body.Ingredients, JsonOptions);
        var stepsJson = JsonSerializer.Serialize(body.Steps, JsonOptions);

        var (created, error) = await favourites.CreateAsync(
            caller.UserId!, body.Name.Trim(), body.Description?.Trim() ?? string.Empty,
            ingredientsJson, stepsJson, body.SourcePrompt, ct);

        if (error is not null)
        {
            return ApiResults.InvalidRequest(error);
        }

        return new ObjectResult(FavouriteResponse.From(created!)) { StatusCode = StatusCodes.Status201Created };
    }

    [Function("FavouritesDelete")]
    public async Task<IActionResult> Delete(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "favourites/{id}")] HttpRequest req,
        string id,
        CancellationToken ct)
    {
        caller.Resolve(req);
        var authError = caller.RequireUser();
        if (authError is not null) return authError;
        if (!CookieWriter.ValidateXsrf(req)) return ApiResults.Forbidden("Missing or invalid CSRF token.");

        await favourites.DeleteAsync(caller.UserId!, id, ct);
        return new NoContentResult();
    }
}
