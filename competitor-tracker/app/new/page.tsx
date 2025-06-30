'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Frequency } from '../../types'
import { Loader2, X, ArrowLeft } from 'lucide-react'

export default function NewTrackedUrl() {
  const [url, setUrl] = useState('')
  const [frequency, setFrequency] = useState<Frequency>('daily')
  const [selectors, setSelectors] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: url.trim(), 
          frequency, 
          selectors: selectors.split(',').map((s) => s.trim()).filter(Boolean) 
        }),
      })
      
      if (response.ok) {
        router.push('/')
      } else {
        console.error('Failed to add URL:', response.statusText)
      }
    } catch (error) {
      console.error('Error adding URL:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-white relative">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 p-2 rounded-lg bg-black/40 border border-white/10 hover:bg-white/10 transition-all"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Back button */}
      <button
        onClick={handleClose}
        className="absolute top-6 left-6 flex items-center space-x-2 p-2 rounded-lg bg-black/40 border border-white/10 hover:bg-white/10 transition-all text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl w-full max-w-lg space-y-6 relative">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">
            Add <span className="accent-text">Competitor URL</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Track changes on competitor websites with AI-powered summaries
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Website URL
            </label>
            <input
              type="url"
              className="w-full p-4 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:border-accent/50 transition-colors"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Check Frequency
            </label>
            <select
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:border-accent/50 transition-colors appearance-none cursor-pointer"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Frequency)}
            >
              <option value="hourly">Every Hour</option>
              <option value="3-hourly">Every 3 Hours</option>
              <option value="daily">Daily</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              CSS Selectors <span className="text-gray-500">(optional)</span>
            </label>
            <input
              className="w-full p-4 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:border-accent/50 transition-colors"
              placeholder="e.g., .pricing, #hero-section, .product-list"
              value={selectors}
              onChange={(e) => setSelectors(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Focus tracking on specific page elements (comma separated)
            </p>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 py-4 rounded-xl font-semibold bg-black/40 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="flex-1 py-4 rounded-xl font-semibold text-black bg-accent transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="animate-spin w-4 h-4" />
                <span>Adding...</span>
              </div>
            ) : (
              'Track URL'
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 