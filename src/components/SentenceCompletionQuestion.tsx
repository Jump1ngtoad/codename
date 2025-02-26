import { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { SentenceQuestion, DraggableWordItem } from '../types'
import { WordBank } from './WordBank'
import { SentenceConstruction } from './SentenceConstruction'
import { DraggableWord } from './DraggableWord'
import { Button } from './ui/button'

interface SentenceCompletionQuestionProps {
  question: SentenceQuestion
  onCorrect: () => void
}

export function SentenceCompletionQuestion({
  question,
  onCorrect,
}: SentenceCompletionQuestionProps) {
  // Initialize state
  const [availableWords, setAvailableWords] = useState<DraggableWordItem[]>([])
  const [constructedSentence, setConstructedSentence] = useState<DraggableWordItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [attemptCount, setAttemptCount] = useState(0)

  // Set up drag sensors with increased distance to better differentiate between taps and drags
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    })
  )

  // Initialize available words
  useEffect(() => {
    const words = question.words.map((word, index) => ({
      id: `word-${index}`,
      content: word,
    }))
    setAvailableWords(words)
    setConstructedSentence([])
    setAttemptCount(0)
  }, [question])

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeWord = [...availableWords, ...constructedSentence].find(
      (word) => word.id === active.id
    )
    if (!activeWord) return

    // Get source and destination containers
    const sourceContainer = availableWords.find((w) => w.id === active.id)
      ? 'word-bank'
      : 'sentence-construction'

    // Handle dropping onto a container (not a word)
    if (over.id === 'word-bank' || over.id === 'sentence-construction') {
      // Moving between containers
      if (over.id === 'sentence-construction' && sourceContainer === 'word-bank') {
        setAvailableWords(availableWords.filter((word) => word.id !== active.id))
        setConstructedSentence([...constructedSentence, activeWord])
      } else if (over.id === 'word-bank' && sourceContainer === 'sentence-construction') {
        setConstructedSentence(constructedSentence.filter((word) => word.id !== active.id))
        setAvailableWords([...availableWords, activeWord])
      }
      return
    }

    // At this point, we're dropping onto another word
    
    // Find which container the target word is in
    const isOverWordInBank = availableWords.some(w => w.id === over.id)
    const isOverWordInSentence = constructedSentence.some(w => w.id === over.id)
    
    if (isOverWordInBank && sourceContainer === 'word-bank') {
      // Reordering within word bank
      const oldIndex = availableWords.findIndex((word) => word.id === active.id)
      const newIndex = availableWords.findIndex((word) => word.id === over.id)
      
      const newOrder = arrayMove(availableWords, oldIndex, newIndex)
      setAvailableWords(newOrder)
    } else if (isOverWordInSentence && sourceContainer === 'sentence-construction') {
      // Reordering within sentence construction
      const oldIndex = constructedSentence.findIndex((word) => word.id === active.id)
      const newIndex = constructedSentence.findIndex((word) => word.id === over.id)
      
      const newOrder = arrayMove(constructedSentence, oldIndex, newIndex)
      setConstructedSentence(newOrder)
    } else if (isOverWordInBank && sourceContainer === 'sentence-construction') {
      // Moving from sentence to word bank, placing before a specific word
      const newIndex = availableWords.findIndex((word) => word.id === over.id)
      const filteredSentence = constructedSentence.filter((word) => word.id !== active.id)
      const newWordBank = [...availableWords]
      newWordBank.splice(newIndex, 0, activeWord)
      
      setConstructedSentence(filteredSentence)
      setAvailableWords(newWordBank)
    } else if (isOverWordInSentence && sourceContainer === 'word-bank') {
      // Moving from word bank to sentence, placing before a specific word
      const newIndex = constructedSentence.findIndex((word) => word.id === over.id)
      const filteredWordBank = availableWords.filter((word) => word.id !== active.id)
      const newSentence = [...constructedSentence]
      newSentence.splice(newIndex, 0, activeWord)
      
      setAvailableWords(filteredWordBank)
      setConstructedSentence(newSentence)
    }
  }

  // Handle word taps
  const handleWordTap = (wordId: string, container: 'word-bank' | 'sentence-construction') => {
    const word = [...availableWords, ...constructedSentence].find((w) => w.id === wordId)
    if (!word) return

    if (container === 'word-bank') {
      // Move from word bank to sentence construction
      setAvailableWords(availableWords.filter((w) => w.id !== wordId))
      setConstructedSentence([...constructedSentence, word])
    } else {
      // Move from sentence construction back to word bank
      setConstructedSentence(constructedSentence.filter((w) => w.id !== wordId))
      setAvailableWords([...availableWords, word])
    }
  }

  // Check answer
  const checkAnswer = () => {
    const constructedAnswer = constructedSentence.map((word) => word.content).join(' ')
    const isCorrect = constructedAnswer === question.correctAnswer

    if (isCorrect) {
      setConstructedSentence(
        constructedSentence.map((word) => ({ ...word, isCorrect: true }))
      )
      setTimeout(onCorrect, 1000)
    } else {
      setConstructedSentence(
        constructedSentence.map((word) => ({ ...word, isCorrect: false }))
      )
      setAttemptCount((prev) => prev + 1)
    }
  }

  // Find active word for overlay
  const activeWord = activeId
    ? [...availableWords, ...constructedSentence].find((word) => word.id === activeId)
    : null

  return (
    <div className="space-y-6">
      <div className="text-2xl font-medium text-center mb-8">{question.prompt}</div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          <SentenceConstruction 
            words={constructedSentence} 
            activeId={activeId} 
            onWordTap={handleWordTap}
          />
          <WordBank 
            words={availableWords} 
            activeId={activeId} 
            onWordTap={handleWordTap}
          />
        </div>

        <DragOverlay>
          {activeWord ? (
            <DraggableWord 
              word={activeWord} 
              isDragging 
              container="word-bank"
              onTap={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <Button
        className="w-full mt-6"
        size="lg"
        onClick={checkAnswer}
        disabled={constructedSentence.length === 0}
      >
        Check Answer
      </Button>
    </div>
  )
} 