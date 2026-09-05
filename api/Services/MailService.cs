using SendGrid;
using SendGrid.Helpers.Mail;

namespace Cocktail.Api.Services;

/// <summary>Sends the magic-link login email via SendGrid. See docs/IMPLEMENTATION_PLAN.md Phase 4.</summary>
public sealed class MailService
{
    private readonly AppConfig _config;
    private readonly ISendGridClient _client;

    public MailService(AppConfig config)
    {
        _config = config;
        _client = new SendGridClient(config.SendGridApiKey);
    }

    public async Task SendMagicLinkAsync(string toEmail, string magicLinkUrl, CancellationToken ct = default)
    {
        var from = new EmailAddress(_config.SendGridFromEmail, _config.SendGridFromName);
        var to = new EmailAddress(toEmail);
        const string subject = "Your Cocktail Momentum sign-in link";

        var plainText =
            $"""
             Sign in to Cocktail Momentum:

             {magicLinkUrl}

             This link expires in {_config.MagicLinkTtlMinutes} minutes and can only be used once.
             If you didn't request this, you can safely ignore this email.
             """;

        var html =
            $"""
             <p>Sign in to <strong>Cocktail Momentum</strong>:</p>
             <p><a href="{magicLinkUrl}">{magicLinkUrl}</a></p>
             <p style="color:#8a7d6e;font-size:0.85rem">
               This link expires in {_config.MagicLinkTtlMinutes} minutes and can only be used once.
               If you didn't request this, you can safely ignore this email.
             </p>
             """;

        var message = MailHelper.CreateSingleEmail(from, to, subject, plainText, html);
        var response = await _client.SendEmailAsync(message, ct);

        if ((int)response.StatusCode >= 300)
        {
            var body = await response.Body.ReadAsStringAsync(ct);
            throw new InvalidOperationException(
                $"SendGrid returned {(int)response.StatusCode} sending the magic link: {body}");
        }
    }
}
