/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IPollFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';

import { getAlgodConfig, createAlgodClient } from './transport/algodClient';
import { getIndexerConfig, createIndexerClient } from './transport/indexerClient';
import { microAlgoToAlgo } from './utils/unitConverter';

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

export class AlgorandTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Algorand Trigger',
    name: 'algorandTrigger',
    icon: 'file:algorand.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Trigger on Algorand blockchain events - BSL 1.1 Licensed',
    defaults: {
      name: 'Algorand Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'algorandNetwork',
        required: true,
      },
    ],
    polling: true,
    properties: [
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        options: [
          {
            name: 'New Block',
            value: 'newBlock',
            description: 'Trigger on each new block',
          },
          {
            name: 'Transaction for Address',
            value: 'transactionForAddress',
            description: 'Any transaction involving an address',
          },
          {
            name: 'Payment Received',
            value: 'paymentReceived',
            description: 'ALGO payment received to an address',
          },
          {
            name: 'Payment Sent',
            value: 'paymentSent',
            description: 'ALGO payment sent from an address',
          },
          {
            name: 'Asset Transfer',
            value: 'assetTransfer',
            description: 'ASA transfer for a specific asset',
          },
          {
            name: 'Asset Opt-In',
            value: 'assetOptIn',
            description: 'When an account opts into an asset',
          },
          {
            name: 'Application Call',
            value: 'applicationCall',
            description: 'Calls to a specific smart contract',
          },
          {
            name: 'Balance Change',
            value: 'balanceChange',
            description: 'When an account balance changes',
          },
        ],
        default: 'newBlock',
        description: 'The event to trigger on',
      },
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            event: [
              'transactionForAddress',
              'paymentReceived',
              'paymentSent',
              'balanceChange',
            ],
          },
        },
        description: 'The Algorand address to monitor',
      },
      {
        displayName: 'Asset ID',
        name: 'assetId',
        type: 'number',
        default: 0,
        required: true,
        displayOptions: {
          show: {
            event: ['assetTransfer', 'assetOptIn'],
          },
        },
        description: 'The ASA ID to monitor',
      },
      {
        displayName: 'Application ID',
        name: 'appId',
        type: 'number',
        default: 0,
        required: true,
        displayOptions: {
          show: {
            event: ['applicationCall'],
          },
        },
        description: 'The application ID to monitor',
      },
      {
        displayName: 'Minimum Amount (ALGO)',
        name: 'minAmount',
        type: 'number',
        default: 0,
        displayOptions: {
          show: {
            event: ['paymentReceived', 'paymentSent', 'balanceChange'],
          },
        },
        description: 'Minimum amount to trigger (0 for any amount)',
      },
    ],
  };

  async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
    // Log licensing notice once per node load
    logLicensingNotice();

    const event = this.getNodeParameter('event') as string;
    const credentials = await this.getCredentials('algorandNetwork');

    const algodConfig = getAlgodConfig(credentials as Record<string, unknown>);
    const indexerConfig = getIndexerConfig(credentials as Record<string, unknown>);
    const client = createAlgodClient(algodConfig);
    const indexer = createIndexerClient(indexerConfig);

    const webhookData = this.getWorkflowStaticData('node');
    const lastRound = (webhookData.lastRound as number) || 0;
    const lastBalance = (webhookData.lastBalance as number) || 0;

    const returnData: any[] = [];

    try {
      switch (event) {
        case 'newBlock': {
          const status = await client.status().do();
          const currentRound = status['last-round'];

          if (currentRound > lastRound) {
            for (let round = lastRound + 1; round <= currentRound; round++) {
              try {
                const block = await client.block(round).do();
                returnData.push({
                  json: {
                    event: 'newBlock',
                    round,
                    timestamp: block.block.ts,
                    transactions: block.block.txns?.length || 0,
                    previousBlockHash: block.block.prev,
                  },
                });
              } catch {
                // Block might not be available yet
              }
            }
            webhookData.lastRound = currentRound;
          }
          break;
        }

        case 'transactionForAddress': {
          const address = this.getNodeParameter('address') as string;
          const status = await client.status().do();
          const currentRound = status['last-round'];

          if (lastRound > 0) {
            const response = await indexer
              .searchForTransactions()
              .address(address)
              .minRound(lastRound + 1)
              .maxRound(currentRound)
              .do();

            for (const tx of response.transactions || []) {
              returnData.push({
                json: {
                  event: 'transactionForAddress',
                  address,
                  txId: tx.id,
                  type: tx['tx-type'],
                  sender: tx.sender,
                  confirmedRound: tx['confirmed-round'],
                  fee: microAlgoToAlgo(tx.fee),
                },
              });
            }
          }
          webhookData.lastRound = currentRound;
          break;
        }

        case 'paymentReceived': {
          const address = this.getNodeParameter('address') as string;
          const minAmount = this.getNodeParameter('minAmount') as number;
          const status = await client.status().do();
          const currentRound = status['last-round'];

          if (lastRound > 0) {
            const response = await indexer
              .searchForTransactions()
              .address(address)
              .addressRole('receiver')
              .txType('pay')
              .minRound(lastRound + 1)
              .maxRound(currentRound)
              .do();

            for (const tx of response.transactions || []) {
              const amount = microAlgoToAlgo(tx['payment-transaction']?.amount || 0);
              if (amount >= minAmount) {
                returnData.push({
                  json: {
                    event: 'paymentReceived',
                    address,
                    txId: tx.id,
                    sender: tx.sender,
                    amount,
                    confirmedRound: tx['confirmed-round'],
                  },
                });
              }
            }
          }
          webhookData.lastRound = currentRound;
          break;
        }

        case 'paymentSent': {
          const address = this.getNodeParameter('address') as string;
          const minAmount = this.getNodeParameter('minAmount') as number;
          const status = await client.status().do();
          const currentRound = status['last-round'];

          if (lastRound > 0) {
            const response = await indexer
              .searchForTransactions()
              .address(address)
              .addressRole('sender')
              .txType('pay')
              .minRound(lastRound + 1)
              .maxRound(currentRound)
              .do();

            for (const tx of response.transactions || []) {
              const amount = microAlgoToAlgo(tx['payment-transaction']?.amount || 0);
              if (amount >= minAmount) {
                returnData.push({
                  json: {
                    event: 'paymentSent',
                    address,
                    txId: tx.id,
                    receiver: tx['payment-transaction']?.receiver,
                    amount,
                    confirmedRound: tx['confirmed-round'],
                  },
                });
              }
            }
          }
          webhookData.lastRound = currentRound;
          break;
        }

        case 'assetTransfer': {
          const assetId = this.getNodeParameter('assetId') as number;
          const status = await client.status().do();
          const currentRound = status['last-round'];

          if (lastRound > 0) {
            const response = await indexer
              .searchForTransactions()
              .assetID(assetId)
              .txType('axfer')
              .minRound(lastRound + 1)
              .maxRound(currentRound)
              .do();

            for (const tx of response.transactions || []) {
              returnData.push({
                json: {
                  event: 'assetTransfer',
                  assetId,
                  txId: tx.id,
                  sender: tx.sender,
                  receiver: tx['asset-transfer-transaction']?.receiver,
                  amount: tx['asset-transfer-transaction']?.amount,
                  confirmedRound: tx['confirmed-round'],
                },
              });
            }
          }
          webhookData.lastRound = currentRound;
          break;
        }

        case 'assetOptIn': {
          const assetId = this.getNodeParameter('assetId') as number;
          const status = await client.status().do();
          const currentRound = status['last-round'];

          if (lastRound > 0) {
            const response = await indexer
              .searchForTransactions()
              .assetID(assetId)
              .txType('axfer')
              .minRound(lastRound + 1)
              .maxRound(currentRound)
              .do();

            for (const tx of response.transactions || []) {
              // Opt-in is when sender === receiver and amount === 0
              const axfer = tx['asset-transfer-transaction'];
              if (axfer && tx.sender === axfer.receiver && axfer.amount === 0) {
                returnData.push({
                  json: {
                    event: 'assetOptIn',
                    assetId,
                    txId: tx.id,
                    account: tx.sender,
                    confirmedRound: tx['confirmed-round'],
                  },
                });
              }
            }
          }
          webhookData.lastRound = currentRound;
          break;
        }

        case 'applicationCall': {
          const appId = this.getNodeParameter('appId') as number;
          const status = await client.status().do();
          const currentRound = status['last-round'];

          if (lastRound > 0) {
            const response = await indexer
              .searchForTransactions()
              .applicationID(appId)
              .minRound(lastRound + 1)
              .maxRound(currentRound)
              .do();

            for (const tx of response.transactions || []) {
              returnData.push({
                json: {
                  event: 'applicationCall',
                  appId,
                  txId: tx.id,
                  sender: tx.sender,
                  onCompletion: tx['application-transaction']?.['on-completion'],
                  confirmedRound: tx['confirmed-round'],
                },
              });
            }
          }
          webhookData.lastRound = currentRound;
          break;
        }

        case 'balanceChange': {
          const address = this.getNodeParameter('address') as string;
          const minAmount = this.getNodeParameter('minAmount') as number;
          const accountInfo = await client.accountInformation(address).do();
          const currentBalance = accountInfo.amount;

          if (lastBalance > 0) {
            const change = currentBalance - lastBalance;
            const changeAlgo = microAlgoToAlgo(Math.abs(change));

            if (change !== 0 && changeAlgo >= minAmount) {
              returnData.push({
                json: {
                  event: 'balanceChange',
                  address,
                  previousBalance: microAlgoToAlgo(lastBalance),
                  currentBalance: microAlgoToAlgo(currentBalance),
                  change: microAlgoToAlgo(change),
                  direction: change > 0 ? 'increase' : 'decrease',
                },
              });
            }
          }
          webhookData.lastBalance = currentBalance;
          break;
        }
      }
    } catch (error) {
      // Log error but don't fail the trigger
      console.error(`Algorand Trigger error: ${(error as Error).message}`);
    }

    if (returnData.length === 0) {
      return null;
    }

    return [returnData as INodeExecutionData[]];
  }
}
