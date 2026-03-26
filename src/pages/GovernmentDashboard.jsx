import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Skeleton from '../components/ui/Skeleton'
import { useToast } from '../components/ui/Toast'
import { MapPin, Calendar, User, AlertTriangle, Clock, CheckCircle } from 'lucide-react'

/**
 * Professional Government Dashboard
 * Features issue management, department filtering, analytics, and actions
 * Only accessible to government users and admins
 */
const GovernmentDashboard = () => {
  const { isGov } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeView, setActiveView] = useState('issues')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedIssues, setSelectedIssues] = useState([])
  const [analytics, setAnalytics] = useState({})
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { addToast } = useToast()

  // Department categories
  const departments = [
    { id: 'all', name: 'All Departments', icon: '🏛️' },
    { id: 'sanitation', name: 'Sanitation', icon: '🗑️' },
    { id: 'water', name: 'Water Supply', icon: '💧' },
    { id: 'electricity', name: 'Electricity', icon: '⚡' },
    { id: 'public_works', name: 'Public Works', icon: '🚧' },
    { id: 'health', name: 'Health', icon: '🏥' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'transport', name: 'Transport', icon: '🚌' }
  ]

  // Priority levels
  const priorities = [
    { id: 'critical', name: 'Critical', color: 'bg-red-500' },
    { id: 'high', name: 'High', color: 'bg-orange-500' },
    { id: 'medium', name: 'Medium', color: 'bg-yellow-500' },
    { id: 'low', name: 'Low', color: 'bg-green-500' }
  ]

  // Status options
  const statuses = [
    { id: 'Pending', name: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'Under Review', name: 'Under Review', color: 'bg-blue-100 text-blue-800' },
    { id: 'In Progress', name: 'In Progress', color: 'bg-orange-100 text-orange-800' },
    { id: 'Resolved', name: 'Resolved', color: 'bg-green-100 text-green-800' }
  ]

  /**
   * Fetch all reports from Supabase
   */
  const fetchReports = async () => {
    try {
      setLoading(true)
      setError('')
      addToast('Loading reports...', 'info')

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      console.log('Government Dashboard - Loaded reports:', data?.length || 0, 'reports')
      console.log('Report details:', data)
      setReports(data || [])
      calculateAnalytics(data || [])
      addToast(`Successfully loaded ${data?.length || 0} reports`, 'success')
    } catch (err) {
      setError(err.message)
      addToast(`Failed to fetch reports: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Calculate analytics from reports data
   */
  const calculateAnalytics = (reportsData) => {
    const total = reportsData.length
    const resolved = reportsData.filter(r => r.status === 'resolved').length
    const pending = reportsData.filter(r => r.status === 'pending').length
    const inProgress = reportsData.filter(r => r.status === 'in_progress').length

    // Department breakdown - use ai_issue_type instead of department
    const departmentStats = departments
      .filter(dept => dept.id !== 'all')
      .map(dept => ({
        ...dept,
        count: reportsData.filter(r => r.ai_issue_type === dept.name || 
                                   r.ai_issue_type?.toLowerCase().includes(dept.id)).length
      }))

    // Priority breakdown - use ai_severity instead of priority
    const priorityStats = priorities.map(priority => ({
      ...priority,
      count: reportsData.filter(r => r.ai_severity === priority.id).length
    }))

    // Top problem areas (by location)
    const locationStats = reportsData.reduce((acc, report) => {
      const key = `${report.latitude?.toFixed(3)},${report.longitude?.toFixed(3)}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const topLocations = Object.entries(locationStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }))

    setAnalytics({
      total,
      resolved,
      pending,
      inProgress,
      departmentStats,
      priorityStats,
      topLocations
    })
  }

  /**
   * Get filtered reports based on department and sort
   */
  const getFilteredReports = () => {
    let filtered = reports

    // Department filter - use ai_issue_type instead of department
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(report => 
        report.ai_issue_type === selectedDepartment ||
        report.ai_issue_type?.toLowerCase().includes(selectedDepartment)
      )
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        filtered.sort((a, b) => priorityOrder[b.ai_severity] - priorityOrder[a.ai_severity])
        break
      case 'location':
        filtered.sort((a, b) => {
          if (a.latitude === b.latitude) {
            return a.longitude - b.longitude
          }
          return a.latitude - b.latitude
        })
        break
      default:
        break
    }

    return filtered
  }

  /**
   * Update issue status in Supabase
   */
  const updateIssueStatus = async (issueId, newStatus) => {
    try {
      addToast('Updating issue status...', 'info')
      
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', issueId)

      if (error) {
        throw error
      }

      // Update local state
      setReports(prev => prev.map(report => 
        report.id === issueId 
          ? { ...report, status: newStatus, updated_at: new Date().toISOString() }
          : report
      ))

      // Recalculate analytics
      const updatedReports = reports.map(report => 
        report.id === issueId 
          ? { ...report, status: newStatus }
          : report
      )
      calculateAnalytics(updatedReports)

      addToast(`Issue status updated to ${newStatus}`, 'success')
    } catch (err) {
      addToast(`Failed to update issue status: ${err.message}`, 'error')
    }
  }

  /**
   * Handle issue selection
   */
  const toggleIssueSelection = (issueId) => {
    setSelectedIssues(prev => 
      prev.includes(issueId) 
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    )
  }

  /**
   * Bulk update selected issues
   */
  const bulkUpdateIssues = async (newStatus) => {
    if (selectedIssues.length === 0) return

    try {
      addToast(`Updating ${selectedIssues.length} issues to ${newStatus}...`, 'info')
      
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .in('id', selectedIssues)

      if (error) {
        throw error
      }

      // Update local state
      setReports(prev => prev.map(report => 
        selectedIssues.includes(report.id) 
          ? { ...report, status: newStatus, updated_at: new Date().toISOString() }
          : report
      ))

      setSelectedIssues([])
      
      // Recalculate analytics
      const updatedReports = reports.map(report => 
        selectedIssues.includes(report.id) 
          ? { ...report, status: newStatus }
          : report
      )
      calculateAnalytics(updatedReports)

      addToast(`Successfully updated ${selectedIssues.length} issues to ${newStatus}`, 'success')
    } catch (err) {
      addToast(`Failed to update issues: ${err.message}`, 'error')
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const filteredReports = getFilteredReports()

  if (!isGov) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to government users.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? '☰' : '☰'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'issues', name: 'All Issues', icon: '📋' },
            { id: 'departments', name: 'Departments', icon: '🏛️' },
            { id: 'analytics', name: 'Analytics', icon: '📊' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                activeView === item.id 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {!sidebarCollapsed && <span>{item.name}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Government Dashboard
            </h1>
            <Badge variant="info">
              {reports.length} Total Issues
            </Badge>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {loading ? (
            <div className="space-y-6">
              {/* Loading Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Skeleton variant="card" />
                <Skeleton variant="card" />
                <Skeleton variant="card" />
                <Skeleton variant="card" />
              </div>
              
              {/* Loading Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <TableSkeleton rows={5} />
              </div>
              
              {/* Loading Departments */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton variant="card" />
                <Skeleton variant="card" />
                <Skeleton variant="card" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">
              {error}
            </div>
          ) : (
            <>
              {/* Issues View */}
              {activeView === 'issues' && (
                <div className="space-y-6">
                  {/* Filters */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Filters & Sorting</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Department Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <select
                          value={selectedDepartment}
                          onChange={(e) => setSelectedDepartment(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>
                              {dept.icon} {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Sort */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sort By
                        </label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="newest">Newest First</option>
                          <option value="priority">Priority</option>
                          <option value="location">Location</option>
                        </select>
                      </div>

                      {/* Bulk Actions */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bulk Actions ({selectedIssues.length} selected)
                        </label>
                        <div className="space-y-2">
                          <Button
                            onClick={() => bulkUpdateStatus('in_progress')}
                            disabled={selectedIssues.length === 0}
                            variant="outline"
                            className="w-full"
                          >
                            Mark In Progress
                          </Button>
                          <Button
                            onClick={() => bulkUpdateStatus('resolved')}
                            disabled={selectedIssues.length === 0}
                            variant="outline"
                            className="w-full"
                          >
                            Mark Resolved
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Issues Table */}
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedIssues(filteredReports.map(r => r.id))
                                  } else {
                                    setSelectedIssues([])
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Issue
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Department
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Priority
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredReports.map(report => (
                            <tr key={report.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedIssues.includes(report.id)}
                                  onChange={() => toggleIssueSelection(report.id)}
                                  className="rounded border-gray-300"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  {report.image_url && (
                                    <div className="relative">
                                      <img
                                        src={report.image_url}
                                        alt="Issue"
                                        className="h-12 w-12 rounded-lg object-cover cursor-pointer hover:opacity-80"
                                        onClick={() => {
                                          const newWindow = window.open()
                                          newWindow.document.write(`<img src="${report.image_url}" style="max-width:100%;height:auto;" />`)
                                          newWindow.document.title = report.title
                                        }}
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {report.title || 'Untitled Issue'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {report.description?.substring(0, 100)}...
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="outline">
                                  {report.ai_issue_type || 'General'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={priorities.find(p => p.id === report.ai_severity)?.color}>
                                  {report.ai_severity ? report.ai_severity.charAt(0).toUpperCase() + report.ai_severity.slice(1) : 'Medium'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={statuses.find(s => s.id === report.status)?.color}>
                                  {report.status ? report.status.replace('_', ' ').toUpperCase() : 'PENDING'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex space-x-2">
                                  {report.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      onClick={() => updateIssueStatus(report.id, 'in_progress')}
                                    >
                                      Start Work
                                    </Button>
                                  )}
                                  {report.status === 'in_progress' && (
                                    <Button
                                      size="sm"
                                      onClick={() => updateIssueStatus(report.id, 'resolved')}
                                    >
                                      Mark Resolved
                                    </Button>
                                  )}
                                  {report.status === 'resolved' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateIssueStatus(report.id, 'in_progress')}
                                    >
                                      Reopen
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Departments View */}
              {activeView === 'departments' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analytics.departmentStats?.map(dept => (
                    <Card key={dept.id} className="hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {dept.icon} {dept.name}
                        </h3>
                        <Badge variant="info">
                          {dept.count} issues
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Pending:</span>
                          <span className="font-medium">{reports.filter(r => r.department === dept.id && r.status === 'pending').length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">In Progress:</span>
                          <span className="font-medium">{reports.filter(r => r.department === dept.id && r.status === 'in_progress').length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Resolved:</span>
                          <span className="font-medium">{reports.filter(r => r.department === dept.id && r.status === 'resolved').length}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Analytics View */}
              {activeView === 'analytics' && (
                <div className="space-y-6">
                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{analytics.total}</div>
                        <div className="text-gray-600">Total Issues</div>
                      </div>
                    </Card>
                    <Card>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{analytics.resolved}</div>
                        <div className="text-gray-600">Resolved</div>
                      </div>
                    </Card>
                    <Card>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-600">{analytics.pending}</div>
                        <div className="text-gray-600">Pending</div>
                      </div>
                    </Card>
                    <Card>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">{analytics.inProgress}</div>
                        <div className="text-gray-600">In Progress</div>
                      </div>
                    </Card>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Priority Distribution */}
                    <Card>
                      <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
                      <div className="space-y-3">
                        {analytics.priorityStats?.map(priority => (
                          <div key={priority.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-4 h-4 rounded ${priority.color}`}></div>
                              <span>{priority.name}</span>
                            </div>
                            <Badge variant="outline">{priority.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Top Problem Areas */}
                    <Card>
                      <h3 className="text-lg font-semibold mb-4">Top Problem Areas</h3>
                      <div className="space-y-3">
                        {analytics.topLocations?.map((location, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Area {index + 1}
                            </span>
                            <Badge variant="outline">{location.count} issues</Badge>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default GovernmentDashboard
