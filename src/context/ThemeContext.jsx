import React, { createContext, useContext, useState, useEffect } from 'react'

/**
 * Theme Context Provider
 * Manages global theme state (light/dark mode)
 * Stores preference in localStorage
 * Applies theme classes to document body
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
  const [theme, setTheme] = useState('light')
  const [isLoaded, setIsLoaded] = useState(false)

  // Theme configurations
  const themes = {
    light: {
      background: '#F8FAFC',
      surface: '#FFFFFF',
      primary: '#3B82F6',
      accent: '#22C55E',
      text: '#0F172A',
      border: '#E2E8F0',
      warning: '#F59E0B',
      danger: '#EF4444',
      muted: '#64748B'
    },
    dark: {
      background: '#0F172A',
      surface: '#1E293B',
      primary: '#60A5FA',
      accent: '#34D399',
      text: '#F1F5F9',
      border: '#334155',
      warning: '#F59E0B',
      danger: '#EF4444',
      muted: '#94A3B8'
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
    body.classList.add(theme)
    
    // Set CSS custom properties
    const colors = themes[theme]
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
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
