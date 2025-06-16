'use client';

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import JobMatcher from './components/JobMatcher';
import JobSourcesSidebar from './components/JobSourcesSidebar';

interface JobSource {
  name: string;
  url: string;
  searchParam: string;
  enabled: boolean;
}

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sourcesSidebarOpen, setSourcesSidebarOpen] = useState(false);
  const [jobSources, setJobSources] = useState<JobSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('hyperbrowser-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    setIsLoading(false);
  }, []);

  // Save API key to localStorage whenever it changes
  const handleSetApiKey = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('hyperbrowser-api-key', key);
    } else {
      localStorage.removeItem('hyperbrowser-api-key');
    }
  };

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <header className="glass-card fixed top-0 left-0 right-0 z-30 border-b border-gray-800-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-[#FFFD39] tracking-tight">
              Hyperbrowser Job Matcher
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSourcesSidebarOpen(true)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Manage Sources
              </button>
              <a 
                href="https://github.com/your-repo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                See the code
              </a>
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 btn-primary px-4 py-2 rounded-xl font-semibold text-sm text-black"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Setup API Key
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-[#FFFD39] rounded-full animate-spin"></div>
          </div>
        ) : (
          <JobMatcher apiKey={apiKey} jobSources={jobSources} />
        )}
      </main>

      {/* Sidebars */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        apiKey={apiKey}
        setApiKey={handleSetApiKey}
      />
      <JobSourcesSidebar
        isOpen={sourcesSidebarOpen}
        onClose={() => setSourcesSidebarOpen(false)}
        onSourcesChange={setJobSources}
      />
    </div>
  );
}
