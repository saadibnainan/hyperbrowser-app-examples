'use client'

import { useState, useEffect } from 'react'
import { ReactFlow, Controls, MiniMap, Background, useNodesState, useEdgesState, Node, Edge } from 'reactflow'
import { Download, Play, Loader2, Zap, ExternalLink, Settings } from 'lucide-react'
import 'reactflow/dist/style.css'

interface CrawlState {
  isRunning: boolean
  progress: number
  logs: string[]
  result: any
  error: string | null
}

interface FlowNode {
  id: string
  type: string
  label: string
  url?: string
  screenshot?: string
}

interface FlowEdge {
  id: string
  source: string
  target: string
  label?: string
}

export default function FlowMapperPage() {
  const [hbKey, setHbKey] = useState('')
  const [targetUrl, setTargetUrl] = useState('')
  const [depth, setDepth] = useState(2)
  const [includeReact, setIncludeReact] = useState(true)
  const [crawlState, setCrawlState] = useState<CrawlState>({
    isRunning: false,
    progress: 0,
    logs: [],
    result: null,
    error: null
  })
  const [showGraph, setShowGraph] = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // Load API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('hb_api_key')
    if (savedKey) {
      setHbKey(savedKey)
    }
  }, [])

  // Save API key to localStorage
  useEffect(() => {
    if (hbKey) {
      localStorage.setItem('hb_api_key', hbKey)
    }
  }, [hbKey])

  const handleCrawl = async () => {
    if (!hbKey.trim() || !targetUrl.trim()) {
      setCrawlState(prev => ({ ...prev, error: 'Please provide both API key and target URL' }))
      return
    }

    setCrawlState({
      isRunning: true,
      progress: 0,
      logs: ['Starting crawl session...'],
      result: null,
      error: null
    })

    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hbKey: hbKey.trim(),
          url: targetUrl.trim(),
          depth,
          includeReact
        })
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
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'progress') {
                setCrawlState(prev => ({ ...prev, progress: data.progress }))
              } else if (data.type === 'log') {
                setCrawlState(prev => ({ 
                  ...prev, 
                  logs: [...prev.logs, data.message] 
                }))
              } else if (data.type === 'complete') {
                setCrawlState(prev => ({ 
                  ...prev, 
                  result: data.result,
                  progress: 100,
                  isRunning: false 
                }))
                
                // Convert graph data to React Flow format
                if (data.result.graph) {
                  const flowNodes: Node[] = data.result.graph.nodes.map((node: FlowNode, index: number) => ({
                    id: node.id,
                    type: 'default',
                    position: { x: (index % 3) * 250, y: Math.floor(index / 3) * 150 },
                    data: { 
                      label: node.label,
                      url: node.url,
                      screenshot: node.screenshot 
                    },
                                         style: {
                       background: 'rgba(255, 255, 255, 0.05)',
                       border: '1px solid rgba(255, 253, 57, 0.3)',
                       borderRadius: '8px',
                       color: 'white',
                       padding: '10px'
                     }
                  }))

                  const flowEdges: Edge[] = data.result.graph.edges.map((edge: FlowEdge) => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    label: edge.label,
                                         style: { stroke: '#FFFD39', strokeWidth: 2 },
                    labelStyle: { fill: 'white', fontSize: 12 }
                  }))

                  setNodes(flowNodes)
                  setEdges(flowEdges)
                  setShowGraph(true)
                }
              } else if (data.type === 'error') {
                setCrawlState(prev => ({ 
                  ...prev, 
                  error: data.message,
                  isRunning: false 
                }))
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', line)
            }
          }
        }
      }
    } catch (error) {
      console.error('Crawl failed:', error)
      setCrawlState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error',
        isRunning: false 
      }))
    }
  }

  const downloadFile = async (type: 'playwright' | 'react' | 'postman') => {
    if (!crawlState.result) return

    try {
      let url = ''
      let filename = ''

      if (type === 'playwright') {
        const blob = new Blob([crawlState.result.playwrightZip], { type: 'application/zip' })
        url = URL.createObjectURL(blob)
        filename = 'playwright-tests.zip'
      } else if (type === 'react') {
        const blob = new Blob([crawlState.result.reactZip], { type: 'application/zip' })
        url = URL.createObjectURL(blob)
        filename = 'react-xstate-component.zip'
      } else if (type === 'postman') {
        const blob = new Blob([JSON.stringify(crawlState.result.postmanJson, null, 2)], { 
          type: 'application/json' 
        })
        url = URL.createObjectURL(blob)
        filename = 'postman-collection.json'
      }

      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Zap className="w-8 h-8 text-neon-yellow" />
            <h1 className="text-6xl font-bold text-white tracking-tight">
              Flow<span className="text-gradient">Mapper</span>
            </h1>
          </div>
                     <p className="text-lg text-gray-400 max-w-2xl mx-auto">
             Generate interactive flow graphs and downloadable Playwright tests from any website. 
             Demo powered by <span className="text-neon-yellow">Hyperbrowser SDK</span> with enterprise features.
           </p>
        </div>

        {/* Main Card */}
        <div className="glass-card p-8 mb-8">
          {/* Progress Bar */}
          {crawlState.isRunning && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Crawling Progress</span>
                <span className="text-sm text-neon-yellow">{crawlState.progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${crawlState.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            <div>
                             <label className="block text-sm font-medium text-gray-300 mb-2">
                 API Key (Demo Mode)
               </label>
              <input
                type="password"
                value={hbKey}
                onChange={(e) => setHbKey(e.target.value)}
                                 placeholder="Enter any API key (e.g., demo-key)"
                className="input-glass w-full"
                disabled={crawlState.isRunning}
              />
                             <p className="text-xs text-gray-500 mt-1">
                 Demo mode: Use any key (e.g., "demo-key"). Production would validate against{' '}
                 <a 
                   href="https://hyperbrowser.ai" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-neon-yellow hover:underline"
                 >
                   hyperbrowser.ai
                 </a>
               </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target URL
              </label>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com"
                className="input-glass w-full"
                disabled={crawlState.isRunning}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Crawl Depth: {depth}
                </label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  value={depth}
                  onChange={(e) => setDepth(parseInt(e.target.value))}
                  className="slider w-full"
                  disabled={crawlState.isRunning}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Shallow</span>
                  <span>Deep</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="includeReact"
                  checked={includeReact}
                  onChange={(e) => setIncludeReact(e.target.checked)}
                  className="w-4 h-4 text-neon-cyan rounded"
                  disabled={crawlState.isRunning}
                />
                <label htmlFor="includeReact" className="text-sm text-gray-300">
                  Generate React/XState component
                </label>
              </div>
            </div>

            <button
              onClick={handleCrawl}
              disabled={crawlState.isRunning || !hbKey.trim() || !targetUrl.trim()}
              className="btn-neon w-full flex items-center justify-center gap-2"
            >
              {crawlState.isRunning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Crawling...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Run FlowMapper
                </>
              )}
            </button>
          </div>

          {/* Error Display */}
          {crawlState.error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{crawlState.error}</p>
            </div>
          )}
        </div>

        {/* Console */}
        {crawlState.logs.length > 0 && (
          <div className="glass-card p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                             <Settings className="w-5 h-5 text-neon-yellow" />
              Live Console
            </h3>
            <div className="console">
              {crawlState.logs.map((log, index) => (
                <span key={index} className="console-line">
                  {log}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {crawlState.result && (
          <div className="space-y-8">
            {/* Download Buttons */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Download Generated Files
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => downloadFile('playwright')}
                  className="btn-download"
                >
                  <Download className="w-4 h-4" />
                  Playwright Tests
                </button>
                {includeReact && (
                  <button
                    onClick={() => downloadFile('react')}
                    className="btn-download"
                  >
                    <Download className="w-4 h-4" />
                    React Component
                  </button>
                )}
                <button
                  onClick={() => downloadFile('postman')}
                  className="btn-download"
                >
                  <Download className="w-4 h-4" />
                  Postman Collection
                </button>
              </div>
            </div>

            {/* Interactive Graph */}
            {showGraph && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Interactive Flow Graph
                </h3>
                <div className="h-96 bg-black/20 rounded-lg overflow-hidden">
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                  >
                    <Controls />
                    <MiniMap />
                                         <Background color="#FFFD39" gap={16} />
                  </ReactFlow>
                </div>
              </div>
            )}

            {/* Upsell Banner */}
            <div className="upsell-banner">
              <div className="flex items-center gap-3">
                                 <ExternalLink className="w-5 h-5 text-neon-yellow" />
                <div>
                  <p className="text-white font-medium">Need higher limits?</p>
                  <p className="text-gray-400 text-sm">
                    Upgrade to unlock unlimited crawls and advanced features.
                  </p>
                </div>
                <a
                  href="https://hyperbrowser.ai/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto btn-neon"
                >
                  View Pricing
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
