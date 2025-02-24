import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Trophy, PointerIcon, X } from 'lucide-react'
import { Module, FlashcardQuestion, ImageFlashcardQuestion, SentenceQuestion } from '../types'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { SentenceCompletionQuestion } from '../components/SentenceCompletionQuestion'
import { cn } from '../lib/utils'

export const ModulePage = () => {
  const { moduleId } = useParams<{ moduleId: string }>()
  const navigate = useNavigate()

  const [module, setModule] = useState<Module | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isModuleCompleted, setIsModuleCompleted] = useState(false)

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const response = await fetch(`/modules/${moduleId}.json`)
        if (!response.ok) {
          throw new Error(`Failed to load module (${response.status})`)
        }
        const data: Module = await response.json()
        setModule(data)
        
        // Check if module is completed
        const completedModules = JSON.parse(localStorage.getItem('completedModules') || '[]')
        setIsModuleCompleted(completedModules.includes(moduleId))
        
        setError(null)
      } catch (error) {
        console.error('Error loading module:', error)
        setError('Failed to load module. Please try again later.')
      }
    }

    fetchModule()
  }, [moduleId])

  const saveProgress = (moduleId: string) => {
    try {
      const completedModules = JSON.parse(localStorage.getItem('completedModules') || '[]')
      if (!completedModules.includes(moduleId)) {
        localStorage.setItem('completedModules', JSON.stringify([...completedModules, moduleId]))
      }
    } catch (error) {
      console.error('Error saving progress:', error)
      // Continue without saving progress
    }
  }

  const handleOptionSelect = (option: string) => {
    if (!module) return
    
    const currentQuestion = module.questions[currentQuestionIndex]
    console.log('Selected option:', option)
    console.log('Current userAnswer:', userAnswer)
    console.log('Current question:', currentQuestion.correctAnswer)
    
    setUserAnswer(option)
    const isAnswerCorrect = option.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
    console.log('Is answer correct?', isAnswerCorrect)
    setIsCorrect(isAnswerCorrect)

    if (isAnswerCorrect) {
      const newCompletedQuestions = [...completedQuestions, currentQuestionIndex]
      setCompletedQuestions(newCompletedQuestions)
      
      if (newCompletedQuestions.length === module.questions.length) {
        setTimeout(() => {
          saveProgress(moduleId!)
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

  // Show error state if module failed to load
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-2xl">
          <div className="p-6">
            <div className="bg-red-50 p-4 rounded-xl text-red-600">
              <p>{error}</p>
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="mt-4"
              >
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state
  if (!module) return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl">
        <div className="p-6 text-center text-muted-foreground">
          Loading...
        </div>
      </div>
    </div>
  )

  const currentQuestion = module.questions[currentQuestionIndex];
  const progress = (completedQuestions.length / module.questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl">
        <div className="p-6 space-y-6">
          {/* Header integrated into the card */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-black">
              {module.title}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className={cn(
                isModuleCompleted 
                  ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  : "text-primary hover:text-primary/80 hover:bg-primary/5"
              )}
              aria-label="Close module"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Progress section */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center text-sm shrink-0",
              isModuleCompleted ? "text-amber-600" : "text-primary"
            )} role="status" aria-label="Question progress">
              <Trophy className="w-4 h-4 mr-1.5" aria-hidden="true" />
              <span className="font-medium">{completedQuestions.length}/{module.questions.length}</span>
            </div>
            <Progress 
              value={progress} 
              className={cn(
                "h-2 flex-1",
                isModuleCompleted 
                  ? "bg-amber-100 [&>[role=progressbar]]:bg-amber-400"
                  : "bg-primary/20 [&>[role=progressbar]]:bg-primary"
              )}
              aria-label="Module progress" 
            />
          </div>

          {/* Question content */}
          <div className="space-y-6">
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
                question={module.questions[currentQuestionIndex] as SentenceQuestion}
                onCorrect={() => {
                  const newCompletedQuestions = [...completedQuestions, currentQuestionIndex]
                  setCompletedQuestions(newCompletedQuestions)
                  
                  if (newCompletedQuestions.length === module.questions.length) {
                    saveProgress(moduleId!)
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
} 