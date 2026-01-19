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
 * Algorand Network Credentials
 *
 * Supports multiple networks and API providers:
 * - Mainnet, Testnet, Betanet, Custom
 * - AlgoNode, PureStake, Custom endpoints
 */
export class AlgorandNetwork implements ICredentialType {
  name = 'algorandNetwork';
  displayName = 'Algorand Network';
  documentationUrl = 'https://developer.algorand.org/docs/';

  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      options: [
        {
          name: 'Mainnet',
          value: 'mainnet',
          description: 'Algorand production network',
        },
        {
          name: 'Testnet',
          value: 'testnet',
          description: 'Algorand test network for development',
        },
        {
          name: 'Betanet',
          value: 'betanet',
          description: 'Algorand beta network for testing new features',
        },
        {
          name: 'Custom',
          value: 'custom',
          description: 'Custom network (Sandbox/Private)',
        },
      ],
      default: 'testnet',
      description: 'The Algorand network to connect to',
    },
    {
      displayName: 'API Provider',
      name: 'apiProvider',
      type: 'options',
      options: [
        {
          name: 'AlgoNode (Free)',
          value: 'algonode',
          description: 'Free public API provided by AlgoNode',
        },
        {
          name: 'PureStake',
          value: 'purestake',
          description: 'PureStake API (requires API key)',
        },
        {
          name: 'Custom Endpoint',
          value: 'custom',
          description: 'Custom Algod endpoint',
        },
      ],
      default: 'algonode',
      description: 'The API provider for Algod connections',
    },
    {
      displayName: 'Algod URL',
      name: 'algodUrl',
      type: 'string',
      default: '',
      placeholder: 'https://mainnet-api.algonode.cloud',
      description: 'The Algod node URL',
      displayOptions: {
        show: {
          apiProvider: ['custom'],
        },
      },
    },
    {
      displayName: 'Algod Token',
      name: 'algodToken',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'The Algod API token/key',
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
    {
      displayName: 'Indexer URL',
      name: 'indexerUrl',
      type: 'string',
      default: '',
      placeholder: 'https://mainnet-idx.algonode.cloud',
      description: 'The Indexer URL for querying historical data',
      displayOptions: {
        show: {
          apiProvider: ['custom'],
        },
      },
    },
    {
      displayName: 'Indexer Token',
      name: 'indexerToken',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'The Indexer API token',
      displayOptions: {
        show: {
          apiProvider: ['custom'],
        },
      },
    },
    {
      displayName: 'Mnemonic (25 Words)',
      name: 'mnemonic',
      type: 'string',
      typeOptions: {
        password: true,
        rows: 3,
      },
      default: '',
      description: 'The 25-word mnemonic phrase for signing transactions',
      hint: 'Space-separated 25-word recovery phrase',
    },
    {
      displayName: 'Use KMD (Key Management Daemon)',
      name: 'useKmd',
      type: 'boolean',
      default: false,
      description: 'Whether to use KMD for wallet management',
    },
    {
      displayName: 'KMD URL',
      name: 'kmdUrl',
      type: 'string',
      default: 'http://localhost:4002',
      description: 'The KMD endpoint URL',
      displayOptions: {
        show: {
          useKmd: [true],
        },
      },
    },
    {
      displayName: 'KMD Token',
      name: 'kmdToken',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'The KMD API token',
      displayOptions: {
        show: {
          useKmd: [true],
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
        '={{$credentials.apiProvider === "algonode" ? ($credentials.network === "mainnet" ? "https://mainnet-api.algonode.cloud" : $credentials.network === "testnet" ? "https://testnet-api.algonode.cloud" : "https://betanet-api.algonode.cloud") : $credentials.apiProvider === "purestake" ? ($credentials.network === "mainnet" ? "https://mainnet-algorand.api.purestake.io/ps2" : "https://testnet-algorand.api.purestake.io/ps2") : $credentials.algodUrl}}',
      url: '/v2/status',
      headers: {
        'X-API-Key': '={{$credentials.apiProvider === "purestake" ? $credentials.purestakeApiKey : ""}}',
      },
    },
  };
}
