"use client";

import BgGradient from "./BgGradient";
import Navbar from "./components/navigation/Navbar";
import Sidebar from "./components/navigation/Sidebar";
import HeroSection from "./components/sections/HeroSection";
import ProgressBar from "./components/ui/ProgressBar";
import ImplementationSummary from "./components/sections/ImplementationSummary";
import IdeasGrid from "./components/sections/IdeasGrid";
import FeaturesSection from "./components/sections/FeaturesSection";
import { useIdeaGeneration } from "./hooks/useIdeaGeneration";

export default function Home() {
  const {
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
  } = useIdeaGeneration();

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <BgGradient />
      
      <Sidebar
        showSidebar={showSidebar}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        onClose={() => setShowSidebar(false)}
        />
      
      <Navbar
        apiKey={apiKey}
        onOpenSidebar={() => setShowSidebar(true)}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <HeroSection
          niche={niche}
          onNicheChange={setNiche}
          onSubmit={handleSubmit}
          loading={loading}
          apiKey={apiKey}
          onOpenSidebar={() => setShowSidebar(true)}
        />

        <ProgressBar progress={progress} loading={loading} />

        <ImplementationSummary implementationSummary={implementationSummary} />

        <IdeasGrid ideas={ideas} />

        <FeaturesSection />
      </div>
    </div>
  );
}
