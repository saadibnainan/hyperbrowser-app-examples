"use client";
import { motion } from "framer-motion";

export default function Progress({ pct }: { pct: number }) {
  if (pct === 0) return null;

  return (
    <div className="mt-6 mb-6">
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center">
          <svg className="icon w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
          </svg>
          <span>Processing</span>
        </div>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="h-1 bg-border rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.12 }}
        />
      </div>
      
      {pct < 100 && pct > 0 && (
        <div className="flex items-center justify-between text-xs mt-2 text-muted">
          <span>Searching...</span>
          <span>Step {Math.round(pct / 10)} of 10</span>
        </div>
      )}
    </div>
  );
}