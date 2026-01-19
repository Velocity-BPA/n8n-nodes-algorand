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
import { isValidAddress, encodeNote } from '../../utils/unitConverter';

export const asaOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['asa'],
      },
    },
    options: [
      { name: 'Create Asset', value: 'createAsset', description: 'Create a new ASA', action: 'Create asset' },
      { name: 'Get Asset Info', value: 'getAssetInfo', description: 'Get asset information', action: 'Get asset info' },
      { name: 'Transfer', value: 'transfer', description: 'Transfer ASA to another address', action: 'Transfer' },
      { name: 'Opt In', value: 'optIn', description: 'Opt in to receive an ASA', action: 'Opt in' },
      { name: 'Opt Out', value: 'optOut', description: 'Opt out of an ASA', action: 'Opt out' },
      { name: 'Freeze', value: 'freeze', description: 'Freeze/unfreeze an address', action: 'Freeze' },
      { name: 'Clawback', value: 'clawback', description: 'Clawback ASA from an address', action: 'Clawback' },
      { name: 'Destroy', value: 'destroy', description: 'Destroy an ASA', action: 'Destroy' },
      { name: 'Search Assets', value: 'searchAssets', description: 'Search for assets', action: 'Search assets' },
      { name: 'Get Holders', value: 'getHolders', description: 'Get asset holders', action: 'Get holders' },
    ],
    default: 'getAssetInfo',
  },
];

export const asaFields: INodeProperties[] = [
  {
    displayName: 'Asset ID',
    name: 'assetId',
    type: 'number',
    default: 0,
    required: true,
    displayOptions: {
      show: {
        resource: ['asa'],
        operation: ['getAssetInfo', 'transfer', 'optIn', 'optOut', 'freeze', 'clawback', 'destroy', 'getHolders'],
      },
    },
    description: 'The ASA ID',
  },
  {
    displayName: 'Asset Name',
    name: 'assetName',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['asa'],
        operation: ['createAsset'],
      },
    },
    description: 'The name of the asset',
  },
  {
    displayName: 'Unit Name',
    name: 'unitName',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['asa'],
        operation: ['createAsset'],
      },
    },
    description: 'Short unit name (e.g., USDC)',
  },
  {
    displayName: 'Total Supply',
    name: 'total',
    type: 'number',
    default: 1000000,
    required: true,
    displayOptions: {
      show: {
        resource: ['asa'],
        operation: ['createAsset'],
      },
    },
    description: 'Total supply of the asset',
  },
  {
    displayName: 'Decimals',
    name: 'decimals',
    type: 'number',
    default: 6,
    displayOptions: {
      show: {
        resource: ['asa'],
        operation: ['createAsset'],
      },
    },
    description: 'Number of decimal places (0-19)',
  },
  {
    displayName: 'To Address',
    name: 'toAddress',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['asa'],
        operation: ['transfer'],
      },
    },
    description: 'Recipient address',
  },
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'number',
    default: 0,
    required: true,
    displayOptions: {
      show: {
        resource: ['asa'],
        operation: ['transfer', 'clawback'],
      },
    },
    description: 'Amount to transfer (in base units)',
  },
  {
    displayName: 'Target Address',
    name: 'targetAddress',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['asa'],
        operation: ['freeze', 'clawback'],
      },
    },
    description: 'Target address for freeze/clawback',
  },
  {
    displayName: 'Freeze State',
    name: 'freezeState',
    type: 'boolean',
    default: true,
    displayOptions: {
      show: {
        resource: ['asa'],
        operation: ['freeze'],
      },
    },
    description: 'Whether to freeze (true) or unfreeze (false)',
  },
  {
    displayName: 'Close To Address',
    name: 'closeToAddress',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['asa'],
        operation: ['optOut'],
      },
    },
    description: 'Address to send remaining balance when opting out',
  },
  {
    displayName: 'Search Query',
    name: 'searchQuery',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['asa'],
        operation: ['searchAssets'],
      },
    },
    description: 'Asset name or unit name to search',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 10,
    displayOptions: {
      show: {
        resource: ['asa'],
        operation: ['searchAssets', 'getHolders'],
      },
    },
    description: 'Maximum results to return',
  },
];

