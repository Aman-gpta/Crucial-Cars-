// frontend/src/components/layout/Spinner.js
import React from 'react';

const Spinner = ({ size = 'medium' }) => {
  // Size variants
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.medium;

  return (
    <div className="flex justify-center items-center p-4">
      <div className={`${sizeClass} rounded-full border-t-theme-purple-600 border-r-theme-purple-300 border-b-theme-purple-600 border-l-theme-purple-300 animate-spin`}></div>
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(139, 92, 246, 0.7); }
          50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.9); }
        }
        .animate-spin {
          animation: spin 0.8s linear infinite, pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Spinner;
