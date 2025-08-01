import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Copy, AlertTriangle, CheckCircle, XCircle, Eye, Shield, Code } from 'lucide-react';

interface ReportData {
  scanId: string;
  url: string;
  timestamp: string;
  frontendAnalysis: {
    buttons: Array<{
      text: string;
      action: string;
      risk: 'safe' | 'warning' | 'danger';
    }>;
    signatures: string[];
    apiCalls: string[];
    externalScripts: string[];
  };
  contractAnalysis: {
    addresses: string[];
    verified: boolean[];
    functions: string[];
    risks: string[];
  };
  riskSummary: {
    level: 'safe' | 'warning' | 'danger';
    score: number;
    issues: string[];
  };
}

export const ReportPage: React.FC = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/${scanId}`);
        if (!response.ok) throw new Error('Report not found');
        
        const data = await response.json();
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    if (scanId) {
      fetchReport();
    }
  }, [scanId]);

  const downloadReport = (format: 'json' | 'md') => {
    if (!report) return;
    
    const content = format === 'json' 
      ? JSON.stringify(report, null, 2)
      : generateMarkdownReport(report);
    
    const blob = new Blob([content], { 
      type: format === 'json' ? 'application/json' : 'text/markdown' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${report.scanId}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (!report) return;
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
  };

  const generateMarkdownReport = (data: ReportData): string => {
    return `# Web3 dApp Security Report

**URL:** ${data.url}  
**Scan ID:** ${data.scanId}  
**Timestamp:** ${data.timestamp}

## Risk Summary
**Level:** ${data.riskSummary.level.toUpperCase()}  
**Score:** ${data.riskSummary.score}/100  

### Issues Found
${data.riskSummary.issues.map(issue => `- ${issue}`).join('\n')}

## Frontend Analysis
### Interactive Elements
${data.frontendAnalysis.buttons.map(btn => `- **${btn.text}**: ${btn.action} (${btn.risk})`).join('\n')}

### Signature Requests
${data.frontendAnalysis.signatures.map(sig => `- ${sig}`).join('\n')}

## Contract Analysis
### Addresses
${data.contractAnalysis.addresses.map(addr => `- ${addr}`).join('\n')}

### Functions Detected
${data.contractAnalysis.functions.map(func => `- ${func}`).join('\n')}
`;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'safe': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'danger': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'safe': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'danger': return XCircle;
      default: return AlertTriangle;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Report Not Found</h2>
          <p className="text-gray-400">{error || 'The requested report could not be loaded.'}</p>
        </div>
      </div>
    );
  }

  const RiskIcon = getRiskIcon(report.riskSummary.level);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Security Report</h1>
              <p className="text-gray-300">{report.url}</p>
              <p className="text-sm text-gray-400">Scan ID: {report.scanId}</p>
            </div>
            
            <div className="flex space-x-3 mt-4 lg:mt-0">
              <button
                onClick={() => downloadReport('json')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>JSON</span>
              </button>
              <button
                onClick={() => downloadReport('md')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Markdown</span>
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </button>
            </div>
          </div>

          {/* Risk Summary */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-600">
            <div className="flex items-center space-x-3 mb-4">
              <RiskIcon className={`h-8 w-8 ${getRiskColor(report.riskSummary.level)}`} />
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Risk Level: <span className={getRiskColor(report.riskSummary.level)}>
                    {report.riskSummary.level.toUpperCase()}
                  </span>
                </h3>
                <p className="text-gray-400">Security Score: {report.riskSummary.score}/100</p>
              </div>
            </div>
            
            {report.riskSummary.issues.length > 0 && (
              <div>
                <h4 className="text-lg font-medium text-white mb-2">Issues Found:</h4>
                <ul className="space-y-1">
                  {report.riskSummary.issues.map((issue, index) => (
                    <li key={index} className="text-gray-300 flex items-start space-x-2">
                      <span className="text-red-400">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Frontend Analysis */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <Eye className="h-6 w-6 text-blue-400" />
              <h2 className="text-2xl font-semibold text-white">Frontend Analysis</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Interactive Elements</h3>
                <div className="space-y-2">
                  {report.frontendAnalysis.buttons.map((button, index) => (
                    <div key={index} className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">{button.text}</span>
                        <span className={`text-sm ${getRiskColor(button.risk)}`}>
                          {button.risk}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{button.action}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-3">External Scripts</h3>
                <div className="space-y-1">
                  {report.frontendAnalysis.externalScripts.map((script, index) => (
                    <div key={index} className="text-sm text-gray-400 bg-gray-900/30 rounded p-2">
                      {script}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contract Analysis */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <Code className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-semibold text-white">Smart Contract Analysis</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Contract Addresses</h3>
                <div className="space-y-2">
                  {report.contractAnalysis.addresses.map((address, index) => (
                    <div key={index} className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
                      <div className="flex items-center justify-between">
                        <code className="text-gray-300 text-sm">{address}</code>
                        <span className={`text-sm ${report.contractAnalysis.verified[index] ? 'text-green-400' : 'text-yellow-400'}`}>
                          {report.contractAnalysis.verified[index] ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-3">Functions Detected</h3>
                <div className="space-y-1">
                  {report.contractAnalysis.functions.map((func, index) => (
                    <div key={index} className="text-sm text-gray-400 bg-gray-900/30 rounded p-2">
                      <code>{func}</code>
                    </div>
                  ))}
                </div>
              </div>

              {report.contractAnalysis.risks.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Contract Risks</h3>
                  <div className="space-y-1">
                    {report.contractAnalysis.risks.map((risk, index) => (
                      <div key={index} className="text-sm text-red-400 bg-red-900/20 rounded p-2 border border-red-800">
                        {risk}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};