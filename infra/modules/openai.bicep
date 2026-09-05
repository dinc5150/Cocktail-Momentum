// Azure AI Foundry → Azure OpenAI account with a single gpt-5-nano deployment.
// gpt-5-nano (2025-08-07) is confirmed available as a Global Standard deployment in
// australiaeast (verified against Microsoft Learn region-availability tables, 2026-09) —
// it is NOT offered as a Standard/Regional deployment in this region, so the sku below
// must stay 'GlobalStandard'.

param location string
param namePrefix string
param resourceToken string
param tags object = {}

param modelName string = 'gpt-5-nano'
param modelVersion string = '2025-08-07'
param modelCapacity int = 50

var accountName = take('${namePrefix}-oai-${resourceToken}', 64)

resource account 'Microsoft.CognitiveServices/accounts@2024-10-01' = {
  name: accountName
  location: location
  tags: tags
  kind: 'OpenAI'
  sku: {
    name: 'S0'
  }
  properties: {
    customSubDomainName: accountName
    publicNetworkAccess: 'Enabled'
    disableLocalAuth: false
  }
}

resource deployment 'Microsoft.CognitiveServices/accounts/deployments@2024-10-01' = {
  parent: account
  name: modelName
  sku: {
    name: 'GlobalStandard'
    capacity: modelCapacity
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: modelName
      version: modelVersion
    }
  }
}

output name string = account.name
output endpoint string = account.properties.endpoint
#disable-next-line outputs-should-not-contain-secrets -- managed functions have no managed identity; a key is the only supported auth path (see CLAUDE.md "Hard platform constraints" #3)
output key string = account.listKeys().key1
