"use client";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveConsole({ logs }: { logs: string[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const getLogType = (log: string) => {
    if (log.includes('[ERROR]')) return 'error';
    if (log.includes('[SUCCESS]') || log.includes('[COMPLETE]') || log.includes('[SHOT]')) return 'success';
    if (log.includes('[QUESTION]')) return 'question';
    if (log.includes('[ANSWER]')) return 'answer';
    if (log.includes('[DEBUG]')) return 'debug';
    return 'info';
  };

  const getLogStyles = (type: string) => {
    switch (type) {
      case 'error': return 'text-gray-400';
      case 'success': return 'text-white';
      case 'question': return 'text-gray-300';
      case 'answer': return 'text-gray-200';
      case 'debug': return 'text-gray-500 text-xs';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto p-4 space-y-1 font-mono">
        <AnimatePresence>
          {logs.map((log, i) => {
            const logType = getLogType(log);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className={`text-xs leading-relaxed ${getLogStyles(logType)}`}
              >
                {log}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {logs.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-sm">Waiting for activity...</p>
            </div>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>
    </div>
  );
}