'use client'

interface ProgressBarProps {
  progress: number
  isLoading: boolean
}

export default function ProgressBar({ progress, isLoading }: ProgressBarProps) {
  if (!isLoading && progress === 0) return null

  return (
    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800 rounded-t-2xl overflow-hidden">
      <div 
        className="h-full transition-all duration-300 ease-out"
        style={{ 
          width: `${Math.min(progress, 100)}%`,
          backgroundColor: '#F0FF26'
        }}
      />
      {isLoading && progress < 100 && (
        <div 
          className="absolute inset-0 animate-pulse"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(240, 255, 38, 0.2), transparent)`
          }}
        />
      )}
    </div>
  )
} 