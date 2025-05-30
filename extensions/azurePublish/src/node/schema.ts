// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema7 } from '@botframework-composer/types';

const schema: JSONSchema7 = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'name',
    },
    environment: {
      type: 'string',
      title: 'Environment',
    },
    tenantId: {
      type: 'string',
      title: 'Tenant Id',
      description: 'The tenant id of Azure account.',
    },
    hostname: {
      type: 'string',
      title: 'Custom webapp hostname (if not <name>-<env>)',
    },
    luisResource: {
      type: 'string',
      title: 'Custom luis resource name (if not <name>-<env>-luis)',
    },
    language: {
      type: 'string',
      title: 'Language for luis - default to en-us',
    },
    runtimeIdentifier: {
      type: 'string',
      title:
        'Runtime identifier for hosting bot, default to win-x64, please refer to https://docs.microsoft.com/en-us/dotnet/core/rid-catalog',
    },
    botName: {
      type: 'string',
      title: 'Name of your bot channel registration service',
    },
    resourceGroup: {
      type: 'string',
      title: 'the name of your resource group',
    },
    subscriptionId: {
      type: 'string',
      title: 'the id of your subscription',
    },
    region: {
      type: 'string',
      title: 'region of your resource group',
    },
    appServiceOperatingSystem: {
      type: 'string',
      title: "The operating system for the App Service. 'windows' or 'linux'.",
    },
    scmHostDomain: {
      type: 'string',
      title: "An optional host domain for SCM deployment URLs. Defaults to 'scm.azurewebsites.net'.",
    },
    settings: {
      type: 'object',
      title: 'Settings for Azure resources',
      properties: {
        applicationInsights: {
          type: 'object',
          properties: {
            InstrumentationKey: {
              type: 'string',
            },
            connectionString: {
              type: 'string',
            },
          },
        },
        cosmosDb: {
          type: 'object',
          properties: {
            cosmosDBEndpoint: {
              type: 'string',
            },
            authKey: {
              type: 'string',
            },
            databaseId: {
              type: 'string',
            },
            containerId: {
              type: 'string',
            },
          },
          required: ['cosmosDBEndpoint', 'authKey', 'databaseId', 'containerId'],
        },
        blobStorage: {
          type: 'object',
          properties: {
            connectionString: {
              type: 'string',
            },
            container: {
              type: 'string',
            },
          },
          required: ['connectionString', 'container'],
        },
        luis: {
          type: 'object',
          properties: {
            endpoint: {
              type: 'string',
            },
            authoringEndpoint: {
              type: 'string',
            },
            endpointKey: {
              type: 'string',
            },
            authoringKey: {
              type: 'string',
            },
            region: {
              type: 'string',
            },
          },
          required: ['endpointKey', 'authoringKey', 'region'],
        },
        qna: {
          type: 'object',
          properties: {
            subscriptionKey: {
              type: 'string',
            },
            endpoint: {
              type: 'string',
            },
          },
          required: ['subscriptionKey', 'endpoint'],
        },
        MicrosoftAppId: {
          type: 'string',
        },
        MicrosoftAppPassword: {
          type: 'string',
        },
      },
      required: ['MicrosoftAppId', 'MicrosoftAppPassword'],
    },
  },
  required: ['subscriptionId', 'name', 'settings', 'accessToken'],
  default: {
    name: '<unique name in your subscription>',
    environment: 'dev',
    tenantId: '<tenant id of your azure account>',
    hostname: '<web application host name>',
    runtimeIdentifier: 'win-x64',
    resourceGroup: '<name of your resource group>',
    botName: '<name of your bot channel registration>',
    subscriptionId: '<id of your subscription>',
    region: '<region of your resource group>',
    appServiceOperatingSystem: 'windows',
    scmHostDomain: '',
    luisResource: '<name of your luis resource>',
    settings: {
      applicationInsights: {
        InstrumentationKey: '<Instrumentation Key>',
        connectionString: '<connection string>',
      },
      cosmosDb: {
        cosmosDBEndpoint: '<endpoint url>',
        authKey: '<auth key>',
        databaseId: 'botstate-db',
        containerId: 'botstate-container',
      },
      blobStorage: {
        connectionString: '<connection string>',
        container: '<container>',
      },
      luis: {
        authoringKey: '',
        authoringEndpoint: '',
        endpointKey: '',
        endpoint: '',
        region: 'westus',
      },
      qna: {
        subscriptionKey: '<subscription key>',
        endpoint: '<endpoint>',
      },
      MicrosoftAppId: '<app id from Bot Framework registration>',
      MicrosoftAppPassword: '<app password from Bot Framework registration>',
    },
  },
};
export default schema;
