'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  logs: string[]
  isOpen: boolean
  onToggle: () => void
}

export default function TerminalSidebar({ logs, isOpen, onToggle }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!paused && ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight
    }
  }, [logs, paused])

  return null // Component no longer needed as logs are shown in main content
} 