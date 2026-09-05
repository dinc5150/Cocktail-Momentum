// Storage account + the seven Table Storage tables from docs/IMPLEMENTATION_PLAN.md §3.
// Standard_LRS, TLS 1.2 minimum, no public blob access — this account only ever serves
// Table Storage to the API via a connection string (managed functions have no managed
// identity, so a key-based connection string is the only option here).

param location string
param namePrefix string
param resourceToken string
param tags object = {}

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: take('${namePrefix}st${resourceToken}', 24)
  location: location
  tags: tags
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    supportsHttpsTrafficOnly: true
    accessTier: 'Hot'
  }
}

resource tableService 'Microsoft.Storage/storageAccounts/tableServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
}

// One table per docs/IMPLEMENTATION_PLAN.md §3. Keep this list and that section in sync.
var tableNames = [
  'Users'
  'UserIndex'
  'Pantry'
  'Favourites'
  'LoginTokens'
  'ShareLinks'
  'RateLimit'
]

resource tables 'Microsoft.Storage/storageAccounts/tableServices/tables@2023-05-01' = [for name in tableNames: {
  parent: tableService
  name: name
}]

output accountName string = storageAccount.name
#disable-next-line outputs-should-not-contain-secrets -- managed functions have no managed identity; a key-based connection string is the only supported option (see CLAUDE.md "Hard platform constraints" #3)
output connectionString string = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
