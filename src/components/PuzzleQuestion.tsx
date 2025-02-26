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
  DragOverEvent,
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
  const [overFragment, setOverFragment] = useState<string | null>(null)
  const [selectedFragmentId, setSelectedFragmentId] = useState<string | null>(null)

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
    
    // Place all fragments in the constructed story, with first fragment marked as correct
    const [firstFragment, ...remainingFragments] = allFragments
    setConstructedStory([
      { ...firstFragment, isCorrect: true },
      ...remainingFragments
    ])
    setAvailableFragments([])
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
    setOverFragment(null)
  }

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    const overId = over?.id
    if (overId === 'story-construction' || overId === 'fragment-bank' || !overId) {
      setOverFragment(null)
    } else {
      setOverFragment(String(overId))
    }
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setOverFragment(null)

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
      // Only allow moving from bank to story, not the other way around
      if (over.id === 'story-construction' && sourceContainer === 'fragment-bank') {
        setAvailableFragments(availableFragments.filter((fragment) => fragment.id !== active.id))
        setConstructedStory([...constructedStory, activeFragment])
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
      // Prevent moving from story to bank by dropping on a bank fragment
      return
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
    // If we have a selected fragment and it's different from the current one
    if (selectedFragmentId && selectedFragmentId !== fragmentId) {
      const selectedFragment = [...availableFragments, ...constructedStory].find(
        (f) => f.id === selectedFragmentId
      )
      const targetFragment = [...availableFragments, ...constructedStory].find(
        (f) => f.id === fragmentId
      )

      if (!selectedFragment || !targetFragment) {
        setSelectedFragmentId(null)
        return
      }

      // Don't allow swapping with the first fragment in story construction
      if (container === 'story-construction' && constructedStory[0].id === fragmentId) {
        setSelectedFragmentId(null)
        return
      }

      // Handle swapping between containers
      const selectedInBank = availableFragments.some(f => f.id === selectedFragmentId)
      const targetInBank = availableFragments.some(f => f.id === fragmentId)

      if (selectedInBank && targetInBank) {
        // Swap within fragment bank
        const newFragments = [...availableFragments]
        const selectedIndex: number = newFragments.findIndex(f => f.id === selectedFragmentId)
        const targetIndex: number = newFragments.findIndex(f => f.id === fragmentId)
        const temp = newFragments[selectedIndex]
        newFragments[selectedIndex] = newFragments[targetIndex]
        newFragments[targetIndex] = temp
        setAvailableFragments(newFragments)
      } else if (!selectedInBank && !targetInBank) {
        // Swap within story construction
        const newStory = [...constructedStory]
        const selectedIndex: number = newStory.findIndex(f => f.id === selectedFragmentId)
        const targetIndex: number = newStory.findIndex(f => f.id === fragmentId)
        const temp = newStory[selectedIndex]
        newStory[selectedIndex] = newStory[targetIndex]
        newStory[targetIndex] = temp
        setConstructedStory(newStory)
      } else if (selectedInBank && !targetInBank) {
        // Move from bank to story, replacing target
        const selectedFragment = availableFragments.find(f => f.id === selectedFragmentId)!
        const newFragments = availableFragments.filter(f => f.id !== selectedFragmentId)
        const newStory = [...constructedStory]
        const targetIndex: number = newStory.findIndex(f => f.id === fragmentId)
        const replacedFragment = newStory[targetIndex]
        newStory[targetIndex] = selectedFragment
        setAvailableFragments([...newFragments, replacedFragment])
        setConstructedStory(newStory)
      } else if (!selectedInBank && targetInBank) {
        // Move from story to bank, replacing target
        const selectedFragment = constructedStory.find(f => f.id === selectedFragmentId)!
        const newStory = constructedStory.filter(f => f.id !== selectedFragmentId)
        const newFragments = [...availableFragments]
        const targetIndex: number = newFragments.findIndex(f => f.id === fragmentId)
        const replacedFragment = newFragments[targetIndex]
        newFragments[targetIndex] = selectedFragment
        setConstructedStory([...newStory, replacedFragment])
        setAvailableFragments(newFragments)
      }

      setSelectedFragmentId(null)
    } else {
      // If no fragment is selected or the same fragment is tapped again
      setSelectedFragmentId(fragmentId === selectedFragmentId ? null : fragmentId)
    }
  }

  // Generate contextual feedback based on the current state of the puzzle
  const generateFeedback = (correctCount: number, totalFragments: number) => {
    if (correctCount === totalFragments) {
      return "Perfect! You've arranged the story correctly."
    }
    return `${correctCount} out of ${totalFragments} fragments in the correct position.`
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
          // All non-correct fragments are marked as partially correct (yellow)
          isPartiallyCorrect: !isFragmentCorrect
        }
      })
      
      const correctCount = updatedStory.filter(fragment => fragment.isCorrect).length
      setConstructedStory(updatedStory)
      setFeedbackMessage(generateFeedback(correctCount, updatedStory.length))
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
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          <StoryConstruction 
            fragments={constructedStory} 
            activeId={activeId} 
            onFragmentTap={handleFragmentTap}
            overFragment={overFragment}
            selectedFragmentId={selectedFragmentId}
          />
          {availableFragments.length > 0 && (
            <FragmentBank 
              fragments={availableFragments} 
              activeId={activeId} 
              onFragmentTap={handleFragmentTap}
              selectedFragmentId={selectedFragmentId}
            />
          )}
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