/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Algorand Request for Comments (ARC) Standards
 * Focusing on NFT-related standards
 */

export interface ArcStandard {
  id: number;
  name: string;
  description: string;
  url: string;
}

export const ARC_STANDARDS: Record<string, ArcStandard> = {
  ARC3: {
    id: 3,
    name: 'ARC-3',
    description: 'Algorand Standard Asset Parameters Conventions for Fungible and Non-Fungible Tokens',
    url: 'https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0003.md',
  },
  ARC19: {
    id: 19,
    name: 'ARC-19',
    description: 'Templated NFT Standard',
    url: 'https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0019.md',
  },
  ARC69: {
    id: 69,
    name: 'ARC-69',
    description: 'ASA Parameters Conventions for Digital Media Tokens',
    url: 'https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0069.md',
  },
};

/**
 * ARC-3 Metadata JSON Schema
 */
export interface Arc3Metadata {
  name: string;
  description?: string;
  image?: string;
  image_integrity?: string;
  image_mimetype?: string;
  animation_url?: string;
  animation_url_integrity?: string;
  animation_url_mimetype?: string;
  external_url?: string;
  properties?: Record<string, unknown>;
  decimals?: number;
  background_color?: string;
}

/**
 * ARC-69 Metadata (stored in note field)
 */
export interface Arc69Metadata {
  standard: 'arc69';
  description?: string;
  external_url?: string;
  media_url?: string;
  properties?: Record<string, unknown>;
  mime_type?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

/**
 * Check if URL is IPFS
 */
export function isIpfsUrl(url: string): boolean {
  return url.startsWith('ipfs://') || url.includes('ipfs.io') || url.includes('pinata.cloud');
}

/**
 * Convert IPFS URL to HTTP gateway URL
 */
export function ipfsToHttp(url: string, gateway = 'https://ipfs.io/ipfs/'): string {
  if (url.startsWith('ipfs://')) {
    return gateway + url.slice(7);
  }
  return url;
}

/**
 * Detect ARC standard from asset
 */
export function detectArcStandard(
  assetUrl: string | undefined,
  assetName: string | undefined,
): 'ARC3' | 'ARC19' | 'ARC69' | 'unknown' {
  if (assetUrl) {
    if (assetUrl.endsWith('#arc3') || assetUrl.includes('arc3')) {
      return 'ARC3';
    }
    if (assetUrl.startsWith('template-ipfs://')) {
      return 'ARC19';
    }
  }
  if (assetName && assetName.endsWith('@arc3')) {
    return 'ARC3';
  }
  return 'unknown';
}
