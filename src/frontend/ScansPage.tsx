import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Shield, ExternalLink, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ScanSummary {
  scanId: string;
  url: string;
  timestamp: string;
  riskLevel: 'safe' | 'warning' | 'danger';
  score: number;
}

export const ScansPage: React.FC = () => {
  const [scans, setScans] = useState<ScanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await fetch('/api/scans');
        const data = await response.json();
        setScans(data);
      } catch (error) {
        console.error('Failed to fetch scans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScans();
  }, []);

  const filteredScans = scans.filter(scan =>
    scan.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scan.scanId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'safe': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'danger': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
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

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Security Scan History</h1>
          <p className="text-gray-300">
            View and download reports from previous Web3 dApp security analyses
          </p>
        </div>

        {/* Search */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by URL or Scan ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Scans List */}
        {filteredScans.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {searchTerm ? 'No matching scans found' : 'No scans yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Start by analyzing your first Web3 dApp'
              }
            </p>
            {!searchTerm && (
              <Link
                to="/"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Shield className="h-5 w-5" />
                <span>Analyze dApp</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredScans.map((scan) => {
              const RiskIcon = getRiskIcon(scan.riskLevel);
              
              return (
                <div
                  key={scan.scanId}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 min-w-0 mb-4 lg:mb-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <RiskIcon className={`h-5 w-5 ${getRiskColor(scan.riskLevel).split(' ')[0]}`} />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(scan.riskLevel)}`}>
                          {scan.riskLevel.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-400">
                          Score: {scan.score}/100
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-1 truncate">
                        {scan.url}
                      </h3>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(scan.timestamp)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Shield className="h-4 w-4" />
                          <span>ID: {scan.scanId.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <a
                        href={scan.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Visit</span>
                      </a>
                      
                      <Link
                        to={`/report/${scan.scanId}`}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                      >
                        <Shield className="h-4 w-4" />
                        <span>View Report</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};