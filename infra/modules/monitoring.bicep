// Application Insights, workspace-based (the only kind Azure still provisions — classic
// App Insights is retired). This is the sole way to see managed-function logs on a
// Standard-plan SWA (no direct log streaming for managed functions), per
// docs/IMPLEMENTATION_PLAN.md Phase 15. Wired into the API via
// APPLICATIONINSIGHTS_CONNECTION_STRING, which
// Microsoft.Azure.Functions.Worker.ApplicationInsights (already registered in
// api/Program.cs) reads on its own — no AppConfig change needed, and its absence in local
// dev is a silent no-op, not a startup failure.

param location string
param namePrefix string
param resourceToken string
param tags object = {}

resource workspace 'Microsoft.OperationalInsights/workspaces@2025-02-01' = {
  name: take('${namePrefix}-log-${resourceToken}', 63)
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    // Managed-function logs only — no PII, no request bodies. Keep the cheapest tier's
    // default retention rather than paying for a longer window nothing here needs.
    retentionInDays: 30
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: take('${namePrefix}-appi-${resourceToken}', 260)
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: workspace.id
  }
}

output connectionString string = appInsights.properties.ConnectionString
