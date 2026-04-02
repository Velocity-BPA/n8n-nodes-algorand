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
describe('Account Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://mainnet-api.algonode.cloud'
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
		it('should get account information successfully', async () => {
			const mockResponse = {
				account: {
					address: 'TESTADDRESS123',
					amount: 1000000,
					'amount-without-pending-rewards': 1000000,
					'min-balance': 100000,
					'pending-rewards': 0,
					'reward-base': 456,
					'rewards': 0,
					round: 123456,
					status: 'Online',
				},
			};

			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
				switch (param) {
					case 'operation':
						return 'getAccount';
					case 'address':
						return 'TESTADDRESS123';
					case 'exclude':
						return [];
					case 'format':
						return 'json';
					default:
						return undefined;
				}
			});

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeAccountOperations.call(mockExecuteFunctions, items);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://mainnet-api.algonode.cloud/v2/accounts/TESTADDRESS123',
				qs: {},
				headers: {
					'X-API-Key': 'test-key',
				},
				json: true,
			});
		});

		it('should handle getAccount errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
				switch (param) {
					case 'operation':
						return 'getAccount';
					case 'address':
						return 'INVALIDADDRESS';
					case 'exclude':
						return [];
					case 'format':
						return 'json';
					default:
						return undefined;
				}
			});

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Account not found'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const items = [{ json: {} }];
			const result = await executeAccountOperations.call(mockExecuteFunctions, items);

			expect(result).toHaveLength(1);
			expect(result[0].json.error).toBe('Account not found');
		});
	});

	describe('listAccounts operation', () => {
		it('should list accounts successfully', async () => {
			const mockResponse = {
				accounts: [
					{
						address: 'TESTADDRESS1',
						amount: 1000000,
					},
					{
						address: 'TESTADDRESS2',
						amount: 2000000,
					},
				],
				'next-token': 'next123',
			};

			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
				switch (param) {
					case 'operation':
						return 'listAccounts';
					case 'assetId':
						return 0;
					case 'authAddr':
						return '';
					case 'limit':
						return 100;
					case 'next':
						return '';
					case 'currencyGreaterThan':
						return 0;
					case 'currencyLessThan':
						return 0;
					default:
						return undefined;
				}
			});

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeAccountOperations.call(mockExecuteFunctions, items);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://mainnet-api.algonode.cloud/v2/accounts',
				qs: { limit: 100 },
				headers: {
					'X-API-Key': 'test-key',
				},
				json: true,
			});
		});

		it('should handle listAccounts errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
				switch (param) {
					case 'operation':
						return 'listAccounts';
					default:
						return 0;
				}
			});

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const items = [{ json: {} }];
			const result = await executeAccountOperations.call(mockExecuteFunctions, items);

			expect(result).toHaveLength(1);
			expect(result[0].json.error).toBe('API error');
		});
	});

	describe('getAccountTransactions operation', () => {
		it('should get account transactions successfully', async () => {
			const mockResponse = {
				transactions: [
					{
						id: 'TXN123',
						'confirmed-round': 123456,
						'round-time': 1234567890,
						sender: 'TESTADDRESS123',
					},
				],
				'next-token': 'next456',
			};

			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
				switch (param) {
					case 'operation':
						return 'getAccountTransactions';
					case 'address':
						return 'TESTADDRESS123';
					case 'notePrefix':
						return '';
					case 'txType':
						return '';
					case 'sigType':
						return '';
					case 'afterTime':
						return '';
					case 'beforeTime':
						return '';
					case 'limit':
						return 100;
					case 'next':
						return '';
					default:
						return undefined;
				}
			});

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeAccountOperations.call(mockExecuteFunctions, items);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://mainnet-api.algonode.cloud/v2/accounts/TESTADDRESS123/transactions',
				qs: { limit: 100 },
				headers: {
					'X-API-Key': 'test-key',
				},
				json: true,
			});
		});

		it('should handle getAccountTransactions errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
				switch (param) {
					case 'operation':
						return 'getAccountTransactions';
					case 'address':
						return 'INVALIDADDRESS';
					default:
						return '';
				}
			});

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid address'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const items = [{ json: {} }];
			const result = await executeAccountOperations.call(mockExecuteFunctions, items);

			expect(result).toHaveLength(1);
			expect(result[0].json.error).toBe('Invalid address');
		});
	});
});

