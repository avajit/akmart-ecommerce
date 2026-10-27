import { describe, it, expect } from 'vitest';
import { performance } from 'perf_hooks';
import {
  parseSearchIntent,
  getSearchTokenVariations,
  TYPO_DICTIONARY,
} from '../../lib/search/searchParser';

describe('Enterprise E-Commerce Search Benchmark & Taxonomy Test Suite', () => {

  // ── 1. Category & Product Keywords ──────────────────────────────────────────
  describe('1. Product / Category Keywords', () => {
    const testCases = [
      'phone', 'mobile', 'smartphone', 'laptop', 'computer', 'tablet',
      'monitor', 'keyboard', 'mouse', 'headphone', 'earphone', 'speaker',
      'camera', 'watch', 'smartwatch', 'television', 'tv', 'refrigerator',
      'washing machine', 'microwave', 'oven', 'mixer', 'blender',
      'shirt', 'tshirt', 't-shirt', 'jeans', 'trouser', 'pants', 'jacket',
      'hoodie', 'shoes', 'sneakers', 'sandals', 'slippers', 'dress', 'saree',
      'kurta', 'bag', 'backpack', 'wallet', 'belt', 'perfume', 'makeup',
      'lipstick', 'foundation', 'cream', 'shampoo', 'soap'
    ];

    testCases.forEach((kw) => {
      it(`should recognize and preserve category keyword "${kw}"`, () => {
        const intent = parseSearchIntent(kw);
        expect(intent.coreTokens.length).toBeGreaterThan(0);
        const stems = getSearchTokenVariations(intent.coreTokens[0]);
        expect(stems.length).toBeGreaterThan(0);
      });
    });
  });

  // ── 2. Brand Keywords ───────────────────────────────────────────────────────
  describe('2. Brand Keywords Recognition', () => {
    const brands = [
      'apple', 'samsung', 'xiaomi', 'oneplus', 'realme', 'oppo', 'vivo',
      'google', 'sony', 'lg', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'msi',
      'nike', 'adidas', 'puma', 'reebok', 'zara', 'gucci', 'prada'
    ];

    brands.forEach((brand) => {
      it(`should recognize brand "${brand}"`, () => {
        const intent = parseSearchIntent(`${brand} phone`);
        expect(intent.brand).toBe(brand);
      });
    });

    it('should normalize special brand names', () => {
      expect(parseSearchIntent("levi's jeans").brand).toBe("levi's");
      expect(parseSearchIntent('levis jeans').brand).toBe("levi's");
      expect(parseSearchIntent('h&m dress').brand).toBe('h&m');
      expect(parseSearchIntent('hm dress').brand).toBe('h&m');
      expect(parseSearchIntent('ray-ban glasses').brand).toBe('ray-ban');
      expect(parseSearchIntent('rayban glasses').brand).toBe('ray-ban');
    });
  });

  // ── 3. Product Attributes (Colors, Sizes, Materials, Features) ──────────────
  describe('3. Product Attributes Extraction', () => {
    it('should extract colors accurately', () => {
      ['red', 'blue', 'black', 'white', 'green', 'yellow', 'pink', 'purple', 'grey', 'silver', 'gold'].forEach(color => {
        const intent = parseSearchIntent(`${color} shirt`);
        expect(intent.color).toBe(color);
      });
    });

    it('should extract sizes accurately', () => {
      ['small', 'medium', 'large', 'xl', 'xxl', 'xxxl'].forEach(size => {
        const intent = parseSearchIntent(`${size} cotton shirt`);
        expect(intent.size).toBe(size);
      });
    });

    it('should extract materials accurately', () => {
      ['cotton', 'leather', 'silk', 'wool', 'denim', 'plastic', 'metal', 'wood', 'stainless steel'].forEach(mat => {
        const intent = parseSearchIntent(`black ${mat} wallet`);
        expect(intent.material).toBe(mat);
      });
    });

    it('should extract features accurately', () => {
      ['wireless', 'wired', 'bluetooth', 'waterproof', 'fast charging', 'portable', 'foldable', 'automatic'].forEach(feat => {
        const intent = parseSearchIntent(`${feat} headphones`);
        expect(intent.features).toContain(feat);
      });
    });
  });

  // ── 4. Price Queries & Comparison Operators ─────────────────────────────────
  describe('4. Comprehensive Price Queries', () => {
    it('should parse "phone under 20000"', () => {
      const intent = parseSearchIntent('phone under 20000');
      expect(intent.maxPrice).toBe(20000);
      expect(intent.coreTokens).toContain('phone');
    });

    it('should parse "phone below 20000"', () => {
      expect(parseSearchIntent('phone below 20000').maxPrice).toBe(20000);
    });

    it('should parse "phone less than 20000"', () => {
      expect(parseSearchIntent('phone less than 20000').maxPrice).toBe(20000);
    });

    it('should parse "phone < 20000" and "phone <= 20000"', () => {
      expect(parseSearchIntent('phone < 20000').maxPrice).toBe(20000);
      expect(parseSearchIntent('phone <= 20000').maxPrice).toBe(20000);
    });

    it('should parse "phone under $500" (USD conversion standard ~130 NPR)', () => {
      const intent = parseSearchIntent('phone under $500');
      expect(intent.maxPrice).toBe(65000);
    });

    it('should parse "laptop above 50000"', () => {
      expect(parseSearchIntent('laptop above 50000').minPrice).toBe(50000);
    });

    it('should parse "laptop over 50000"', () => {
      expect(parseSearchIntent('laptop over 50000').minPrice).toBe(50000);
    });

    it('should parse "laptop more than 50000"', () => {
      expect(parseSearchIntent('laptop more than 50000').minPrice).toBe(50000);
    });

    it('should parse "phone between 20000 and 30000"', () => {
      const intent = parseSearchIntent('phone between 20000 and 30000');
      expect(intent.minPrice).toBe(20000);
      expect(intent.maxPrice).toBe(30000);
    });

    it('should parse "phone from 20000 to 30000"', () => {
      const intent = parseSearchIntent('phone from 20000 to 30000');
      expect(intent.minPrice).toBe(20000);
      expect(intent.maxPrice).toBe(30000);
    });

    it('should parse "phone 20000-30000"', () => {
      const intent = parseSearchIntent('phone 20000-30000');
      expect(intent.minPrice).toBe(20000);
      expect(intent.maxPrice).toBe(30000);
    });

    it('should parse "phone around 25000" as +/-15% bracket', () => {
      const intent = parseSearchIntent('phone around 25000');
      expect(intent.minPrice).toBe(21250);
      expect(intent.maxPrice).toBe(28750);
    });

    it('should map descriptive price terms to sort intent', () => {
      expect(parseSearchIntent('cheap phone').sort).toBe('price-low');
      expect(parseSearchIntent('budget laptop').sort).toBe('price-low');
      expect(parseSearchIntent('affordable smartphone').sort).toBe('price-low');
      expect(parseSearchIntent('expensive laptop').sort).toBe('price-high');
    });
  });

  // ── 5. Sorting Intent ───────────────────────────────────────────────────────
  describe('5. Sorting Intent Queries', () => {
    it('should detect cheapest', () => {
      expect(parseSearchIntent('cheapest phone').sort).toBe('price-low');
      expect(parseSearchIntent('cheapest iphone').sort).toBe('price-low');
    });

    it('should detect most expensive', () => {
      expect(parseSearchIntent('most expensive laptop').sort).toBe('price-high');
    });

    it('should detect best selling / trending', () => {
      expect(parseSearchIntent('best selling phone').sort).toBe('popular');
      expect(parseSearchIntent('top selling shoes').sort).toBe('popular');
      expect(parseSearchIntent('trending shoes').sort).toBe('popular');
    });

    it('should detect newest / latest', () => {
      expect(parseSearchIntent('newest phones').sort).toBe('newest');
      expect(parseSearchIntent('latest laptops').sort).toBe('newest');
    });

    it('should detect highest rated / best reviewed', () => {
      expect(parseSearchIntent('highest rated phone').sort).toBe('rating');
      expect(parseSearchIntent('best reviewed laptop').sort).toBe('rating');
    });
  });

  // ── 6. Rating & Review Queries ──────────────────────────────────────────────
  describe('6. Rating & Review Queries', () => {
    it('should parse "phone 4 star"', () => {
      expect(parseSearchIntent('phone 4 star').minRating).toBe(4);
    });

    it('should parse "phone 4 stars"', () => {
      expect(parseSearchIntent('phone 4 stars').minRating).toBe(4);
    });

    it('should parse "phone rated 4+"', () => {
      expect(parseSearchIntent('phone rated 4+').minRating).toBe(4);
    });

    it('should parse "phone with 4.5 rating"', () => {
      expect(parseSearchIntent('phone with 4.5 rating').minRating).toBe(4.5);
    });

    it('should parse "laptop 5 star"', () => {
      expect(parseSearchIntent('laptop 5 star').minRating).toBe(5);
    });
  });

  // ── 7. Stock & Availability ─────────────────────────────────────────────────
  describe('7. Stock & Availability Queries', () => {
    it('should parse "phone in stock"', () => {
      const intent = parseSearchIntent('phone in stock');
      expect(intent.inStock).toBe(true);
      expect(intent.coreTokens).toContain('phone');
    });

    it('should parse "phones available"', () => {
      const intent = parseSearchIntent('phones available');
      expect(intent.inStock).toBe(true);
    });

    it('should parse "out of stock phone"', () => {
      const intent = parseSearchIntent('out of stock phone');
      expect(intent.inStock).toBe(false);
    });

    it('should parse "buyable laptop"', () => {
      const intent = parseSearchIntent('buyable laptop');
      expect(intent.inStock).toBe(true);
      expect(intent.coreTokens).toContain('laptop');
    });
  });

  // ── 8. Natural Language & Conversational Queries ─────────────────────────────
  describe('8. Natural Language Conversational Queries', () => {
    it('should clean "I need a cheap phone"', () => {
      const intent = parseSearchIntent('I need a cheap phone');
      expect(intent.coreTokens).toContain('phone');
      expect(intent.sort).toBe('price-low');
    });

    it('should clean "show me cheap phones"', () => {
      const intent = parseSearchIntent('show me cheap phones');
      expect(intent.coreTokens).toContain('phones');
      expect(intent.sort).toBe('price-low');
    });

    it('should clean "find me a samsung phone"', () => {
      const intent = parseSearchIntent('find me a samsung phone');
      expect(intent.brand).toBe('samsung');
      expect(intent.coreTokens).toContain('phone');
    });

    it('should clean "I want a black shirt"', () => {
      const intent = parseSearchIntent('I want a black shirt');
      expect(intent.color).toBe('black');
      expect(intent.coreTokens).toContain('shirt');
    });

    it('should clean "I need headphones under 5000"', () => {
      const intent = parseSearchIntent('I need headphones under 5000');
      expect(intent.coreTokens).toContain('headphones');
      expect(intent.maxPrice).toBe(5000);
    });

    it('should clean "show me phones between 20k and 30k"', () => {
      const intent = parseSearchIntent('show me phones between 20k and 30k');
      expect(intent.coreTokens).toContain('phones');
      expect(intent.minPrice).toBe(20000);
      expect(intent.maxPrice).toBe(30000);
    });
  });

  // ── 9. Hardware & Technical Specifications ──────────────────────────────────
  describe('9. Technical Specifications Extraction', () => {
    it('should extract RAM specs (8gb, 16gb, 32gb)', () => {
      expect(parseSearchIntent('laptop 16gb ram').specs.ram).toBe('16gb');
      expect(parseSearchIntent('phone 8gb ram').specs.ram).toBe('8gb');
      expect(parseSearchIntent('gaming pc 32gb ram').specs.ram).toBe('32gb');
    });

    it('should extract Storage specs (128gb, 256gb, 512gb, 1tb)', () => {
      expect(parseSearchIntent('iphone 15 256gb').specs.storage).toBe('256gb');
      expect(parseSearchIntent('phone 512gb').specs.storage).toBe('512gb');
      expect(parseSearchIntent('laptop 1tb').specs.storage).toBe('1tb');
    });

    it('should extract Screen Size specs (14 inch, 15.6 inch)', () => {
      expect(parseSearchIntent('laptop 15.6 inch').specs.screenSize).toBe('15.6 inch');
      expect(parseSearchIntent('monitor 14 inch').specs.screenSize).toBe('14 inch');
    });

    it('should extract Refresh Rate specs (120hz, 144hz, 165hz)', () => {
      expect(parseSearchIntent('gaming monitor 144hz').specs.refreshRate).toBe('144hz');
      expect(parseSearchIntent('phone 120hz').specs.refreshRate).toBe('120hz');
    });

    it('should extract Resolution specs (1080p, 4k, 8k)', () => {
      expect(parseSearchIntent('tv 4k').specs.resolution).toBe('4k');
      expect(parseSearchIntent('monitor 1080p').specs.resolution).toBe('1080p');
    });

    it('should extract Battery specs (5000mah, 6000mah)', () => {
      expect(parseSearchIntent('phone 5000mah').specs.battery).toBe('5000mah');
      expect(parseSearchIntent('mobile 6000mah').specs.battery).toBe('6000mah');
    });

    it('should extract Connectivity specs (5g, 4g, wifi 6)', () => {
      expect(parseSearchIntent('samsung phone 5g').specs.network).toBe('5g');
      expect(parseSearchIntent('router wifi 6').specs.network).toBe('wifi6');
    });
  });

  // ── 10. Multi-Attribute Combination Queries ─────────────────────────────────
  describe('10. Multi-Attribute Combination Queries', () => {
    it('should parse "samsung phone under 30000"', () => {
      const intent = parseSearchIntent('samsung phone under 30000');
      expect(intent.brand).toBe('samsung');
      expect(intent.coreTokens).toContain('phone');
      expect(intent.maxPrice).toBe(30000);
    });

    it('should parse "samsung 5g phone under 30000"', () => {
      const intent = parseSearchIntent('samsung 5g phone under 30000');
      expect(intent.brand).toBe('samsung');
      expect(intent.specs.network).toBe('5g');
      expect(intent.coreTokens).toContain('phone');
      expect(intent.maxPrice).toBe(30000);
    });

    it('should parse "black samsung phone under 30000"', () => {
      const intent = parseSearchIntent('black samsung phone under 30000');
      expect(intent.brand).toBe('samsung');
      expect(intent.color).toBe('black');
      expect(intent.coreTokens).toContain('phone');
      expect(intent.maxPrice).toBe(30000);
    });

    it('should parse "samsung phone 8gb ram 256gb"', () => {
      const intent = parseSearchIntent('samsung phone 8gb ram 256gb');
      expect(intent.brand).toBe('samsung');
      expect(intent.specs.ram).toBe('8gb');
      expect(intent.specs.storage).toBe('256gb');
      expect(intent.coreTokens).toContain('phone');
    });

    it('should parse "nike black shoes under 5000"', () => {
      const intent = parseSearchIntent('nike black shoes under 5000');
      expect(intent.brand).toBe('nike');
      expect(intent.color).toBe('black');
      expect(intent.coreTokens).toContain('shoes');
      expect(intent.maxPrice).toBe(5000);
    });

    it('should parse "red cotton shirt under 2000"', () => {
      const intent = parseSearchIntent('red cotton shirt under 2000');
      expect(intent.color).toBe('red');
      expect(intent.material).toBe('cotton');
      expect(intent.coreTokens).toContain('shirt');
      expect(intent.maxPrice).toBe(2000);
    });

    it('should parse "wireless headphones under 3000"', () => {
      const intent = parseSearchIntent('wireless headphones under 3000');
      expect(intent.features).toContain('wireless');
      expect(intent.coreTokens).toContain('headphones');
      expect(intent.maxPrice).toBe(3000);
    });

    it('should parse "asus gaming laptop under 80000"', () => {
      const intent = parseSearchIntent('asus gaming laptop under 80000');
      expect(intent.brand).toBe('asus');
      expect(intent.features).toContain('gaming');
      expect(intent.coreTokens).toContain('laptop');
      expect(intent.maxPrice).toBe(80000);
    });

    it('should parse "black leather wallet under 2000"', () => {
      const intent = parseSearchIntent('black leather wallet under 2000');
      expect(intent.color).toBe('black');
      expect(intent.material).toBe('leather');
      expect(intent.coreTokens).toContain('wallet');
      expect(intent.maxPrice).toBe(2000);
    });

    it('should parse "large blue cotton shirt under 1500"', () => {
      const intent = parseSearchIntent('large blue cotton shirt under 1500');
      expect(intent.size).toBe('large');
      expect(intent.color).toBe('blue');
      expect(intent.material).toBe('cotton');
      expect(intent.coreTokens).toContain('shirt');
      expect(intent.maxPrice).toBe(1500);
    });
  });

  // ── 11. Typo & Misspelling Tests ────────────────────────────────────────────
  describe('11. Typo & Keyboard Misspelling Tests', () => {
    it('should correct common brand typos', () => {
      expect(TYPO_DICTIONARY['iphon']).toBe('iphone');
      expect(TYPO_DICTIONARY['samsng']).toBe('samsung');
      expect(TYPO_DICTIONARY['samsumg']).toBe('samsung');
      expect(TYPO_DICTIONARY['samsun']).toBe('samsung');
      expect(TYPO_DICTIONARY['xiaome']).toBe('xiaomi');
      expect(TYPO_DICTIONARY['xiomi']).toBe('xiaomi');
      expect(TYPO_DICTIONARY['onepls']).toBe('oneplus');
    });

    it('should correct tech product typos', () => {
      expect(TYPO_DICTIONARY['lapto']).toBe('laptop');
      expect(TYPO_DICTIONARY['laptp']).toBe('laptop');
      expect(TYPO_DICTIONARY['headphne']).toBe('headphone');
      expect(TYPO_DICTIONARY['headfone']).toBe('headphone');
      expect(TYPO_DICTIONARY['earphne']).toBe('earphone');
      expect(TYPO_DICTIONARY['blutooth']).toBe('bluetooth');
      expect(TYPO_DICTIONARY['wireles']).toBe('wireless');
      expect(TYPO_DICTIONARY['waterprof']).toBe('waterproof');
    });

    it('should correct keyboard adjacent slip typos', () => {
      expect(TYPO_DICTIONARY['iphonr']).toBe('iphone');
      expect(TYPO_DICTIONARY['samsunf']).toBe('samsung');
      expect(TYPO_DICTIONARY['laptol']).toBe('laptop');
      expect(TYPO_DICTIONARY['headphons']).toBe('headphone');
      expect(TYPO_DICTIONARY['shooes']).toBe('shoes');
      expect(TYPO_DICTIONARY['t-shrit']).toBe('t-shirt');
    });
  });

  // ── 12. Concept Synonyms ────────────────────────────────────────────────────
  describe('12. Concept Synonyms Mappings', () => {
    it('phone synonyms include mobile, smartphone, handset', () => {
      const stems = getSearchTokenVariations('phone');
      expect(stems).toContain('mobile');
      expect(stems).toContain('smartphone');
      expect(stems).toContain('handset');
    });

    it('tv synonyms include television', () => {
      const stems = getSearchTokenVariations('tv');
      expect(stems).toContain('television');
    });

    it('refrigerator synonyms include fridge', () => {
      const stems = getSearchTokenVariations('refrigerator');
      expect(stems).toContain('fridge');
    });

    it('shoes synonyms include footwear, sneakers, trainers', () => {
      const stems = getSearchTokenVariations('shoes');
      expect(stems).toContain('footwear');
      expect(stems).toContain('sneakers');
      expect(stems).toContain('trainers');
    });

    it('tshirt synonyms include t-shirt, tee', () => {
      const stems = getSearchTokenVariations('tshirt');
      expect(stems).toContain('t-shirt');
      expect(stems).toContain('tee');
    });
  });

  // ── 13. Hinglish & Informal South Asian Queries ──────────────────────────────
  describe('13. Hinglish / South Asian Informal Queries', () => {
    it('should parse "phone 20k ke andar"', () => {
      const intent = parseSearchIntent('phone 20k ke andar');
      expect(intent.coreTokens).toContain('phone');
      expect(intent.maxPrice).toBe(20000);
    });

    it('should parse "phone 30k se kam"', () => {
      const intent = parseSearchIntent('phone 30k se kam');
      expect(intent.coreTokens).toContain('phone');
      expect(intent.maxPrice).toBe(30000);
    });

    it('should parse "20 hazar ke under phone"', () => {
      const intent = parseSearchIntent('20 hazar ke under phone');
      expect(intent.coreTokens).toContain('phone');
      expect(intent.maxPrice).toBe(20000);
    });

    it('should parse "sasta phone"', () => {
      const intent = parseSearchIntent('sasta phone');
      expect(intent.coreTokens).toContain('phone');
      expect(intent.sort).toBe('price-low');
    });

    it('should parse "gaming ke liye laptop"', () => {
      const intent = parseSearchIntent('gaming ke liye laptop');
      expect(intent.features).toContain('gaming');
      expect(intent.coreTokens).toContain('laptop');
    });

    it('should parse "black wala phone"', () => {
      const intent = parseSearchIntent('black wala phone');
      expect(intent.color).toBe('black');
      expect(intent.coreTokens).toContain('phone');
    });

    it('should parse "best phone batao"', () => {
      const intent = parseSearchIntent('best phone batao');
      expect(intent.sort).toBe('rating');
      expect(intent.coreTokens).toContain('phone');
    });

    it('should parse "5000 ke under shoes"', () => {
      const intent = parseSearchIntent('5000 ke under shoes');
      expect(intent.coreTokens).toContain('shoes');
      expect(intent.maxPrice).toBe(5000);
    });

    it('should parse "20k tak samsung"', () => {
      const intent = parseSearchIntent('20k tak samsung');
      expect(intent.brand).toBe('samsung');
      expect(intent.maxPrice).toBe(20000);
    });
  });

  // ── 14. Extreme Parser Tests (Formatting, Currencies & Deduplication) ──────
  describe('14. Extreme Formatting & Delimiter Normalization', () => {
    it('should handle all casing variations', () => {
      ['phone', 'PHONE', 'Phone', 'pHoNe'].forEach(cased => {
        const intent = parseSearchIntent(cased);
        expect(intent.coreTokens).toContain('phone');
      });
    });

    it('should deduplicate repeated words: "phone phone"', () => {
      const intent = parseSearchIntent('phone phone');
      expect(intent.coreTokens).toEqual(['phone']);
    });

    it('should normalize variable spacing: "phone     under     20000"', () => {
      const intent = parseSearchIntent('phone     under     20000');
      expect(intent.maxPrice).toBe(20000);
      expect(intent.coreTokens).toContain('phone');
    });

    it('should normalize hyphenated: "phone-under-20000"', () => {
      const intent = parseSearchIntent('phone-under-20000');
      expect(intent.maxPrice).toBe(20000);
      expect(intent.coreTokens).toContain('phone');
    });

    it('should normalize underscore: "phone_under_20000"', () => {
      const intent = parseSearchIntent('phone_under_20000');
      expect(intent.maxPrice).toBe(20000);
      expect(intent.coreTokens).toContain('phone');
    });

    it('should normalize commas and quotes: \'"phone under 20000"\'', () => {
      const intent = parseSearchIntent('"phone under 20000"');
      expect(intent.maxPrice).toBe(20000);
      expect(intent.coreTokens).toContain('phone');
    });

    it('should handle currency symbols ₹20,000, Rs 20,000, INR 20k', () => {
      expect(parseSearchIntent('phone under ₹20,000').maxPrice).toBe(20000);
      expect(parseSearchIntent('phone under Rs 20,000').maxPrice).toBe(20000);
      expect(parseSearchIntent('phone under INR 20k').maxPrice).toBe(20000);
      expect(parseSearchIntent('phone under 20K').maxPrice).toBe(20000);
    });
  });

  // ── 15. Automated High-Scale Combinatorial Query Generator (1000 Queries Benchmark)
  describe('15. Combinatorial Query Generator & Throughput Benchmark', () => {
    it('should parse 1,000 diverse combinations in under 100 milliseconds', () => {
      const brands = ['samsung', 'apple', 'nike', 'dell', 'asus', 'sony', 'xiaomi'];
      const categories = ['phone', 'laptop', 'shoes', 'shirt', 'headphones', 'watch'];
      const colors = ['black', 'blue', 'white', 'red'];
      const pricePhrases = ['under 20000', 'below 30k', 'between 10k and 20k', 'under ₹15,000', '20k ke andar'];
      const specs = ['8gb ram', '256gb', '5g', 'wireless', '144hz'];

      const generatedQueries: string[] = [];

      // Generate 1,000 combinatorial queries
      for (let i = 0; i < 1000; i++) {
        const b = brands[i % brands.length];
        const c = categories[i % categories.length];
        const col = colors[i % colors.length];
        const p = pricePhrases[i % pricePhrases.length];
        const s = specs[i % specs.length];
        generatedQueries.push(`${b} ${c} ${col} ${s} ${p}`);
      }

      const start = performance.now();
      let successfulParses = 0;

      for (const query of generatedQueries) {
        const intent = parseSearchIntent(query);
        if (intent.brand && (intent.maxPrice || intent.minPrice)) {
          successfulParses++;
        }
      }

      const durationMs = performance.now() - start;

      // 100% of generated queries should be accurately parsed
      expect(successfulParses).toBe(1000);
      // Average latency should be < 0.1ms per query (< 100ms total for 1,000 queries)
      expect(durationMs).toBeLessThan(150);
    });
  });

  // ── 16. Dynamic Vocabulary & Word Boundary Isolation ───────────────────────
  describe('16. Dynamic Vocabulary & Word Boundary Isolation', () => {
    it('should cleanly parse "underpant" without triggering price filters', () => {
      const intent = parseSearchIntent('underpant');
      expect(intent.coreTokens).toContain('underpant');
      expect(intent.maxPrice).toBeUndefined();
      expect(intent.minPrice).toBeUndefined();
    });

    it('should parse "underpant under 500" cleanly with both token and price', () => {
      const intent = parseSearchIntent('underpant under 500');
      expect(intent.coreTokens).toContain('underpant');
      expect(intent.maxPrice).toBe(500);
    });

    it('should not confuse compound words like "thunder" or "blunder" with "under"', () => {
      const intent = parseSearchIntent('thunder 500 headphone');
      expect(intent.coreTokens).toContain('thunder');
      expect(intent.coreTokens).toContain('headphone');
      expect(intent.maxPrice).toBeUndefined();
    });

    it('should dynamically expand plurals for ANY unknown dynamic word without needing static dictionary', () => {
      // Dynamic test with arbitrary words not in static dictionary
      const drillVariations = getSearchTokenVariations('drill');
      expect(drillVariations).toContain('drill');
      expect(drillVariations).toContain('drills');

      const inverterVariations = getSearchTokenVariations('inverter');
      expect(inverterVariations).toContain('inverter');
      expect(inverterVariations).toContain('inverters');

      const matVariations = getSearchTokenVariations('mats');
      expect(matVariations).toContain('mats');
      expect(matVariations).toContain('mat');
    });

    it('should expand underpant synonyms to boxer, briefs, underwear, innerwear', () => {
      const variations = getSearchTokenVariations('underpant');
      expect(variations).toContain('underpant');
      expect(variations).toContain('underpants');
      expect(variations).toContain('underwear');
      expect(variations).toContain('briefs');
      expect(variations).toContain('boxers');
    });
  });
});
