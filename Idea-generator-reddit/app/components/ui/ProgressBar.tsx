import React from 'react';

interface ProgressBarProps {
  progress: number;
  loading: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, loading }) => {
  if (!loading) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">Analyzing Reddit discussions...</span>
        <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-500 to-lime-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar; 