'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

export interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  details?: string;
}

interface ScrapeProgressProps {
  steps: ProgressStep[];
  isVisible: boolean;
}

export default function ScrapeProgress({ steps, isVisible }: ScrapeProgressProps) {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-lg w-full"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-gray-900 dark:bg-gray-100 rounded-full animate-pulse" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Scraping Progress
            </h3>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {step.status === 'completed' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <CheckCircle className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                    </motion.div>
                  )}
                  {step.status === 'running' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                    </motion.div>
                  )}
                  {step.status === 'pending' && (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                  {step.status === 'error' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <Circle className="w-5 h-5 text-red-500" />
                    </motion.div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {step.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {step.description}
                  </p>
                  
                  {step.details && step.status === 'running' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2"
                    >
                      <div className="text-xs text-gray-900 dark:text-gray-100 font-mono bg-black/10 dark:bg-black/30 rounded px-2 py-1">
                        {step.details.startsWith('http') ? (
                          <a 
                            href={step.details} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline cursor-pointer"
                          >
                            🌐 {step.details}
                          </a>
                        ) : (
                          step.details
                        )}
                      </div>
                    </motion.div>
                  )}

                  {step.status === 'running' && (
                    <motion.div
                      className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Powered by Hyperbrowser
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 