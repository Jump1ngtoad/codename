import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  onBack?: () => void
  className?: string
  fullScreen?: boolean
}

export function ErrorMessage({
  message,
  onRetry,
  onBack,
  className,
  fullScreen = false
}: ErrorMessageProps) {
  const content = (
    <div className={cn("bg-red-50 p-4 rounded-xl text-red-600", className)}>
      <p>{message}</p>
      <div className="mt-4 flex gap-3">
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="ghost"
            className="hover:bg-red-100"
          >
            Try Again
          </Button>
        )}
        {onBack && (
          <Button
            onClick={onBack}
            variant="ghost"
            className="hover:bg-red-100"
          >
            Go Back
          </Button>
        )}
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-2xl">
          <div className="p-6">
            {content}
          </div>
        </div>
      </div>
    )
  }

  return content
} 