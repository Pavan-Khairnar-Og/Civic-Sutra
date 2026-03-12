import React, { createContext, useContext, useState, useEffect } from 'react'

/**
 * Theme Context Provider - Custom Color Palette
 * Manages global theme state (light/dark mode) with custom colors
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

  // Custom theme configurations
  const themes = {
    light: {
      background: '#F5F5DC', // beige
      surface: '#FFFFFF', // white
      primary: '#76D2DB', // primary accent
      secondary: '#D6A99D', // soft highlight
      text: '#1F2937', // dark gray
      border: '#E5E7EB', // light gray
      danger: '#DA4848', // alert/critical
      muted: '#6B7280'
    },
    dark: {
      background: '#0F172A', // dark blue
      surface: '#1E293B', // dark blue lighter
      primary: '#76D2DB', // primary accent (same)
      secondary: '#D6A99D', // soft highlight (same)
      text: '#F1F5F9', // light gray
      border: '#334155', // dark border
      danger: '#DA4848', // alert/critical (same)
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
    root.classList.remove('light', 'dark')
    
    // Add current theme class to both html and body
    body.classList.add(theme)
    root.classList.add(theme)
    
    // Set CSS custom properties
    const colors = themes[theme]
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
    
    // Debug: Log theme application
    console.log(`Theme applied: ${theme}`, {
      bodyClass: body.className,
      rootClass: root.className,
      colors: colors
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
