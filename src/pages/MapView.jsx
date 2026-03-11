import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import IssueMap from '../components/IssueMap'
import ReportCard from '../components/ReportCard'

/**
 * MapView page component
 * Displays all reported issues on an interactive map
 * Allows filtering and searching of issues by location
 * Integrates with Supabase for real-time data
 */
const MapView = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)
  const [filter, setFilter] = useState({
    status: 'all',
    dateRange: 'all'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [showSidebar, setShowSidebar] = useState(true)
  const [userLocation, setUserLocation] = useState(null)

  /**
   * Fetch all reports from Supabase
   * Loads reports with location data for map display
   */
  const fetchReports = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setReports(data || [])

    } catch (error) {
      console.error('Error fetching reports:', error)
      setError('Failed to load reports. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Get user's current location
   * Centers map on user's position
   */
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ latitude, longitude })
        },
        (error) => {
          console.error('Error getting location:', error)
          // Don't show error for location, just continue without it
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    }
  }

  /**
   * Filter reports based on selected criteria
   * Updates displayed reports when filters change
   */
  const getFilteredReports = () => {
    let filtered = [...reports]

    // Filter by status
    if (filter.status !== 'all') {
      filtered = filtered.filter(report => report.status === filter.status)
    }

    // Filter by date range
    if (filter.dateRange !== 'all') {
      const now = new Date()
      let filterDate

      switch (filter.dateRange) {
        case 'today':
          filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          filterDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        default:
          filterDate = null
      }

      if (filterDate) {
        filtered = filtered.filter(report => 
          new Date(report.created_at) >= filterDate
        )
      }
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(report => 
        report.description?.toLowerCase().includes(searchLower) ||
        report.status?.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }

  /**
   * Handle report selection from map
   * Shows detailed view of selected report
   */
  const handleReportSelect = (report) => {
    setSelectedReport(report)
    setShowSidebar(true)
  }

  /**
   * Handle marker click on map
   * Centers view on selected report
   */
  const handleMarkerClick = (report) => {
    setSelectedReport(report)
    // Could also center map on this location
  }

  /**
   * Clear all filters
   * Resets to show all reports
   */
  const clearFilters = () => {
    setFilter({
      status: 'all',
      dateRange: 'all'
    })
    setSearchTerm('')
  }

  /**
   * Load reports and get user location on component mount
   */
  useEffect(() => {
    fetchReports()
    getUserLocation()
  }, [])

  const filteredReports = getFilteredReports()
  const reportsWithLocation = filteredReports.filter(report => 
    report.latitude && report.longitude &&
    !isNaN(report.latitude) && !isNaN(report.longitude)
  )

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Map View
            </h1>
            <p className="text-sm text-gray-500">
              {reportsWithLocation.length} issues on map • {filteredReports.length} total filtered
            </p>
          </div>
          
          {/* Mobile Toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            🗺️
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}>
          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Filters & Search
            </h2>
            
            {/* Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Reports
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search descriptions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filter.status}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">⏳ Pending</option>
                <option value="in_progress">🔧 In Progress</option>
                <option value="resolved">✅ Resolved</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={filter.dateRange}
                onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>

          {/* Reports List */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reports ({filteredReports.length})
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading reports...</p>
              </div>
            ) : filteredReports.length > 0 ? (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => handleReportSelect(report)}
                    className={`cursor-pointer p-3 rounded-lg border transition-colors ${
                      selectedReport?.id === report.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status || 'pending'}
                      </span>
                      {report.latitude && report.longitude && (
                        <span className="text-xs text-gray-500">
                          📍 {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                      {report.description || 'No description'}
                    </p>
                    
                    <p className="text-xs text-gray-500">
                      {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">🗺️</div>
                <p className="text-gray-500">No reports found</p>
                <p className="text-gray-400 mt-2">
                  Try adjusting the filters
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {error && (
            <div className="absolute top-4 right-4 z-10 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-sm">
              {error}
            </div>
          )}
          
          <IssueMap 
            reports={reportsWithLocation} 
            height="100%"
            centerOnUser={userLocation !== null}
            showControls={true}
          />
        </div>
      </div>

      {/* Selected Report Details */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Report Details
                </h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <ReportCard
                report={selectedReport}
                showActions={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapView
