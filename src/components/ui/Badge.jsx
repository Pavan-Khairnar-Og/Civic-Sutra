import React from 'react'

/**
 * Modern Badge Component - Figma-style design system
 * Clean, minimal badges with smooth animations and theme support
 * Color-coded badges for status, priority, and categories
 */
const Badge = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  ...props 
}) => {
  // Base styles
  const baseStyles = `
    inline-flex items-center font-medium rounded-full
    transition-all duration-200 ease-out
  `
  
  // Size variants
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }
  
  // Color variants with theme support
  const variantStyles = {
    primary: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-accent/10 text-accent border border-accent/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    danger: 'bg-danger/10 text-danger border border-danger/20',
    success: 'bg-accent/10 text-accent border border-accent/20',
    info: 'bg-primary/10 text-primary border border-primary/20',
    gray: 'bg-muted/10 text-muted border border-muted/20',
    outline: 'border border-border text-text',
    muted: 'bg-muted text-text'
  }
  
  // Priority-specific colors
  const priorityStyles = {
    critical: 'bg-danger/10 text-danger border border-danger/20',
    high: 'bg-warning/10 text-warning border border-warning/20',
    medium: 'bg-warning/10 text-warning/60 border border-warning/20',
    low: 'bg-accent/10 text-accent border border-accent/20'
  }
  
  // Status-specific colors
  const statusStyles = {
    pending: 'bg-warning/10 text-warning border border-warning/20',
    'in-progress': 'bg-primary/10 text-primary border border-primary/20',
    resolved: 'bg-accent/10 text-accent border border-accent/20',
    rejected: 'bg-danger/10 text-danger border border-danger/20'
  }
  
  // Choose color scheme
  let colorStyles = variantStyles[variant]
  if (priorityStyles[variant]) {
    colorStyles = priorityStyles[variant]
  } else if (statusStyles[variant]) {
    colorStyles = statusStyles[variant]
  }
  
  const combinedStyles = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${colorStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <span className={combinedStyles} {...props}>
      {children}
    </span>
  )
}

export default Badge
