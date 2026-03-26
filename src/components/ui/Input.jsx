import React from 'react'

/**
 * Modern Input Component - Professional SaaS Design
 * Clean, minimal inputs with glass morphism and smooth animations
 * Features gradient focus states, proper spacing, and modern styling
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
    w-full px-4 py-3 rounded-xl border transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
    bg-card text-primary placeholder-muted
    border-border focus:border-primary focus:ring-primary/50 focus:shadow-md
    disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-50
    transform active:scale-[0.98] hover:border-border/50
    shadow-sm hover:shadow-md
  `
  
  const errorStyles = error 
    ? 'border-danger focus:border-danger focus:ring-danger/50 focus:shadow-danger/20' 
    : ''
  
  const combinedStyles = `${baseStyles} ${errorStyles} ${className}`.trim().replace(/\s+/g, ' ')
  
  const containerStyles = `space-y-2 ${containerClassName}`.trim()
  
  return (
    <div className={containerStyles}>
      {label && (
        <label className="block text-sm font-medium text-secondary mb-1 transition-colors">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type={type}
          className={combinedStyles}
          placeholder={placeholder}
          disabled={disabled}
          {...props}
        />
        
        {/* Focus indicator */}
        <div className="absolute inset-0 rounded-xl pointer-events-none">
          <div className="absolute inset-0 rounded-xl bg-primary opacity-0 transition-opacity duration-300 peer-focus:opacity-20"></div>
        </div>
      </div>
      
      {helperText && (
        <p className="text-xs text-secondary mt-1 transition-colors">
          {helperText}
        </p>
      )}
      
      {error && (
        <p className="text-xs text-danger mt-1 transition-colors">
          {error}
        </p>
      )}
      
      {helperText && (
        <p className="text-xs text-secondary mt-1 transition-colors">
          {helperText}
        </p>
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
    w-full px-4 py-3 rounded-2xl border transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background resize-none
    bg-card text-primary placeholder-muted
    border-border focus:border-primary focus:ring-primary/50 focus:shadow-md
    disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-50
    transform active:scale-[0.98] hover:border-border/50
  `
  
  const errorStyles = error 
    ? 'border-danger focus:border-danger focus:ring-danger/50 focus:shadow-danger/20' 
    : ''
  
  const combinedStyles = `${baseStyles} ${errorStyles} ${className}`.trim().replace(/\s+/g, ' ')

  const containerStyles = `space-y-2 ${containerClassName}`.trim()

  return (
    <div className={containerStyles}>
      {label && (
        <label className="block text-sm font-medium text-secondary mb-1">
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
        <p className="text-sm text-danger flex items-center animate-fade-in">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    w-full px-4 py-3 rounded-2xl border transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
    bg-card text-primary
    border-border focus:border-primary focus:ring-primary/50 focus:shadow-md
    disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-50
    transform active:scale-[0.98] hover:border-border/50
  `
  
  const errorStyles = error 
    ? 'border-danger focus:border-danger focus:ring-danger/50 focus:shadow-danger/20' 
    : ''
  
  const combinedStyles = `${baseStyles} ${errorStyles} ${className}`.trim().replace(/\s+/g, ' ')

  const containerStyles = `space-y-2 ${containerClassName}`.trim()

  return (
    <div className={containerStyles}>
      {label && (
        <label className="block text-sm font-medium text-secondary mb-1">
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
        <p className="text-sm text-danger flex items-center animate-fade-in">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
