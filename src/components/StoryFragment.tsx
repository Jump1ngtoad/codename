import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '../lib/utils'
import { DraggableWordItem } from '../types'

interface StoryFragmentProps {
  fragment: DraggableWordItem & { isPartiallyCorrect?: boolean }
  isDragging?: boolean
  container: 'fragment-bank' | 'story-construction'
  onTap: (fragmentId: string, container: 'fragment-bank' | 'story-construction') => void
}

export function StoryFragment({ fragment, isDragging, container, onTap }: StoryFragmentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: fragment.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Handle tap/click without interfering with drag
  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    // If it's a touch event or if it's a mouse event with no movement
    if ('touches' in e || (e as React.MouseEvent).movementX === 0) {
      e.preventDefault()
      onTap(fragment.id, container)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleTap}
      onTouchEnd={handleTap}
      className={cn(
        'select-none touch-none cursor-grab active:cursor-grabbing',
        'px-3 py-2 rounded-lg text-sm font-medium',
        'transition-all duration-200',
        'border-2',
        isDragging || isSortableDragging
          ? 'opacity-50 scale-105'
          : 'hover:scale-105',
        fragment.isCorrect === true
          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
          : fragment.isCorrect === false && fragment.isPartiallyCorrect
          ? 'bg-amber-50 border-amber-500 text-amber-700'
          : fragment.isCorrect === false
          ? 'bg-red-50 border-red-500 text-red-600'
          : 'bg-white border-border hover:border-gray-300',
        // Add subtle animation for tap feedback
        'active:scale-95'
      )}
    >
      {fragment.content}
    </div>
  )
} 