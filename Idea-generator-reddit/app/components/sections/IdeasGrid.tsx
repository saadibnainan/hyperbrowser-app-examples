import React from 'react';
import { Idea } from '../../types';
import IdeaCard from './IdeaCard';

interface IdeasGridProps {
  ideas: Idea[];
}

const IdeasGrid: React.FC<IdeasGridProps> = ({ ideas }) => {
  if (ideas.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Generated Ideas</h2>
        <p className="text-gray-400">Found {ideas.length} opportunities from Reddit discussions</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ideas.map((idea, index) => (
          <IdeaCard key={index} idea={idea} index={index} />
        ))}
      </div>
    </div>
  );
};

export default IdeasGrid; 