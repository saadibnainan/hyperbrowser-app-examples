import React from 'react';

interface ImplementationSummaryProps {
  implementationSummary: string;
}

const ImplementationSummary: React.FC<ImplementationSummaryProps> = ({ implementationSummary }) => {
  if (!implementationSummary) return null;

  return (
    <div className="mb-12 p-6 bg-gradient-to-r from-green-900/20 to-lime-900/20 border border-green-500/30 rounded-xl backdrop-blur-sm">
      <h3 className="text-xl font-semibold mb-4 text-green-300">💡 Quick Implementation Guide</h3>
      <p className="text-gray-300 leading-relaxed">{implementationSummary}</p>
    </div>
  );
};

export default ImplementationSummary; 