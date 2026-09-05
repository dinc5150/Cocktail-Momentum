// Cocktail Momentum V2 — subscription-scope entry point.
// Provisions the resource group and wires the three modules together.
// Deployed with `azd provision` (or `az deployment sub create`). See CLAUDE.md.

targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the azd environment. Used to derive a short, deterministic resource-name suffix.')
param environmentName string

@minLength(1)
@description('Azure region for all resources. gpt-5-nano Global Standard is confirmed available in australiaeast (2026-09).')
param location string = 'australiaeast'

@minLength(3)
@maxLength(12)
@description('Lowercase alphanumeric prefix for resource names, e.g. "cktail".')
param namePrefix string = 'cktail'

@secure()
@description('SendGrid API key used to send magic-link emails.')
param sendGridApiKey string

@description('Verified SendGrid sender email address.')
param sendGridFromEmail string

@description('Display name used as the SendGrid sender.')
param sendGridFromName string = 'Cocktail Momentum'

@secure()
@description('HS256 signing key for session and share-link JWTs. Generate with: openssl rand -base64 32')
param jwtSigningKey string

@description('Minutes a magic-link login token remains valid.')
param magicLinkTtlMinutes int = 15

@description('Days a session cookie remains valid.')
param sessionTtlDays int = 30

@description('Hours a share link remains valid.')
param shareLinkTtlHours int = 12

@description('Generations allowed per user per rolling 24h before quota_exceeded. See docs/IMPLEMENTATION_PLAN.md Phase 6a.')
param dailyGenerationLimit int = 10

@description('Comma-separated, lowercase email addresses exempt from the daily generation quota.')
param unlimitedEmails string = ''

@description('Azure OpenAI model to deploy.')
param openAiModelName string = 'gpt-5-nano'

@description('Azure OpenAI model version.')
param openAiModelVersion string = '2025-08-07'

@description('Global Standard deployment capacity, in thousands of tokens per minute.')
param openAiModelCapacity int = 50

// Deterministic per-environment suffix so reruns of `azd provision` are idempotent.
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = {
  'azd-env-name': environmentName
}

resource rg 'Microsoft.Resources/resourceGroups@2024-11-01' = {
  name: '${namePrefix}-${environmentName}-rg'
  location: location
  tags: tags
}

module storage 'modules/storage.bicep' = {
  name: 'storage'
  scope: rg
  params: {
    location: location
    namePrefix: namePrefix
    resourceToken: resourceToken
    tags: tags
  }
}

module monitoring 'modules/monitoring.bicep' = {
  name: 'monitoring'
  scope: rg
  params: {
    location: location
    namePrefix: namePrefix
    resourceToken: resourceToken
    tags: tags
  }
}

module openai 'modules/openai.bicep' = {
  name: 'openai'
  scope: rg
  params: {
    location: location
    namePrefix: namePrefix
    resourceToken: resourceToken
    tags: tags
    modelName: openAiModelName
    modelVersion: openAiModelVersion
    modelCapacity: openAiModelCapacity
  }
}

module swa 'modules/swa.bicep' = {
  name: 'swa'
  scope: rg
  params: {
    location: location
    namePrefix: namePrefix
    resourceToken: resourceToken
    tags: tags
    storageConnectionString: storage.outputs.connectionString
    appInsightsConnectionString: monitoring.outputs.connectionString
    openAiEndpoint: openai.outputs.endpoint
    openAiKey: openai.outputs.key
    openAiDeployment: openAiModelName
    sendGridApiKey: sendGridApiKey
    sendGridFromEmail: sendGridFromEmail
    sendGridFromName: sendGridFromName
    jwtSigningKey: jwtSigningKey
    magicLinkTtlMinutes: magicLinkTtlMinutes
    sessionTtlDays: sessionTtlDays
    shareLinkTtlHours: shareLinkTtlHours
    dailyGenerationLimit: dailyGenerationLimit
    unlimitedEmails: unlimitedEmails
  }
}

output AZURE_LOCATION string = location
output AZURE_RESOURCE_GROUP string = rg.name
output SWA_NAME string = swa.outputs.name
output SWA_DEFAULT_HOSTNAME string = swa.outputs.defaultHostname
output STORAGE_ACCOUNT_NAME string = storage.outputs.accountName
output AZURE_OPENAI_ACCOUNT_NAME string = openai.outputs.name
output AZURE_OPENAI_ENDPOINT string = openai.outputs.endpoint
