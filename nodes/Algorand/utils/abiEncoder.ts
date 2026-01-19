/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import algosdk from 'algosdk';

/**
 * ABI Encoder Utilities for ARC-4 Smart Contracts
 */

export type ABIValue = string | number | bigint | boolean | Uint8Array | ABIValue[];

/**
 * Encode ABI method selector
 */
export function encodeMethodSelector(methodSignature: string): Uint8Array {
  const method = new algosdk.ABIMethod({ name: '', desc: '', args: [], returns: { type: 'void' } });
  return method.getSelector();
}

/**
 * Encode ABI argument
 */
export function encodeABIValue(type: string, value: ABIValue): Uint8Array {
  const abiType = algosdk.ABIType.from(type);
  return abiType.encode(value);
}

/**
 * Decode ABI value
 */
export function decodeABIValue(type: string, data: Uint8Array): ABIValue {
  const abiType = algosdk.ABIType.from(type);
  return abiType.decode(data) as ABIValue;
}

/**
 * Encode string to bytes
 */
export function encodeString(str: string): Uint8Array {
  return new Uint8Array(Buffer.from(str, 'utf-8'));
}

/**
 * Encode uint64
 */
export function encodeUint64(num: number | bigint): Uint8Array {
  const value = BigInt(num);
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setBigUint64(0, value, false);
  return new Uint8Array(buffer);
}

/**
 * Decode uint64
 */
export function decodeUint64(data: Uint8Array): bigint {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  return view.getBigUint64(0, false);
}

/**
 * Encode address to bytes
 */
export function encodeAddress(address: string): Uint8Array {
  return algosdk.decodeAddress(address).publicKey;
}

/**
 * Decode bytes to address
 */
export function decodeAddress(data: Uint8Array): string {
  return algosdk.encodeAddress(data);
}

/**
 * Parse method arguments from user input
 */
export interface MethodArg {
  type: string;
  value: string | number | boolean;
}

export function parseMethodArgs(args: MethodArg[]): Uint8Array[] {
  return args.map((arg) => {
    switch (arg.type) {
      case 'string':
        return encodeString(String(arg.value));
      case 'uint64':
      case 'int':
        return encodeUint64(Number(arg.value));
      case 'address':
        return encodeAddress(String(arg.value));
      case 'bytes':
        if (typeof arg.value === 'string') {
          if (arg.value.startsWith('0x')) {
            return new Uint8Array(Buffer.from(arg.value.slice(2), 'hex'));
          }
          return new Uint8Array(Buffer.from(arg.value, 'base64'));
        }
        return new Uint8Array();
      case 'bool':
        return new Uint8Array([arg.value ? 1 : 0]);
      default:
        return encodeABIValue(arg.type, arg.value as ABIValue);
    }
  });
}

/**
 * Create ABI method from signature
 */
export function createABIMethod(
  name: string,
  args: { name: string; type: string }[],
  returnType: string,
): algosdk.ABIMethod {
  return new algosdk.ABIMethod({
    name,
    desc: '',
    args: args.map((a) => ({ name: a.name, type: a.type, desc: '' })),
    returns: { type: returnType, desc: '' },
  });
}

/**
 * Encode ABI method call
 */
export function encodeABIMethodCall(
  method: algosdk.ABIMethod,
  args: ABIValue[],
): Uint8Array[] {
  const selector = method.getSelector();
  const encodedArgs = args.map((arg, i) => {
    const argType = method.args[i].type;
    return algosdk.ABIType.from(argType.toString()).encode(arg);
  });
  return [selector, ...encodedArgs];
}
