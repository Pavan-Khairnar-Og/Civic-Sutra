import React from 'react'

/**
 * Civic Badge Component
 * Clean, modern badges using the Civic design system
 * No gradients, no blue/purple colors - only Civic palette
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
    transform hover:scale-105
  `
  
  // Size variants
  const sizeStyles = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-5 py-2.5 text-lg'
  }
  
  // Color variants using Civic design system
  const variantStyles = {
    primary: 'bg-civic-orangeLight text-civic-orange border border-civic-orange/30',
    secondary: 'bg-civic-tealLight text-civic-teal border border-civic-teal/30',
    success: 'bg-civic-tealLight text-civic-teal border border-civic-teal/30',
    warning: 'bg-civic-amberLight text-civic-amber border border-civic-amber/30',
    danger: 'bg-civic-redLight text-civic-red border border-civic-red/30',
    info: 'bg-civic-orangeLight text-civic-orange border border-civic-orange/30',
    muted: 'bg-civic-muted text-civic-textSecondary border border-civic-muted/30',
    outline: 'border border-civic-muted text-civic-textSecondary hover:bg-civic-muted/50',
    solid: 'bg-civic-orange text-white',
    solidSecondary: 'bg-civic-teal text-white',
    solidMuted: 'bg-civic-muted text-civic-textPrimary'
  }
  
  // Status-specific colors
  const statusStyles = {
    pending: 'bg-civic-amberLight text-civic-amber border border-civic-amber/30',
    'in_progress': 'bg-civic-orangeLight text-civic-orange border border-civic-orange/30',
    'in-progress': 'bg-civic-orangeLight text-civic-orange border border-civic-orange/30',
    resolved: 'bg-civic-tealLight text-civic-teal border border-civic-teal/30',
    rejected: 'bg-civic-redLight text-civic-red border border-civic-red/30',
    draft: 'bg-civic-muted text-civic-textSecondary border border-civic-muted/30',
    published: 'bg-civic-tealLight text-civic-teal border border-civic-teal/30',
    archived: 'bg-civic-muted text-civic-textSecondary border border-civic-muted/30'
  }
  
  // Priority-specific colors
  const priorityStyles = {
    critical: 'bg-civic-redLight text-civic-red border border-civic-red/30',
    high: 'bg-civic-amberLight text-civic-amber border border-civic-amber/30',
    medium: 'bg-civic-orangeLight text-civic-orange border border-civic-orange/30',
    low: 'bg-civic-tealLight text-civic-teal border border-civic-teal/30'
  }
  
  // Choose color scheme
  let colorStyles = variantStyles[variant]
  if (statusStyles[variant]) {
    colorStyles = statusStyles[variant]
  } else if (priorityStyles[variant]) {
    colorStyles = priorityStyles[variant]
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
