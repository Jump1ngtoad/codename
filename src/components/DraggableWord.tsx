import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '../lib/utils'
import { DraggableWordItem } from '../types'

interface DraggableWordProps {
  word: DraggableWordItem
  isDragging?: boolean
  container: 'word-bank' | 'sentence-construction'
  onTap: (wordId: string, container: 'word-bank' | 'sentence-construction') => void
}

export function DraggableWord({ word, isDragging, container, onTap }: DraggableWordProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: word.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Handle tap/click without interfering with drag
  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    // If it's a touch event or if it's a mouse event with no movement
    if ('touches' in e || (e as React.MouseEvent).movementX === 0) {
      e.preventDefault()
      onTap(word.id, container)
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
        word.isCorrect === true
          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
          : word.isCorrect === false
          ? 'bg-red-50 border-red-500 text-red-600'
          : 'bg-white border-border hover:border-gray-300',
        // Add subtle animation for tap feedback
        'active:scale-95'
      )}
    >
      {word.content}
    </div>
  )
} 