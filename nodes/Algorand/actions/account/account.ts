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
import { microAlgoToAlgo, isValidAddress, generateAccount, calculateMinBalance } from '../../utils/unitConverter';

export const accountOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['account'],
      },
    },
    options: [
      { name: 'Generate Account', value: 'generateAccount', description: 'Generate a new Algorand account', action: 'Generate account' },
      { name: 'Get Balance', value: 'getBalance', description: 'Get account ALGO balance', action: 'Get balance' },
      { name: 'Get Info', value: 'getInfo', description: 'Get detailed account information', action: 'Get info' },
      { name: 'Get Assets', value: 'getAssets', description: 'Get account ASA holdings', action: 'Get assets' },
      { name: 'Get Applications', value: 'getApplications', description: 'Get opted-in applications', action: 'Get applications' },
      { name: 'Get Transactions', value: 'getTransactions', description: 'Get account transactions', action: 'Get transactions' },
      { name: 'Get Created Assets', value: 'getCreatedAssets', description: 'Get assets created by account', action: 'Get created assets' },
      { name: 'Get Created Apps', value: 'getCreatedApps', description: 'Get apps created by account', action: 'Get created apps' },
      { name: 'Get Min Balance', value: 'getMinBalance', description: 'Calculate minimum balance', action: 'Get min balance' },
      { name: 'Validate Address', value: 'validateAddress', description: 'Validate Algorand address', action: 'Validate address' },
      { name: 'Rekey Account', value: 'rekeyAccount', description: 'Change authorized signer', action: 'Rekey account' },
    ],
    default: 'getBalance',
  },
];

export const accountFields: INodeProperties[] = [
  {
    displayName: 'Address',
    name: 'address',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['getBalance', 'getInfo', 'getAssets', 'getApplications', 'getTransactions', 'getCreatedAssets', 'getCreatedApps', 'getMinBalance', 'validateAddress'],
      },
    },
    description: 'The Algorand address (58 characters)',
  },
  {
    displayName: 'New Auth Address',
    name: 'newAuthAddress',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['rekeyAccount'],
      },
    },
    description: 'The new authorized spending address',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 10,
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['getTransactions'],
      },
    },
    description: 'Maximum number of transactions to return',
  },
];

