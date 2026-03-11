import React from 'react'

/**
 * ReportCard component
 * Displays a single civic issue report in a card format
 * Used in MyReports and AdminDashboard pages
 * Shows image, description, location, status, and created time
 */
const ReportCard = ({ 
  report, 
  showStatusUpdate = false, 
  onStatusChange = null,
  showActions = false,
  onViewDetails = null 
}) => {
  // Get status color based on issue status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '⏳'
      case 'in_progress':
        return '🔧'
      case 'resolved':
        return '✅'
      default:
        return '📋'
    }
  }

  // Handle status change
  const handleStatusChange = (newStatus) => {
    if (onStatusChange) {
      onStatusChange(report.id, newStatus)
    }
  }

  // Format location for display
  const formatLocation = (lat, lng) => {
    if (!lat || !lng) return 'Location not available'
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }

  // Format creation time using native JavaScript
  const formatTime = (createdAt) => {
    if (!createdAt) return 'Unknown time'
    try {
      const date = new Date(createdAt)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      const diffMinutes = Math.floor(diffTime / (1000 * 60))

      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      } else if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
      } else {
        return 'Just now'
      }
    } catch (error) {
      return 'Invalid date'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100">
      {/* Image Section */}
      {report.image_url && (
        <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
          <img
            src={report.image_url}
            alt="Issue image"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available'
            }}
          />
          
          {/* Status Badge Overlay */}
          <div className="absolute top-2 right-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(report.status)}`}>
              {getStatusIcon(report.status)} {report.status || 'pending'}
            </span>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Civic Issue Report
            </h3>
            <p className="text-sm text-gray-500">
              {formatTime(report.created_at)}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-gray-700 line-clamp-3">
            {report.description || 'No description provided'}
          </p>
        </div>

        {/* Location */}
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📍</span>
            <span className="font-mono text-xs">
              {formatLocation(report.latitude, report.longitude)}
            </span>
          </div>
        </div>

        {/* Status Update Section (Admin Only) */}
        {showStatusUpdate && onStatusChange && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Status:
            </label>
            <select
              value={report.status || 'pending'}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">⏳ Pending</option>
              <option value="in_progress">🔧 In Progress</option>
              <option value="resolved">✅ Resolved</option>
            </select>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && onViewDetails && (
          <div className="flex space-x-3">
            <button
              onClick={() => onViewDetails(report)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              View Details
            </button>
            {report.image_url && (
              <button
                onClick={() => window.open(report.image_url, '_blank')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                View Image
              </button>
            )}
          </div>
        )}

        {/* Report ID */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Report ID: {report.id?.substring(0, 8)}...
          </p>
        </div>
      </div>
    </div>
  )
}

export default ReportCard
