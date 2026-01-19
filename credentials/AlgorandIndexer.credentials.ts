/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

/**
 * Algorand Indexer Credentials
 *
 * For read-only access to Algorand historical data via Indexer API.
 */
export class AlgorandIndexer implements ICredentialType {
  name = 'algorandIndexer';
  displayName = 'Algorand Indexer';
  documentationUrl = 'https://developer.algorand.org/docs/rest-apis/indexer/';

  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      options: [
        {
          name: 'Mainnet',
          value: 'mainnet',
          description: 'Algorand mainnet indexer',
        },
        {
          name: 'Testnet',
          value: 'testnet',
          description: 'Algorand testnet indexer',
        },
        {
          name: 'Betanet',
          value: 'betanet',
          description: 'Algorand betanet indexer',
        },
        {
          name: 'Custom',
          value: 'custom',
          description: 'Custom indexer endpoint',
        },
      ],
      default: 'testnet',
      description: 'The network indexer to connect to',
    },
    {
      displayName: 'API Provider',
      name: 'apiProvider',
      type: 'options',
      options: [
        {
          name: 'AlgoNode (Free)',
          value: 'algonode',
          description: 'Free public indexer by AlgoNode',
        },
        {
          name: 'PureStake',
          value: 'purestake',
          description: 'PureStake indexer (requires API key)',
        },
        {
          name: 'Custom Endpoint',
          value: 'custom',
          description: 'Custom indexer endpoint',
        },
      ],
      default: 'algonode',
      description: 'The indexer API provider',
    },
    {
      displayName: 'Indexer URL',
      name: 'indexerUrl',
      type: 'string',
      default: '',
      placeholder: 'https://mainnet-idx.algonode.cloud',
      description: 'The custom indexer URL',
      displayOptions: {
        show: {
          apiProvider: ['custom'],
        },
      },
    },
    {
      displayName: 'API Token',
      name: 'apiToken',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'The indexer API token',
      displayOptions: {
        show: {
          apiProvider: ['custom', 'purestake'],
        },
      },
    },
    {
      displayName: 'PureStake API Key',
      name: 'purestakeApiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Your PureStake API key',
      displayOptions: {
        show: {
          apiProvider: ['purestake'],
        },
      },
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL:
        '={{$credentials.apiProvider === "algonode" ? ($credentials.network === "mainnet" ? "https://mainnet-idx.algonode.cloud" : $credentials.network === "testnet" ? "https://testnet-idx.algonode.cloud" : "https://betanet-idx.algonode.cloud") : $credentials.apiProvider === "purestake" ? ($credentials.network === "mainnet" ? "https://mainnet-algorand.api.purestake.io/idx2" : "https://testnet-algorand.api.purestake.io/idx2") : $credentials.indexerUrl}}',
      url: '/health',
      headers: {
        'X-API-Key': '={{$credentials.apiProvider === "purestake" ? $credentials.purestakeApiKey : ""}}',
      },
    },
  };
}
