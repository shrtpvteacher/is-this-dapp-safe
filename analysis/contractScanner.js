import { ethers } from 'ethers';
import { fetchContractCode } from '../utils/fetchContractCode.js';
import { decodeFunctionSelectors } from '../utils/decodeFunctionSelectors.js';

/**
 * Analyzes smart contracts found in the dApp
 * Fetches bytecode, attempts ABI detection, and identifies risks
 */
export async function scanContracts(contractAddresses) {
  console.log(`🔒 Starting contract analysis for ${contractAddresses.length} addresses...`);
  
  if (contractAddresses.length === 0) {
    return {
      addresses: [],
      verified: [],
      functions: [],
      risks: [],
      analysis: []
    };
  }
  
  const results = {
    addresses: [],
    verified: [],
    functions: [],
    risks: [],
    analysis: []
  };
  
  // Limit to first 5 contracts to avoid rate limiting
  const addressesToAnalyze = contractAddresses.slice(0, 5);
  
  for (const address of addressesToAnalyze) {
    try {
      console.log(`🔍 Analyzing contract: ${address}`);
      
      // Fetch contract bytecode
      const contractData = await fetchContractCode(address);
      
      if (!contractData.bytecode || contractData.bytecode === '0x') {
        console.log(`⚠️  No bytecode found for ${address} (likely EOA)`);
        continue;
      }
      
      results.addresses.push(address);
      results.verified.push(contractData.verified);
      
      // Analyze bytecode for function selectors
      const functionSelectors = extractFunctionSelectors(contractData.bytecode);
      const decodedFunctions = await decodeFunctionSelectors(functionSelectors);
      
      results.functions.push(...decodedFunctions);
      
      // Risk analysis
      const risks = analyzeContractRisks(contractData.bytecode, decodedFunctions);
      results.risks.push(...risks);
      
      // Store detailed analysis
      results.analysis.push({
        address,
        verified: contractData.verified,
        sourceCode: contractData.sourceCode || null,
        functions: decodedFunctions,
        risks,
        bytecodeLength: contractData.bytecode.length,
        isProxy: detectProxy(contractData.bytecode)
      });
      
    } catch (error) {
      console.error(`❌ Failed to analyze contract ${address}:`, error);
      results.risks.push(`Failed to analyze contract ${address}: ${error.message}`);
    }
  }
  
  console.log(`✅ Contract analysis complete`);
  console.log(`   - Analyzed ${results.addresses.length} contracts`);
  console.log(`   - Found ${results.functions.length} functions`);
  console.log(`   - Identified ${results.risks.length} potential risks`);
  
  return results;
}

/**
 * Extract function selectors from bytecode
 */
function extractFunctionSelectors(bytecode) {
  const selectors = new Set();
  
  // Look for PUSH4 instructions followed by potential function selectors
  // This is a simplified approach - real analysis would be more sophisticated
  const regex = /63([a-fA-F0-9]{8})/g;
  let match;
  
  while ((match = regex.exec(bytecode)) !== null) {
    const selector = '0x' + match[1];
    selectors.add(selector);
  }
  
  return [...selectors];
}

/**
 * Analyze contract bytecode for potential security risks
 */
function analyzeContractRisks(bytecode, functions) {
  const risks = [];
  
  // Check for dangerous opcodes
  const dangerousOpcodes = {
    'ff': 'SELFDESTRUCT - Contract can be destroyed',
    'f4': 'DELEGATECALL - Dangerous proxy pattern detected',
    'f1': 'CALL - External calls detected',
    'f2': 'CALLCODE - Legacy external call pattern'
  };
  
  for (const [opcode, description] of Object.entries(dangerousOpcodes)) {
    if (bytecode.toLowerCase().includes(opcode)) {
      risks.push(description);
    }
  }
  
  // Check for proxy patterns
  if (detectProxy(bytecode)) {
    risks.push('Proxy contract detected - Implementation can be changed');
  }
  
  // Check for potentially dangerous functions
  const dangerousFunctions = [
    'transferOwnership',
    'selfdestruct',
    'suicide',
    'delegatecall',
    'changeImplementation'
  ];
  
  for (const func of functions) {
    const funcName = func.toLowerCase();
    for (const dangerous of dangerousFunctions) {
      if (funcName.includes(dangerous.toLowerCase())) {
        risks.push(`Dangerous function detected: ${func}`);
      }
    }
  }
  
  // Check bytecode size (potential for complexity/gas issues)
  if (bytecode.length > 50000) { // ~25KB
    risks.push('Large contract size - High complexity detected');
  }
  
  return risks;
}

/**
 * Detect if contract is a proxy
 */
function detectProxy(bytecode) {
  // Look for common proxy patterns
  const proxyPatterns = [
    '6010600a', // Common proxy initialization pattern
    'f4', // DELEGATECALL opcode
    '60008060208180', // Common proxy deployment pattern
  ];
  
  const lowerBytecode = bytecode.toLowerCase();
  return proxyPatterns.some(pattern => lowerBytecode.includes(pattern));
}