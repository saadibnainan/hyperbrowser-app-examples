'use client';

import React, { useEffect, useRef } from 'react';

interface ConsoleProps {
  messages: string[];
  isActive: boolean;
}

export default function Console({ messages, isActive }: ConsoleProps) {
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-300">Console</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-accent animate-pulse' : 'bg-gray-600'}`}></div>
          <span className="text-xs text-gray-400">
            {isActive ? 'Active' : 'Idle'}
          </span>
        </div>
      </div>
      
      <div 
        ref={consoleRef}
        className="terminal-bg rounded-lg p-3 h-32 overflow-y-auto scrollbar-hide font-mono text-sm"
      >
        {messages.length === 0 ? (
          <div className="text-gray-500 text-xs">
            Ready to scrape... Enter your API key and URL to get started.
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="terminal-text mb-1 text-xs">
              <span className="text-gray-500">
                {new Date().toLocaleTimeString()} 
              </span>
              {' '}
              {message}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 