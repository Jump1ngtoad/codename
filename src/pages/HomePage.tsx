import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ModuleManifest } from '../types'
import { FileType, FileImage, Type, Sparkles, Trophy } from 'lucide-react'

export const HomePage = () => {
  const [modules, setModules] = useState<ModuleManifest['modules']>([])
  const [completedModules, setCompletedModules] = useState<string[]>([])

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch('/modules/manifest.json')
        const data: ModuleManifest = await response.json()
        setModules(data.modules)
        
        // Load completed modules from localStorage
        const completed = JSON.parse(localStorage.getItem('completedModules') || '[]')
        setCompletedModules(completed)
      } catch (error) {
        console.error('Error loading modules:', error)
      }
    }

    fetchModules()
  }, [])

  // Helper function to determine module icon and style
  const getModuleIcon = (module: ModuleManifest['modules'][0]) => {
    // Base classes for consistent icon containers - 24px icon + 8px padding on each side = 40px total
    const baseIconClasses = "w-[40px] h-[40px] rounded-xl p-2 flex items-center justify-center"
    // Common icon properties - 24px size with 1.5px stroke
    const iconProps = {
      className: "w-6 h-6", // w-6 = 24px
      strokeWidth: 1.5,
      absoluteStrokeWidth: true
    }
    
    // Check if it's an image-based flashcard module
    const isImageModule = module.id.startsWith('food-') || module.id.startsWith('animals-')
    
    if (module.type === 'sentence-completion') {
      return (
        <div className={`${baseIconClasses} bg-rose-500 text-white`}>
          <Type {...iconProps} />
        </div>
      )
    }
    
    if (isImageModule) {
      return (
        <div className={`${baseIconClasses} bg-blue-500 text-white`}>
          <FileImage {...iconProps} />
        </div>
      )
    }
    
    return (
      <div className={`${baseIconClasses} bg-emerald-500 text-white`}>
        <FileType {...iconProps} />
      </div>
    )
  }

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((module) => {
              const isCompleted = completedModules.includes(module.id);
              return (
                <Link 
                  key={module.id} 
                  to={`/module/${module.id}`}
                  className="block group"
                >
                  <div className={`module-card relative ${isCompleted ? 'bg-secondary' : ''}`}>
                    {isCompleted && (
                      <div className="absolute -top-2 -right-2 bg-amber-400 text-white rounded-full p-1.5" aria-label="Module completed">
                        <Trophy className="w-4 h-4" aria-hidden="true" />
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-4 gap-6">
                      <div className="space-y-1.5">
                        <h3 className="text-xl font-bold">
                          {module.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {module.description}
                        </p>
                      </div>
                      {getModuleIcon(module)}
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      <span className="text-muted-foreground uppercase tracking-wide text-xs" role="status">
                        {isCompleted ? 'Completed' : module.type === 'flashcards' ? 'Flashcards' : 'Sentence Completion'}
                      </span>
                      <span className="ml-auto text-primary group-hover:translate-x-1 transition-transform">
                        {isCompleted ? 'Practice Again' : 'Start Learning'} →
                      </span>
                    </div>
                  </div>
                </Link>
              );
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