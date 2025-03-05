import { Spinner } from './Spinner'
import { cn } from '../../lib/utils'

interface LoadingSpinnerProps {
  message?: string
  className?: string
  showMessage?: boolean
  glow?: boolean
}

export function LoadingSpinner({
  message = 'Loading...',
  className,
  showMessage = false,
  glow = true
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <Spinner size="md" className="mb-4" color="white" glow={glow} />
      {showMessage && (
        <p className="text-muted-foreground text-sm font-medium">{message}</p>
      )}
    </div>
  )
} 