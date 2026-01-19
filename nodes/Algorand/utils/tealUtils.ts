/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import algosdk from 'algosdk';

/**
 * TEAL Utilities for Smart Contract Operations
 */

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
 * Validate TEAL source syntax
 */
export function validateTealSource(source: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const lines = source.split('\n');

  // Check for version pragma
  const versionLine = lines.find((line) => line.trim().startsWith('#pragma version'));
  if (!versionLine) {
    errors.push('Missing #pragma version directive');
  }

  // Check for basic structure
  if (lines.length < 2) {
    errors.push('TEAL program too short');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create simple approval program
 */
export function createSimpleApprovalProgram(version = 10): string {
  return `#pragma version ${version}
txn ApplicationID
int 0
==
bnz handle_create
txn OnCompletion
int NoOp
==
bnz handle_noop
txn OnCompletion
int OptIn
==
bnz handle_optin
txn OnCompletion
int CloseOut
==
bnz handle_closeout
txn OnCompletion
int UpdateApplication
==
bnz handle_update
txn OnCompletion
int DeleteApplication
==
bnz handle_delete
err

handle_create:
int 1
return

handle_noop:
int 1
return

handle_optin:
int 1
return

handle_closeout:
int 1
return

handle_update:
int 1
return

handle_delete:
int 1
return
`;
}

/**
 * Create simple clear state program
 */
export function createSimpleClearProgram(version = 10): string {
  return `#pragma version ${version}
int 1
return
`;
}

/**
 * Create logic signature from program
 */
export function createLogicSig(program: Uint8Array, args?: Uint8Array[]): algosdk.LogicSig {
  return new algosdk.LogicSig(program, args);
}

/**
 * Sign logic signature with account
 */
export function signLogicSig(
  logicSig: algosdk.LogicSig,
  account: algosdk.Account,
): algosdk.LogicSig {
  logicSig.sign(account.sk);
  return logicSig;
}

/**
 * Create delegated logic signature
 */
export function createDelegatedLogicSig(
  program: Uint8Array,
  account: algosdk.Account,
  args?: Uint8Array[],
): algosdk.LogicSig {
  const logicSig = new algosdk.LogicSig(program, args);
  logicSig.sign(account.sk);
  return logicSig;
}

/**
 * Verify logic signature
 */
export function verifyLogicSig(logicSig: algosdk.LogicSig, address: string): boolean {
  return logicSig.verify(algosdk.decodeAddress(address).publicKey);
}

/**
 * Get logic signature address
 */
export function getLogicSigAddress(logicSig: algosdk.LogicSig): string {
  return logicSig.address();
}

/**
 * Encode state schema
 */
export interface StateSchema {
  numUints: number;
  numByteSlices: number;
}

export function createStateSchema(schema: StateSchema) {
  return new algosdk.modelsv2.ApplicationStateSchema({
    numUint: schema.numUints,
    numByteSlice: schema.numByteSlices,
  });
}

/**
 * Decode global state from account info
 */
export function decodeGlobalState(
  state: Array<{ key: string; value: { type: number; bytes?: string; uint?: number } }>,
): Record<string, string | number> {
  const decoded: Record<string, string | number> = {};

  for (const item of state) {
    const key = Buffer.from(item.key, 'base64').toString('utf-8');
    if (item.value.type === 1) {
      decoded[key] = Buffer.from(item.value.bytes || '', 'base64').toString('utf-8');
    } else {
      decoded[key] = item.value.uint || 0;
    }
  }

  return decoded;
}

/**
 * Decode local state from account info
 */
export function decodeLocalState(
  state: Array<{ key: string; value: { type: number; bytes?: string; uint?: number } }>,
): Record<string, string | number> {
  return decodeGlobalState(state);
}
