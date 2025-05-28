import React from 'react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: "🔍",
      title: "Real Data",
      description: "Analyze authentic Reddit discussions to find genuine user problems and needs."
    },
    {
      icon: "⚡",
      title: "AI-Powered",
      description: "Leverage advanced AI to extract insights and generate actionable business ideas."
    },
    {
      icon: "🚀",
      title: "Ready to Build",
      description: "Get implementation-ready ideas with clear pain points and solution strategies."
    }
  ];

  return (
    <div className="mt-20 grid md:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <div key={index} className="text-center p-6">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">{feature.icon}</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
          <p className="text-gray-400 text-sm">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default FeaturesSection; 