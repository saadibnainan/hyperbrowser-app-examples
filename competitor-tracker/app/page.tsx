'use client'

import { useEffect, useState } from 'react'
import { TrackedURL, Change } from '../types'
import Link from 'next/link'
import { Plus, ExternalLink, Calendar, Globe, AlertCircle, TrendingUp, Zap } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import TerminalSidebar from '../components/TerminalSidebar'

export default function HomePage() {
  const [changes, setChanges] = useState<Change[]>([])
  const [trackedUrls, setTrackedUrls] = useState<TrackedURL[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [terminalOpen, setTerminalOpen] = useState(false)

  const loadChanges = async () => {
    try {
      const res = await fetch('/api/changes')
      const json = (await res.json()) as Change[]
      setChanges(json.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    } catch (error) {
      console.error('Failed to load changes:', error)
    }
  }

  const loadTrackedUrls = async () => {
    try {
      const res = await fetch('/api/tracked')
      const json = (await res.json()) as TrackedURL[]
      setTrackedUrls(json)
    } catch (error) {
      console.error('Failed to load tracked URLs:', error)
    }
  }

  const handleRun = async (id: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `${timestamp} - Starting crawl for ${id}`])
    
    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracked_url_id: id }),
      })
      
      if (res.ok) {
        setLogs(prev => [...prev, `${timestamp} - ✅ Crawl completed for ${id}`])
        loadChanges()
      } else {
        const error = await res.text()
        setLogs(prev => [...prev, `${timestamp} - ❌ Crawl failed for ${id}: ${error}`])
      }
    } catch (error) {
      setLogs(prev => [...prev, `${timestamp} - ❌ Error: ${error}`])
    }
  }

  const handleRunAll = async () => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `${timestamp} - Starting crawl for all sources`])
    
    try {
      const sourcesRes = await fetch('/api/tracked')
      const sources = (await sourcesRes.json()) as TrackedURL[]
      
      for (const source of sources) {
        await handleRun(source.id)
      }
    } catch (error) {
      setLogs(prev => [...prev, `${timestamp} - ❌ Error running all: ${error}`])
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/track/${id}`, { method: 'DELETE' })
      loadChanges()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-400" />
      case 'medium': return <TrendingUp className="w-4 h-4 text-yellow-400" />
      case 'low': return <Zap className="w-4 h-4 text-green-400" />
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/20'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  useEffect(() => {
    loadChanges()
    loadTrackedUrls()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex">
        <Sidebar onRun={handleRun} onRunAll={handleRunAll} onDelete={handleDelete} />
        
        <main className="flex-1 p-8">
          <header className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">
              Competitor <span className="accent-text">Tracker</span>
            </h1>
            <Link
              href="/new"
              className="flex items-center space-x-2 bg-accent text-black px-4 py-2 rounded-lg font-semibold hover:brightness-110"
            >
              <Plus className="w-4 h-4" /> <span>Add URL</span>
            </Link>
          </header>

          {/* Terminal Logs Section */}
          <div className="mb-8 p-4 bg-black/40 border border-white/10 rounded-lg">
            <div className="font-mono text-sm leading-relaxed space-y-1 min-h-[100px] max-h-[200px] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500 italic">
                  No activity yet. Add a URL to start tracking changes.
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-accent">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            {changes.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No changes detected yet</h3>
                <p>Add some URLs to track and run crawls to see changes here.</p>
              </div>
            ) : (
              changes.map((change) => (
                <div
                  key={change.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-accent" />
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          change.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                          change.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {change.impact.toUpperCase()} IMPACT
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(change.created_at).toLocaleDateString()} at {new Date(change.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    {change.summary}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        Content changes detected
                      </span>
                    </div>
                    <a
                      href={trackedUrls.find(u => u.id === change.tracked_url_id)?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-accent hover:text-accent/80 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View Site</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      <TerminalSidebar 
        logs={logs} 
        isOpen={terminalOpen} 
        onToggle={() => setTerminalOpen(!terminalOpen)} 
      />
    </div>
  )
}
