import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  FileType, 
  FileImage, 
  Type, 
  Bird, 
  Apple, 
  Coffee, 
  MessageSquare, 
  Hash, 
  Play,
  ArrowLeft
} from 'lucide-react'
import { ModuleManifest } from '../types'

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
const getModuleIcon = (moduleId: string) => {
  const IconComponent = MODULE_ICONS[moduleId as keyof typeof MODULE_ICONS] || MODULE_ICONS.default
  return (
    <div className="w-[38px] h-[38px] bg-secondary rounded-xl flex items-center justify-center shrink-0">
      <IconComponent className="w-[18px] h-[18px]" strokeWidth={1.5} absoluteStrokeWidth />
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
              className="h-16 mx-auto"
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
                  <div className="bg-white rounded-[24px] p-8 shadow-sm border border-border hover:border-gray-300 transition-colors">
                    <div className="space-y-4 min-w-0">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          {getModuleIcon(module.id)}
                          <h3 className="text-2xl font-semibold">
                            {module.title}
                          </h3>
                        </div>
                        <p className="text-muted-foreground">
                          {module.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-medium text-foreground tracking-wide">
                          {module.type === 'flashcards' ? 'Flashcards' : 'Sentence Completion'}
                        </span>
                        <div className="text-primary font-medium flex items-center gap-2 group">
                          Start Learning
                          <span className="transition-transform group-hover:translate-x-1">→</span>
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