describe('Transaction Resource', () => {
  let mockExecuteFunctions: any;
  
  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-api-key', 
        baseUrl: 'https://mainnet-api.algonode.cloud' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  test('listTransactions should make correct API call', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('listTransactions')
      .mockReturnValueOnce('')
      .mockReturnValueOnce('')
      .mockReturnValueOnce('')
      .mockReturnValueOnce('')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(100)
      .mockReturnValueOnce('')
      .mockReturnValueOnce('')
      .mockReturnValueOnce('');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ transactions: [] });

    const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://mainnet-api.algonode.cloud/v2/transactions?limit=100',
      headers: { 'X-API-Key': 'test-api-key' },
      json: true,
    });
    expect(result).toEqual([{ json: { transactions: [] }, pairedItem: { item: 0 } }]);
  });

  test('getPendingTransactions should make correct API call', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getPendingTransactions')
      .mockReturnValueOnce('ALGORAND_ADDRESS_123')
      .mockReturnValueOnce(50)
      .mockReturnValueOnce('json');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 'top-transactions': [] });

    const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://mainnet-api.algonode.cloud/v2/transactions/pending?address=ALGORAND_ADDRESS_123&max=50',
      headers: { 'X-API-Key': 'test-api-key' },
      json: true,
    });
    expect(result).toEqual([{ json: { 'top-transactions': [] }, pairedItem: { item: 0 } }]);
  });

  test('getTransaction should make correct API call', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getTransaction')
      .mockReturnValueOnce('TRANSACTION_ID_123')
      .mockReturnValueOnce('json');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ transaction: {} });

    const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://mainnet-api.algonode.cloud/v2/transactions/TRANSACTION_ID_123',
      headers: { 'X-API-Key': 'test-api-key' },
      json: true,
    });
    expect(result).toEqual([{ json: { transaction: {} }, pairedItem: { item: 0 } }]);
  });

  test('submitTransaction should make correct API call', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('submitTransaction')
      .mockReturnValueOnce('base64encodedtransaction');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ txId: 'SUBMITTED_TX_ID' });

    const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://mainnet-api.algonode.cloud/v2/transactions',
      headers: { 
        'X-API-Key': 'test-api-key',
        'Content-Type': 'application/x-binary'
      },
      body: Buffer.from('base64encodedtransaction', 'base64'),
      json: false,
    });
    expect(result).toEqual([{ json: { txId: 'SUBMITTED_TX_ID' }, pairedItem: { item: 0 } }]);
  });

  test('getTransactionParams should make correct API call', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getTransactionParams');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
      'consensus-version': 'v1',
      'fee': 1000,
      'genesis-hash': 'hash123',
      'genesis-id': 'mainnet-v1.0',
      'last-round': 12345,
      'min-fee': 1000
    });

    const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://mainnet-api.algonode.cloud/v2/transactions/params',
      headers: { 'X-API-Key': 'test-api-key' },
      json: true,
    });
    expect(result[0].json).toHaveProperty('consensus-version');
  });

  test('should handle errors gracefully when continueOnFail is true', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getTransaction');
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
  });

  test('should throw error when continueOnFail is false', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getTransaction');
    mockExecuteFunctions.continueOnFail.mockReturnValue(false);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    await expect(executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('API Error');
  });
});

