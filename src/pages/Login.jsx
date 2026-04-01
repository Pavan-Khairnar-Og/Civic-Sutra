import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { IconFingerprint } from '@tabler/icons-react'
import { fadeUp, slideInRight, scaleIn } from '../lib/animations.jsx'

/**
 * CivicSutra Login Page
 * Split-screen design with role selection and beautiful SVG illustration
 */
const Login = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login, isAuthenticated, isGov, isAnonymous } = useAuth()
  
  const [activeTab, setActiveTab] = useState('citizen')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
    employeeId: '',
    department: ''
  })

  // Tab positions for sliding indicator - using pixel-based positioning for better alignment
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  // Update indicator position when tab changes
  const updateIndicatorPosition = useCallback(() => {
    const container = document.getElementById('tab-container')
    const activeButton = container?.querySelector(`[data-tab="${activeTab}"]`)
    
    if (container && activeButton) {
      const containerRect = container.getBoundingClientRect()
      const buttonRect = activeButton.getBoundingClientRect()
      
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width
      })
    }
  }, [activeTab])

  useEffect(() => {
    updateIndicatorPosition()
    
    // Add resize listener for responsive behavior
    window.addEventListener('resize', updateIndicatorPosition)
    return () => window.removeEventListener('resize', updateIndicatorPosition)
  }, [updateIndicatorPosition])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (activeTab === 'citizen' || activeTab === 'government') {
      if (!formData.email) {
        newErrors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email'
      }

      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      }

      if (activeTab === 'government' && !formData.employeeId) {
        newErrors.employeeId = 'Employee ID is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      const userData = {
        name: formData.email.split('@')[0],
        email: formData.email,
        role: activeTab === 'government' ? 'gov' : 'citizen',
        department: formData.department,
        employeeId: formData.employeeId
      }

      login(userData)
      navigate('/home')
      setLoading(false)
    }, 800)
  }

  const handleAnonymousLogin = () => {
    setLoading(true)
    setTimeout(() => {
      const userData = {
        name: 'Anonymous User',
        email: 'anonymous@civicsutra.com',
        role: 'anonymous'
      }
      login(userData)
      navigate('/home')
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Visual */}
      <div className="w-[55%] bg-civic-parchment relative overflow-hidden">
        {/* SVG Illustration */}
        <svg
          viewBox="0 0 800 600"
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Animated SVG paths */}
          <motion.path
            d="M100 300 Q200 200 300 300 T500 300"
            stroke="#D4522A"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          <motion.path
            d="M150 400 Q250 350 350 400 T550 400"
            stroke="#E9A84C"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
          />
          <motion.path
            d="M200 500 Q300 450 400 500 T600 500"
            stroke="#2A9D8F"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.6, ease: "easeInOut" }}
          />

          {/* City elements */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            {/* Municipal Building */}
            <rect x="350" y="200" width="100" height="150" fill="#D4522A" opacity="0.8" />
            <rect x="370" y="180" width="60" height="20" fill="#D4522A" />
            
            {/* Auto Rickshaw */}
            <circle cx="250" cy="380" r="15" fill="#E9A84C" />
            <rect x="235" y="360" width="30" height="20" fill="#E9A84C" />
            
            {/* Water Tank */}
            <circle cx="500" cy="250" r="25" fill="#2A9D8F" opacity="0.7" />
            
            {/* Street Light */}
            <rect x="150" y="300" width="8" height="100" fill="#6B6560" />
            <circle cx="154" cy="290" r="12" fill="#E9A84C" />
          </motion.g>
        </svg>

        {/* Logo and Tagline */}
        <motion.div 
          className="absolute top-12 left-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-3">
            {/* Logo Mark */}
            <div className="w-12 h-12 bg-civic-orange rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-civic-textPrimary">CivicSutra</h1>
          </div>
          <p className="mt-2 text-lg italic text-civic-textSecondary font-serif">
            "Nagarik Awaaz. Sarkar Ka Jawab."
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-[45%] bg-white flex items-center justify-center p-12">
        <motion.div
          className="w-full max-w-md"
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          {/* Tab Navigation */}
          <div className="relative mb-8">
            <div id="tab-container" className="flex bg-civic-orangeLight rounded-full p-1 relative">
              {['citizen', 'government', 'anonymous'].map((tab) => (
                <button
                  key={tab}
                  data-tab={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition-all z-10 relative ${
                    activeTab === tab
                      ? 'text-white'
                      : 'text-civic-textSecondary hover:text-civic-textPrimary'
                  }`}
                >
                  {tab === 'citizen' && t('auth.citizen')}
                  {tab === 'government' && t('auth.government')}
                  {tab === 'anonymous' && t('auth.anonymous')}
                </button>
              ))}
              
              {/* Sliding Indicator */}
              <motion.div
                className="absolute top-1 h-[calc(100%-8px)] bg-civic-orange rounded-full"
                style={{
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`
                }}
                animate={{
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
          </div>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'citizen' && (
              <motion.form
                key="citizen"
                onSubmit={handleSubmit}
                className="space-y-6"
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={slideInRight}
              >
                <div>
                  <h2 className="text-2xl font-serif text-civic-textPrimary mb-2">Welcome back</h2>
                  <p className="text-civic-textSecondary">Sign in to report and track issues</p>
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-civic-parchment border border-civic-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-civic-orange focus:border-transparent transition-all"
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-3 bg-civic-parchment border border-civic-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-civic-orange focus:border-transparent transition-all"
                  />
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                      className="w-4 h-4 text-civic-orange border-civic-muted rounded focus:ring-civic-orange"
                    />
                    <span className="ml-2 text-sm text-civic-textSecondary">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-civic-orange hover:text-civic-orangeHover">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-civic-orange text-white rounded-full font-medium hover:bg-civic-orangeHover transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-civic-muted"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-civic-textSecondary">or</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-3 border border-civic-orange text-civic-orange rounded-full font-medium hover:bg-civic-orangeLight transition-all"
                >
                  Create account
                </button>

                <p className="text-center text-sm text-civic-textSecondary">
                  New to CivicSutra? <a href="#" className="text-civic-orange hover:text-civic-orangeHover">Register as Citizen →</a>
                </p>
              </motion.form>
            )}

            {activeTab === 'government' && (
              <motion.form
                key="government"
                onSubmit={handleSubmit}
                className="space-y-6"
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={slideInRight}
              >
                <div>
                  <h2 className="text-2xl font-serif text-civic-textPrimary mb-2">Government Portal</h2>
                  <p className="text-civic-textSecondary">Sign in as government employee</p>
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-civic-parchment border border-civic-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-civic-orange focus:border-transparent transition-all"
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-3 bg-civic-parchment border border-civic-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-civic-orange focus:border-transparent transition-all"
                  />
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Employee ID"
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    className="w-full px-4 py-3 bg-civic-parchment border border-civic-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-civic-orange focus:border-transparent transition-all"
                  />
                  <AnimatePresence>
                    {errors.employeeId && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.employeeId}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <select
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full px-4 py-3 bg-civic-parchment border border-civic-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-civic-orange focus:border-transparent transition-all"
                  >
                    <option value="">Select Department</option>
                    <option value="water">Water Supply</option>
                    <option value="roads">Roads & Footpaths</option>
                    <option value="lighting">Street Lighting</option>
                    <option value="sanitation">Sanitation & Waste</option>
                    <option value="parks">Parks & Gardens</option>
                    <option value="safety">Public Safety</option>
                    <option value="admin">Municipal Administration</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-civic-orange text-white rounded-full font-medium hover:bg-civic-orangeHover transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Sign In as Government Employee
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {activeTab === 'anonymous' && (
              <motion.div
                key="anonymous"
                className="text-center space-y-8"
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={scaleIn}
              >
                <div className="space-y-4">
                  <motion.div
                    className="w-20 h-20 bg-civic-orangeLight rounded-full flex items-center justify-center mx-auto"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <IconFingerprint size={40} className="text-civic-orange" />
                  </motion.div>
                  
                  <div>
                    <h2 className="text-2xl font-serif text-civic-textPrimary mb-2">Report Without Signing In</h2>
                    <p className="text-civic-textSecondary">
                      Your identity stays private. Reports are linked to this device only.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-2 bg-civic-tealLight px-4 py-2 rounded-full">
                      <span className="text-civic-teal">✓</span>
                      <span className="text-sm text-civic-textPrimary">Full reporting access</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-civic-amberLight px-4 py-2 rounded-full">
                      <span className="text-civic-amber">✓</span>
                      <span className="text-sm text-civic-textPrimary">Track your reports locally</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAnonymousLogin}
                  disabled={loading}
                  className="w-full py-3 bg-civic-orange text-white rounded-full font-medium hover:bg-civic-orangeHover transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Setting up...
                    </div>
                  ) : (
                    'Continue Anonymously'
                  )}
                </button>

                <p className="text-xs text-civic-textSecondary mt-4">
                  No account needed. No data stored on our servers.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
