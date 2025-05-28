import React from 'react';

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
      <div className={`fixed top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-sm border-l border-gray-700 transform transition-transform duration-300 z-50 ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-green-300">API Configuration</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hyperbrowser API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="Enter your API key..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-2">
                Your API key is stored locally and never saved on our servers.
              </p>
            </div>
            
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-300 mb-2">🔑 How to get your API key:</h4>
              <ol className="text-xs text-gray-300 space-y-1">
                <li>1. Visit <a href="https://hyperbrowser.ai" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">hyperbrowser.ai</a></li>
                <li>2. Sign up for a free account</li>
                <li>3. Go to your dashboard</li>
                <li>4. Copy your API key</li>
                <li>5. Paste it here to start generating ideas!</li>
              </ol>
            </div>
            
            {apiKey && (
              <div className="bg-green-900/20 p-3 rounded-lg border border-green-500/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-300">API Key Connected</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Sidebar Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default Sidebar; 