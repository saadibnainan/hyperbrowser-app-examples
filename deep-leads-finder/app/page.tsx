"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import LeadForm from "../components/LeadForm";
import LeadsTable from "../components/LeadsTable";
import { DownloadBtn } from "../components/DownloadBtn";
import LiveConsole from "../components/LiveConsole";
import Progress from "../components/Progress";

export default function Home() {
  const [leads, setLeads] = useState<any[]>([]);
  const [csv, setCsv] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [pct, setPct] = useState<number>(0);

  /** helper to push log lines & animate progress */
  function log(msg: string, nextPct?: number) {
    setLogs(prev => [...prev, msg]);
    if (nextPct !== undefined) setPct(nextPct);
  }

  async function handleSubmit(query: string, city: string) {
    // reset
    setLogs([]); setLeads([]); setCsv(""); setPct(0);

    log(`Starting deep research: "${query}" in ${city}`, 5);
    try {
      log(`Creating Hyperbrowser session...`, 10);
      log(`Targeting: Yelp, Google Maps, Yellow Pages`, 15);
      
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, city })
      });
      
      log(`Deep crawling and extraction in progress...`, 30);
      log(`Using AI to extract structured data...`, 60);
      log(`OpenAI filtering for relevance...`, 80);
      log(`Processing results...`, 90);

      const { leads: L, csv: C, metadata } = await res.json();

      setLeads(L);
      setCsv(C);

      log(`Research complete: ${L.length} relevant leads (${metadata?.originalCount || 0} filtered) from ${metadata?.sources?.length || 0} sources`, 95);
      log(`Ready for download! Duration: ${metadata?.duration ? Math.round(metadata.duration/1000) : '?'}s`, 100);
    } catch (err: any) {
      log(`Research failed: ${err.message}`, 100);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.12 }}
        className="text-center mb-16 mt-16"
      >
        <h1 className="hero-title">Stop hunting <span className="text-accent">leads</span> manually</h1>
        <p className="hero-subtitle">AI-powered research with precision filtering</p>
        
        <div className="mt-4 flex items-center justify-center">
          <span className="flex items-center">Powered by</span>
          <a href="https://hyperbrowser.ai" target="_blank" rel="noopener noreferrer" className="flex items-center ml-2">
            <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
              <Image 
                src="/title.png" 
                alt="Hyperbrowser" 
                width={130} 
                height={40}
              />
            </div>
          </a>
        </div>
      </motion.div>

      {/* form */}
      <LeadForm onSubmit={handleSubmit} />

      {/* progress */}
      <Progress pct={pct} />

      {/* results */}
      <LeadsTable leads={leads} />
      <DownloadBtn csv={csv} />

      {/* live console */}
      <LiveConsole logs={logs} />
    </div>
  );
}