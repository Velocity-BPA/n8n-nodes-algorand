/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

import { accountOperations, accountFields, executeAccountOperation } from './actions/account/account';
import { transactionOperations, transactionFields, executeTransactionOperation } from './actions/transaction/transaction';
import { asaOperations, asaFields, executeAsaOperation } from './actions/asa/asa';
import { nftOperations, nftFields, executeNftOperation } from './actions/nft/nft';
import { applicationOperations, applicationFields, executeApplicationOperation } from './actions/application/application';
import { blockOperations, blockFields, executeBlockOperation } from './actions/block/block';
import { utilityOperations, utilityFields, executeUtilityOperation } from './actions/utility/utility';

// Licensing notice logged once per node load
const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;

let licensingNoticeLogged = false;

function logLicensingNotice(): void {
  if (!licensingNoticeLogged) {
    console.warn(LICENSING_NOTICE);
    licensingNoticeLogged = true;
  }
}

export class Algorand implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Algorand',
    name: 'algorand',
    icon: 'file:algorand.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Algorand blockchain - BSL 1.1 Licensed',
    defaults: {
      name: 'Algorand',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'algorandNetwork',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Account',
            value: 'account',
            description: 'Account operations',
          },
          {
            name: 'Transaction',
            value: 'transaction',
            description: 'Transaction operations',
          },
          {
            name: 'ASA (Asset)',
            value: 'asa',
            description: 'Algorand Standard Asset operations',
          },
          {
            name: 'NFT',
            value: 'nft',
            description: 'NFT operations (ARC-3/ARC-69)',
          },
          {
            name: 'Application',
            value: 'application',
            description: 'Smart contract operations',
          },
          {
            name: 'Block',
            value: 'block',
            description: 'Block information',
          },
          {
            name: 'Utility',
            value: 'utility',
            description: 'Utility functions',
          },
        ],
        default: 'account',
      },
      // Account
      ...accountOperations,
      ...accountFields,
      // Transaction
      ...transactionOperations,
      ...transactionFields,
      // ASA
      ...asaOperations,
      ...asaFields,
      // NFT
      ...nftOperations,
      ...nftFields,
      // Application
      ...applicationOperations,
      ...applicationFields,
      // Block
      ...blockOperations,
      ...blockFields,
      // Utility
      ...utilityOperations,
      ...utilityFields,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // Log licensing notice once per node load
    logLicensingNotice();

    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const resource = this.getNodeParameter('resource', i) as string;

      try {
        let result: INodeExecutionData[];

        switch (resource) {
          case 'account':
            result = await executeAccountOperation.call(this, i);
            break;
          case 'transaction':
            result = await executeTransactionOperation.call(this, i);
            break;
          case 'asa':
            result = await executeAsaOperation.call(this, i);
            break;
          case 'nft':
            result = await executeNftOperation.call(this, i);
            break;
          case 'application':
            result = await executeApplicationOperation.call(this, i);
            break;
          case 'block':
            result = await executeBlockOperation.call(this, i);
            break;
          case 'utility':
            result = await executeUtilityOperation.call(this, i);
            break;
          default:
            throw new Error(`Unknown resource: ${resource}`);
        }

        returnData.push(...result);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
