import React from 'react'

/**
 * Reusable Card Component
 * Clean, modern card design with subtle shadows and rounded corners
 * Mobile-first responsive design
 */
const Card = ({ 
  children, 
  className = '',
  padding = 'md',
  shadow = 'md',
  hover = false,
  ...props 
}) => {
  // Base styles
  const baseStyles = 'bg-white rounded-lg transition-all duration-200'
  
  // Padding variants
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  }
  
  // Shadow variants
  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }
  
  // Hover effect
  const hoverStyles = hover ? 'hover:shadow-lg transform hover:-translate-y-1' : ''
  
  const combinedStyles = `
    ${baseStyles}
    ${paddingStyles[padding]}
    ${shadowStyles[shadow]}
    ${hoverStyles}
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
  const styles = `border-b border-gray-200 pb-4 mb-4 ${className}`.trim()
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
  const styles = `border-t border-gray-200 pt-4 mt-4 ${className}`.trim()
  return (
    <div className={styles} {...props}>
      {children}
    </div>
  )
}

export default Card
