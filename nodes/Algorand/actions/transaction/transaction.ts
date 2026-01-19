/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import algosdk from 'algosdk';
import { getAlgodClient, getSigningAccount, getSuggestedParams, waitForConfirmation } from '../../transport/algodClient';
import { getIndexerClient } from '../../transport/indexerClient';
import { algoToMicroAlgo, microAlgoToAlgo, isValidAddress, encodeNote } from '../../utils/unitConverter';

export const transactionOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['transaction'],
      },
    },
    options: [
      { name: 'Send ALGO', value: 'sendAlgo', description: 'Send ALGO to an address', action: 'Send ALGO' },
      { name: 'Get Transaction', value: 'getTransaction', description: 'Get transaction details by ID', action: 'Get transaction' },
      { name: 'Get Pending', value: 'getPending', description: 'Get pending transaction info', action: 'Get pending' },
      { name: 'Wait for Confirmation', value: 'waitForConfirmation', description: 'Wait for transaction confirmation', action: 'Wait for confirmation' },
      { name: 'Get Suggested Params', value: 'getSuggestedParams', description: 'Get current transaction parameters', action: 'Get suggested params' },
      { name: 'Simulate', value: 'simulate', description: 'Simulate a transaction', action: 'Simulate' },
    ],
    default: 'sendAlgo',
  },
];

export const transactionFields: INodeProperties[] = [
  {
    displayName: 'To Address',
    name: 'toAddress',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['sendAlgo'],
      },
    },
    description: 'Recipient Algorand address',
  },
  {
    displayName: 'Amount (ALGO)',
    name: 'amount',
    type: 'number',
    default: 0,
    required: true,
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['sendAlgo'],
      },
    },
    description: 'Amount in ALGO to send',
  },
  {
    displayName: 'Note',
    name: 'note',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['sendAlgo'],
      },
    },
    description: 'Optional note to include with transaction',
  },
  {
    displayName: 'Transaction ID',
    name: 'txId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['getTransaction', 'getPending', 'waitForConfirmation'],
      },
    },
    description: 'The transaction ID',
  },
  {
    displayName: 'Timeout Rounds',
    name: 'timeoutRounds',
    type: 'number',
    default: 4,
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['waitForConfirmation'],
      },
    },
    description: 'Maximum rounds to wait for confirmation',
  },
];

export async function executeTransactionOperation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const returnData: INodeExecutionData[] = [];

  try {
    const client = await getAlgodClient(this);

    switch (operation) {
      case 'sendAlgo': {
        const toAddress = this.getNodeParameter('toAddress', index) as string;
        const amount = this.getNodeParameter('amount', index) as number;
        const note = this.getNodeParameter('note', index) as string;

        if (!isValidAddress(toAddress)) {
          throw new Error('Invalid recipient address');
        }

        if (amount <= 0) {
          throw new Error('Amount must be greater than 0');
        }

        const account = await getSigningAccount(this);
        const params = await getSuggestedParams(client);

        const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          from: account.addr,
          to: toAddress,
          amount: algoToMicroAlgo(amount),
          note: note ? encodeNote(note) : undefined,
          suggestedParams: params,
        });

        const signedTxn = txn.signTxn(account.sk);
        const { txId } = await client.sendRawTransaction(signedTxn).do();
        const confirmedTxn = await waitForConfirmation(client, txId);

        returnData.push({
          json: {
            success: true,
            txId,
            from: account.addr,
            to: toAddress,
            amount,
            amountMicroAlgo: algoToMicroAlgo(amount),
            fee: microAlgoToAlgo(params.fee),
            confirmedRound: Number(confirmedTxn['confirmed-round']),
            note: note || null,
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getTransaction': {
        const txId = this.getNodeParameter('txId', index) as string;
        const indexer = await getIndexerClient(this);
        const response = await indexer.searchForTransactions().txid(txId).do();
        
        if (response.transactions.length === 0) {
          throw new Error(`Transaction not found: ${txId}`);
        }

        const tx = response.transactions[0];
        returnData.push({
          json: {
            txId,
            type: tx['tx-type'],
            sender: tx.sender,
            fee: microAlgoToAlgo(tx.fee),
            confirmedRound: tx['confirmed-round'],
            roundTime: tx['round-time'],
            paymentTransaction: tx['payment-transaction'],
            assetTransferTransaction: tx['asset-transfer-transaction'],
            applicationTransaction: tx['application-transaction'],
            note: tx.note ? Buffer.from(tx.note, 'base64').toString('utf-8') : null,
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getPending': {
        const txId = this.getNodeParameter('txId', index) as string;
        const pendingTxn = await client.pendingTransactionInformation(txId).do();
        returnData.push({
          json: {
            txId,
            poolError: pendingTxn['pool-error'],
            confirmedRound: pendingTxn['confirmed-round'],
            txn: pendingTxn.txn,
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'waitForConfirmation': {
        const txId = this.getNodeParameter('txId', index) as string;
        const timeoutRounds = this.getNodeParameter('timeoutRounds', index) as number;
        const confirmedTxn = await waitForConfirmation(client, txId, timeoutRounds);
        returnData.push({
          json: {
            txId,
            confirmed: true,
            confirmedRound: Number(confirmedTxn['confirmed-round']),
            txn: confirmedTxn.txn as Record<string, unknown> || null,
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getSuggestedParams': {
        const params = await getSuggestedParams(client);
        returnData.push({
          json: {
            fee: params.fee,
            firstRound: params.firstRound,
            lastRound: params.lastRound,
            genesisID: params.genesisID,
            genesisHash: params.genesisHash,
            flatFee: params.flatFee,
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'simulate': {
        const toAddress = this.getNodeParameter('toAddress', index, '') as string;
        const amount = this.getNodeParameter('amount', index, 0) as number;

        if (!toAddress || !isValidAddress(toAddress)) {
          throw new Error('Invalid recipient address for simulation');
        }

        const account = await getSigningAccount(this);
        const params = await getSuggestedParams(client);

        const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          from: account.addr,
          to: toAddress,
          amount: algoToMicroAlgo(amount),
          suggestedParams: params,
        });

        const signedTxn = txn.signTxn(account.sk);
        const decodedTxn = algosdk.decodeSignedTransaction(signedTxn);
        const request = new algosdk.modelsv2.SimulateRequest({
          txnGroups: [
            new algosdk.modelsv2.SimulateRequestTransactionGroup({
              txns: [decodedTxn as any],
            }),
          ],
        });

        const response = await client.simulateTransactions(request).do();
        returnData.push({
          json: {
            wouldSucceed: response.txnGroups[0].failureMessage === undefined,
            failureMessage: response.txnGroups[0].failureMessage,
            txnResults: response.txnGroups[0].txnResults,
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
