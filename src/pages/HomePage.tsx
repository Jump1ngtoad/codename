import { Link } from 'react-router-dom'
import { 
  ArrowRight,
  Search,
  Trophy,
  Turtle,
  Rabbit,
  Book,
  BookImage,
  BookA,
  BookHeart,
  Brain
} from 'lucide-react'
import { useApp } from '../contexts/hooks'
import { ErrorMessage, ModuleSkeletonGrid } from '../components/shared'
import { cn } from '../lib/utils'
import { useState, useMemo } from 'react'

// Define a type for Lucide icon components
type LucideIconComponent = React.ComponentType<React.SVGAttributes<SVGElement>>;

// Icon mapping for different module types
const MODULE_ICONS: Record<string, LucideIconComponent> = {
  'flashcards': BookImage,
  'sentence-completion': BookA,
  'puzzle': BookHeart,
  default: Book
} as const

// Helper function to determine module icon and style
const getModuleIcon = (moduleType: string, isCompleted: boolean) => {
  const IconComponent = MODULE_ICONS[moduleType as keyof typeof MODULE_ICONS] || MODULE_ICONS.default
  return (
    <div className={cn(
      "w-[38px] h-[38px] rounded-xl flex items-center justify-center shrink-0 relative",
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
      />
    </div>
  )
}

export const HomePage = () => {
  const { modules, completedModules, isLoading, error } = useApp()
  
  // Toolbar state
  const [showCompleted, setShowCompleted] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [moduleType, setModuleType] = useState<
    'all' | 'cards' | 'words' | 'puzzle'
  >('all')
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'hard'>('all')

  // Filter modules based on selected type, difficulty, and search query
  const filteredModules = useMemo(() => {
    let filtered = modules

    // Filter by module type
    if (moduleType !== 'all') {
      if (moduleType === 'cards') {
        filtered = filtered.filter(m => m.type === 'flashcards')
      } else if (moduleType === 'words') {
        filtered = filtered.filter(m => m.type === 'sentence-completion')
      } else if (moduleType === 'puzzle') {
        filtered = filtered.filter(m => m.type === 'puzzle')
      }
    }

    // Filter by difficulty
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(m => m.difficulty === difficultyFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        m =>
          m.title.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query)
      )
    }

    // Filter by completion status
    if (!showCompleted) {
      filtered = filtered.filter(m => !completedModules.includes(m.id))
    }

    return filtered
  }, [modules, moduleType, difficultyFilter, searchQuery, showCompleted, completedModules])

  console.log('HomePage Debug:', {
    modulesLength: modules?.length,
    modules,
    isLoading,
    error
  })

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
              className="h-14 mx-auto animate-fade-up"
            />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Learn Afrikaans through playful interactive exercises!
            </p>
          </div>

          {error && (
            <ErrorMessage message={error} />
          )}

          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between p-3 bg-white rounded-lg border border-zinc-200">
            {/* Search input - Full width on mobile */}
            <div className="relative w-full sm:w-[400px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search modules..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-100 rounded-sm focus:outline-none focus:ring-2 ring-primary/20"
              />
            </div>

            {/* Filter actions - Row on mobile, inline on desktop */}
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => setShowCompleted(prev => !prev)}
                className={cn(
                  "inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-sm transition-all relative",
                  showCompleted 
                    ? cn(
                        "bg-amber-400 text-amber-600 shadow-[0_3px_0_#D97706]",
                        // First diagonal line (16-20 to 1-5)
                        "before:absolute before:w-[4px] before:h-[200%] before:bg-white/25 before:rotate-[20deg] before:top-[-50%] before:left-[25%]",
                        // Second diagonal line (22-24 to 7-9)
                        "after:absolute after:w-[2px] after:h-[200%] after:bg-white/25 after:rotate-[20deg] after:top-[-50%] after:left-[35%]"
                      )
                    : "bg-zinc-200 text-zinc-500 shadow-[0_3px_0_#a1a1aa]"
                )}
              >
                <Trophy className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{showCompleted ? 'Hide' : 'Show'}</span>
              </button>

              <button 
                onClick={() => setModuleType(current => {
                  switch (current) {
                    case 'all': return 'cards'
                    case 'cards': return 'words'
                    case 'words': return 'puzzle'
                    case 'puzzle': return 'all'
                  }
                })}
                className={cn(
                  "inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-sm transition-all shadow-[0_3px_0_#a1a1aa]",
                  moduleType !== 'all' 
                    ? "bg-zinc-200 text-zinc-500" 
                    : "bg-zinc-200 text-zinc-500"
                )}
              >
                {moduleType === 'cards' ? (
                  <BookImage className="w-4 h-4" />
                ) : moduleType === 'words' ? (
                  <BookA className="w-4 h-4" />
                ) : moduleType === 'puzzle' ? (
                  <BookHeart className="w-4 h-4" />
                ) : (
                  <Book className="w-4 h-4" />
                )}
                <span>{moduleType === 'all' ? 'All' : 
                  moduleType === 'cards' ? 'Cards' : 
                  moduleType === 'words' ? 'Words' : 'Puzzle'}</span>
              </button>

              <button 
                onClick={() => setDifficultyFilter(current => {
                  switch (current) {
                    case 'all': return 'easy'
                    case 'easy': return 'hard'
                    case 'hard': return 'all'
                  }
                })}
                className={cn(
                  "inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-sm transition-all shadow-[0_3px_0_#a1a1aa]",
                  difficultyFilter !== 'all' 
                    ? "bg-zinc-200 text-zinc-500" 
                    : "bg-zinc-200 text-zinc-500"
                )}
              >
                {difficultyFilter === 'easy' ? (
                  <Turtle className="w-4 h-4" />
                ) : difficultyFilter === 'hard' ? (
                  <Rabbit className="w-4 h-4" />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
                <span>{difficultyFilter === 'all' ? 'All' : 
                  difficultyFilter === 'easy' ? 'Easy' : 'Hard'}</span>
              </button>

              <button
                onClick={() => {
                  setSearchQuery('')
                  setModuleType('all')
                  setDifficultyFilter('all')
                  setShowCompleted(true)
                }}
                disabled={!searchQuery && moduleType === 'all' && difficultyFilter === 'all' && showCompleted}
                className={cn(
                  "text-sm transition-colors",
                  searchQuery || moduleType !== 'all' || difficultyFilter !== 'all' || !showCompleted
                    ? "text-red-500 hover:text-red-600"
                    : "text-gray-300 cursor-not-allowed"
                )}
              >
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <ModuleSkeletonGrid />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredModules.map((module) => {
                const isCompleted = completedModules.includes(module.id)
                console.log('Rendering module:', {
                  id: module.id,
                  title: module.title,
                  isCompleted
                })
                return (
                  <Link 
                    key={module.id} 
                    to={`/module/${module.id}`}
                    className="block transition-all duration-300 animate-in fade-in-0 zoom-in-95 hover:scale-[1.02] motion-reduce:hover:scale-100"
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
                            {getModuleIcon(module.type, isCompleted)}
                            <h3 className="text-xl font-semibold text-zinc-900">
                              {module.title}
                            </h3>
                          </div>
                          <p className="text-md text-zinc-600">
                            {module.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {module.difficulty === 'hard' ? (
                              <Rabbit className="w-4 h-4 text-zinc-400" />
                            ) : module.difficulty === 'easy' ? (
                              <Turtle className="w-4 h-4 text-zinc-400" />
                            ) : (
                              <Brain className="w-4 h-4 text-zinc-400" />
                            )}
                            <span className="text-black font-semibold text-foreground tracking-wide">
                              {module.type === 'flashcards' ? 'Cards' : 
                               module.type === 'sentence-completion' ? 'Words' : 'Puzzle'}
                            </span>
                          </div>
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
          )}

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