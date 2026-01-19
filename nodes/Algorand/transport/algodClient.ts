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
 * Algorand Algod Client Factory
 */

export interface AlgodClientConfig {
  url: string;
  token: string | { 'X-API-Key': string };
  port?: string | number;
}

/**
 * Get Algod client configuration from credentials
 */
export function getAlgodConfig(credentials: Record<string, unknown>): AlgodClientConfig {
  const network = credentials.network as string;
  const apiProvider = credentials.apiProvider as string;

  if (apiProvider === 'algonode') {
    const config = ALGONODE_NETWORKS[network] || ALGONODE_NETWORKS.mainnet;
    return {
      url: config.algodUrl,
      token: '',
    };
  }

  if (apiProvider === 'purestake') {
    const config = PURESTAKE_NETWORKS[network] || PURESTAKE_NETWORKS.mainnet;
    const apiKey = credentials.purestakeApiKey as string;
    return {
      url: config.algodUrl,
      token: { 'X-API-Key': apiKey },
    };
  }

  if (apiProvider === 'custom') {
    const url = credentials.algodUrl as string;
    const token = (credentials.algodToken as string) || '';

    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      return {
        url: url || SANDBOX_CONFIG.algodUrl,
        token: token || 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      };
    }

    return { url, token };
  }

  return {
    url: ALGONODE_NETWORKS.mainnet.algodUrl,
    token: '',
  };
}

/**
 * Create Algod client instance
 */
export function createAlgodClient(config: AlgodClientConfig): algosdk.Algodv2 {
  return new algosdk.Algodv2(config.token, config.url, config.port || '');
}

/**
 * Get Algod client from n8n context
 */
export async function getAlgodClient(
  context: IExecuteFunctions | ILoadOptionsFunctions,
  credentialName = 'algorandNetwork',
): Promise<algosdk.Algodv2> {
  const credentials = await context.getCredentials(credentialName);
  const config = getAlgodConfig(credentials as Record<string, unknown>);
  return createAlgodClient(config);
}

/**
 * Get account from mnemonic in credentials
 */
export async function getSigningAccount(
  context: IExecuteFunctions | ILoadOptionsFunctions,
  credentialName = 'algorandNetwork',
): Promise<algosdk.Account> {
  const credentials = await context.getCredentials(credentialName);
  const mnemonic = credentials.mnemonic as string;

  if (!mnemonic) {
    throw new Error('No mnemonic configured. A mnemonic is required to sign transactions.');
  }

  try {
    return algosdk.mnemonicToSecretKey(mnemonic.trim());
  } catch (error) {
    throw new Error(`Invalid mnemonic: ${(error as Error).message}`);
  }
}

/**
 * Get suggested transaction parameters
 */
export async function getSuggestedParams(client: algosdk.Algodv2): Promise<algosdk.SuggestedParams> {
  return client.getTransactionParams().do();
}

/**
 * Wait for transaction confirmation
 */
export async function waitForConfirmation(
  client: algosdk.Algodv2,
  txId: string,
  timeout = 4,
): Promise<Record<string, unknown>> {
  const result = await algosdk.waitForConfirmation(client, txId, timeout);
  return result as unknown as Record<string, unknown>;
}

/**
 * Get current round number
 */
export async function getCurrentRound(client: algosdk.Algodv2): Promise<number> {
  const status = await client.status().do();
  return Number(status['last-round']);
}

/**
 * Compile TEAL source code
 */
export async function compileTeal(
  client: algosdk.Algodv2,
  source: string,
): Promise<{ hash: string; result: Uint8Array }> {
  const compileResponse = await client.compile(source).do();
  return {
    hash: compileResponse.hash,
    result: new Uint8Array(Buffer.from(compileResponse.result, 'base64')),
  };
}

/**
 * Get node status
 */
export async function getNodeStatus(client: algosdk.Algodv2): Promise<Record<string, unknown>> {
  const status = await client.status().do();
  return status as Record<string, unknown>;
}
