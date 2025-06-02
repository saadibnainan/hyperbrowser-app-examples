'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, ExternalLink, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { useChat } from 'ai/react';
import { useDocumentation } from '@/contexts/DocumentationContext';
import { MessageRenderer } from './MessageRenderer';
import { CrawledPage } from '@/lib/types';

export function ChatInterface() {
  const { currentDocumentation, clearDocumentation } = useDocumentation();
  const [showSources, setShowSources] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      documentation: currentDocumentation,
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!currentDocumentation) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-100">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Please crawl documentation first to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-black/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 mb-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Documentation Loaded
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>{currentDocumentation.pages.length} pages</span>
                <span>•</span>
                <a 
                  href={currentDocumentation.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-green-300 inline-flex items-center transition-colors group"
                >
                  {new URL(currentDocumentation.url).hostname}
                  <ExternalLink className="h-3 w-3 ml-1 group-hover:text-green-300" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 rounded-lg transition-all duration-200 border border-gray-700/50"
            >
              {showSources ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showSources ? 'Hide Sources' : 'View Sources'}</span>
            </button>
            
            <button
              onClick={clearDocumentation}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 rounded-lg transition-all duration-200 border border-gray-700/50"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </div>
        
        {showSources && (
          <div className="mt-6 pt-6 border-t border-gray-800/50">
            <h4 className="text-sm font-medium text-gray-300 mb-4">Documentation Sources ({currentDocumentation.pages.length} pages)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
              {currentDocumentation.pages.map((page: CrawledPage, index: number) => (
                <a
                  key={index}
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-900/50 hover:bg-gray-800/50 rounded-lg border border-gray-800/50 hover:border-gray-700/50 transition-all duration-200 group"
                >
                  <p className="text-sm font-medium text-gray-200 group-hover:text-green-300 transition-colors truncate">
                    {page.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {new URL(page.url).pathname}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-6 px-2">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Ready to help!</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Ask me anything about the documentation. I can help you understand concepts, find specific information, or provide code examples.
            </p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-4 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
            )}
            
            <div
              className={`max-w-4xl rounded-2xl shadow-lg ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-green-400 to-green-500 text-white px-6 py-4'
                  : 'bg-black/90 backdrop-blur-xl border border-gray-800/50 text-white px-6 py-5'
              }`}
            >
              <MessageRenderer 
                content={message.content} 
                role={message.role as 'user' | 'assistant'} 
              />
            </div>
            
            {message.role === 'user' && (
              <div className="flex-shrink-0 w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="bg-black/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl px-6 py-5">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-400 text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="bg-black/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4 shadow-2xl">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask me anything about the documentation..."
            className="flex-1 px-6 py-4 bg-gray-900/80 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 text-white placeholder-gray-500 text-lg transition-all duration-200"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-4 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl hover:from-green-500 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 font-semibold shadow-lg hover:shadow-green-500/20"
          >
            <Send className="h-5 w-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
} 