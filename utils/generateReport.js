/**
 * Generate comprehensive security report
 */
export function generateReport({ url, frontendAnalysis, contractAnalysis }) {
  const scanId = generateScanId();
  const timestamp = new Date().toISOString();
  
  console.log(`📊 Generating security report: ${scanId}`);
  
  // Calculate risk score
  const riskSummary = calculateRiskSummary(frontendAnalysis, contractAnalysis);
  
  const report = {
    scanId,
    url,
    timestamp,
    version: '1.0.0',
    
    // Frontend Analysis Section
    frontendAnalysis: {
      summary: {
        buttonsAnalyzed: frontendAnalysis.buttons.length,
        walletInteractions: frontendAnalysis.walletInteractions.length,
        externalScripts: frontendAnalysis.externalScripts.length,
        apiCalls: frontendAnalysis.apiCalls.length
      },
      buttons: frontendAnalysis.buttons.map(button => ({
        text: button.text,
        action: button.action,
        risk: button.risk || 'unknown',
        element: button.element
      })),
      signatures: frontendAnalysis.signatures || [],
      apiCalls: frontendAnalysis.apiCalls || [],
      externalScripts: frontendAnalysis.externalScripts || [],
      walletInteractions: frontendAnalysis.walletInteractions || []
    },
    
    // Contract Analysis Section
    contractAnalysis: {
      summary: {
        contractsFound: contractAnalysis.addresses.length,
        verifiedContracts: contractAnalysis.verified.filter(v => v).length,
        functionsDetected: contractAnalysis.functions.length,
        risksIdentified: contractAnalysis.risks.length
      },
      addresses: contractAnalysis.addresses || [],
      verified: contractAnalysis.verified || [],
      functions: contractAnalysis.functions || [],
      risks: contractAnalysis.risks || [],
      analysis: contractAnalysis.analysis || []
    },
    
    // Risk Summary Section
    riskSummary,
    
    // Metadata
    metadata: {
      analysisMethod: 'Automated Puppeteer + Smart Contract Analysis',
      tools: ['Puppeteer', 'Ethers.js', '4byte.directory', 'Etherscan API'],
      disclaimers: [
        'This analysis is automated and may not catch all security issues',
        'Always verify contracts independently before interacting',
        'This tool does not guarantee the safety of any dApp',
        'Use at your own risk'
      ]
    }
  };
  
  console.log(`✅ Report generated successfully`);
  console.log(`   - Risk Level: ${riskSummary.level.toUpperCase()}`);
  console.log(`   - Security Score: ${riskSummary.score}/100`);
  console.log(`   - Issues Found: ${riskSummary.issues.length}`);
  
  return report;
}

/**
 * Calculate overall risk summary
 */
function calculateRiskSummary(frontendAnalysis, contractAnalysis) {
  const issues = [];
  let riskScore = 100; // Start with perfect score, deduct for issues
  
  // Frontend risks
  const dangerousButtons = frontendAnalysis.buttons?.filter(b => b.risk === 'danger') || [];
  const warningButtons = frontendAnalysis.buttons?.filter(b => b.risk === 'warning') || [];
  
  if (dangerousButtons.length > 0) {
    issues.push(`${dangerousButtons.length} high-risk button(s) detected (wallet transactions)`);
    riskScore -= dangerousButtons.length * 15;
  }
  
  if (warningButtons.length > 0) {
    issues.push(`${warningButtons.length} medium-risk button(s) detected (signatures/redirects)`);
    riskScore -= warningButtons.length * 5;
  }
  
  if (frontendAnalysis.externalScripts?.length > 3) {
    issues.push(`High number of external scripts (${frontendAnalysis.externalScripts.length})`);
    riskScore -= 10;
  }
  
  // Contract risks
  if (contractAnalysis.addresses?.length === 0) {
    issues.push('No smart contracts detected - may not be a genuine Web3 dApp');
    riskScore -= 20;
  }
  
  const unverifiedContracts = contractAnalysis.verified?.filter(v => !v).length || 0;
  if (unverifiedContracts > 0) {
    issues.push(`${unverifiedContracts} unverified contract(s) detected`);
    riskScore -= unverifiedContracts * 10;
  }
  
  // Add specific contract risks
  contractAnalysis.risks?.forEach(risk => {
    issues.push(risk);
    if (risk.includes('SELFDESTRUCT') || risk.includes('Proxy')) {
      riskScore -= 20;
    } else if (risk.includes('DELEGATECALL') || risk.includes('Dangerous function')) {
      riskScore -= 15;
    } else {
      riskScore -= 5;
    }
  });
  
  // Ensure score doesn't go below 0
  riskScore = Math.max(0, riskScore);
  
  // Determine risk level
  let level;
  if (riskScore >= 80) {
    level = 'safe';
  } else if (riskScore >= 50) {
    level = 'warning';
  } else {
    level = 'danger';
  }
  
  // Add positive findings
  if (issues.length === 0) {
    issues.push('No significant security issues detected');
  }
  
  const verifiedContracts = contractAnalysis.verified?.filter(v => v).length || 0;
  if (verifiedContracts > 0) {
    issues.unshift(`✅ ${verifiedContracts} verified contract(s) found`);
  }
  
  return {
    level,
    score: Math.round(riskScore),
    issues,
    summary: generateRiskSummaryText(level, riskScore, issues)
  };
}

/**
 * Generate human-readable risk summary
 */
function generateRiskSummaryText(level, score, issues) {
  const levelDescriptions = {
    safe: 'This dApp appears to be relatively safe to interact with.',
    warning: 'This dApp has some potential security concerns that should be reviewed.',
    danger: 'This dApp has significant security risks and should be approached with extreme caution.'
  };
  
  return `${levelDescriptions[level]} Security score: ${score}/100. ${issues.length} issue(s) identified.`;
}

/**
 * Generate unique scan ID
 */
function generateScanId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `scan_${timestamp}_${random}`;
}