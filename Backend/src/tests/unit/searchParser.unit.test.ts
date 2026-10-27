import { describe, it, expect } from 'vitest';
import {
  parseSearchIntent,
  getSearchTokenVariations,
  TYPO_DICTIONARY,
} from '../../lib/search/searchParser';

describe('E-Commerce Search Intent & Semantic Parser Unit Tests', () => {
  describe('1. Natural Language Price Intent Extraction', () => {
    it('should extract "under 10k" as maxPrice = 10000 and keep core tokens', () => {
      const intent = parseSearchIntent('under 10k phone');
      expect(intent.maxPrice).toBe(10000);
      expect(intent.minPrice).toBeUndefined();
      expect(intent.coreTokens).toContain('phone');
    });

    it('should extract "below 15000 mobile" as maxPrice = 15000', () => {
      const intent = parseSearchIntent('below 15000 mobile');
      expect(intent.maxPrice).toBe(15000);
      expect(intent.coreTokens).toContain('mobile');
    });

    it('should extract "above 5000 shoes" as minPrice = 5000', () => {
      const intent = parseSearchIntent('above 5000 shoes');
      expect(intent.minPrice).toBe(5000);
      expect(intent.coreTokens).toContain('shoes');
    });

    it('should extract "between 10k and 20k laptop" as price range', () => {
      const intent = parseSearchIntent('between 10k and 20k laptop');
      expect(intent.minPrice).toBe(10000);
      expect(intent.maxPrice).toBe(20000);
      expect(intent.coreTokens).toContain('laptop');
    });

    it('should extract "10k to 25k mobile" range correctly', () => {
      const intent = parseSearchIntent('10k to 25k mobile');
      expect(intent.minPrice).toBe(10000);
      expect(intent.maxPrice).toBe(25000);
      expect(intent.coreTokens).toContain('mobile');
    });

    it('should extract direct "10k phone" as maxPrice = 10000', () => {
      const intent = parseSearchIntent('10k phone');
      expect(intent.maxPrice).toBe(10000);
      expect(intent.coreTokens).toContain('phone');
    });
  });

  describe('2. Typo Tolerance & Spell Correction', () => {
    it('should correct "oreao" to "oreo" and "packe" to "packet"', () => {
      const intent = parseSearchIntent('1 packe oreao biscuit');
      expect(intent.coreTokens).toContain('oreo');
      expect(intent.coreTokens).toContain('biscuit');
      expect(intent.modifierTokens).toContain('1');
      expect(intent.modifierTokens).toContain('packet');
    });

    it('should correct tech typos like "samsang", "ipone", "lapto"', () => {
      expect(TYPO_DICTIONARY['samsang']).toBe('samsung');
      expect(TYPO_DICTIONARY['ipone']).toBe('iphone');
      expect(TYPO_DICTIONARY['lapto']).toBe('laptop');
      expect(TYPO_DICTIONARY['headfone']).toBe('headphone');
    });

    it('should correct food and grocery typos', () => {
      expect(TYPO_DICTIONARY['biscut']).toBe('biscuit');
      expect(TYPO_DICTIONARY['choclate']).toBe('chocolate');
      expect(TYPO_DICTIONARY['cofee']).toBe('coffee');
    });

    it('should correct fashion typos like "sneeker", "curti"', () => {
      expect(TYPO_DICTIONARY['sneeker']).toBe('sneaker');
      expect(TYPO_DICTIONARY['curti']).toBe('kurti');
      expect(TYPO_DICTIONARY['shose']).toBe('shoes');
    });
  });

  describe('3. Synonym Expansion & Semantic Variations', () => {
    it('should expand "mobile" to smartphones, phone, samsung, iphone', () => {
      const variations = getSearchTokenVariations('mobile');
      expect(variations).toContain('mobile');
      expect(variations).toContain('smartphone');
      expect(variations).toContain('smartphones');
      expect(variations).toContain('phone');
      expect(variations).toContain('phones');
      expect(variations).toContain('samsung');
      expect(variations).toContain('iphone');
    });

    it('should stem plurals "phones" to "phone" and expand synonyms', () => {
      const variations = getSearchTokenVariations('phones');
      expect(variations).toContain('phone');
      expect(variations).toContain('smartphone');
      expect(variations).toContain('mobile');
    });

    it('should expand "laptop" to computer, notebook, macbook', () => {
      const variations = getSearchTokenVariations('laptop');
      expect(variations).toContain('laptop');
      expect(variations).toContain('computer');
      expect(variations).toContain('notebook');
      expect(variations).toContain('macbook');
    });

    it('should expand typo input "oreao" into biscuit synonyms via corrected root', () => {
      const variations = getSearchTokenVariations('oreao');
      expect(variations).toContain('oreo');
      expect(variations).toContain('biscuit');
      expect(variations).toContain('cookie');
    });

    it('should expand "shoes" to sneaker, footwear, runner', () => {
      const variations = getSearchTokenVariations('shoes');
      expect(variations).toContain('shoe');
      expect(variations).toContain('sneaker');
      expect(variations).toContain('footwear');
    });
  });

  describe('4. Edge Cases & Safety', () => {
    it('should handle empty or whitespace query without throwing', () => {
      const intentEmpty = parseSearchIntent('');
      expect(intentEmpty.coreTokens).toEqual([]);
      expect(intentEmpty.minPrice).toBeUndefined();
      expect(intentEmpty.maxPrice).toBeUndefined();

      const intentSpaces = parseSearchIntent('     ');
      expect(intentSpaces.coreTokens).toEqual([]);
    });

    it('should strip special characters gracefully', () => {
      const intent = parseSearchIntent('***mobile*** & $$$laptop$$$');
      expect(intent.coreTokens).toContain('mobile');
      expect(intent.coreTokens).toContain('laptop');
    });

    it('should handle queries with only packaging modifiers without failing', () => {
      const intent = parseSearchIntent('1 pack');
      expect(intent.coreTokens.length).toBeGreaterThan(0);
    });
  });
});
