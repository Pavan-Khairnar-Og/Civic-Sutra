import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
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
import NotificationSettings from './pages/NotificationSettings'
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
import GovLayout from './components/layout/GovLayout'

import GovIssueDetail from './pages/GovIssueDetail'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ToastProvider>
          <BrowserRouter future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}>
            <Routes>
              {/* Government Portal Routes */}
              <Route element={<AdminRoute><GovLayout /></AdminRoute>}>
                <Route path="/dashboard" element={<GovernmentDashboard />} />
                <Route path="/admin/issues" element={<GovernmentDashboard />} /> {/* Using same page for now if separate list is missing */}
                <Route path="/admin/issue/:id" element={<GovIssueDetail />} />
                <Route path="/admin/map" element={<MapView />} />
              </Route>

              {/* Citizen & Public Routes - Using standard Layout */}
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                
                {/* Citizen Routes */}
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
                
                {/* Authenticated Routes */}
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
                <Route path="/settings/notifications" element={
                  <AuthRoute>
                    <NotificationSettings />
                  </AuthRoute>
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
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
