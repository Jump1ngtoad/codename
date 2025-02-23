import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy, PointerIcon, X } from 'lucide-react'
import { Module, FlashcardQuestion, ImageFlashcardQuestion, SentenceQuestion } from '../types'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { RadioGroup } from '../components/ui/radio-group'

export const ModulePage = () => {
  const { moduleId } = useParams<{ moduleId: string }>()
  const navigate = useNavigate()

  const [module, setModule] = useState<Module | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const response = await fetch(`/modules/${moduleId}.json`)
        if (!response.ok) {
          throw new Error(`Failed to load module (${response.status})`)
        }
        const data: Module = await response.json()
        setModule(data)
        setError(null)
      } catch (error) {
        console.error('Error loading module:', error)
        setError('Failed to load module. Please try again later.')
        // Don't navigate away immediately, show error state instead
      }
    }

    fetchModule()
  }, [moduleId, navigate])

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
      return (
        <p className="text-2xl font-medium mb-8 text-center">
          {currentQuestion.prompt}
        </p>
      );
    }
  };

  // Show error state if module failed to load
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
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
    )
  }

  // Show loading state or return null if no module
  if (!module) return (
    <div className="container mx-auto py-8 px-4 text-center text-muted-foreground">
      Loading...
    </div>
  )

  const currentQuestion = module.questions[currentQuestionIndex];
  const progress = (completedQuestions.length / module.questions.length) * 100;

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="text-primary"
                aria-label="Return to modules list"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </Button>
              <h1 className="text-2xl font-medium text-black">
                {module.title}
              </h1>
            </div>
            <div className="flex items-center text-primary" role="status" aria-label="Question progress">
              <Trophy className="w-5 h-5 mr-2" aria-hidden="true" />
              <span className="font-medium">{completedQuestions.length}/{module.questions.length}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" aria-label="Module progress" />
        </div>

        <div className="question-card">
          {renderQuestion()}

          {module.type === 'flashcards' ? (
            renderOptions()
          ) : (
            <>
              <input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => {
                  // Submit on Enter key
                  if (e.key === 'Enter' && userAnswer) {
                    handleOptionSelect(userAnswer)
                  }
                }}
                placeholder="Type your answer..."
                className="w-full px-4 py-3 text-lg border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label="Answer input"
              />
              <Button
                className="w-full mt-6"
                size="lg"
                variant={isCorrect ? "secondary" : "default"}
                onClick={() => handleOptionSelect(userAnswer)}
                disabled={!userAnswer}
                aria-label="Check your answer"
              >
                Check Answer
              </Button>
            </>
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

          {/* Only show the Check Answer button for flashcards on desktop */}
          {module.type === 'flashcards' && (
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
          )}
        </div>
      </div>
    </div>
  )
} 