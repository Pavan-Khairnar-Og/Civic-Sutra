import React, { createContext, useContext, useState, useEffect } from 'react'

/**
 * Modern Theme Context Provider - Professional SaaS Design
 * Manages global theme state with Indigo/Blue gradient theme
 * Features glass morphism, smooth animations, and modern color palette
 * Stores preference in localStorage and applies to document
 */

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark')
  const [isLoaded, setIsLoaded] = useState(false)

  // Modern theme configurations with design system
  const themes = {
    light: {
      background: '#f8fafc', // Slate-50
      surface: '#ffffff', // White
      surfaceLight: '#f1f5f9', // Slate-100
      card: '#ffffff', // White
      cardBorder: '#e2e8f0', // Slate-200
      primary: '#6366f1', // Indigo-500
      primaryLight: '#818cf8', // Indigo-400
      primaryDark: '#4f46e5', // Indigo-600
      accent: '#06b6d4', // Cyan-500
      accentLight: '#22d3ee', // Cyan-400
      textPrimary: '#0f172a', // Slate-900
      textSecondary: '#475569', // Slate-600
      textMuted: '#64748b', // Slate-500
      textInverse: '#f8fafc', // Light text for dark backgrounds
      border: '#e2e8f0', // Slate-200
      borderLight: '#cbd5e1', // Slate-300
      borderMuted: '#f1f5f9', // Slate-100
      success: '#10b981', // Emerald-500
      warning: '#f59e0b', // Amber-500
      danger: '#ef4444', // Red-500
      info: '#3b82f6', // Blue-500
      muted: '#94a3b8' // Slate-400
    },
    dark: {
      background: '#0f172a', // Slate-900
      surface: '#111827', // Slate-800
      surfaceLight: '#1f2937', // Slate-700
      card: '#1e293b', // Slate-800
      cardBorder: '#374151', // Slate-700
      primary: '#6366f1', // Indigo-500
      primaryLight: '#818cf8', // Indigo-400
      primaryDark: '#4f46e5', // Indigo-600
      accent: '#06b6d4', // Cyan-500
      accentLight: '#22d3ee', // Cyan-400
      textPrimary: '#f8fafc', // Slate-50
      textSecondary: '#cbd5e1', // Slate-300
      textMuted: '#94a3b8', // Slate-400
      textInverse: '#0f172a', // Dark text for light backgrounds
      border: '#374151', // Slate-700
      borderLight: '#4b5563', // Slate-600
      borderMuted: '#1f2937', // Slate-800
      success: '#10b981', // Emerald-500
      warning: '#f59e0b', // Amber-500
      danger: '#ef4444', // Red-500
      info: '#3b82f6', // Blue-500
      muted: '#64748b' // Slate-500
    }
  }

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = savedTheme || systemTheme
    
    setTheme(initialTheme)
    setIsLoaded(true)
  }, [])

  // Apply theme to document and CSS variables
  useEffect(() => {
    if (!isLoaded) return

    const root = document.documentElement
    const body = document.body
    
    // Remove existing theme classes
    body.classList.remove('light', 'dark')
    root.classList.remove('light', 'dark')
    
    // Add current theme class to both html and body
    body.classList.add(theme)
    root.classList.add(theme)
    
    // Set CSS custom properties with modern naming
    const colors = themes[theme]
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
      root.style.setProperty(cssVar, value)
    })
    
    // Store preference
    localStorage.setItem('theme', theme)
  }, [theme, isLoaded, themes])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  const currentColors = themes[theme]

  const value = {
    theme,
    currentColors,
    toggleTheme,
    isLight: theme === 'light',
    isDark: theme === 'dark',
    isLoaded
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeContext
