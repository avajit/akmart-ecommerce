/* eslint-disable security/detect-unsafe-regex, security/detect-object-injection */
/**
 * Enterprise Natural Language E-Commerce Search & Semantic Intent Parser
 * Benchmark Compliant: Flipkart, Amazon, Daraz, Myntra Standards
 */

// ── 1. Typo & Keyboard Mistake Normalization Dictionary ───────────────────────
export const TYPO_DICTIONARY: Record<string, string> = {
  // Mobile / Tech Brands
  samsang: 'samsung',
  samung: 'samsung',
  samsng: 'samsung',
  samsumg: 'samsung',
  samsun: 'samsung',
  samsunf: 'samsung',
  ipone: 'iphone',
  iphne: 'iphone',
  iphon: 'iphone',
  iphonr: 'iphone',
  applephone: 'iphone',
  xiaome: 'xiaomi',
  xiomi: 'xiaomi',
  onepls: 'oneplus',
  onepluse: 'oneplus',
  rlme: 'realme',
  relme: 'realme',

  // Computers & Gadgets
  lapto: 'laptop',
  labtop: 'laptop',
  leptop: 'laptop',
  laptp: 'laptop',
  laptol: 'laptop',
  macbok: 'macbook',
  notbook: 'notebook',
  headfone: 'headphone',
  hedphone: 'headphone',
  headphne: 'headphone',
  headphons: 'headphone',
  earfone: 'earphone',
  erphone: 'earphone',
  earphne: 'earphone',
  airpord: 'airpod',
  airpords: 'airpods',
  camra: 'camera',
  blutooth: 'bluetooth',
  wireles: 'wireless',
  waterprof: 'waterproof',

  // Appliances
  refrigarator: 'refrigerator',
  frige: 'fridge',
  microwav: 'microwave',
  blndr: 'blender',

  // Fashion & Apparel
  shoo: 'shoe',
  shose: 'shoes',
  sheos: 'shoes',
  shooes: 'shoes',
  sneeker: 'sneaker',
  sneekers: 'sneakers',
  tshrt: 't-shirt',
  t_shirt: 't-shirt',
  t_shrit: 't-shirt',
  't-shrit': 't-shirt',
  watche: 'watch',
  wach: 'watch',
  curti: 'kurti',
  kurtis: 'kurti',
  jens: 'jeans',
  trousr: 'trouser',
  jaket: 'jacket',
  heels: 'heel',

  // Innerwear & Undergarments
  undepant: 'underpant',
  undepants: 'underpants',
  underware: 'underwear',
  undrwear: 'underwear',
  undrware: 'underwear',
  underwaer: 'underwear',
  innerware: 'innerwear',
  innrwear: 'innerwear',
  inrwear: 'innerwear',
  bokser: 'boxer',
  boxrs: 'boxers',
  breif: 'brief',
  breifs: 'briefs',
  panti: 'panty',
  pantys: 'panties',
  lingrie: 'lingerie',
  lingeriee: 'lingerie',
  banyan: 'vest',
  baniyan: 'vest',

  // Food & FMCG
  oreao: 'oreo',
  orio: 'oreo',
  biscut: 'biscuit',
  biscit: 'biscuit',
  biskut: 'biscuit',
  biskit: 'biscuit',
  packe: 'packet',
  pacet: 'packet',
  pakcet: 'packet',
  choclate: 'chocolate',
  chocalate: 'chocolate',
  cofee: 'coffee',
  coffey: 'coffee',
  nudles: 'noodles',
};

// ── 2. Brands Taxonomy ────────────────────────────────────────────────────────
export const KNOWN_BRANDS: Record<string, string> = {
  apple: 'apple',
  samsung: 'samsung',
  xiaomi: 'xiaomi',
  redmi: 'redmi',
  oneplus: 'oneplus',
  realme: 'realme',
  oppo: 'oppo',
  vivo: 'vivo',
  google: 'google',
  sony: 'sony',
  lg: 'lg',
  dell: 'dell',
  hp: 'hp',
  lenovo: 'lenovo',
  asus: 'asus',
  acer: 'acer',
  msi: 'msi',
  nike: 'nike',
  adidas: 'adidas',
  puma: 'puma',
  reebok: 'reebok',
  levis: "levi's",
  "levi's": "levi's",
  zara: 'zara',
  hm: 'h&m',
  'h&m': 'h&m',
  gucci: 'gucci',
  prada: 'prada',
  rayban: 'ray-ban',
  'ray-ban': 'ray-ban',
};

