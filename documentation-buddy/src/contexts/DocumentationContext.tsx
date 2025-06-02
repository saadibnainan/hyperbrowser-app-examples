'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DocumentationData } from '@/lib/types';

interface DocumentationContextType {
  currentDocumentation: DocumentationData | null;
  isLoading: boolean;
  error: string | null;
  apiKey: string;
  setApiKey: (key: string) => void;
  crawlDocumentation: (url: string, maxPages?: number) => Promise<void>;
  clearDocumentation: () => void;
}

const DocumentationContext = createContext<DocumentationContextType | undefined>(undefined);

export function useDocumentation() {
  const context = useContext(DocumentationContext);
  if (context === undefined) {
    throw new Error('useDocumentation must be used within a DocumentationProvider');
  }
  return context;
}

interface DocumentationProviderProps {
  children: ReactNode;
}

export function DocumentationProvider({ children }: DocumentationProviderProps) {
  const [currentDocumentation, setCurrentDocumentation] = useState<DocumentationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('hyperbrowser-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Save API key to localStorage whenever it changes
  const updateApiKey = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('hyperbrowser-api-key', key);
    } else {
      localStorage.removeItem('hyperbrowser-api-key');
    }
  };

  const crawlDocumentation = async (url: string, maxPages: number = 50) => {
    if (!apiKey.trim()) {
      setError('Please enter your Hyperbrowser API key in the settings panel.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url, 
          maxPages,
          apiKey: apiKey.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to crawl documentation');
      }

      const result = await response.json();
      
      if (result.success) {
        const documentationData: DocumentationData = {
          id: `doc-${Date.now()}`,
          url: result.data.url,
          originalUrl: result.data.originalUrl,
          pages: result.data.pages,
          crawledAt: new Date(result.data.crawledAt),
          totalPages: result.data.totalPages,
        };
        
        setCurrentDocumentation(documentationData);
      } else {
        throw new Error('Failed to process crawled data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Documentation crawl error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearDocumentation = () => {
    setCurrentDocumentation(null);
    setError(null);
  };

  const value = {
    currentDocumentation,
    isLoading,
    error,
    apiKey,
    setApiKey: updateApiKey,
    crawlDocumentation,
    clearDocumentation,
  };

  return (
    <DocumentationContext.Provider value={value}>
      {children}
    </DocumentationContext.Provider>
  );
} 