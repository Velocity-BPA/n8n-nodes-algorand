import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AlgorandApi implements ICredentialType {
	name = 'algorandApi';
	displayName = 'Algorand API';
	documentationUrl = 'https://docs.n8n.io/integrations/builtin/credentials/algorand/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API key for authentication with Algorand node services',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://mainnet-api.algonode.io/v2',
			description: 'Base URL for the Algorand API endpoint',
			placeholder: 'https://mainnet-api.algonode.io/v2',
		},
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			options: [
				{
					name: 'MainNet',
					value: 'mainnet',
				},
				{
					name: 'TestNet',
					value: 'testnet',
				},
				{
					name: 'BetaNet',
					value: 'betanet',
				},
				{
					name: 'Custom',
					value: 'custom',
				},
			],
			default: 'mainnet',
			description: 'The Algorand network to connect to',
		},
	];
}