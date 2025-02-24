import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  FileType, 
  Type, 
  Bird, 
  Apple, 
  Coffee, 
  MessageSquare, 
  Hash, 
  Play,
  ArrowRight
} from 'lucide-react'
import { ModuleManifest } from '../types'
import { cn } from '../lib/utils'

// Icon mapping for different module categories
const MODULE_ICONS = {
  'animals-1': Bird,
  'food-1': Apple,
  'food-2': Coffee,
  'greetings': MessageSquare,
  'numbers-1': Hash,
  'phrases-1': Type,
  'verbs-1': Play,
  'verbs-2': Play,
  default: FileType
} as const

// Helper function to determine module icon and style
const getModuleIcon = (moduleId: string, isCompleted: boolean) => {
  const IconComponent = MODULE_ICONS[moduleId as keyof typeof MODULE_ICONS] || MODULE_ICONS.default
  return (
    <div className={cn(
      "w-[38px] h-[38px] rounded-xl flex items-center justify-center shrink-0 relative pb-[3px]",
      isCompleted ? cn(
        "bg-amber-400 shadow-[0_3px_0_rgba(217,119,6,1)]",
        // First diagonal line (16-20 to 1-5)
        "before:absolute before:w-[4px] before:h-[200%] before:bg-white/25 before:rotate-[20deg] before:top-[-50%] before:left-[30%]",
        // Second diagonal line (22-24 to 7-9)
        "after:absolute after:w-[2px] after:h-[200%] after:bg-white/25 after:rotate-[20deg] after:top-[-50%] after:left-[50%]"
      ) : "bg-secondary"
    )}>
      <IconComponent 
        className={cn(
          "w-[18px] h-[18px] relative z-10",
          isCompleted ? "text-amber-600" : "text-foreground"
        )} 
        strokeWidth={2} 
        absoluteStrokeWidth 
      />
    </div>
  )
}

export const HomePage = () => {
  const [modules, setModules] = useState<ModuleManifest['modules']>([])
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch('/modules/manifest.json')
        if (!response.ok) {
          throw new Error(`Failed to load modules (${response.status})`)
        }
        const data: ModuleManifest = await response.json()
        setModules(data.modules)
        
        // Load completed modules from localStorage
        try {
          const completed = JSON.parse(localStorage.getItem('completedModules') || '[]')
          setCompletedModules(completed)
        } catch (storageError) {
          console.error('Error loading progress:', storageError)
          // Continue with empty completed modules
          setCompletedModules([])
        }
      } catch (error) {
        console.error('Error loading modules:', error)
        setError('Failed to load modules. Please try again later.')
      }
    }

    fetchModules()
  }, [])

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 text-primary font-bold mb-4">
            </div>
            <img 
              src="/images/logo.svg" 
              alt="Lekker Learning"
              className="h-16 mx-auto animate-fade-up"
            />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Master Afrikaans through playful flashcards and interactive exercises!
            </p>
          </div>

          {error && (
            <div className="bg-red-50 p-4 rounded-xl text-red-600 mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((module) => {
              const isCompleted = completedModules.includes(module.id)
              return (
                <Link 
                  key={module.id} 
                  to={`/module/${module.id}`}
                  className="block"
                >
                  <div className={cn(
                    "bg-white rounded-[24px] p-6 shadow-sm border transition-colors group",
                    isCompleted 
                      ? "border-border hover:border-amber-300" 
                      : "border-border hover:border-gray-300"
                  )}>
                    <div className="space-y-4 min-w-0">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          {getModuleIcon(module.id, isCompleted)}
                          <h3 className="text-xl font-semibold">
                            {module.title}
                          </h3>
                        </div>
                        <p className="text-md text-muted-foreground">
                          {module.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-black font-semibold text-foreground tracking-wide">
                          {module.type === 'flashcards' ? 'Flashcards' : 'Sentence Completion'}
                        </span>
                        <div className={cn(
                          "text-primary font-medium flex items-center gap-2",
                          isCompleted && "text-amber-600"
                        )}>
                          {isCompleted ? 'Review' : 'Start Learning'}
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="text-center">
            <div className="inline-block p-3 rounded-xl bg-secondary">
              <p className="text-sm font-medium text-muted-foreground">
                {completedModules.length === 0 
                  ? "Start your learning journey by completing a module! 🎉"
                  : completedModules.length === modules.length
                    ? "Congratulations! You've completed all modules! 🎉"
                    : "Keep practicing to unlock more exciting modules! 🎉"
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 