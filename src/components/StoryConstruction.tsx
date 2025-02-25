import { useDroppable } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggableWordItem } from '../types'
import { StoryFragment } from './StoryFragment'
import { cn } from '../lib/utils'

interface StoryConstructionProps {
  fragments: DraggableWordItem[]
  activeId: string | null
  onFragmentTap: (fragmentId: string, container: 'fragment-bank' | 'story-construction') => void
}

export function StoryConstruction({ fragments, activeId, onFragmentTap }: StoryConstructionProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'story-construction',
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'p-4 rounded-xl bg-white min-h-[120px] border-2 border-dashed',
        'transition-all duration-200',
        isOver ? 'border-primary bg-primary/5' : 'border-border',
        fragments.length === 0 && 'flex items-center justify-center'
      )}
    >
      {fragments.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          Tap or drag fragments here to construct your story
        </div>
      ) : (
        <SortableContext
          id="story-construction"
          items={fragments}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-wrap gap-2">
            {fragments.map((fragment) => (
              <StoryFragment
                key={fragment.id}
                fragment={fragment}
                isDragging={activeId === fragment.id}
                container="story-construction"
                onTap={onFragmentTap}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  )
} 