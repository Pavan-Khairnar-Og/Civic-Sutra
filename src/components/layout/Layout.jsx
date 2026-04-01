import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../Navbar'
import { ToastContainer } from '../ui/Toast'

/**
 * Modern Layout Component
 * Provides consistent layout structure with navbar and main content area
 * Includes proper spacing, responsive design, and toast notifications
 */
const Layout = ({ showNavbar = true }) => {
  return (
    <div className="min-h-screen bg-[#f5f2ed] dark:bg-[#1e1a17] transition-colors duration-200">
      {/* Toast Notifications */}
      <ToastContainer />
      
      {/* Navbar */}
      {showNavbar && <Navbar />}
      
      {/* Main Content */}
      <main className={showNavbar ? "pt-16" : ""}>
        <div className="container overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
