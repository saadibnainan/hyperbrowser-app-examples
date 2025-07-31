"use client";
import { useState } from "react";
import QueryForm from "../components/QueryForm";
import Progress from "../components/Progress";
import LiveConsole from "../components/LiveConsole";
import ShotCarousel from "../components/ShotCarousel";
import DownloadBtn from "../components/DownloadBtn";

export default function Page() {
  const [logs, setLogs] = useState<string[]>([]);
  const [pct, setPct] = useState(0);
  const [shots, setShots] = useState<string[]>([]);
  const [json, setJson] = useState("");
  const [currentShot, setCurrentShot] = useState<string>("");
  const [researchContext, setResearchContext] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const [questionMode, setQuestionMode] = useState(false);
  const [qaHistory, setQaHistory] = useState<Array<{question: string, answer: string}>>([]);

  function push(line: string, nextPct?: number, screenshot?: string) {
    // Don't add Q&A logs to the progress console
    if (!line.includes('[QUESTION]') && !line.includes('[ANSWER]')) {
      setLogs((prev) => [...prev, line]);
    }
    if (nextPct !== undefined) setPct(nextPct);
    if (screenshot) {
      setCurrentShot(screenshot);
      setShots(prev => [...prev, screenshot]);
    }
  }

  async function handleResearch(query: string) {
    let serverLogs: string[] = [];
    
    try {
      setIsResearching(true);
      setQuestionMode(false);
      setLogs([]);
      setShots([]);
      setCurrentShot("");
      setPct(0);
      
      push(`[START] Starting Reddit research for: ${query}`, 5);
      
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        push(`[ERROR] ${errorData.error}: ${errorData.details || ''}`);
        setPct(100);
        return;
      }
      
      const data = await res.json();
      const { threads, logs, json, fullContent } = data;
      serverLogs = logs || [];
      
      setJson(json || "{}");
      setResearchContext(fullContent || "");
      
      // Extract all screenshots from threads
      const allShots = (threads || []).map((t: any) => t.shot).filter(Boolean);
      setShots(allShots);
      
      // Process logs and update screenshots dynamically
      serverLogs.forEach((log: string, index: number) => {
        setTimeout(() => {
          push(log);
          
          // Check if this log contains a screenshot reference
          if (log.includes('[SHOT]') && log.includes('/shots/')) {
            const shotMatch = log.match(/\/shots\/[^,\s]+/);
            if (shotMatch) {
              setCurrentShot(shotMatch[0]);
              // Also add to shots array if not already there
              setShots(prev => {
                if (!prev.includes(shotMatch[0])) {
                  return [...prev, shotMatch[0]];
                }
                return prev;
              });
            }
          }
          
          // Update progress based on log processing
          const progress = Math.min(90, 10 + (index / (serverLogs.length || 1)) * 80);
          setPct(progress);
        }, index * 100); // Stagger the logs for real-time effect
      });
      
      // Final completion after all logs are processed
      setTimeout(() => {
        setPct(100);
        setQuestionMode(true);
        push(`[READY] Research complete! You can now ask questions about the findings.`);
        
        // Ensure final shot is set
        if (allShots.length > 0) {
          setCurrentShot(allShots[allShots.length - 1]);
        }
      }, serverLogs.length * 100 + 500);
      
    } catch (error) {
      push(`[ERROR] ${error}`);
      setPct(100);
    } finally {
      setTimeout(() => setIsResearching(false), serverLogs.length * 100 + 1000);
    }
  }

  async function handleQuestion(question: string) {
    if (!researchContext) {
      push(`[ERROR] No research context available. Please run a research query first.`);
      return;
    }

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question, 
          context: researchContext 
        })
      });
      
      if (!res.ok) {
        setQaHistory(prev => [...prev, { question, answer: "Failed to get answer" }]);
        return;
      }
      
      const data = await res.json();
      console.log('Adding Q&A to history:', { question, answer: data.answer });
      setQaHistory(prev => {
        const newHistory = [...prev, { question, answer: data.answer }];
        console.log('New qaHistory length:', newHistory.length);
        return newHistory;
      });
      
    } catch (error) {
      setQaHistory(prev => [...prev, { question, answer: `Error: ${error}` }]);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950 sticky top-0 z-10">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex-shrink-0">
                <img src="/hb-svg.svg" alt="Hyperbrowser" className="w-full h-full" />
              </div>
              <div>
                <h1 className="text-lg font-medium text-white">Deep Reddit Researcher</h1>
                <p className="text-xs text-gray-400 leading-tight">
                  {questionMode ? "Ask questions about your research" : "Research Reddit discussions with AI"}
                </p>
              </div>
            </div>
            {questionMode && (
              <button
                onClick={() => {
                  setQuestionMode(false);
                  setResearchContext("");
                  setLogs([]);
                  setShots([]);
                  setPct(0);
                  setQaHistory([]);
                }}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs font-medium transition-colors"
              >
                New Research
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Screenshots */}
        <div className="w-1/2 border-r border-gray-800 bg-gray-950/50">
          <div className="p-6 h-full flex flex-col">
            <div className="mb-4">
              <h2 className="font-semibold text-lg mb-1">Live Screenshots</h2>
              <p className="text-sm text-gray-400">Real-time page captures as we browse Reddit</p>
            </div>
            
            <div className="flex-1 bg-gray-900/50 rounded-lg p-4 border border-gray-800">
              <ShotCarousel shots={shots} />
            </div>



            {/* Download Button - Left Panel */}
            {json && json !== "{}" && (
              <div className="mt-6 pt-4 border-t border-gray-800">
                <DownloadBtn data={json} />
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Controls & Logs */}
        <div className="w-1/2 flex flex-col">
          {/* Search Area */}
          <div className="p-6 border-b border-gray-800 bg-gray-950/30">
            <QueryForm
              onSubmit={questionMode ? handleQuestion : handleResearch}
              placeholder={questionMode ? "Ask a question about the research..." : "What should I research on Reddit?"}
              disabled={isResearching}
            />
            
            {pct > 0 && pct < 100 && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-gray-300">{Math.round(pct)}%</span>
                </div>
                <Progress pct={pct} />
              </div>
            )}
          </div>

          {/* Q&A Results */}
          {questionMode && (
            <div className="border-b border-gray-800 bg-gray-950/20">
              <div className="p-4">
                <h3 className="font-medium mb-3">Questions & Answers</h3>
                {qaHistory.length === 0 ? (
                  <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                    <p className="text-sm text-gray-400">Ask a question about the research above...</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {qaHistory.map((qa, i) => (
                      <div key={i} className="bg-gray-900/70 rounded-lg p-3 border border-gray-800">
                        <div className="text-sm text-gray-300 mb-2">
                          <span className="text-gray-500">Q:</span> {qa.question}
                        </div>
                        <div className="text-sm text-gray-200">
                          <span className="text-gray-500">A:</span> {qa.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Log */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-4 border-b border-gray-800 bg-gray-950/20">
              <h3 className="font-medium">Activity Log</h3>
              <p className="text-sm text-gray-400">Live research updates</p>
            </div>
            
            <div className="flex-1 bg-gray-950/80">
              <LiveConsole logs={logs} />
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}