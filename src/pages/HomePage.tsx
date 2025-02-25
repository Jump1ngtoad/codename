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
  ArrowRight,
  Search,
  Trophy,
  Turtle,
  Rabbit,
  Book,
  BookImage,
  BookA,
  Brain
} from 'lucide-react'
import { useApp } from '../contexts/hooks'
import { ErrorMessage, ModuleSkeletonGrid } from '../components/shared'
import { cn } from '../lib/utils'
import { useState, useMemo } from 'react'

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
  const { modules, completedModules, isLoading, error } = useApp()
  
  // Toolbar state
  const [showCompleted, setShowCompleted] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [moduleType, setModuleType] = useState<'all' | 'flashcards' | 'sentence-completion'>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'hard'>('all')

  // Filter modules
  const filteredModules = useMemo(() => {
    return modules
      .filter(module => {
        // Filter by completion status
        if (!showCompleted && completedModules.includes(module.id)) {
          return false
        }
        
        // Filter by type
        if (moduleType !== 'all' && module.type !== moduleType) {
          return false
        }

        // Filter by difficulty
        if (difficultyFilter !== 'all' && module.difficulty !== difficultyFilter) {
          return false
        }
        
        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          return (
            module.title.toLowerCase().includes(query) ||
            module.description.toLowerCase().includes(query)
          )
        }
        
        return true
      })
  }, [modules, completedModules, showCompleted, moduleType, searchQuery, difficultyFilter])

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
              className="h-20 mx-auto animate-fade-up"
            />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Master Afrikaans through playful flashcards and interactive exercises!
            </p>
          </div>

          {error && (
            <ErrorMessage message={error} />
          )}

          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between p-4 bg-white rounded-xl border shadow-sm">
            {/* Search input - Full width on mobile */}
            <div className="relative w-full sm:w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search modules..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1 text-sm bg-secondary rounded-lg focus:outline-none focus:ring-2 ring-primary/20"
              />
            </div>

            {/* Filter actions - Row on mobile, inline on desktop */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button 
                onClick={() => setShowCompleted(prev => !prev)}
                className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <Trophy className="w-4 h-4" />
                <span>{showCompleted ? 'Hide' : 'Show'}</span>
              </button>

              <button 
                onClick={() => setModuleType(current => {
                  switch (current) {
                    case 'all': return 'flashcards'
                    case 'flashcards': return 'sentence-completion'
                    case 'sentence-completion': return 'all'
                  }
                })}
                className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                {moduleType === 'flashcards' ? (
                  <BookImage className="w-4 h-4" />
                ) : moduleType === 'sentence-completion' ? (
                  <BookA className="w-4 h-4" />
                ) : (
                  <Book className="w-4 h-4" />
                )}
                <span>{moduleType === 'all' ? 'All' : 
                  moduleType === 'flashcards' ? 'Cards' : 'Sentence'}</span>
              </button>

              <button 
                onClick={() => setDifficultyFilter(current => {
                  switch (current) {
                    case 'all': return 'easy'
                    case 'easy': return 'hard'
                    case 'hard': return 'all'
                  }
                })}
                className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
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

              {(searchQuery || moduleType !== 'all' || difficultyFilter !== 'all' || !showCompleted) && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setModuleType('all')
                    setDifficultyFilter('all')
                    setShowCompleted(true)
                  }}
                  className="text-sm text-red-500 hover:text-red-600 transition-colors"
                >
                  <span>Clear All</span>
                </button>
              )}
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
                            {getModuleIcon(module.id, isCompleted)}
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
                            ) : (
                              <Turtle className="w-4 h-4 text-zinc-400" />
                            )}
                            <span className="text-black font-semibold text-foreground tracking-wide">
                              {module.type === 'flashcards' ? 'Flashcards' : 'Sentence Completion'}
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