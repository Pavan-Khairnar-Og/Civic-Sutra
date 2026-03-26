import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ReportIssue from './pages/ReportIssue'
import MyReports from './pages/MyReports'
import MapView from './pages/MapView'
import AdminDashboard from './pages/AdminDashboard'
import ImageDetectionPage from './pages/ImageDetectionPage'
import ImageDetectionTest from './components/ImageDetectionTest'
import SupabaseTest from './components/SupabaseTest'
import SupabaseTestGuide from './components/SupabaseTestGuide'
import ImageAnalysisTest from './components/ImageAnalysisTest'

/**
 * Main App component with routing setup and theme provider
 * This is the entry point for our Civic Sutra application
 * Features modern Figma-style design system with dark/light mode
 * Includes AI Vision Detection feature and test tools
 */
function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background transition-colors duration-300">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/report" element={<ReportIssue />} />
              <Route path="/my-reports" element={<MyReports />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/ai-vision" element={<ImageDetectionPage />} />
              <Route path="/ai-vision-test" element={<ImageDetectionTest />} />
              <Route path="/supabase-test" element={<SupabaseTest />} />
              <Route path="/supabase-guide" element={<SupabaseTestGuide />} />
              <Route path="/gemini-test" element={<ImageAnalysisTest />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