export async function executeAsaOperation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const returnData: INodeExecutionData[] = [];

  try {
    const client = await getAlgodClient(this);

    switch (operation) {
      case 'createAsset': {
        const assetName = this.getNodeParameter('assetName', index) as string;
        const unitName = this.getNodeParameter('unitName', index) as string;
        const total = this.getNodeParameter('total', index) as number;
        const decimals = this.getNodeParameter('decimals', index) as number;

        const account = await getSigningAccount(this);
        const params = await getSuggestedParams(client);

        const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
          from: account.addr,
          total: BigInt(total),
          decimals,
          defaultFrozen: false,
          manager: account.addr,
          reserve: account.addr,
          freeze: account.addr,
          clawback: account.addr,
          unitName,
          assetName,
          suggestedParams: params,
        });

        const signedTxn = txn.signTxn(account.sk);
        const { txId } = await client.sendRawTransaction(signedTxn).do();
        const confirmedTxn = await waitForConfirmation(client, txId);
        const assetId = Number(confirmedTxn['asset-index']);

        returnData.push({
          json: {
            success: true,
            txId,
            assetId,
            assetName,
            unitName,
            total,
            decimals,
            creator: account.addr,
            confirmedRound: Number(confirmedTxn['confirmed-round']),
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getAssetInfo': {
        const assetId = this.getNodeParameter('assetId', index) as number;
        const assetInfo = await client.getAssetByID(assetId).do();
        returnData.push({
          json: {
            assetId,
            name: assetInfo.params.name,
            unitName: assetInfo.params['unit-name'],
            total: assetInfo.params.total,
            decimals: assetInfo.params.decimals,
            creator: assetInfo.params.creator,
            manager: assetInfo.params.manager,
            reserve: assetInfo.params.reserve,
            freeze: assetInfo.params.freeze,
            clawback: assetInfo.params.clawback,
            defaultFrozen: assetInfo.params['default-frozen'],
            url: assetInfo.params.url,
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'transfer': {
        const assetId = this.getNodeParameter('assetId', index) as number;
        const toAddress = this.getNodeParameter('toAddress', index) as string;
        const amount = this.getNodeParameter('amount', index) as number;

        if (!isValidAddress(toAddress)) {
          throw new Error('Invalid recipient address');
        }

        const account = await getSigningAccount(this);
        const params = await getSuggestedParams(client);

        const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          from: account.addr,
          to: toAddress,
          assetIndex: assetId,
          amount: BigInt(amount),
          suggestedParams: params,
        });

        const signedTxn = txn.signTxn(account.sk);
        const { txId } = await client.sendRawTransaction(signedTxn).do();
        const confirmedTxn = await waitForConfirmation(client, txId);

        returnData.push({
          json: {
            success: true,
            txId,
            assetId,
            from: account.addr,
            to: toAddress,
            amount,
            confirmedRound: Number(confirmedTxn['confirmed-round']),
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'optIn': {
        const assetId = this.getNodeParameter('assetId', index) as number;
        const account = await getSigningAccount(this);
        const params = await getSuggestedParams(client);

        const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          from: account.addr,
          to: account.addr,
          assetIndex: assetId,
          amount: 0,
          suggestedParams: params,
        });

        const signedTxn = txn.signTxn(account.sk);
        const { txId } = await client.sendRawTransaction(signedTxn).do();
        const confirmedTxn = await waitForConfirmation(client, txId);

        returnData.push({
          json: {
            success: true,
            txId,
            assetId,
            address: account.addr,
            confirmedRound: Number(confirmedTxn['confirmed-round']),
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'optOut': {
        const assetId = this.getNodeParameter('assetId', index) as number;
        const closeToAddress = this.getNodeParameter('closeToAddress', index) as string;

        if (!isValidAddress(closeToAddress)) {
          throw new Error('Invalid close-to address');
        }

        const account = await getSigningAccount(this);
        const params = await getSuggestedParams(client);

        const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          from: account.addr,
          to: closeToAddress,
          assetIndex: assetId,
          amount: 0,
          closeRemainderTo: closeToAddress,
          suggestedParams: params,
        });

        const signedTxn = txn.signTxn(account.sk);
        const { txId } = await client.sendRawTransaction(signedTxn).do();
        const confirmedTxn = await waitForConfirmation(client, txId);

        returnData.push({
          json: {
            success: true,
            txId,
            assetId,
            address: account.addr,
            closedTo: closeToAddress,
            confirmedRound: Number(confirmedTxn['confirmed-round']),
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'freeze': {
        const assetId = this.getNodeParameter('assetId', index) as number;
        const targetAddress = this.getNodeParameter('targetAddress', index) as string;
        const freezeState = this.getNodeParameter('freezeState', index) as boolean;

        if (!isValidAddress(targetAddress)) {
          throw new Error('Invalid target address');
        }

        const account = await getSigningAccount(this);
        const params = await getSuggestedParams(client);

        const txn = algosdk.makeAssetFreezeTxnWithSuggestedParamsFromObject({
          from: account.addr,
          assetIndex: assetId,
          freezeTarget: targetAddress,
          freezeState,
          suggestedParams: params,
        });

        const signedTxn = txn.signTxn(account.sk);
        const { txId } = await client.sendRawTransaction(signedTxn).do();
        const confirmedTxn = await waitForConfirmation(client, txId);

        returnData.push({
          json: {
            success: true,
            txId,
            assetId,
            targetAddress,
            frozen: freezeState,
            confirmedRound: Number(confirmedTxn['confirmed-round']),
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'clawback': {
        const assetId = this.getNodeParameter('assetId', index) as number;
        const targetAddress = this.getNodeParameter('targetAddress', index) as string;
        const amount = this.getNodeParameter('amount', index) as number;

        if (!isValidAddress(targetAddress)) {
          throw new Error('Invalid target address');
        }

        const account = await getSigningAccount(this);
        const params = await getSuggestedParams(client);

        const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          from: account.addr,
          to: account.addr,
          assetIndex: assetId,
          amount: BigInt(amount),
          revocationTarget: targetAddress,
          suggestedParams: params,
        });

        const signedTxn = txn.signTxn(account.sk);
        const { txId } = await client.sendRawTransaction(signedTxn).do();
        const confirmedTxn = await waitForConfirmation(client, txId);

        returnData.push({
          json: {
            success: true,
            txId,
            assetId,
            clawbackFrom: targetAddress,
            amount,
            confirmedRound: Number(confirmedTxn['confirmed-round']),
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'destroy': {
        const assetId = this.getNodeParameter('assetId', index) as number;
        const account = await getSigningAccount(this);
        const params = await getSuggestedParams(client);

        const txn = algosdk.makeAssetDestroyTxnWithSuggestedParamsFromObject({
          from: account.addr,
          assetIndex: assetId,
          suggestedParams: params,
        });

        const signedTxn = txn.signTxn(account.sk);
        const { txId } = await client.sendRawTransaction(signedTxn).do();
        const confirmedTxn = await waitForConfirmation(client, txId);

        returnData.push({
          json: {
            success: true,
            txId,
            assetId,
            destroyed: true,
            confirmedRound: Number(confirmedTxn['confirmed-round']),
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'searchAssets': {
        const searchQuery = this.getNodeParameter('searchQuery', index) as string;
        const limit = this.getNodeParameter('limit', index) as number;
        const indexer = await getIndexerClient(this);
        
        let search = indexer.searchForAssets().limit(limit);
        if (searchQuery) {
          search = search.name(searchQuery);
        }
        
        const response = await search.do();
        returnData.push({
          json: { assets: response.assets, totalAssets: response.assets.length },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getHolders': {
        const assetId = this.getNodeParameter('assetId', index) as number;
        const limit = this.getNodeParameter('limit', index) as number;
        const indexer = await getIndexerClient(this);
        const response = await indexer.searchAccounts().assetID(assetId).limit(limit).do();
        
        const holders = response.accounts.map((acc: any) => {
          const assetHolding = acc.assets?.find((a: any) => a['asset-id'] === assetId);
          return {
            address: acc.address,
            amount: assetHolding?.amount || 0,
            isFrozen: assetHolding?.['is-frozen'] || false,
          };
        });

        returnData.push({
          json: { assetId, holders, totalHolders: holders.length },
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
