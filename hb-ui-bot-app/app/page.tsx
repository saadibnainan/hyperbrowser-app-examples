"use client";

import { useState } from "react";

interface AnalysisResult {
  url: string;
  hyperbrowserAnalysis: string;
  aiAnalysis: {
    criticalIssues?: string[];
    uxProblems?: string[];
    performanceConcerns?: string[];
    conversionBarriers?: string[];
    recommendations?: string[];
    error?: string;
    rawAnalysis?: string;
  };
  timestamp: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const analyzeWebsite = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    // Auto-add https:// if no protocol is provided
    let formattedUrl = url.trim();
    if (!formattedUrl.match(/^https?:\/\//)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formattedUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeWebsite();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.svg" 
                alt="HB-UI-Bot Logo" 
                className="w-8 h-8"
              />
              <h1 className="text-xl font-semibold text-black">HB-UI-Bot</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-16 pb-12 text-center">
          <h1 className="text-5xl font-bold text-black mb-6 tracking-tight leading-tight">
            Why are users leaving<br />your website?
          </h1>
      

          {/* Powered by Section */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm text-gray-600">Powered by</span>
              <img 
                src="/Yellow BG.png" 
                alt="Hyperbrowser" 
                className="h-6"
              />
            </div>
          </div>

          <p className="text-l text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Get AI-powered insights into UX issues, conversion blockers, and performance problems 
            that drive users away from your site.
          </p>

          {/* Analysis Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter website URL (e.g., example.com)"
                className="flex-1 px-4 py-3 text-lg text-black border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white placeholder:text-gray-600"
                disabled={loading}
                required
              />
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="px-8 py-3 text-lg font-medium bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Analyzing..." : "Analyze Site"}
              </button>
            </div>
          </form>

          {error && (
            <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-black"></div>
            <p className="mt-4 text-gray-600">Analyzing website for UX and conversion issues...</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8 pb-16">
            {/* Header */}
            <div className="text-center border-b border-gray-100 pb-8">
              <h2 className="text-2xl font-semibold text-black mb-2">Analysis Complete</h2>
              <p className="text-gray-600">
                Results for <span className="font-medium text-black">{result.url}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Analyzed on {new Date(result.timestamp).toLocaleString()}
              </p>
            </div>

            {result.aiAnalysis.error ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Analysis Results</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-red-600 mb-3">Note: Raw analysis due to parsing error</p>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">{result.aiAnalysis.rawAnalysis}</pre>
                </div>
              </div>
            ) : (
              <div className="grid gap-6">
                {/* Critical Issues */}
                {result.aiAnalysis.criticalIssues && result.aiAnalysis.criticalIssues.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-black mb-4">Critical Issues</h3>
                    <div className="space-y-3">
                      {result.aiAnalysis.criticalIssues.map((issue, i) => (
                        <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                          <p className="text-sm text-gray-800">{issue}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* UX Problems */}
                {result.aiAnalysis.uxProblems && result.aiAnalysis.uxProblems.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-black mb-4">UX/UI Problems</h3>
                    <div className="space-y-3">
                      {result.aiAnalysis.uxProblems.map((problem, i) => (
                        <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                          <p className="text-sm text-gray-800">{problem}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Performance Concerns */}
                {result.aiAnalysis.performanceConcerns && result.aiAnalysis.performanceConcerns.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-black mb-4">Performance Concerns</h3>
                    <div className="space-y-3">
                      {result.aiAnalysis.performanceConcerns.map((concern, i) => (
                        <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                          <p className="text-sm text-gray-800">{concern}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conversion Barriers */}
                {result.aiAnalysis.conversionBarriers && result.aiAnalysis.conversionBarriers.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-black mb-4">Conversion Barriers</h3>
                    <div className="space-y-3">
                      {result.aiAnalysis.conversionBarriers.map((barrier, i) => (
                        <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                          <p className="text-sm text-gray-800">{barrier}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {result.aiAnalysis.recommendations && result.aiAnalysis.recommendations.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-black mb-4">Recommendations</h3>
                    <div className="space-y-3">
                      {result.aiAnalysis.recommendations.map((rec, i) => (
                        <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                          <p className="text-sm text-gray-800">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw Browser Analysis */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-black mb-4">Browser Test Results</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {result.hyperbrowserAnalysis
                        .replace(/\*\*(.*?)\*\*/g, '$1')
                        .replace(/\*/g, '•')
                      }
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Follow <a href="https://x.com/hyperbrowser" className="text-black hover:underline">@hyperbrowser</a> for updates
          </p>
        </footer>
      </div>
    </div>
  );
}