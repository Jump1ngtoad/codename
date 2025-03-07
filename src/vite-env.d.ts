/// <reference types="vite/client" />

// PWA virtual module declaration
declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (error: Error | unknown) => void
  }

  export function registerSW(options?: RegisterSWOptions): () => void
}
