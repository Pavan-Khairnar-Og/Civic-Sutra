import React from 'react'

/**
 * Civic Card Component
 * Clean, modern cards using the Civic design system
 * No gradients, no blue/purple colors - only Civic palette
 */
const Card = ({ 
  children, 
  className = '',
  padding = 'md',
  shadow = 'md',
  hover = false,
  border = true,
  ...props 
}) => {
  // Base styles
  const baseStyles = `
    bg-civic-surface rounded-2xl transition-all duration-200 ease-out
    ${border ? 'border border-civic-muted' : ''}
    ${hover ? 'hover:border-civic-orange hover:shadow-lg' : ''}
  `
  
  // Padding variants
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }
  
  // Shadow variants
  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }
  
  const combinedStyles = `
    ${baseStyles}
    ${paddingStyles[padding]}
    ${shadowStyles[shadow]}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <div className={combinedStyles} {...props}>
      {children}
    </div>
  )
}

/**
 * Card Header Component
 */
Card.Header = ({ children, className = '', ...props }) => {
  const styles = `
    border-b border-civic-muted pb-4 mb-4
    ${className}
  `.trim()
  return (
    <div className={styles} {...props}>
      {children}
    </div>
  )
}

/**
 * Card Body Component
 */
Card.Body = ({ children, className = '', ...props }) => {
  const styles = `${className}`.trim()
  return (
    <div className={styles} {...props}>
      {children}
    </div>
  )
}

/**
 * Card Footer Component
 */
Card.Footer = ({ children, className = '', ...props }) => {
  const styles = `
    border-t border-civic-muted pt-4 mt-4
    ${className}
  `.trim()
  return (
    <div className={styles} {...props}>
      {children}
    </div>
  )
}

export default Card
