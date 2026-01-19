/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import algosdk from 'algosdk';
import { getAlgodClient, getSigningAccount } from '../../transport/algodClient';
import {
  algoToMicroAlgo,
  microAlgoToAlgo,
  isValidAddress,
  toBase64,
  fromBase64,
  signData,
  verifySignature,
} from '../../utils/unitConverter';

export const utilityOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['utility'],
      },
    },
    options: [
      { name: 'ALGO to MicroAlgo', value: 'algoToMicro', description: 'Convert ALGO to microAlgos', action: 'ALGO to micro algo' },
      { name: 'MicroAlgo to ALGO', value: 'microToAlgo', description: 'Convert microAlgos to ALGO', action: 'Micro algo to ALGO' },
      { name: 'Validate Address', value: 'validateAddress', description: 'Check if an address is valid', action: 'Validate address' },
      { name: 'Encode Base64', value: 'encodeBase64', description: 'Encode data to Base64', action: 'Encode base64' },
      { name: 'Decode Base64', value: 'decodeBase64', description: 'Decode Base64 data', action: 'Decode base64' },
      { name: 'Sign Data', value: 'signData', description: 'Sign data with account key', action: 'Sign data' },
      { name: 'Verify Signature', value: 'verifySignature', description: 'Verify a signature', action: 'Verify signature' },
      { name: 'Compile TEAL', value: 'compileTeal', description: 'Compile TEAL source code', action: 'Compile TEAL' },
      { name: 'Disassemble TEAL', value: 'disassembleTeal', description: 'Disassemble compiled TEAL', action: 'Disassemble TEAL' },
      { name: 'Get Genesis Info', value: 'getGenesisInfo', description: 'Get genesis information', action: 'Get genesis info' },
    ],
    default: 'validateAddress',
  },
];

export const utilityFields: INodeProperties[] = [
  {
    displayName: 'Amount (ALGO)',
    name: 'algoAmount',
    type: 'number',
    default: 0,
    required: true,
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['algoToMicro'],
      },
    },
    description: 'Amount in ALGO to convert',
  },
  {
    displayName: 'Amount (MicroAlgo)',
    name: 'microAmount',
    type: 'number',
    default: 0,
    required: true,
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['microToAlgo'],
      },
    },
    description: 'Amount in microAlgos to convert',
  },
  {
    displayName: 'Address',
    name: 'address',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['validateAddress', 'verifySignature'],
      },
    },
    description: 'Algorand address',
  },
  {
    displayName: 'Data',
    name: 'data',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['encodeBase64', 'signData'],
      },
    },
    description: 'Data to encode or sign',
  },
  {
    displayName: 'Base64 Data',
    name: 'base64Data',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['decodeBase64', 'verifySignature', 'disassembleTeal'],
      },
    },
    description: 'Base64 encoded data',
  },
  {
    displayName: 'Signature (Base64)',
    name: 'signature',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['verifySignature'],
      },
    },
    description: 'Base64 encoded signature',
  },
  {
    displayName: 'TEAL Source',
    name: 'tealSource',
    type: 'string',
    typeOptions: {
      rows: 10,
    },
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['utility'],
        operation: ['compileTeal'],
      },
    },
    description: 'TEAL source code to compile',
  },
];

export async function executeUtilityOperation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const returnData: INodeExecutionData[] = [];

  try {
    switch (operation) {
      case 'algoToMicro': {
        const algoAmount = this.getNodeParameter('algoAmount', index) as number;
        const microAmount = algoToMicroAlgo(algoAmount);
        returnData.push({
          json: {
            algo: algoAmount,
            microAlgo: microAmount,
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'microToAlgo': {
        const microAmount = this.getNodeParameter('microAmount', index) as number;
        const algoAmount = microAlgoToAlgo(microAmount);
        returnData.push({
          json: {
            microAlgo: microAmount,
            algo: algoAmount,
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'validateAddress': {
        const address = this.getNodeParameter('address', index) as string;
        const valid = isValidAddress(address);
        returnData.push({
          json: {
            address,
            valid,
            length: address.length,
            expectedLength: 58,
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'encodeBase64': {
        const data = this.getNodeParameter('data', index) as string;
        const encoded = toBase64(data);
        returnData.push({
          json: {
            original: data,
            base64: encoded,
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'decodeBase64': {
        const base64Data = this.getNodeParameter('base64Data', index) as string;
        const decoded = fromBase64(base64Data);
        const decodedString = Buffer.from(decoded).toString('utf-8');
        returnData.push({
          json: {
            base64: base64Data,
            decoded: decodedString,
            bytes: Array.from(decoded),
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'signData': {
        const data = this.getNodeParameter('data', index) as string;
        const account = await getSigningAccount(this);
        const dataBytes = new Uint8Array(Buffer.from(data, 'utf-8'));
        const signature = signData(dataBytes, account.sk);
        returnData.push({
          json: {
            data,
            signature: toBase64(signature),
            signer: account.addr,
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'verifySignature': {
        const address = this.getNodeParameter('address', index) as string;
        const base64Data = this.getNodeParameter('base64Data', index) as string;
        const signature = this.getNodeParameter('signature', index) as string;

        if (!isValidAddress(address)) {
          throw new Error('Invalid address');
        }

        const dataBytes = fromBase64(base64Data);
        const signatureBytes = fromBase64(signature);
        const valid = verifySignature(dataBytes, signatureBytes, address);

        returnData.push({
          json: {
            address,
            valid,
            data: base64Data,
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'compileTeal': {
        const tealSource = this.getNodeParameter('tealSource', index) as string;
        const client = await getAlgodClient(this);
        const compileResponse = await client.compile(tealSource).do();
        returnData.push({
          json: {
            hash: compileResponse.hash,
            result: compileResponse.result,
            sourceLength: tealSource.length,
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'disassembleTeal': {
        const base64Data = this.getNodeParameter('base64Data', index) as string;
        const client = await getAlgodClient(this);
        const programBytes = fromBase64(base64Data);
        const disassembleResponse = await client.disassemble(programBytes).do();
        returnData.push({
          json: {
            result: disassembleResponse.result,
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getGenesisInfo': {
        const client = await getAlgodClient(this);
        const versions = await client.versionsCheck().do();
        returnData.push({
          json: {
            genesisId: versions.genesis_id,
            genesisHash: versions.genesis_hash_b64,
            build: versions.build,
            versions: versions.versions,
          },
          pairedItem: { item: index },
        });
        break;
      }

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } catch (error) {
    if (this.continueOnFail()) {
      returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: index } });
    } else {
      throw error;
    }
  }

  return returnData;
}
