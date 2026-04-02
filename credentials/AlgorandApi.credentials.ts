import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AlgorandApi implements ICredentialType {
	name = 'algorandApi';
	displayName = 'Algorand API';
	documentationUrl = 'https://developer.algorand.org/docs/rest-apis/algod/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://mainnet-api.algonode.cloud/v2',
			required: true,
			description: 'The base URL for the Algorand API endpoint',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API key for authentication (optional for public endpoints, required for higher rate limits)',
		},
		{
			displayName: 'API Key Header Name',
			name: 'apiKeyHeader',
			type: 'string',
			default: 'X-API-Key',
			description: 'The header name for the API key (varies by provider)',
		},
	];
}