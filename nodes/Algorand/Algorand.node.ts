/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-algorand/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class Algorand implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Algorand',
    name: 'algorand',
    icon: 'file:algorand.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Algorand API',
    defaults: {
      name: 'Algorand',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'algorandApi',
        required: true,
      },
    ],
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Accounts',
            value: 'accounts',
          },
          {
            name: 'Transactions',
            value: 'transactions',
          },
          {
            name: 'Assets',
            value: 'assets',
          },
          {
            name: 'Applications',
            value: 'applications',
          },
          {
            name: 'Blocks',
            value: 'blocks',
          },
          {
            name: 'Status',
            value: 'status',
          }
        ],
        default: 'accounts',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
    },
  },
  options: [
    {
      name: 'Get Account',
      value: 'getAccount',
      description: 'Retrieve account information including balance and assets',
      action: 'Get account information',
    },
    {
      name: 'Get Accounts',
      value: 'getAccounts',
      description: 'Search and list accounts with filters',
      action: 'Search accounts',
    },
    {
      name: 'Get Account Transactions',
      value: 'getAccountTransactions',
      description: 'Get transactions for a specific account',
      action: 'Get account transactions',
    },
    {
      name: 'Get Account Assets',
      value: 'getAccountAssets',
      description: 'Get assets held by an account',
      action: 'Get account assets',
    },
    {
      name: 'Get Account Applications',
      value: 'getAccountApplications',
      description: 'Get applications local state for an account',
      action: 'Get account applications',
    },
  ],
  default: 'getAccount',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
    },
  },
  options: [
    {
      name: 'Submit Transaction',
      value: 'submitTransaction',
      description: 'Submit a signed transaction to the network',
      action: 'Submit transaction',
    },
    {
      name: 'Get Pending Transactions',
      value: 'getPendingTransactions',
      description: 'Get pending transactions in the pool',
      action: 'Get pending transactions',
    },
    {
      name: 'Get Transaction',
      value: 'getTransaction',
      description: 'Get a specific transaction by ID',
      action: 'Get transaction by ID',
    },
    {
      name: 'Get Transaction Parameters',
      value: 'getTransactionParams',
      description: 'Get suggested transaction parameters',
      action: 'Get transaction parameters',
    },
    {
      name: 'Simulate Transaction',
      value: 'simulateTransaction',
      description: 'Simulate a transaction to preview effects',
      action: 'Simulate transaction',
    },
    {
      name: 'Delete Pending Transaction',
      value: 'deletePendingTransaction',
      description: 'Remove a pending transaction',
      action: 'Delete pending transaction',
    },
  ],
  default: 'submitTransaction',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['assets'],
    },
  },
  options: [
    {
      name: 'Get Assets',
      value: 'getAssets',
      description: 'Search and list assets',
      action: 'Get assets',
    },
    {
      name: 'Get Asset',
      value: 'getAsset',
      description: 'Get information about a specific asset',
      action: 'Get asset',
    },
    {
      name: 'Get Asset Balances',
      value: 'getAssetBalances',
      description: 'Get balances for a specific asset',
      action: 'Get asset balances',
    },
    {
      name: 'Get Asset Transactions',
      value: 'getAssetTransactions',
      description: 'Get transactions for a specific asset',
      action: 'Get asset transactions',
    },
  ],
  default: 'getAssets',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['applications'],
    },
  },
  options: [
    {
      name: 'Get Applications',
      value: 'getApplications',
      description: 'Search and list applications',
      action: 'Get applications',
    },
    {
      name: 'Get Application',
      value: 'getApplication',
      description: 'Get information about a specific application',
      action: 'Get application',
    },
    {
      name: 'Get Application Logs',
      value: 'getApplicationLogs',
      description: 'Get logs for an application',
      action: 'Get application logs',
    },
    {
      name: 'Get Application Box',
      value: 'getApplicationBox',
      description: 'Get application box data',
      action: 'Get application box',
    },
    {
      name: 'Get Application Boxes',
      value: 'getApplicationBoxes',
      description: 'List application boxes',
      action: 'Get application boxes',
    },
  ],
  default: 'getApplications',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['blocks'],
    },
  },
  options: [
    {
      name: 'Get Block',
      value: 'getBlock',
      description: 'Get a specific block by round number',
      action: 'Get block',
    },
    {
      name: 'Get Block Logs',
      value: 'getBlockLogs',
      description: 'Get logs for a specific block',
      action: 'Get block logs',
    },
    {
      name: 'Get Block Transactions',
      value: 'getBlockTransactions',
      description: 'Get transactions in a specific block',
      action: 'Get block transactions',
    },
    {
      name: 'Get Ledger Supply',
      value: 'getLedgerSupply',
      description: 'Get current supply information',
      action: 'Get ledger supply',
    },
  ],
  default: 'getBlock',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['status'],
    },
  },
  options: [
    {
      name: 'Get Status',
      value: 'getStatus',
      description: 'Get current node status',
      action: 'Get current node status',
    },
    {
      name: 'Wait For Block',
      value: 'waitForBlock',
      description: 'Wait for a block after specified round',
      action: 'Wait for block after specified round',
    },
    {
      name: 'Get Health',
      value: 'getHealth',
      description: 'Health check endpoint',
      action: 'Get health status',
    },
    {
      name: 'Get Sync Status',
      value: 'getSyncStatus',
      description: 'Get ledger sync status',
      action: 'Get ledger sync status',
    },
  ],
  default: 'getStatus',
},
      // Parameter definitions
{
  displayName: 'Account ID',
  name: 'accountId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccount'],
    },
  },
  default: '',
  description: 'The account address to retrieve information for',
},
{
  displayName: 'Include All',
  name: 'includeAll',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccount'],
    },
  },
  default: false,
  description: 'Include all items including closed accounts, deleted applications, destroyed assets, opted-out asset holdings, and closed-out application localstates',
},
{
  displayName: 'Exclude',
  name: 'exclude',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccount'],
    },
  },
  options: [
    {
      name: 'All',
      value: 'all',
    },
    {
      name: 'Assets',
      value: 'assets',
    },
    {
      name: 'Created Assets',
      value: 'created-assets',
    },
    {
      name: 'Apps Local State',
      value: 'apps-local-state',
    },
    {
      name: 'Created Apps',
      value: 'created-apps',
    },
  ],
  default: '',
  description: 'Exclude additional items',
},
{
  displayName: 'Asset ID',
  name: 'assetId',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccounts', 'getAccountAssets'],
    },
  },
  default: 0,
  description: 'Asset ID to filter by',
},
{
  displayName: 'Auth Address',
  name: 'authAddr',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccounts'],
    },
  },
  default: '',
  description: 'Include accounts configured to use this spending key',
},
{
  displayName: 'Currency Greater Than',
  name: 'currencyGreaterThan',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccounts', 'getAccountTransactions'],
    },
  },
  default: 0,
  description: 'Results should have an amount greater than this value',
},
{
  displayName: 'Currency Less Than',
  name: 'currencyLessThan',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccounts'],
    },
  },
  default: 0,
  description: 'Results should have an amount less than this value',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccounts', 'getAccountTransactions', 'getAccountAssets', 'getAccountApplications'],
    },
  },
  default: 100,
  description: 'Maximum number of results to return',
},
{
  displayName: 'Next',
  name: 'next',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccounts', 'getAccountTransactions', 'getAccountAssets', 'getAccountApplications'],
    },
  },
  default: '',
  description: 'The next page of results',
},
{
  displayName: 'Account ID',
  name: 'accountId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountTransactions'],
    },
  },
  default: '',
  description: 'The account address to get transactions for',
},
{
  displayName: 'After Time',
  name: 'afterTime',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountTransactions'],
    },
  },
  default: '',
  description: 'Include results after the given time (RFC 3339 formatted)',
},
{
  displayName: 'Before Time',
  name: 'beforeTime',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountTransactions'],
    },
  },
  default: '',
  description: 'Include results before the given time (RFC 3339 formatted)',
},
{
  displayName: 'Note Prefix',
  name: 'notePrefix',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountTransactions'],
    },
  },
  default: '',
  description: 'Specifies a prefix which must be contained in the note field',
},
{
  displayName: 'Transaction Type',
  name: 'txType',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountTransactions'],
    },
  },
  options: [
    {
      name: 'Payment',
      value: 'pay',
    },
    {
      name: 'Key Registration',
      value: 'keyreg',
    },
    {
      name: 'Asset Configuration',
      value: 'acfg',
    },
    {
      name: 'Asset Transfer',
      value: 'axfer',
    },
    {
      name: 'Asset Freeze',
      value: 'afrz',
    },
    {
      name: 'Application Call',
      value: 'appl',
    },
  ],
  default: '',
  description: 'Filter by transaction type',
},
{
  displayName: 'Signature Type',
  name: 'sigType',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountTransactions'],
    },
  },
  options: [
    {
      name: 'Signature',
      value: 'sig',
    },
    {
      name: 'Multi-signature',
      value: 'msig',
    },
    {
      name: 'Logic Signature',
      value: 'lsig',
    },
  ],
  default: '',
  description: 'Filter by signature type',
},
{
  displayName: 'Transaction ID',
  name: 'txid',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountTransactions'],
    },
  },
  default: '',
  description: 'Lookup the specific transaction by ID',
},
{
  displayName: 'Round',
  name: 'round',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountTransactions'],
    },
  },
  default: 0,
  description: 'Include results for the specified round',
},
{
  displayName: 'Account ID',
  name: 'accountId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountAssets'],
    },
  },
  default: '',
  description: 'The account address to get assets for',
},
{
  displayName: 'Include All',
  name: 'includeAll',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountAssets', 'getAccountApplications'],
    },
  },
  default: false,
  description: 'Include all items including closed accounts, deleted applications, destroyed assets, opted-out asset holdings, and closed-out application localstates',
},
{
  displayName: 'Account ID',
  name: 'accountId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountApplications'],
    },
  },
  default: '',
  description: 'The account address to get applications for',
},
{
  displayName: 'Application ID',
  name: 'applicationId',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountApplications'],
    },
  },
  default: 0,
  description: 'Application ID to filter by',
},
{
  displayName: 'Transaction Data',
  name: 'transactionData',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['submitTransaction'],
    },
  },
  default: '',
  description: 'The raw signed transaction data to submit',
},
{
  displayName: 'Format',
  name: 'format',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getPendingTransactions', 'getTransaction'],
    },
  },
  options: [
    {
      name: 'JSON',
      value: 'json',
    },
    {
      name: 'MessagePack',
      value: 'msgpack',
    },
  ],
  default: 'json',
  description: 'Response format',
},
{
  displayName: 'Max Results',
  name: 'max',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getPendingTransactions'],
    },
  },
  default: 100,
  description: 'Maximum number of transactions to return',
},
{
  displayName: 'Truncate',
  name: 'truncate',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getPendingTransactions'],
    },
  },
  default: false,
  description: 'Whether to truncate the response',
},
{
  displayName: 'Transaction ID',
  name: 'txid',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransaction', 'deletePendingTransaction'],
    },
  },
  default: '',
  description: 'The transaction ID',
},
{
  displayName: 'Transaction Data',
  name: 'transactionData',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['simulateTransaction'],
    },
  },
  default: '',
  description: 'The transaction data to simulate',
},
{
  displayName: 'Allow Empty Signatures',
  name: 'allowEmptySignatures',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['simulateTransaction'],
    },
  },
  default: false,
  description: 'Allow empty signatures in simulation',
},
{
  displayName: 'Allow More Logging',
  name: 'allowMoreLogging',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['simulateTransaction'],
    },
  },
  default: false,
  description: 'Enable more detailed logging in simulation',
},
{
  displayName: 'Asset ID',
  name: 'assetId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAsset', 'getAssetBalances', 'getAssetTransactions'],
    },
  },
  default: '',
  description: 'The ID of the asset',
},
{
  displayName: 'Asset ID',
  name: 'assetId',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssets'],
    },
  },
  default: '',
  description: 'Filter by asset ID',
},
{
  displayName: 'Creator',
  name: 'creator',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssets'],
    },
  },
  default: '',
  description: 'Filter by creator address',
},
{
  displayName: 'Name',
  name: 'name',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssets'],
    },
  },
  default: '',
  description: 'Filter by asset name',
},
{
  displayName: 'Unit',
  name: 'unit',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssets'],
    },
  },
  default: '',
  description: 'Filter by asset unit name',
},
{
  displayName: 'Include All',
  name: 'includeAll',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssets', 'getAsset', 'getAssetBalances'],
    },
  },
  default: false,
  description: 'Include all items, including closed accounts',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssets', 'getAssetBalances', 'getAssetTransactions'],
    },
  },
  default: 100,
  description: 'Maximum number of results to return',
  typeOptions: {
    minValue: 1,
    maxValue: 1000,
  },
},
{
  displayName: 'Next Token',
  name: 'next',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssets', 'getAssetBalances', 'getAssetTransactions'],
    },
  },
  default: '',
  description: 'Used for pagination to fetch next page of results',
},
{
  displayName: 'Currency Greater Than',
  name: 'currencyGreaterThan',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssetBalances', 'getAssetTransactions'],
    },
  },
  default: 0,
  description: 'Results should have an amount greater than this value',
},
{
  displayName: 'Currency Less Than',
  name: 'currencyLessThan',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssetBalances'],
    },
  },
  default: 0,
  description: 'Results should have an amount less than this value',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssetTransactions'],
    },
  },
  default: '',
  description: 'Filter by address',
},
{
  displayName: 'Address Role',
  name: 'addressRole',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssetTransactions'],
    },
  },
  options: [
    { name: 'Sender', value: 'sender' },
    { name: 'Receiver', value: 'receiver' },
    { name: 'Freeze Target', value: 'freeze-target' },
  ],
  default: '',
  description: 'Role of the address',
},
{
  displayName: 'After Time',
  name: 'afterTime',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssetTransactions'],
    },
  },
  default: '',
  description: 'Include transactions after this time (RFC 3339 format)',
},
{
  displayName: 'Before Time',
  name: 'beforeTime',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssetTransactions'],
    },
  },
  default: '',
  description: 'Include transactions before this time (RFC 3339 format)',
},
{
  displayName: 'Round',
  name: 'round',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssetTransactions'],
    },
  },
  default: 0,
  description: 'Include transactions from this round',
},
{
  displayName: 'Transaction Type',
  name: 'txType',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssetTransactions'],
    },
  },
  options: [
    { name: 'Payment', value: 'pay' },
    { name: 'Key Registration', value: 'keyreg' },
    { name: 'Asset Config', value: 'acfg' },
    { name: 'Asset Transfer', value: 'axfer' },
    { name: 'Asset Freeze', value: 'afrz' },
    { name: 'Application Call', value: 'appl' },
  ],
  default: '',
  description: 'Filter by transaction type',
},
{
  displayName: 'Signature Type',
  name: 'sigType',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssetTransactions'],
    },
  },
  options: [
    { name: 'Signature', value: 'sig' },
    { name: 'MultiSignature', value: 'msig' },
    { name: 'LogicSignature', value: 'lsig' },
  ],
  default: '',
  description: 'Filter by signature type',
},
{
  displayName: 'Transaction ID',
  name: 'txid',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssetTransactions'],
    },
  },
  default: '',
  description: 'Lookup the specific transaction',
},
{
  displayName: 'Note Prefix',
  name: 'notePrefix',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssetTransactions'],
    },
  },
  default: '',
  description: 'Base64 encoded prefix for transaction notes',
},
{
  displayName: 'Rekey To',
  name: 'rekeyTo',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssetTransactions'],
    },
  },
  default: '',
  description: 'Include transactions where this address is the rekey-to field',
},
{
  displayName: 'Application ID',
  name: 'applicationId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['applications'],
      operation: ['getApplication'],
    },
  },
  default: '',
  description: 'The ID of the application to retrieve',
},
{
  displayName: 'Application ID',
  name: 'applicationIdFilter',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['applications'],
      operation: ['getApplications'],
    },
  },
  default: '',
  description: 'Filter by application ID',
},
{
  displayName: 'Creator',
  name: 'creator',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['applications'],
      operation: ['getApplications'],
    },
  },
  default: '',
  description: 'Filter by the account that created the application',
},
{
  displayName: 'Include All',
  name: 'includeAll',
  type: 'boolean',
  required: false,
  displayOptions: {
    show: {
      resource: ['applications'],
      operation: ['getApplications', 'getApplication'],
    },
  },
  default: false,
  description: 'Include applications from all chains',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['applications'],
      operation: ['getApplications', 'getApplicationLogs', 'getApplicationBoxes'],
    },
  },
  default: 100,
  description: 'Maximum number of results to return',
},
{
  displayName: 'Next',
  name: 'next',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['applications'],
      operation: ['getApplications', 'getApplicationLogs', 'getApplicationBoxes'],
    },
  },
  default: '',
  description: 'Pagination token for the next page of results',
},
{
  displayName: 'Application ID',
  name: 'applicationId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['applications'],
      operation: ['getApplicationLogs'],
    },
  },
  default: '',
  description: 'The ID of the application to get logs for',
},
{
  displayName: 'Max Round',
  name: 'maxRound',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['applications'],
      operation: ['getApplicationLogs'],
    },
  },
  default: 0,
  description: 'Include results at or before the specified max-round',
},
{
  displayName: 'Min Round',
  name: 'minRound',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['applications'],
      operation: ['getApplicationLogs'],
    },
  },
  default: 0,
  description: 'Include results at or after the specified min-round',
},
{
  displayName: 'Sender Address',
  name: 'senderAddress',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['applications'],
      operation: ['getApplicationLogs'],
    },
  },
  default: '',
  description: 'Filter by the transaction sender address',
},
{
  displayName: 'Transaction ID',
  name: 'txid',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['applications'],
      operation: ['getApplicationLogs'],
    },
  },
  default: '',
  description: 'Filter by transaction ID',
},
{
  displayName: 'Application ID',
  name: 'applicationId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['applications'],
      operation: ['getApplicationBox'],
    },
  },
  default: '',
  description: 'The ID of the application to get box data for',
},
{
  displayName: 'Box Name',
  name: 'name',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['applications'],
      operation: ['getApplicationBox'],
    },
  },
  default: '',
  description: 'The name of the box to retrieve',
},
{
  displayName: 'Application ID',
  name: 'applicationId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['applications'],
      operation: ['getApplicationBoxes'],
    },
  },
  default: '',
  description: 'The ID of the application to list boxes for',
},
{
  displayName: 'Round Number',
  name: 'roundNumber',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['blocks'],
      operation: ['getBlock'],
    },
  },
  default: 0,
  description: 'The round number of the block to retrieve',
},
{
  displayName: 'Format',
  name: 'format',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['blocks'],
      operation: ['getBlock'],
    },
  },
  options: [
    {
      name: 'JSON',
      value: 'json',
    },
    {
      name: 'MessagePack',
      value: 'msgpack',
    },
  ],
  default: 'json',
  description: 'Response format',
},
{
  displayName: 'Round Number',
  name: 'roundNumber',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['blocks'],
      operation: ['getBlockLogs'],
    },
  },
  default: 0,
  description: 'The round number of the block to get logs for',
},
{
  displayName: 'Round Number',
  name: 'roundNumber',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['blocks'],
      operation: ['getBlockTransactions'],
    },
  },
  default: 0,
  description: 'The round number of the block to get transactions for',
},
{
  displayName: 'Round',
  name: 'round',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['blocks'],
      operation: ['getLedgerSupply'],
    },
  },
  default: 0,
  description: 'The round to get supply information for (optional, defaults to current round)',
},
{
  displayName: 'Round Number',
  name: 'roundNumber',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['status'],
      operation: ['waitForBlock'],
    },
  },
  default: 0,
  description: 'The round number to wait for a block after',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'accounts':
        return [await executeAccountsOperations.call(this, items)];
      case 'transactions':
        return [await executeTransactionsOperations.call(this, items)];
      case 'assets':
        return [await executeAssetsOperations.call(this, items)];
      case 'applications':
        return [await executeApplicationsOperations.call(this, items)];
      case 'blocks':
        return [await executeBlocksOperations.call(this, items)];
      case 'status':
        return [await executeStatusOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeAccountsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('algorandApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getAccount': {
          const accountId = this.getNodeParameter('accountId', i) as string;
          const includeAll = this.getNodeParameter('includeAll', i, false) as boolean;
          const exclude = this.getNodeParameter('exclude', i, '') as string;

          const queryParams = new URLSearchParams();
          if (includeAll) queryParams.append('include-all', 'true');
          if (exclude) queryParams.append('exclude', exclude);

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts/${accountId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
            headers: {
              'X-API-Key': credentials.apiKey,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAccounts': {
          const assetId = this.getNodeParameter('assetId', i, 0) as number;
          const authAddr = this.getNodeParameter('authAddr', i, '') as string;
          const currencyGreaterThan = this.getNodeParameter('currencyGreaterThan', i, 0) as number;
          const currencyLessThan = this.getNodeParameter('currencyLessThan', i, 0) as number;
          const limit = this.getNodeParameter('limit', i, 100) as number;
          const next = this.getNodeParameter('next', i, '') as string;

          const queryParams = new URLSearchParams();
          if (assetId) queryParams.append('asset-id', assetId.toString());
          if (authAddr) queryParams.append('auth-addr', authAddr);
          if (currencyGreaterThan) queryParams.append('currency-greater-than', currencyGreaterThan.toString());
          if (currencyLessThan) queryParams.append('currency-less-than', currencyLessThan.toString());
          if (limit) queryParams.append('limit', limit.toString());
          if (next) queryParams.append('next', next);

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
            headers: {
              'X-API-Key': credentials.apiKey,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAccountTransactions': {
          const accountId = this.getNodeParameter('accountId', i) as string;
          const afterTime = this.getNodeParameter('afterTime', i, '') as string;
          const beforeTime = this.getNodeParameter('beforeTime', i, '') as string;
          const currencyGreaterThan = this.getNodeParameter('currencyGreaterThan', i, 0) as number;
          const limit = this.getNodeParameter('limit', i, 100) as number;
          const next = this.getNodeParameter('next', i, '') as string;
          const notePrefix = this.getNodeParameter('notePrefix', i, '') as string;
          const txType = this.getNodeParameter('txType', i, '') as string;
          const sigType = this.getNodeParameter('sigType', i, '') as string;
          const txid = this.getNodeParameter('txid', i, '') as string;
          const round = this.getNodeParameter('round', i, 0) as number;

          const queryParams = new URLSearchParams();
          if (afterTime) queryParams.append('after-time', afterTime);
          if (beforeTime) queryParams.append('before-time', beforeTime);
          if (currencyGreaterThan) queryParams.append('currency-greater-than', currencyGreaterThan.toString());
          if (limit) queryParams.append('limit', limit.toString());
          if (next) queryParams.append('next', next);
          if (notePrefix) queryParams.append('note-prefix', Buffer.from(notePrefix).toString('base64'));
          if (txType) queryParams.append('tx-type', txType);
          if (sigType) queryParams.append('sig-type', sigType);
          if (txid) queryParams.append('txid', txid);
          if (round) queryParams.append('round', round.toString());

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts/${accountId}/transactions${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
            headers: {
              'X-API-Key': credentials.apiKey,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAccountAssets': {
          const accountId = this.getNodeParameter('accountId', i) as string;
          const assetId = this.getNodeParameter('assetId', i, 0) as number;
          const includeAll = this.getNodeParameter('includeAll', i, false) as boolean;
          const limit = this.getNodeParameter('limit', i, 100) as number;
          const next = this.getNodeParameter('next', i, '') as string;

          const queryParams = new URLSearchParams();
          if (assetId) queryParams.append('asset-id', assetId.toString());
          if (includeAll) queryParams.append('include-all', 'true');
          if (limit) queryParams.append('limit', limit.toString());
          if (next) queryParams.append('next', next);

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts/${accountId}/assets${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
            headers: {
              'X-API-Key': credentials.apiKey,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAccountApplications': {
          const accountId = this.getNodeParameter('accountId', i) as string;
          const applicationId = this.getNodeParameter('applicationId', i, 0) as number;
          const includeAll = this.getNodeParameter('includeAll', i, false) as boolean;
          const limit = this.getNodeParameter('limit', i, 100) as number;
          const next = this.getNodeParameter('next', i, '') as string;

          const queryParams = new URLSearchParams();
          if (applicationId) queryParams.append('application-id', applicationId.toString());
          if (includeAll) queryParams.append('include-all', 'true');
          if (limit) queryParams.append('limit', limit.toString());
          if (next) queryParams.append('next', next);

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/accounts/${accountId}/apps-local-state${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
            headers: {
              'X-API-Key': credentials.apiKey,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        if (error.response && error.response.body) {
          throw new NodeApiError(this.getNode(), error.response.body, { httpCode: error.response.status });
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }

  return returnData;
}

async function executeTransactionsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('algorandApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'submitTransaction': {
          const transactionData = this.getNodeParameter('transactionData', i) as string;
          
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/transactions`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/x-binary',
            },
            body: Buffer.from(transactionData, 'base64'),
            json: false,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getPendingTransactions': {
          const format = this.getNodeParameter('format', i, 'json') as string;
          const max = this.getNodeParameter('max', i, 100) as number;
          const truncate = this.getNodeParameter('truncate', i, false) as boolean;

          const queryParams = new URLSearchParams();
          if (format) queryParams.append('format', format);
          if (max) queryParams.append('max', max.toString());
          if (truncate) queryParams.append('truncate', truncate.toString());

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/transactions/pending?${queryParams.toString()}`,
            headers: {
              'X-API-Key': credentials.apiKey,
            },
            json: format === 'json',
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTransaction': {
          const txid = this.getNodeParameter('txid', i) as string;
          const format = this.getNodeParameter('format', i, 'json') as string;

          const queryParams = new URLSearchParams();
          if (format) queryParams.append('format', format);

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/transactions/${txid}?${queryParams.toString()}`,
            headers: {
              'X-API-Key': credentials.apiKey,
            },
            json: format === 'json',
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTransactionParams': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/transactions/params`,
            headers: {
              'X-API-Key': credentials.apiKey,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'simulateTransaction': {
          const transactionData = this.getNodeParameter('transactionData', i) as string;
          const allowEmptySignatures = this.getNodeParameter('allowEmptySignatures', i, false) as boolean;
          const allowMoreLogging = this.getNodeParameter('allowMoreLogging', i, false) as boolean;

          const queryParams = new URLSearchParams();
          if (allowEmptySignatures) queryParams.append('allow-empty-signatures', 'true');
          if (allowMoreLogging) queryParams.append('allow-more-logging', 'true');

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/transactions/simulate?${queryParams.toString()}`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/x-binary',
            },
            body: Buffer.from(transactionData, 'base64'),
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'deletePendingTransaction': {
          const txid = this.getNodeParameter('txid', i) as string;

          const options: any = {
            method: 'DELETE',
            url: `${credentials.baseUrl}/transactions/pending/${txid}`,
            headers: {
              'X-API-Key': credentials.apiKey,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(
            this.getNode(),
            `Unknown operation: ${operation}`,
          );
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeAssetsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('algorandApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      const baseUrl = credentials.baseUrl || 'https://mainnet-api.algonode.io/v2';

      switch (operation) {
        case 'getAssets': {
          const params: any = {};
          
          const assetId = this.getNodeParameter('assetId', i, '') as string;
          const creator = this.getNodeParameter('creator', i, '') as string;
          const name = this.getNodeParameter('name', i, '') as string;
          const unit = this.getNodeParameter('unit', i, '') as string;
          const includeAll = this.getNodeParameter('includeAll', i, false) as boolean;
          const limit = this.getNodeParameter('limit', i, 100) as number;
          const next = this.getNodeParameter('next', i, '') as string;

          if (assetId) params['asset-id'] = assetId;
          if (creator) params.creator = creator;
          if (name) params.name = name;
          if (unit) params.unit = unit;
          if (includeAll) params['include-all'] = true;
          if (limit) params.limit = limit;
          if (next) params.next = next;

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/assets`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            qs: params,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAsset': {
          const assetId = this.getNodeParameter('assetId', i) as string;
          const includeAll = this.getNodeParameter('includeAll', i, false) as boolean;

          const params: any = {};
          if (includeAll) params['include-all'] = true;

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/assets/${assetId}`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            qs: params,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAssetBalances': {
          const assetId = this.getNodeParameter('assetId', i) as string;
          const currencyGreaterThan = this.getNodeParameter('currencyGreaterThan', i, 0) as number;
          const currencyLessThan = this.getNodeParameter('currencyLessThan', i, 0) as number;
          const includeAll = this.getNodeParameter('includeAll', i, false) as boolean;
          const limit = this.getNodeParameter('limit', i, 100) as number;
          const next = this.getNodeParameter('next', i, '') as string;

          const params: any = {};
          if (currencyGreaterThan > 0) params['currency-greater-than'] = currencyGreaterThan;
          if (currencyLessThan > 0) params['currency-less-than'] = currencyLessThan;
          if (includeAll) params['include-all'] = true;
          if (limit) params.limit = limit;
          if (next) params.next = next;

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/assets/${assetId}/balances`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            qs: params,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAssetTransactions': {
          const assetId = this.getNodeParameter('assetId', i) as string;
          const address = this.getNodeParameter('address', i, '') as string;
          const addressRole = this.getNodeParameter('addressRole', i, '') as string;
          const afterTime = this.getNodeParameter('afterTime', i, '') as string;
          const beforeTime = this.getNodeParameter('beforeTime', i, '') as string;
          const currencyGreaterThan = this.getNodeParameter('currencyGreaterThan', i, 0) as number;
          const limit = this.getNodeParameter('limit', i, 100) as number;
          const next = this.getNodeParameter('next', i, '') as string;
          const notePrefix = this.getNodeParameter('notePrefix', i, '') as string;
          const rekeyTo = this.getNodeParameter('rekeyTo', i, '') as string;
          const round = this.getNodeParameter('round', i, 0) as number;
          const sigType = this.getNodeParameter('sigType', i, '') as string;
          const txType = this.getNodeParameter('txType', i, '') as string;
          const txid = this.getNodeParameter('txid', i, '') as string;

          const params: any = {};
          if (address) params.address = address;
          if (addressRole) params['address-role'] = addressRole;
          if (afterTime) params['after-time'] = afterTime;
          if (beforeTime) params['before-time'] = beforeTime;
          if (currencyGreaterThan > 0) params['currency-greater-than'] = currencyGreaterThan;
          if (limit) params.limit = limit;
          if (next) params.next = next;
          if (notePrefix) params['note-prefix'] = notePrefix;
          if (rekeyTo) params['rekey-to'] = rekeyTo;
          if (round > 0) params.round = round;
          if (sigType) params['sig-type'] = sigType;
          if (txType) params['tx-type'] = txType;
          if (txid) params.txid = txid;

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/assets/${assetId}/transactions`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            qs: params,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }
  return returnData;
}

async function executeApplicationsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('algorandApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getApplications': {
          const queryParams: any = {};
          
          const applicationIdFilter = this.getNodeParameter('applicationIdFilter', i) as string;
          const creator = this.getNodeParameter('creator', i) as string;
          const includeAll = this.getNodeParameter('includeAll', i) as boolean;
          const limit = this.getNodeParameter('limit', i) as number;
          const next = this.getNodeParameter('next', i) as string;

          if (applicationIdFilter) queryParams['application-id'] = applicationIdFilter;
          if (creator) queryParams.creator = creator;
          if (includeAll) queryParams['include-all'] = includeAll;
          if (limit) queryParams.limit = limit;
          if (next) queryParams.next = next;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/applications${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getApplication': {
          const applicationId = this.getNodeParameter('applicationId', i) as string;
          const includeAll = this.getNodeParameter('includeAll', i) as boolean;

          const queryParams: any = {};
          if (includeAll) queryParams['include-all'] = includeAll;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/applications/${applicationId}${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getApplicationLogs': {
          const applicationId = this.getNodeParameter('applicationId', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const maxRound = this.getNodeParameter('maxRound', i) as number;
          const minRound = this.getNodeParameter('minRound', i) as number;
          const next = this.getNodeParameter('next', i) as string;
          const senderAddress = this.getNodeParameter('senderAddress', i) as string;
          const txid = this.getNodeParameter('txid', i) as string;

          const queryParams: any = {};
          if (limit) queryParams.limit = limit;
          if (maxRound) queryParams['max-round'] = maxRound;
          if (minRound) queryParams['min-round'] = minRound;
          if (next) queryParams.next = next;
          if (senderAddress) queryParams['sender-address'] = senderAddress;
          if (txid) queryParams.txid = txid;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/applications/${applicationId}/logs${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getApplicationBox': {
          const applicationId = this.getNodeParameter('applicationId', i) as string;
          const name = this.getNodeParameter('name', i) as string;

          const queryParams: any = {
            name: name,
          };

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/applications/${applicationId}/box?${queryString}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getApplicationBoxes': {
          const applicationId = this.getNodeParameter('applicationId', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const next = this.getNodeParameter('next', i) as string;

          const queryParams: any = {};
          if (limit) queryParams.limit = limit;
          if (next) queryParams.next = next;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/applications/${applicationId}/boxes${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeBlocksOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('algorandApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getBlock': {
          const roundNumber = this.getNodeParameter('roundNumber', i) as number;
          const format = this.getNodeParameter('format', i, 'json') as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/v2/blocks/${roundNumber}`,
            headers: {
              'X-API-Key': credentials.apiKey,
            },
            json: format === 'json',
          };

          if (format === 'msgpack') {
            options.headers['Accept'] = 'application/msgpack';
            options.encoding = null;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlockLogs': {
          const roundNumber = this.getNodeParameter('roundNumber', i) as number;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/v2/blocks/${roundNumber}/logs`,
            headers: {
              'X-API-Key': credentials.apiKey,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlockTransactions': {
          const roundNumber = this.getNodeParameter('roundNumber', i) as number;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/v2/blocks/${roundNumber}/transactions`,
            headers: {
              'X-API-Key': credentials.apiKey,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getLedgerSupply': {
          const round = this.getNodeParameter('round', i, null) as number | null;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/v2/ledger/supply`,
            headers: {
              'X-API-Key': credentials.apiKey,
            },
            json: true,
          };

          if (round !== null && round > 0) {
            options.qs = { round };
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }

  return returnData;
}

async function executeStatusOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('algorandApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getStatus': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/status`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'waitForBlock': {
          const roundNumber = this.getNodeParameter('roundNumber', i) as number;
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/status/wait-for-block-after/${roundNumber}`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            json: true,
            timeout: 30000,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getHealth': {
          const options: any = {
            method: 'GET',
            url: credentials.baseUrl.replace('/v2', '') + '/health',
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getSyncStatus': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/ledger/sync`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
      
      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }
  
  return returnData;
}
