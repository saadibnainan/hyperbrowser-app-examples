'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Bot, Sparkles, Loader2, ExternalLink, Mail, MessageSquare, Twitter, Globe, BarChart3, Microscope, Target, TrendingUp, X, ChevronDown, Check, Activity } from 'lucide-react';
import { CompanyWithSummary, SearchFilters, CompanyDeepResearch, BatchAnalysis } from '@/types/company';
import ScrapeProgress, { ProgressStep } from './components/ScrapeProgress';
import ChatInterface from './components/ChatInterface';

import Navbar, { SettingsModal } from './components/Navbar';

// Helper functions for batch generation
function generateBatchList(): string[] {
  const batches: string[] = [];
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11
  
  // Generate batches based on the actual YC history shown in the real batch list
  for (let year = currentYear; year >= 2005; year--) {
    const yearBatches = [];
    
    if (year === currentYear) {
      // For current year (2025), include all batches that should exist
      // Winter 2025 starts in January, Spring in March, Summer in June
      yearBatches.push(`Winter ${year}`); // Winter always exists at start of year
      if (currentMonth >= 2) { // March or later
        yearBatches.push(`Spring ${year}`);
      }
      if (currentMonth >= 5) { // June or later
        yearBatches.push(`Summer ${year}`);
      }
    } else if (year === 2024) {
      // 2024: Special case - only year with Fall batch
      yearBatches.push(`Spring ${year}`);
      yearBatches.push(`Summer ${year}`);
      yearBatches.push(`Fall ${year}`);
      yearBatches.push(`Winter ${year}`);
    } else if (year >= 2017) {
      // 2017-2023: Spring batches start here
      yearBatches.push(`Spring ${year}`);
      yearBatches.push(`Summer ${year}`);
      yearBatches.push(`Winter ${year}`);
    } else {
      // 2005-2016: Only Summer and Winter batches
      yearBatches.push(`Summer ${year}`);
      yearBatches.push(`Winter ${year}`);
    }
    
    batches.push(...yearBatches);
  }
  
  return batches;
}

function generateBatchesByYear(): { year: string; batches: string[] }[] {
  const allBatches = generateBatchList();
  const batchesByYear: { [key: string]: string[] } = {};
  
  allBatches.forEach(batch => {
    const year = batch.split(' ')[1];
    if (!batchesByYear[year]) {
      batchesByYear[year] = [];
    }
    batchesByYear[year].push(batch);
  });
  
  // Convert to array and sort by year (newest first)
  return Object.entries(batchesByYear)
    .map(([year, batches]) => ({ year, batches }))
    .sort((a, b) => parseInt(b.year) - parseInt(a.year));
}

