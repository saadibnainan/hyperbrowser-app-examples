'use client';

import { useState, useEffect } from 'react';

interface JobSource {
  name: string;
  url: string;
  searchParam: string;
  enabled: boolean;
}

interface JobSourcesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSourcesChange: (sources: JobSource[]) => void;
}

export default function JobSourcesSidebar({ isOpen, onClose, onSourcesChange }: JobSourcesSidebarProps) {
  const [sources, setSources] = useState<JobSource[]>([
    {
      name: 'YC Work at a Startup',
      url: 'https://www.workatastartup.com/job_list',
      searchParam: 'search',
      enabled: true
    },
    {
      name: 'AngelList/Wellfound',
      url: 'https://wellfound.com/jobs',
      searchParam: 'q',
      enabled: true
    },
    {
      name: 'RemoteOK',
      url: 'https://remoteok.io',
      searchParam: 'q',
      enabled: true
    },
    {
      name: 'Indeed',
      url: 'https://www.indeed.com/jobs',
      searchParam: 'q',
      enabled: true
    }
  ]);

  const [newSource, setNewSource] = useState<JobSource>({
    name: '',
    url: '',
    searchParam: '',
    enabled: true
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleAddSource = () => {
    if (newSource.name && newSource.url) {
      setSources([...sources, newSource]);
      setNewSource({
        name: '',
        url: '',
        searchParam: '',
        enabled: true
      });
      onSourcesChange([...sources, newSource]);
    }
  };

  const handleToggleSource = (index: number) => {
    const updatedSources = sources.map((source, i) => 
      i === index ? { ...source, enabled: !source.enabled } : source
    );
    setSources(updatedSources);
    onSourcesChange(updatedSources);
  };

  const handleRemoveSource = (index: number) => {
    const updatedSources = sources.filter((_, i) => i !== index);
    setSources(updatedSources);
    onSourcesChange(updatedSources);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black-60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-[400px] bg-[#0a0a0a] border-r border-gray-800-50 shadow-2xl z-50 overflow-y-auto max-h-screen">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-medium text-white tracking-tight">Job Sources</h2>
              <p className="text-gray-400 text-sm mt-1">Manage your job search sources</p>
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

          {/* Add New Source */}
          <div className="mb-6 p-4 bg-gray-900-30 border border-gray-800 rounded-xl">
            <h3 className="font-medium text-white mb-3">Add New Source</h3>
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  className="w-full modern-input px-3 py-2 rounded-lg text-white text-sm"
                  placeholder="Source name"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newSource.url}
                  onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                  className="w-full modern-input px-3 py-2 rounded-lg text-white text-sm"
                  placeholder="Base URL"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newSource.searchParam}
                  onChange={(e) => setNewSource({ ...newSource, searchParam: e.target.value })}
                  className="w-full modern-input px-3 py-2 rounded-lg text-white text-sm"
                  placeholder="Search parameter"
                />
              </div>
              <button
                onClick={handleAddSource}
                className="w-full btn-primary px-4 py-2 rounded-lg font-medium text-sm text-black"
              >
                Add Source
              </button>
            </div>
          </div>

          {/* Existing Sources */}
          <div className="space-y-3">
            <h3 className="font-medium text-white mb-3">Active Sources</h3>
            {sources.map((source, index) => (
              <div 
                key={index}
                className="p-3 bg-white-5 border border-gray-600 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={source.enabled}
                      onChange={() => handleToggleSource(index)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-[#FFFD39] focus:ring-[#FFFD39]"
                    />
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{source.name}</div>
                    <div className="text-xs text-gray-400">{source.url}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveSource(index)}
                  className="p-1.5 hover:bg-red-500-10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 