import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PointerIcon, X } from 'lucide-react'
import { Module, FlashcardQuestion, ImageFlashcardQuestion, SentenceQuestion } from '../types'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { SentenceCompletionQuestion } from '../components/SentenceCompletionQuestion'
import { LoadingOverlay, ErrorMessage } from '../components/shared'
import { useApp } from '../contexts/AppContext'

// Cache for module data
const moduleCache = new Map<string, { data: Module; timestamp: number }>()
const MODULE_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const ModulePage = () => {
  const { moduleId } = useParams<{ moduleId: string }>()
  const navigate = useNavigate()
  const { markModuleAsCompleted, completedModules } = useApp()

  const [module, setModule] = useState<Module | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    
    const fetchModule = async () => {
      if (!moduleId) return
      setIsLoading(true)

      try {
        console.log('Fetching module:', moduleId)
        // Check cache first
        const cached = moduleCache.get(moduleId)
        const now = Date.now()
        
        if (cached && (now - cached.timestamp < MODULE_CACHE_DURATION)) {
          console.log('Loading from cache:', cached.data)
          if (isMounted) {
            setModule(cached.data)
            setIsLoading(false)
          }
          return
        }

        console.log('Fetching from server...')
        const response = await fetch(`/modules/${moduleId}.json`)
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`Failed to load module (${response.status})`)
        }
        
        const data: Module = await response.json()
        console.log('Fetched data:', data)
        
        if (!isMounted) return

        // Update cache
        moduleCache.set(moduleId, {
          data,
          timestamp: now
        })
        
        setModule(data)
        setError(null)
      } catch (error) {
        console.error('Error loading module:', error)
        if (isMounted) {
          setError('Failed to load module. Please try again later.')
          // Try to load from cache as fallback
          const cached = moduleCache.get(moduleId)
          if (cached) {
            console.log('Loading from cache after error:', cached.data)
            setModule(cached.data)
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchModule()
    
    return () => {
      isMounted = false
    }
  }, [moduleId])

  const handleOptionSelect = (option: string) => {
    if (!module || !moduleId) return
    
    const currentQuestion = module.questions[currentQuestionIndex]
    setUserAnswer(option)
    const isAnswerCorrect = option.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
    setIsCorrect(isAnswerCorrect)

    if (isAnswerCorrect) {
      const newCompletedQuestions = [...completedQuestions, currentQuestionIndex]
      setCompletedQuestions(newCompletedQuestions)
      
      if (newCompletedQuestions.length === module.questions.length) {
        setTimeout(() => {
          markModuleAsCompleted(moduleId)
          navigate('/')
        }, 500)
      } else {
        setTimeout(() => {
          nextQuestion()
        }, 500)
      }
    }
  }

  const nextQuestion = () => {
    if (!module) return

    setUserAnswer('')
    setIsCorrect(null)
    
    // Find next unanswered question
    let nextIndex = currentQuestionIndex
    do {
      nextIndex = (nextIndex + 1) % module.questions.length
    } while (completedQuestions.includes(nextIndex))
    
    setCurrentQuestionIndex(nextIndex)
  }

  const renderOptions = () => {
    if (!module) return null
    const currentQuestion = module.questions[currentQuestionIndex]
    if (currentQuestion.type !== 'flashcards') return null
    
    return (
      <div className="space-y-3">
        {(currentQuestion as FlashcardQuestion | ImageFlashcardQuestion).options.map((option: string) => (
          <div 
            key={option}
            onClick={() => handleOptionSelect(option)}
            className={`answer-option group cursor-pointer select-none ${
              isCorrect && option === currentQuestion.correctAnswer ? 'correct' :
              isCorrect === false && option === userAnswer ? 'incorrect' :
              userAnswer === option ? 'selected' : ''
            }`}
          >
            <div className="radio-indicator">
              {isCorrect === false && userAnswer === option ? (
                <X 
                  className={`w-5 h-5 text-red-500 pointer-icon is-selected`}
                />
              ) : (
                <PointerIcon 
                  className={`w-5 h-5 text-emerald-600 pointer-icon ${
                    userAnswer === option ? 'is-selected' : ''
                  }`} 
                />
              )}
            </div>
            <label
              htmlFor={option}
              className="option-text text-lg font-medium leading-none cursor-pointer w-full block"
            >
              {option}
            </label>
          </div>
        ))}
      </div>
    );
  };

  const renderQuestion = () => {
    if (!module) return null
    const currentQuestion = module.questions[currentQuestionIndex]

    if (currentQuestion.type === 'flashcards') {
      if ((currentQuestion as ImageFlashcardQuestion).variant === 'image') {
        const imageQuestion = currentQuestion as ImageFlashcardQuestion;
        return (
          <div className="mb-8">
            <img 
              src={imageQuestion.imagePath} 
              alt="What is this?"
              className="w-full max-w-md mx-auto rounded-2xl shadow-lg mb-4"
            />
          </div>
        );
      } else {
        return (
          <p className="text-2xl font-medium mb-8 text-center">
            {(currentQuestion as FlashcardQuestion).prompt}
          </p>
        );
      }
    } else {
      return <div />
    }
  };

  return (
    <LoadingOverlay isLoading={isLoading}>
      {error ? (
        <ErrorMessage 
          message={error} 
          onBack={() => navigate('/')}
          fullScreen
        />
      ) : !module ? (
        <ErrorMessage 
          message="Failed to load module. Please try again." 
          onBack={() => navigate('/')}
          fullScreen
        />
      ) : (() => {
        const currentQuestion = module.questions[currentQuestionIndex];
        const progress = (completedQuestions.length / module.questions.length) * 100;
        
        return (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <Button
                    onClick={() => navigate('/')}
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Progress value={progress} className="w-32" />
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {module.type === 'flashcards' ? (
                    <>
                      {renderQuestion()}
                      {renderOptions()}
                      <Button
                        className="w-full mt-6 hidden md:block"
                        size="lg"
                        variant={isCorrect ? "secondary" : "default"}
                        onClick={() => handleOptionSelect(userAnswer)}
                        disabled={!userAnswer}
                        aria-label="Check your answer"
                      >
                        Check Answer
                      </Button>
                    </>
                  ) : (
                    <SentenceCompletionQuestion
                      question={currentQuestion as SentenceQuestion}
                      onCorrect={() => {
                        const newCompletedQuestions = [...completedQuestions, currentQuestionIndex]
                        setCompletedQuestions(newCompletedQuestions)
                        
                        if (newCompletedQuestions.length === module.questions.length) {
                          markModuleAsCompleted(moduleId!)
                          navigate('/')
                        } else {
                          nextQuestion()
                        }
                      }}
                    />
                  )}

                  {(currentQuestion as SentenceQuestion).hint && !isCorrect && (
                    <div className="mt-4 p-4 bg-primary/5 rounded-xl" role="alert">
                      <p className="text-sm text-primary/80">
                        💡 Hint: {(currentQuestion as SentenceQuestion).hint}
                      </p>
                    </div>
                  )}

                  {isCorrect === false && (
                    <div className="mt-4 p-4 bg-red-50 rounded-xl" role="alert" aria-live="polite">
                      <p className="text-sm text-red-600">
                        Try again! The correct answer is: {currentQuestion.correctAnswer}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </LoadingOverlay>
  )
} 