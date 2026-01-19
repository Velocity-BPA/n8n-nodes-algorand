/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  ALGONODE_NETWORKS,
  PURESTAKE_NETWORKS,
  MIN_TXN_FEE,
  MIN_BALANCE,
  MICROALGOS_PER_ALGO,
} from '../../nodes/Algorand/constants/networks';

import {
  MAINNET_ASSETS,
  getAssetInfo,
  getAssetByName,
} from '../../nodes/Algorand/constants/assets';

import {
  ARC_STANDARDS,
  detectArcStandard,
  isIpfsUrl,
  ipfsToHttp,
} from '../../nodes/Algorand/constants/arcs';

describe('Network Constants', () => {
  describe('ALGONODE_NETWORKS', () => {
    it('should have mainnet configuration', () => {
      expect(ALGONODE_NETWORKS.mainnet).toBeDefined();
      expect(ALGONODE_NETWORKS.mainnet.algodUrl).toContain('mainnet');
      expect(ALGONODE_NETWORKS.mainnet.indexerUrl).toContain('mainnet');
    });

    it('should have testnet configuration', () => {
      expect(ALGONODE_NETWORKS.testnet).toBeDefined();
      expect(ALGONODE_NETWORKS.testnet.algodUrl).toContain('testnet');
    });

    it('should have betanet configuration', () => {
      expect(ALGONODE_NETWORKS.betanet).toBeDefined();
      expect(ALGONODE_NETWORKS.betanet.algodUrl).toContain('betanet');
    });
  });

  describe('PURESTAKE_NETWORKS', () => {
    it('should have mainnet configuration', () => {
      expect(PURESTAKE_NETWORKS.mainnet).toBeDefined();
      expect(PURESTAKE_NETWORKS.mainnet.algodUrl).toContain('purestake');
    });
  });

  describe('Constants', () => {
    it('should have correct MIN_TXN_FEE', () => {
      expect(MIN_TXN_FEE).toBe(1000);
    });

    it('should have correct MIN_BALANCE', () => {
      expect(MIN_BALANCE).toBe(100000);
    });

    it('should have correct MICROALGOS_PER_ALGO', () => {
      expect(MICROALGOS_PER_ALGO).toBe(1000000);
    });
  });
});

describe('Asset Constants', () => {
  describe('MAINNET_ASSETS', () => {
    it('should have USDC defined', () => {
      expect(MAINNET_ASSETS.USDC).toBeDefined();
      expect(MAINNET_ASSETS.USDC.id).toBe(31566704);
      expect(MAINNET_ASSETS.USDC.decimals).toBe(6);
    });

    it('should have USDT defined', () => {
      expect(MAINNET_ASSETS.USDT).toBeDefined();
    });
  });

  describe('getAssetInfo', () => {
    it('should return asset info for valid ID', () => {
      const info = getAssetInfo(31566704, 'mainnet');
      expect(info).toBeDefined();
      expect(info?.name).toBe('USDC');
    });

    it('should return undefined for invalid ID', () => {
      const info = getAssetInfo(999999999, 'mainnet');
      expect(info).toBeUndefined();
    });
  });

  describe('getAssetByName', () => {
    it('should return asset by name', () => {
      const info = getAssetByName('USDC', 'mainnet');
      expect(info).toBeDefined();
      expect(info?.id).toBe(31566704);
    });

    it('should be case insensitive', () => {
      const info = getAssetByName('usdc', 'mainnet');
      expect(info).toBeDefined();
    });
  });
});

describe('ARC Constants', () => {
  describe('ARC_STANDARDS', () => {
    it('should have ARC3 defined', () => {
      expect(ARC_STANDARDS.ARC3).toBeDefined();
      expect(ARC_STANDARDS.ARC3.id).toBe(3);
    });

    it('should have ARC69 defined', () => {
      expect(ARC_STANDARDS.ARC69).toBeDefined();
      expect(ARC_STANDARDS.ARC69.id).toBe(69);
    });
  });

  describe('isIpfsUrl', () => {
    it('should detect ipfs:// URLs', () => {
      expect(isIpfsUrl('ipfs://QmHash123')).toBe(true);
    });

    it('should detect ipfs.io URLs', () => {
      expect(isIpfsUrl('https://ipfs.io/ipfs/QmHash')).toBe(true);
    });

    it('should detect pinata URLs', () => {
      expect(isIpfsUrl('https://gateway.pinata.cloud/ipfs/QmHash')).toBe(true);
    });

    it('should return false for regular URLs', () => {
      expect(isIpfsUrl('https://example.com/image.png')).toBe(false);
    });
  });

  describe('ipfsToHttp', () => {
    it('should convert ipfs:// to http gateway', () => {
      const result = ipfsToHttp('ipfs://QmHash123');
      expect(result).toBe('https://ipfs.io/ipfs/QmHash123');
    });

    it('should leave http URLs unchanged', () => {
      const url = 'https://example.com/image.png';
      expect(ipfsToHttp(url)).toBe(url);
    });
  });

  describe('detectArcStandard', () => {
    it('should detect ARC3 from URL', () => {
      expect(detectArcStandard('ipfs://QmHash#arc3', 'MyNFT')).toBe('ARC3');
    });

    it('should detect ARC19 from template URL', () => {
      expect(detectArcStandard('template-ipfs://{ipfscid}', 'MyNFT')).toBe('ARC19');
    });

    it('should return unknown for regular URLs', () => {
      expect(detectArcStandard('https://example.com/nft.json', 'MyNFT')).toBe('unknown');
    });
  });
});
