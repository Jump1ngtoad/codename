import { useEffect, useState, ReactNode } from 'react'
import { ModuleManifest } from '../types'
import { AppContext } from './context'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const MODULES_CACHE_KEY = 'modulesCache'
const COMPLETED_MODULES_KEY = 'completedModules'

interface ModulesCache {
  data: ModuleManifest['modules']
  timestamp: number
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [modules, setModules] = useState<ModuleManifest['modules']>([])
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load completed modules from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COMPLETED_MODULES_KEY)
      if (saved) {
        setCompletedModules(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading completed modules:', error)
    }
  }, [])

  // Load modules with caching
  useEffect(() => {
    let isMounted = true
    
    const loadModules = async () => {
      try {
        // Check cache first
        const cachedData = localStorage.getItem(MODULES_CACHE_KEY)
        if (cachedData) {
          const cache: ModulesCache = JSON.parse(cachedData)
          const isExpired = Date.now() - cache.timestamp > CACHE_DURATION

          if (!isExpired) {
            if (isMounted) {
              console.log('Loading from cache:', cache.data)
              setModules(cache.data)
              setIsLoading(false)
            }
            return
          }
        }

        // Fetch fresh data if cache is expired or missing
        console.log('Fetching fresh data...')
        const response = await fetch('/modules/manifest.json')
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`Failed to load modules (${response.status})`)
        }
        
        const data: ModuleManifest = await response.json()
        console.log('Fetched data:', data)
        
        if (!isMounted) return

        // Update cache
        const cacheData: ModulesCache = {
          data: data.modules,
          timestamp: Date.now()
        }
        localStorage.setItem(MODULES_CACHE_KEY, JSON.stringify(cacheData))
        
        setModules(data.modules)
        setError(null)
      } catch (error) {
        console.error('Error loading modules:', error)
        if (isMounted) {
          // Only set error if we couldn't load from cache as fallback
          let loadedFromCache = false
          
          // Try to load from cache as fallback
          try {
            const cachedData = localStorage.getItem(MODULES_CACHE_KEY)
            if (cachedData) {
              const cache: ModulesCache = JSON.parse(cachedData)
              setModules(cache.data)
              loadedFromCache = true
            }
          } catch (cacheError) {
            console.error('Failed to load from cache:', cacheError)
          }
          
          // Only set error if we couldn't load from cache
          if (!loadedFromCache) {
            setError('Failed to load modules. Please try again later.')
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadModules()
    
    return () => {
      isMounted = false
    }
  }, [])

  const markModuleAsCompleted = (moduleId: string) => {
    try {
      const updatedModules = [...new Set([...completedModules, moduleId])]
      localStorage.setItem(COMPLETED_MODULES_KEY, JSON.stringify(updatedModules))
      setCompletedModules(updatedModules)
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }

  // Add debug log for render
  console.log('AppContext state:', { modules, completedModules, isLoading, error })

  return (
    <AppContext.Provider
      value={{
        modules,
        completedModules,
        isLoading,
        error,
        markModuleAsCompleted
      }}
    >
      {children}
    </AppContext.Provider>
  )
} 