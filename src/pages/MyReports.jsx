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
        
        // For debugging, let's not filter by user initially to see all reports
        // We can add filtering back once we confirm data is loading
        
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
          console.log('Reports:', data)
          console.log('Current user:', user)
          console.log('========================')
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
  }, [user])

  // Calculate stats
  const totalReports = reports.length
  const pendingCount = reports.filter(r => r.status === 'pending').length
  const inProgressCount = reports.filter(r => r.status === 'in_progress' || r.status === 'under_review').length
  const resolvedCount = reports.filter(r => r.status === 'resolved').length

  // Filter reports
  const filteredReports = reports.filter(report => {
    if (filter.status !== 'all' && report.status !== filter.status) return false
    if (filter.category !== 'all' && report.ai_issue_type !== filter.category) return false
    return true
  })

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-[#FCEAEA] text-[#C1121F]',
      high: 'bg-[#FBF0EB] text-[#D4522A]',
      medium: 'bg-[#FEF6E7] text-[#E9A84C]',
      low: 'bg-[#E8F6F4] text-[#2A9D8F]'
    }
    return colors[severity] || colors.medium
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-[#FEF6E7] text-[#E9A84C]',
      'under_review': 'bg-[#E8F6F4] text-[#2A9D8F]',
      'in_progress': 'bg-[#FBF0EB] text-[#D4522A]',
      'resolved': 'bg-[#E8F6F4] text-[#2A9D8F]'
    }
    return colors[status] || colors['pending']
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
            <h1 className="serif text-4xl font-bold text-[#1C1917] mb-2">
              My Reports
            </h1>
            <p className="text-[#6B6560]">
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
          <div className="bg-white rounded-2xl p-6 border border-[#E8E4DC]">
            <div className="text-[#6B6560] text-sm mb-1">Total Reports</div>
            <div className="text-[#1C1917] font-bold text-2xl">{totalReports}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#E8E4DC]">
            <div className="text-[#6B6560] text-sm mb-1">Pending</div>
            <div className="text-[#E9A84C] font-bold text-2xl">{pendingCount}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#E8E4DC]">
            <div className="text-[#6B6560] text-sm mb-1">In Progress</div>
            <div className="text-[#D4522A] font-bold text-2xl">{inProgressCount}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#E8E4DC]">
            <div className="text-[#6B6560] text-sm mb-1">Resolved</div>
            <div className="text-[#2A9D8F] font-bold text-2xl">{resolvedCount}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#1C1917] font-semibold text-lg">Filter Reports</h2>
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 bg-[#F8F6F1] border border-[#E8E4DC] rounded-xl px-4 py-2.5 text-[#1C1917] hover:border-[#D4522A] transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E8E4DC] rounded-xl shadow-lg z-10">
                <div className="p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#1C1917] mb-2">Status</label>
                    <select
                      value={filter.status}
                      onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full bg-[#F8F6F1] border border-[#E8E4DC] rounded-xl px-4 py-2.5 text-[#1C1917] focus:border-[#D4522A] outline-none"
                    >
                      <option value="all">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1C1917] mb-2">Category</label>
                    <select
                      value={filter.category}
                      onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-[#F8F6F1] border border-[#E8E4DC] rounded-xl px-4 py-2.5 text-[#1C1917] focus:border-[#D4522A] outline-none"
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
            <h3 className="text-[#1C1917] font-semibold text-xl mb-2">
              {reports.length === 0 ? 'No reports yet' : 'No reports found'}
            </h3>
            <p className="text-[#6B6560] text-sm mb-6">
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
                    <h3 className="font-semibold text-[#1C1917] text-lg mb-2">
                      {report.title}
                    </h3>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-[#FBF0EB] text-[#D4522A] rounded-full px-3 py-1 text-xs font-medium">
                        {report.ai_issue_type || 'General'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.ai_severity)}`}>
                        {report.ai_severity?.toUpperCase() || 'MEDIUM'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(report.status)}`}>
                        {report.status === 'resolved' && <CheckCircle className="w-3 h-3" />}
                        {(report.status === 'in_progress' || report.status === 'under_review') && <Clock className="w-3 h-3" />}
                        {report.status === 'pending' && <AlertTriangle className="w-3 h-3" />}
                        {report.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                    <p className="text-[#6B6560] text-sm mb-3 line-clamp-2">
                      {report.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#6B6560]">
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
