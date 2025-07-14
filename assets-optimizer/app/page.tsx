'use client'

import { useState } from 'react'
import UrlForm from '../components/UrlForm'
import ProgressBar from '../components/ProgressBar'
import ResultCard from '../components/ResultCard'
import TerminalSidebar from '../components/TerminalSidebar'
import Navbar from '../components/Navbar'

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

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [report, setReport] = useState<Report | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [zipBase64, setZipBase64] = useState('')

  const handleOptimize = async (url: string) => {
    setIsLoading(true)
    setProgress(0)
    setReport(null)
    setLogs([])
    setSidebarOpen(true)
    setZipBase64('')

    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            try {
              const json = JSON.parse(data)
              setReport(json)
              setZipBase64(json.zip)
              setProgress(100)
              setIsLoading(false)
            } catch {
              setLogs(prev => [...prev, data])
              // Simulate progress based on log messages
              setProgress(prev => Math.min(prev + 10, 95))
            }
          }
        }
      }
    } catch (error) {
      console.error('Optimization failed:', error)
      setLogs(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`])
      setIsLoading(false)
    }
  }

  const downloadZip = () => {
    const a = document.createElement('a')
    a.href = `data:application/zip;base64,${zipBase64}`
    a.download = 'optimized-assets.zip'
    a.click()
  }



  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-6xl font-bold text-white tracking-tight4">
              Assets<span style={{ color: '#F0FF26' }}>Optimizer</span>
            </h1>
          </div>
          <p className="text-lg text-gray-500 tracking-tight4">
            Optimize Images, CSS & JS Assets with{' '}
            <span className="items-center">
                             <img src="/Yellow BG.png" alt="Hyperbrowser" className="inline h-5 w-auto rounded-full" />
            </span>
          </p>
        </div>

        <div className="relative rounded-2xl p-8 overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(240, 255, 38, 0.1) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(240, 255, 38, 0.05) 100%)',
          border: '1px solid rgba(240, 255, 38, 0.2)'
        }}>
          <ProgressBar progress={progress} isLoading={isLoading} />

          <UrlForm onSubmit={handleOptimize} isLoading={isLoading} />

          {report && (
            <div className="mt-8 animate-in fade-in duration-500">
              <ResultCard
                report={report}
                onDownloadZip={downloadZip}
              />
            </div>
          )}
        </div>

        {report && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 font-medium tracking-tight4">
              Powered by{' '}
              <a
                href="https://hyperbrowser.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Hyperbrowser
              </a>
              {' • '}
              <a
                href="https://docs.hyperbrowser.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Get your API key
              </a>
            </p>
          </div>
        )}
      </main>

      <TerminalSidebar
        logs={logs}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
    </div>
  )
}