// ── 3. Product Attributes: Colors, Sizes, Materials & Features ───────────────
export const KNOWN_COLORS = new Set([
  'red', 'blue', 'black', 'white', 'green', 'yellow', 'pink', 'purple',
  'grey', 'gray', 'silver', 'gold', 'orange', 'brown', 'navy', 'beige',
  'maroon', 'teal', 'bronze', 'rose gold'
]);

export const KNOWN_SIZES = new Set([
  'small', 'medium', 'large', 'xl', 'xxl', 'xxxl', 'xs', 's', 'm', 'l',
  '2xl', '3xl', '4xl'
]);

export const KNOWN_MATERIALS = new Set([
  'cotton', 'leather', 'silk', 'wool', 'denim', 'plastic', 'metal',
  'wood', 'stainless steel', 'ceramic', 'linen', 'polyester', 'chiffon'
]);

export const KNOWN_FEATURES = new Set([
  'wireless', 'wired', 'bluetooth', 'waterproof', 'water resistant',
  'fast charging', 'portable', 'foldable', 'rechargeable', 'automatic',
  'manual', 'gaming', 'smart', 'noise cancelling', 'anc'
]);

// ── 4. Comprehensive E-Commerce Synonyms ─────────────────────────────────────
export const ECOMMERCE_SYNONYMS: Record<string, string[]> = {
  // Mobile / Smartphones / Phones
  mobile: ['smartphone', 'smartphones', 'phone', 'phones', 'cellphone', 'cellphones', 'handset', 'samsung', 'apple', 'iphone', 'galaxy', 'xiaomi', 'redmi', 'oneplus', 'realme'],
  mobiles: ['smartphone', 'smartphones', 'phone', 'phones', 'cellphone', 'cellphones', 'handset', 'samsung', 'apple', 'iphone', 'galaxy'],
  phone: ['smartphone', 'smartphones', 'mobile', 'mobiles', 'cellphone', 'cellphones', 'handset', 'iphone', 'samsung', 'galaxy', 'phones'],
  phones: ['phone', 'smartphone', 'smartphones', 'mobile', 'mobiles', 'cellphone', 'cellphones', 'handset', 'iphone', 'samsung', 'galaxy'],
  smartphone: ['mobile', 'mobiles', 'phone', 'phones', 'cellphone', 'cellphones', 'handset', 'samsung', 'apple', 'iphone', 'galaxy', 'smartphones'],
  smartphones: ['smartphone', 'mobile', 'mobiles', 'phone', 'phones', 'cellphone', 'cellphones', 'handset', 'samsung', 'apple', 'iphone', 'galaxy'],
  cellphone: ['mobile', 'mobiles', 'phone', 'phones', 'smartphone', 'smartphones'],
  cellphones: ['mobile', 'mobiles', 'phone', 'phones', 'smartphone', 'smartphones'],
  handset: ['mobile', 'phone', 'smartphone'],
  iphone: ['apple', 'smartphone', 'smartphones', 'phone', 'mobile', 'iphones'],
  iphones: ['iphone', 'apple', 'smartphones', 'phones', 'mobiles'],
  samsung: ['galaxy', 'smartphone', 'phone', 'mobile'],
  galaxy: ['samsung', 'smartphone', 'phone', 'mobile'],
  android: ['smartphone', 'phone', 'mobile', 'samsung'],

  // Computers & Laptops
  laptop: ['computer', 'notebook', 'macbook', 'pc', 'laptops'],
  laptops: ['laptop', 'computer', 'computers', 'notebook', 'notebooks', 'macbook', 'macbooks', 'pc'],
  computer: ['laptop', 'laptops', 'pc', 'desktop', 'notebook', 'macbook', 'computers'],
  computers: ['computer', 'laptop', 'laptops', 'pc', 'desktops', 'notebooks', 'macbooks'],
  macbook: ['apple', 'laptop', 'laptops', 'computer', 'notebook'],
  notebook: ['laptop', 'laptops', 'computer'],
  pc: ['laptop', 'laptops', 'computer', 'desktop'],
  tablet: ['ipad', 'tab', 'tablets'],
  tablets: ['tablet', 'ipad', 'tab'],
  ipad: ['tablet', 'apple'],
  monitor: ['display', 'screen', 'monitors'],
  keyboard: ['keyboards'],
  mouse: ['mice'],

  // Audio & Sound
  headphone: ['headphones', 'audio', 'earphone', 'earphones', 'earbud', 'earbuds', 'headset', 'airpod', 'airpods', 'sony', 'sound'],
  headphones: ['headphone', 'audio', 'earphone', 'earphones', 'earbud', 'earbuds', 'headset', 'airpod', 'airpods', 'sony', 'sound'],
  earphone: ['earphones', 'headphone', 'headphones', 'earbud', 'earbuds', 'airpod', 'airpods', 'audio'],
  earphones: ['earphone', 'headphone', 'headphones', 'earbud', 'earbuds', 'airpod', 'airpods', 'audio'],
  earbud: ['earbuds', 'earphone', 'headphone', 'airpod', 'airpods', 'audio'],
  earbuds: ['earbud', 'earphone', 'headphone', 'airpod', 'airpods', 'audio'],
  airpod: ['airpods', 'earbud', 'earbuds', 'earphone', 'headphone', 'audio'],
  airpods: ['airpod', 'earbud', 'earbuds', 'earphone', 'headphone', 'audio'],
  speaker: ['speakers', 'soundbar', 'audio', 'sound'],
  speakers: ['speaker', 'soundbar', 'audio', 'sound'],
  camera: ['dslr', 'cam', 'cameras'],

  // Home & Kitchen Appliances
  tv: ['television', 'led', 'smart tv', 'screen', 'tvs'],
  television: ['tv', 'led', 'smart tv', 'screen', 'televisions'],
  refrigerator: ['fridge', 'refrigerators', 'cooling'],
  fridge: ['refrigerator', 'fridges'],
  ac: ['air conditioner', 'cooling'],
  'air conditioner': ['ac', 'air conditioner'],
  'washing machine': ['washer', 'laundry'],
  washer: ['washing machine'],
  microwave: ['oven', 'micro wave'],
  oven: ['microwave', 'baking'],
  mixer: ['blender', 'grinder'],
  blender: ['mixer', 'grinder'],
  cooker: ['rice cooker'],

  // Clothing & Fashion
  cloth: ['clothing', 'apparel', 'wear', 'dress', 'shirt', 'jacket', 't-shirt'],
  clothes: ['clothing', 'apparel', 'wear', 'dress', 'shirt', 'jacket', 't-shirt'],
  clothing: ['cloth', 'clothes', 'apparel', 'wear', 'shirt', 'dress', 't-shirt', 'jacket'],
  shirt: ['t-shirt', 'tshirt', 'top', 'clothing', 'apparel', 'shirts'],
  shirts: ['shirt', 't-shirts', 'tshirts', 'tops', 'clothing', 'apparel'],
  tshirt: ['t-shirt', 'shirt', 'tee', 'top', 'clothing', 'tshirts'],
  tshirts: ['tshirt', 't-shirts', 'shirts', 'tees', 'tops', 'clothing'],
  't-shirt': ['tshirt', 'shirt', 'tee', 'clothing'],
  tee: ['t-shirt', 'tshirt', 'shirt', 'clothing'],
  jeans: ['pants', 'denim', 'trousers', 'clothing'],
  trouser: ['trousers', 'pants', 'pant', 'clothing'],
  trousers: ['trouser', 'pants', 'jeans', 'clothing'],
  pant: ['pants', 'trouser', 'trousers', 'jeans', 'clothing'],
  pants: ['pant', 'trouser', 'trousers', 'jeans', 'clothing'],
  jacket: ['hoodie', 'coat', 'winterwear', 'outerwear', 'clothing', 'jackets'],
  jackets: ['jacket', 'hoodie', 'coats', 'winterwear', 'outerwear', 'clothing'],
  hoodie: ['jacket', 'sweatshirt', 'hoodies'],
  dress: ['wrap dress', 'kurti', 'gown', 'clothing', 'women', 'dresses'],
  dresses: ['dress', 'wrap dress', 'kurtis', 'gowns', 'clothing', 'women'],
  saree: ['sari', 'ethnic', 'clothing'],
  kurta: ['kurti', 'ethnic', 'clothing'],
  kurti: ['kurta', 'dress', 'ethnic', 'clothing', 'women', 'kurtis'],
  kurtis: ['kurti', 'kurta', 'dress', 'ethnic', 'clothing', 'women'],

  // Innerwear & Undergarments
  underpant: ['underpants', 'underwear', 'briefs', 'boxers', 'trunks', 'innerwear', 'clothing'],
  underpants: ['underpant', 'underwear', 'briefs', 'boxers', 'trunks', 'innerwear', 'clothing'],
  underwear: ['underpant', 'underpants', 'briefs', 'boxers', 'trunks', 'innerwear', 'lingerie', 'clothing'],
  underwears: ['underwear', 'underpants', 'briefs', 'boxers', 'innerwear', 'clothing'],
  brief: ['briefs', 'underwear', 'underpants', 'boxers', 'innerwear', 'clothing'],
  briefs: ['brief', 'underwear', 'underpants', 'boxers', 'trunks', 'innerwear', 'clothing'],
  boxer: ['boxers', 'briefs', 'underwear', 'underpants', 'trunks', 'clothing'],
  boxers: ['boxer', 'briefs', 'underwear', 'underpants', 'trunks', 'clothing'],
  trunk: ['trunks', 'boxers', 'briefs', 'underwear', 'clothing'],
  trunks: ['trunk', 'boxers', 'briefs', 'underwear', 'clothing'],
  innerwear: ['underwear', 'underpants', 'briefs', 'boxers', 'vest', 'clothing'],
  vest: ['undershirt', 'innerwear', 'banyan', 'clothing'],
  vests: ['vest', 'undershirt', 'innerwear', 'clothing'],
  undershirt: ['vest', 'innerwear', 'tshirt', 'clothing'],
  panty: ['panties', 'underwear', 'lingerie', 'clothing', 'women'],
  panties: ['panty', 'underwear', 'lingerie', 'clothing', 'women'],
  lingerie: ['underwear', 'panties', 'bra', 'innerwear', 'clothing', 'women'],
  bra: ['bras', 'lingerie', 'innerwear', 'clothing', 'women'],
  bras: ['bra', 'lingerie', 'innerwear', 'clothing', 'women'],

  // Shoes & Footwear
  shoe: ['shoes', 'footwear', 'sneaker', 'sneakers', 'boot', 'boots', 'runner', 'trainers', 'sandals', 'slippers'],
  shoes: ['shoe', 'footwear', 'sneaker', 'sneakers', 'boot', 'boots', 'runner', 'trainers', 'sandals', 'slippers'],
  sneaker: ['sneakers', 'shoe', 'shoes', 'footwear', 'runner', 'trainers', 'nike', 'adidas'],
  sneakers: ['sneaker', 'shoe', 'shoes', 'footwear', 'runner', 'trainers', 'nike', 'adidas'],
  footwear: ['shoe', 'shoes', 'sneaker', 'sneakers', 'sandals', 'slippers', 'boots', 'trainers'],
  sandals: ['sandal', 'footwear', 'slippers', 'shoes'],
  slippers: ['slipper', 'footwear', 'sandals', 'shoes'],
  trainers: ['sneakers', 'shoes', 'footwear'],

  // Accessories & Personal Care
  bag: ['backpack', 'handbag', 'wallet', 'purse', 'tote', 'bags'],
  bags: ['bag', 'backpack', 'handbag', 'wallet', 'purse'],
  backpack: ['bag', 'backpacks', 'rucksack'],
  wallet: ['purse', 'billfold', 'leather wallet', 'wallets'],
  belt: ['leather belt', 'belts'],
  watch: ['smartwatch', 'watches', 'timepiece'],
  watches: ['watch', 'smartwatches', 'timepiece'],
  smartwatch: ['watch', 'smart watch', 'fitness tracker', 'smartwatches'],
  perfume: ['fragrance', 'cologne', 'scent', 'perfumes'],
  makeup: ['cosmetics', 'beauty', 'lipstick', 'foundation'],
  lipstick: ['makeup', 'lip', 'cosmetics'],
  cream: ['lotion', 'moisturizer', 'skincare'],
  shampoo: ['haircare', 'soap'],
  soap: ['cleanser', 'bath', 'body wash'],

  // Food, Biscuits & FMCG
  biscuit: ['biscuits', 'cookie', 'cookies', 'bakery', 'snack', 'snacks', 'oreo'],
  biscuits: ['biscuit', 'cookies', 'bakery', 'snacks', 'oreo'],
  cookie: ['cookies', 'biscuit', 'biscuits', 'snack'],
  cookies: ['cookie', 'biscuits', 'biscuit', 'snacks'],
  oreo: ['biscuit', 'biscuits', 'cookie', 'cookies'],
  grocery: ['groceries', 'organic', 'food', 'tea', 'coffee', 'spices'],
  groceries: ['grocery', 'organic', 'food', 'tea', 'coffee', 'spices'],
};

