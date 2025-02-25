export function QuestionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Question prompt */}
      <div className="h-8 bg-secondary rounded-lg w-3/4 mx-auto" />

      {/* Options */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div 
            key={i}
            className="p-4 rounded-lg border border-secondary bg-white"
          >
            <div className="h-5 bg-secondary rounded w-1/2" />
          </div>
        ))}
      </div>

      {/* Check answer button */}
      <div className="h-12 bg-secondary rounded-lg w-full mt-6" />
    </div>
  )
} 