/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import algosdk from 'algosdk';

/**
 * Algorand KMD (Key Management Daemon) Client
 * Used for wallet management in development/sandbox environments
 */

export interface KmdClientConfig {
  url: string;
  token: string;
}

/**
 * Get KMD client configuration from credentials
 */
export function getKmdConfig(credentials: Record<string, unknown>): KmdClientConfig | null {
  const useKmd = credentials.useKmd as boolean;

  if (!useKmd) {
    return null;
  }

  return {
    url: (credentials.kmdUrl as string) || 'http://localhost:4002',
    token:
      (credentials.kmdToken as string) ||
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  };
}

/**
 * Create KMD client instance
 */
export function createKmdClient(config: KmdClientConfig): algosdk.Kmd {
  return new algosdk.Kmd(config.token, config.url);
}

/**
 * Get KMD client from n8n context
 */
export async function getKmdClient(
  context: IExecuteFunctions | ILoadOptionsFunctions,
  credentialName = 'algorandNetwork',
): Promise<algosdk.Kmd | null> {
  const credentials = await context.getCredentials(credentialName);
  const config = getKmdConfig(credentials as Record<string, unknown>);

  if (!config) {
    return null;
  }

  return createKmdClient(config);
}

/**
 * Get wallet handle from KMD
 */
export async function getWalletHandle(
  kmd: algosdk.Kmd,
  walletName: string,
  walletPassword: string,
): Promise<string> {
  const wallets = await kmd.listWallets();
  const wallet = wallets.wallets.find((w: { name: string }) => w.name === walletName);

  if (!wallet) {
    throw new Error(`Wallet "${walletName}" not found`);
  }

  const initResponse = await kmd.initWalletHandle(wallet.id, walletPassword);
  return initResponse.wallet_handle_token;
}

/**
 * Release wallet handle
 */
export async function releaseWalletHandle(kmd: algosdk.Kmd, walletHandle: string): Promise<void> {
  await kmd.releaseWalletHandle(walletHandle);
}

/**
 * List addresses in wallet
 */
export async function listWalletAddresses(kmd: algosdk.Kmd, walletHandle: string): Promise<string[]> {
  const response = await kmd.listKeys(walletHandle);
  return response.addresses || [];
}

/**
 * Export key from wallet
 */
export async function exportKeyFromWallet(
  kmd: algosdk.Kmd,
  walletHandle: string,
  walletPassword: string,
  address: string,
): Promise<Uint8Array> {
  const response = await kmd.exportKey(walletHandle, walletPassword, address);
  return response.private_key;
}

/**
 * Sign transaction with KMD
 */
export async function signWithKmd(
  kmd: algosdk.Kmd,
  walletHandle: string,
  walletPassword: string,
  txn: algosdk.Transaction,
): Promise<Uint8Array> {
  const response = await kmd.signTransaction(walletHandle, walletPassword, txn);
  return response.signed_transaction;
}
