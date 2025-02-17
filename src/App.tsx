import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { ModulePage } from './pages/ModulePage'
import './index.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/module/:moduleId" element={<ModulePage />} />
      </Routes>
    </Router>
  )
}

export default App
