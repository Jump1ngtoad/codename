import { createContext } from 'react'
import { ModuleManifest } from '../types'

export interface AppContextType {
  modules: ModuleManifest['modules']
  completedModules: string[]
  isLoading: boolean
  error: string | null
  markModuleAsCompleted: (moduleId: string) => void
}

export const AppContext = createContext<AppContextType | undefined>(undefined) 