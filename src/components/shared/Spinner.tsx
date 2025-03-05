import { cn } from '../../lib/utils'

interface SpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  color?: string
  glow?: boolean
}

export function Spinner({ 
  className, 
  size = 'md', 
  color = 'primary',
  glow = false
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }

  const colorClasses = {
    primary: 'bg-primary',
    white: 'bg-white',
    gray: 'bg-zinc-400'
  }

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <div className={cn(
        'absolute w-full h-full animate-flip-square',
        colorClasses[color as keyof typeof colorClasses] || color,
        glow && 'shadow-lg shadow-white/30'
      )} />
    </div>
  )
} 