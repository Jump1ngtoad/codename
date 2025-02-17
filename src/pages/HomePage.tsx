import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ModuleManifest } from '../types'
import { Trophy, BookOpen } from 'lucide-react'

export const HomePage = () => {
  const [modules, setModules] = useState<ModuleManifest['modules']>([])

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch('/modules/manifest.json')
        const data: ModuleManifest = await response.json()
        setModules(data.modules)
      } catch (error) {
        console.error('Error loading modules:', error)
      }
    }

    fetchModules()
  }, [])

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-primary">
            Lekker Learning
          </h1>
          <p className="text-xl text-gray-600">
            Learn Afrikaans the fun way!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module) => (
            <Link 
              key={module.id} 
              to={`/module/${module.id}`}
              className="block group"
            >
              <div className="module-card group-hover:border-primary/20">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-primary">
                      {module.title}
                    </h3>
                    <p className="text-gray-600">
                      {module.description}
                    </p>
                  </div>
                  <div className="text-primary/80">
                    {module.type === 'flashcards' ? (
                      <Trophy className="w-6 h-6" />
                    ) : (
                      <BookOpen className="w-6 h-6" />
                    )}
                  </div>
                </div>
                <div className="flex items-center text-sm font-medium text-primary/60">
                  {module.type === 'flashcards' ? 'Flashcards' : 'Sentence Completion'}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Keep practicing to unlock more modules!</p>
        </div>
      </div>
    </div>
  )
} 