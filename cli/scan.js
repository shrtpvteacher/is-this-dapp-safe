#!/usr/bin/env node

import { Command } from 'commander';
import { analyzeWebsite } from '../analysis/puppeteerScan.js';
import { scanContracts } from '../analysis/contractScanner.js';
import { generateReport } from '../utils/generateReport.js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const program = new Command();

program
  .name('web3-security-scan')
  .description('CLI tool for Web3 dApp security analysis')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze a Web3 dApp for security issues')
  .argument('<url>', 'URL of the Web3 dApp to analyze')
  .option('-o, --output <path>', 'Output directory for reports', './reports')
  .option('-f, --format <format>', 'Report format (json|md|both)', 'json')
  .option('--rpc <url>', 'Custom RPC endpoint for contract analysis')
  .option('--timeout <seconds>', 'Analysis timeout in seconds', '60')
  .option('--verbose', 'Verbose logging')
  .action(async (url, options) => {
    console.log('🚀 Web3 dApp Security Scanner');
    console.log('================================');
    console.log();
    
    if (options.verbose) {
      console.log('Options:', options);
      console.log();
    }
    
    try {
      // Validate URL
      new URL(url);
      
      console.log(`🔍 Analyzing: ${url}`);
      console.log();
      
      // Set environment variables if provided
      if (options.rpc) {
        process.env.CUSTOM_RPC_URL = options.rpc;
      }
      
      // Step 1: Frontend Analysis
      console.log('📄 Step 1: Frontend Analysis');
      console.log('   Launching secure browser environment...');
      const frontendAnalysis = await analyzeWebsite(url);
      console.log('   ✅ Frontend analysis complete');
      console.log();
      
      // Step 2: Contract Analysis
      console.log('🔒 Step 2: Smart Contract Analysis');
      console.log('   Analyzing discovered contracts...');
      const contractAnalysis = await scanContracts(frontendAnalysis.contracts);
      console.log('   ✅ Contract analysis complete');
      console.log();
      
      // Step 3: Generate Report
      console.log('📊 Step 3: Generating Security Report');
      const report = generateReport({
        url,
        frontendAnalysis,
        contractAnalysis
      });
      console.log('   ✅ Report generated');
      console.log();
      
      // Step 4: Save Report
      console.log('💾 Step 4: Saving Report');
      
      // Ensure output directory exists
      await mkdir(options.output, { recursive: true });
      
      const reportId = report.scanId;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      if (options.format === 'json' || options.format === 'both') {
        const jsonPath = join(options.output, `${reportId}.json`);
        await writeFile(jsonPath, JSON.stringify(report, null, 2));
        console.log(`   📄 JSON report saved: ${jsonPath}`);
      }
      
      if (options.format === 'md' || options.format === 'both') {
        const mdPath = join(options.output, `${reportId}.md`);
        const markdown = generateMarkdownReport(report);
        await writeFile(mdPath, markdown);
        console.log(`   📝 Markdown report saved: ${mdPath}`);
      }
      
      console.log();
      
      // Display Summary
      console.log('📋 SECURITY SUMMARY');
      console.log('===================');
      console.log(`🌐 URL: ${report.url}`);
      console.log(`🆔 Scan ID: ${report.scanId}`);
      console.log(`📅 Timestamp: ${report.timestamp}`);
      console.log();
      
      const { level, score, issues } = report.riskSummary;
      const levelEmoji = {
        safe: '✅',
        warning: '⚠️',
        danger: '🚨'
      };
      
      console.log(`${levelEmoji[level]} Risk Level: ${level.toUpperCase()}`);
      console.log(`📊 Security Score: ${score}/100`);
      console.log();
      
      if (issues.length > 0) {
        console.log('🔍 Issues Found:');
        issues.forEach((issue, index) => {
          console.log(`   ${index + 1}. ${issue}`);
        });
        console.log();
      }
      
      console.log('Frontend Analysis:');
      console.log(`   • ${report.frontendAnalysis.summary.buttonsAnalyzed} interactive elements analyzed`);
      console.log(`   • ${report.frontendAnalysis.summary.walletInteractions} wallet interactions detected`);
      console.log(`   • ${report.frontendAnalysis.summary.externalScripts} external scripts found`);
      console.log();
      
      console.log('Contract Analysis:');
      console.log(`   • ${report.contractAnalysis.summary.contractsFound} contracts discovered`);
      console.log(`   • ${report.contractAnalysis.summary.verifiedContracts} verified contracts`);
      console.log(`   • ${report.contractAnalysis.summary.functionsDetected} functions identified`);
      console.log();
      
      console.log('✅ Analysis complete!');
      
      // Exit with appropriate code
      process.exit(level === 'danger' ? 1 : 0);
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      
      if (options.verbose) {
        console.error(error.stack);
      }
      
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List previous scan reports')
  .option('-o, --output <path>', 'Reports directory', './reports')
  .action(async (options) => {
    try {
      const { readdir, readFile } = await import('fs/promises');
      const files = await readdir(options.output);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      if (jsonFiles.length === 0) {
        console.log('No previous scans found.');
        return;
      }
      
      console.log('📋 Previous Security Scans');
      console.log('=========================');
      console.log();
      
      for (const file of jsonFiles.slice(0, 10)) { // Show last 10
        try {
          const content = await readFile(join(options.output, file), 'utf8');
          const report = JSON.parse(content);
          
          const levelEmoji = {
            safe: '✅',
            warning: '⚠️',
            danger: '🚨'
          };
          
          console.log(`${levelEmoji[report.riskSummary.level]} ${report.url}`);
          console.log(`   ID: ${report.scanId}`);
          console.log(`   Date: ${new Date(report.timestamp).toLocaleString()}`);
          console.log(`   Score: ${report.riskSummary.score}/100`);
          console.log();
        } catch (e) {
          console.log(`❌ Could not read ${file}: ${e.message}`);
        }
      }
    } catch (error) {
      console.error('Failed to list scans:', error.message);
      process.exit(1);
    }
  });

/**
 * Generate markdown report
 */
function generateMarkdownReport(report) {
  return `# Web3 dApp Security Report

**URL:** ${report.url}  
**Scan ID:** ${report.scanId}  
**Timestamp:** ${report.timestamp}  
**Tool Version:** ${report.version}

## 🛡️ Risk Summary

**Risk Level:** ${report.riskSummary.level.toUpperCase()}  
**Security Score:** ${report.riskSummary.score}/100  

${report.riskSummary.summary}

### Issues Identified
${report.riskSummary.issues.map(issue => `- ${issue}`).join('\n')}

## 🖥️ Frontend Analysis

### Summary
- **Interactive Elements:** ${report.frontendAnalysis.summary.buttonsAnalyzed}
- **Wallet Interactions:** ${report.frontendAnalysis.summary.walletInteractions}
- **External Scripts:** ${report.frontendAnalysis.summary.externalScripts}
- **API Calls:** ${report.frontendAnalysis.summary.apiCalls}

### Interactive Elements
${report.frontendAnalysis.buttons.map(btn => 
  `- **${btn.text}** (${btn.element}): ${btn.action} - Risk: ${btn.risk}`
).join('\n')}

### External Scripts
${report.frontendAnalysis.externalScripts.map(script => `- ${script}`).join('\n')}

## 🔒 Smart Contract Analysis

### Summary
- **Contracts Found:** ${report.contractAnalysis.summary.contractsFound}
- **Verified Contracts:** ${report.contractAnalysis.summary.verifiedContracts}
- **Functions Detected:** ${report.contractAnalysis.summary.functionsDetected}
- **Risks Identified:** ${report.contractAnalysis.summary.risksIdentified}

### Contract Addresses
${report.contractAnalysis.addresses.map((addr, i) => 
  `- ${addr} ${report.contractAnalysis.verified[i] ? '✅ Verified' : '❓ Unverified'}`
).join('\n')}

### Functions Detected
${report.contractAnalysis.functions.map(func => `- \`${func}\``).join('\n')}

### Contract Risks
${report.contractAnalysis.risks.map(risk => `- ⚠️ ${risk}`).join('\n')}

## 📝 Disclaimer

${report.metadata.disclaimers.map(disclaimer => `- ${disclaimer}`).join('\n')}

---

*Report generated by Web3 dApp Security Scanner v${report.version}*  
*Analysis performed on ${report.timestamp}*
`;
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

program.parse();