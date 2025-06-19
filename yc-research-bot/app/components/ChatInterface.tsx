'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, stagger, useAnimation } from 'framer-motion';
import { CompanyWithSummary } from '@/types/company';
import { X, Send, MessageSquare, Lightbulb, TrendingUp, Users, Target, Search } from 'lucide-react';
import { FOUNDER_QUERY_TEMPLATES } from '@/lib/openai';

// Typewriter effect component for streaming text
function TypewriterText({ text, speed = 20 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return <span>{displayedText}</span>;
}

// Markdown parser with typewriter support
function parseMarkdownWithTypewriter(text: string, useTypewriter: boolean = false): React.ReactNode[] {
  // Split by lines first to handle line breaks
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    // Handle headers (### text)
    if (line.startsWith('### ')) {
      const headerText = line.slice(4);
      return (
        <h3 key={`line-${lineIndex}`} className="text-lg font-bold mb-2 mt-3">
          {useTypewriter ? <TypewriterText text={headerText} speed={30} /> : headerText}
        </h3>
      );
    }
    
    // Handle headers (## text)  
    if (line.startsWith('## ')) {
      const headerText = line.slice(3);
      return (
        <h2 key={`line-${lineIndex}`} className="text-xl font-bold mb-2 mt-4">
          {useTypewriter ? <TypewriterText text={headerText} speed={30} /> : headerText}
        </h2>
      );
    }
    
    // Handle bullet points
    if (line.startsWith('- ') || line.startsWith('• ')) {
      const bulletText = line.slice(2);
      return (
        <div key={`line-${lineIndex}`} className="flex items-start gap-2 mb-1">
          <span className="text-gray-400 mt-1">•</span>
          <span>
            {useTypewriter ? (
              <TypewriterText text={bulletText} speed={25} />
            ) : (
              parseInlineMarkdown(bulletText)
            )}
          </span>
        </div>
      );
    }
    
    // Handle numbered lists
    const numberedMatch = line.match(/^(\d+)\.\s(.+)/);
    if (numberedMatch) {
      return (
        <div key={`line-${lineIndex}`} className="flex items-start gap-2 mb-1">
          <span className="text-gray-400 mt-1 font-medium">{numberedMatch[1]}.</span>
          <span>
            {useTypewriter ? (
              <TypewriterText text={numberedMatch[2]} speed={25} />
            ) : (
              parseInlineMarkdown(numberedMatch[2])
            )}
          </span>
        </div>
      );
    }
    
    // Regular line with inline markdown
    if (line.trim()) {
      return (
        <div key={`line-${lineIndex}`} className="mb-2">
          {useTypewriter ? (
            <TypewriterText text={line} speed={25} />
          ) : (
            parseInlineMarkdown(line)
          )}
        </div>
      );
    }
    
    // Empty line
    return <div key={`line-${lineIndex}`} className="mb-2"></div>;
  });
}

// Parse inline markdown (bold, links, etc.)
function parseInlineMarkdown(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let index = 0;
  let keyCounter = 0;
  
  while (index < text.length) {
    // Find next markdown pattern
    const boldMatch = text.slice(index).match(/^\*\*(.+?)\*\*/);
    const linkMatch = text.slice(index).match(/^\[([^\]]+)\]\(([^)]+)\)/);
    
    if (boldMatch) {
      elements.push(<strong key={`bold-${keyCounter++}`}>{boldMatch[1]}</strong>);
      index += boldMatch[0].length;
    } else if (linkMatch) {
      elements.push(
        <a key={`link-${keyCounter++}`} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {linkMatch[1]}
        </a>
      );
      index += linkMatch[0].length;
    } else {
      // Find next markdown pattern or end of string
      const nextBold = text.indexOf('**', index);
      const nextLink = text.indexOf('[', index);
      
      let nextPattern = text.length;
      if (nextBold !== -1) nextPattern = Math.min(nextPattern, nextBold);
      if (nextLink !== -1) nextPattern = Math.min(nextPattern, nextLink);
      
      if (nextPattern > index) {
        elements.push(text.slice(index, nextPattern));
        index = nextPattern;
      } else {
        index++;
      }
    }
  }
  
  return elements;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  queryType?: string;
  isStreaming?: boolean;
}

interface ChatInterfaceProps {
  companies: CompanyWithSummary[];
  onClose: () => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.4
    }
  }
};

const templateVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.2 }
  }
};

const loadingVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3
    }
  }
};

