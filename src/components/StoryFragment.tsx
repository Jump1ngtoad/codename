import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '../lib/utils'
import { DraggableWordItem } from '../types'

interface StoryFragmentProps {
  fragment: DraggableWordItem & { isPartiallyCorrect?: boolean }
  isDragging?: boolean
  container: 'fragment-bank' | 'story-construction'
  onTap: (fragmentId: string, container: 'fragment-bank' | 'story-construction') => void
  isOver?: boolean
}

export function StoryFragment({ 
  fragment, 
  isDragging, 
  container,
  onTap,
  isOver
}: StoryFragmentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: fragment.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onTap(fragment.id, container)}
      className={cn(
        'px-3 py-2 rounded-lg select-none touch-none cursor-grab active:cursor-grabbing',
        'transition-colors duration-150',
        'border-2',
        isDragging || isSortableDragging ? [
          'opacity-50',
          'border-primary/50',
          'shadow-lg',
          'scale-105'
        ] : [
          fragment.isCorrect ? 'border-green-500 bg-green-50' :
          fragment.isPartiallyCorrect ? 'border-yellow-500 bg-yellow-50' :
          'border-zinc-200 bg-white hover:border-primary/50'
        ],
        isOver && 'before:absolute before:inset-0 before:bg-primary/10 before:rounded-lg',
        'relative'
      )}
    >
      <span className={cn(
        'text-sm font-medium',
        fragment.isCorrect ? 'text-green-700' :
        fragment.isPartiallyCorrect ? 'text-yellow-700' :
        'text-zinc-700'
      )}>
        {fragment.content}
      </span>
    </div>
  )
} 