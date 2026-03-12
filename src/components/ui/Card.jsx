import React from 'react'

/**
 * Modern Card Component - Figma-style design system
 * Clean, minimal cards with soft shadows and rounded corners
 * Supports dark/light theme and hover animations
 */
const Card = ({ 
  children, 
  className = '',
  padding = 'md',
  shadow = 'sm',
  hover = false,
  border = true,
  ...props 
}) => {
  // Base styles with theme-aware colors
  const baseStyles = `
    bg-surface rounded-xl transition-all duration-300 ease-out
    ${border ? 'border border-border' : ''}
    ${hover ? 'hover:shadow-lg hover:-translate-y-1' : ''}
  `
  
  // Padding variants
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }
  
  // Shadow variants with theme awareness
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
    border-b border-border pb-4 mb-4
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
    border-t border-border pt-4 mt-4
    ${className}
  `.trim()
  return (
    <div className={styles} {...props}>
      {children}
    </div>
  )
}

export default Card
