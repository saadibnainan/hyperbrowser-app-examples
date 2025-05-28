import { useState } from 'react';
import { Idea, ApiResponse } from '../types';

export const useIdeaGeneration = () => {
  const [niche, setNiche] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [implementationSummary, setImplementationSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90; // Stop at 90%, complete when API returns
        }
        return prev + Math.random() * 15;
      });
    }, 500);
    return interval;
  };

  const handleSubmit = async () => {
    if (!niche) return;
    
    if (!apiKey) {
      alert("Please enter your Hyperbrowser API key in the sidebar first!");
      setShowSidebar(true);
      return;
    }
    
    setLoading(true);
    setIdeas([]);
    setImplementationSummary("");
    
    const progressInterval = simulateProgress();
    
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, apiKey }),
      });
      const data: ApiResponse = await res.json();
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (data.error) {
        console.error("API Error:", data.error);
        alert("Error: " + data.error);
        return;
      }
      
      setIdeas(data.ideas || []);
      setImplementationSummary(data.implementation_summary || "");
    } catch (error) {
      console.error("Error:", error);
      clearInterval(progressInterval);
      alert("Failed to generate ideas. Please check your API key and try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000); // Reset progress after 1 second
    }
  };

  return {
    niche,
    setNiche,
    ideas,
    implementationSummary,
    loading,
    progress,
    apiKey,
    setApiKey,
    showSidebar,
    setShowSidebar,
    handleSubmit
  };
}; 