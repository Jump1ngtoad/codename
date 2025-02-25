import { useDroppable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { DraggableWordItem } from '../types'
import { StoryFragment } from './StoryFragment'
import { cn } from '../lib/utils'

interface FragmentBankProps {
  fragments: DraggableWordItem[]
  activeId: string | null
  onFragmentTap: (fragmentId: string, container: 'fragment-bank' | 'story-construction') => void
}

export function FragmentBank({ fragments, activeId, onFragmentTap }: FragmentBankProps) {
  const { setNodeRef } = useDroppable({
    id: 'fragment-bank',
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'p-4 rounded-xl bg-secondary/50',
        'transition-colors duration-200',
        fragments.length === 0 && 'bg-secondary/20'
      )}
    >
      <SortableContext id="fragment-bank" items={fragments} strategy={rectSortingStrategy}>
        <div className="flex flex-wrap gap-2">
          {fragments.map((fragment) => (
            <StoryFragment
              key={fragment.id}
              fragment={fragment}
              isDragging={activeId === fragment.id}
              container="fragment-bank"
              onTap={onFragmentTap}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
} 