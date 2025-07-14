'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Terminal } from 'lucide-react'

interface TerminalSidebarProps {
  logs: string[]
  isOpen: boolean
  onToggle: () => void
}

export default function TerminalSidebar({ logs, isOpen, onToggle }: TerminalSidebarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!isPaused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, isPaused])

  return (
    <>
      {/* Toggle Button - Bottom Right */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 bg-black border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-900 hover:text-white transition-all duration-200 shadow-lg"
        aria-label="Toggle terminal sidebar"
      >
        <Terminal className="w-4 h-4" />
        <span className="text-sm font-medium tracking-tight4">Live Log</span>
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-96 bg-black border-l border-gray-800 transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-gray-400" />
              <h3 className="text-gray-300 font-medium tracking-tight4">Optimization Terminal</h3>
            </div>
            <button
              onClick={onToggle}
              className="text-gray-500 hover:text-gray-300 transition-colors"
              aria-label="Close terminal"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto scrollbar-hide font-mono text-sm leading-relaxed space-y-1"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {logs.length === 0 ? (
              <div className="text-gray-500 italic">
                Waiting for optimization to start...
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="break-all" style={{ color: '#F0FF26' }}>
                  <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>{' '}
                  {log}
                </div>
              ))
            )}
          </div>

          {isPaused && (
            <div className="px-4 py-2 bg-gray-900 text-yellow-400 text-xs border-t border-gray-800">
              Auto-scroll paused (hover to continue)
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  )
} 