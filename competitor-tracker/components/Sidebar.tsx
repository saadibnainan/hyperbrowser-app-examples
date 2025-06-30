'use client'

import { useEffect, useState } from 'react'
import { TrackedURL } from '../types'
import Link from 'next/link'
import { Trash, Clock, Globe } from 'lucide-react'

interface Props {
  onRun: (id: string) => void
  onRunAll: () => void
  onDelete: (id: string) => void
}

export default function Sidebar({ onRun, onRunAll, onDelete }: Props) {
  const [sources, setSources] = useState<TrackedURL[]>([])
  const [loading, setLoading] = useState(false)

  const loadSources = async () => {
    try {
      const res = await fetch('/api/tracked')
      const json = (await res.json()) as TrackedURL[]
      setSources(json)
    } catch (error) {
      console.error('Failed to load sources:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tracked URL?')) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/track/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await loadSources() // Reload sources after deletion
        onDelete(id) // Call parent callback
      } else {
        console.error('Failed to delete:', res.statusText)
      }
    } catch (error) {
      console.error('Error deleting source:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'hourly': return 'Every hour'
      case '3-hourly': return 'Every 3 hours'
      case 'daily': return 'Daily'
      default: return frequency
    }
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'hourly': return 'text-red-400'
      case '3-hourly': return 'text-yellow-400'
      case 'daily': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  useEffect(() => {
    loadSources()
    const interval = setInterval(loadSources, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <aside className="w-80 shrink-0 p-6 border-r border-white/10 bg-black/20 backdrop-blur-md min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-semibold">Tracked URLs</h2>
        </div>
        {sources.length > 0 && (
          <button
            onClick={onRunAll}
            disabled={loading}
            className="text-black bg-accent px-3 py-2 rounded-lg text-sm font-medium hover:brightness-110 disabled:opacity-50 transition-all"
          >
            Run All
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {sources.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-4">No sources tracked yet.</p>
            <Link 
              href="/new" 
              className="inline-flex items-center space-x-2 text-accent hover:text-accent/80 transition-colors"
            >
              <span>+ Add your first source</span>
            </Link>
          </div>
        ) : (
          sources.map((source) => (
            <div key={source.id} className="glass-card p-4 rounded-lg hover:bg-white/10 transition-all group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate" title={source.url}>
                    {source.url.replace(/^https?:\/\//, '')}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className={`text-xs ${getFrequencyColor(source.frequency)}`}>
                      {getFrequencyLabel(source.frequency)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Added {new Date(source.created_at).toLocaleDateString()}
                </span>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onRun(source.id)}
                    disabled={loading}
                    className="text-black bg-accent px-3 py-1 rounded text-xs font-medium hover:brightness-110 disabled:opacity-50 transition-all"
                  >
                    Run
                  </button>
                  <button
                    onClick={() => handleDelete(source.id)}
                    disabled={loading}
                    className="text-gray-400 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-all"
                    title="Delete source"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {sources.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <Link 
            href="/new" 
            className="flex items-center justify-center space-x-2 w-full py-3 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 hover:border-accent/50 transition-all"
          >
            <span className="font-medium">+ Add Source</span>
          </Link>
        </div>
      )}
    </aside>
  )
} 