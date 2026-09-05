using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Cocktail.Api.Models;

/// <summary>The wire shape for every error response: <c>{ "error": { "code", "message" } }</c>.</summary>
public sealed record ApiErrorBody(ApiError Error);

public sealed record ApiError(string Code, string Message);

/// <summary>Canonical error codes. Keep in sync with CLAUDE.md "API (C#)" conventions.</summary>
public static class ApiErrorCodes
{
    public const string Unauthorized = "unauthorized";
    public const string Forbidden = "forbidden";
    public const string NotFound = "not_found";
    public const string InvalidRequest = "invalid_request";
    public const string RateLimited = "rate_limited";
    public const string QuotaExceeded = "quota_exceeded";
    public const string AiUnavailable = "ai_unavailable";
    public const string AiTimeout = "ai_timeout";
    public const string Internal = "internal";
}

/// <summary>
/// Shortcuts for the standard error shape so every endpoint returns the same body.
/// Never hand-build an error response outside of these.
/// </summary>
public static class ApiResults
{
    public static ObjectResult Error(int statusCode, string code, string message) =>
        new(new ApiErrorBody(new ApiError(code, message))) { StatusCode = statusCode };

    public static ObjectResult Accepted(object body) =>
        new(body) { StatusCode = StatusCodes.Status202Accepted };

    public static ObjectResult Unauthorized(string message = "Sign in required.") =>
        Error(StatusCodes.Status401Unauthorized, ApiErrorCodes.Unauthorized, message);

    public static ObjectResult Forbidden(string message = "Not allowed for this account.") =>
        Error(StatusCodes.Status403Forbidden, ApiErrorCodes.Forbidden, message);

    public static ObjectResult NotFound(string message = "Not found.") =>
        Error(StatusCodes.Status404NotFound, ApiErrorCodes.NotFound, message);

    public static ObjectResult InvalidRequest(string message) =>
        Error(StatusCodes.Status400BadRequest, ApiErrorCodes.InvalidRequest, message);

    public static ObjectResult RateLimited(string message) =>
        Error(StatusCodes.Status429TooManyRequests, ApiErrorCodes.RateLimited, message);

    public static ObjectResult QuotaExceeded(string message) =>
        Error(StatusCodes.Status429TooManyRequests, ApiErrorCodes.QuotaExceeded, message);

    public static ObjectResult AiUnavailable(string message = "The AI service is unavailable right now.") =>
        Error(StatusCodes.Status503ServiceUnavailable, ApiErrorCodes.AiUnavailable, message);

    public static ObjectResult AiTimeout(string message = "That took too long — try a simpler request.") =>
        Error(StatusCodes.Status504GatewayTimeout, ApiErrorCodes.AiTimeout, message);

    public static ObjectResult Internal(string message = "Something went wrong.") =>
        Error(StatusCodes.Status500InternalServerError, ApiErrorCodes.Internal, message);
}
