import React from 'react'

/**
 * Civic Button Component
 * Clean, modern buttons using the Civic design system
 * No gradients, no blue/purple colors - only Civic palette
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  // Base styles
  const baseStyles = `
    inline-flex items-center justify-center font-medium rounded-full
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-civic-orange/50
    disabled:cursor-not-allowed disabled:opacity-50
    transform active:scale-95 hover:scale-105
    relative
  `
  
  // Size variants
  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-3.5 text-base',
    xl: 'px-10 py-4 text-lg'
  }
  
  // Color variants using Civic design system
  const variantStyles = {
    primary: `
      bg-civic-orange hover:bg-civic-orangeHover text-white
      hover:shadow-[0_8px_24px_rgba(212,82,42,0.35)]
      disabled:hover:shadow-none
    `,
    secondary: `
      bg-white border border-civic-muted text-civic-textPrimary
      hover:bg-civic-muted
      disabled:hover:bg-white
    `,
    outline: `
      bg-transparent border border-civic-muted text-civic-textPrimary
      hover:bg-civic-orangeLight hover:border-civic-orange hover:text-civic-orange
      disabled:hover:bg-transparent disabled:hover:text-civic-textPrimary
    `,
    ghost: `
      bg-transparent text-civic-textSecondary
      hover:text-civic-orange hover:bg-civic-orangeLight/50
      disabled:hover:text-civic-textSecondary disabled:hover:bg-transparent
    `,
    muted: `
      bg-civic-surface border border-civic-muted text-civic-textSecondary
      hover:bg-civic-muted hover:text-civic-textPrimary
      disabled:hover:bg-civic-surface disabled:hover:text-civic-textSecondary
    `,
    success: `
      bg-civic-teal hover:bg-civic-teal/90 text-white
      hover:shadow-[0_8px_24px_rgba(42,157,143,0.35)]
      disabled:hover:shadow-none
    `,
    warning: `
      bg-civic-amber hover:bg-civic-amber/90 text-white
      hover:shadow-[0_8px_24px_rgba(233,168,76,0.35)]
      disabled:hover:shadow-none
    `,
    danger: `
      bg-civic-red hover:bg-civic-red/90 text-white
      hover:shadow-[0_8px_24px_rgba(193,18,31,0.35)]
      disabled:hover:shadow-none
    `
  }
  
  // Width styles
  const widthStyles = fullWidth ? 'w-full' : ''
  
  // Loading overlay
  const loadingStyles = loading ? 'cursor-wait' : ''
  
  const combinedStyles = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${widthStyles}
    ${disabled ? 'cursor-not-allowed opacity-50 hover:transform-none' : ''}
    ${loadingStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <button
      type={type}
      className={combinedStyles}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="3"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {/* Button content */}
      {children}
    </button>
  )
}

export default Button
