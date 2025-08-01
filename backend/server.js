import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir, readFile, writeFile } from 'fs/promises';
import { analyzeWebsite } from '../analysis/puppeteerScan.js';
import { scanContracts } from '../analysis/contractScanner.js';
import { generateReport } from '../utils/generateReport.js';

const __filename = fileURLToPath(import.meta.URL);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from reports directory
app.use('/reports', express.static(join(__dirname, '../reports')));

// API Routes

// Analyze a Web3 dApp
app.post('/api/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL is required' 
      });
    }

    console.log(`Starting analysis for: ${url}`);
    
    // Step 1: Analyze frontend with Puppeteer
    const frontendAnalysis = await analyzeWebsite(url);
    
    // Step 2: Analyze smart contracts
    const contractAnalysis = await scanContracts(frontendAnalysis.contracts);
    
    // Step 3: Generate comprehensive report
    const report = generateReport({
      url,
      frontendAnalysis,
      contractAnalysis
    });
    
    // Step 4: Save report
    const reportsDir = join(__dirname, '../reports');
    const reportPath = join(reportsDir, `${report.scanId}.json`);
    
    await writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`Analysis complete. Report saved: ${report.scanId}`);
    
    res.json({
      success: true,
      scanId: report.scanId,
      report
    });
    
  } catch (error) {
    console.error('Analysis failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Analysis failed'
    });
  }
});

// Get a specific report
app.get('/api/reports/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;
    const reportPath = join(__dirname, '../reports', `${scanId}.json`);
    
    const reportData = await readFile(reportPath, 'utf8');
    const report = JSON.parse(reportData);
    
    res.json(report);
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Report not found'
    });
  }
});

// Get all scan summaries
app.get('/api/scans', async (req, res) => {
  try {
    const reportsDir = join(__dirname, '../reports');
    const files = await readdir(reportsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const scans = await Promise.all(
      jsonFiles.map(async (file) => {
        try {
          const filePath = join(reportsDir, file);
          const data = await readFile(filePath, 'utf8');
          const report = JSON.parse(data);
          
          return {
            scanId: report.scanId,
            url: report.url,
            timestamp: report.timestamp,
            riskLevel: report.riskSummary.level,
            score: report.riskSummary.score
          };
        } catch (error) {
          console.error(`Error reading report ${file}:`, error);
          return null;
        }
      })
    );
    
    // Filter out null results and sort by timestamp (newest first)
    const validScans = scans
      .filter(scan => scan !== null)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    res.json(validScans);
  } catch (error) {
    console.error('Failed to fetch scans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scan history'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Web3 Security Analysis API running on port ${PORT}`);
  console.log(`📊 Frontend analysis ready`);
  console.log(`🔒 Smart contract scanner ready`);
  console.log(`📁 Reports will be stored in ./reports/`);
});

export default app;