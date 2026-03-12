import React from 'react'

/**
 * Toggle Switch Component
 * Modern toggle switch for theme switching and boolean controls
 * Supports different sizes and variants
 */
const Toggle = ({ 
  checked, 
  onChange, 
  size = 'md', 
  disabled = false,
  className = '',
  ...props 
}) => {
  // Size configurations
  const sizes = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4'
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5'
    },
    lg: {
      track: 'w-14 h-8',
      thumb: 'w-6 h-6',
      translate: 'translate-x-6'
    }
  }

  const currentSize = sizes[size]

  return (
    <button
      type="button"
      className={`
        relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 
        focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
        ${checked 
          ? 'bg-blue-600 focus:ring-blue-500' 
          : 'bg-gray-200 focus:ring-gray-500'
        }
        ${currentSize.track}
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        ${className}
      `}
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      {...props}
    >
      <span className="sr-only">Toggle</span>
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0
          transition-transform duration-200 ease-in-out
          ${checked ? currentSize.translate : 'translate-x-0'}
          ${currentSize.thumb}
        `}
      />
    </button>
  )
}

export default Toggle
