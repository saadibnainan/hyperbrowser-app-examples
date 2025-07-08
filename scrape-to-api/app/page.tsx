'use client';

import React, { useState } from 'react';
import { Download, ExternalLink, Copy, Trash2, Play, Zap, ChevronDown } from 'lucide-react';
import PreviewFrame from './components/PreviewFrame';
import Console from './components/Console';
import { cleanHtmlForPreview, validateSelector } from '../lib/client-utils';

interface SelectorConfig {
  id: string;
  selector: string;
  name: string;
  attribute?: string;
  multiple?: boolean;
}

interface GenerateResult {
  slug: string;
  endpointUrl: string;
  sampleData: any;
  downloadUrl: string;
  refreshUrl?: string;
  files: {
    openapi: string;
    sdk: string;
    postman: string;
  };
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [html, setHtml] = useState('');
  const [selectors, setSelectors] = useState<SelectorConfig[]>([]);
  const [consoleMessages, setConsoleMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [isSelectorsExpanded, setIsSelectorsExpanded] = useState(true);

  const addMessage = (message: string) => {
    setConsoleMessages(prev => [...prev, message]);
  };

  const handleLoad = async () => {
    if (!url) {
      addMessage('❌ Please enter a URL');
      return;
    }

    setIsLoading(true);
    setHtml('');
    setSelectors([]);
    setResult(null);
    addMessage('🚀 Starting page load...');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          selectors: [], // Empty for initial load
          mode: 'preview'
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to load page: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let htmlChunks: string[] = [];
      let expectedChunks = 0;
      let receivedChunks = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'progress') {
                addMessage(data.message);
              } 
              else if (data.type === 'html_start') {
                expectedChunks = data.totalChunks;
                htmlChunks = new Array(expectedChunks);
                addMessage(`📥 Receiving page content (0/${expectedChunks} chunks)...`);
              }
              else if (data.type === 'html_chunk') {
                htmlChunks[data.chunkIndex] = data.chunk;
                receivedChunks++;
                
                if (receivedChunks % 5 === 0 || receivedChunks === expectedChunks) {
                  addMessage(`📥 Receiving page content (${receivedChunks}/${expectedChunks} chunks)...`);
                }
              }
              else if (data.type === 'html_end') {
                const fullHtml = htmlChunks.join('');
                setHtml(cleanHtmlForPreview(fullHtml));
                addMessage('✅ Page loaded successfully - click elements to select them');
              }
              else if (data.type === 'error') {
                addMessage(`❌ Error: ${data.error}`);
              }
            } catch (e) {
              console.error('Parse error:', e, 'Line:', line);
            }
          }
        }
      }
    } catch (error) {
      addMessage(`❌ Error loading page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleElementSelect = (selector: string, suggestedName: string) => {
    // Check if selector already exists
    const exists = selectors.some(s => s.selector === selector);
    if (exists) {
      addMessage(`⚠️ Selector already selected: ${selector}`);
      return;
    }

    // Validate selector
    const validation = validateSelector(selector, html);
    if (!validation.valid) {
      addMessage(`❌ Invalid selector: ${selector}`);
      return;
    }

    const newSelector: SelectorConfig = {
      id: Date.now().toString(),
      selector,
      name: suggestedName,
      attribute: 'text',
      multiple: false
    };

    setSelectors(prev => [...prev, newSelector]);
    addMessage(`✅ Selected: ${selector} (${validation.count} element${validation.count !== 1 ? 's' : ''})`);
  };

  const removeSelector = (id: string) => {
    setSelectors(prev => prev.filter(s => s.id !== id));
    addMessage('🗑️ Selector removed');
  };

  const updateSelector = (id: string, field: keyof SelectorConfig, value: any) => {
    setSelectors(prev => prev.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const handleGenerateAPI = async () => {
    if (!url || selectors.length === 0) {
      addMessage('❌ Please enter URL and select at least one element');
      return;
    }

    setIsGenerating(true);
    setResult(null);
    addMessage('🔧 Starting API generation...');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          selectors,
          refreshRate: 3600 // 1 hour
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate API');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'progress') {
                addMessage(data.message);
              } else if (data.type === 'success') {
                // For preview mode, just set HTML
                if (data.html) {
                  setHtml(cleanHtmlForPreview(data.html));
                  addMessage('✅ Page loaded successfully - click elements to select them');
                } else {
                  // For full generation mode, set result
                  setResult(data.data);
                  addMessage('✅ API generated successfully!');
                }
              } else if (data.type === 'error') {
                addMessage(`❌ Error: ${data.error}`);
              }
            } catch (e) {
              // Ignore JSON parse errors
            }
          }
        }
      }
    } catch (error) {
      addMessage(`❌ Error generating API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addMessage('📋 Copied to clipboard');
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="glass-card border-b border-gray-600">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <h1 className="text-2xl font-bold">Scrape2API</h1>
            </div>
            <div className="text-sm text-gray-400">
              Turn any web page into a REST API
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Hero Card - Configuration */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="glass-card rounded-lg p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Target URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-lg"
                  placeholder="https://example.com"
                />
              </div>

              <button
                onClick={handleLoad}
                disabled={isLoading || !url}
                className="w-full bg-accent text-black font-semibold py-4 px-6 rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner w-5 h-5"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Load Page
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Console and Preview */}
        {html && (
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mb-8">
            {/* Left Panel - Console (30%) */}
            <div className="lg:col-span-3">
              <div className="glass-card rounded-lg p-6">
                <Console messages={consoleMessages} isActive={isLoading || isGenerating} />
              </div>
            </div>

            {/* Right Panel - Preview (70%) */}
            <div className="lg:col-span-7">
              <div className="glass-card rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Page Preview</h2>
                <div className="h-96 lg:h-[600px] relative">
                  <PreviewFrame
                    html={html}
                    onElementSelect={handleElementSelect}
                    selectedSelectors={selectors.map(s => s.selector)}
                  />
                  
                  {/* Floating selector chips */}
                  {selectors.length > 0 && (
                    <div className="absolute top-4 right-4 space-y-3 max-w-sm w-full">
                      <div className="bg-black/40 backdrop-blur-md rounded-lg border border-accent/20">
                        <div 
                          className="text-xs text-accent p-3 font-medium flex items-center justify-between cursor-pointer hover:bg-black/20 transition-colors duration-200"
                          onClick={() => setIsSelectorsExpanded(!isSelectorsExpanded)}
                        >
                          <div className="flex items-center gap-2">
                            <Zap className="w-3 h-3" />
                            {selectors.length} element{selectors.length !== 1 ? 's' : ''} selected
                          </div>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSelectorsExpanded ? 'rotate-180' : ''}`} />
                        </div>
                        {isSelectorsExpanded && (
                          <div className="p-3 pt-0 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {selectors.map((selector) => (
                              <div 
                                key={selector.id} 
                                className="bg-black/60 rounded-lg p-2 border border-gray-700/50 group hover:border-accent/30 transition-all duration-200"
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <input
                                    type="text"
                                    value={selector.name}
                                    onChange={(e) => updateSelector(selector.id, 'name', e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm font-medium flex-1 min-w-0 text-white/90 placeholder-white/40"
                                    placeholder="Enter name..."
                                  />
                                  <button
                                    onClick={() => removeSelector(selector.id)}
                                    className="text-red-400/70 hover:text-red-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="text-xs font-mono text-gray-400/70 mb-1.5 truncate px-1">
                                  {selector.selector}
                                </div>
                                <div className="flex gap-2 items-center">
                                  <select
                                    value={selector.attribute}
                                    onChange={(e) => updateSelector(selector.id, 'attribute', e.target.value)}
                                    className="text-xs bg-black/50 border border-gray-700/50 rounded px-2 py-1 text-white/80 outline-none focus:border-accent/50 transition-colors duration-200"
                                  >
                                    <option value="text">Text</option>
                                    <option value="href">Link</option>
                                    <option value="src">Image</option>
                                    <option value="html">HTML</option>
                                  </select>
                                  <label className="flex items-center gap-1.5 text-xs text-white/70">
                                    <input
                                      type="checkbox"
                                      checked={selector.multiple}
                                      onChange={(e) => updateSelector(selector.id, 'multiple', e.target.checked)}
                                      className="w-3 h-3 rounded border-gray-600 text-accent focus:ring-accent/30 bg-black/50"
                                    />
                                    Multiple
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Click on elements in the preview to select them for data extraction
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generate API Button - Centered */}
        {selectors.length > 0 && (
          <div className="max-w-md mx-auto mb-8">
            <button
              onClick={handleGenerateAPI}
              disabled={isGenerating}
              className="w-full bg-accent hover:bg-accent/90 text-black font-semibold py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-[0_0_15px_rgba(240,255,38,0.3)]"
            >
              {isGenerating ? (
                <>
                  <div className="loading-spinner w-5 h-5"></div>
                  Generating API...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate API
                </>
              )}
            </button>
          </div>
        )}

        {/* Results - Output Drawer */}
        {result && (
          <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">API Generated Successfully! 🎉</h2>
              
              <div className="space-y-4">
                {/* Live Endpoint */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">✓ Endpoint URL</h3>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-900 px-3 py-2 rounded text-accent font-mono text-sm">
                      {result.endpointUrl}
                    </code>
                    <button
                      onClick={() => copyToClipboard(result.endpointUrl)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => window.open(result.endpointUrl, '_blank')}
                      className="p-2 bg-accent text-black hover:bg-accent/90 rounded"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Downloads */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Download Files</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <button
                      onClick={() => downloadFile(result.files.openapi, 'openapi.yaml')}
                      className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded"
                    >
                      <Download className="w-4 h-4" />
                      ✓ openapi.yaml
                    </button>
                    <button
                      onClick={() => downloadFile(result.files.sdk, 'sdk.ts')}
                      className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded"
                    >
                      <Download className="w-4 h-4" />
                      ✓ sdk.ts
                    </button>
                    <button
                      onClick={() => downloadFile(result.files.postman, 'postman.json')}
                      className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded"
                    >
                      <Download className="w-4 h-4" />
                      ✓ postman.json
                    </button>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = result.downloadUrl;
                        link.download = `${result.slug}-api.zip`;
                        link.click();
                      }}
                      className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded"
                    >
                      <Download className="w-4 h-4" />
                      Complete Bundle
                    </button>
                  </div>
                </div>

                {/* Sample Data */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Sample Data</h3>
                  <pre className="bg-gray-900 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(result.sampleData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="glass-card border-t border-gray-600 mt-12">
        <div className="container mx-auto px-6 py-4">
          <div className="text-center text-sm text-gray-400">
            Powered by{' '}
            <a href="https://hyperbrowser.ai" target="_blank" className="text-accent hover:underline">
              Hyperbrowser
            </a>
            {' '}— get your API key at hyperbrowser.ai
          </div>
        </div>
      </div>
    </div>
  );
}
