import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ReportCard from '../components/ReportCard'

/**
 * MyReports page component
 * Displays all reports submitted by the current user
 * Shows status, priority, and allows filtering
 */
const MyReports = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    status: 'all',
    issueType: 'all',
    priority: 'all'
  })

  // Show success message if coming from report submission
  const [successMessage, setSuccessMessage] = useState('')
  
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      // Clear the message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('')
      }, 5000)
    }
  }, [location.state])

  // Mock data - in real app, this would come from Supabase
  const mockReports = [
    {
      id: '1',
      title: 'Large pothole on Main Street',
      issueType: 'pothole',
      description: 'There is a large pothole near the intersection of Main Street and Oak Avenue that is causing damage to vehicles.',
      status: 'pending',
      priority: 'high',
      location: 'Main Street & Oak Avenue',
      latitude: 40.7128,
      longitude: -74.0060,
      createdAt: '2024-01-15T10:30:00Z',
      imageUrl: 'https://via.placeholder.com/400x300?text=Pothole+Image'
    },
    {
      id: '2',
      title: 'Broken streetlight on Park Road',
      issueType: 'streetlight',
      description: 'Streetlight has been out for over a week, making the area unsafe at night.',
      status: 'in-progress',
      priority: 'medium',
      location: 'Park Road near community center',
      latitude: 40.7138,
      longitude: -74.0070,
      createdAt: '2024-01-14T15:45:00Z',
      imageUrl: 'https://via.placeholder.com/400x300?text=Streetlight+Image'
    },
    {
      id: '3',
      title: 'Garbage accumulation in public park',
      issueType: 'garbage',
      description: 'Trash bins are overflowing and garbage is spreading across the park area.',
      status: 'resolved',
      priority: 'low',
      location: 'Central Park, near entrance',
      latitude: 40.7148,
      longitude: -74.0080,
      createdAt: '2024-01-10T09:15:00Z',
      imageUrl: 'https://via.placeholder.com/400x300?text=Garbage+Image'
    }
  ]

  // Load reports on component mount
  useEffect(() => {
    const loadReports = async () => {
      setLoading(true)
      
      try {
        // In real app, this would fetch from Supabase
        // const { data, error } = await supabase
        //   .from('reports')
        //   .select('*')
        //   .eq('user_id', userId)
        //   .order('created_at', { ascending: false })
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setReports(mockReports)
        setFilteredReports(mockReports)
      } catch (error) {
        console.error('Error loading reports:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadReports()
  }, [])

  // Apply filters when reports or filter criteria change
  useEffect(() => {
    let filtered = reports
    
    if (filter.status !== 'all') {
      filtered = filtered.filter(report => report.status === filter.status)
    }
    
    if (filter.issueType !== 'all') {
      filtered = filtered.filter(report => report.issueType === filter.issueType)
    }
    
    if (filter.priority !== 'all') {
      filtered = filtered.filter(report => report.priority === filter.priority)
    }
    
    setFilteredReports(filtered)
  }, [reports, filter])

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilter(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  // Get unique values for filter options
  const getFilterOptions = (field) => {
    const values = [...new Set(reports.map(report => report[field]))]
    return values.sort()
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {successMessage}
        </div>
      )}
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-600 mt-2">
            Track the status of issues you've reported
          </p>
        </div>
        
        <button
          onClick={() => navigate('/report')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
          <div className="text-sm text-gray-600">Total Reports</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {reports.filter(r => r.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {reports.filter(r => r.status === 'in-progress').length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {reports.filter(r => r.status === 'resolved').length}
          </div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Filter Reports</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filter.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Type
            </label>
            <select
              value={filter.issueType}
              onChange={(e) => handleFilterChange('issueType', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {getFilterOptions('issueType').map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={filter.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div>
        {filteredReports.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <div className="text-gray-400 text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {reports.length === 0 ? 'No reports yet' : 'No reports match your filters'}
            </h3>
            <p className="text-gray-600 mb-4">
              {reports.length === 0 
                ? 'Start by reporting your first civic issue.'
                : 'Try adjusting your filters to see more reports.'
              }
            </p>
            {reports.length === 0 && (
              <button
                onClick={() => navigate('/report')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Report Your First Issue
              </button>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Showing {filteredReports.length} of {reports.length} reports
            </p>
            {filteredReports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyReports
