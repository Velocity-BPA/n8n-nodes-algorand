/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import algosdk from 'algosdk';
import { algoToMicroAlgo, encodeNote } from './unitConverter';

/**
 * Transaction Builder Utilities
 */

export interface PaymentParams {
  from: string;
  to: string;
  amount: number;
  note?: string;
  closeRemainderTo?: string;
  rekeyTo?: string;
  suggestedParams: algosdk.SuggestedParams;
}

/**
 * Build payment transaction
 */
export function buildPaymentTxn(params: PaymentParams): algosdk.Transaction {
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: params.from,
    to: params.to,
    amount: algoToMicroAlgo(params.amount),
    note: params.note ? encodeNote(params.note) : undefined,
    closeRemainderTo: params.closeRemainderTo,
    rekeyTo: params.rekeyTo,
    suggestedParams: params.suggestedParams,
  });
  return txn;
}

export interface AssetCreateParams {
  from: string;
  total: number | bigint;
  decimals: number;
  defaultFrozen?: boolean;
  manager?: string;
  reserve?: string;
  freeze?: string;
  clawback?: string;
  unitName?: string;
  assetName?: string;
  assetURL?: string;
  assetMetadataHash?: Uint8Array;
  note?: string;
  suggestedParams: algosdk.SuggestedParams;
}

/**
 * Build asset creation transaction
 */
export function buildAssetCreateTxn(params: AssetCreateParams): algosdk.Transaction {
  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: params.from,
    total: params.total,
    decimals: params.decimals,
    defaultFrozen: params.defaultFrozen || false,
    manager: params.manager,
    reserve: params.reserve,
    freeze: params.freeze,
    clawback: params.clawback,
    unitName: params.unitName,
    assetName: params.assetName,
    assetURL: params.assetURL,
    assetMetadataHash: params.assetMetadataHash,
    note: params.note ? encodeNote(params.note) : undefined,
    suggestedParams: params.suggestedParams,
  });
  return txn;
}

export interface AssetTransferParams {
  from: string;
  to: string;
  assetIndex: number;
  amount: number | bigint;
  note?: string;
  closeRemainderTo?: string;
  revocationTarget?: string;
  suggestedParams: algosdk.SuggestedParams;
}

/**
 * Build asset transfer transaction
 */
export function buildAssetTransferTxn(params: AssetTransferParams): algosdk.Transaction {
  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: params.from,
    to: params.to,
    assetIndex: params.assetIndex,
    amount: params.amount,
    note: params.note ? encodeNote(params.note) : undefined,
    closeRemainderTo: params.closeRemainderTo,
    revocationTarget: params.revocationTarget,
    suggestedParams: params.suggestedParams,
  });
  return txn;
}

export interface AssetOptInParams {
  from: string;
  assetIndex: number;
  note?: string;
  suggestedParams: algosdk.SuggestedParams;
}

/**
 * Build asset opt-in transaction
 */
export function buildAssetOptInTxn(params: AssetOptInParams): algosdk.Transaction {
  return buildAssetTransferTxn({
    from: params.from,
    to: params.from,
    assetIndex: params.assetIndex,
    amount: 0,
    note: params.note,
    suggestedParams: params.suggestedParams,
  });
}

export interface AssetOptOutParams {
  from: string;
  assetIndex: number;
  closeTo: string;
  note?: string;
  suggestedParams: algosdk.SuggestedParams;
}

/**
 * Build asset opt-out transaction
 */
export function buildAssetOptOutTxn(params: AssetOptOutParams): algosdk.Transaction {
  return buildAssetTransferTxn({
    from: params.from,
    to: params.closeTo,
    assetIndex: params.assetIndex,
    amount: 0,
    closeRemainderTo: params.closeTo,
    note: params.note,
    suggestedParams: params.suggestedParams,
  });
}

export interface AppCallParams {
  from: string;
  appIndex: number;
  onComplete?: algosdk.OnApplicationComplete;
  appArgs?: Uint8Array[];
  accounts?: string[];
  foreignApps?: number[];
  foreignAssets?: number[];
  boxes?: { appIndex: number; name: Uint8Array }[];
  note?: string;
  suggestedParams: algosdk.SuggestedParams;
}

/**
 * Build application call transaction
 */
export function buildAppCallTxn(params: AppCallParams): algosdk.Transaction {
  const txn = algosdk.makeApplicationCallTxnFromObject({
    from: params.from,
    appIndex: params.appIndex,
    onComplete: params.onComplete || algosdk.OnApplicationComplete.NoOpOC,
    appArgs: params.appArgs,
    accounts: params.accounts,
    foreignApps: params.foreignApps,
    foreignAssets: params.foreignAssets,
    boxes: params.boxes,
    note: params.note ? encodeNote(params.note) : undefined,
    suggestedParams: params.suggestedParams,
  });
  return txn;
}

/**
 * Sign transaction with account
 */
export function signTransaction(txn: algosdk.Transaction, account: algosdk.Account): Uint8Array {
  return txn.signTxn(account.sk);
}

/**
 * Create atomic transaction group
 */
export function createAtomicGroup(txns: algosdk.Transaction[]): algosdk.Transaction[] {
  return algosdk.assignGroupID(txns);
}

/**
 * Decode signed transaction
 */
export function decodeSignedTxn(signedTxn: Uint8Array): algosdk.SignedTransaction {
  return algosdk.decodeSignedTransaction(signedTxn);
}
