/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import algosdk from 'algosdk';
import {
  MICROALGOS_PER_ALGO,
  MIN_BALANCE,
  MIN_BALANCE_PER_ASSET,
  MIN_BALANCE_PER_APP,
  MIN_BALANCE_PER_APP_UINT,
  MIN_BALANCE_PER_APP_BYTESLICE,
  MIN_BALANCE_PER_BOX,
  MIN_BALANCE_PER_BOX_BYTE,
} from '../constants/networks';

/**
 * Convert ALGO to microAlgos
 */
export function algoToMicroAlgo(algo: number): number {
  return Math.round(algo * MICROALGOS_PER_ALGO);
}

/**
 * Convert microAlgos to ALGO
 */
export function microAlgoToAlgo(microAlgo: number): number {
  return microAlgo / MICROALGOS_PER_ALGO;
}

/**
 * Format microAlgos as ALGO string
 */
export function formatAlgo(microAlgo: number, decimals = 6): string {
  const algo = microAlgoToAlgo(microAlgo);
  return algo.toFixed(decimals);
}

/**
 * Validate Algorand address
 */
export function isValidAddress(address: string): boolean {
  return algosdk.isValidAddress(address);
}

/**
 * Encode address to bytes
 */
export function addressToBytes(address: string): Uint8Array {
  return algosdk.decodeAddress(address).publicKey;
}

/**
 * Decode bytes to address
 */
export function bytesToAddress(bytes: Uint8Array): string {
  return algosdk.encodeAddress(bytes);
}

/**
 * Generate new Algorand account
 */
export function generateAccount(): { address: string; mnemonic: string; secretKey: Uint8Array } {
  const account = algosdk.generateAccount();
  const mnemonic = algosdk.secretKeyToMnemonic(account.sk);
  return {
    address: account.addr,
    mnemonic,
    secretKey: account.sk,
  };
}

/**
 * Recover account from mnemonic
 */
export function recoverAccount(mnemonic: string): algosdk.Account {
  return algosdk.mnemonicToSecretKey(mnemonic.trim());
}

/**
 * Calculate minimum balance requirement
 */
export interface MinBalanceParams {
  numAssets?: number;
  numApps?: number;
  numAppUints?: number;
  numAppByteSlices?: number;
  numBoxes?: number;
  totalBoxBytes?: number;
}

export function calculateMinBalance(params: MinBalanceParams = {}): number {
  let minBalance = MIN_BALANCE;

  if (params.numAssets) {
    minBalance += params.numAssets * MIN_BALANCE_PER_ASSET;
  }

  if (params.numApps) {
    minBalance += params.numApps * MIN_BALANCE_PER_APP;
  }

  if (params.numAppUints) {
    minBalance += params.numAppUints * MIN_BALANCE_PER_APP_UINT;
  }

  if (params.numAppByteSlices) {
    minBalance += params.numAppByteSlices * MIN_BALANCE_PER_APP_BYTESLICE;
  }

  if (params.numBoxes) {
    minBalance += params.numBoxes * MIN_BALANCE_PER_BOX;
  }

  if (params.totalBoxBytes) {
    minBalance += params.totalBoxBytes * MIN_BALANCE_PER_BOX_BYTE;
  }

  return minBalance;
}

/**
 * Encode string to bytes for transaction note
 */
export function encodeNote(note: string): Uint8Array {
  return new Uint8Array(Buffer.from(note, 'utf-8'));
}

/**
 * Decode bytes to string from transaction note
 */
export function decodeNote(note: Uint8Array): string {
  return Buffer.from(note).toString('utf-8');
}

/**
 * Encode data to base64
 */
export function toBase64(data: Uint8Array | string): string {
  if (typeof data === 'string') {
    return Buffer.from(data, 'utf-8').toString('base64');
  }
  return Buffer.from(data).toString('base64');
}

/**
 * Decode base64 to bytes
 */
export function fromBase64(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

/**
 * Sign data with secret key
 */
export function signData(data: Uint8Array, secretKey: Uint8Array): Uint8Array {
  return algosdk.signBytes(data, secretKey);
}

/**
 * Verify signed data
 */
export function verifySignature(data: Uint8Array, signature: Uint8Array, address: string): boolean {
  try {
    return algosdk.verifyBytes(data, signature, address);
  } catch {
    return false;
  }
}
