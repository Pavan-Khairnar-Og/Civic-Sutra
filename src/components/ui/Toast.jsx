import React, { createContext, useContext, useState, useCallback } from 'react'
import { useTheme } from '../../context/ThemeContext'

// Toast context
const ToastContext = createContext()

// Toast provider component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const { isDark } = useTheme()

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random()
    const newToast = { id, message, type, duration }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}
    </ToastContext.Provider>
  )
}

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toast component
export const Toast = ({ toast, onRemove }) => {
  const { isDark } = useTheme()
  
  const getToastStyles = () => {
    const baseStyles = 'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out flex items-center space-x-3 max-w-sm'
    
    const typeStyles = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-white',
      info: 'bg-blue-500 text-white'
    }
    
    return `${baseStyles} ${typeStyles[toast.type] || typeStyles.info}`
  }

  return (
    <div className={getToastStyles()}>
      {/* Icon */}
      <div className="flex-shrink-0">
        {toast.type === 'success' && <span className="text-xl">✅</span>}
        {toast.type === 'error' && <span className="text-xl">❌</span>}
        {toast.type === 'warning' && <span className="text-xl">⚠️</span>}
        {toast.type === 'info' && <span className="text-xl">ℹ️</span>}
      </div>
      
      {/* Message */}
      <div className="flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      
      {/* Close Button */}
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
      >
        <span className="text-white">✕</span>
      </button>
    </div>
  )
}

// Toast container component
export const ToastContainer = () => {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

export default Toast
