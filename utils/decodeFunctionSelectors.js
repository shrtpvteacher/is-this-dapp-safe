import axios from 'axios';

/**
 * Decode function selectors using 4byte.directory
 */
export async function decodeFunctionSelectors(selectors) {
  if (selectors.length === 0) return [];
  
  console.log(`🔍 Decoding ${selectors.length} function selectors...`);
  
  const functions = [];
  
  // Batch requests to 4byte.directory
  for (const selector of selectors.slice(0, 10)) { // Limit to avoid rate limiting
    try {
      const response = await axios.get(`https://www.4byte.directory/api/v1/signatures/`, {
        params: {
          hex_signature: selector
        },
        timeout: 5000
      });
      
      if (response.data?.results?.length > 0) {
        // Take the first (most common) result
        const signature = response.data.results[0].text_signature;
        functions.push(signature);
        console.log(`✅ Decoded: ${selector} -> ${signature}`);
      } else {
        console.log(`❓ Unknown selector: ${selector}`);
        functions.push(`Unknown function: ${selector}`);
      }
      
      // Small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`⚠️  Failed to decode ${selector}:`, error.message);
      functions.push(`Failed to decode: ${selector}`);
    }
  }
  
  return functions;
}

/**
 * Common function selectors for quick reference
 */
const COMMON_SELECTORS = {
  '0xa9059cbb': 'transfer(address,uint256)',
  '0x23b872dd': 'transferFrom(address,address,uint256)',
  '0x095ea7b3': 'approve(address,uint256)',
  '0x70a08231': 'balanceOf(address)',
  '0x18160ddd': 'totalSupply()',
  '0x8da5cb5b': 'owner()',
  '0xf2fde38b': 'transferOwnership(address)',
  '0x715018a6': 'renounceOwnership()',
  '0x40c10f19': 'mint(address,uint256)',
  '0x42966c68': 'burn(uint256)',
  '0x06fdde03': 'name()',
  '0x95d89b41': 'symbol()',
  '0x313ce567': 'decimals()',
  '0xa0712d68': 'mint(uint256)',
  '0xd0def521': 'message()',
  '0x12065fe0': 'getBalance()',
  '0x3ccfd60b': 'withdraw()',
  '0x2e1a7d4d': 'withdraw(uint256)',
  '0xf14fcbc8': 'deposit()',
  '0x1249c58b': 'mint()',
  '0xff1e7774': 'claim()',
  '0x4e71d92d': 'claim()',
  '0x379607f5': 'claim(uint256)',
  '0x5312ea8e': 'claim(address)',
  '0x2e17de78': 'setImplementation(address)',
  '0x5c60da1b': 'implementation()',
  '0x8f283970': 'changeAdmin(address)',
  '0xf851a440': 'admin()',
};

/**
 * Get function signature from selector using common functions first
 */
export function getFunctionSignature(selector) {
  return COMMON_SELECTORS[selector] || null;
}