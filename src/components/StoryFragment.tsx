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
  isSelected?: boolean
}

export function StoryFragment({ 
  fragment, 
  isDragging, 
  container,
  onTap,
  isOver,
  isSelected
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
    transition: [
      transition,
      'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      'border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)'
    ].filter(Boolean).join(', '),
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
        'transition-all duration-200',
        'border-2',
        'transform-gpu',
        isDragging || isSortableDragging ? [
          'opacity-50',
          'border-primary/50',
          'shadow-lg',
          'scale-105',
          'z-50'
        ] : [
          fragment.isCorrect ? [
            'border-green-500 bg-green-50',
            'shadow-green-100'
          ] :
          isSelected ? [
            'border-primary bg-primary/10',
            'shadow-md',
            'scale-105',
            'z-10'
          ] :
          fragment.isPartiallyCorrect ? [
            'border-yellow-500 bg-yellow-50',
            'shadow-yellow-100'
          ] :
          'border-zinc-200 bg-white hover:border-primary/50 hover:shadow-sm'
        ],
        isOver && [
          'before:absolute before:inset-0 before:bg-primary/10 before:rounded-lg',
          'scale-105',
          'z-10'
        ],
        'relative',
        'active:scale-95 active:shadow-inner',
        'transition-transform transition-colors transition-shadow',
        'ease-out'
      )}
    >
      <span className={cn(
        'text-sm font-medium block',
        'transition-colors duration-150',
        fragment.isCorrect ? 'text-green-700' :
        fragment.isPartiallyCorrect ? 'text-yellow-700' :
        'text-zinc-700'
      )}>
        {fragment.content}
      </span>
    </div>
  )
} 