export async function executeAccountOperation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const returnData: INodeExecutionData[] = [];

  try {
    switch (operation) {
      case 'generateAccount': {
        const account = generateAccount();
        returnData.push({
          json: {
            address: account.address,
            mnemonic: account.mnemonic,
            message: 'IMPORTANT: Store the mnemonic securely. It cannot be recovered!',
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getBalance': {
        const address = this.getNodeParameter('address', index) as string;
        if (!isValidAddress(address)) {
          throw new Error('Invalid Algorand address');
        }
        const client = await getAlgodClient(this);
        const accountInfo = await client.accountInformation(address).do();
        returnData.push({
          json: {
            address,
            balance: microAlgoToAlgo(accountInfo.amount),
            balanceMicroAlgo: accountInfo.amount,
            minBalance: microAlgoToAlgo(accountInfo['min-balance']),
            pendingRewards: microAlgoToAlgo(accountInfo['pending-rewards'] || 0),
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getInfo': {
        const address = this.getNodeParameter('address', index) as string;
        if (!isValidAddress(address)) {
          throw new Error('Invalid Algorand address');
        }
        const client = await getAlgodClient(this);
        const accountInfo = await client.accountInformation(address).do();
        returnData.push({
          json: {
            address,
            balance: microAlgoToAlgo(accountInfo.amount),
            balanceMicroAlgo: accountInfo.amount,
            minBalance: microAlgoToAlgo(accountInfo['min-balance']),
            status: accountInfo.status,
            round: accountInfo.round,
            totalAssets: accountInfo.assets?.length || 0,
            totalAppsOptedIn: accountInfo['apps-local-state']?.length || 0,
            totalCreatedAssets: accountInfo['created-assets']?.length || 0,
            totalCreatedApps: accountInfo['created-apps']?.length || 0,
            authAddr: accountInfo['auth-addr'],
            rewardsBase: accountInfo['reward-base'],
            rewards: accountInfo.rewards,
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getAssets': {
        const address = this.getNodeParameter('address', index) as string;
        if (!isValidAddress(address)) {
          throw new Error('Invalid Algorand address');
        }
        const client = await getAlgodClient(this);
        const accountInfo = await client.accountInformation(address).do();
        const assets = (accountInfo.assets || []).map((asset: any) => ({
          assetId: asset['asset-id'],
          amount: asset.amount,
          isFrozen: asset['is-frozen'],
        }));
        returnData.push({
          json: { address, assets, totalAssets: assets.length },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getApplications': {
        const address = this.getNodeParameter('address', index) as string;
        if (!isValidAddress(address)) {
          throw new Error('Invalid Algorand address');
        }
        const client = await getAlgodClient(this);
        const accountInfo = await client.accountInformation(address).do();
        const apps = (accountInfo['apps-local-state'] || []).map((app: any) => ({
          appId: app.id,
          schema: app.schema,
          keyValue: app['key-value'],
        }));
        returnData.push({
          json: { address, applications: apps, totalApplications: apps.length },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getTransactions': {
        const address = this.getNodeParameter('address', index) as string;
        const limit = this.getNodeParameter('limit', index) as number;
        if (!isValidAddress(address)) {
          throw new Error('Invalid Algorand address');
        }
        const indexer = await getIndexerClient(this);
        const response = await indexer.searchForTransactions().address(address).limit(limit).do();
        returnData.push({
          json: { address, transactions: response.transactions, totalTransactions: response.transactions.length },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getCreatedAssets': {
        const address = this.getNodeParameter('address', index) as string;
        if (!isValidAddress(address)) {
          throw new Error('Invalid Algorand address');
        }
        const client = await getAlgodClient(this);
        const accountInfo = await client.accountInformation(address).do();
        const createdAssets = (accountInfo['created-assets'] || []).map((asset: any) => ({
          assetId: asset.index,
          params: asset.params,
        }));
        returnData.push({
          json: { address, createdAssets, totalCreatedAssets: createdAssets.length },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getCreatedApps': {
        const address = this.getNodeParameter('address', index) as string;
        if (!isValidAddress(address)) {
          throw new Error('Invalid Algorand address');
        }
        const client = await getAlgodClient(this);
        const accountInfo = await client.accountInformation(address).do();
        const createdApps = (accountInfo['created-apps'] || []).map((app: any) => ({
          appId: app.id,
          params: app.params,
        }));
        returnData.push({
          json: { address, createdApps, totalCreatedApps: createdApps.length },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getMinBalance': {
        const address = this.getNodeParameter('address', index) as string;
        if (!isValidAddress(address)) {
          throw new Error('Invalid Algorand address');
        }
        const client = await getAlgodClient(this);
        const accountInfo = await client.accountInformation(address).do();
        const calculatedMin = calculateMinBalance({
          numAssets: accountInfo.assets?.length || 0,
          numApps: accountInfo['apps-local-state']?.length || 0,
        });
        returnData.push({
          json: {
            address,
            minBalance: microAlgoToAlgo(accountInfo['min-balance']),
            minBalanceMicroAlgo: accountInfo['min-balance'],
            calculatedMinBalance: microAlgoToAlgo(calculatedMin),
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'validateAddress': {
        const address = this.getNodeParameter('address', index) as string;
        const valid = isValidAddress(address);
        returnData.push({
          json: { address, valid, length: address.length },
          pairedItem: { item: index },
        });
        break;
      }

      case 'rekeyAccount': {
        const newAuthAddress = this.getNodeParameter('newAuthAddress', index) as string;
        if (!isValidAddress(newAuthAddress)) {
          throw new Error('Invalid new auth address');
        }
        const client = await getAlgodClient(this);
        const account = await getSigningAccount(this);
        const params = await getSuggestedParams(client);
        const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          from: account.addr,
          to: account.addr,
          amount: 0,
          rekeyTo: newAuthAddress,
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
            newAuthAddress,
            confirmedRound: Number(confirmedTxn['confirmed-round']),
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
