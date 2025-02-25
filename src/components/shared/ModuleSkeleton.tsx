import { cn } from '../../lib/utils'

export function ModuleSkeleton() {
  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border animate-pulse">
      <div className="space-y-4 min-w-0">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] rounded-xl bg-secondary shrink-0" />
            <div className="h-6 bg-secondary rounded-lg w-32" />
          </div>
          <div className="h-4 bg-secondary rounded-lg w-full" />
          <div className="h-4 bg-secondary rounded-lg w-3/4" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-secondary rounded-lg w-24" />
          <div className="h-4 bg-secondary rounded-lg w-28" />
        </div>
      </div>
    </div>
  )
}

export function ModuleSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <ModuleSkeleton key={i} />
      ))}
    </div>
  )
} 