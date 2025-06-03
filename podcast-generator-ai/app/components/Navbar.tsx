import React from 'react';
import { Headphones } from 'lucide-react';

interface NavbarProps {
  apiKey: string;
  onOpenSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ apiKey, onOpenSidebar }) => {
  return (
    <nav className="relative z-20 flex items-center justify-between p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
          <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <span className="text-lg sm:text-xl font-semibold text-gray-200 drop-shadow-lg">
          AI Podcast Generator
        </span>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <span className="hidden sm:block text-xs sm:text-sm text-gray-400">
          Powered by Hyperbrowser
        </span>
        <button
          onClick={onOpenSidebar}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 backdrop-blur-sm ${
            apiKey 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30 shadow-lg hover:shadow-green-500/25' 
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/50'
          }`}
        >
          <span className="flex items-center gap-1 sm:gap-2">
            <span>🔑</span>
            <span className="hidden sm:inline">
              {apiKey ? 'API Connected' : 'Setup API Key'}
            </span>
            <span className="sm:hidden">
              {apiKey ? 'Connected' : 'Setup'}
            </span>
          </span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 