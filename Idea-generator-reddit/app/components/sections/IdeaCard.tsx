import React from 'react';
import { Idea } from '../../types';

interface IdeaCardProps {
  idea: Idea;
  index: number;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, index }) => {
  return (
    <div
      key={index}
      className="group p-6 bg-gray-900/50 border border-gray-700 rounded-xl hover:border-green-500/50 transition-all duration-300 backdrop-blur-sm hover:shadow-lg hover:shadow-green-500/10"
    >
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-300 uppercase tracking-wide">
            Topic
          </span>
        </div>
        <h3 className="text-lg font-semibold text-white group-hover:text-green-300 transition-colors">
          {idea.topic}
        </h3>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-sm font-medium text-red-300 uppercase tracking-wide">
            Pain Point
          </span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">
          {idea.pain_point}
        </p>
      </div>
      
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-lime-500 rounded-full"></div>
          <span className="text-sm font-medium text-lime-300 uppercase tracking-wide">
            Solution
          </span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">
          {idea.suggested_idea}
        </p>
      </div>
    </div>
  );
};

export default IdeaCard; 