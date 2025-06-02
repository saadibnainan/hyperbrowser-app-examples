'use client';

import { useState } from 'react';
import { Search, Globe, AlertCircle, Zap } from 'lucide-react';
import { useDocumentation } from '@/contexts/DocumentationContext';

export function UrlInput() {
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState(50);
  const { crawlDocumentation, isLoading, error, apiKey } = useDocumentation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    // Normalize the URL by adding https:// if no protocol is specified
    let normalizedUrl = url.trim();
    if (!normalizedUrl.match(/^https?:\/\//)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    
    try {
      new URL(normalizedUrl); // Validate the normalized URL
      await crawlDocumentation(normalizedUrl, maxPages);
    } catch (error) {
      console.error('Invalid URL:', error);
      // The API will handle URL validation and provide proper error messages
      await crawlDocumentation(normalizedUrl, maxPages);
    }
  };

  const popularDocs = [
    { name: 'Next.js', url: 'nextjs.org' },
    { name: 'React', url: 'react.dev' },
    { name: 'Vercel AI SDK', url: 'sdk.vercel.ai' },
    { name: 'Tailwind CSS', url: 'tailwindcss.com' },
    { name: 'Hyperbrowser', url: 'hyperbrowser.ai' },
    { name: 'Stripe', url: 'stripe.com' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center space-x-3 mb-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Documentation Buddy
          </h1>
        </div>
        <p className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
          AI-powered documentation assistant for any website. 
          <span className="text-green-300 font-medium"> Crawl, learn, and chat</span> with documentation in seconds.
        </p>
      </div>

      {/* Main Form */}
      <div className="bg-black/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="url" className="block text-sm font-medium text-gray-300">
                Documentation URL
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter any documentation URL..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-900/80 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 text-white placeholder-gray-500 text-lg transition-all duration-200"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label htmlFor="maxPages" className="block text-sm font-medium text-gray-300 mb-2">
                  Pages to Crawl
                </label>
                <select
                  id="maxPages"
                  value={maxPages}
                  onChange={(e) => setMaxPages(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 text-white transition-all duration-200"
                  disabled={isLoading}
                >
                  <option value={25} className="bg-gray-900 text-white">25 pages</option>
                  <option value={50} className="bg-gray-900 text-white">50 pages</option>
                  <option value={100} className="bg-gray-900 text-white">100 pages</option>
                  <option value={200} className="bg-gray-900 text-white">200 pages</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading || !url.trim() || !apiKey}
                className="px-8 py-3 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl hover:from-green-500 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-green-500/20 flex items-center space-x-2 mt-7"
              >
                <Search className="h-5 w-5" />
                <span className="hidden sm:inline">
                  {isLoading ? 'Crawling...' : 'Start Crawling'}
                </span>
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 flex items-start space-x-3 p-4 bg-red-900/30 border border-red-500/30 rounded-xl text-red-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error occurred</p>
                <p className="text-sm text-red-300 mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Popular Sites */}
        <div className="border-t border-gray-800/50 bg-gray-900/30 px-8 py-6">
          <p className="text-sm font-medium text-gray-400 mb-4">Try popular documentation sites:</p>
          <div className="flex flex-wrap gap-3">
            {popularDocs.map((doc) => (
              <button
                key={doc.name}
                onClick={() => setUrl(doc.url)}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-gray-800/60 hover:bg-gray-700/60 text-gray-200 rounded-lg transition-all duration-200 disabled:opacity-50 border border-gray-700/50 hover:border-gray-600/50"
              >
                {doc.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-xl bg-black/40 border border-gray-800/30">
          <div className="text-green-400 text-2xl mb-2">⚡</div>
          <p className="text-sm text-gray-300 font-medium">Lightning Fast</p>
          <p className="text-xs text-gray-500 mt-1">Sub-second processing</p>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-gray-800/30">
          <div className="text-green-400 text-2xl mb-2">🤖</div>
          <p className="text-sm text-gray-300 font-medium">AI-Powered</p>
          <p className="text-xs text-gray-500 mt-1">Smart content extraction</p>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-gray-800/30">
          <div className="text-green-400 text-2xl mb-2">🔒</div>
          <p className="text-sm text-gray-300 font-medium">Secure</p>
          <p className="text-xs text-gray-500 mt-1">Privacy-first approach</p>
        </div>
      </div>
    </div>
  );
} 