import React from 'react';
import { X } from 'lucide-react';

interface SidebarProps {
  showSidebar: boolean;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  showSidebar, 
  apiKey, 
  onApiKeyChange, 
  onClose 
}) => {
  return (
    <>
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-gray-900/95 backdrop-blur-md border-l border-gray-700/50 transform transition-transform duration-300 z-50 ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 sm:p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-green-300">API Configuration</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700/50 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hyperbrowser API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="Enter your Hyperbrowser API key..."
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur transition-all"
              />
              <p className="text-xs text-gray-400 mt-2">
                Required for content extraction from websites.
              </p>
            </div>
            
            <div className="bg-gray-800/50 p-4 rounded-lg backdrop-blur">
              <h4 className="text-sm font-medium text-green-300 mb-3">🔑 How to get your API key:</h4>
              
              <div className="text-xs text-gray-300">
                <h5 className="text-green-400 font-medium mb-2">Hyperbrowser:</h5>
                <ol className="space-y-1 pl-3">
                  <li>1. Visit <a href="https://hyperbrowser.ai" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">hyperbrowser.ai</a></li>
                  <li>2. Sign up for a free account</li>
                  <li>3. Go to your dashboard</li>
                  <li>4. Copy your API key</li>
                  <li>5. Paste it here to start generating podcasts!</li>
                </ol>
              </div>
            </div>
            
            {apiKey && (
              <div className="bg-green-900/20 p-3 rounded-lg border border-green-500/30 backdrop-blur">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-300">Hyperbrowser API Connected</span>
                </div>
              </div>
            )}

            <div className="bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/30 backdrop-blur">
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 text-sm">⚠️</span>
                <div className="text-xs text-yellow-300">
                  <p className="font-medium mb-1">Privacy Notice:</p>
                  <p>Your API key is stored locally in your browser and never sent to our servers. It's only used to make direct requests to the Hyperbrowser API.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sidebar Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default Sidebar; 