import { useState, useEffect, useCallback } from 'react'
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
import { RefreshCw } from 'lucide-react'

interface PuzzleQuestionProps {
  question: PuzzleQuestionType
  onCorrect: () => void
}

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="w-full h-64 bg-zinc-200 rounded-2xl" />
  </div>
)

// Image preloader function
const preloadImage = (imagePath: string): Promise<void> => {
  if (!imagePath) return Promise.resolve()
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject()
    img.src = imagePath
  })
}

export function PuzzleQuestion({
  question,
  onCorrect,
}: PuzzleQuestionProps) {
  // Initialize state
  const [availableFragments, setAvailableFragments] = useState<DraggableWordItem[]>([])
  const [constructedStory, setConstructedStory] = useState<DraggableWordItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showContinueButton, setShowContinueButton] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

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

  // Handle image load success
  const handleImageLoad = useCallback(() => {
    console.log('PuzzleQuestion: Image loaded successfully')
    setIsImageLoading(false)
    setImageError(null)
  }, [])

  // Handle image load error
  const handleImageError = useCallback(() => {
    console.log('PuzzleQuestion: Image failed to load:', question.imagePath)
    setIsImageLoading(false)
    setImageError(`Failed to load image: ${question.imagePath}`)
  }, [question.imagePath])

  // Initialize available fragments and place the first fragment in the correct position
  useEffect(() => {
    console.log('PuzzleQuestion: Initializing with question:', question)
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
    setIsCorrect(false)
    setFeedbackMessage(null)
    setIsFlipped(false)
    setShowContinueButton(false)
    setImageError(null)
    setIsImageLoading(true)
    setRetryCount(0)
  }, [question])

  // Preload image when question changes
  useEffect(() => {
    if (!question.imagePath) return

    const preload = async () => {
      try {
        if (question.imagePath) {
          await preloadImage(question.imagePath)
          handleImageLoad()
        }
      } catch (err) {
        console.error('Failed to preload image:', err)
        handleImageError()
      }
    }

    preload()
  }, [question.imagePath, handleImageLoad, handleImageError])

  // Handle image retry
  const retryLoadImage = () => {
    if (retryCount >= 3) {
      setImageError('Maximum retry attempts reached. Please check your connection.')
      return
    }

    if (!question.imagePath) {
      setImageError('No image path provided.')
      return
    }

    setIsImageLoading(true)
    setImageError(null)
    setRetryCount(prev => prev + 1)
    
    preloadImage(question.imagePath)
      .then(handleImageLoad)
      .catch(handleImageError)
  }

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

    // Don't allow moving the first fragment
    if (sourceContainer === 'story-construction' && constructedStory[0].id === active.id) {
      return
    }

    // Handle dropping onto a container (not a fragment)
    if (over.id === 'fragment-bank' || over.id === 'story-construction') {
      // Moving between containers
      if (over.id === 'story-construction' && sourceContainer === 'fragment-bank') {
        setAvailableFragments(availableFragments.filter((fragment) => fragment.id !== active.id))
        setConstructedStory([...constructedStory, activeFragment])
      } else if (over.id === 'fragment-bank' && sourceContainer === 'story-construction') {
        setConstructedStory(constructedStory.filter((fragment) => fragment.id !== active.id))
        setAvailableFragments([...availableFragments, activeFragment])
      }
      return
    }

    // At this point, we're dropping onto another fragment
    
    // Find which container the target fragment is in
    const isOverFragmentInBank = availableFragments.some(f => f.id === over.id)
    const isOverFragmentInStory = constructedStory.some(f => f.id === over.id)
    
    if (isOverFragmentInBank && sourceContainer === 'fragment-bank') {
      // Reordering within fragment bank
      const oldIndex = availableFragments.findIndex((fragment) => fragment.id === active.id)
      const newIndex = availableFragments.findIndex((fragment) => fragment.id === over.id)
      
      const newOrder = arrayMove(availableFragments, oldIndex, newIndex)
      setAvailableFragments(newOrder)
    } else if (isOverFragmentInStory && sourceContainer === 'story-construction') {
      // Reordering within story construction
      const oldIndex = constructedStory.findIndex((fragment) => fragment.id === active.id)
      const newIndex = constructedStory.findIndex((fragment) => fragment.id === over.id)
      
      // Don't allow moving fragments before the first fragment
      if (newIndex === 0) {
        return
      }
      
      const newOrder = arrayMove(constructedStory, oldIndex, newIndex)
      setConstructedStory(newOrder)
    } else if (isOverFragmentInBank && sourceContainer === 'story-construction') {
      // Moving from story to fragment bank, placing before a specific fragment
      const newIndex = availableFragments.findIndex((fragment) => fragment.id === over.id)
      const filteredStory = constructedStory.filter((fragment) => fragment.id !== active.id)
      const newFragmentBank = [...availableFragments]
      newFragmentBank.splice(newIndex, 0, activeFragment)
      
      setConstructedStory(filteredStory)
      setAvailableFragments(newFragmentBank)
    } else if (isOverFragmentInStory && sourceContainer === 'fragment-bank') {
      // Moving from fragment bank to story, placing before a specific fragment
      const newIndex = constructedStory.findIndex((fragment) => fragment.id === over.id)
      
      // Don't allow placing fragments before the first fragment
      if (newIndex === 0) {
        setAvailableFragments(availableFragments.filter((fragment) => fragment.id !== active.id))
        setConstructedStory([...constructedStory, activeFragment])
        return
      }
      
      const filteredFragmentBank = availableFragments.filter((fragment) => fragment.id !== active.id)
      const newStory = [...constructedStory]
      newStory.splice(newIndex, 0, activeFragment)
      
      setAvailableFragments(filteredFragmentBank)
      setConstructedStory(newStory)
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
    }
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
              {isImageLoading ? (
                <LoadingSkeleton />
              ) : (
                <img 
                  src={question.imagePath} 
                  alt="Puzzle image"
                  className="w-full h-full object-cover transition-opacity duration-300"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}
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
          
          {/* Display error message with retry button if image fails to load */}
          {imageError && !isImageLoading && (
            <div className="text-center space-y-2">
              <div className="text-red-500 text-sm">
                {imageError}
              </div>
              {retryCount < 3 && (
                <button
                  onClick={retryLoadImage}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry loading image
                </button>
              )}
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