// ── 5. Packaging & Quantity Modifiers ─────────────────────────────────────────
export const PACKAGING_MODIFIERS = new Set([
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '12', '24',
  'pack', 'packs', 'packet', 'packets', 'packe', 'pacet', 'pakt', 'box', 'boxes',
  'piece', 'pieces', 'pcs', 'pc', 'set', 'sets', 'bottle', 'bottles',
  'kg', 'gm', 'g', 'gram', 'grams', 'ml', 'l', 'liter', 'liters',
  'a', 'an', 'the', 'in', 'on', 'of', 'for', 'with', 'and', 'or', 'to', 'at', 'by'
]);

// ── 6. Natural Language / Conversational & Hinglish Fillers ───────────────────
export const FILLER_PHRASES = [
  /\bi need a\b/gi,
  /\bi want a\b/gi,
  /\bi need\b/gi,
  /\bi want\b/gi,
  /\bshow me\b/gi,
  /\bfind me\b/gi,
  /\bshow\b/gi,
  /\bfind\b/gi,
  /\blooking for\b/gi,
  /\bgive me\b/gi,
  /\bsearch for\b/gi,
  /\bke liye\b/gi,
  /\bko dikhau\b/gi,
  /\bbatao\b/gi,
  /\bchahiye\b/gi,
  /\bchahiyo\b/gi,
  /\bwala\b/gi,
  /\bwali\b/gi,
  /\bwale\b/gi,
];

