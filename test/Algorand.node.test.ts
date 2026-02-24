/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Algorand } from '../nodes/Algorand/Algorand.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Algorand Node', () => {
  let node: Algorand;

  beforeAll(() => {
    node = new Algorand();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Algorand');
      expect(node.description.name).toBe('algorand');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 6 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(6);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(6);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Accounts Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet-api.algonode.io/v2',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getAccount operation', () => {
    it('should retrieve account information successfully', async () => {
      const mockAccountData = {
        address: 'TESTACCOUNTADDRESS',
        amount: 1000000,
        assets: [],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number, defaultValue?: any) => {
        switch (param) {
          case 'operation': return 'getAccount';
          case 'accountId': return 'TESTACCOUNTADDRESS';
          case 'includeAll': return false;
          case 'exclude': return '';
          default: return defaultValue;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockAccountData);

      const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockAccountData);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.algonode.io/v2/accounts/TESTACCOUNTADDRESS',
        headers: { 'X-API-Key': 'test-api-key' },
        json: true,
      });
    });

    it('should handle API errors gracefully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number, defaultValue?: any) => {
        switch (param) {
          case 'operation': return 'getAccount';
          case 'accountId': return 'INVALID';
          default: return defaultValue;
        }
      });

      const apiError = new Error('Account not found');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('Account not found');
    });
  });

  describe('getAccounts operation', () => {
    it('should search accounts successfully', async () => {
      const mockAccountsData = {
        accounts: [
          { address: 'ACCOUNT1', amount: 1000000 },
          { address: 'ACCOUNT2', amount: 2000000 },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number, defaultValue?: any) => {
        switch (param) {
          case 'operation': return 'getAccounts';
          case 'limit': return 10;
          default: return defaultValue || 0 || '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockAccountsData);

      const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockAccountsData);
    });
  });

  describe('getAccountTransactions operation', () => {
    it('should retrieve account transactions successfully', async () => {
      const mockTransactionsData = {
        transactions: [
          { id: 'TXN1', type: 'pay', amount: 100000 },
          { id: 'TXN2', type: 'axfer', amount: 50000 },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number, defaultValue?: any) => {
        switch (param) {
          case 'operation': return 'getAccountTransactions';
          case 'accountId': return 'TESTACCOUNTADDRESS';
          case 'limit': return 100;
          default: return defaultValue || 0 || '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTransactionsData);

      const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockTransactionsData);
    });
  });

  describe('getAccountAssets operation', () => {
    it('should retrieve account assets successfully', async () => {
      const mockAssetsData = {
        assets: [
          { 'asset-id': 123, amount: 1000 },
          { 'asset-id': 456, amount: 2000 },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number, defaultValue?: any) => {
        switch (param) {
          case 'operation': return 'getAccountAssets';
          case 'accountId': return 'TESTACCOUNTADDRESS';
          case 'limit': return 100;
          case 'includeAll': return false;
          default: return defaultValue || 0 || '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockAssetsData);

      const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockAssetsData);
    });
  });

  describe('getAccountApplications operation', () => {
    it('should retrieve account applications successfully', async () => {
      const mockApplicationsData = {
        'apps-local-states': [
          { id: 789, 'key-value': [] },
          { id: 101112, 'key-value': [] },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number, defaultValue?: any) => {
        switch (param) {
          case 'operation': return 'getAccountApplications';
          case 'accountId': return 'TESTACCOUNTADDRESS';
          case 'limit': return 100;
          case 'includeAll': return false;
          default: return defaultValue || 0 || '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockApplicationsData);

      const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockApplicationsData);
    });
  });
});

describe('Transactions Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet-api.algonode.io/v2',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('submitTransaction', () => {
    it('should submit a transaction successfully', async () => {
      const mockResponse = { txId: 'test-tx-id' };
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'submitTransaction';
        if (param === 'transactionData') return 'dGVzdC10cmFuc2FjdGlvbg==';
        return undefined;
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://mainnet-api.algonode.io/v2/transactions',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/x-binary',
        },
        body: expect.any(Buffer),
        json: false,
      });
    });
  });

  describe('getPendingTransactions', () => {
    it('should get pending transactions successfully', async () => {
      const mockResponse = { transactions: [] };
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getPendingTransactions';
        if (param === 'format') return 'json';
        if (param === 'max') return 50;
        if (param === 'truncate') return false;
        return undefined;
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getTransaction', () => {
    it('should get a transaction by ID successfully', async () => {
      const mockResponse = { transaction: { id: 'test-tx-id' } };
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getTransaction';
        if (param === 'txid') return 'test-tx-id';
        if (param === 'format') return 'json';
        return undefined;
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getTransactionParams', () => {
    it('should get transaction parameters successfully', async () => {
      const mockResponse = { fee: 1000, 'genesis-hash': 'test-hash' };
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getTransactionParams';
        return undefined;
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('simulateTransaction', () => {
    it('should simulate a transaction successfully', async () => {
      const mockResponse = { txn_groups: [] };
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'simulateTransaction';
        if (param === 'transactionData') return 'dGVzdC10cmFuc2FjdGlvbg==';
        if (param === 'allowEmptySignatures') return true;
        if (param === 'allowMoreLogging') return false;
        return undefined;
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('deletePendingTransaction', () => {
    it('should delete a pending transaction successfully', async () => {
      const mockResponse = { success: true };
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'deletePendingTransaction';
        if (param === 'txid') return 'test-tx-id';
        return undefined;
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle API errors properly', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getTransactionParams';
        return undefined;
      });
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      await expect(
        executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow();
    });

    it('should continue on fail when configured', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getTransactionParams';
        return undefined;
      });
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const result = await executeTransactionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('API Error');
    });
  });
});

describe('Assets Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet-api.algonode.io/v2',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getAssets', () => {
    it('should get assets list successfully', async () => {
      const mockResponse = {
        assets: [
          {
            index: 123456,
            params: {
              name: 'Test Asset',
              'unit-name': 'TST',
              total: 1000000,
            },
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number, defaultValue?: any) => {
        const params: any = {
          operation: 'getAssets',
          limit: 100,
          includeAll: false,
          assetId: '',
          creator: '',
          name: '',
          unit: '',
          next: '',
        };
        return params[param] !== undefined ? params[param] : defaultValue;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.algonode.io/v2/assets',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        qs: { limit: 100 },
        json: true,
      });
    });
  });

  describe('getAsset', () => {
    it('should get specific asset successfully', async () => {
      const mockResponse = {
        asset: {
          index: 123456,
          params: {
            name: 'Test Asset',
            'unit-name': 'TST',
            total: 1000000,
          },
        },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number, defaultValue?: any) => {
        const params: any = {
          operation: 'getAsset',
          assetId: '123456',
          includeAll: false,
        };
        return params[param] !== undefined ? params[param] : defaultValue;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.algonode.io/v2/assets/123456',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        qs: {},
        json: true,
      });
    });
  });

  describe('getAssetBalances', () => {
    it('should get asset balances successfully', async () => {
      const mockResponse = {
        balances: [
          {
            address: 'ABC123...',
            amount: 1000,
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number, defaultValue?: any) => {
        const params: any = {
          operation: 'getAssetBalances',
          assetId: '123456',
          currencyGreaterThan: 0,
          currencyLessThan: 0,
          includeAll: false,
          limit: 100,
          next: '',
        };
        return params[param] !== undefined ? params[param] : defaultValue;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.algonode.io/v2/assets/123456/balances',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        qs: { limit: 100 },
        json: true,
      });
    });
  });

  describe('getAssetTransactions', () => {
    it('should get asset transactions successfully', async () => {
      const mockResponse = {
        transactions: [
          {
            id: 'ABC123...',
            'confirmed-round': 12345,
            'asset-transfer-transaction': {
              amount: 1000,
              'asset-id': 123456,
            },
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number, defaultValue?: any) => {
        const params: any = {
          operation: 'getAssetTransactions',
          assetId: '123456',
          address: '',
          addressRole: '',
          afterTime: '',
          beforeTime: '',
          currencyGreaterThan: 0,
          limit: 100,
          next: '',
          notePrefix: '',
          rekeyTo: '',
          round: 0,
          sigType: '',
          txType: '',
          txid: '',
        };
        return params[param] !== undefined ? params[param] : defaultValue;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.algonode.io/v2/assets/123456/transactions',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        qs: { limit: 100 },
        json: true,
      });
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getAsset';
        if (param === 'assetId') return '123456';
        return '';
      });

      const apiError = new Error('Asset not found');
      (apiError as any).httpCode = 404;
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);

      await expect(executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]))
        .rejects.toThrow('Asset not found');
    });

    it('should continue on fail when configured', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getAsset';
        if (param === 'assetId') return '123456';
        return '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([
        { json: { error: 'API Error' }, pairedItem: { item: 0 } }
      ]);
    });
  });
});

describe('Applications Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet-api.algonode.io/v2',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getApplications', () => {
    it('should successfully get applications', async () => {
      const mockResponse = {
        applications: [
          { id: 123, 'created-at-round': 1000 },
          { id: 456, 'created-at-round': 2000 },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation':
            return 'getApplications';
          case 'applicationIdFilter':
            return '';
          case 'creator':
            return '';
          case 'includeAll':
            return false;
          case 'limit':
            return 100;
          case 'next':
            return '';
          default:
            return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeApplicationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.algonode.io/v2/applications?limit=100',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('getApplication', () => {
    it('should successfully get a specific application', async () => {
      const mockResponse = {
        application: {
          id: 123,
          'created-at-round': 1000,
          params: { creator: 'ABCD...' },
        },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation':
            return 'getApplication';
          case 'applicationId':
            return '123';
          case 'includeAll':
            return false;
          default:
            return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeApplicationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.algonode.io/v2/applications/123',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('getApplicationLogs', () => {
    it('should successfully get application logs', async () => {
      const mockResponse = {
        'log-data': [
          { txid: 'ABC123', logs: ['log1', 'log2'] },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation':
            return 'getApplicationLogs';
          case 'applicationId':
            return '123';
          case 'limit':
            return 50;
          case 'maxRound':
            return 0;
          case 'minRound':
            return 0;
          case 'next':
            return '';
          case 'senderAddress':
            return '';
          case 'txid':
            return '';
          default:
            return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeApplicationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.algonode.io/v2/applications/123/logs?limit=50',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('getApplicationBox', () => {
    it('should successfully get application box data', async () => {
      const mockResponse = {
        name: 'box1',
        value: 'boxdata123',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation':
            return 'getApplicationBox';
          case 'applicationId':
            return '123';
          case 'name':
            return 'box1';
          default:
            return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeApplicationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.algonode.io/v2/applications/123/box?name=box1',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('getApplicationBoxes', () => {
    it('should successfully list application boxes', async () => {
      const mockResponse = {
        boxes: [
          { name: 'box1' },
          { name: 'box2' },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation':
            return 'getApplicationBoxes';
          case 'applicationId':
            return '123';
          case 'limit':
            return 100;
          case 'next':
            return '';
          default:
            return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeApplicationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.algonode.io/v2/applications/123/boxes?limit=100',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('error handling', () => {
    it('should handle API errors properly', async () => {
      const mockError = new Error('API Error');

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getApplication';
        if (paramName === 'applicationId') return '123';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

      await expect(
        executeApplicationsOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow();
    });

    it('should continue on fail when configured', async () => {
      const mockError = new Error('API Error');

      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getApplication';
        if (paramName === 'applicationId') return '123';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

      const result = await executeApplicationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Blocks Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet-api.algonode.io',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getBlock operation', () => {
    it('should get a block by round number successfully', async () => {
      const mockBlockData = {
        round: 12345,
        timestamp: 1640000000,
        transactions: [],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        if (param === 'operation') return 'getBlock';
        if (param === 'roundNumber') return 12345;
        if (param === 'format') return 'json';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockBlockData);

      const items = [{ json: {} }];
      const result = await executeBlocksOperations.call(mockExecuteFunctions, items);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.algonode.io/v2/blocks/12345',
        headers: {
          'X-API-Key': 'test-api-key',
        },
        json: true,
      });

      expect(result).toEqual([{
        json: mockBlockData,
        pairedItem: { item: 0 },
      }]);
    });

    it('should handle errors when getting block', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getBlock';
        if (param === 'roundNumber') return 99999;
        if (param === 'format') return 'json';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Block not found'));

      const items = [{ json: {} }];

      await expect(executeBlocksOperations.call(mockExecuteFunctions, items))
        .rejects.toThrow('Block not found');
    });
  });

  describe('getBlockLogs operation', () => {
    it('should get block logs successfully', async () => {
      const mockLogsData = {
        logs: ['log1', 'log2'],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getBlockLogs';
        if (param === 'roundNumber') return 12345;
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockLogsData);

      const items = [{ json: {} }];
      const result = await executeBlocksOperations.call(mockExecuteFunctions, items);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.algonode.io/v2/blocks/12345/logs',
        headers: {
          'X-API-Key': 'test-api-key',
        },
        json: true,
      });

      expect(result).toEqual([{
        json: mockLogsData,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('getBlockTransactions operation', () => {
    it('should get block transactions successfully', async () => {
      const mockTransactionsData = {
        transactions: [
          { id: 'tx1', type: 'pay' },
          { id: 'tx2', type: 'axfer' },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getBlockTransactions';
        if (param === 'roundNumber') return 12345;
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTransactionsData);

      const items = [{ json: {} }];
      const result = await executeBlocksOperations.call(mockExecuteFunctions, items);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.algonode.io/v2/blocks/12345/transactions',
        headers: {
          'X-API-Key': 'test-api-key',
        },
        json: true,
      });

      expect(result).toEqual([{
        json: mockTransactionsData,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('getLedgerSupply operation', () => {
    it('should get ledger supply successfully', async () => {
      const mockSupplyData = {
        current_round: 25000000,
        total_money: 10000000000000000,
        online_money: 6000000000000000,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getLedgerSupply';
        if (param === 'round') return null;
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockSupplyData);

      const items = [{ json: {} }];
      const result = await executeBlocksOperations.call(mockExecuteFunctions, items);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.algonode.io/v2/ledger/supply',
        headers: {
          'X-API-Key': 'test-api-key',
        },
        json: true,
      });

      expect(result).toEqual([{
        json: mockSupplyData,
        pairedItem: { item: 0 },
      }]);
    });

    it('should get ledger supply for specific round', async () => {
      const mockSupplyData = {
        current_round: 12345,
        total_money: 10000000000000000,
        online_money: 6000000000000000,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getLedgerSupply';
        if (param === 'round') return 12345;
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockSupplyData);

      const items = [{ json: {} }];
      const result = await executeBlocksOperations.call(mockExecuteFunctions, items);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.algonode.io/v2/ledger/supply',
        headers: {
          'X-API-Key': 'test-api-key',
        },
        json: true,
        qs: { round: 12345 },
      });

      expect(result).toEqual([{
        json: mockSupplyData,
        pairedItem: { item: 0 },
      }]);
    });
  });
});

describe('Status Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet-api.algonode.io/v2',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getStatus operation', () => {
    it('should get node status successfully', async () => {
      const mockResponse = {
        'last-round': 12345,
        'last-version': 'v1',
        'next-version': 'v2',
        'next-version-round': 12346,
        'next-version-supported': true,
        'time-since-last-round': 1000000000,
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getStatus');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeStatusOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.algonode.io/v2/status',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle getStatus errors', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getStatus');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const items = [{ json: {} }];
      
      await expect(executeStatusOperations.call(mockExecuteFunctions, items))
        .rejects.toThrow('API Error');
    });
  });

  describe('waitForBlock operation', () => {
    it('should wait for block successfully', async () => {
      const mockResponse = {
        'last-round': 12346,
        'last-version': 'v1',
        'next-version': 'v2',
        'next-version-round': 12347,
        'next-version-supported': true,
        'time-since-last-round': 1000000000,
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('waitForBlock')
        .mockReturnValueOnce(12345);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeStatusOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.algonode.io/v2/status/wait-for-block-after/12345',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
        timeout: 30000,
      });
    });
  });

  describe('getHealth operation', () => {
    it('should get health status successfully', async () => {
      const mockResponse = {
        data: { status: 'ok' },
        errors: null,
        message: 'Ready',
        round: 12345,
        version: 'v2.1.0',
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getHealth');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeStatusOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.algonode.io/health',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('getSyncStatus operation', () => {
    it('should get sync status successfully', async () => {
      const mockResponse = {
        'catchup-time': 0,
        'last-catchpoint': 'string',
        'last-round': 12345,
        'last-version': 'v1',
        'next-version': 'v2',
        'next-version-round': 12346,
        'next-version-supported': true,
        'stopped-at-unsupported-round': false,
        'time-since-last-round': 1000000000,
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getSyncStatus');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeStatusOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.algonode.io/v2/ledger/sync',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('error handling', () => {
    it('should continue on fail when configured', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getStatus');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const items = [{ json: {} }];
      const result = await executeStatusOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('API Error');
    });
  });
});
});
