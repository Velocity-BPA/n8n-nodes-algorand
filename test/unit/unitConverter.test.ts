/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  algoToMicroAlgo,
  microAlgoToAlgo,
  isValidAddress,
  encodeNote,
  decodeNote,
  toBase64,
  fromBase64,
  calculateMinBalance,
  generateAccount,
} from '../../nodes/Algorand/utils/unitConverter';

describe('Unit Converter Utils', () => {
  describe('algoToMicroAlgo', () => {
    it('should convert 1 ALGO to 1000000 microAlgo', () => {
      expect(algoToMicroAlgo(1)).toBe(1000000);
    });

    it('should convert 0.5 ALGO to 500000 microAlgo', () => {
      expect(algoToMicroAlgo(0.5)).toBe(500000);
    });

    it('should handle 0 ALGO', () => {
      expect(algoToMicroAlgo(0)).toBe(0);
    });

    it('should handle large amounts', () => {
      expect(algoToMicroAlgo(1000000)).toBe(1000000000000);
    });
  });

  describe('microAlgoToAlgo', () => {
    it('should convert 1000000 microAlgo to 1 ALGO', () => {
      expect(microAlgoToAlgo(1000000)).toBe(1);
    });

    it('should convert 500000 microAlgo to 0.5 ALGO', () => {
      expect(microAlgoToAlgo(500000)).toBe(0.5);
    });

    it('should handle 0 microAlgo', () => {
      expect(microAlgoToAlgo(0)).toBe(0);
    });
  });

  describe('isValidAddress', () => {
    it('should validate a correct Algorand address', () => {
      // Using a well-known test address format
      const validAddress = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ';
      expect(isValidAddress(validAddress)).toBe(true);
    });

    it('should reject an invalid address', () => {
      expect(isValidAddress('invalid-address')).toBe(false);
    });

    it('should reject an empty string', () => {
      expect(isValidAddress('')).toBe(false);
    });

    it('should reject address with wrong length', () => {
      expect(isValidAddress('ABC123')).toBe(false);
    });
  });

  describe('encodeNote and decodeNote', () => {
    it('should encode and decode a simple note', () => {
      const note = 'Hello Algorand!';
      const encoded = encodeNote(note);
      const decoded = decodeNote(encoded);
      expect(decoded).toBe(note);
    });

    it('should handle empty notes', () => {
      const note = '';
      const encoded = encodeNote(note);
      const decoded = decodeNote(encoded);
      expect(decoded).toBe(note);
    });

    it('should handle unicode characters', () => {
      const note = '你好 Algorand! 🚀';
      const encoded = encodeNote(note);
      const decoded = decodeNote(encoded);
      expect(decoded).toBe(note);
    });
  });

  describe('toBase64 and fromBase64', () => {
    it('should encode and decode a string', () => {
      const original = 'Hello World';
      const encoded = toBase64(original);
      const decoded = Buffer.from(fromBase64(encoded)).toString('utf-8');
      expect(decoded).toBe(original);
    });

    it('should encode Uint8Array', () => {
      const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      const encoded = toBase64(data);
      expect(encoded).toBe('SGVsbG8=');
    });
  });

  describe('calculateMinBalance', () => {
    it('should return base minimum balance with no params', () => {
      expect(calculateMinBalance()).toBe(100000);
    });

    it('should add balance for assets', () => {
      expect(calculateMinBalance({ numAssets: 1 })).toBe(200000);
      expect(calculateMinBalance({ numAssets: 5 })).toBe(600000);
    });

    it('should add balance for apps', () => {
      expect(calculateMinBalance({ numApps: 1 })).toBe(200000);
    });

    it('should combine all requirements', () => {
      const balance = calculateMinBalance({
        numAssets: 2,
        numApps: 1,
      });
      expect(balance).toBe(400000); // 100000 + 200000 + 100000
    });
  });

  describe('generateAccount', () => {
    it('should generate a valid account', () => {
      const account = generateAccount();
      expect(account.address).toBeDefined();
      expect(account.mnemonic).toBeDefined();
      expect(account.secretKey).toBeDefined();
      expect(account.address.length).toBe(58);
      expect(account.mnemonic.split(' ').length).toBe(25);
    });

    it('should generate unique accounts', () => {
      const account1 = generateAccount();
      const account2 = generateAccount();
      expect(account1.address).not.toBe(account2.address);
    });
  });
});
