/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Algorand Network Configuration Constants
 */

export interface NetworkConfig {
  algodUrl: string;
  indexerUrl: string;
  genesisId: string;
  genesisHash: string;
}

export const ALGONODE_NETWORKS: Record<string, NetworkConfig> = {
  mainnet: {
    algodUrl: 'https://mainnet-api.algonode.cloud',
    indexerUrl: 'https://mainnet-idx.algonode.cloud',
    genesisId: 'mainnet-v1.0',
    genesisHash: 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=',
  },
  testnet: {
    algodUrl: 'https://testnet-api.algonode.cloud',
    indexerUrl: 'https://testnet-idx.algonode.cloud',
    genesisId: 'testnet-v1.0',
    genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
  },
  betanet: {
    algodUrl: 'https://betanet-api.algonode.cloud',
    indexerUrl: 'https://betanet-idx.algonode.cloud',
    genesisId: 'betanet-v1.0',
    genesisHash: 'mFgazF+2uRS1tMiL9dsj01hJGySEmPN28B/TjjvpVW0=',
  },
};

export const PURESTAKE_NETWORKS: Record<string, NetworkConfig> = {
  mainnet: {
    algodUrl: 'https://mainnet-algorand.api.purestake.io/ps2',
    indexerUrl: 'https://mainnet-algorand.api.purestake.io/idx2',
    genesisId: 'mainnet-v1.0',
    genesisHash: 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=',
  },
  testnet: {
    algodUrl: 'https://testnet-algorand.api.purestake.io/ps2',
    indexerUrl: 'https://testnet-algorand.api.purestake.io/idx2',
    genesisId: 'testnet-v1.0',
    genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
  },
  betanet: {
    algodUrl: 'https://betanet-algorand.api.purestake.io/ps2',
    indexerUrl: 'https://betanet-algorand.api.purestake.io/idx2',
    genesisId: 'betanet-v1.0',
    genesisHash: 'mFgazF+2uRS1tMiL9dsj01hJGySEmPN28B/TjjvpVW0=',
  },
};

export const SANDBOX_CONFIG: NetworkConfig = {
  algodUrl: 'http://localhost:4001',
  indexerUrl: 'http://localhost:8980',
  genesisId: 'sandnet-v1',
  genesisHash: '',
};

// Transaction fees and limits
export const MIN_TXN_FEE = 1000; // microAlgos
export const MIN_BALANCE = 100000; // microAlgos (0.1 ALGO)
export const MIN_BALANCE_PER_ASSET = 100000; // microAlgos per ASA opt-in
export const MIN_BALANCE_PER_APP = 100000; // microAlgos per app opt-in
export const MIN_BALANCE_PER_APP_UINT = 25000; // microAlgos per uint in app state
export const MIN_BALANCE_PER_APP_BYTESLICE = 25000; // microAlgos per byte slice
export const MIN_BALANCE_PER_BOX = 2500; // microAlgos per box
export const MIN_BALANCE_PER_BOX_BYTE = 400; // microAlgos per box byte

// Conversion constants
export const MICROALGOS_PER_ALGO = 1000000;

// Block time (approximate)
export const BLOCK_TIME_SECONDS = 4;