// ── 7. Structured Search Intent Interface ─────────────────────────────────────
export interface ParsedSearchIntent {
  rawQuery: string;
  cleanQuery: string;
  coreTokens: string[];
  brand?: string;
  category?: string;
  color?: string;
  size?: string;
  material?: string;
  features: string[];
  specs: Record<string, string>;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: 'price-low' | 'price-high' | 'rating' | 'newest' | 'oldest' | 'popular';
  inStock?: boolean;
  modifierTokens: string[];
}

/**
 * Parses any raw e-commerce query into rich, structured search filters
 */
export function parseSearchIntent(rawQuery: string): ParsedSearchIntent {
  let clean = (rawQuery || '').trim();

  // 1. Normalize special brand compound names before any quote/dash stripping
  clean = clean.replace(/\blevi['’]s\b/gi, 'levis')
               .replace(/\bh\s*&\s*m\b/gi, 'hm')
               .replace(/\bray\s*-\s*ban\b/gi, 'rayban');

  // 2. Normalize underscores and word-adjacent hyphens to spaces
  // Keep numeric ranges like 20000-30000 intact
  clean = clean.replace(/_/g, ' ')
               .replace(/([a-zA-Z])-(?=[a-zA-Z0-9])/g, '$1 ')
               .replace(/(?<=[a-zA-Z0-9])-([a-zA-Z])/g, ' $1');

  // 3. Strip conversational / filler phrases early (without touching price phrases)
  for (const filler of FILLER_PHRASES) {
    clean = clean.replace(filler, ' ');
  }

  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  let minRating: number | undefined;
  let sort: ParsedSearchIntent['sort'] = undefined;
  let inStock: boolean | undefined = undefined;
  let brand: string | undefined = undefined;
  let color: string | undefined = undefined;
  let size: string | undefined = undefined;
  let material: string | undefined = undefined;
  const features: string[] = [];
  const specs: Record<string, string> = {};

  // ── A. Multi-word Attributes Extraction (before token splitting) ───────────
  if (/\bstainless\s*steel\b/i.test(clean)) {
    material = 'stainless steel';
    clean = clean.replace(/\bstainless\s*steel\b/gi, ' ');
  }
  if (/\bfast\s*charging\b/i.test(clean)) {
    features.push('fast charging');
    clean = clean.replace(/\bfast\s*charging\b/gi, ' ');
  }
  if (/\bwater\s*resistant\b/i.test(clean)) {
    features.push('water resistant');
    clean = clean.replace(/\bwater\s*resistant\b/gi, ' ');
  }
  if (/\brose\s*gold\b/i.test(clean)) {
    color = 'rose gold';
    clean = clean.replace(/\brose\s*gold\b/gi, ' ');
  }

  // ── B. Stock / Availability Intent ──────────────────────────────────────────
  if (/\b(?:in\s*stock|available|buyable)\b/i.test(clean)) {
    inStock = true;
    clean = clean.replace(/\b(?:in\s*stock|available|buyable)\b/gi, ' ');
  } else if (/\b(?:out\s*of\s*stock|sold\s*out)\b/i.test(clean)) {
    inStock = false;
    clean = clean.replace(/\b(?:out\s*of\s*stock|sold\s*out)\b/gi, ' ');
  }

  // ── C. Sorting & Quality Descriptors ────────────────────────────────────────
  if (/\b(?:cheapest|most\s*affordable|sasta|cheap\s*wala|budget|affordable|cheap)\b/i.test(clean)) {
    sort = 'price-low';
    clean = clean.replace(/\b(?:cheapest|most\s*affordable|sasta|cheap\s*wala|budget|affordable|cheap)\b/gi, ' ');
  } else if (/\b(?:most\s*expensive|costliest|mehnga|premium|expensive)\b/i.test(clean)) {
    sort = 'price-high';
    clean = clean.replace(/\b(?:most\s*expensive|costliest|mehnga|premium|expensive)\b/gi, ' ');
  } else if (/\b(?:newest|latest)\b/i.test(clean)) {
    sort = 'newest';
    clean = clean.replace(/\b(?:newest|latest)\b/gi, ' ');
  } else if (/\b(?:oldest)\b/i.test(clean)) {
    sort = 'oldest';
    clean = clean.replace(/\b(?:oldest)\b/gi, ' ');
  } else if (/\b(?:best\s*selling|top\s*selling|popular|trending)\b/i.test(clean)) {
    sort = 'popular';
    clean = clean.replace(/\b(?:best\s*selling|top\s*selling|popular|trending)\b/gi, ' ');
  } else if (/\b(?:highest\s*rated|top\s*rated|best\s*reviewed|highly\s*rated|good\s*reviews|best|acha|badhiya)\b/i.test(clean)) {
    sort = 'rating';
    clean = clean.replace(/\b(?:highest\s*rated|top\s*rated|best\s*reviewed|highly\s*rated|good\s*reviews|best|acha|badhiya)\b/gi, ' ');
  }

  // ── D. Rating & Review Extraction (e.g. "4 star", "4.5 stars", "rated 4+", "with 4.5 rating") ─
  const ratingMatch = clean.match(/\b(?:rated\s*)?([1-5](?:\.\d)?)\s*(?:stars?|\+)/i) ||
                      clean.match(/\bwith\s*([1-5](?:\.\d)?)\s*(?:star|rating)\b/i);
  if (ratingMatch) {
    minRating = parseFloat(ratingMatch[1]);
    clean = clean.replace(ratingMatch[0], ' ');
  }

  // ── E. Technical Specifications (RAM, Storage, Screen, Refresh, Battery, Network, Resolution)
  const resMatch = clean.match(/\b(1080p|1440p|4k|8k|fhd|uhd)\b/i);
  if (resMatch) {
    specs.resolution = resMatch[1].toLowerCase();
    clean = clean.replace(resMatch[0], ' ');
  }

  const ramMatch = clean.match(/\b(\d+)\s*(?:gb|g)\s*ram\b/i);
  if (ramMatch) {
    specs.ram = `${ramMatch[1]}gb`;
    clean = clean.replace(ramMatch[0], ' ');
  }

  const storageMatch = clean.match(/\b(128gb|256gb|512gb|1tb|2tb)\b/i);
  if (storageMatch) {
    specs.storage = storageMatch[1].toLowerCase();
    clean = clean.replace(storageMatch[0], ' ');
  }

  const screenMatch = clean.match(/\b(\d+(?:\.\d+)?)\s*(?:inch|")\b/i);
  if (screenMatch) {
    specs.screenSize = `${screenMatch[1]} inch`;
    clean = clean.replace(screenMatch[0], ' ');
  }

  const refreshMatch = clean.match(/\b(\d+)\s*hz\b/i);
  if (refreshMatch) {
    specs.refreshRate = `${refreshMatch[1]}hz`;
    clean = clean.replace(refreshMatch[0], ' ');
  }

  const batteryMatch = clean.match(/\b(\d+)\s*mah\b/i);
  if (batteryMatch) {
    specs.battery = `${batteryMatch[1]}mah`;
    clean = clean.replace(batteryMatch[0], ' ');
  }

  const networkMatch = clean.match(/\b(5g|4g|wifi\s*6|wifi|bluetooth\s*5)\b/i);
  if (networkMatch) {
    specs.network = networkMatch[1].toLowerCase().replace(/\s+/g, '');
    clean = clean.replace(networkMatch[0], ' ');
  }

  // ── F. Price Extraction (Multicurrency, Ranges, Operators, Multipliers) ─────
  const parseNumValue = (numStr: string, suffixStr?: string, prefixCurrency?: string): number => {
    let val = parseFloat(numStr.replace(/,/g, ''));
    const suffix = (suffixStr || '').toLowerCase();
    const curr = (prefixCurrency || '').toLowerCase();

    if (suffix === 'k' || suffix === 'thousand' || suffix === 'hazar') {
      val *= 1000;
    } else if (suffix === 'lakh' || suffix === 'lac') {
      val *= 100000;
    } else if (!suffix && val < 100 && curr !== '$') {
      val *= 1000;
    }

    if (curr === '$' || curr.includes('dollar')) {
      val *= 130;
    }

    return Math.round(val);
  };

  // 1. Hyphenated numbers range: "20000-30000", "20k-30k"
  const hyphenRange = clean.match(/\b(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|thousand|hazar)?\s*-\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|thousand|hazar)?\b/i);
  if (hyphenRange) {
    minPrice = parseNumValue(hyphenRange[1], hyphenRange[2]);
    maxPrice = parseNumValue(hyphenRange[3], hyphenRange[4]);
    clean = clean.replace(hyphenRange[0], ' ');
  }

  // 2. Worded Price Ranges: "between 20000 and 30000", "from 20k to 30k", "20000 to 30000"
  const rangeMatch = clean.match(/\b(?:between|from)?\s*(\$|₹|npr|rs\.?|inr|रू)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|thousand|hazar|lakh|lac)?\s*(?:and|to)\s*(\$|₹|npr|rs\.?|inr|रू)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|thousand|hazar|lakh|lac)?\b/i);
  if (rangeMatch && !minPrice && !maxPrice) {
    minPrice = parseNumValue(rangeMatch[2], rangeMatch[3], rangeMatch[1]);
    maxPrice = parseNumValue(rangeMatch[5], rangeMatch[6], rangeMatch[4]);
    clean = clean.replace(rangeMatch[0], ' ');
  }

  // 3. Around / Approx: "phone around 25000", "around 25k"
  const aroundMatch = clean.match(/\b(?:around|approx|about)\s*(\$|₹|npr|rs\.?|inr|रू)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|thousand|hazar|lakh|lac)?\b/i);
  if (aroundMatch && !minPrice && !maxPrice) {
    const target = parseNumValue(aroundMatch[2], aroundMatch[3], aroundMatch[1]);
    minPrice = Math.round(target * 0.85);
    maxPrice = Math.round(target * 1.15);
    clean = clean.replace(aroundMatch[0], ' ');
  }

  // 4. Comparison Operators & Max Price: "<= 20000", "< 20000", "under 20000", "below 20000", "20k ke andar", "20 hazar ke under"
  const underMatch = clean.match(/(?:<=|<|\b(?:under|below|less than|within|upto|up to|ke andar|se kam|tak|bhitra|samma)\b)\s*(\$|₹|npr|rs\.?|inr|रू)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|thousand|hazar|lakh|lac)?\b/i) ||
                     clean.match(/(\$|₹|npr|rs\.?|inr|रू)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|thousand|hazar|lakh|lac)?\s*(?:\b(?:ke under|ke andar|se kam|tak|bhitra|samma)\b)/i);
  if (underMatch && !maxPrice) {
    maxPrice = parseNumValue(underMatch[2], underMatch[3], underMatch[1]);
    clean = clean.replace(underMatch[0], ' ');
  }

  // 5. Min Price: ">= 50000", "> 50000", "above 50000", "over 50000", "more than 50000"
  const aboveMatch = clean.match(/(?:>=|>|above|over|more than|starting from|greater than)\s*(\$|₹|npr|rs\.?|inr|रू)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|thousand|hazar|lakh|lac)?\b/i);
  if (aboveMatch && !minPrice) {
    minPrice = parseNumValue(aboveMatch[2], aboveMatch[3], aboveMatch[1]);
    clean = clean.replace(aboveMatch[0], ' ');
  }

  // 6. Standalone "<amount>k": "20k phone", "10k laptop"
  const standaloneK = clean.match(/\b(\d+(?:\.\d+)?)\s*k\b/i);
  if (standaloneK && !maxPrice && !minPrice) {
    maxPrice = parseFloat(standaloneK[1]) * 1000;
    clean = clean.replace(standaloneK[0], ' ');
  }

  // ── G. Delimiter & Punctuation Clean Up ──────────────────────────────────────
  clean = clean.replace(/["“”'‘’]/g, ' ')
               .replace(/[-_,<>=$₹]/g, ' ')
               .replace(/[^\w\s-]/g, ' ')
               .replace(/\s+/g, ' ')
               .trim();

  const rawTokens = clean.split(/\s+/).filter(Boolean);
  const coreTokens: string[] = [];
  const modifierTokens: string[] = [];
  const seenTokens = new Set<string>();

  for (const raw of rawTokens) {
    const lower = raw.toLowerCase().trim();
    if (!lower) continue;

    const corrected = TYPO_DICTIONARY[lower] || lower;

    if (seenTokens.has(corrected)) continue;
    seenTokens.add(corrected);

    if (KNOWN_BRANDS[corrected]) {
      brand = KNOWN_BRANDS[corrected];
      continue;
    }

    if (KNOWN_COLORS.has(corrected)) {
      color = corrected;
      continue;
    }

    if (KNOWN_SIZES.has(corrected)) {
      size = corrected;
      continue;
    }

    if (KNOWN_MATERIALS.has(corrected)) {
      material = corrected;
      continue;
    }

    if (KNOWN_FEATURES.has(corrected)) {
      features.push(corrected);
      continue;
    }

    if (PACKAGING_MODIFIERS.has(lower) || PACKAGING_MODIFIERS.has(corrected)) {
      modifierTokens.push(corrected);
    } else {
      coreTokens.push(corrected);
    }
  }

  const finalCoreTokens = coreTokens.length > 0
    ? coreTokens
    : brand
      ? [brand]
      : color
        ? [color]
        : modifierTokens;

  return {
    rawQuery,
    cleanQuery: clean,
    coreTokens: finalCoreTokens,
    brand,
    color,
    size,
    material,
    features,
    specs,
    minPrice,
    maxPrice,
    minRating,
    sort,
    inStock,
    modifierTokens,
  };
}

// ── 8. Token Variation Expander (Plurals, Stems & Synonyms) ───────────────────
export function getSearchTokenVariations(word: string): string[] {
  const raw = word.toLowerCase().trim();
  const corrected = TYPO_DICTIONARY[raw] || raw;
  const variations = new Set<string>([corrected]);

  if (ECOMMERCE_SYNONYMS[corrected]) {
    ECOMMERCE_SYNONYMS[corrected].forEach((s) => variations.add(s));
  }

  if (corrected.endsWith('ies') && corrected.length > 4) {
    const base1 = corrected.slice(0, -3) + 'y';
    const base2 = corrected.slice(0, -1);
    [base1, base2].forEach((base) => {
      variations.add(base);
      ECOMMERCE_SYNONYMS[base]?.forEach((s) => variations.add(s));
    });
  } else if (corrected.endsWith('es') && corrected.length > 3) {
    const base1 = corrected.slice(0, -1);
    const base2 = corrected.slice(0, -2);
    [base1, base2].forEach((base) => {
      variations.add(base);
      ECOMMERCE_SYNONYMS[base]?.forEach((s) => variations.add(s));
    });
  } else if (corrected.endsWith('s') && !corrected.endsWith('ss') && corrected.length > 2) {
    const base = corrected.slice(0, -1);
    variations.add(base);
    ECOMMERCE_SYNONYMS[base]?.forEach((s) => variations.add(s));
  } else {
    const plural1 = corrected + 's';
    const plural2 = corrected + 'es';
    variations.add(plural1);
    ECOMMERCE_SYNONYMS[plural1]?.forEach((s) => variations.add(s));
    ECOMMERCE_SYNONYMS[plural2]?.forEach((s) => variations.add(s));
  }

  return Array.from(variations);
}

export const getSearchSynonyms = getSearchTokenVariations;
