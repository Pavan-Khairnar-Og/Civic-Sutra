import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { User, Settings, LogOut, Menu, X } from 'lucide-react'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, isAuthenticated, isGov, isAnonymous, loading } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = () => {
    logout()
  }

  const getNavItems = () => {
    const baseItems = [
      { name: 'Home', path: '/' }
    ]

    if (!isAnonymous) {
      baseItems.push(
        { name: 'Report Issue', path: '/report' },
        { name: 'Map View', path: '/map' }
      )
    }

    if (isGov) {
      baseItems.push(
        { name: 'Government Dashboard', path: '/government' }
      )
    }

    return baseItems
  }

  const navItems = getNavItems()

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  if (loading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-civic-parchment">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-civic-orange"></div>
        </div>
      </nav>
    )
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/90 backdrop-blur-md border-b border-civic-muted' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 bg-civic-orange text-white rounded-xl flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
              CS
            </div>
            <div>
              <div className="text-civic-textPrimary font-semibold text-lg">Civic Sutra</div>
              <div className="text-civic-textSecondary text-xs">Smart City Reporting</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative transition-colors font-medium ${
                  isActive(item.path) 
                    ? 'text-civic-orange' 
                    : 'text-civic-textSecondary hover:text-civic-orange'
                }`}
              >
                {item.name}
                {isActive(item.path) && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-civic-orange"></div>
                )}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          {(isAuthenticated || isAnonymous) && (
            <div className="hidden md:block">
              <div className="relative group">
                <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-civic-orangeLight/50 transition-colors">
                  <div className="w-9 h-9 bg-civic-orangeLight text-civic-orange font-semibold rounded-full flex items-center justify-center">
                    {isAnonymous ? 'A' : (user?.name || 'User').charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="text-sm text-civic-textPrimary font-medium">
                      {isAnonymous ? 'Anonymous' : user?.name || 'User'}
                    </div>
                    <div className="text-xs text-civic-textSecondary">
                      {isGov ? 'Government' : isAnonymous ? 'Anonymous' : 'Citizen'}
                    </div>
                  </div>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white border border-civic-muted rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-2">
                    {!isAnonymous && (
                      <Link
                        to="/settings"
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-civic-textSecondary hover:text-civic-orange hover:bg-civic-orangeLight/50 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-civic-textSecondary hover:text-civic-orange hover:bg-civic-orangeLight/50 rounded-lg transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-civic-textSecondary hover:text-civic-orange hover:bg-civic-orangeLight/50 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-civic-muted bg-white/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'text-civic-orange bg-civic-orangeLight/50'
                      : 'text-civic-textSecondary hover:text-civic-orange hover:bg-civic-orangeLight/50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {(isAuthenticated || isAnonymous) && (
                <>
                  <div className="border-t border-civic-muted pt-3 mt-3">
                    <div className="px-3 py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-civic-orangeLight text-civic-orange font-semibold rounded-full flex items-center justify-center">
                          {isAnonymous ? 'A' : (user?.name || 'User').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm text-civic-textPrimary font-medium">
                            {isAnonymous ? 'Anonymous' : user?.name || 'User'}
                          </div>
                          <div className="text-xs text-civic-textSecondary">
                            {isGov ? 'Government' : isAnonymous ? 'Anonymous' : 'Citizen'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {!isAnonymous && (
                      <Link
                        to="/settings"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-civic-textSecondary hover:text-civic-orange hover:bg-civic-orangeLight/50 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-civic-textSecondary hover:text-civic-orange hover:bg-civic-orangeLight/50 rounded-lg transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
