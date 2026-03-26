import React from 'react'
import Navbar from '../Navbar'
import { ToastContainer } from '../ui/Toast'

/**
 * Modern Layout Component
 * Provides consistent layout structure with navbar and main content area
 * Includes proper spacing, responsive design, and toast notifications
 */
const Layout = ({ children, showNavbar = true }) => {
  return (
    <div className="min-h-screen bg-civic-parchment">
      {/* Toast Notifications */}
      <ToastContainer />
      
      {/* Navbar */}
      {showNavbar && <Navbar />}
      
      {/* Main Content */}
      <main className={showNavbar ? "pt-16" : ""}>
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
