// frontend/src/pages/test/TestRequestPage.js
import React from 'react';
import TestRequestComponent from '../../components/test/TestRequestComponent';
import { Link } from 'react-router-dom';

const TestRequestPage = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-purple-gradient">
          Request Functionality Test Page
        </h1>
        <Link 
          to="/"
          className="text-theme-purple-400 hover:text-theme-purple-300 transition"
        >
          ← Back to Home
        </Link>
      </div>
      
      <div className="mb-6 p-4 bg-yellow-800 bg-opacity-20 border border-yellow-700 rounded-lg text-yellow-300 text-sm">
        <p className="font-medium">⚠️ This is a testing page for developers only.</p>
        <p>Use this page to diagnose request functionality issues in isolation.</p>
      </div>
      
      <TestRequestComponent />
    </div>
  );
};

export default TestRequestPage;
