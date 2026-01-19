/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import algosdk from 'algosdk';
import { ALGONODE_NETWORKS, PURESTAKE_NETWORKS, SANDBOX_CONFIG } from '../constants/networks';

/**
 * Algorand Indexer Client Factory
 */

export interface IndexerClientConfig {
  url: string;
  token: string | { 'X-API-Key': string };
  port?: string | number;
}

/**
 * Get Indexer client configuration from credentials
 */
export function getIndexerConfig(credentials: Record<string, unknown>): IndexerClientConfig {
  const network = credentials.network as string;
  const apiProvider = credentials.apiProvider as string;

  if (apiProvider === 'algonode') {
    const config = ALGONODE_NETWORKS[network] || ALGONODE_NETWORKS.mainnet;
    return {
      url: config.indexerUrl,
      token: '',
    };
  }

  if (apiProvider === 'purestake') {
    const config = PURESTAKE_NETWORKS[network] || PURESTAKE_NETWORKS.mainnet;
    const apiKey = credentials.purestakeApiKey as string;
    return {
      url: config.indexerUrl,
      token: { 'X-API-Key': apiKey },
    };
  }

  if (apiProvider === 'custom') {
    const url = credentials.indexerUrl as string;
    const token = (credentials.indexerToken as string) || '';

    if (url && (url.includes('localhost') || url.includes('127.0.0.1'))) {
      return {
        url: url || SANDBOX_CONFIG.indexerUrl,
        token: token || '',
      };
    }

    return { url, token };
  }

  return {
    url: ALGONODE_NETWORKS.mainnet.indexerUrl,
    token: '',
  };
}

/**
 * Create Indexer client instance
 */
export function createIndexerClient(config: IndexerClientConfig): algosdk.Indexer {
  return new algosdk.Indexer(config.token, config.url, config.port || '');
}

/**
 * Get Indexer client from n8n context
 */
export async function getIndexerClient(
  context: IExecuteFunctions | ILoadOptionsFunctions,
  credentialName = 'algorandNetwork',
): Promise<algosdk.Indexer> {
  const credentials = await context.getCredentials(credentialName);
  const config = getIndexerConfig(credentials as Record<string, unknown>);
  return createIndexerClient(config);
}

/**
 * Search transactions with filters
 */
export interface TransactionSearchParams {
  address?: string;
  addressRole?: 'sender' | 'receiver' | 'freeze-target';
  assetId?: number;
  applicationId?: number;
  txType?: string;
  minRound?: number;
  maxRound?: number;
  afterTime?: string;
  beforeTime?: string;
  currencyGreaterThan?: number;
  currencyLessThan?: number;
  limit?: number;
  nextToken?: string;
}

/**
 * Build transaction search query
 */
export function buildTransactionSearch(
  indexer: algosdk.Indexer,
  params: TransactionSearchParams,
) {
  let search = indexer.searchForTransactions();

  if (params.address) {
    search = search.address(params.address);
    if (params.addressRole) {
      search = search.addressRole(params.addressRole);
    }
  }

  if (params.assetId) {
    search = search.assetID(params.assetId);
  }

  if (params.applicationId) {
    search = search.applicationID(params.applicationId);
  }

  if (params.txType) {
    search = search.txType(params.txType);
  }

  if (params.minRound) {
    search = search.minRound(params.minRound);
  }

  if (params.maxRound) {
    search = search.maxRound(params.maxRound);
  }

  if (params.afterTime) {
    search = search.afterTime(params.afterTime);
  }

  if (params.beforeTime) {
    search = search.beforeTime(params.beforeTime);
  }

  if (params.currencyGreaterThan !== undefined) {
    search = search.currencyGreaterThan(params.currencyGreaterThan);
  }

  if (params.currencyLessThan !== undefined) {
    search = search.currencyLessThan(params.currencyLessThan);
  }

  if (params.limit) {
    search = search.limit(params.limit);
  }

  if (params.nextToken) {
    search = search.nextToken(params.nextToken);
  }

  return search;
}

/**
 * Search accounts with filters
 */
export interface AccountSearchParams {
  assetId?: number;
  applicationId?: number;
  authAddr?: string;
  currencyGreaterThan?: number;
  currencyLessThan?: number;
  limit?: number;
  nextToken?: string;
}

/**
 * Build account search query
 */
export function buildAccountSearch(
  indexer: algosdk.Indexer,
  params: AccountSearchParams,
) {
  let search = indexer.searchAccounts();

  if (params.assetId) {
    search = search.assetID(params.assetId);
  }

  if (params.applicationId) {
    search = search.applicationID(params.applicationId);
  }

  if (params.authAddr) {
    search = search.authAddr(params.authAddr);
  }

  if (params.currencyGreaterThan !== undefined) {
    search = search.currencyGreaterThan(params.currencyGreaterThan);
  }

  if (params.currencyLessThan !== undefined) {
    search = search.currencyLessThan(params.currencyLessThan);
  }

  if (params.limit) {
    search = search.limit(params.limit);
  }

  if (params.nextToken) {
    search = search.nextToken(params.nextToken);
  }

  return search;
}
