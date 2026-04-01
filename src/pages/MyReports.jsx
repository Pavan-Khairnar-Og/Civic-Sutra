import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { 
  FileX, MapPin, CheckCircle, Clock, AlertTriangle, 
  Plus, Filter, ChevronDown
} from 'lucide-react'
import { supabase } from '../services/supabase'

/**
 * MyReports page component
 * Displays all reports submitted by the current user from localStorage
 */
const MyReports = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    status: 'all',
    category: 'all'
  })
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true)
        
        // Fetch all reports from Supabase for now to debug
        let query = supabase.from('reports').select('*')
        
        // Handle both user_id and citizen_email for existing reports with null user_id
        if (user?.id) {
          query = query.or(`user_id.eq.${user.id},citizen_email.eq.${user.email}`)
        }
        
        // Order by newest first
        query = query.order('created_at', { ascending: false })
        
        console.log('Fetching reports from Supabase...')
        const { data, error } = await query
        
        if (error) {
          console.error('Failed to load reports:', error)
          setReports([])
        } else {
          console.log('=== MY REPORTS DEBUG ===')
          console.log('Total reports loaded:', data?.length || 0)
          console.log('First report full object:', JSON.stringify(data[0], null, 2))
          console.log('Status field check:', {
            'report.status': data[0]?.status,
            'report.Status': data[0]?.Status,
            'report.issue_status': data[0]?.issue_status,
            'allKeys': Object.keys(data[0] || {})
          })
          console.log('All reports status values:', data.map(r => ({ id: r.id, status: r.status })))
          console.log('Current user:', user)
          console.log('========================')
          
          // Set reports without any transformation to preserve original data
          setReports(data || [])
        }
        
      } catch (err) {
        console.error('Failed to load reports:', err)
        setReports([])
      } finally {
        setLoading(false)
      }
    }
    
    loadReports()
    // Re-load when page gains focus (user returns from report page)
    window.addEventListener('focus', loadReports)
    return () => window.removeEventListener('focus', loadReports)
  }, [user?.id]) // Only re-fetch when user ID actually changes

  // Calculate stats
  const totalReports = reports.length
  const pendingCount = reports.filter(r => r.status === 'pending').length
  const inProgressCount = reports.filter(r => r.status === 'in_progress' || r.status === 'under_review').length
  const resolvedCount = reports.filter(r => r.status === 'resolved').length

  // Filter reports
  const filteredReports = reports.filter(report => {
    console.log(`🔍 FILTERING REPORT ${report.id}:`, {
      'report.status': report.status,
      'filter.status': filter.status,
      'status match': report.status === filter.status,
      'will pass': filter.status === 'all' || report.status === filter.status
    })
    
    if (filter.status !== 'all' && report.status !== filter.status) return false
    if (filter.category !== 'all' && report.ai_issue_type !== filter.category) return false
    return true
  })

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-[#FEE2E2] text-stone-900 dark:text-[#C1121F]',
      high: 'bg-[#FEF3C7] text-stone-900 dark:text-[#D4522A]',
      medium: 'bg-[#FEF9C3] text-stone-900 dark:text-[#E9A84C]',
      low: 'bg-[#F0FDF4] text-stone-900 dark:text-[#2A9D8F]'
    }
    return colors[severity] || colors.medium
  }

  const getStatusColor = (status) => {
    console.log(`🎨 getStatusColor called with:`, {
      'status': status,
      'type': typeof status,
      'length': status?.length,
      'trimmed': status?.trim(),
      'lowercase': status?.toLowerCase?.trim(),
      'original': JSON.stringify(status)
    })
    
    const colors = {
      // Lowercase values (what database actually has)
      'pending': 'bg-[#FEF6E7] text-stone-900 dark:text-[#E9A84C]',
      'under_review': 'bg-[#E8F6F4] text-stone-900 dark:text-[#2A9D8F]',
      'in_progress': 'bg-[#FEF3C7] text-stone-900 dark:text-[#D4522A]',
      'resolved': 'bg-[#E8F6F4] text-stone-900 dark:text-[#2A9D8F]',
      // Title case values (fallback)
      'Pending': 'bg-[#FEF6E7] text-stone-900 dark:text-[#E9A84C]',
      'Under Review': 'bg-[#E8F6F4] text-stone-900 dark:text-[#2A9D8F]',
      'In Progress': 'bg-[#FEF3C7] text-stone-900 dark:text-[#D4522A]',
      'Resolved': 'bg-[#E8F6F4] text-stone-900 dark:text-[#2A9D8F]'
    }
    
    const result = colors[status] || colors['resolved'] // Default to resolved, not pending
    console.log(`🎨 getStatusColor result:`, result)
    return result
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-civic-parchment pt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-[#E8E4DC] rounded w-48 mb-8"></div>
            <div className="grid grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-[#E8E4DC]">
                  <div className="h-6 bg-[#E8E4DC] rounded w-24 mb-2"></div>
                  <div className="h-8 bg-[#E8E4DC] rounded w-16"></div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-[#E8E4DC] h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-civic-parchment pt-20">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="serif text-4xl font-bold text-stone-900 dark:text-[#e8e0d5] mb-2">
              My Reports
            </h1>
            <p className="text-stone-600 dark:text-[#a89880]">
              Track the status of your reported issues
            </p>
          </div>
          <button
            onClick={() => navigate('/report')}
            className="bg-[#D4522A] hover:bg-[#B8441F] text-white rounded-full px-5 py-2.5 font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Report
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 dark:border-[#4a4035]">
            <div className="text-stone-600 dark:text-[#a89880] text-sm mb-1">Total Reports</div>
            <div className="text-stone-900 dark:text-[#e8e0d5] font-bold text-2xl">{totalReports}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-stone-200 dark:border-[#4a4035]">
            <div className="text-stone-600 dark:text-[#a89880] text-sm mb-1">Pending</div>
            <div className="text-orange-600 dark:text-[#e8692a] font-bold text-2xl">{pendingCount}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-stone-200 dark:border-[#4a4035]">
            <div className="text-stone-600 dark:text-[#a89880] text-sm mb-1">In Progress</div>
            <div className="text-orange-600 dark:text-[#e8692a] font-bold text-2xl">{inProgressCount}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-stone-200 dark:border-[#4a4035]">
            <div className="text-stone-600 dark:text-[#a89880] text-sm mb-1">Resolved</div>
            <div className="text-green-600 dark:text-[#4ade80] font-bold text-2xl">{resolvedCount}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-stone-900 dark:text-[#e8e0d5] font-semibold text-lg">Filter Reports</h2>
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 bg-stone-50 dark:bg-[#4a4035] border border-stone-200 dark:border-[#4a4035] rounded-xl px-4 py-2.5 text-stone-900 dark:text-[#e8e0d5] hover:border-orange-400 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-stone-900 dark:text-[#e8e0d5]">Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 dark:border-[#4a4035] rounded-xl shadow-lg z-10">
                <div className="p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-stone-900 dark:text-[#e8e0d5] mb-2">Status</label>
                    <select
                      value={filter.status}
                      onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full bg-stone-50 dark:bg-[#4a4035] border border-stone-200 dark:border-[#4a4035] rounded-xl px-4 py-2.5 text-stone-900 dark:text-[#e8e0d5] focus:border-orange-400 outline-none"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-900 dark:text-[#e8e0d5] mb-2">Category</label>
                    <select
                      value={filter.category}
                      onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-stone-50 dark:bg-[#4a4035] border border-stone-200 dark:border-[#4a4035] rounded-xl px-4 py-2.5 text-stone-900 dark:text-[#e8e0d5] focus:border-orange-400 outline-none"
                    >
                      <option value="all">All Categories</option>
                      <option value="Water Supply">Water Supply</option>
                      <option value="Roads & Footpaths">Roads & Footpaths</option>
                      <option value="Street Lighting">Street Lighting</option>
                      <option value="Sanitation & Waste">Sanitation & Waste</option>
                      <option value="Parks & Gardens">Parks & Gardens</option>
                      <option value="Public Safety">Public Safety</option>
                      <option value="Municipal Administration">Municipal Administration</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          // Empty state
          <div className="text-center py-20">
            <FileX className="w-16 h-16 text-[#C8C4BC] mx-auto mb-4" />
            <h3 className="text-stone-900 dark:text-[#e8e0d5] font-semibold text-xl mb-2">
              {reports.length === 0 ? 'No reports yet' : 'No reports found'}
            </h3>
            <p className="text-stone-600 dark:text-[#a89880] text-sm mb-6">
              {reports.length === 0 
                ? 'Issues you report will appear here' 
                : 'Try adjusting your filters to see more reports'
              }
            </p>
            {reports.length === 0 && (
              <button
                onClick={() => navigate('/report')}
                className="bg-[#D4522A] text-white rounded-full px-6 py-2.5 mt-6 font-medium transition-colors hover:bg-[#B8441F]"
              >
                Report Your First Issue
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-[#E8E4DC] rounded-2xl p-6 hover:border-[#D4522A] transition-all duration-200 hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(`/report/${report.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-stone-900 dark:text-[#e8e0d5] text-lg mb-2">
                      {report.title}
                    </h3>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-stone-100 dark:bg-[#4a4035] text-orange-600 dark:text-[#e8692a] rounded-full px-3 py-1 text-xs font-medium">
                        {report.ai_issue_type || 'General'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.ai_severity)}`}>
                        {report.ai_severity?.toUpperCase() || 'MEDIUM'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(report.status)}`}>
                        {(() => {
                          console.log(`🏷️ STATUS BADGE DEBUG for report ${report.id}:`, {
                            'report.status': report.status,
                            'getStatusColor result': getStatusColor(report.status),
                            'status type': typeof report.status,
                            'status length': report.status?.length,
                            'resolved check': report.status === 'resolved',
                            'pending check': report.status === 'pending',
                            'final display text': report.status ? report.status.replace('_', ' ').toUpperCase() : 'PENDING'
                          })
                          return null
                        })()}
                        {report.status === 'resolved' && <CheckCircle className="w-3 h-3" />}
                        {(report.status === 'in_progress' || report.status === 'under_review') && <Clock className="w-3 h-3" />}
                        {report.status === 'pending' && <AlertTriangle className="w-3 h-3" />}
                        {report.status ? report.status.replace('_', ' ').toUpperCase() : 'PENDING'}
                      </span>
                    </div>
                    {report.ai_description && (
                      <div className="mb-3 bg-stone-50 dark:bg-[#4a4035]/50 border border-stone-100 dark:border-[#4a4035] rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-[#c8bba6] mb-1">
                          <span className="text-[#2A9D8F]">🤖</span> AI Analysis
                        </div>
                        
                        {/* Issue Type and Severity */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              report.ai_severity === 'critical' ? 'bg-red-100 text-red-700' :
                              report.ai_severity === 'high' ? 'bg-orange-100 text-orange-700' :
                              report.ai_severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {(report.ai_issue_type || report.ai_issue_type || 'General').toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              report.ai_severity === 'critical' ? 'bg-red-100 text-red-700' :
                              report.ai_severity === 'high' ? 'bg-orange-100 text-orange-700' :
                              report.ai_severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {report.ai_severity?.toUpperCase() || 'MEDIUM'}
                            </span>
                          </div>
                          <div className="text-stone-600 dark:text-[#a89880] text-xs">
                            Confidence: {Math.round((report.ai_confidence || 0) * 100)}%
                          </div>
                        </div>

                        {/* Confidence Bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-[#2A9D8F] h-full transition-all duration-500"
                            style={{ width: `${Math.round((report.ai_confidence || 0) * 100)}%` }}
                          />
                        </div>

                        {/* AI Observations */}
                        <div className="mt-2 pt-2 border-t border-stone-200 dark:border-[#4a4035]">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-[#c8bba6] mb-1">
                            <span className="text-[#2A9D8F]">🔍</span> AI Observations
                          </div>
                          <p className="text-stone-600 dark:text-[#a89880] text-sm italic leading-relaxed">
                            "{report.ai_description}"
                          </p>
                        </div>

                        {/* Detected Objects */}
                        {(report.detectedObjects && report.detectedObjects.length > 0) ? (
                          <div className="mt-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-[#c8bba6] mb-1">
                              <span className="text-[#2A9D8F]">🏷️</span> Detected Objects
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {(report.detectedObjects || report.ai_issue_type?.split('_') || []).map((obj, i) => (
                                <span key={i} className="px-2 py-1 bg-stone-100 dark:bg-[#4a4035] text-stone-600 dark:text-[#a89880] rounded-full text-xs">
                                  {obj}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          /* Fallback: show issue type as detected objects */
                          <div className="mt-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-[#c8bba6] mb-1">
                              <span className="text-[#2A9D8F]">🏷️</span> Issue Type
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <span className="px-2 py-1 bg-stone-100 dark:bg-[#4a4035] text-stone-600 dark:text-[#a89880] rounded-full text-xs">
                                {(report.ai_issue_type || report.ai_issue_type || 'General').replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-stone-600 dark:text-[#a89880] text-sm mb-3 line-clamp-2">
                      {report.description}
                    </p>
                    <div className="flex items-center gap-4 text-stone-600 dark:text-[#a89880] text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{report.address || 'Location not set'}</span>
                      </div>
                      <div>
                        {formatDate(report.created_at)}
                      </div>
                    </div>
                  </div>
                  {report.image_url && (
                    <div className="flex gap-2 ml-4">
                      <img
                        src={report.image_url}
                        alt="Report image"
                        className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          const newWindow = window.open()
                          newWindow.document.write(`<img src="${report.image_url}" style="max-width:100%;height:auto;" />`)
                          newWindow.document.title = 'Report Image'
                        }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyReports
