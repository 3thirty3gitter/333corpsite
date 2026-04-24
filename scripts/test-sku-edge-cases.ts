/**
 * Test SKU edge cases for SinaLite URL conversion
 * 
 * This script tests various edge cases to ensure robust SKU handling:
 * - Empty/whitespace SKUs
 * - Special characters
 * - Very short SKUs
 * - Unknown categories
 * - Mixed case and numbers
 * - Multiple separators
 * 
 * Run with: npx tsx scripts/test-sku-edge-cases.ts
 */

/**
 * Category mapping for SinaLite products - same as in the API routes
 */
const CATEGORY_MAP = [
  { prefixes: ['businesscard_', 'business_card_', 'bc_'], category: 'business-cards', remove: /^(business_?card_|bc_)/ },
  { prefixes: ['postcard_', 'pc_'], category: 'postcards', remove: /^(postcard_|pc_)/ },
  { prefixes: ['flyer_'], category: 'flyers', remove: /^flyer_/ },
  { prefixes: ['brochure_'], category: 'brochures', remove: /^brochure_/ },
  { prefixes: ['poster_'], category: 'posters', remove: /^poster_/ },
  { prefixes: ['banner_'], category: 'banners', remove: /^banner_/ },
  { prefixes: ['envelope_', 'env_'], category: 'envelopes', remove: /^(envelope_|env_)/ },
  { prefixes: ['sticker_', 'label_'], category: 'stickers-labels', remove: /^(sticker_|label_)/ },
  { prefixes: ['bookmark_'], category: 'bookmarks', remove: /^bookmark_/ },
  { prefixes: ['letterhead_'], category: 'letterheads', remove: /^letterhead_/ },
  { prefixes: ['notepad_'], category: 'notepads', remove: /^notepad_/ },
  { prefixes: ['presentation_folder_', 'folder_'], category: 'presentation-folders', remove: /^(presentation_folder_|folder_)/ },
];

function convertSkuToUrl(sku: string): string {
  // Edge case: validate input
  if (!sku || typeof sku !== 'string') {
    throw new Error('SKU must be a non-empty string');
  }
  
  const trimmedSku = sku.trim();
  if (!trimmedSku) {
    throw new Error('SKU cannot be empty or whitespace');
  }
  
  // Edge case: warn about very short SKUs
  if (trimmedSku.length < 3) {
    console.warn(`⚠️  Very short SKU detected: "${trimmedSku}" - may not match correctly`);
  }
  
  // Normalize: lowercase and sanitize special characters
  let skuLower = trimmedSku.toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')  // Replace special chars with underscores
    .replace(/_+/g, '_')            // Collapse multiple underscores
    .replace(/^_|_$/g, '');         // Remove leading/trailing underscores
  
  // Edge case: after sanitization, check if still valid
  if (!skuLower) {
    throw new Error(`SKU "${sku}" contains only special characters`);
  }
  
  let category = '';
  let productPath = '';
  let matched = false;
  
  // Try to match against known categories
  for (const mapping of CATEGORY_MAP) {
    for (const prefix of mapping.prefixes) {
      if (skuLower.startsWith(prefix)) {
        category = mapping.category;
        productPath = skuLower.replace(mapping.remove, '').replace(/_/g, '-');
        matched = true;
        break;
      }
    }
    if (matched) break;
  }
  
  // Edge case: no category matched - use generic fallback
  if (!matched) {
    console.warn(`⚠️  SKU "${sku}" didn't match any known category - using fallback`);
    category = 'print-products';
    productPath = skuLower.replace(/_/g, '-');
  }
  
  // Edge case: ensure product path is not empty after conversion
  if (!productPath) {
    console.warn(`⚠️  SKU "${sku}" resulted in empty product path - using full SKU`);
    productPath = skuLower.replace(/_/g, '-');
  }
  
  return `https://sinalite.com/en_ca/${category}/${productPath}.html`;
}

// Test cases
interface TestCase {
  name: string;
  sku: string | any;
  shouldThrow?: boolean;
  expectedUrl?: string;
  expectWarning?: boolean;
}

