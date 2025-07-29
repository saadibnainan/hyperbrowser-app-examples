'use client';

import { useEffect, useRef } from 'react';
import { Terminal, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface LiveConsoleProps {
  messages: string[];
  isVisible: boolean;
}

export default function LiveConsole({ messages, isVisible }: LiveConsoleProps) {
  const consoleRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [messages]);
  
  if (!isVisible || messages.length === 0) return null;
  
  const formatMessage = (message: string) => {
    // All messages in white text
    return <span className="text-white">{message}</span>;
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black rounded-2xl overflow-hidden"
    >
      <div className="bg-black px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Live Processing Log</h3>
            <p className="text-xs text-gray-300">Real-time status updates</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-xs text-white font-medium">ACTIVE</span>
        </div>
      </div>
      
      <div 
        ref={consoleRef}
        className="bg-black text-white px-6 py-4 font-mono text-sm overflow-y-auto max-h-72"
      >
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="py-1"
          >
            <span className="text-gray-400 mr-2 text-xs">
              {new Date().toLocaleTimeString()}
            </span>
            {formatMessage(message)}
          </motion.div>
        ))}
        
        {/* Blinking cursor */}
        <div className="flex items-center mt-2">
          <span className="text-gray-400 mr-2 text-xs">
            {new Date().toLocaleTimeString()}
          </span>
          <span className="text-white">$</span>
          <div className="w-2 h-4 bg-white ml-1 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
} 