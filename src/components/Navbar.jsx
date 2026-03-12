import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Button from './ui/Button'
import Toggle from './ui/Toggle'

/**
 * Modern Navigation Bar - Custom Color Palette
 * Features theme toggle, backdrop blur, and responsive design
 * Clean, minimal interface with smooth animations
 * Uses custom colors: Primary (#76D2DB), Secondary (#D6A99D)
 */
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, toggleTheme, isLight, isDark } = useTheme()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const navLinks = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/report', label: 'Report Issue', icon: '📝' },
    { to: '/my-reports', label: 'My Reports', icon: '📋' },
    { to: '/map', label: 'Map View', icon: '🗺️' },
    { to: '/admin', label: 'Admin', icon: '⚙️' }
  ]

  return (
    <nav className={`
      sticky top-0 z-50 backdrop-blur-lg border-b border-border
      ${isLight ? 'bg-white/90' : 'bg-surface/90'}
      transition-all duration-200 ease-out
      rounded-b-2xl shadow-soft
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                transition-all duration-200 ease-out
                group-hover:scale-105 shadow-soft hover:shadow-medium
                ${isLight ? 'bg-primary' : 'bg-primary/20'}
              `}>
                <span className={`
                  font-bold text-lg transition-colors
                  ${isLight ? 'text-text' : 'text-primary'}
                `}>
                  CS
                </span>
              </div>
              <span className="text-xl font-bold text-text group-hover:text-primary transition-colors">
                Civic Sutra
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium
                  transition-all duration-200 ease-out
                  hover:bg-primary/10 hover:text-primary
                  text-text hover:scale-105
                `}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
            
            {/* Theme Toggle */}
            <div className="flex items-center space-x-3 pl-4 border-l border-border">
              <span className="text-sm text-text">
                {isLight ? '☀️' : '🌙'}
              </span>
              <Toggle
                checked={isDark}
                onChange={toggleTheme}
                size="sm"
              />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Mobile Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {isDark ? '🌙' : '☀️'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className={`
            md:hidden border-t border-border py-2 rounded-b-2xl
            ${isLight ? 'bg-white/95' : 'bg-surface/95'}
            transition-all duration-200 ease-out
          `}>
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium
                    transition-all duration-200 ease-out
                    hover:bg-primary/10 hover:text-primary hover:scale-105
                    text-text
                  `}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
