import axios from 'axios';

/**
 * Fetch contract bytecode and source code from multiple sources
 */
export async function fetchContractCode(address) {
  console.log(`📡 Fetching contract data for: ${address}`);
  
  const result = {
    address,
    bytecode: null,
    verified: false,
    sourceCode: null,
    abi: null
  };
  
  try {
    // Try Etherscan first (most comprehensive)
    const etherscanResult = await fetchFromEtherscan(address);
    if (etherscanResult.bytecode) {
      Object.assign(result, etherscanResult);
      return result;
    }
    
    // Fallback to public RPC
    const rpcResult = await fetchFromRPC(address);
    if (rpcResult.bytecode) {
      Object.assign(result, rpcResult);
    }
    
    return result;
    
  } catch (error) {
    console.error(`❌ Failed to fetch contract code for ${address}:`, error);
    throw error;
  }
}

/**
 * Fetch from Etherscan API
 */
async function fetchFromEtherscan(address) {
  const result = {
    bytecode: null,
    verified: false,
    sourceCode: null,
    abi: null
  };
  
  try {
    // Get bytecode
    const bytecodeResponse = await axios.get('https://api.etherscan.io/api', {
      params: {
        module: 'proxy',
        action: 'eth_getCode',
        address,
        tag: 'latest',
        apikey: process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken'
      },
      timeout: 10000
    });
    
    if (bytecodeResponse.data?.result) {
      result.bytecode = bytecodeResponse.data.result;
    }
    
    // Try to get source code (for verified contracts)
    const sourceResponse = await axios.get('https://api.etherscan.io/api', {
      params: {
        module: 'contract',
        action: 'getsourcecode',
        address,
        apikey: process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken'
      },
      timeout: 10000
    });
    
    if (sourceResponse.data?.result?.[0]?.SourceCode) {
      result.verified = true;
      result.sourceCode = sourceResponse.data.result[0].SourceCode;
      
      // Try to parse ABI
      const abiString = sourceResponse.data.result[0].ABI;
      if (abiString && abiString !== 'Contract source code not verified') {
        try {
          result.abi = JSON.parse(abiString);
        } catch (e) {
          console.log('Could not parse ABI');
        }
      }
    }
    
  } catch (error) {
    console.log(`⚠️  Etherscan API failed for ${address}:`, error.message);
  }
  
  return result;
}

/**
 * Fetch from public RPC endpoint
 */
async function fetchFromRPC(address) {
  const result = {
    bytecode: null,
    verified: false,
    sourceCode: null,
    abi: null
  };
  
  try {
    // Use public Ethereum RPC
    const response = await axios.post('https://eth.llamarpc.com', {
      jsonrpc: '2.0',
      method: 'eth_getCode',
      params: [address, 'latest'],
      id: 1
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data?.result) {
      result.bytecode = response.data.result;
    }
    
  } catch (error) {
    console.log(`⚠️  RPC failed for ${address}:`, error.message);
  }
  
  return result;
}