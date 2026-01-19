/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import algosdk from 'algosdk';
import axios from 'axios';
import { getAlgodClient, getSigningAccount, getSuggestedParams, waitForConfirmation } from '../../transport/algodClient';
import { isValidAddress, encodeNote } from '../../utils/unitConverter';
import { ipfsToHttp, detectArcStandard, Arc3Metadata, Arc69Metadata } from '../../constants/arcs';

export const nftOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['nft'],
      },
    },
    options: [
      { name: 'Create ARC-3 NFT', value: 'createArc3', description: 'Create an ARC-3 NFT', action: 'Create ARC-3 NFT' },
      { name: 'Create ARC-69 NFT', value: 'createArc69', description: 'Create an ARC-69 NFT', action: 'Create ARC-69 NFT' },
      { name: 'Get NFT Info', value: 'getNftInfo', description: 'Get NFT information', action: 'Get NFT info' },
      { name: 'Get Metadata', value: 'getMetadata', description: 'Fetch NFT metadata', action: 'Get metadata' },
      { name: 'Transfer NFT', value: 'transfer', description: 'Transfer an NFT', action: 'Transfer NFT' },
      { name: 'Verify Standard', value: 'verifyStandard', description: 'Verify NFT standard compliance', action: 'Verify standard' },
    ],
    default: 'getNftInfo',
  },
];

export const nftFields: INodeProperties[] = [
  {
    displayName: 'Asset ID',
    name: 'assetId',
    type: 'number',
    default: 0,
    required: true,
    displayOptions: {
      show: {
        resource: ['nft'],
        operation: ['getNftInfo', 'getMetadata', 'transfer', 'verifyStandard'],
      },
    },
    description: 'The NFT Asset ID',
  },
  {
    displayName: 'NFT Name',
    name: 'nftName',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['nft'],
        operation: ['createArc3', 'createArc69'],
      },
    },
    description: 'Name of the NFT',
  },
  {
    displayName: 'Unit Name',
    name: 'unitName',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['nft'],
        operation: ['createArc3', 'createArc69'],
      },
    },
    description: 'Short unit name for the NFT',
  },
  {
    displayName: 'Metadata URL',
    name: 'metadataUrl',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['nft'],
        operation: ['createArc3'],
      },
    },
    description: 'IPFS or HTTP URL to metadata JSON (must end with #arc3)',
  },
  {
    displayName: 'Description',
    name: 'description',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['nft'],
        operation: ['createArc69'],
      },
    },
    description: 'NFT description',
  },
  {
    displayName: 'Media URL',
    name: 'mediaUrl',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['nft'],
        operation: ['createArc69'],
      },
    },
    description: 'URL to the media file',
  },
  {
    displayName: 'To Address',
    name: 'toAddress',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['nft'],
        operation: ['transfer'],
      },
    },
    description: 'Recipient address',
  },
];