const testCases: TestCase[] = [
  // Valid standard cases
  {
    name: 'Standard business card SKU',
    sku: 'businesscard_14pt_profit_maximizer',
    expectedUrl: 'https://sinalite.com/en_ca/business-cards/14pt-profit-maximizer.html'
  },
  {
    name: 'Business card with underscore variant',
    sku: 'business_card_glossy_premium',
    expectedUrl: 'https://sinalite.com/en_ca/business-cards/glossy-premium.html'
  },
  {
    name: 'Postcard SKU',
    sku: 'postcard_10pt_matte',
    expectedUrl: 'https://sinalite.com/en_ca/postcards/10pt-matte.html'
  },
  {
    name: 'Flyer SKU',
    sku: 'flyer_8x11_glossy',
    expectedUrl: 'https://sinalite.com/en_ca/flyers/8x11-glossy.html'
  },
  {
    name: 'Envelope SKU',
    sku: 'envelope_#10_white',
    expectedUrl: 'https://sinalite.com/en_ca/envelopes/10-white.html'
  },
  {
    name: 'Sticker SKU',
    sku: 'sticker_round_2inch',
    expectedUrl: 'https://sinalite.com/en_ca/stickers-labels/round-2inch.html'
  },
  
  // Edge case: empty/null SKUs
  {
    name: 'Empty string SKU',
    sku: '',
    shouldThrow: true
  },
  {
    name: 'Whitespace only SKU',
    sku: '   ',
    shouldThrow: true
  },
  {
    name: 'Null SKU',
    sku: null,
    shouldThrow: true
  },
  {
    name: 'Undefined SKU',
    sku: undefined,
    shouldThrow: true
  },
  
  // Edge case: special characters
  {
    name: 'SKU with special characters',
    sku: 'business-card@14pt#premium!',
    expectWarning: true, // Will use fallback since hyphen breaks prefix match
    expectedUrl: 'https://sinalite.com/en_ca/print-products/business-card-14pt-premium.html'
  },
  {
    name: 'SKU with parentheses',
    sku: 'postcard_(10pt)_matte',
    expectedUrl: 'https://sinalite.com/en_ca/postcards/10pt-matte.html'
  },
  {
    name: 'SKU with only special characters',
    sku: '@#$%',
    shouldThrow: true
  },
  
  // Edge case: very short SKUs
  {
    name: 'Very short SKU (2 chars)',
    sku: 'bc',
    expectWarning: true,
    expectedUrl: 'https://sinalite.com/en_ca/print-products/bc.html'
  },
  {
    name: 'Very short SKU (1 char)',
    sku: 'p',
    expectWarning: true,
    expectedUrl: 'https://sinalite.com/en_ca/print-products/p.html'
  },
  
  // Edge case: no underscores
  {
    name: 'SKU without underscores',
    sku: 'businesscard14pt',
    expectWarning: true,
    expectedUrl: 'https://sinalite.com/en_ca/print-products/businesscard14pt.html'
  },
  
  // Edge case: numeric only
  {
    name: 'Numeric only SKU',
    sku: '123456',
    expectWarning: true,
    expectedUrl: 'https://sinalite.com/en_ca/print-products/123456.html'
  },
  
  // Edge case: mixed case
  {
    name: 'Mixed case SKU',
    sku: 'BusinessCard_14PT_Premium',
    expectedUrl: 'https://sinalite.com/en_ca/business-cards/14pt-premium.html'
  },
  
  // Edge case: multiple separators
  {
    name: 'Multiple consecutive underscores',
    sku: 'businesscard___14pt___glossy',
    expectedUrl: 'https://sinalite.com/en_ca/business-cards/14pt-glossy.html'
  },
  {
    name: 'Mixed separators (underscore and hyphen)',
    sku: 'business_card-14pt_glossy',
    expectWarning: true, // Hyphen in original breaks pattern matching
    expectedUrl: 'https://sinalite.com/en_ca/print-products/business-card-14pt-glossy.html'
  },
  
  // Edge case: unknown category
  {
    name: 'Unknown category SKU',
    sku: 'widget_custom_special',
    expectWarning: true,
    expectedUrl: 'https://sinalite.com/en_ca/print-products/widget-custom-special.html'
  },
  
  // Edge case: abbreviated prefixes
  {
    name: 'Business card abbreviated (bc_)',
    sku: 'bc_14pt_premium',
    expectedUrl: 'https://sinalite.com/en_ca/business-cards/14pt-premium.html'
  },
  {
    name: 'Postcard abbreviated (pc_)',
    sku: 'pc_glossy_4x6',
    expectedUrl: 'https://sinalite.com/en_ca/postcards/glossy-4x6.html'
  },
  {
    name: 'Envelope abbreviated (env_)',
    sku: 'env_white_standard',
    expectedUrl: 'https://sinalite.com/en_ca/envelopes/white-standard.html'
  },
  
  // Edge case: typos in prefix
  {
    name: 'Typo in prefix (bussinescard)',
    sku: 'bussinescard_14pt_premium',
    expectWarning: true,
    expectedUrl: 'https://sinalite.com/en_ca/print-products/bussinescard-14pt-premium.html'
  },
  
  // Edge case: trailing/leading whitespace
  {
    name: 'Leading whitespace',
    sku: '  businesscard_14pt_premium',
    expectedUrl: 'https://sinalite.com/en_ca/business-cards/14pt-premium.html'
  },
  {
    name: 'Trailing whitespace',
    sku: 'postcard_matte_10pt  ',
    expectedUrl: 'https://sinalite.com/en_ca/postcards/matte-10pt.html'
  },
  {
    name: 'Both leading and trailing whitespace',
    sku: '  flyer_8x11_glossy  ',
    expectedUrl: 'https://sinalite.com/en_ca/flyers/8x11-glossy.html'
  },
];

// Run tests
console.log('🧪 Testing SKU Edge Cases for SinaLite URL Conversion\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;
let warnings = 0;

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);
  console.log(`   Input: ${JSON.stringify(testCase.sku)}`);
  
  try {
    const result = convertSkuToUrl(testCase.sku);
    
    if (testCase.shouldThrow) {
      console.log(`   ❌ FAILED: Expected error but got result: ${result}`);
      failed++;
    } else if (testCase.expectedUrl) {
      if (result === testCase.expectedUrl) {
        console.log(`   ✅ PASSED: ${result}`);
        passed++;
      } else {
        console.log(`   ❌ FAILED:`);
        console.log(`      Expected: ${testCase.expectedUrl}`);
        console.log(`      Got:      ${result}`);
        failed++;
      }
    } else {
      console.log(`   ✅ PASSED: ${result}`);
      passed++;
    }
  } catch (error: any) {
    if (testCase.shouldThrow) {
      console.log(`   ✅ PASSED: Threw error as expected: ${error.message}`);
      passed++;
    } else {
      console.log(`   ❌ FAILED: Unexpected error: ${error.message}`);
      failed++;
    }
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Test Results:`);
console.log(`   ✅ Passed: ${passed}/${testCases.length}`);
console.log(`   ❌ Failed: ${failed}/${testCases.length}`);
console.log(`   Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 All tests passed!\n');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${failed} test(s) failed\n`);
  process.exit(1);
}
