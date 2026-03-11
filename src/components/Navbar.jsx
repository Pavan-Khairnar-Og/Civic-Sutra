import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Navigation bar component
 * Provides navigation between different pages of the application
 */
const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              Civic Sutra
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/report" 
              className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Report Issue
            </Link>
            <Link 
              to="/my-reports" 
              className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              My Reports
            </Link>
            <Link 
              to="/map" 
              className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Map View
            </Link>
            <Link 
              to="/admin" 
              className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
