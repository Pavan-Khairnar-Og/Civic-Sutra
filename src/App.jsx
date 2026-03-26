import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import Layout from './components/layout/Layout'
import ProtectedRoute, { AdminRoute, CitizenRoute, AuthRoute } from './components/auth/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import ReportIssue from './pages/ReportIssue'
import ReportDetail from './pages/ReportDetail'
import MyReports from './pages/MyReports-New'
import MapView from './pages/MapView'
import GovernmentDashboard from './pages/GovernmentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Settings from './pages/Settings'
import ImageDetectionPage from './pages/ImageDetectionPage'
import ImageDetectionTest from './components/ImageDetectionTest'
import SupabaseTest from './components/SupabaseTest'
import SupabaseTestGuide from './components/SupabaseTestGuide'
import ImageAnalysisTest from './components/ImageAnalysisTest'

/**
 * Main App component with modern design system and authentication
 * Features professional SaaS-style design with glass morphism
 * Includes role-based access control and comprehensive routing
 */
function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router future={{ v7_relativeSplatPath: true }}>
            <Layout>
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              
              {/* Citizen Routes (Accessible to all roles including anonymous) */}
              <Route path="/report" element={
                <CitizenRoute>
                  <ReportIssue />
                </CitizenRoute>
              } />
              <Route path="/report/:id" element={
                <CitizenRoute>
                  <ReportDetail />
                </CitizenRoute>
              } />
              <Route path="/map" element={
                <CitizenRoute>
                  <MapView />
                </CitizenRoute>
              } />
              
              {/* Authenticated Routes (Requires login, any authenticated role) */}
              <Route path="/my-reports" element={
                <AuthRoute>
                  <MyReports />
                </AuthRoute>
              } />
              <Route path="/settings" element={
                <AuthRoute>
                  <Settings />
                </AuthRoute>
              } />
              
              {/* Government Routes (Government and Admin only) */}
              <Route path="/government" element={
                <AdminRoute>
                  <GovernmentDashboard />
                </AdminRoute>
              } />
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              
              {/* Development/Test Routes */}
              <Route path="/ai-vision" element={
                <CitizenRoute>
                  <ImageDetectionPage />
                </CitizenRoute>
              } />
              <Route path="/ai-vision-test" element={<ImageDetectionTest />} />
              <Route path="/supabase-test" element={<SupabaseTest />} />
              <Route path="/supabase-guide" element={<SupabaseTestGuide />} />
              <Route path="/gemini-test" element={<ImageAnalysisTest />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ToastProvider>
  </ThemeProvider>
  )
}

export default App
