import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, X, User, Settings, FileText, Map, Bell, Shield, 
  ChevronDown, LogOut, Home as HomeIcon, AlertTriangle, User as UserIcon
} from 'lucide-react'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, isAuthenticated, isGov, isAnonymous, loading } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', path: '/home', icon: HomeIcon },
    { name: 'Report Issue', path: '/report', icon: AlertTriangle },
    { name: 'My Reports', path: '/my-reports', icon: FileText },
    { name: 'Map View', path: '/map', icon: Map },
  ]

  // Add Dashboard for government users
  if (isGov) {
    navItems.push({ name: 'Dashboard', path: '/government', icon: Shield })
  }

  const isActive = (path) => {
    if (path === '/home') {
      return location.pathname === '/home' || location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const handleSignOut = () => {
    logout()
    setIsUserDropdownOpen(false)
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
    <>
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-md border-b border-civic-muted' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/home" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-civic-orange text-white rounded-xl flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
                CS
              </div>
              <div className="text-civic-textPrimary font-semibold text-lg">CivicSutra</div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="relative group"
                >
                  <span className={`font-medium transition-colors ${
                    isActive(item.path) 
                      ? 'text-[#D4522A]' 
                      : 'text-civic-textSecondary hover:text-civic-orange'
                  }`}>
                    {item.name}
                    {item.name === 'Dashboard' && <Shield className="inline w-4 h-4 ml-1" />}
                  </span>
                  {isActive(item.path) && (
                    <div className="bg-[#D4522A] w-1 h-1 rounded-full mx-auto mt-0.5"></div>
                  )}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Notification Bell (Gov Only) */}
              {isGov && (
                <button className="relative p-2 text-civic-textSecondary hover:text-civic-orange transition-colors">
                  <Bell className="w-5 h-5" />
                  <div className="absolute top-1 right-1 w-2 h-2 bg-civic-orange rounded-full"></div>
                </button>
              )}

              {/* User Section */}
              {isAnonymous ? (
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 bg-civic-muted text-civic-textSecondary rounded-full text-sm font-medium flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Anonymous
                  </span>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-civic-textSecondary hover:text-civic-orange border border-civic-muted rounded-full text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              ) : isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-civic-orangeLight/50 transition-colors"
                  >
                    <div className="w-9 h-9 bg-[#FBF0EB] text-[#D4522A] font-semibold rounded-full flex items-center justify-center">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-civic-textPrimary font-medium">
                        {user?.name || 'User'}
                      </div>
                      <div className="text-xs text-civic-textSecondary">
                        {isGov ? 'Government' : 'Citizen'}
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-civic-textSecondary transition-transform ${
                      isUserDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white border border-civic-muted rounded-xl shadow-lg"
                      >
                        <div className="p-2">
                          <Link
                            to="/settings"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-civic-textSecondary hover:text-civic-orange hover:bg-civic-orangeLight/50 rounded-lg transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            Profile
                          </Link>
                          <Link
                            to="/my-reports"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-civic-textSecondary hover:text-civic-orange hover:bg-civic-orangeLight/50 rounded-lg transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            My Reports
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-civic-textSecondary hover:text-civic-orange hover:bg-civic-orangeLight/50 rounded-lg transition-colors w-full text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : null}

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-lg text-civic-textSecondary hover:text-civic-orange hover:bg-civic-orangeLight/50 transition-colors"
                >
                  <motion.div
                    animate={{ rotate: isMobileMenuOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-white md:hidden"
          >
            <div className="flex flex-col h-full pt-20 px-6">
              {/* Mobile Nav Links */}
              <div className="flex-1">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between py-4 text-lg font-medium transition-colors ${
                        isActive(item.path)
                          ? 'text-[#D4522A]'
                          : 'text-civic-textSecondary hover:text-civic-orange'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </span>
                      {isActive(item.path) && (
                        <div className="w-2 h-2 bg-civic-orange rounded-full"></div>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Mobile User Section */}
              <div className="border-t border-civic-muted pt-6">
                {isAnonymous ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <UserIcon className="w-5 h-5 text-civic-textSecondary" />
                      <span className="text-civic-textSecondary">Anonymous</span>
                    </div>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full px-4 py-3 text-center text-civic-textPrimary bg-civic-orange rounded-full font-medium"
                    >
                      Sign In
                    </Link>
                  </div>
                ) : isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="w-10 h-10 bg-civic-orangeLight text-civic-orange font-semibold rounded-full flex items-center justify-center">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="text-civic-textPrimary font-medium">
                          {user?.name || 'User'}
                        </div>
                        <div className="text-sm text-civic-textSecondary">
                          {isGov ? 'Government' : 'Citizen'}
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-2 text-civic-textSecondary hover:text-civic-orange"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/my-reports"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-2 text-civic-textSecondary hover:text-civic-orange"
                    >
                      My Reports
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsMobileMenuOpen(false)
                      }}
                      className="block w-full px-4 py-2 text-civic-textSecondary hover:text-civic-orange text-left"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
