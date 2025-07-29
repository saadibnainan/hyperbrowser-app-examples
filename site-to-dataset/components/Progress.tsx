'use client';

import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface ProgressProps {
  progress: number;
  isVisible: boolean;
}

export default function Progress({ progress, isVisible }: ProgressProps) {
  const springProgress = useSpring(0, { 
    stiffness: 120, 
    damping: 20 
  });
  
  const width = useTransform(springProgress, (value) => `${value}%`);
  
  useEffect(() => {
    springProgress.set(progress);
  }, [progress, springProgress]);
  
  if (!isVisible) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 card-shadow border"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-black">Processing Progress</h3>
        <span className="text-sm font-semibold text-black">{Math.round(progress)}%</span>
      </div>
      
      <div className="progress-modern">
        <motion.div 
          className="progress-fill"
          style={{ width }}
        />
      </div>
      
      <div className="mt-3 text-xs text-gray-600 text-center">
        {progress < 30 && "Scraping content from website..."}
        {progress >= 30 && progress < 80 && "Generating Q/A pairs with AI..."}
        {progress >= 80 && progress < 100 && "Finalizing dataset..."}
        {progress >= 100 && "Complete! ✓"}
      </div>
    </motion.div>
  );
} 