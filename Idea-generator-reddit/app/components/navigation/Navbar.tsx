import React from 'react';

interface NavbarProps {
  apiKey: string;
  onOpenSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ apiKey, onOpenSidebar }) => {
  return (
    <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">H</span>
        </div>
        <span className="text-xl font-semibold">Reddit Idea Generator</span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-400">Powered by Hyperbrowser</span>
        <button
          onClick={onOpenSidebar}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            apiKey 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
          }`}
        >
          {apiKey ? '🔑 API Connected' : '🔑 Setup API Key'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 