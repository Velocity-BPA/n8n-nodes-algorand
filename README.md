# n8n-nodes-algorand

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for interacting with the Algorand blockchain ecosystem. This node provides access to 6 core resources including accounts, transactions, assets, applications, blocks, and node health monitoring, enabling seamless integration of Algorand blockchain operations into your n8n workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Algorand](https://img.shields.io/badge/Algorand-Blockchain-green)
![SDK](https://img.shields.io/badge/Algorand%20SDK-Latest-orange)
![Web3](https://img.shields.io/badge/Web3-Ready-purple)

## Features

- **Complete Account Management** - Query account information, balances, assets, and application states
- **Transaction Operations** - Create, send, search, and monitor Algorand transactions with full parameter support
- **Asset Management** - Create, configure, transfer, and query Algorand Standard Assets (ASAs)
- **Application Interaction** - Deploy, call, update, and delete Algorand smart contracts and applications
- **Block Exploration** - Retrieve block information, transactions, and blockchain state data
- **Node Health Monitoring** - Check node status, synchronization state, and network health metrics
- **Multi-Network Support** - Works with MainNet, TestNet, and private Algorand networks
- **Comprehensive Error Handling** - Detailed error messages and retry mechanisms for blockchain operations

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
| API Key | Your Algorand node API key or service provider key | Yes |
| Server URL | Algorand node endpoint (MainNet/TestNet/Custom) | Yes |
| Port | API port number (default: 443 for HTTPS, 80 for HTTP) | No |
| Token Header | Custom header name for API key (default: X-API-Key) | No |

## Resources & Operations

### 1. Account

| Operation | Description |
|-----------|-------------|
| Get Account Info | Retrieve account balance, status, and configuration |
| List Assets | Get all assets owned by an account |
| List Applications | Get applications created by or opted into by account |
| Get Transactions | Retrieve transaction history for an account |

### 2. Transaction

| Operation | Description |
|-----------|-------------|
| Send Payment | Send ALGO or asset payment between accounts |
| Send Asset Transfer | Transfer Algorand Standard Assets (ASAs) |
| Get Transaction | Retrieve transaction details by ID |
| Search Transactions | Search transactions with filters and pagination |
| Get Pending | Check pending transactions in the transaction pool |

### 3. Asset

| Operation | Description |
|-----------|-------------|
| Create Asset | Create new Algorand Standard Asset (ASA) |
| Get Asset Info | Retrieve asset configuration and statistics |
| Configure Asset | Modify asset configuration parameters |
| Destroy Asset | Permanently destroy an asset |
| Freeze Asset | Freeze/unfreeze asset for specific account |
| Opt In | Opt account into receiving an asset |

### 4. Application

| Operation | Description |
|-----------|-------------|
| Create Application | Deploy new smart contract application |
| Call Application | Execute application with arguments |
| Update Application | Update existing application code |
| Delete Application | Remove application from blockchain |
| Get Application | Retrieve application information and state |
| Opt In | Opt account into application |

### 5. Block

| Operation | Description |
|-----------|-------------|
| Get Block | Retrieve block information by round number |
| Get Latest Block | Get the most recent block |
| Search Blocks | Search blocks within round range |
| Get Block Transactions | List all transactions in a specific block |

### 6. NodeHealth

| Operation | Description |
|-----------|-------------|
| Get Status | Check node synchronization and health status |
| Get Version | Retrieve node software version information |
| Get Metrics | Get node performance and network metrics |
| Check Ready | Verify if node is ready to process transactions |

## Usage Examples

```javascript
// Get account information and balance
{
  "resource": "Account",
  "operation": "Get Account Info",
  "address": "DPLD3RTSWC5STVBPZL5DIIVE2OC4BSAWTOYBLFN2X6EFLT2ZNF4SMX64UA"
}
```

```javascript
// Send ALGO payment
{
  "resource": "Transaction", 
  "operation": "Send Payment",
  "from": "SENDER_ADDRESS_HERE",
  "to": "RECEIVER_ADDRESS_HERE", 
  "amount": 1000000,
  "note": "Payment from n8n workflow"
}
```

```javascript
// Create new Algorand Standard Asset
{
  "resource": "Asset",
  "operation": "Create Asset", 
  "creator": "CREATOR_ADDRESS_HERE",
  "assetName": "MyToken",
  "unitName": "MTK",
  "total": 1000000,
  "decimals": 2,
  "url": "https://mytoken.com"
}
```

```javascript
// Get latest block information
{
  "resource": "Block",
  "operation": "Get Latest Block",
  "includeTransactions": true
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key and server URL in credentials |
| Account Not Found | Specified account address does not exist | Check account address format and ensure account exists |
| Insufficient Balance | Account lacks funds for transaction | Verify account balance covers amount plus fees |
| Asset Not Opted In | Account hasn't opted into the specified asset | Execute opt-in operation before asset transfer |
| Application Not Found | Smart contract application ID is invalid | Verify application exists and ID is correct |
| Node Unreachable | Cannot connect to Algorand node | Check network connectivity and node status |

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
- **Algorand Developer Docs**: [developer.algorand.org](https://developer.algorand.org)
- **Algorand Community**: [forum.algorand.org](https://forum.algorand.org)