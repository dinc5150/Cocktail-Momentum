using System.Text.Json;
using Cocktail.Api.Models;
using Cocktail.Api.Security;
using Cocktail.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;

namespace Cocktail.Api.Functions;

public sealed class PantryFunctions(CallerContext caller, PantryService pantry, PantrySeedCatalog seedCatalog)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    [Function("PantryList")]
    public async Task<IActionResult> List(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "pantry")] HttpRequest req,
        CancellationToken ct)
    {
        caller.Resolve(req);
        var authError = caller.RequireAnyCaller();
        if (authError is not null) return authError;

        // A guest reads the OWNER's pantry — in-stock items only, ToOrder never exposed.
        // See CLAUDE.md "Security".
        var pantryOwnerId = caller.IsGuest ? caller.OwnerUserId! : caller.UserId!;
        var items = await pantry.ListAsync(pantryOwnerId, ct);

        if (caller.IsGuest)
        {
            var visible = items
                .Where(i => i.InStock)
                .Select(i => new { id = i.RowKey, name = i.Name, category = i.Category, inStock = i.InStock });
            return new OkObjectResult(visible);
        }

        return new OkObjectResult(items.Select(PantryItemResponse.From));
    }

    [Function("PantryCreate")]
    public async Task<IActionResult> Create(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "pantry")] HttpRequest req,
        CancellationToken ct)
    {
        caller.Resolve(req);
        var authError = caller.RequireUser();
        if (authError is not null) return authError;
        if (!CookieWriter.ValidateXsrf(req)) return ApiResults.Forbidden("Missing or invalid CSRF token.");

        var body = await JsonSerializer.DeserializeAsync<CreatePantryItemRequest>(req.Body, JsonOptions, ct);
        var name = body?.Name?.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            return ApiResults.InvalidRequest("name is required.");
        }
        var category = string.IsNullOrWhiteSpace(body?.Category) ? "Other" : body!.Category!.Trim();

        var (created, existing) = await pantry.CreateAsync(caller.UserId!, name, category, ct);
        if (existing is not null)
        {
            return new ObjectResult(PantryItemResponse.From(existing)) { StatusCode = StatusCodes.Status409Conflict };
        }

        return new ObjectResult(PantryItemResponse.From(created!)) { StatusCode = StatusCodes.Status201Created };
    }

    [Function("PantryUpdate")]
    public async Task<IActionResult> Update(
        [HttpTrigger(AuthorizationLevel.Anonymous, "patch", Route = "pantry/{id}")] HttpRequest req,
        string id,
        CancellationToken ct)
    {
        caller.Resolve(req);
        var authError = caller.RequireUser();
        if (authError is not null) return authError;
        if (!CookieWriter.ValidateXsrf(req)) return ApiResults.Forbidden("Missing or invalid CSRF token.");

        var item = await pantry.GetAsync(caller.UserId!, id, ct);
        if (item is null) return ApiResults.NotFound("No pantry item with that id.");

        var body = await JsonSerializer.DeserializeAsync<UpdatePantryItemRequest>(req.Body, JsonOptions, ct);
        var updated = await pantry.UpdateAsync(item, body?.Name, body?.InStock, body?.ToOrder, ct);
        return new OkObjectResult(PantryItemResponse.From(updated));
    }

    [Function("PantryDelete")]
    public async Task<IActionResult> Delete(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "pantry/{id}")] HttpRequest req,
        string id,
        CancellationToken ct)
    {
        caller.Resolve(req);
        var authError = caller.RequireUser();
        if (authError is not null) return authError;
        if (!CookieWriter.ValidateXsrf(req)) return ApiResults.Forbidden("Missing or invalid CSRF token.");

        var item = await pantry.GetAsync(caller.UserId!, id, ct);
        if (item is null) return ApiResults.NotFound("No pantry item with that id.");

        await pantry.DeleteAsync(caller.UserId!, id, ct);
        return new NoContentResult();
    }

    [Function("PantrySeed")]
    public async Task<IActionResult> Seed(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "pantry/seed")] HttpRequest req,
        CancellationToken ct)
    {
        caller.Resolve(req);
        var authError = caller.RequireUser();
        if (authError is not null) return authError;
        if (!CookieWriter.ValidateXsrf(req)) return ApiResults.Forbidden("Missing or invalid CSRF token.");

        var body = await JsonSerializer.DeserializeAsync<SeedPantryRequest>(req.Body, JsonOptions, ct);
        if (body?.Mode is not ("onboarding" or "examples"))
        {
            return ApiResults.InvalidRequest("mode must be \"onboarding\" or \"examples\".");
        }

        var addedCount = await pantry.SeedAsync(caller.UserId!, seedCatalog.Items, ct);
        return new OkObjectResult(new { added = addedCount });
    }
}
