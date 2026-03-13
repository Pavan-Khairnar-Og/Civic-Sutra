import React, { useState, useEffect, useRef } from 'react'

/**
 * Animated Counter Component
 * Counts up from 0 to target value with smooth animation
 * Supports duration, delay, and suffix
 */
const Counter = ({ end, duration = 1000, delay = 0, suffix = '' }) => {
  const [count, setCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const startTimeRef = useRef(null)

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setIsAnimating(true)
        startTimeRef.current = Date.now()
        
        const increment = end / (duration / 16) // 60fps
        let currentCount = 0
        
        const animate = () => {
          currentCount += increment
          
          if (currentCount >= end) {
            setCount(end)
            setIsAnimating(false)
            return
          }
          
          setCount(Math.floor(currentCount))
          requestAnimationFrame(animate)
        }
        
        requestAnimationFrame(animate)
      }, delay)
      
      return () => clearTimeout(timer)
    } else {
      // Start immediately
      setIsAnimating(true)
      startTimeRef.current = Date.now()
      
      const increment = end / (duration / 16) // 60fps
      let currentCount = 0
      
      const animate = () => {
        currentCount += increment
        
        if (currentCount >= end) {
          setCount(end)
          setIsAnimating(false)
          return
        }
        
        setCount(Math.floor(currentCount))
        requestAnimationFrame(animate)
      }
      
      requestAnimationFrame(animate)
    }
  }, [end, duration, delay])

  return (
    <span className={`inline-block ${isAnimating ? 'animate-pulse' : ''}`}>
      {count.toLocaleString()}{suffix}
    </span>
  )
}

export default Counter