describe('Asset Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({ 
				apiKey: 'test-api-key', 
				baseUrl: 'https://mainnet-api.algonode.cloud/v2' 
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: { 
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn() 
			},
		};
	});

	describe('listAssets operation', () => {
		it('should list assets successfully', async () => {
			const mockResponse = { assets: [{ id: 1, name: 'TestAsset' }] };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('listAssets')
				.mockReturnValueOnce(null)
				.mockReturnValueOnce('')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('')
				.mockReturnValueOnce(100)
				.mockReturnValueOnce('')
				.mockReturnValueOnce(false);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});

		it('should handle listAssets error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('listAssets');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('getAsset operation', () => {
		it('should get asset successfully', async () => {
			const mockResponse = { asset: { id: 123, name: 'TestAsset' } };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAsset')
				.mockReturnValueOnce(123)
				.mockReturnValueOnce(false);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});

		it('should handle getAsset error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAsset');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Asset not found'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'Asset not found' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('getAssetBalances operation', () => {
		it('should get asset balances successfully', async () => {
			const mockResponse = { balances: [{ address: 'ABC123', amount: 1000 }] };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAssetBalances')
				.mockReturnValueOnce(123)
				.mockReturnValueOnce(null)
				.mockReturnValueOnce(null)
				.mockReturnValueOnce(100)
				.mockReturnValueOnce('')
				.mockReturnValueOnce(false);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});

		it('should handle getAssetBalances error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAssetBalances');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Balances not found'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'Balances not found' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('getAssetTransactions operation', () => {
		it('should get asset transactions successfully', async () => {
			const mockResponse = { transactions: [{ id: 'TXN123', type: 'axfer' }] };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAssetTransactions')
				.mockReturnValueOnce(123)
				.mockReturnValueOnce('')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('')
				.mockReturnValueOnce(false)
				.mockReturnValueOnce('')
				.mockReturnValueOnce('')
				.mockReturnValueOnce(100)
				.mockReturnValueOnce('');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});

		it('should handle getAssetTransactions error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAssetTransactions');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Transactions not found'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'Transactions not found' }, pairedItem: { item: 0 } }]);
		});
	});
});

describe('Application Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://mainnet-api.algonode.cloud',
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

	it('should list applications successfully', async () => {
		mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
			switch (param) {
				case 'operation': return 'listApplications';
				case 'limit': return 100;
				default: return '';
			}
		});

		const mockResponse = { applications: [] };
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const items = [{ json: {} }];
		const result = await executeApplicationOperations.call(mockExecuteFunctions, items);

		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://mainnet-api.algonode.cloud/v2/applications?limit=100',
			headers: { 'X-API-Key': 'test-key' },
			json: true,
		});
	});

	it('should get application successfully', async () => {
		mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
			switch (param) {
				case 'operation': return 'getApplication';
				case 'applicationId': return '123456';
				case 'includeAll': return false;
				default: return '';
			}
		});

		const mockResponse = { id: 123456 };
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const items = [{ json: {} }];
		const result = await executeApplicationOperations.call(mockExecuteFunctions, items);

		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://mainnet-api.algonode.cloud/v2/applications/123456',
			headers: { 'X-API-Key': 'test-key' },
			json: true,
		});
	});

	it('should get application logs successfully', async () => {
		mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
			switch (param) {
				case 'operation': return 'getApplicationLogs';
				case 'applicationId': return '123456';
				case 'limit': return 50;
				default: return '';
			}
		});

		const mockResponse = { logs: [] };
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const items = [{ json: {} }];
		const result = await executeApplicationOperations.call(mockExecuteFunctions, items);

		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://mainnet-api.algonode.cloud/v2/applications/123456/logs?limit=50',
			headers: { 'X-API-Key': 'test-key' },
			json: true,
		});
	});

	it('should get application box successfully', async () => {
		mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
			switch (param) {
				case 'operation': return 'getApplicationBox';
				case 'applicationId': return '123456';
				case 'name': return 'box-name';
				default: return '';
			}
		});

		const mockResponse = { name: 'box-name', value: 'data' };
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const items = [{ json: {} }];
		const result = await executeApplicationOperations.call(mockExecuteFunctions, items);

		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://mainnet-api.algonode.cloud/v2/applications/123456/box?name=box-name',
			headers: { 'X-API-Key': 'test-key' },
			json: true,
		});
	});

	it('should get application boxes successfully', async () => {
		mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
			switch (param) {
				case 'operation': return 'getApplicationBoxes';
				case 'applicationId': return '123456';
				case 'limit': return 10;
				default: return '';
			}
		});

		const mockResponse = { boxes: [] };
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const items = [{ json: {} }];
		const result = await executeApplicationOperations.call(mockExecuteFunctions, items);

		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://mainnet-api.algonode.cloud/v2/applications/123456/boxes?limit=10',
			headers: { 'X-API-Key': 'test-key' },
			json: true,
		});
	});

	it('should handle errors when continueOnFail is true', async () => {
		mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
			switch (param) {
				case 'operation': return 'getApplication';
				case 'applicationId': return '123456';
				default: return '';
			}
		});
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

		const items = [{ json: {} }];
		const result = await executeApplicationOperations.call(mockExecuteFunctions, items);

		expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
	});

	it('should throw error when continueOnFail is false', async () => {
		mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
			switch (param) {
				case 'operation': return 'getApplication';
				case 'applicationId': return '123456';
				default: return '';
			}
		});
		mockExecuteFunctions.continueOnFail.mockReturnValue(false);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

		const items = [{ json: {} }];

		await expect(executeApplicationOperations.call(mockExecuteFunctions, items)).rejects.toThrow('API Error');
	});
});

