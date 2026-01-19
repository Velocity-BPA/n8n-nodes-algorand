/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Well-known Algorand Applications (Smart Contracts)
 */

export interface ApplicationInfo {
  id: number;
  name: string;
  description: string;
  network: string;
}

export const MAINNET_APPLICATIONS: Record<string, ApplicationInfo> = {
  TINYMAN_V2: {
    id: 1002541853,
    name: 'Tinyman V2',
    description: 'Tinyman AMM V2 Router',
    network: 'mainnet',
  },
  ALGOFI_LENDING: {
    id: 818176933,
    name: 'AlgoFi Lending',
    description: 'AlgoFi Lending Protocol',
    network: 'mainnet',
  },
  FOLKS_LENDING: {
    id: 686498781,
    name: 'Folks Finance',
    description: 'Folks Finance Lending Protocol',
    network: 'mainnet',
  },
  PACT_AMM: {
    id: 620995314,
    name: 'Pact AMM',
    description: 'Pact Automated Market Maker',
    network: 'mainnet',
  },
};

export const TESTNET_APPLICATIONS: Record<string, ApplicationInfo> = {
  TINYMAN_V2_TEST: {
    id: 148607000,
    name: 'Tinyman V2 (Test)',
    description: 'Tinyman AMM V2 Router on Testnet',
    network: 'testnet',
  },
};

/**
 * Application state schema limits
 */
export const APP_STATE_LIMITS = {
  maxGlobalStateKeys: 64,
  maxLocalStateKeys: 16,
  maxKeyLength: 64,
  maxValueLength: 128,
  maxBoxNameLength: 64,
  maxBoxSize: 32768,
  maxBoxesPerApp: 65536,
};

/**
 * TEAL version limits
 */
export const TEAL_VERSIONS = {
  min: 2,
  max: 10,
  recommended: 10,
};
