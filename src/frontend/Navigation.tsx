import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Home, FileText, Search } from 'lucide-react';

export const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold text-white">
              Is This Web3 dApp Safe?
            </span>
          </Link>
          
          <div className="flex space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Analyze</span>
            </Link>
            
            <Link
              to="/scans"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/scans') 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Past Scans</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};