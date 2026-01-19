# n8n-nodes-algorand

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for interacting with the **Algorand blockchain**. This package provides extensive support for Algorand Standard Assets (ASAs), NFTs (ARC-3/ARC-69), Smart Contracts, Atomic Transfers, and more.

![Algorand](https://img.shields.io/badge/Algorand-000000?style=for-the-badge&logo=algorand&logoColor=white)
![n8n](https://img.shields.io/badge/n8n-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- 🔐 **Account Management** - Generate accounts, check balances, rekey accounts
- 💸 **Transactions** - Send ALGO, build/sign/submit transactions
- 🪙 **ASA Operations** - Create, transfer, freeze, clawback tokens
- 🎨 **NFT Support** - Create and manage ARC-3/ARC-69 NFTs
- 📜 **Smart Contracts** - Deploy, call, and manage applications
- 🔍 **Indexer Queries** - Search transactions, accounts, assets
- ⏰ **Trigger Node** - React to blockchain events in real-time
- 🛠️ **Utilities** - Unit conversion, address validation, TEAL compilation

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-algorand`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-algorand

# Restart n8n
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-algorand.git
cd n8n-nodes-algorand

# Install dependencies
npm install

# Build the package
npm run build

# Link to your local n8n
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-algorand

# Restart n8n
```

## Credentials Setup

### Algorand Network Credentials

| Field | Description |
|-------|-------------|
| Network | Mainnet, Testnet, Betanet, or Custom |
| API Provider | AlgoNode (free), PureStake, or Custom |
| Mnemonic | Your 25-word recovery phrase (for signing) |

**API Providers:**

- **AlgoNode** (Recommended): Free public API, no key required
- **PureStake**: Requires API key from [developer.purestake.io](https://developer.purestake.io)
- **Custom**: Your own Algod/Indexer endpoints

## Resources & Operations

### Account Operations
- Generate Account - Create new Algorand account
- Get Balance - Check ALGO balance
- Get Info - Detailed account information
- Get Assets - List ASA holdings
- Get Applications - List opted-in apps
- Get Transactions - Account transaction history
- Validate Address - Check address validity
- Rekey Account - Change authorized signer

### Transaction Operations
- Send ALGO - Payment transactions
- Get Transaction - Transaction details by ID
- Get Pending - Pending transaction info
- Wait for Confirmation - Wait for finality
- Get Suggested Params - Current network parameters
- Simulate - Test transactions without submitting

### ASA Operations
- Create Asset - Create new ASA
- Get Asset Info - Asset details
- Transfer - Send ASA tokens
- Opt In - Enable ASA receiving
- Opt Out - Remove ASA from account
- Freeze/Unfreeze - Control asset transfers
- Clawback - Reclaim assets
- Destroy - Delete assets
- Search Assets - Find assets
- Get Holders - List asset holders

### NFT Operations (ARC-3/ARC-69)
- Create ARC-3 NFT - Metadata on IPFS
- Create ARC-69 NFT - Metadata in note field
- Get NFT Info - NFT details
- Get Metadata - Fetch NFT metadata
- Transfer NFT - Send NFTs
- Verify Standard - Check ARC compliance

### Application Operations
- Get App Info - Application details
- Get Global State - Read global state
- Get Local State - Read account's local state
- Call App - Execute application
- Opt In - Subscribe to application
- Close Out - Unsubscribe from application
- Clear State - Force clear local state
- Read Box - Access box storage
- Get Box Names - List all boxes

### Block Operations
- Get Current Round - Latest block number
- Get Block - Block information
- Get Node Status - Network status
- Wait for Round - Wait for specific block

### Utility Operations
- ALGO to MicroAlgo - Unit conversion
- MicroAlgo to ALGO - Unit conversion
- Validate Address - Check address format
- Compile TEAL - Compile smart contract code

## Trigger Node

The Algorand Trigger node can monitor:

- **New Block** - Trigger on each new block
- **Transaction for Address** - Any transaction involving an address
- **Payment Received** - ALGO payments to an address
- **Payment Sent** - ALGO payments from an address
- **Asset Transfer** - ASA transfers for a specific asset
- **Asset Opt-In** - When accounts opt into an asset
- **Application Call** - Calls to a specific smart contract
- **Balance Change** - When an account's balance changes

## Usage Examples

### Send ALGO Payment

```json
{
  "resource": "transaction",
  "operation": "sendAlgo",
  "toAddress": "RECIPIENT_ADDRESS",
  "amount": 1.5,
  "note": "Payment for services"
}
```

### Create an ASA Token

```json
{
  "resource": "asa",
  "operation": "createAsset",
  "assetName": "My Token",
  "unitName": "MTK",
  "total": 1000000,
  "decimals": 6
}
```

### Create an ARC-3 NFT

```json
{
  "resource": "nft",
  "operation": "createArc3",
  "nftName": "My NFT",
  "unitName": "MNFT",
  "metadataUrl": "ipfs://QmYourMetadataHash#arc3"
}
```

## Algorand Concepts

### Units
- 1 ALGO = 1,000,000 microAlgos
- All on-chain amounts are in microAlgos

### Minimum Balance
- Base: 0.1 ALGO per account
- +0.1 ALGO per ASA opted-in
- +0.1 ALGO per app opted-in

### Transaction Finality
- ~4 seconds per block
- Transactions are final once confirmed

### NFT Standards
- **ARC-3**: Metadata stored on IPFS/URL
- **ARC-69**: Metadata in transaction note
- **ARC-19**: Mutable metadata via reserve address

## Networks

| Network | Description | AlgoNode URL |
|---------|-------------|--------------|
| Mainnet | Production network | mainnet-api.algonode.cloud |
| Testnet | Test network | testnet-api.algonode.cloud |
| Betanet | Beta features | betanet-api.algonode.cloud |

## Error Handling

All operations include comprehensive error handling:
- Invalid address validation
- Insufficient balance checks
- Transaction failure recovery
- Network timeout handling

## Security Best Practices

1. **Never share mnemonics** - Store securely in n8n credentials
2. **Use testnet first** - Test all workflows before mainnet
3. **Validate addresses** - Always validate before sending
4. **Monitor balances** - Ensure sufficient funds for fees

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Lint
npm run lint

# Fix lint issues
npm run lint:fix

# Run tests
npm test

# Test with coverage
npm run test:coverage
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
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Support

- 📖 [Documentation](https://github.com/Velocity-BPA/n8n-nodes-algorand/wiki)
- 🐛 [Issues](https://github.com/Velocity-BPA/n8n-nodes-algorand/issues)
- 💬 [Discussions](https://github.com/Velocity-BPA/n8n-nodes-algorand/discussions)

## Acknowledgments

- [Algorand Foundation](https://algorand.foundation/) for the blockchain platform
- [AlgoNode](https://algonode.io/) for free public API access
- [n8n](https://n8n.io/) for the workflow automation platform

---

**Disclaimer**: This package is not officially affiliated with Algorand Foundation or Algorand Inc. Use at your own risk. Always test thoroughly on testnet before using on mainnet.