export default function ChatInterface({ companies, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi! I'm your YC competitive intelligence assistant. I have data on **${companies.length} companies** from your research.\n\n**Quick Insights:**\n• ${[...new Set(companies.map(c => c.batch))].length} different batches represented\n• Top industries: ${getTopIndustries(companies).join(', ')}\n\nTry asking me about competitors, market analysis, or partnership opportunities!`,
      sender: 'ai',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll lock when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputValue.trim();
    if (!messageText || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setShowTemplates(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          companies,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          queryType: data.context?.queryType,
          isStreaming: true,
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        isStreaming: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (template: string) => {
    setInputValue(template);
    setShowTemplates(false);
  };

  const getQueryTypeIcon = (queryType?: string) => {
    switch (queryType) {
      case 'competitive_analysis': return <Target className="w-4 h-4" />;
      case 'partnership': return <Users className="w-4 h-4" />;
      case 'benchmarking': return <TrendingUp className="w-4 h-4" />;
      case 'market_analysis': return <Search className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div 
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white dark:text-black" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                YC Intelligence Assistant
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Competitive intelligence for {companies.length} companies
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                layout
              >
                <motion.div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}
                >
                {message.sender === 'ai' && message.queryType && (
                  <div className="flex items-center gap-2 mb-2 text-sm opacity-75">
                    {getQueryTypeIcon(message.queryType)}
                    <span className="capitalize">{message.queryType.replace('_', ' ')}</span>
                  </div>
                )}
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {parseMarkdownWithTypewriter(
                    message.text, 
                    message.sender === 'ai' && message.isStreaming
                  )}
                </div>
                <div className="text-xs opacity-50 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </motion.div>
            </motion.div>
          ))}
          
          {loading && (
            <motion.div 
              className="flex justify-start"
              variants={loadingVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-white"></div>
                  <span className="text-gray-600 dark:text-gray-400">Analyzing...</span>
                </div>
              </motion.div>
            </motion.div>
          )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>

        {/* Query Templates */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div 
              className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              variants={templateVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div 
                className="flex items-center gap-2 mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Try these founder-focused queries:
                </span>
              </motion.div>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, staggerChildren: 0.05 }}
              >
                {Object.entries(FOUNDER_QUERY_TEMPLATES).map(([category, templates]) => 
                  templates.slice(0, 2).map((template, index) => (
                    <motion.button
                      key={`${category}-${index}`}
                      onClick={() => handleTemplateClick(template)}
                      className="text-left p-2 text-sm bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                    <div className="flex items-center gap-2">
                      {category === 'competitive' && <Target className="w-3 h-3 text-red-500" />}
                      {category === 'market' && <TrendingUp className="w-3 h-3 text-blue-500" />}
                      {category === 'networking' && <Users className="w-3 h-3 text-green-500" />}
                      {category === 'benchmarking' && <Search className="w-3 h-3 text-purple-500" />}
                      {category === 'opportunity' && <Lightbulb className="w-3 h-3 text-yellow-500" />}
                      <span className="text-gray-700 dark:text-gray-300">{template}</span>
                    </div>
                  </motion.button>
                ))
              )}
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Input */}
        <motion.div 
          className="p-4 border-t border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex gap-2">
            <motion.input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about competitors, market analysis, partnerships..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled={loading}
            />
            <motion.button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputValue.trim()}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
          
          {!showTemplates && (
            <motion.button
              onClick={() => setShowTemplates(true)}
              className="mt-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Lightbulb className="w-3 h-3" />
              Show query suggestions
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Helper function to get top industries
function getTopIndustries(companies: CompanyWithSummary[]): string[] {
  const industries: Record<string, number> = {};
  
  companies.forEach(company => {
    const description = company.description.toLowerCase();
    
    if (description.includes('ai') || description.includes('artificial intelligence')) {
      industries['AI'] = (industries['AI'] || 0) + 1;
    }
    if (description.includes('fintech') || description.includes('finance')) {
      industries['Fintech'] = (industries['Fintech'] || 0) + 1;
    }
    if (description.includes('health') || description.includes('medical')) {
      industries['Healthcare'] = (industries['Healthcare'] || 0) + 1;
    }
    if (description.includes('developer') || description.includes('api')) {
      industries['Dev Tools'] = (industries['Dev Tools'] || 0) + 1;
    }
    if (description.includes('b2b') || description.includes('enterprise')) {
      industries['B2B'] = (industries['B2B'] || 0) + 1;
    }
  });
  
  return Object.entries(industries)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([industry]) => industry);
} 