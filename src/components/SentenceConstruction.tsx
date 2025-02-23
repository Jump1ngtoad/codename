import { useDroppable } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggableWordItem } from '../types'
import { DraggableWord } from './DraggableWord'
import { cn } from '../lib/utils'

interface SentenceConstructionProps {
  words: DraggableWordItem[]
  activeId: string | null
  onWordTap: (wordId: string, container: 'word-bank' | 'sentence-construction') => void
}

export function SentenceConstruction({ words, activeId, onWordTap }: SentenceConstructionProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'sentence-construction',
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'p-4 rounded-xl bg-white min-h-[100px] border-2 border-dashed',
        'transition-all duration-200',
        isOver ? 'border-primary bg-primary/5' : 'border-border',
        words.length === 0 && 'flex items-center justify-center'
      )}
    >
      {words.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          Tap or drag words here to construct your sentence
        </div>
      ) : (
        <SortableContext
          id="sentence-construction"
          items={words}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-wrap gap-2">
            {words.map((word) => (
              <DraggableWord
                key={word.id}
                word={word}
                isDragging={activeId === word.id}
                container="sentence-construction"
                onTap={onWordTap}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  )
} 