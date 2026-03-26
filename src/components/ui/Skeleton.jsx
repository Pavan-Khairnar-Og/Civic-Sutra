import React from 'react'
import { useTheme } from '../../context/ThemeContext'

/**
 * Skeleton loader component for loading states
 * Provides consistent loading UI across the application
 */
const Skeleton = ({ 
  className = '', 
  variant = 'default', 
  width = 'w-full', 
  height = 'h-4',
  rounded = 'rounded' 
}) => {
  const { isDark } = useTheme()
  
  const baseClasses = 'animate-pulse'
  const darkClasses = isDark ? 'bg-gray-700' : 'bg-gray-200'
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return `${baseClasses} ${darkClasses} h-4 rounded`
      case 'circular':
        return `${baseClasses} ${darkClasses} h-12 w-12 rounded-full`
      case 'card':
        return `${baseClasses} ${darkClasses} h-32 rounded-lg`
      case 'table-row':
        return `${baseClasses} space-y-2`
      case 'avatar':
        return `${baseClasses} ${darkClasses} h-10 w-10 rounded-full`
      case 'button':
        return `${baseClasses} ${darkClasses} h-10 w-20 rounded-lg`
      default:
        return `${baseClasses} ${darkClasses} ${width} ${height} ${rounded}`
    }
  }

  if (variant === 'table-row') {
    return (
      <div className={getVariantClasses()}>
        <div className="h-4 w-4 rounded"></div>
        <div className="h-4 w-24 rounded"></div>
        <div className="h-4 w-16 rounded"></div>
        <div className="h-4 w-20 rounded"></div>
        <div className="h-4 w-16 rounded"></div>
        <div className="h-4 w-16 rounded"></div>
      </div>
    )
  }

  return <div className={getVariantClasses()}></div>
}

/**
 * Card skeleton component
 */
export const CardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" />
        <div className="flex-1 space-y-2">
          <Skeleton height="h-6" width="w-3/4" />
          <Skeleton height="h-4" width="w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton height="h-4" />
        <Skeleton height="h-4" width="w-5/6" />
      </div>
      <div className="flex justify-between">
        <Skeleton height="h-8" width="w-20" />
        <Skeleton height="h-8" width="w-16" />
      </div>
    </div>
  )
}

/**
 * Table skeleton component
 */
export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <Skeleton height="h-4" width="w-8" />
              </th>
              <th className="px-6 py-3 text-left">
                <Skeleton height="h-4" width="w-24" />
              </th>
              <th className="px-6 py-3 text-left">
                <Skeleton height="h-4" width="w-20" />
              </th>
              <th className="px-6 py-3 text-left">
                <Skeleton height="h-4" width="w-16" />
              </th>
              <th className="px-6 py-3 text-left">
                <Skeleton height="h-4" width="w-16" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, index) => (
              <Skeleton key={index} variant="table-row" />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * List skeleton component
 */
export const ListSkeleton = ({ items = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  )
}

export default Skeleton
