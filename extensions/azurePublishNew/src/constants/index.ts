// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-reference-regions
export const LuisAuthoringSupportLocation = ['westus', 'australiaeast', 'westeurope'];

export const LuisPublishSupportLocation = {
  australiaeast: ['australiaeast'],
  westeurope: ['francecentral', 'northeurope', 'westeurope', 'uksouth'],
  westus: [
    'southafricanorth',
    'centralindia',
    'eastasia',
    'japaneast',
    'japanwest',
    'koreacentral',
    'southeastasia',
    'canadacentral',
    'centralus',
    'eastus',
    'eastus2',
    'northcentralus',
    'southcentralus',
    'westcentralus',
    'westus',
    'westus2',
    'brazilsouth',
  ],
};

export const AzureAPIStatus = {
  INFO: 'INFO',
  PARAM_ERROR: 'PARAM_ERROR',
  ERROR: 'ERROR',
};

export const AzureResourceTypes = {
  APP_REGISTRATION: 'appRegistration',
  BOT_REGISTRATION: 'botRegistration',
  WEBAPP: 'webApp',
  AZUREFUNCTIONS: 'azureFunctions',
  COSMOSDB: 'cosmosDb',
  APPINSIGHTS: 'applicationInsights',
  LUIS_AUTHORING: 'luisAuthoring',
  LUIS_PREDICTION: 'luisPrediction',
  BLOBSTORAGE: 'blobStorage',
  QNA: 'qna',
  SERVICE_PLAN: 'servicePlan',
};

export const AzureResourceProviderType = {
  QnA: 'Microsoft.CognitiveServices',
  Luis: 'Microsoft.CognitiveServices',
  CosmosDB: 'Microsoft.DocumentDB',
  BlobStorage: 'Microsoft.Storage',
  ApplicationInsights: 'Microsoft.Insights',
  WebApp: 'Microsoft.Web',
  Bot: 'Microsoft.BotService',
};

export const authConfig = {
  arm: {
    // for web login
    scopes: ['https://management.core.windows.net/user_impersonation'],
    // for electron
    targetResource: 'https://management.core.windows.net/',
  },
  graph: {
    // for web login
    scopes: ['https://graph.microsoft.com/Application.ReadWrite.All'],
    // for electron
    targetResource: 'https://graph.microsoft.com/',
  },
};
