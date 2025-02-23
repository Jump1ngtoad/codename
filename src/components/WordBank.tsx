import { useDroppable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { DraggableWordItem } from '../types'
import { DraggableWord } from './DraggableWord'
import { cn } from '../lib/utils'

interface WordBankProps {
  words: DraggableWordItem[]
  activeId: string | null
  onWordTap: (wordId: string, container: 'word-bank' | 'sentence-construction') => void
}

export function WordBank({ words, activeId, onWordTap }: WordBankProps) {
  const { setNodeRef } = useDroppable({
    id: 'word-bank',
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'p-4 rounded-xl bg-secondary/50',
        'transition-colors duration-200',
        words.length === 0 && 'bg-secondary/20'
      )}
    >
      <SortableContext id="word-bank" items={words} strategy={rectSortingStrategy}>
        <div className="flex flex-wrap gap-2">
          {words.map((word) => (
            <DraggableWord
              key={word.id}
              word={word}
              isDragging={activeId === word.id}
              container="word-bank"
              onTap={onWordTap}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
} 