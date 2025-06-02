'use client';

import { Loader2, Globe, Search, Zap } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-black/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-12 text-center space-y-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-white animate-spin" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse flex items-center justify-center">
                <Zap className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Crawling Documentation</h2>
            <p className="text-lg text-gray-300 max-w-lg mx-auto">
              Analyzing pages and extracting content from the documentation site...
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-3 text-gray-400">
            <Search className="h-5 w-5 text-green-400" />
            <span className="font-medium">This usually takes 30-60 seconds</span>
          </div>
        </div>
        
        {/* Progress Section */}
        <div className="border-t border-gray-800/50 bg-gray-900/30 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-green-400 font-medium">Processing...</span>
            </div>
            
            {/* Animated progress bar */}
            <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-6">
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Discovering pages</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span>Extracting content</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <span>Processing data</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 