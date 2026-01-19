/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Well-known Algorand Standard Assets (ASAs)
 */

export interface AssetInfo {
  id: number;
  name: string;
  unitName: string;
  decimals: number;
  network: string;
}

export const MAINNET_ASSETS: Record<string, AssetInfo> = {
  USDC: {
    id: 31566704,
    name: 'USDC',
    unitName: 'USDC',
    decimals: 6,
    network: 'mainnet',
  },
  USDT: {
    id: 312769,
    name: 'Tether USDt',
    unitName: 'USDt',
    decimals: 6,
    network: 'mainnet',
  },
  GOBTC: {
    id: 386192725,
    name: 'goBTC',
    unitName: 'goBTC',
    decimals: 8,
    network: 'mainnet',
  },
  GOETH: {
    id: 386195940,
    name: 'goETH',
    unitName: 'goETH',
    decimals: 8,
    network: 'mainnet',
  },
  PLANETS: {
    id: 27165954,
    name: 'PLANET',
    unitName: 'Planets',
    decimals: 6,
    network: 'mainnet',
  },
  YLDY: {
    id: 226701642,
    name: 'Yieldly',
    unitName: 'YLDY',
    decimals: 6,
    network: 'mainnet',
  },
  OPUL: {
    id: 287867876,
    name: 'Opulous',
    unitName: 'OPUL',
    decimals: 10,
    network: 'mainnet',
  },
  ALGO_GOLD: {
    id: 246516580,
    name: 'Algo Gold',
    unitName: 'Gold$',
    decimals: 6,
    network: 'mainnet',
  },
};

export const TESTNET_ASSETS: Record<string, AssetInfo> = {
  USDC_TEST: {
    id: 10458941,
    name: 'USDC (Test)',
    unitName: 'USDC',
    decimals: 6,
    network: 'testnet',
  },
};

/**
 * Get asset info by ID
 */
export function getAssetInfo(assetId: number, network: string): AssetInfo | undefined {
  const assets = network === 'mainnet' ? MAINNET_ASSETS : TESTNET_ASSETS;
  return Object.values(assets).find((asset) => asset.id === assetId);
}

/**
 * Get asset by name
 */
export function getAssetByName(name: string, network: string): AssetInfo | undefined {
  const assets = network === 'mainnet' ? MAINNET_ASSETS : TESTNET_ASSETS;
  return assets[name.toUpperCase()];
}
