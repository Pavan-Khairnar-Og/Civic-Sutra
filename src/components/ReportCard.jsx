import React from 'react'
import Card from './ui/Card'
import Badge from './ui/Badge'
import Button from './ui/Button'

/**
 * ReportCard component - Modern, mobile-first design
 * Displays a single civic issue report in a card format
 * Used in MyReports and AdminDashboard pages
 * Shows image, description, location, status, priority, and department
 */
const ReportCard = ({ 
  report, 
  showStatusUpdate = false, 
  onStatusChange = null,
  showActions = false,
  onViewDetails = null,
  compact = false 
}) => {
  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'critical'
      case 'high':
        return 'high'
      case 'medium':
        return 'medium'
      case 'low':
        return 'low'
      default:
        return 'medium'
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
      case 'rejected':
        return '❌'
      default:
        return '📋'
    }
  }

  // Get department icon
  const getDepartmentIcon = (department) => {
    switch (department?.toLowerCase()) {
      case 'sanitation':
        return '🗑️'
      case 'water supply':
        return '💧'
      case 'electricity':
        return '⚡'
      case 'public works':
        return '🏗️'
      case 'traffic':
        return '🚦'
      case 'parks':
        return '🌳'
      default:
        return '🏢'
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

  // Compact version for mobile
  if (compact) {
    return (
      <Card hover={true} className="p-4">
        <div className="flex gap-4">
          {/* Thumbnail */}
          {report.image_url && (
            <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={report.image_url}
                alt="Issue"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/80x80?text=No+Image'
                }}
              />
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Status and Priority */}
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={report.status} size="sm">
                {getStatusIcon(report.status)} {report.status || 'pending'}
              </Badge>
              <Badge variant={getPriorityColor(report.priority)} size="sm">
                {report.priority || 'medium'}
              </Badge>
              {report.ai_confidence && (
                <Badge variant="success" size="sm">
                  🤖 {Math.round(report.ai_confidence * 100)}%
                </Badge>
              )}
            </div>
            
            {/* Description */}
            <p className="text-sm text-gray-700 line-clamp-2 mb-2">
              {report.description || 'No description provided'}
            </p>
            
            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>📍 {formatLocation(report.latitude, report.longitude)}</span>
              <span>{formatTime(report.created_at)}</span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        {showActions && onViewDetails && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Button 
              variant="ghost" 
              size="sm" 
              fullWidth={true}
              onClick={() => onViewDetails(report)}
            >
              View Details
            </Button>
          </div>
        )}
      </Card>
    )
  }

  // Full version
  return (
    <Card hover={true} className="overflow-hidden">
      {/* Image Section */}
      {report.image_url && (
        <div className="relative h-48 sm:h-56 bg-gray-100">
          <img
            src={report.image_url}
            alt="Issue image"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available'
            }}
          />
          
          {/* Status Badge Overlay */}
          <div className="absolute top-3 right-3">
            <Badge variant={report.status} size="sm">
              {getStatusIcon(report.status)} {report.status || 'pending'}
            </Badge>
          </div>
          
          {/* Priority Badge Overlay */}
          <div className="absolute top-3 left-3">
            <Badge variant={getPriorityColor(report.priority)} size="sm">
              {report.priority || 'medium'} priority
            </Badge>
          </div>
          
          {/* AI Analysis Badge */}
          {report.ai_confidence && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="success" size="sm" className="bg-black/50 text-white">
                🤖 AI {Math.round(report.ai_confidence * 100)}%
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <Card.Body className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
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
          <p className="text-gray-700 line-clamp-3 leading-relaxed">
            {report.description || 'No description provided'}
          </p>
        </div>

        {/* Location and Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📍</span>
            <span className="font-mono text-xs break-all">
              {formatLocation(report.latitude, report.longitude)}
            </span>
          </div>
          
          {report.department && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">{getDepartmentIcon(report.department)}</span>
              <span className="capitalize">{report.department}</span>
            </div>
          )}
        </div>

        {/* AI Analysis Summary */}
        {report.ai_issue_type && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">🤖 AI Analysis</span>
              <Badge variant="success" size="sm">
                {Math.round((report.ai_confidence || 0) * 100)}% confidence
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Type:</span>
                <p className="font-medium text-gray-900">{report.ai_issue_type}</p>
              </div>
              <div>
                <span className="text-gray-600">Severity:</span>
                <p className="font-medium text-gray-900">{report.ai_severity || 'Unknown'}</p>
              </div>
              <div>
                <span className="text-gray-600">Department:</span>
                <p className="font-medium text-gray-900">{report.ai_department || 'Unassigned'}</p>
              </div>
              <div>
                <span className="text-gray-600">Valid:</span>
                <p className="font-medium text-gray-900">{report.ai_valid ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Section (Admin Only) */}
        {showStatusUpdate && onStatusChange && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
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
              <option value="rejected">❌ Rejected</option>
            </select>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && onViewDetails && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="primary" 
              size="md"
              fullWidth={true}
              onClick={() => onViewDetails(report)}
            >
              View Details
            </Button>
            {report.image_url && (
              <Button 
                variant="outline" 
                size="md"
                onClick={() => window.open(report.image_url, '_blank')}
              >
                View Image
              </Button>
            )}
          </div>
        )}

        {/* Report ID */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Report ID: {report.id?.substring(0, 8)}...
          </p>
        </div>
      </Card.Body>
    </Card>
  )
}

export default ReportCard
