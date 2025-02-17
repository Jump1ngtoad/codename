import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, ArrowLeft, Trophy } from 'lucide-react'
import { Module, FlashcardQuestion, ImageFlashcardQuestion, SentenceQuestion } from '../types'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'

export const ModulePage = () => {
  const { moduleId } = useParams<{ moduleId: string }>()
  const navigate = useNavigate()

  const [module, setModule] = useState<Module | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([])
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const response = await fetch(`/modules/${moduleId}.json`)
        const data: Module = await response.json()
        setModule(data)
      } catch (error) {
        console.error('Error loading module:', error)
        navigate('/')
      }
    }

    fetchModule()
  }, [moduleId, navigate])

  const handleAnswer = () => {
    if (!module) return

    const question = module.questions[currentQuestionIndex]
    const isAnswerCorrect = userAnswer.toLowerCase() === question.correctAnswer.toLowerCase()
    setIsCorrect(isAnswerCorrect)
    setShowFeedback(true)

    if (isAnswerCorrect) {
      setCompletedQuestions((prev) => [...prev, currentQuestionIndex])
    }
  }

  const nextQuestion = () => {
    setUserAnswer('')
    setIsCorrect(null)
    setShowFeedback(false)
    
    // If all questions are completed, mark module as done
    if (completedQuestions.length === module?.questions.length) {
      const completedModules = JSON.parse(localStorage.getItem('completedModules') || '[]')
      if (!completedModules.includes(moduleId)) {
        localStorage.setItem('completedModules', JSON.stringify([...completedModules, moduleId]))
      }
      navigate('/')
      return
    }

    // Find next unanswered question
    let nextIndex = currentQuestionIndex
    do {
      nextIndex = (nextIndex + 1) % module!.questions.length
    } while (completedQuestions.includes(nextIndex))
    
    setCurrentQuestionIndex(nextIndex)
  }

  const renderOptions = () => {
    if (currentQuestion.type !== 'flashcards') return null;
    
    return (
      <RadioGroup
        value={userAnswer}
        onValueChange={setUserAnswer}
        className="space-y-3"
        disabled={showFeedback}
      >
        {(currentQuestion as FlashcardQuestion | ImageFlashcardQuestion).options.map((option: string) => (
          <div 
            key={option} 
            className={`answer-option ${
              showFeedback && option === currentQuestion.correctAnswer ? 'correct' :
              showFeedback && option === userAnswer ? 'incorrect' :
              userAnswer === option ? 'selected' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value={option} id={option} />
              <label
                htmlFor={option}
                className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option}
              </label>
            </div>
          </div>
        ))}
      </RadioGroup>
    );
  };

  const renderQuestion = () => {
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

  if (!module) return null;

  const currentQuestion = module.questions[currentQuestionIndex];
  const progress = (completedQuestions.length / module.questions.length) * 100;

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Modules
          </Button>
          <div className="flex items-center text-primary">
            <Trophy className="w-5 h-5 mr-2" />
            <span className="font-medium">{completedQuestions.length}/{module.questions.length}</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-2 text-primary">
            {module.title}
          </h1>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="question-card">
          {renderQuestion()}

          {module.type === 'flashcards' ? (
            renderOptions()
          ) : (
            <input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full px-4 py-3 text-lg border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={showFeedback}
            />
          )}

          {(currentQuestion as SentenceQuestion).hint && !showFeedback && (
            <div className="mt-4 p-4 bg-primary/5 rounded-xl">
              <p className="text-sm text-primary/80">
                💡 Hint: {(currentQuestion as SentenceQuestion).hint}
              </p>
            </div>
          )}

          {showFeedback && !isCorrect && (
            <div className="mt-4 p-4 bg-red-50 rounded-xl">
              <p className="text-sm text-red-600">
                Correct answer: {currentQuestion.correctAnswer}
              </p>
            </div>
          )}

          <Button
            className="w-full mt-6"
            size="lg"
            variant={isCorrect ? "secondary" : "default"}
            onClick={isCorrect ? nextQuestion : handleAnswer}
            disabled={!userAnswer}
          >
            {isCorrect ? 'Next Question' : 'Check Answer'}
          </Button>
        </div>
      </div>
    </div>
  )
} 