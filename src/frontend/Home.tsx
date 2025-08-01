import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Eye, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

export const Home: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setIsAnalyzing(true);
    setProgress(0);

    try {
      const steps = [
        { step: 'Launching secure browser environment...', progress: 10 },
        { step: 'Injecting mock wallet provider...', progress: 20 },
        { step: 'Analyzing frontend behavior...', progress: 40 },
        { step: 'Extracting smart contract addresses...', progress: 60 },
        { step: 'Fetching contract bytecode...', progress: 80 },
        { step: 'Generating security report...', progress: 100 }
      ];

      for (const { step, progress: stepProgress } of steps) {
        setCurrentStep(step);
        setProgress(stepProgress);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const result = await response.json();
      
      if (result.success) {
        navigate(`/report/${result.scanId}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  const features = [
    {
      icon: Eye,
      title: 'Frontend Analysis',
      description: 'Deep inspection of UI interactions, buttons, and wallet connections'
    },
    {
      icon: Shield,
      title: 'Smart Contract Security',
      description: 'Bytecode analysis, function detection, and risk assessment'
    },
    {
      icon: Zap,
      title: 'Real-time Simulation',
      description: 'Safe testing environment with mock wallet interactions'
    },
    {
      icon: FileText,
      title: 'Detailed Reports',
      description: 'Comprehensive analysis with exportable JSON and Markdown formats'
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Shield className="h-16 w-16 text-blue-400" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
            Is This Web3 dApp
            <span className="text-blue-400"> Safe</span>?
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Professional-grade security analysis for Web3 applications. 
            Analyze frontend behavior, smart contracts, and potential risks 
            before connecting your wallet.
          </p>
        </div>

        {/* Analysis Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Analyze a Web3 dApp
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
                  dApp URL
                </label>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example-dapp.com"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isAnalyzing}
                />
              </div>

              {isAnalyzing && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                    <span className="text-sm text-gray-300">{currentStep}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!url.trim() || isAnalyzing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Shield className="h-5 w-5" />
                <span>{isAnalyzing ? 'Analyzing...' : 'Analyze dApp Security'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors">
              <feature.icon className="h-8 w-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-300 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                Security Notice
              </h3>
              <p className="text-yellow-100 text-sm">
                This tool analyzes dApps in a safe, sandboxed environment without 
                requiring wallet connections. Always verify results independently 
                and never connect your real wallet to untrusted applications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};