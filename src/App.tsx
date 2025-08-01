import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './frontend/Home';
import { ReportPage } from './frontend/ReportPage';
import { ScansPage } from './frontend/ScansPage';
import { Navigation } from './frontend/Navigation';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report/:scanId" element={<ReportPage />} />
          <Route path="/scans" element={<ScansPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;