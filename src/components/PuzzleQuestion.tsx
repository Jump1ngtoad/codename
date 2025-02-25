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
import { PuzzleQuestion as PuzzleQuestionType, DraggableWordItem } from '../types'
import { FragmentBank } from './FragmentBank'
import { StoryConstruction } from './StoryConstruction'
import { StoryFragment } from './StoryFragment'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

interface PuzzleQuestionProps {
  question: PuzzleQuestionType
  onCorrect: () => void
}

export function PuzzleQuestion({
  question,
  onCorrect,
}: PuzzleQuestionProps) {
  // Initialize state
  const [availableFragments, setAvailableFragments] = useState<DraggableWordItem[]>([])
  const [constructedStory, setConstructedStory] = useState<DraggableWordItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [attemptCount, setAttemptCount] = useState(0)
  const [isCorrect, setIsCorrect] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showContinueButton, setShowContinueButton] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)

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

  // Initialize available fragments and place the first fragment in the correct position
  useEffect(() => {
    // Create all fragments
    const allFragments = question.fragments.map((fragment, index) => ({
      id: `fragment-${index}`,
      content: fragment,
    }))
    
    // Place the first fragment in the constructed story
    const firstFragment = allFragments[0]
    const remainingFragments = allFragments.slice(1)
    
    setConstructedStory([{ ...firstFragment, isCorrect: true }])
    setAvailableFragments(remainingFragments)
    setAttemptCount(0)
    setIsCorrect(false)
    setFeedbackMessage(null)
    setIsFlipped(false)
    setShowContinueButton(false)
    setImageLoaded(false)
    setImageError(null)
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

    const activeFragment = [...availableFragments, ...constructedStory].find(
      (fragment) => fragment.id === active.id
    )
    if (!activeFragment) return

    // Get source and destination containers
    const sourceContainer = availableFragments.find((f) => f.id === active.id)
      ? 'fragment-bank'
      : 'story-construction'

    // If dropping back into the same container, only handle reordering if needed
    if (
      (sourceContainer === 'fragment-bank' && over.id === 'fragment-bank') ||
      (sourceContainer === 'story-construction' && over.id === 'story-construction')
    ) {
      // Only reorder if dropping onto another fragment
      if (over.id !== 'fragment-bank' && over.id !== 'story-construction') {
        const items = sourceContainer === 'fragment-bank' ? availableFragments : constructedStory
        const oldIndex = items.findIndex((fragment) => fragment.id === active.id)
        const newIndex = items.findIndex((fragment) => fragment.id === over.id)
        
        if (sourceContainer === 'fragment-bank') {
          setAvailableFragments(arrayMove(availableFragments, oldIndex, newIndex))
        } else {
          setConstructedStory(arrayMove(constructedStory, oldIndex, newIndex))
        }
      }
      return
    }

    // Handle moving between containers
    if (over.id === 'story-construction' && sourceContainer === 'fragment-bank') {
      setAvailableFragments(availableFragments.filter((fragment) => fragment.id !== active.id))
      setConstructedStory([...constructedStory, activeFragment])
    } else if (over.id === 'fragment-bank' && sourceContainer === 'story-construction') {
      // Don't allow moving the first fragment back to the bank
      if (constructedStory[0].id === active.id) {
        return
      }
      setConstructedStory(constructedStory.filter((fragment) => fragment.id !== active.id))
      setAvailableFragments([...availableFragments, activeFragment])
    }
  }

  // Handle fragment taps
  const handleFragmentTap = (fragmentId: string, container: 'fragment-bank' | 'story-construction') => {
    const fragment = [...availableFragments, ...constructedStory].find((f) => f.id === fragmentId)
    if (!fragment) return

    if (container === 'fragment-bank') {
      // Move from fragment bank to story construction
      setAvailableFragments(availableFragments.filter((f) => f.id !== fragmentId))
      setConstructedStory([...constructedStory, fragment])
    } else {
      // Don't allow tapping the first fragment to move it back
      if (constructedStory[0].id === fragmentId) {
        return
      }
      // Move from story construction back to fragment bank
      setConstructedStory(constructedStory.filter((f) => f.id !== fragmentId))
      setAvailableFragments([...availableFragments, fragment])
    }
  }

  // Generate contextual feedback based on the current state of the puzzle
  const generateFeedback = (updatedStory: (DraggableWordItem & { isPartiallyCorrect?: boolean })[]) => {
    const correctCount = updatedStory.filter(fragment => fragment.isCorrect).length
    const partiallyCorrectCount = updatedStory.filter(fragment => fragment.isPartiallyCorrect).length
    const totalFragments = updatedStory.length
    
    if (correctCount === 1 && partiallyCorrectCount === 0 && totalFragments > 1) {
      return "Try rearranging the fragments. Only the first fragment is in the right position."
    } else if (correctCount === 1 && partiallyCorrectCount > 0) {
      return `You have ${partiallyCorrectCount} fragment(s) that belong in the story but are in the wrong position.`
    } else if (correctCount > 1) {
      return `Good progress! ${correctCount} out of ${totalFragments} fragments are in the correct position.`
    }
    
    return "Keep trying! Rearrange the fragments to form a coherent story."
  }

  // Check answer
  const checkAnswer = () => {
    // If already correct and showing continue button, proceed to next question
    if (isCorrect && showContinueButton) {
      onCorrect()
      return
    }

    const constructedAnswer = constructedStory.map((fragment) => fragment.content).join(' ')
    const isAnswerCorrect = constructedAnswer.trim() === question.correctAnswer.trim()
    setIsCorrect(isAnswerCorrect)

    if (isAnswerCorrect) {
      setConstructedStory(
        constructedStory.map((fragment) => ({ ...fragment, isCorrect: true }))
      )
      setFeedbackMessage("Perfect! You've arranged the story correctly.")
      
      // Flip the card to show translation
      setTimeout(() => {
        setIsFlipped(true)
        // Show continue button after flip animation completes
        setTimeout(() => {
          setShowContinueButton(true)
        }, 500)
      }, 500)
    } else {
      // Split the correct answer into fragments for comparison
      const correctFragments = question.correctAnswer.split(' ')
      const userFragments = constructedStory.map(fragment => fragment.content)
      
      // Mark individual fragments as correct or incorrect based on their position
      const updatedStory = constructedStory.map((fragment, index) => {
        // First fragment is always correct (we placed it there)
        if (index === 0) {
          return { ...fragment, isCorrect: true }
        }
        
        // Check if this fragment is in the correct position
        const fragmentContent = fragment.content
        const wordsInFragment = fragmentContent.split(' ')
        
        // Get the expected words at this position in the correct answer
        const startIndex = userFragments.slice(0, index).join(' ').split(' ').length
        const expectedWords = correctFragments.slice(startIndex, startIndex + wordsInFragment.length)
        
        // Check if the fragment is in the correct position
        const isFragmentCorrect = wordsInFragment.join(' ') === expectedWords.join(' ')
        
        return { 
          ...fragment, 
          isCorrect: isFragmentCorrect,
          isPartiallyCorrect: !isFragmentCorrect && correctFragments.includes(fragmentContent)
        }
      })
      
      setConstructedStory(updatedStory)
      setFeedbackMessage(generateFeedback(updatedStory))
      setAttemptCount((prev) => prev + 1)
    }
  }

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(null)
  }

  // Handle image load error
  const handleImageError = () => {
    setImageLoaded(false)
    setImageError(`Failed to load image: ${question.imagePath}`)
  }

  // Find active fragment for overlay
  const activeFragment = activeId
    ? [...availableFragments, ...constructedStory].find((fragment) => fragment.id === activeId)
    : null

  return (
    <div className="space-y-6">
      {question.prompt && (
        <div className="text-2xl font-medium text-center mb-8">{question.prompt}</div>
      )}

      {question.imagePath && (
        <div className="mb-8 perspective">
          <div 
            className={cn(
              "relative w-full h-64 max-w-md mx-auto rounded-2xl shadow-lg mb-4 transition-transform duration-700 transform-style-3d",
              isFlipped && "rotate-y-180"
            )}
            style={{ 
              perspective: "1000px",
              transformStyle: "preserve-3d"
            }}
          >
            {/* Front of card (image) */}
            <div 
              className={cn(
                "absolute w-full h-full backface-hidden rounded-2xl overflow-hidden",
                isFlipped && "invisible"
              )}
              style={{ backfaceVisibility: "hidden" }}
            >
              <img 
                src={question.imagePath} 
                alt="Puzzle image"
                className="w-full h-full object-cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
            
            {/* Back of card (translation) */}
            <div 
              className={cn(
                "absolute w-full h-full backface-hidden bg-white rounded-2xl border border-zinc-200 flex items-center justify-center p-6 rounded-2xl rotate-y-180",
                !isFlipped && "invisible"
              )}
              style={{ 
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)"
              }}
            >
              <div className="text-center">
                <p className="text-md font-semibold text-zinc-900 mb-6">
                  {question.correctAnswer}
                </p>
                <p className="text-md text-zinc-400">
                  {question.englishTranslation}
                </p>
              </div>
            </div>
          </div>
          
          {/* Display error message if image fails to load */}
          {imageError && (
            <div className="text-red-500 text-sm text-center">
              {imageError}
            </div>
          )}
        </div>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          <StoryConstruction 
            fragments={constructedStory} 
            activeId={activeId} 
            onFragmentTap={handleFragmentTap}
          />
          <FragmentBank 
            fragments={availableFragments} 
            activeId={activeId} 
            onFragmentTap={handleFragmentTap}
          />
        </div>

        <DragOverlay>
          {activeFragment ? (
            <StoryFragment 
              fragment={activeFragment} 
              isDragging 
              container="fragment-bank"
              onTap={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {feedbackMessage && !isCorrect && (
        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200" role="alert">
          <p className="text-sm text-blue-700">
            {feedbackMessage}
          </p>
        </div>
      )}

      <Button
        className="w-full mt-6"
        size="lg"
        onClick={checkAnswer}
        disabled={constructedStory.length === 0}
      >
        {isCorrect && showContinueButton ? "Continue" : "Check Answer"}
      </Button>
    </div>
  )
} 