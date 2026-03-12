import React from 'react'

/**
 * Modern Button Component - Figma-style design system
 * Clean, minimal buttons with smooth animations and theme support
 * Supports different variants, sizes, and states
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
  // Base styles with theme-aware colors
  const baseStyles = `
    font-medium rounded-xl transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:cursor-not-allowed disabled:opacity-50
    transform active:scale-95
  `
  
  // Size variants
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
    xl: 'px-8 py-6 text-xl'
  }
  
  // Color variants with theme support
  const variantStyles = {
    primary: `
      bg-primary text-white hover:bg-primary/90 focus:ring-primary
      shadow-sm hover:shadow-md
    `,
    secondary: `
      bg-accent text-white hover:bg-accent/90 focus:ring-accent
      shadow-sm hover:shadow-md
    `,
    warning: `
      bg-warning text-white hover:bg-warning/90 focus:ring-warning
      shadow-sm hover:shadow-md
    `,
    danger: `
      bg-danger text-white hover:bg-danger/90 focus:ring-danger
      shadow-sm hover:shadow-md
    `,
    outline: `
      border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary
      bg-transparent
    `,
    ghost: `
      text-primary hover:bg-primary/10 focus:ring-primary
      bg-transparent
    `,
    success: `
      bg-accent text-white hover:bg-accent/90 focus:ring-accent
      shadow-sm hover:shadow-md
    `,
    muted: `
      bg-surface text-text hover:bg-surface/80 border border-border
      shadow-sm hover:shadow-md
    `
  }
  
  // Width styles
  const widthStyles = fullWidth ? 'w-full' : ''
  
  const combinedStyles = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${widthStyles}
    ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
    ${loading ? 'cursor-wait' : ''}
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
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  )
}

export default Button
