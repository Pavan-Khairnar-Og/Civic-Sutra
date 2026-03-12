import React from 'react'

/**
 * Modern Input Component - Custom Color Palette
 * Clean, minimal inputs with smooth animations and theme support
 * Consistent styling for text inputs, textareas, and selects
 */
const Input = ({ 
  type = 'text',
  label,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  containerClassName = '',
  ...props 
}) => {
  const baseStyles = `
    w-full px-4 py-3 rounded-xl border transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    bg-surface text-text placeholder-muted
    border-border focus:border-primary focus:ring-primary/20
    disabled:bg-muted disabled:cursor-not-allowed
    transform active:scale-[0.98]
  `
  
  const errorStyles = error 
    ? 'border-danger focus:border-danger focus:ring-danger/20' 
    : ''
  
  const combinedStyles = `${baseStyles} ${errorStyles} ${className}`.trim().replace(/\s+/g, ' ')

  const containerStyles = `space-y-2 ${containerClassName}`.trim()

  return (
    <div className={containerStyles}>
      {label && (
        <label className="block text-sm font-medium text-text">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      
      <input
        type={type}
        className={combinedStyles}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-danger flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-muted">{helperText}</p>
      )}
    </div>
  )
}

/**
 * Textarea Component
 */
Input.Textarea = ({ 
  rows = 4,
  label,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  containerClassName = '',
  ...props 
}) => {
  const baseStyles = `
    w-full px-4 py-3 rounded-xl border transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 resize-none
    bg-surface text-text placeholder-muted
    border-border focus:border-primary focus:ring-primary/20
    disabled:bg-muted disabled:cursor-not-allowed
    transform active:scale-[0.98]
  `
  
  const errorStyles = error 
    ? 'border-danger focus:border-danger focus:ring-danger/20' 
    : ''
  
  const combinedStyles = `${baseStyles} ${errorStyles} ${className}`.trim().replace(/\s+/g, ' ')

  const containerStyles = `space-y-2 ${containerClassName}`.trim()

  return (
    <div className={containerStyles}>
      {label && (
        <label className="block text-sm font-medium text-text">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      
      <textarea
        rows={rows}
        className={combinedStyles}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-danger flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-muted">{helperText}</p>
      )}
    </div>
  )
}

/**
 * Select Component
 */
Input.Select = ({ 
  options = [],
  label,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  containerClassName = '',
  ...props 
}) => {
  const baseStyles = `
    w-full px-4 py-3 rounded-xl border transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    bg-surface text-text
    border-border focus:border-primary focus:ring-primary/20
    disabled:bg-muted disabled:cursor-not-allowed
    transform active:scale-[0.98]
  `
  
  const errorStyles = error 
    ? 'border-danger focus:border-danger focus:ring-danger/20' 
    : ''
  
  const combinedStyles = `${baseStyles} ${errorStyles} ${className}`.trim().replace(/\s+/g, ' ')

  const containerStyles = `space-y-2 ${containerClassName}`.trim()

  return (
    <div className={containerStyles}>
      {label && (
        <label className="block text-sm font-medium text-text">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      
      <select
        className={combinedStyles}
        disabled={disabled}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-sm text-danger flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-muted">{helperText}</p>
      )}
    </div>
  )
}

export default Input
