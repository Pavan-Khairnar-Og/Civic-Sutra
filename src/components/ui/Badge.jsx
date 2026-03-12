import React from 'react'

/**
 * Reusable Badge Component
 * Color-coded badges for status, priority, and categories
 * Mobile-friendly sizing
 */
const Badge = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  ...props 
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center font-medium rounded-full'
  
  // Size variants
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }
  
  // Color variants
  const variantStyles = {
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-green-100 text-green-800',
    warning: 'bg-orange-100 text-orange-800',
    danger: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800',
    info: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    outline: 'border border-gray-300 text-gray-700'
  }
  
  // Priority-specific colors
  const priorityStyles = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  }
  
  // Status-specific colors
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  }
  
  // Choose color scheme
  let colorStyles = variantStyles[variant]
  if (variantStyles[variant]) {
    colorStyles = variantStyles[variant]
  } else if (priorityStyles[variant]) {
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