export async function executeNftOperation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const returnData: INodeExecutionData[] = [];

  try {
    const client = await getAlgodClient(this);

    switch (operation) {
      case 'createArc3': {
        const nftName = this.getNodeParameter('nftName', index) as string;
        const unitName = this.getNodeParameter('unitName', index) as string;
        const metadataUrl = this.getNodeParameter('metadataUrl', index) as string;

        const account = await getSigningAccount(this);
        const params = await getSuggestedParams(client);

        const assetUrl = metadataUrl.endsWith('#arc3') ? metadataUrl : `${metadataUrl}#arc3`;

        const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
          from: account.addr,
          total: 1,
          decimals: 0,
          defaultFrozen: false,
          manager: account.addr,
          reserve: account.addr,
          freeze: undefined,
          clawback: undefined,
          unitName,
          assetName: nftName,
          assetURL: assetUrl,
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
            name: nftName,
            unitName,
            metadataUrl: assetUrl,
            standard: 'ARC-3',
            creator: account.addr,
            confirmedRound: Number(confirmedTxn['confirmed-round']),
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'createArc69': {
        const nftName = this.getNodeParameter('nftName', index) as string;
        const unitName = this.getNodeParameter('unitName', index) as string;
        const description = this.getNodeParameter('description', index) as string;
        const mediaUrl = this.getNodeParameter('mediaUrl', index) as string;

        const account = await getSigningAccount(this);
        const params = await getSuggestedParams(client);

        const arc69Metadata: Arc69Metadata = {
          standard: 'arc69',
          description,
          media_url: mediaUrl,
        };

        const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
          from: account.addr,
          total: 1,
          decimals: 0,
          defaultFrozen: false,
          manager: account.addr,
          reserve: account.addr,
          freeze: undefined,
          clawback: undefined,
          unitName,
          assetName: nftName,
          assetURL: mediaUrl,
          note: encodeNote(JSON.stringify(arc69Metadata)),
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
            name: nftName,
            unitName,
            mediaUrl,
            standard: 'ARC-69',
            metadata: arc69Metadata,
            creator: account.addr,
            confirmedRound: Number(confirmedTxn['confirmed-round']),
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getNftInfo': {
        const assetId = this.getNodeParameter('assetId', index) as number;
        const assetInfo = await client.getAssetByID(assetId).do();
        const standard = detectArcStandard(assetInfo.params.url, assetInfo.params.name);

        returnData.push({
          json: {
            assetId,
            name: assetInfo.params.name,
            unitName: assetInfo.params['unit-name'],
            url: assetInfo.params.url,
            creator: assetInfo.params.creator,
            total: assetInfo.params.total,
            decimals: assetInfo.params.decimals,
            standard,
            isNft: assetInfo.params.total === 1 && assetInfo.params.decimals === 0,
            manager: assetInfo.params.manager,
            reserve: assetInfo.params.reserve,
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getMetadata': {
        const assetId = this.getNodeParameter('assetId', index) as number;
        const assetInfo = await client.getAssetByID(assetId).do();
        const url = assetInfo.params.url;

        if (!url) {
          throw new Error('No metadata URL found for this asset');
        }

        const httpUrl = ipfsToHttp(url.replace('#arc3', ''));
        const response = await axios.get(httpUrl, { timeout: 10000 });
        const metadata = response.data as Arc3Metadata;

        returnData.push({
          json: {
            assetId,
            metadataUrl: url,
            metadata,
            standard: detectArcStandard(url, assetInfo.params.name),
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'transfer': {
        const assetId = this.getNodeParameter('assetId', index) as number;
        const toAddress = this.getNodeParameter('toAddress', index) as string;

        if (!isValidAddress(toAddress)) {
          throw new Error('Invalid recipient address');
        }

        const account = await getSigningAccount(this);
        const params = await getSuggestedParams(client);

        const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          from: account.addr,
          to: toAddress,
          assetIndex: assetId,
          amount: 1,
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
            confirmedRound: Number(confirmedTxn['confirmed-round']),
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'verifyStandard': {
        const assetId = this.getNodeParameter('assetId', index) as number;
        const assetInfo = await client.getAssetByID(assetId).do();
        const standard = detectArcStandard(assetInfo.params.url, assetInfo.params.name);

        const isNft = assetInfo.params.total === 1 && assetInfo.params.decimals === 0;
        const hasUrl = !!assetInfo.params.url;
        const isArc3 = standard === 'ARC3' && hasUrl && assetInfo.params.url.includes('#arc3');
        const isArc69 = standard === 'ARC69';
        const isArc19 = assetInfo.params.url?.startsWith('template-ipfs://');

        returnData.push({
          json: {
            assetId,
            isNft,
            standard,
            verification: {
              isArc3,
              isArc69,
              isArc19,
              hasMetadataUrl: hasUrl,
              isSingleUnit: assetInfo.params.total === 1,
              hasNoDecimals: assetInfo.params.decimals === 0,
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
