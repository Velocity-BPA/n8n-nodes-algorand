/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import algosdk from 'algosdk';
import { getAlgodClient, getSigningAccount, getSuggestedParams, waitForConfirmation } from '../../transport/algodClient';
import { compileTeal, decodeGlobalState, decodeLocalState } from '../../utils/tealUtils';
import { parseMethodArgs } from '../../utils/abiEncoder';
import { isValidAddress } from '../../utils/unitConverter';

export const applicationOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['application'],
      },
    },
    options: [
      { name: 'Get App Info', value: 'getAppInfo', description: 'Get application information', action: 'Get app info' },
      { name: 'Get Global State', value: 'getGlobalState', description: 'Read global state', action: 'Get global state' },
      { name: 'Get Local State', value: 'getLocalState', description: 'Read local state for an account', action: 'Get local state' },
      { name: 'Call App', value: 'callApp', description: 'Call an application', action: 'Call app' },
      { name: 'Opt In', value: 'optIn', description: 'Opt into an application', action: 'Opt in' },
      { name: 'Close Out', value: 'closeOut', description: 'Close out of an application', action: 'Close out' },
      { name: 'Clear State', value: 'clearState', description: 'Clear application state', action: 'Clear state' },
      { name: 'Read Box', value: 'readBox', description: 'Read a box value', action: 'Read box' },
      { name: 'Get Box Names', value: 'getBoxNames', description: 'List box names', action: 'Get box names' },
    ],
    default: 'getAppInfo',
  },
];

export const applicationFields: INodeProperties[] = [
  {
    displayName: 'App ID',
    name: 'appId',
    type: 'number',
    default: 0,
    required: true,
    displayOptions: {
      show: {
        resource: ['application'],
        operation: ['getAppInfo', 'getGlobalState', 'getLocalState', 'callApp', 'optIn', 'closeOut', 'clearState', 'readBox', 'getBoxNames'],
      },
    },
    description: 'The application ID',
  },
  {
    displayName: 'Account Address',
    name: 'accountAddress',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['application'],
        operation: ['getLocalState'],
      },
    },
    description: 'Account address to read local state for',
  },
  {
    displayName: 'App Args',
    name: 'appArgs',
    type: 'json',
    default: '[]',
    displayOptions: {
      show: {
        resource: ['application'],
        operation: ['callApp'],
      },
    },
    description: 'Application arguments as JSON array of {type, value} objects',
  },
  {
    displayName: 'Box Name',
    name: 'boxName',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['application'],
        operation: ['readBox'],
      },
    },
    description: 'Name of the box to read',
  },
];

