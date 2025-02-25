import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AppProvider } from './contexts/AppContext'
import { HomePage } from './pages/HomePage'
import './index.css'

// Lazy load ModulePage
const ModulePage = lazy(() => import('./pages/ModulePage').then(module => ({
  default: module.ModulePage
})))

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/module/:moduleId" 
            element={
              <Suspense fallback={<div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-2xl">
                  <div className="p-6 text-center text-muted-foreground">
                    Loading...
                  </div>
                </div>
              </div>}>
                <ModulePage />
              </Suspense>
            } 
          />
        </Routes>
      </Router>
    </AppProvider>
  )
}

export default App
