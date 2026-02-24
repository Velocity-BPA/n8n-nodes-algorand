# n8n-nodes-algorand

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with the Algorand blockchain, implementing 6 core resources (Accounts, Transactions, Assets, Applications, Blocks, Status) to enable automated workflows for blockchain operations, asset management, smart contract interactions, and network monitoring.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Algorand](https://img.shields.io/badge/Algorand-Blockchain-00D4AA)
![API Version](https://img.shields.io/badge/Algorand%20API-v2-green)
![Network Support](https://img.shields.io/badge/Networks-MainNet%2FTestNet-orange)

## Features

- **Account Management** - Query account information, balances, and transaction history
- **Transaction Processing** - Submit, query, and monitor Algorand transactions 
- **Asset Operations** - Create, transfer, and manage Algorand Standard Assets (ASAs)
- **Smart Contract Integration** - Deploy and interact with Algorand applications
- **Block Explorer** - Retrieve block data and network information
- **Network Status** - Monitor node health and network parameters
- **Multi-Network Support** - Works with MainNet, TestNet, and custom networks
- **Real-time Monitoring** - Track blockchain events and status changes

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-algorand`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-algorand
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-algorand.git
cd n8n-nodes-algorand
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-algorand
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Token | Algorand API access token for authenticated requests | Yes |
| Server URL | Algorand node URL (e.g., https://mainnet-api.algonode.cloud) | Yes |
| Port | API port number (default: 443 for HTTPS) | No |
| Network | Target network (MainNet, TestNet, or Custom) | Yes |

## Resources & Operations

### 1. Accounts

| Operation | Description |
|-----------|-------------|
| Get Account Info | Retrieve account details, balance, and status |
| List Transactions | Get transaction history for an account |
| Get Assets | List assets owned by an account |
| Get Applications | Retrieve applications created or opted-into by account |

### 2. Transactions

| Operation | Description |
|-----------|-------------|
| Get Transaction | Retrieve transaction details by ID |
| Submit Transaction | Send a signed transaction to the network |
| Get Pending | List pending transactions in the pool |
| Search Transactions | Query transactions with filters |
| Wait for Confirmation | Poll for transaction confirmation |

### 3. Assets

| Operation | Description |
|-----------|-------------|
| Get Asset Info | Retrieve asset configuration and statistics |
| Search Assets | Find assets by name, creator, or other criteria |
| Get Asset Balances | List accounts holding a specific asset |
| Get Asset Transactions | Retrieve transaction history for an asset |

### 4. Applications

| Operation | Description |
|-----------|-------------|
| Get Application | Retrieve application details and global state |
| Search Applications | Find applications by creator or other filters |
| Get Box | Read application box storage |
| Search Boxes | List all boxes for an application |

### 5. Blocks

| Operation | Description |
|-----------|-------------|
| Get Block | Retrieve block details by round number |
| Get Latest Block | Get the most recent block |
| Get Block Hash | Retrieve block hash for a specific round |
| Get Block Transactions | List all transactions in a block |

### 6. Status

| Operation | Description |
|-----------|-------------|
| Get Node Status | Retrieve node health and sync status |
| Get Network Parameters | Get current network configuration |
| Wait for Block | Wait for a specific block round |
| Get Supply | Retrieve current ALGO supply information |

## Usage Examples

```javascript
// Get account information
const accountInfo = {
  "operation": "getAccountInfo",
  "address": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "include_all": true
};

// Submit a payment transaction
const paymentTx = {
  "operation": "submitTransaction", 
  "signed_txn": "gqNzaWfEQE...",
  "wait_for_confirmation": true
};

// Search for assets by name
const assetSearch = {
  "operation": "searchAssets",
  "name": "MyToken",
  "limit": 10
};

// Get latest block information
const latestBlock = {
  "operation": "getLatestBlock",
  "format": "json"
};
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| 400 Bad Request | Invalid parameters or malformed request | Check parameter format and required fields |
| 401 Unauthorized | Invalid or missing API token | Verify API token in credentials |
| 404 Not Found | Resource (account, transaction, etc.) not found | Confirm the resource exists on the network |
| 429 Rate Limited | Too many API requests | Implement delays between requests |
| 500 Internal Error | Node or network issue | Check node status and try alternative endpoint |
| Network Timeout | Connection timeout to Algorand node | Verify node URL and network connectivity |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-algorand/issues)
- **Algorand API Documentation**: [developer.algorand.org](https://developer.algorand.org/docs/rest-apis/algod/)
- **Algorand Developer Portal**: [developer.algorand.org](https://developer.algorand.org/)