// Batch Dropdown Component
function BatchDropdown({ selectedBatches, onChange }: { 
  selectedBatches: string[]; 
  onChange: (batches: string[]) => void; 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleBatch = (batch: string) => {
    if (selectedBatches.includes(batch)) {
      onChange(selectedBatches.filter(b => b !== batch));
    } else {
      onChange([...selectedBatches, batch]);
    }
  };

  const quickSelect = (type: 'all' | 'clear' | 'recent') => {
    switch (type) {
      case 'all':
        onChange(generateBatchList());
        break;
      case 'clear':
        onChange([]);
        break;
      case 'recent':
        onChange(generateBatchList().slice(0, 8)); // Last 2 years
        break;
    }
  };

  const getDisplayText = () => {
    if (selectedBatches.length === 0) return 'Select batches...';
    if (selectedBatches.length === 1) return selectedBatches[0];
    if (selectedBatches.length <= 3) return selectedBatches.join(', ');
    return `${selectedBatches.slice(0, 2).join(', ')} + ${selectedBatches.length - 2} more`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-black mb-2">
        Select YC Batches
      </label>
      
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white text-left focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
      >
        <span className={selectedBatches.length === 0 ? 'text-gray-500' : 'text-black'}>
          {getDisplayText()}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Quick Actions */}
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="flex gap-2">
              <button
                onClick={() => quickSelect('recent')}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Recent
              </button>
              <button
                onClick={() => quickSelect('all')}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                All
              </button>
              <button
                onClick={() => quickSelect('clear')}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Batch List */}
          <div className="max-h-64 overflow-y-auto">
            {generateBatchesByYear().map(({ year, batches }) => (
              <div key={year}>
                <div className="px-4 py-3 bg-black border-b border-gray-200 sticky top-0 z-10">
                  <h4 className="text-sm font-semibold text-white">
                    {year}
                  </h4>
                </div>
                {batches.map((batch) => {
                  const isSelected = selectedBatches.includes(batch);
                  return (
                    <button
                      key={batch}
                      onClick={() => toggleBatch(batch)}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className={isSelected ? 'text-black font-medium' : 'text-gray-700'}>
                        {batch.replace(year, '').trim()}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-green-600" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [filters, setFilters] = useState<SearchFilters>({
    batch: '',
    keyword: '',
  });
  const [companies, setCompanies] = useState<CompanyWithSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [showProgress, setShowProgress] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [selectedCompanyDeepResearch, setSelectedCompanyDeepResearch] = useState<CompanyDeepResearch | null>(null);
  const [batchAnalysis, setBatchAnalysis] = useState<BatchAnalysis | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Check for API key on mount
  useEffect(() => {
    const apiKey = localStorage.getItem('hyperbrowser_api_key');
    if (!apiKey) {
      setShowSettings(true);
    }
  }, []);

  // Scroll lock when modals are open
  useEffect(() => {
    const isModalOpen = showChat || showSettings || selectedCompanyDeepResearch || batchAnalysis;
    
    if (isModalOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
      }, [showChat, showSettings, selectedCompanyDeepResearch, batchAnalysis]);

  // Filter companies based on search query
  const filteredCompanies = companies.filter(company => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();
    const searchFields = [
      company.name,
      company.description,
      company.batch,
      company.website || '',
      company.aiSummary || ''
    ].join(' ').toLowerCase();

    // Handle multiple search terms (AND logic)
    const searchTerms = query.split(' ').filter(term => term.length > 0);
    return searchTerms.every(term => searchFields.includes(term));
  });

  const handleSearch = async () => {
    const hasBatch = filters.batch && (Array.isArray(filters.batch) ? filters.batch.length > 0 : filters.batch.trim() !== '');
    if (!hasBatch && !filters.keyword) {
      alert('Please select a batch or enter a keyword to search');
      return;
    }

    // Check for API key
    const apiKey = localStorage.getItem('hyperbrowser_api_key');
    if (!apiKey) {
      alert('Please configure your Hyperbrowser API key in settings');
      setShowSettings(true);
      return;
    }

    setLoading(true);
    setShowProgress(true);

    // Initialize progress steps
    const initialSteps: ProgressStep[] = [
      {
        id: 'init',
        title: 'Initializing Scraper',
        description: 'Setting up Hyperbrowser SDK...',
        status: 'running',
        details: 'Connecting to scraping service'
      },
      {
        id: 'navigate',
        title: 'Opening YC Companies Page',
        description: 'Navigating to ycombinator.com/companies...',
        status: 'pending'
      },
      {
        id: 'scrape',
        title: 'Extracting Company Data',
        description: 'Using AI to extract structured startup data...',
        status: 'pending'
      },
      {
        id: 'filter',
        title: 'Applying Filters',
        description: `Filtering by batch: ${Array.isArray(filters.batch)
            ? filters.batch.join(', ')
            : filters.batch || 'All'
          }, keyword: ${filters.keyword || 'None'}`,
        status: 'pending'
      },
      {
        id: 'complete',
        title: 'Processing Complete',
        description: 'Companies ready for analysis!',
        status: 'pending'
      }
    ];

    setProgressSteps(initialSteps);

    // Simulate progress updates
    const updateStep = (stepId: string, status: ProgressStep['status'], details?: string) => {
      setProgressSteps(prev => prev.map(step =>
        step.id === stepId
          ? { ...step, status, ...(details && { details }) }
          : step.id === stepId && status === 'running'
            ? { ...step, status: 'completed' }
            : step
      ));
    };

    try {
      // Step 1: Initialize
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStep('init', 'completed');

      // Build URL for progress display
      let displayUrl = 'https://www.ycombinator.com/companies';
      const urlParams = new URLSearchParams();

      if (filters.batch && filters.batch !== 'all') {
        const batches = Array.isArray(filters.batch) ? filters.batch : [filters.batch];
        batches.forEach(batch => {
          if (batch && batch.trim()) {
            urlParams.append('batch', batch);
          }
        });
      }

      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        if (keyword.includes('fintech') || keyword.includes('finance')) {
          urlParams.append('industry', 'Fintech');
        } else if (keyword.includes('health') || keyword.includes('medical') || keyword.includes('bio')) {
          urlParams.append('industry', 'Healthcare');
        } else if (keyword.includes('ai') || keyword.includes('artificial intelligence')) {
          urlParams.append('industry', 'AI');
        } else {
          urlParams.append('keyword', filters.keyword);
        }
      }

      if (urlParams.toString()) {
        displayUrl += '?' + urlParams.toString();
      }

      updateStep('navigate', 'running', displayUrl);

      // Step 2: Navigate
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStep('navigate', 'completed');
      updateStep('scrape', 'running', 'AI analyzing YC directory and extracting company data...');

      // Step 3: Actual API call
      const response = await fetch('/api/scrape-companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify(filters),
      });

      const data = await response.json();

      updateStep('scrape', 'completed');
      updateStep('filter', 'running', `Found ${data.companies?.length || 0} companies`);

      await new Promise(resolve => setTimeout(resolve, 800));
      updateStep('filter', 'completed');
      updateStep('complete', 'running', `${data.companies?.length || 0} companies ready`);

      if (data.success) {
        setCompanies(data.companies);

        // Store companies in localStorage for chat functionality
        localStorage.setItem('scrapedCompanies', JSON.stringify(data.companies));

        await new Promise(resolve => setTimeout(resolve, 500));
        updateStep('complete', 'completed');

        // Hide progress after 2 seconds
        setTimeout(() => {
          setShowProgress(false);
        }, 2000);
      } else {
        updateStep('complete', 'error');
        alert('Failed to scrape companies: ' + data.error);
        setTimeout(() => setShowProgress(false), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      // Mark current running step as error
      setProgressSteps(prev => prev.map(step =>
        step.status === 'running' ? { ...step, status: 'error' } : step
      ));
      alert('Failed to scrape companies');
      setTimeout(() => setShowProgress(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async (company: CompanyWithSummary, index: number) => {
    setActionLoading({ ...actionLoading, [`summary-${index}`]: true });
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company }),
      });

      const data = await response.json();
      if (data.success) {
        const updatedCompanies = [...companies];
        updatedCompanies[index] = { ...company, aiSummary: data.aiSummary };
        setCompanies(updatedCompanies);
      } else {
        alert('Failed to generate summary');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate summary');
    } finally {
      setActionLoading({ ...actionLoading, [`summary-${index}`]: false });
    }
  };



  const sendToSlack = async (company: CompanyWithSummary, index: number) => {
    setActionLoading({ ...actionLoading, [`slack-${index}`]: true });
    try {
      const response = await fetch('/api/send-to-slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company),
      });

      const data = await response.json();
      if (data.success) {
        alert('Sent to Slack successfully!');
      } else {
        alert('Failed to send to Slack');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send to Slack');
    } finally {
      setActionLoading({ ...actionLoading, [`slack-${index}`]: false });
    }
  };

  const generateTweet = async (company: CompanyWithSummary, index: number) => {
    setActionLoading({ ...actionLoading, [`tweet-${index}`]: true });
    try {
      const response = await fetch('/api/generate-tweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company }),
      });

      const data = await response.json();
      if (data.success) {
        const updatedCompanies = [...companies];
        updatedCompanies[index] = { ...company, tweet: data.tweet };
        setCompanies(updatedCompanies);
      } else {
        alert('Failed to generate tweet');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate tweet');
    } finally {
      setActionLoading({ ...actionLoading, [`tweet-${index}`]: false });
    }
  };

  const generateEmail = async (company: CompanyWithSummary, index: number) => {
    setActionLoading({ ...actionLoading, [`email-${index}`]: true });
    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company }),
      });

      const data = await response.json();
      if (data.success) {
        const updatedCompanies = [...companies];
        updatedCompanies[index] = { ...company, generatedEmail: data.email.body };
        setCompanies(updatedCompanies);
      } else {
        alert('Failed to generate email');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate email');
    } finally {
      setActionLoading({ ...actionLoading, [`email-${index}`]: false });
    }
  };

  const performDeepResearch = async (company: CompanyWithSummary, index: number) => {
    if (!company.website) {
      alert('No website available for deep research analysis');
      return;
    }

    const apiKey = localStorage.getItem('hyperbrowser_api_key');
    if (!apiKey) {
      alert('Please configure your Hyperbrowser API key in settings');
      setShowSettings(true);
      return;
    }

    setActionLoading({ ...actionLoading, [`deepresearch-${index}`]: true });

    try {
      const response = await fetch('/api/deep-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({ company }),
      });

      const data = await response.json();
      if (data.success) {
        // Store the deep research data in the company object instead of opening modal immediately
        const updatedCompanies = [...companies];
        updatedCompanies[index] = { ...company, deepResearch: data.company };
        setCompanies(updatedCompanies);
      } else {
        alert('Failed to perform deep research analysis: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to perform deep research analysis');
    } finally {
      setActionLoading({ ...actionLoading, [`deepresearch-${index}`]: false });
    }
  };

  const performBatchAnalysis = async () => {
    if (companies.length === 0) {
      alert('No companies available for batch analysis. Please research some companies first.');
      return;
    }

    setActionLoading({ ...actionLoading, 'batch-analysis': true });

    try {
      const response = await fetch('/api/analyze-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companies,
          batchName: Array.isArray(filters.batch) ? filters.batch.join(', ') : filters.batch || 'Mixed Batches'
        }),
      });

      const data = await response.json();
      if (data.success) {
        setBatchAnalysis(data.analysis);
      } else {
        alert('Failed to perform batch analysis: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to perform batch analysis');
    } finally {
      setActionLoading({ ...actionLoading, 'batch-analysis': false });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar onSettingsClick={() => setShowSettings(true)} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-black mb-4">
            Research YC Startups
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered analysis of Y Combinator companies. Extract data, generate insights, and automate research workflows.
          </p>

                    {/* Powered by Hyperbrowser */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-sm text-gray-500">Powered by</span>
            <a 
              href="https://hyperbrowser.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
            >
              <img
                src="/Yellow BG.png"
                alt="Hyperbrowser"
                className="h-6 w-auto rounded-full"
              />
            </a>
          </div>

          {/* Action Buttons */}
          {companies.length > 0 && (
            <div className="flex justify-center gap-3 mb-8">
              <button
                onClick={() => setShowChat(true)}
                className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Chat with Data
              </button>

              <button
                onClick={performBatchAnalysis}
                disabled={actionLoading['batch-analysis']}
                className="inline-flex items-center px-6 py-3 bg-white text-black border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all duration-300 gap-2"
              >
                {actionLoading['batch-analysis'] ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <BarChart3 className="w-4 h-4" />
                )}
                Batch Analysis
              </button>
            </div>
          )}
        </div>

        {/* Search Interface */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-12">
          <div className="space-y-8">
            {/* Batch Selection */}
            <BatchDropdown 
              selectedBatches={Array.isArray(filters.batch) ? filters.batch : filters.batch ? [filters.batch] : []}
              onChange={(batches) => setFilters({ ...filters, batch: batches })}
            />

            {/* Keyword Input */}
            <div>
              <label className="block text-sm font-semibold text-black mb-4">
                Filter by Industry or Keyword
              </label>
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black transition-all duration-300"
                placeholder="AI, fintech, healthcare, developer tools..."
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span className="font-semibold">Research Companies</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {companies.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">
                {searchQuery ? (
                  <>
                    {filteredCompanies.length} of {companies.length} Companies
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (filtered by "{searchQuery}")
                    </span>
                  </>
                ) : (
                  `${companies.length} Companies Found`
                )}
              </h2>
            </div>

            {/* Real-time Search */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search companies by name, description, batch, or keywords..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black transition-all duration-300"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {filteredCompanies.length === 0 && searchQuery ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No companies found</h3>
                <p className="text-gray-500 mb-4">
                  No companies match your search for "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCompanies.map((company, index) => (
                  <div key={company.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    {/* Company Header with Deep Research */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        {company.logo ? (
                          <img
                            src={company.logo.includes('bookface-images.s3.amazonaws.com')
                              ? `/api/proxy-image?url=${encodeURIComponent(company.logo)}`
                              : company.logo
                            }
                            alt={`${company.name} logo`}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                            onError={(e) => {
                              console.log(`Logo failed to load for ${company.name}:`, company.logo);
                              // Replace with fallback
                              const fallback = document.createElement('div');
                              fallback.className = 'w-12 h-12 rounded-lg bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-white font-bold text-sm flex-shrink-0 border border-gray-600';
                              fallback.textContent = company.name.charAt(0).toUpperCase();
                              e.currentTarget.parentNode?.replaceChild(fallback, e.currentTarget);
                            }}
                            onLoad={() => console.log(`✅ Logo loaded successfully for ${company.name}`)}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-white font-bold text-sm flex-shrink-0 border border-gray-600">
                            {company.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-black mb-1">
                            {company.name}
                          </h3>
                          <span className="inline-block px-2 py-1 bg-gray-100 text-black text-xs rounded-full border border-gray-200">
                            {company.batch}
                          </span>
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-2">
                        {/* Deep Research - Premium Action */}
                        {company.website && (
                          <>
                            {company.deepResearch ? (
                              <button
                                onClick={() => setSelectedCompanyDeepResearch(company.deepResearch!)}
                                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-all duration-300"
                              >
                                <Microscope className="w-4 h-4" />
                                View Deep Research
                              </button>
                            ) : (
                              <button
                                onClick={() => performDeepResearch(company, index)}
                                disabled={actionLoading[`deepresearch-${index}`]}
                                className="flex items-center gap-2 px-3 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all duration-300"
                              >
                                {actionLoading[`deepresearch-${index}`] ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Microscope className="w-4 h-4" />
                                )}
                                Deep Research
                              </button>
                            )}
                          </>
                        )}

                        {/* Website Link */}
                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-black transition-colors p-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {company.description}
                    </p>

                    {/* Quick Analysis Section */}
                    <div className="mb-4">
                      <button
                        onClick={() => generateSummary(company, index)}
                        disabled={actionLoading[`summary-${index}`]}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 border border-gray-200 text-black rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-all duration-300"
                      >
                        {actionLoading[`summary-${index}`] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                        <span className="font-medium">Generate AI Summary</span>
                      </button>
                    </div>

                    {/* AI Generated Content */}
                    {company.aiSummary && (
                      <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                        <div className="flex items-center mb-2">
                          <Sparkles className="w-4 h-4 mr-2 text-gray-600" />
                          <span className="font-medium text-sm text-black">AI Summary</span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {company.aiSummary}
                        </p>
                      </div>
                    )}

                    {company.generatedEmail && (
                      <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                        <div className="flex items-center mb-2">
                          <Mail className="w-4 h-4 mr-2 text-gray-600" />
                          <span className="font-medium text-sm text-black">Generated Email</span>
                        </div>
                        <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                          {company.generatedEmail}
                        </div>
                      </div>
                    )}

                    {company.tweet && (
                      <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                        <div className="flex items-center mb-2">
                          <Twitter className="w-4 h-4 mr-2 text-gray-600" />
                          <span className="font-medium text-sm text-black">Generated Tweet</span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {company.tweet}
                        </p>
                      </div>
                    )}

                    {company.deepResearch && (
                      <div className="border border-green-200 rounded-lg p-4 mb-4 bg-green-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Microscope className="w-4 h-4 mr-2 text-green-600" />
                            <span className="font-medium text-sm text-black">Deep Research Complete</span>
                          </div>
                          <button
                            onClick={() => setSelectedCompanyDeepResearch(company.deepResearch!)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            View Report →
                          </button>
                        </div>
                        <p className="text-green-700 text-sm leading-relaxed">
                          Comprehensive analysis including website analysis, competitive intelligence, social presence, and founder insights.
                        </p>
                      </div>
                    )}

                    {/* Share & Export Actions - Only show after AI Summary is generated */}
                    {company.aiSummary && (
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Share & Export</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => sendToSlack(company, index)}
                            disabled={actionLoading[`slack-${index}`]}
                            className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-black text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                          >
                            {actionLoading[`slack-${index}`] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MessageSquare className="w-4 h-4" />
                            )}
                            Send to Slack
                          </button>

                          <button
                            onClick={() => generateTweet(company, index)}
                            disabled={actionLoading[`tweet-${index}`]}
                            className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-black text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                          >
                            {actionLoading[`tweet-${index}`] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Twitter className="w-4 h-4" />
                            )}
                            Tweet
                          </button>

                          <button
                            onClick={() => generateEmail(company, index)}
                            disabled={actionLoading[`email-${index}`]}
                            className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-black text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                          >
                            {actionLoading[`email-${index}`] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Mail className="w-4 h-4" />
                            )}
                            Email
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <ScrapeProgress steps={progressSteps} isVisible={showProgress} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {showChat && (
        <ChatInterface
          companies={companies}
          onClose={() => setShowChat(false)}
        />
      )}



      {/* Batch Analysis Modal */}
      {batchAnalysis && (
        <BatchAnalysisModal
          analysis={batchAnalysis}
          onClose={() => setBatchAnalysis(null)}
        />
      )}

      {/* Deep Research Modal */}
      {selectedCompanyDeepResearch && (
        <DeepResearchModal
          company={selectedCompanyDeepResearch}
          onClose={() => setSelectedCompanyDeepResearch(null)}
        />
      )}
    </div>
  );
}

// Deep Research Modal Component
function DeepResearchModal({ company, onClose }: { company: CompanyDeepResearch; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            {company.logo && (
              <img
                src={company.logo}
                alt={`${company.name} logo`}
                className="w-12 h-12 rounded-lg object-cover bg-gray-100"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
              <p className="text-gray-600">{company.batch} • Deep Intelligence Report</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Website Analysis */}
            {company.deepAnalysis?.websiteAnalysis && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  Website Analysis
                </h3>

                {company.deepAnalysis.websiteAnalysis.techStack && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Tech Stack</h4>
                    <div className="flex flex-wrap gap-1">
                      {company.deepAnalysis.websiteAnalysis.techStack.map((tech, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {company.deepAnalysis.websiteAnalysis.features && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Key Features</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {company.deepAnalysis.websiteAnalysis.features.slice(0, 5).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-500">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {company.deepAnalysis.websiteAnalysis.jobOpenings && company.deepAnalysis.websiteAnalysis.jobOpenings.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Hiring ({company.deepAnalysis.websiteAnalysis.jobOpenings.length} roles)</h4>
                    <div className="space-y-2">
                      {company.deepAnalysis.websiteAnalysis.jobOpenings.slice(0, 3).map((job, i) => (
                        <div key={i} className="text-sm">
                          <div className="font-medium">{job.title}</div>
                          <div className="text-gray-500">{job.department} • {job.location}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Competitive Intelligence */}
            {company.deepAnalysis?.competitiveIntel && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-red-500" />
                  Competitive Intel
                </h3>

                {company.deepAnalysis.competitiveIntel.directCompetitors && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Direct Competitors</h4>
                    <div className="flex flex-wrap gap-1">
                      {company.deepAnalysis.competitiveIntel.directCompetitors.map((competitor, i) => (
                        <span key={i} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                          {competitor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {company.deepAnalysis.competitiveIntel.marketPosition && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Market Position</h4>
                    <p className="text-sm text-gray-600">{company.deepAnalysis.competitiveIntel.marketPosition}</p>
                  </div>
                )}

                {company.deepAnalysis.competitiveIntel.uniqueAdvantages && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Unique Advantages</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {company.deepAnalysis.competitiveIntel.uniqueAdvantages.map((advantage, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-500">+</span>
                          {advantage}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Social Presence */}
            {company.deepAnalysis?.socialPresence && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  Social Presence
                </h3>

                <div className="space-y-3">
                  {company.deepAnalysis.socialPresence.twitterHandle && (
                    <div className="flex items-center gap-2">
                      <Twitter className="w-4 h-4 text-blue-400" />
                      <span className="text-sm">@{company.deepAnalysis.socialPresence.twitterHandle}</span>
                      {company.deepAnalysis.socialPresence.twitterFollowers && (
                        <span className="text-xs text-gray-500">
                          ({company.deepAnalysis.socialPresence.twitterFollowers} followers)
                        </span>
                      )}
                    </div>
                  )}

                  {company.deepAnalysis.socialPresence.linkedinUrl && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <a
                        href={company.deepAnalysis.socialPresence.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}

                  {company.deepAnalysis.socialPresence.githubUrl && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-800" />
                      <a
                        href={company.deepAnalysis.socialPresence.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-800 hover:underline"
                      >
                        GitHub Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Founder Intelligence */}
            {company.deepAnalysis?.founderIntel?.founders && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  Founder Intel
                </h3>

                <div className="space-y-3">
                  {company.deepAnalysis.founderIntel.founders.map((founder, i) => (
                    <div key={i} className="border-l-2 border-purple-200 pl-3">
                      <div className="font-medium text-gray-900">{founder.name}</div>
                      <div className="text-sm text-gray-600">{founder.role}</div>
                      {founder.education && (
                        <div className="text-xs text-gray-500">{founder.education}</div>
                      )}
                      {founder.previousCompanies && founder.previousCompanies.length > 0 && (
                        <div className="text-xs text-gray-500">
                          Previously: {founder.previousCompanies.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Batch Analysis Modal Component
function BatchAnalysisModal({ analysis, onClose }: { analysis: BatchAnalysis; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{analysis.batchName} Analysis</h2>
            <p className="text-gray-600">{analysis.totalCompanies} companies • Comprehensive Market Intelligence</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Industry Breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-black" />
                Industry Distribution
              </h3>
              <div className="space-y-3">
                {Object.entries(analysis.industryBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 8)
                  .map(([industry, count]) => {
                    const percentage = Math.round((count / analysis.totalCompanies) * 100);
                    return (
                      <div key={industry} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{industry}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-black h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">{count} ({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Market Trends */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-black" />
                Market Trends
              </h3>
              <div className="space-y-3">
                {analysis.trends.map((trend, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{trend}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-black" />
                Top Performing Companies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.topPerformers.slice(0, 6).map((company, index) => (
                  <div key={company.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-black">#{index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{company.name}</h4>
                        <span className="text-xs text-gray-500">{company.batch}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-3">{company.description}</p>
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-black hover:underline mt-2 inline-block"
                      >
                        Visit Website →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Competitive Matrix */}
            {analysis.competitiveMatrix.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-black" />
                  Competitive Landscape
                </h3>
                <div className="space-y-6">
                  {analysis.competitiveMatrix.map((matrix, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">{matrix.industry} Sector</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Market Leader</h5>
                          <span className="text-sm bg-black text-white px-2 py-1 rounded">
                            {matrix.marketLeader}
                          </span>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Emerging Players</h5>
                          <div className="flex flex-wrap gap-1">
                            {matrix.emergingPlayers.map((player, i) => (
                              <span key={i} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                {player}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Opportunities</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {matrix.opportunities.slice(0, 2).map((opp, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-black">•</span>
                                {opp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Company Logo component with fallback logo sources
function CompanyLogo({ company }: { company: CompanyWithSummary }) {
  const [imageError, setImageError] = useState(false);
  const [currentLogoUrl, setCurrentLogoUrl] = useState(company.logo || '');
  const [fallbackAttempt, setFallbackAttempt] = useState(0);

  // Generate fallback logo URLs
  const getFallbackLogoUrls = (company: CompanyWithSummary): string[] => {
    const fallbacks: string[] = [];
    
    if (company.website) {
      try {
        const domain = new URL(company.website).hostname.replace('www.', '');
        // Try common favicon/logo paths
        fallbacks.push(`https://${domain}/favicon.ico`);
        fallbacks.push(`https://logo.clearbit.com/${domain}`); // Clearbit logo API
        fallbacks.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`); // Google favicon service
        fallbacks.push(`https://${domain}/logo.png`);
        fallbacks.push(`https://${domain}/assets/logo.png`);
      } catch (e) {
        // Invalid URL, skip website-based fallbacks
      }
    }
    
    return fallbacks;
  };

  // Enhanced debugging
  useEffect(() => {
    console.log(`CompanyLogo for ${company.name} (${company.batch}):`, {
      hasLogo: !!company.logo,
      logoUrl: company.logo,
      logoLength: company.logo?.length || 0,
      website: company.website,
      fallbackAttempt
    });
  }, [company.name, company.logo, company.batch, company.website, fallbackAttempt]);

  const handleImageError = () => {
    const fallbackUrls = getFallbackLogoUrls(company);
    
    if (fallbackAttempt < fallbackUrls.length) {
      const nextUrl = fallbackUrls[fallbackAttempt];
      console.log(`Trying fallback logo ${fallbackAttempt + 1} for ${company.name}:`, nextUrl);
      setCurrentLogoUrl(nextUrl);
      setFallbackAttempt(prev => prev + 1);
      setImageError(false); // Reset error state to try new URL
    } else {
      console.log(`All logo attempts failed for ${company.name} (${company.batch})`);
      setImageError(true);
    }
  };

  // Reset when company changes
  useEffect(() => {
    setCurrentLogoUrl(company.logo || '');
    setImageError(false);
    setFallbackAttempt(0);
  }, [company.id, company.logo]);

  if (!currentLogoUrl || imageError) {
    return (
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-white font-bold text-sm flex-shrink-0 border border-gray-600">
        {company.name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
      <img
        src={currentLogoUrl}
        alt={`${company.name} logo`}
        className="w-12 h-12 rounded-lg object-cover"
        onError={handleImageError}
        onLoad={() => console.log(`Logo loaded successfully for ${company.name} (${company.batch}):`, currentLogoUrl)}
      />
    </div>
  );
}
