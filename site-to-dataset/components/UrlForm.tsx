'use client';

import { useState } from 'react';
import { Globe, ArrowRight } from 'lucide-react';

interface UrlFormProps {
  onSubmit: (url: string) => void;
  isProcessing: boolean;
}

export default function UrlForm({ onSubmit, isProcessing }: UrlFormProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (input: string) => {
    try {
      new URL(input);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a URL');
      return;
    }
    
    if (!validateUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }
    
    setError('');
    onSubmit(url);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://blog.example.com"
            className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors bg-white"
            disabled={isProcessing}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isProcessing || !url}
          className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <div className="spinner" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Generate Dataset</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {!isProcessing && (
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Example: <span className="font-medium">https://docs.anthropic.com</span> or <span className="font-medium">https://platform.openai.com/docs</span>
            </p>
          </div>
        )}
      </form>
    </div>
  );
} 