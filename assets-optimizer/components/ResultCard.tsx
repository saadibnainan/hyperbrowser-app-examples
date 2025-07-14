'use client'

import { Download, Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'

interface ReportRow {
  asset: string
  original: number
  optimized: number
  saved: number
}

interface ReportSummary {
  totalOrig: number
  totalOpt: number
  percent: string
}

interface Report {
  summary: ReportSummary
  table: ReportRow[]
  zip: string
}

interface ResultCardProps {
  report: Report
  onDownloadZip: () => void
}

export default function ResultCard({ report, onDownloadZip }: ResultCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="border-t border-gray-700/50 pt-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(240, 255, 38, 0.2) 0%, rgba(240, 255, 38, 0.1) 100%)',
            border: '1px solid rgba(240, 255, 38, 0.3)'
          }}
        >
          <svg className="w-8 h-8" fill="none" stroke="#F0FF26" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight4">Optimization Complete!</h3>
        <p className="text-gray-400 font-medium tracking-tight4">
          Total savings: <span className="font-bold" style={{ color: '#F0FF26' }}>{report.summary.percent}%</span>
        </p>
      </div>

      {/* Optimization Results Table */}
      <div className="mb-8 overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-500 uppercase bg-gray-800/30">
            <tr>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Original</th>
              <th className="px-4 py-3">Optimized</th>
              <th className="px-4 py-3">Saved</th>
            </tr>
          </thead>
          <tbody>
            {report.table.map((row: ReportRow, i: number) => (
              <tr key={i} className="border-b border-gray-700/30">
                <td className="px-4 py-3 font-medium">{row.asset}</td>
                <td className="px-4 py-3">{row.original}</td>
                <td className="px-4 py-3">{row.optimized}</td>
                <td className="px-4 py-3 text-green-400">{row.saved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4">
        <button
          onClick={onDownloadZip}
          className="w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl transition-all duration-200 text-white font-medium tracking-tight4 border border-gray-700/50 hover:border-gray-600"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(31, 41, 55, 0.4) 100%)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <Download className="w-5 h-5" />
          <span>Download Optimized Assets</span>
        </button>



        <button
          onClick={handleCopyReport}
          className="w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl transition-all duration-200 text-white font-medium tracking-tight4 border border-gray-700/50 hover:border-gray-600"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(31, 41, 55, 0.4) 100%)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          disabled={copied}
        >
          <Copy className="w-5 h-5" />
          <span>{copied ? 'Copied!' : 'Copy Report as JSON'}</span>
        </button>

        <div className="pt-6 border-t border-gray-700/50">
          <p className="text-sm text-gray-500 mb-4 font-medium tracking-tight4 uppercase">
            POWERED BY HYPERBROWSER AI
          </p>
          <a
            href="https://docs.hyperbrowser.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-gray-300 hover:text-white font-medium text-sm transition-colors tracking-tight4"
          >
            <span>Get your API key to build more</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
} 