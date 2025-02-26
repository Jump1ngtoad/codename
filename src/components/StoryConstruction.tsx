import { useDroppable } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggableWordItem } from '../types'
import { StoryFragment } from './StoryFragment'
import { cn } from '../lib/utils'

interface StoryConstructionProps {
  fragments: DraggableWordItem[]
  activeId: string | null
  onFragmentTap: (fragmentId: string, container: 'fragment-bank' | 'story-construction') => void
  overFragment?: string | null
}

export function StoryConstruction({ 
  fragments, 
  activeId, 
  onFragmentTap,
  overFragment 
}: StoryConstructionProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'story-construction',
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[100px] p-4 rounded-xl',
        'transition-colors duration-200',
        isOver && fragments.length === 0 ? 'bg-primary/10' : 'bg-secondary/20',
        'relative'
      )}
    >
      <SortableContext id="story-construction" items={fragments} strategy={horizontalListSortingStrategy}>
        <div className="flex flex-wrap gap-2">
          {fragments.map((fragment) => (
            <StoryFragment
              key={fragment.id}
              fragment={fragment}
              isDragging={activeId === fragment.id}
              container="story-construction"
              onTap={onFragmentTap}
              isOver={overFragment === fragment.id}
            />
          ))}
          {fragments.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-zinc-500">Drop fragments here to construct your story</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
} 