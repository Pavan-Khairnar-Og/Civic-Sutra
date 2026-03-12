import React from 'react'

/**
 * Reusable Input Component
 * Consistent styling for text inputs, textareas, and selects
 * Mobile-friendly with proper focus states
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
  const baseStyles = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed'
  
  const errorStyles = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
  
  const combinedStyles = `${baseStyles} ${errorStyles} ${className}`.trim().replace(/\s+/g, ' ')

  const containerStyles = `space-y-2 ${containerClassName}`.trim()

  return (
    <div className={containerStyles}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
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
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
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
  const baseStyles = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed resize-none'
  
  const errorStyles = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
  
  const combinedStyles = `${baseStyles} ${errorStyles} ${className}`.trim().replace(/\s+/g, ' ')

  const containerStyles = `space-y-2 ${containerClassName}`.trim()

  return (
    <div className={containerStyles}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
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
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
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
  const baseStyles = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed'
  
  const errorStyles = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
  
  const combinedStyles = `${baseStyles} ${errorStyles} ${className}`.trim().replace(/\s+/g, ' ')

  const containerStyles = `space-y-2 ${containerClassName}`.trim()

  return (
    <div className={containerStyles}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
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
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
}

export default Input
