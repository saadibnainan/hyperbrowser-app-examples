'use client';

import { Github, Key } from 'lucide-react';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <Image 
                src="/Logo.svg" 
                alt="Site-to-Dataset Logo" 
                width={32} 
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-black">
                Site-to-Dataset
              </h1>
              <p className="text-xs text-gray-500 -mt-0.5">LLM Training Data Generator</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <a 
              href="https://github.com/hyperbrowserai/hyperbrowser-app-examples" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-black transition-colors font-medium"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">Open Source</span>
            </a>
            <a 
              href="https://hyperbrowser.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-black transition-colors font-medium"
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">Get Hyperbrowser API Keys</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
} 