import puppeteer from 'puppeteer';
import { load } from 'cheerio';

/**
 * Analyzes a Web3 dApp frontend using Puppeteer
 * Injects a mock wallet and records all interactions
 */
export async function analyzeWebsite(url) {
  console.log(`🔍 Starting frontend analysis for: ${url}`);
  
  let browser;
  try {
    // Launch browser with security settings
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // Track network requests
    const networkRequests = [];
    const apiCalls = [];
    const externalScripts = [];
    
    page.on('request', (request) => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
      
      // Track API calls
      if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
        apiCalls.push(request.url());
      }
      
      // Track external scripts
      if (request.resourceType() === 'script' && !request.url().includes(new URL(url).hostname)) {
        externalScripts.push(request.url());
      }
    });
    
    // Inject mock Web3 wallet
    await page.evaluateOnNewDocument(() => {
      // Mock Ethereum provider
      const mockProvider = {
        isMetaMask: true,
        networkVersion: '1',
        chainId: '0x1',
        selectedAddress: '0x742d35Cc6634C0532925a3b8D3Ac92cfF2e5f262',
        
        // Mock methods
        request: async (args) => {
          console.log('🦊 Mock wallet request:', args);
          
          switch (args.method) {
            case 'eth_requestAccounts':
              return ['0x742d35Cc6634C0532925a3b8D3Ac92cfF2e5f262'];
            case 'eth_accounts':
              return ['0x742d35Cc6634C0532925a3b8D3Ac92cfF2e5f262'];
            case 'eth_chainId':
              return '0x1';
            case 'personal_sign':
              return '0x' + 'mock_signature'.repeat(10);
            case 'eth_signTypedData_v4':
              return '0x' + 'mock_typed_signature'.repeat(10);
            case 'eth_sendTransaction':
              return '0x' + 'mock_transaction_hash'.repeat(8);
            default:
              return null;
          }
        },
        
        // Event handling
        on: (event, callback) => {
          console.log(`🦊 Mock wallet event listener: ${event}`);
        },
        removeListener: () => {},
        
        // Legacy methods
        enable: async () => ['0x742d35Cc6634C0532925a3b8D3Ac92cfF2e5f262'],
        send: function(method, params) {
          return this.request({ method, params });
        }
      };
      
      // Inject into window
      window.ethereum = mockProvider;
      window.web3 = { currentProvider: mockProvider };
      
      // Track wallet interactions
      window.walletInteractions = [];
      const originalRequest = mockProvider.request;
      mockProvider.request = async (args) => {
        window.walletInteractions.push({
          method: args.method,
          params: args.params,
          timestamp: Date.now()
        });
        return originalRequest(args);
      };
    });
    
    // Navigate to the dApp
    console.log(`📄 Loading page: ${url}`);
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for potential React/Vue apps to load
    await page.waitForTimeout(3000);
    
    // Get page content for analysis
    const content = await page.content();
    const $ = load(content);
    
    // Analyze interactive elements
    const buttons = [];
    const clickableElements = $('button, [role="button"], .btn, input[type="submit"], input[type="button"], a[href*="connect"], a[href*="wallet"]');
    
    for (let i = 0; i < clickableElements.length; i++) {
      const element = clickableElements[i];
      const $el = $(element);
      const text = $el.text().trim();
      const classes = $el.attr('class') || '';
      const id = $el.attr('id') || '';
      
      if (text && text.length > 0 && text.length < 100) {
        buttons.push({
          text,
          element: element.tagName,
          classes,
          id,
          action: 'unknown', // Will be determined by clicking
          risk: 'unknown'
        });
      }
    }
    
    // Try clicking buttons to see what they do
    console.log(`🖱️  Testing ${buttons.length} interactive elements...`);
    
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      try {
        const button = buttons[i];
        const selector = button.id ? `#${button.id}` : 
                        button.classes ? `.${button.classes.split(' ')[0]}` :
                        `${button.element}:contains("${button.text}")`;
        
        // Clear previous interactions
        await page.evaluate(() => {
          window.walletInteractions = [];
        });
        
        // Try to click the element
        const elementHandle = await page.$(selector);
        if (elementHandle) {
          await elementHandle.click();
          await page.waitForTimeout(1000);
          
          // Check what happened
          const interactions = await page.evaluate(() => window.walletInteractions);
          
          if (interactions.length > 0) {
            button.action = `Wallet request: ${interactions[0].method}`;
            button.risk = interactions[0].method.includes('send') ? 'danger' : 'warning';
          } else {
            // Check for navigation or modals
            const currentUrl = page.url();
            if (currentUrl !== url) {
              button.action = 'Navigation/redirect';
              button.risk = 'warning';
              // Navigate back
              await page.goto(url, { waitUntil: 'networkidle0' });
            } else {
              button.action = 'UI interaction (modal/state change)';
              button.risk = 'safe';
            }
          }
        }
      } catch (error) {
        console.log(`⚠️  Could not test button: ${button.text}`);
        buttons[i].action = 'Could not test';
        buttons[i].risk = 'unknown';
      }
    }
    
    // Extract contract addresses from page content and network requests
    const contractRegex = /0x[a-fA-F0-9]{40}/g;
    const contractAddresses = new Set();
    
    // From page content
    const pageText = $.root().text();
    const contentMatches = pageText.match(contractRegex);
    if (contentMatches) {
      contentMatches.forEach(addr => contractAddresses.add(addr.toLowerCase()));
    }
    
    // From network requests
    networkRequests.forEach(req => {
      const matches = req.url.match(contractRegex);
      if (matches) {
        matches.forEach(addr => contractAddresses.add(addr.toLowerCase()));
      }
    });
    
    // Get all wallet interactions that occurred
    const allWalletInteractions = await page.evaluate(() => window.walletInteractions || []);
    
    console.log(`✅ Frontend analysis complete`);
    console.log(`   - Found ${buttons.length} interactive elements`);
    console.log(`   - Detected ${contractAddresses.size} potential contract addresses`);
    console.log(`   - Recorded ${apiCalls.length} API calls`);
    console.log(`   - Found ${externalScripts.length} external scripts`);
    
    return {
      url,
      timestamp: new Date().toISOString(),
      buttons: buttons.slice(0, 20), // Limit to top 20
      signatures: allWalletInteractions
        .filter(i => i.method.includes('sign'))
        .map(i => `${i.method}: ${JSON.stringify(i.params).slice(0, 100)}...`),
      apiCalls: [...new Set(apiCalls)].slice(0, 10),
      externalScripts: [...new Set(externalScripts)].slice(0, 10),
      contracts: [...contractAddresses],
      networkRequests: networkRequests.length,
      walletInteractions: allWalletInteractions
    };
    
  } catch (error) {
    console.error('❌ Frontend analysis failed:', error);
    throw new Error(`Frontend analysis failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}