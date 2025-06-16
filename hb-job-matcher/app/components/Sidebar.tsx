'use client';

import { useState, useEffect } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}

export default function Sidebar({ isOpen, onClose, apiKey, setApiKey }: SidebarProps) {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [showApiKey, setShowApiKey] = useState(false);

  // Update tempApiKey when apiKey prop changes (e.g., when loaded from localStorage)
  useEffect(() => {
    setTempApiKey(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    setApiKey(tempApiKey);
    onClose();
  };

  const handleClear = () => {
    setTempApiKey('');
    setApiKey('');
  };

  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey);
  };

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black-60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-[480px] bg-[#0a0a0a] border-l border-gray-800-50 shadow-2xl z-50 overflow-y-auto max-h-screen">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Hyperbrowser Setup</h2>
              <p className="text-gray-400 text-sm mt-1">Configure your API key to get started</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* API Key Section */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              Hyperbrowser API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="Enter your API key..."
                className="w-full px-4 py-3 pr-12 bg-gray-900-50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 font-mono text-sm"
              />
              <button
                type="button"
                onClick={toggleShowApiKey}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-800 rounded transition-colors"
                title={showApiKey ? "Hide API key" : "Show API key"}
              >
                {showApiKey ? (
                  <svg className="w-4 h-4 text-gray-500 hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-500 hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-white-5 hover:bg-white-10 border border-gray-700 hover:border-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02]"
              >
                Save API Key
              </button>
              {apiKey && (
                <button
                  onClick={handleClear}
                  className="px-4 py-3 bg-red-900-20 hover:bg-red-900-30 border border-red-800 hover:border-red-700 text-red-400 hover:text-red-300 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02]"
                  title="Clear saved API key"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
            
            <p className="mt-3 text-xs text-gray-500 leading-relaxed">
              Your API key is automatically saved and stored locally in your browser. It persists across sessions and is only used to authenticate with Hyperbrowser services.
            </p>
          </div>

          {/* Get API Key Button */}
          <div className="mb-10">
            <a
              href="https://www.hyperbrowser.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#FFFD39] text-black px-6 py-4 rounded-xl font-semibold hover:bg-yellow-300 transition-all duration-200 hover:scale-[1.02] shadow-lg"
            >
              Get Free API Key
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* About Section */}
          <div className="mb-8 p-6 bg-gray-900-30 border border-gray-800 rounded-2xl">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              About Hyperbrowser
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              Hyperbrowser provides cloud-based browsers for AI agents and automation. 
              This app uses Hyperbrowser to extract information from portfolio websites 
              and match them with relevant job opportunities.
            </p>
            <div className="grid grid-cols-1 gap-2">
              {[
                'Lightning-fast browser automation',
                'AI-powered data extraction',
                'Advanced anti-detection features',
                'Scalable cloud infrastructure'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-xs text-gray-400">
                  <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8 p-6 bg-gray-800-50 border border-gray-700 rounded-2xl">
            <h3 className="font-bold text-gray-200 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How to use
            </h3>
            <div className="space-y-3">
              {[
                'Get your API key from Hyperbrowser',
                'Enter it in the field above',
                'Enter a portfolio/resume URL',
                'Click "Analyze & Find Jobs" to get matches'
              ].map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center text-xs font-semibold text-gray-300">
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-300 leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Current Status */}
          {apiKey && (
            <div className="p-4 bg-white-5 border border-gray-600 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">API Key Configured</div>
                  <div className="text-xs text-gray-400">Ready to extract profiles and find jobs</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 