export async function executeApplicationOperation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const returnData: INodeExecutionData[] = [];

  try {
    const client = await getAlgodClient(this);

    switch (operation) {
      case 'getAppInfo': {
        const appId = this.getNodeParameter('appId', index) as number;
        const appInfo = await client.getApplicationByID(appId).do();

        returnData.push({
          json: {
            appId,
            creator: appInfo.params.creator,
            approvalProgram: appInfo.params['approval-program'],
            clearStateProgram: appInfo.params['clear-state-program'],
            globalStateSchema: appInfo.params['global-state-schema'],
            localStateSchema: appInfo.params['local-state-schema'],
            extraProgramPages: appInfo.params['extra-program-pages'],
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getGlobalState': {
        const appId = this.getNodeParameter('appId', index) as number;
        const appInfo = await client.getApplicationByID(appId).do();
        const globalState = appInfo.params['global-state'] || [];
        const decoded = decodeGlobalState(globalState);

        returnData.push({
          json: {
            appId,
            globalState: decoded,
            rawState: globalState,
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getLocalState': {
        const appId = this.getNodeParameter('appId', index) as number;
        const accountAddress = this.getNodeParameter('accountAddress', index) as string;

        if (!isValidAddress(accountAddress)) {
          throw new Error('Invalid account address');
        }

        const accountInfo = await client.accountApplicationInformation(accountAddress, appId).do();
        const localState = accountInfo['app-local-state']?.['key-value'] || [];
        const decoded = decodeLocalState(localState);

        returnData.push({
          json: {
            appId,
            account: accountAddress,
            localState: decoded,
            rawState: localState,
            schema: accountInfo['app-local-state']?.schema,
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'callApp': {
        const appId = this.getNodeParameter('appId', index) as number;
        const appArgsJson = this.getNodeParameter('appArgs', index) as string;

        let appArgs: Uint8Array[] = [];
        if (appArgsJson && appArgsJson !== '[]') {
          const parsedArgs = JSON.parse(appArgsJson);
          appArgs = parseMethodArgs(parsedArgs);
        }

        const account = await getSigningAccount(this);
        const params = await getSuggestedParams(client);

        const txn = algosdk.makeApplicationCallTxnFromObject({
          from: account.addr,
          appIndex: appId,
          onComplete: algosdk.OnApplicationComplete.NoOpOC,
          appArgs,
          suggestedParams: params,
        });

        const signedTxn = txn.signTxn(account.sk);
        const { txId } = await client.sendRawTransaction(signedTxn).do();
        const confirmedTxn = await waitForConfirmation(client, txId);

        returnData.push({
          json: {
            success: true,
            txId,
            appId,
            caller: account.addr,
            confirmedRound: Number(confirmedTxn['confirmed-round']),
            logs: confirmedTxn.logs as string[] || [],
            innerTxns: confirmedTxn['inner-txns'] as Record<string, unknown>[] || [],
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'optIn': {
        const appId = this.getNodeParameter('appId', index) as number;
        const account = await getSigningAccount(this);
        const params = await getSuggestedParams(client);

        const txn = algosdk.makeApplicationOptInTxnFromObject({
          from: account.addr,
          appIndex: appId,
          suggestedParams: params,
        });

        const signedTxn = txn.signTxn(account.sk);
        const { txId } = await client.sendRawTransaction(signedTxn).do();
        const confirmedTxn = await waitForConfirmation(client, txId);

        returnData.push({
          json: {
            success: true,
            txId,
            appId,
            account: account.addr,
            confirmedRound: Number(confirmedTxn['confirmed-round']),
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'closeOut': {
        const appId = this.getNodeParameter('appId', index) as number;
        const account = await getSigningAccount(this);
        const params = await getSuggestedParams(client);

        const txn = algosdk.makeApplicationCloseOutTxnFromObject({
          from: account.addr,
          appIndex: appId,
          suggestedParams: params,
        });

        const signedTxn = txn.signTxn(account.sk);
        const { txId } = await client.sendRawTransaction(signedTxn).do();
        const confirmedTxn = await waitForConfirmation(client, txId);

        returnData.push({
          json: {
            success: true,
            txId,
            appId,
            account: account.addr,
            confirmedRound: Number(confirmedTxn['confirmed-round']),
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'clearState': {
        const appId = this.getNodeParameter('appId', index) as number;
        const account = await getSigningAccount(this);
        const params = await getSuggestedParams(client);

        const txn = algosdk.makeApplicationClearStateTxnFromObject({
          from: account.addr,
          appIndex: appId,
          suggestedParams: params,
        });

        const signedTxn = txn.signTxn(account.sk);
        const { txId } = await client.sendRawTransaction(signedTxn).do();
        const confirmedTxn = await waitForConfirmation(client, txId);

        returnData.push({
          json: {
            success: true,
            txId,
            appId,
            account: account.addr,
            confirmedRound: Number(confirmedTxn['confirmed-round']),
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'readBox': {
        const appId = this.getNodeParameter('appId', index) as number;
        const boxName = this.getNodeParameter('boxName', index) as string;
        const boxNameBytes = new Uint8Array(Buffer.from(boxName, 'utf-8'));
        const boxResponse = await client.getApplicationBoxByName(appId, boxNameBytes).do();

        returnData.push({
          json: {
            appId,
            boxName,
            value: Buffer.from(boxResponse.value).toString('utf-8'),
            valueBase64: Buffer.from(boxResponse.value).toString('base64'),
            valueHex: Buffer.from(boxResponse.value).toString('hex'),
          },
          pairedItem: { item: index },
        });
        break;
      }

      case 'getBoxNames': {
        const appId = this.getNodeParameter('appId', index) as number;
        const boxesResponse = await client.getApplicationBoxes(appId).do();
        const boxNames = boxesResponse.boxes.map((box: { name: Uint8Array }) =>
          Buffer.from(box.name).toString('utf-8'),
        );

        returnData.push({
          json: {
            appId,
            boxNames,
            totalBoxes: boxNames.length,
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