describe('Block Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({ 
				apiKey: 'test-key', 
				baseUrl: 'https://mainnet-api.algonode.cloud' 
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: { 
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn() 
			},
		};
	});

	describe('getBlock operation', () => {
		it('should get block information successfully', async () => {
			const mockResponse = { block: { round: 123, transactions: [] } };
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getBlock');
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce(123);
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('json');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://mainnet-api.algonode.cloud/v2/blocks/123',
				headers: { 'X-API-Key': 'test-key' },
				json: true,
			});
		});

		it('should handle error when getting block fails', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getBlock');
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce(123);
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('json');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Block not found'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'Block not found' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('getStatus operation', () => {
		it('should get node status successfully', async () => {
			const mockResponse = { 'last-round': 12345, 'time-since-last-round': 4000000000 };
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getStatus');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://mainnet-api.algonode.cloud/v2/status',
				headers: { 'X-API-Key': 'test-key' },
				json: true,
			});
		});

		it('should handle error when getting status fails', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getStatus');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Service unavailable'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'Service unavailable' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('waitForBlock operation', () => {
		it('should wait for block successfully', async () => {
			const mockResponse = { 'last-round': 12346 };
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('waitForBlock');
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce(12345);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://mainnet-api.algonode.cloud/v2/status/wait-for-block-after/12345',
				headers: { 'X-API-Key': 'test-key' },
				json: true,
			});
		});
	});

	describe('getLedgerSupply operation', () => {
		it('should get ledger supply successfully', async () => {
			const mockResponse = { 'current_round': 12345, 'total-money': 10000000000 };
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getLedgerSupply');
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce(0);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://mainnet-api.algonode.cloud/v2/ledger/supply',
				headers: { 'X-API-Key': 'test-key' },
				json: true,
			});
		});
	});
});

describe('NodeHealth Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-api-key',
				baseUrl: 'https://mainnet-api.algonode.cloud/v2',
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

	describe('getHealth operation', () => {
		it('should get node health status successfully', async () => {
			const mockResponse = { status: 'healthy' };
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getHealth');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeNodeHealthOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://mainnet-api.algonode.cloud/v2/health',
				headers: {
					'X-API-Key': 'test-api-key',
				},
				json: true,
			});
			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});

		it('should handle getHealth errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getHealth');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Health check failed'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeNodeHealthOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'Health check failed' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('getReady operation', () => {
		it('should check node readiness successfully', async () => {
			const mockResponse = { ready: true };
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getReady');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeNodeHealthOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://mainnet-api.algonode.cloud/v2/ready',
				headers: {
					'X-API-Key': 'test-api-key',
				},
				json: true,
			});
			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});

		it('should handle getReady errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getReady');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Node not ready'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeNodeHealthOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'Node not ready' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('getMetrics operation', () => {
		it('should get node metrics successfully', async () => {
			const mockResponse = { metrics: { cpu_usage: 45.2, memory_usage: 67.8 } };
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getMetrics');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeNodeHealthOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://mainnet-api.algonode.cloud/v2/metrics',
				headers: {
					'X-API-Key': 'test-api-key',
				},
				json: true,
			});
			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});

		it('should handle getMetrics errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getMetrics');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Metrics unavailable'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeNodeHealthOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'Metrics unavailable' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('getVersions operation', () => {
		it('should get version information successfully', async () => {
			const mockResponse = { 
				versions: ['v1', 'v2'], 
				build: { major: 3, minor: 14, build_number: 0 } 
			};
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getVersions');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeNodeHealthOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://mainnet-api.algonode.cloud/v2/versions',
				headers: {
					'X-API-Key': 'test-api-key',
				},
				json: true,
			});
			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});

		it('should handle getVersions errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getVersions');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Version info unavailable'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeNodeHealthOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'Version info unavailable' }, pairedItem: { item: 0 } }]);
		});
	});
});
});
