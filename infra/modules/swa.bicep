// Azure Static Web App, Standard plan (needed for bring-your-own-Functions headroom
// later, per docs/IMPLEMENTATION_PLAN.md §0.2), running MANAGED functions.
// App settings here are the complete list from docs/IMPLEMENTATION_PLAN.md §6 / CLAUDE.md
// "Application settings" — keep both in sync with this file.
//
// No managed identity, no Key Vault references are available to managed functions
// (verified against Microsoft Learn, 2026-09), so every secret below is a plain
// application setting. @secure() on the params keeps them out of deployment history.

param location string
param namePrefix string
param resourceToken string
param tags object = {}

param storageConnectionString string
@secure()
param appInsightsConnectionString string
@secure()
param openAiEndpoint string
@secure()
param openAiKey string
param openAiDeployment string

@secure()
param sendGridApiKey string
param sendGridFromEmail string
param sendGridFromName string

@secure()
param jwtSigningKey string

param magicLinkTtlMinutes int
param sessionTtlDays int
param shareLinkTtlHours int
param dailyGenerationLimit int
param unlimitedEmails string

resource staticSite 'Microsoft.Web/staticSites@2024-11-01' = {
  name: take('${namePrefix}-swa-${resourceToken}', 40)
  location: location
  tags: tags
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
  }
}

// Every managed-function app setting the API reads at startup (AppConfig, Phase 3).
// APP_BASE_URL is self-referential — it reads the parent resource's own hostname, which
// ARM resolves correctly because this child resource deploys after the parent exists.
resource appSettings 'Microsoft.Web/staticSites/config@2022-09-01' = {
  parent: staticSite
  name: 'appsettings'
  properties: {
    STORAGE_CONNECTION_STRING: storageConnectionString
    APPLICATIONINSIGHTS_CONNECTION_STRING: appInsightsConnectionString
    AZURE_OPENAI_ENDPOINT: openAiEndpoint
    AZURE_OPENAI_KEY: openAiKey
    AZURE_OPENAI_DEPLOYMENT: openAiDeployment
    SENDGRID_API_KEY: sendGridApiKey
    SENDGRID_FROM_EMAIL: sendGridFromEmail
    SENDGRID_FROM_NAME: sendGridFromName
    JWT_SIGNING_KEY: jwtSigningKey
    APP_BASE_URL: 'https://${staticSite.properties.defaultHostname}'
    MAGIC_LINK_TTL_MINUTES: string(magicLinkTtlMinutes)
    SESSION_TTL_DAYS: string(sessionTtlDays)
    SHARE_LINK_TTL_HOURS: string(shareLinkTtlHours)
    DAILY_GENERATION_LIMIT: string(dailyGenerationLimit)
    UNLIMITED_EMAILS: unlimitedEmails
  }
}

output name string = staticSite.name
output defaultHostname string = staticSite.properties.defaultHostname
