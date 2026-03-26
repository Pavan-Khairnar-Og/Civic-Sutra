import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import ReportCard from '../components/ReportCard'
import IssueMap from '../components/IssueMap'
import AIAnalysisDetails from '../components/AIAnalysisDetails'

/**
 * AdminDashboard page component
 * Dashboard for government staff to manage and track civic issues
 * Provides analytics, issue management, and status updates
 * Integrates with Supabase for real-time data
 */
const AdminDashboard = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [filter, setFilter] = useState({
    status: 'all',
    dateRange: 'all'
  })
  const [selectedReport, setSelectedReport] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    todayReports: 0
  })
  const [updatingStatus, setUpdatingStatus] = useState(null)

  /**
   * Fetch all reports from Supabase
   * Loads reports with error handling and loading states
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
      calculateStats(data || [])

    } catch (error) {
      console.error('Error fetching reports:', error)
      setError('Failed to load reports. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Calculate statistics from reports data
   * Provides overview metrics for dashboard
   */
  const calculateStats = (reportsData) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    const statsData = {
      total: reportsData.length,
      pending: reportsData.filter(r => r.status === 'pending').length,
      inProgress: reportsData.filter(r => r.status === 'in_progress').length,
      resolved: reportsData.filter(r => r.status === 'resolved').length,
      todayReports: reportsData.filter(r => {
        const reportDate = new Date(r.created_at)
        return reportDate >= today
      }).length
    }

    setStats(statsData)
  }

  /**
   * Update report status in Supabase
   * Handles status changes with optimistic updates
   */
  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      setUpdatingStatus(reportId)

      // Optimistic update
      setReports(prev => 
        prev.map(report => 
          report.id === reportId 
            ? { ...report, status: newStatus }
            : report
        )
      )

      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus })
        .eq('id', reportId)

      if (error) {
        throw error
      }

      // Recalculate stats after successful update
      const updatedReports = reports.map(report => 
        report.id === reportId 
          ? { ...report, status: newStatus }
          : report
      )
      calculateStats(updatedReports)

      setError('')
      
    } catch (error) {
      console.error('Error updating status:', error)
      setError('Failed to update status. Please try again.')
      
      // Revert optimistic update
      fetchReports()
    } finally {
      setUpdatingStatus(null)
    }
  }

  /**
   * Filter reports based on selected criteria
   * Updates filtered reports when filters change
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

    return filtered
  }

  /**
   * Handle report selection for detailed view
   */
  const handleReportSelect = (report) => {
    setSelectedReport(report)
    setActiveTab('details')
  }

  /**
   * Load reports on component mount
   */
  useEffect(() => {
    fetchReports()
  }, [])

  /**
   * Recalculate stats when reports change
   */
  useEffect(() => {
    calculateStats(reports)
  }, [reports])

  const filteredReports = getFilteredReports()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage and track civic issues reported by citizens
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📋 Reports ({filteredReports.length})
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'map'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🗺️ Map View
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <div className="text-blue-600 text-2xl">📋</div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Reports</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                  <div className="text-yellow-600 text-2xl">⏳</div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <div className="text-blue-600 text-2xl">🔧</div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">In Progress</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <div className="text-green-600 text-2xl">✅</div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Resolved</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.resolved}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Reports
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading reports...</p>
                </div>
              ) : reports.length > 0 ? (
                <div className="space-y-4">
                  {reports.slice(0, 5).map((report) => (
                    <div key={report.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {report.description?.substring(0, 100)}...
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(report.created_at).toLocaleString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          report.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📋</div>
                  <p className="text-gray-500">No reports found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Filter
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

              <div className="flex-1">
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
            </div>
          </div>

          {/* Reports Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading reports...</p>
            </div>
          ) : filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  showStatusUpdate={true}
                  onStatusChange={handleStatusUpdate}
                  showActions={true}
                  onViewDetails={handleReportSelect}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <p className="text-gray-500 text-lg">No reports found</p>
              <p className="text-gray-400 mt-2">
                Try adjusting the filters or check back later
              </p>
            </div>
          )}
        </div>
      )}

      {/* Map Tab */}
      {activeTab === 'map' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Issue Locations Map
            </h2>
            <IssueMap 
              reports={filteredReports} 
              height="600px"
              centerOnUser={true}
              showControls={true}
            />
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Report Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    Report ID: {selectedReport.id?.substring(0, 8)}...
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Report Information */}
                <ReportCard
                  report={selectedReport}
                  showStatusUpdate={true}
                  onStatusChange={handleStatusUpdate}
                  compact={false}
                />

                {/* AI Analysis Details */}
                <AIAnalysisDetails 
                  report={selectedReport} 
                  showFullDetails={true}
                />

                {/* Additional Actions */}
                <div className="flex flex-col sm:flex-row gap-4 p-6 bg-gray-50 rounded-lg">
                  {selectedReport.image_url && (
                    <button
                      onClick={() => window.open(selectedReport.image_url, '_blank')}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      🖼️ View Full Image
                    </button>
                  )}
                  
                  {selectedReport.latitude && selectedReport.longitude && (
                    <button
                      onClick={() => window.open(
                        `https://maps.google.com/?q=${selectedReport.latitude},${selectedReport.longitude}`,
                        '_blank'
                      )}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      📍 Open in Maps
                    </button>
                  )}
                  
                  {selectedReport.citizen_email && (
                    <button
                      onClick={() => window.open(`mailto:${selectedReport.citizen_email}`, '_blank')}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      📧 Contact Reporter
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
