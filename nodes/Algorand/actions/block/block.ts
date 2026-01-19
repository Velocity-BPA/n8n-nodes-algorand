/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { getAlgodClient } from '../../transport/algodClient';

export const blockOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['block'],
      },
    },
    options: [
      { name: 'Get Current Block', value: 'getCurrentBlock', description: 'Get the latest block number', action: 'Get current block' },
      { name: 'Get Block', value: 'getBlock', description: 'Get block information by round', action: 'Get block' },
      { name: 'Get Block Hash', value: 'getBlockHash', description: 'Get block hash by round', action: 'Get block hash' },
      { name: 'Wait for Block', value: 'waitForBlock', description: 'Wait for a specific block', action: 'Wait for block' },
      { name: 'Get Node Status', value: 'getNodeStatus', description: 'Get node status information', action: 'Get node status' },
    ],
    default: 'getCurrentBlock',
  },
];

export const blockFields: INodeProperties[] = [
  {
    displayName: 'Round Number',
    name: 'round',
    type: 'number',
    default: 0,
    required: true,
    displayOptions: {
      show: {
        resource: ['block'],
        operation: ['getBlock', 'getBlockHash', 'waitForBlock'],
      },
    },
    description: 'The block round number',
  },
];

export async function executeBlockOperation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const returnData: INodeExecutionData[] = [];

  try {
    const client = await getAlgodClient(this);

    switch (operation) {
      case 'getCurrentBlock': {
        const status = await client.status().do();
        returnData.push({
          json: {
            lastRound: status['last-round'],
            lastVersion: status['last-version'],
            nextVersion: status['next-version'],
            nextVersionRound: status['next-version-round'],
            nextVersionSupported: status['next-version-supported'],
            timeSinceLastRound: status['time-since-last-round'],
            catchupTime: status['catchup-time'],
            hasSyncedSinceStartup: status['has-synced-since-startup'],
            stoppedAtUnsupportedRound: status['stopped-at-unsupported-round'],
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getBlock': {
        const round = this.getNodeParameter('round', index) as number;
        const block = await client.block(round).do();
        returnData.push({
          json: {
            round,
            genesisId: block.block.gh,
            genesisHash: block.block.gen,
            previousBlockHash: block.block.prev,
            timestamp: block.block.ts,
            seed: block.block.seed,
            transactions: block.block.txns?.length || 0,
            txnRoot: block.block.txn,
            rewardState: block.block.rwd,
            upgradeState: block.block.upgrade,
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getBlockHash': {
        const round = this.getNodeParameter('round', index) as number;
        const blockHash = await client.getBlockHash(round).do();
        returnData.push({
          json: {
            round,
            blockHash: blockHash.blockHash,
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'waitForBlock': {
        const round = this.getNodeParameter('round', index) as number;
        const status = await client.statusAfterBlock(round).do();
        returnData.push({
          json: {
            waitedForRound: round,
            currentRound: status['last-round'],
            timeSinceLastRound: status['time-since-last-round'],
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getNodeStatus': {
        const status = await client.status().do();
        const versions = await client.versionsCheck().do();
        returnData.push({
          json: {
            status: {
              lastRound: status['last-round'],
              lastVersion: status['last-version'],
              timeSinceLastRound: status['time-since-last-round'],
              catchupTime: status['catchup-time'],
              hasSyncedSinceStartup: status['has-synced-since-startup'],
            },
            versions: {
              build: versions.build,
              genesisId: versions.genesis_id,
              genesisHashB64: versions.genesis_hash_b64,
              versions: versions.versions,
            },
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
