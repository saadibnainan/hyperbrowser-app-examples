import React from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface HeroSectionProps {
  niche: string;
  onNicheChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  apiKey: string;
  onOpenSidebar: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  niche,
  onNicheChange,
  onSubmit,
  loading,
  apiKey,
  onOpenSidebar
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className="text-center mb-16">
      <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 via-lime-500 to-emerald-500 bg-clip-text text-transparent">
        Reddit-Powered Idea Generator
      </h1>
      <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
        Discover real pain points and innovative solutions by analyzing Reddit conversations. 
        Get data-driven startup ideas from authentic user discussions.
      </p>
      
      {/* Search Input */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
        <Input
          value={niche}
          onChange={(e) => onNicheChange(e.target.value)}
          placeholder="Enter your niche (e.g., productivity, fitness, cooking)"
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <Button
          onClick={onSubmit}
          disabled={loading || !niche}
        >
          {loading ? "Analyzing..." : "Generate Ideas"}
        </Button>
      </div>
      
      {!apiKey && (
        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg max-w-2xl mx-auto">
          <p className="text-yellow-300 text-sm">
            💡 <strong>Get started:</strong> Click &quot;Setup API Key&quot; above to connect your Hyperbrowser account and start generating ideas!
          </p>
        </div>
      )}
    </div>
  );
};

export default HeroSection; 