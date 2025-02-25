import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface LoadingOverlayProps {
  isLoading: boolean
  children?: ReactNode
  message?: string
  className?: string
}

export function LoadingOverlay({
  isLoading,
  children,
  message = 'Loading...',
  className
}: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className={cn("bg-white rounded-2xl w-full max-w-2xl", className)}>
        <div className="p-6 text-center text-muted-foreground">
          {message}
        </div>
      </div>
    </div>
  )
} 