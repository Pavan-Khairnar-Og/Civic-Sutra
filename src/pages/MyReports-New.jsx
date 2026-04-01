import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../services/supabase'
import { 
  Search, PlusCircle, X, MapPin, Clock, Eye, Wrench, Check, 
  ChevronDown, ThumbsUp, Calendar, Filter, Grid, List, ArrowLeft,
  ArrowRight, Share2, MessageSquare
} from 'lucide-react'

/**
 * My Reports Page - Complete rebuild from scratch
 * Displays user's submitted civic issue reports with filtering, search, and detail drawer
 */
const MyReports = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [selectedReport, setSelectedReport] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showSeverityDropdown, setShowSeverityDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  // Department categories with icons
  const categories = [
    { id: 'all', name: 'All Categories', icon: '🏛️' },
    { id: 'Water Supply', name: 'Water Supply', icon: '💧', color: '#0077B6' },
    { id: 'Roads & Footpaths', name: 'Roads & Footpaths', icon: '🚧', color: '#92400E' },
    { id: 'Street Lighting', name: 'Street Lighting', icon: '💡', color: '#D97706' },
    { id: 'Sanitation & Waste', name: 'Sanitation & Waste', icon: '🗑️', color: '#4A4E69' },
    { id: 'Parks & Gardens', name: 'Parks & Gardens', icon: '🌳', color: '#2A9D8F' },
    { id: 'Public Safety', name: 'Public Safety', icon: '🚨', color: '#C1121F' },
    { id: 'Municipal Administration', name: 'Municipal Administration', icon: '🏢', color: '#6B6560' }
  ]

  const severities = [
    { id: 'all', name: 'All Severities' },
    { id: 'critical', name: 'Critical', color: '#DC2626' },
    { id: 'high', name: 'High', color: '#EA580C' },
    { id: 'medium', name: 'Medium', color: '#D97706' },
    { id: 'low', name: 'Low', color: '#059669' }
  ]

  const sortOptions = [
    { id: 'newest', name: 'Newest First' },
    { id: 'oldest', name: 'Oldest First' },
    { id: 'severity', name: 'Severity' },
    { id: 'status', name: 'Status' }
  ]

  // Load reports from Supabase
  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true)
        
        // Fetch all reports from Supabase
        let query = supabase.from('reports').select('*')
        
        // Filter based on user role
        if (!user) {
          // No user - just fetch reports with no user_id attached
          query = query.is('user_id', null)
        } else if (user.role === 'gov' || user.role === 'admin') {
          // Government users see all reports
          // No additional filter needed
        } else {
          // Regular citizens see only their own reports
          if (user.email) {
            query = query.eq('citizen_email', user.email)
          } else {
            // Fallback for anonymous user sessions
            query = query.is('user_id', null)
          }
        }
        
        // Order by newest first
        query = query.order('created_at', { ascending: false })
        
        console.log('=== MY REPORTS DEBUG ===')
        console.log('Fetching reports from Supabase...')
        const { data, error } = await query
        
        if (error) {
          console.error('Failed to load reports:', error)
          setReports([])
        } else {
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
    // Re-load when page gains focus
    window.addEventListener('focus', loadReports)
    return () => window.removeEventListener('focus', loadReports)
  }, [user])

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    let filtered = reports.filter(report => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!report.title.toLowerCase().includes(query) && 
            !report.description.toLowerCase().includes(query)) {
          return false
        }
      }
      
      // Status filter - use lowercase status from Supabase
      if (statusFilter !== 'all' && report.status !== statusFilter.toLowerCase()) {
        return false
      }
      
      // Category filter - use ai_issue_type from Supabase
      if (categoryFilter !== 'all' && report.ai_issue_type !== categoryFilter) {
        return false
      }
      
      // Severity filter - use ai_severity from Supabase
      if (severityFilter !== 'all' && report.ai_severity !== severityFilter) {
        return false
      }
      
      return true
    })

    // Sort reports
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          return severityOrder[b.ai_severity] - severityOrder[a.ai_severity]
        case 'status':
          const statusOrder = { pending: 1, under_review: 2, in_progress: 3, resolved: 4 }
          return statusOrder[b.status] - statusOrder[a.status]
        default: // newest
          return new Date(b.created_at) - new Date(a.created_at)
      }
    })
  }, [reports, searchQuery, statusFilter, categoryFilter, severityFilter, sortBy])

  // Get active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (statusFilter !== 'all') count++
    if (categoryFilter !== 'all') count++
    if (severityFilter !== 'all') count++
    if (searchQuery) count++
    return count
  }, [statusFilter, categoryFilter, severityFilter, searchQuery])

  // Get category info
  const getCategoryInfo = (categoryName) => {
    return categories.find(cat => cat.name === categoryName) || categories[0]
  }

  // Get severity color
  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-amber-500',
      low: 'bg-teal-500'
    }
    return colors[severity] || colors.medium
  }

  // Get status styling
  const getStatusInfo = (status) => {
    const statusMap = {
      'Pending': {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        icon: Clock,
        label: 'Pending'
      },
      'Under Review': {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: Eye,
        label: 'Under Review'
      },
      'In Progress': {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        icon: Wrench,
        label: 'In Progress'
      },
      'Resolved': {
        bg: 'bg-teal-100',
        text: 'text-teal-800',
        icon: Check,
        label: 'Resolved'
      }
    }
    return statusMap[status] || statusMap['Pending']
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  // Handle upvote
  const handleUpvote = async (reportId) => {
    // Update local state immediately for better UX
    const updatedReports = reports.map(report => {
      if (report.id === reportId) {
        return { ...report, upvotes: (report.upvotes || 0) + 1 }
      }
      return report
    })
    setReports(updatedReports)
    
    // Update in Supabase
    try {
      const { error } = await supabase
        .from('reports')
        .update({ upvotes: (reports.find(r => r.id === reportId)?.upvotes || 0) + 1 })
        .eq('id', reportId)
      
      if (error) {
        console.error('Failed to update upvotes:', error)
        // Revert local state if Supabase update fails
        setReports(reports)
      }
    } catch (err) {
      console.error('Error updating upvotes:', err)
      // Revert local state if error occurs
      setReports(reports)
    }
  }

  // Share report
  const handleShare = (reportId) => {
    const url = `${window.location.origin}/report/${reportId}`
    navigator.clipboard.writeText(url)
    // You could add a toast notification here
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-civic-parchment flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-civic-orange"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-civic-parchment">
      {/* Page Header */}
      <div className="bg-white border-b border-civic-muted">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-4xl text-civic-textPrimary mb-2">{t('navigation.myReports')}</h1>
              <p className="text-civic-textSecondary">{t('home.step2Desc')}</p>
            </div>
            <button
              onClick={() => navigate('/report')}
              className="bg-civic-orange text-white rounded-full px-6 py-3 font-medium flex items-center gap-2 hover:bg-civic-orange/90 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              {t('issue.reportIssue')}
            </button>
          </div>
        </div>
      </div>

      {/* Anonymous User Banner */}
      {!user && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-6xl mx-auto px-6 py-3">
            <p className="text-amber-800 text-sm">
              You're viewing reports saved to this device. 
              <button 
                onClick={() => navigate('/login')}
                className="underline ml-1 font-medium hover:text-amber-900"
              >
                Sign in
              </button> 
              {' '}to access reports from any device.
            </p>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white border-b border-civic-muted sticky top-16 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-civic-textSecondary" />
              <input
                type="text"
                placeholder={t('messages.searchReports')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-civic-parchment rounded-full border border-civic-muted focus:outline-none focus:ring-2 focus:ring-civic-orange/20"
              />
            </div>

            {/* Status Filter */}
            <div className="flex bg-civic-parchment rounded-full p-1">
              {['all', 'pending', 'under_review', 'in_progress', 'resolved'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === status 
                      ? 'bg-civic-orange text-white' 
                      : 'text-civic-textSecondary hover:text-civic-textPrimary'
                  }`}
                >
                  {status === 'all' ? t('common.view') : status === 'under_review' ? t('status.under_review') : status === 'in_progress' ? t('status.inProgress') : t(`status.${status}`)}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-civic-parchment rounded-full text-sm font-medium text-civic-textSecondary hover:text-civic-textPrimary transition-colors"
              >
                {getCategoryInfo(categoryFilter).icon} {getCategoryInfo(categoryFilter).name}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showCategoryDropdown && (
                <div className="absolute top-full mt-2 w-48 bg-white rounded-xl border border-civic-muted shadow-lg z-20">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setCategoryFilter(category.name)
                        setShowCategoryDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-civic-parchment flex items-center gap-2"
                    >
                      {category.icon} {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Severity Filter */}
            <div className="relative">
              <button
                onClick={() => setShowSeverityDropdown(!showSeverityDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-civic-parchment rounded-full text-sm font-medium text-civic-textSecondary hover:text-civic-textPrimary transition-colors"
              >
                Severity
                <ChevronDown className="w-4 h-4" />
              </button>
              {showSeverityDropdown && (
                <div className="absolute top-full mt-2 w-40 bg-white rounded-xl border border-civic-muted shadow-lg z-20">
                  {severities.map(severity => (
                    <button
                      key={severity.id}
                      onClick={() => {
                        setSeverityFilter(severity.id)
                        setShowSeverityDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-civic-parchment flex items-center gap-2"
                    >
                      {severity.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-civic-parchment rounded-full text-sm font-medium text-civic-textSecondary hover:text-civic-textPrimary transition-colors"
              >
                {sortOptions.find(opt => opt.id === sortBy)?.name}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showSortDropdown && (
                <div className="absolute top-full mt-2 w-40 bg-white rounded-xl border border-civic-muted shadow-lg z-20">
                  {sortOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSortBy(option.id)
                        setShowSortDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-civic-parchment"
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-civic-orange/20 text-civic-orange' : 'text-civic-textSecondary hover:text-civic-textPrimary'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-civic-orange/20 text-civic-orange' : 'text-civic-textSecondary hover:text-civic-textPrimary'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Count Badge */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 bg-civic-orange rounded-full"></div>
              <span className="text-sm text-civic-textSecondary">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Reports Grid/List */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {filteredReports.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-civic-parchment rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-civic-textSecondary" />
            </div>
            <h2 className="font-serif text-2xl text-civic-textPrimary mb-2">No reports yet</h2>
            <p className="text-civic-textSecondary mb-6">When you report a civic issue, it will appear here.</p>
            <button
              onClick={() => navigate('/report')}
              className="bg-civic-orange text-white rounded-full px-6 py-3 font-medium hover:bg-civic-orange/90 transition-colors"
            >
              Report Your First Issue
            </button>
          </div>
        ) : (
          /* Reports Display */
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            <AnimatePresence>
              {filteredReports.map((report, index) => {
                const categoryInfo = getCategoryInfo(report.category)
                const statusInfo = getStatusInfo(report.status)
                const StatusIcon = statusInfo.icon

                return viewMode === 'grid' ? (
                  /* Grid Card View */
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    className="bg-white rounded-2xl border border-civic-muted overflow-hidden cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    {/* Image Area */}
                    <div className="h-40 relative">
                      {report.image_url ? (
                        <img 
                          src={report.image_url} 
                          alt={report.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: categoryInfo.color + '20' }}
                        >
                          <span className="text-4xl">{categoryInfo.icon}</span>
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="bg-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          {categoryInfo.icon} {categoryInfo.name}
                        </span>
                      </div>
                      
                      {/* Severity Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`w-3 h-3 rounded-full ${getSeverityColor(report.ai_severity)}`}></span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4">
                      <h3 className="font-semibold text-civic-textPrimary mb-2 line-clamp-2">
                        {report.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-civic-textSecondary text-sm mb-3">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">
                          {report.address || 'Location not specified'}
                        </span>
                      </div>
                      
                      <div className="text-civic-textSecondary text-sm mb-3">
                        {formatDate(report.created_at)}
                      </div>
                      
                      {/* Status Pill */}
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text} mb-3`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </div>
                      
                      {/* Upvote Row */}
                      <div className="flex items-center justify-between mb-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUpvote(report.id)
                          }}
                          className="flex items-center gap-1 text-civic-textSecondary hover:text-civic-orange transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{report.upvotes || 0}</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleShare(report.id)
                          }}
                          className="text-civic-textSecondary hover:text-civic-orange transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* View Details Link */}
                      <button className="text-civic-orange font-medium text-sm hover:underline">
                        View Details →
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* List View */
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl border border-civic-muted p-4 flex gap-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedReport(report)}
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      {report.image_url ? (
                        <img 
                          src={report.image_url} 
                          alt={report.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: categoryInfo.color + '20' }}
                        >
                          <span className="text-2xl">{categoryInfo.icon}</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-civic-textPrimary mb-1">
                        {report.title}
                      </h3>
                      
                      <div className="flex items-center gap-3 text-civic-textSecondary text-sm mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="line-clamp-1">
                            {report.address || 'Location not specified'}
                          </span>
                        </div>
                        <span>•</span>
                        <span>{formatDate(report.created_at)}</span>
                      </div>
                      
                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white px-2 py-1 rounded-full text-xs font-medium border border-civic-muted flex items-center gap-1">
                          {categoryInfo.icon} {categoryInfo.name}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${getSeverityColor(report.ai_severity)}`}></span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex flex-col items-end gap-2">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </div>
                      
                      <button className="text-civic-orange font-medium text-sm hover:underline">
                        View
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Report Detail Drawer */}
      <AnimatePresence>
        {selectedReport && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setSelectedReport(null)}
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-[520px] bg-white shadow-2xl z-50 overflow-y-auto"
            >
              {selectedReport && (
                <>
                  {/* Header */}
                  <div className="sticky top-0 bg-white border-b border-civic-muted p-6 flex items-center justify-between">
                    <h2 className="font-serif text-2xl text-civic-textPrimary">
                      Report #{selectedReport.id?.slice(-8).toUpperCase()}
                    </h2>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="p-2 hover:bg-civic-parchment rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-civic-textSecondary" />
                    </button>
                  </div>

                  {/* Image Carousel */}
                  {selectedReport.image_url && (
                    <div className="relative aspect-video bg-gray-100">
                      <img
                        src={selectedReport.image_url}
                        alt="Report image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Info Section */}
                  <div className="p-6">
                    <h1 className="font-serif text-3xl text-civic-textPrimary mb-4">
                      {selectedReport.title}
                    </h1>
                    
                    {/* Badges */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className="bg-civic-parchment px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        {getCategoryInfo(selectedReport.ai_issue_type).icon} {getCategoryInfo(selectedReport.ai_issue_type).name}
                      </span>
                      <span className={`w-3 h-3 rounded-full ${getSeverityColor(selectedReport.ai_severity)}`}></span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(selectedReport.status).bg} ${getStatusInfo(selectedReport.status).text}`}>
                        {(() => {
                          const StatusIcon = getStatusInfo(selectedReport.status).icon
                          return <StatusIcon className="w-3 h-3" />
                        })()}
                        {getStatusInfo(selectedReport.status).label}
                      </span>
                    </div>

                    {/* Submitted Info */}
                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                      <div>
                        <span className="text-civic-textSecondary">Submitted</span>
                        <div className="font-medium text-civic-textPrimary">
                          {new Date(selectedReport.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div>
                        <span className="text-civic-textSecondary">By</span>
                        <div className="font-medium text-civic-textPrimary">
                          {selectedReport.is_anonymous ? 'Anonymous User' : selectedReport.citizen_email || 'Unknown User'}
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="mb-6">
                      <h3 className="font-medium text-civic-textPrimary mb-2">Location</h3>
                      <div className="bg-civic-parchment rounded-xl p-4">
                        <div className="flex items-center gap-2 text-civic-textSecondary">
                          <MapPin className="w-4 h-4" />
                          <span>{selectedReport.address || 'Location not specified'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                      <h3 className="font-medium text-civic-textPrimary mb-2">Description</h3>
                      <p className="text-civic-textSecondary leading-relaxed">
                        {selectedReport.description}
                      </p>
                    </div>

                    {/* Upvote Button */}
                    <div className="flex justify-center mb-8">
                      <button
                        onClick={() => handleUpvote(selectedReport.id)}
                        className="flex items-center gap-3 bg-civic-orange text-white rounded-full px-6 py-3 font-medium hover:bg-civic-orange/90 transition-colors"
                      >
                        <ThumbsUp className="w-5 h-5" />
                        <span>{selectedReport.upvotes || 0} Upvotes</span>
                      </button>
                    </div>

                    {/* Status Timeline */}
                    <div className="mb-8">
                      <h3 className="font-medium text-civic-textPrimary mb-4">Progress Timeline</h3>
                      <div className="space-y-4">
                        {[
                          { step: 'Submitted', status: 'completed', iconKey: 'Check' },
                          { step: 'Under Review', status: selectedReport.status === 'pending' ? 'current' : 'completed', iconKey: 'Eye' },
                          { step: 'In Progress', status: selectedReport.status === 'in_progress' ? 'current' : selectedReport.status === 'resolved' ? 'completed' : 'upcoming', iconKey: 'Wrench' },
                          { step: 'Resolved', status: selectedReport.status === 'resolved' ? 'current' : 'upcoming', iconKey: 'Check' }
                        ].map((item, index) => {
                          const icons = { Check, Eye, Wrench }
                          const IconComponent = icons[item.iconKey]
                          
                          return (
                            <div key={item.step} className="flex items-start gap-4">
                              <div className="relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  item.status === 'completed' ? 'bg-teal-500 text-white' :
                                  item.status === 'current' ? 'bg-civic-orange text-white' :
                                  'bg-gray-200 text-gray-400'
                                }`}>
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                {index < 3 && (
                                  <div className={`absolute top-8 left-4 w-0.5 h-8 -translate-x-1/2 ${
                                    item.status === 'completed' ? 'bg-teal-500' : 'bg-gray-200'
                                  }`} />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className={`font-medium ${
                                  item.status === 'current' ? 'text-civic-orange' : 'text-civic-textPrimary'
                                }`}>
                                  {item.step}
                                </div>
                                <div className="text-sm text-civic-textSecondary">
                                  {item.status === 'completed' ? 'Completed' : 
                                   item.status === 'current' ? 'In progress...' : 'Pending'}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Comments Section */}
                    <div className="mb-8">
                      <h3 className="font-medium text-civic-textPrimary mb-4">Updates</h3>
                      {selectedReport.updates && selectedReport.updates.length > 0 ? (
                        <div className="space-y-3">
                          {selectedReport.updates.map((update, index) => (
                            <div key={index} className="bg-civic-parchment rounded-xl p-4">
                              <div className="text-sm text-civic-textSecondary mb-1">
                                {update.date}
                              </div>
                              <div className="text-civic-textPrimary">
                                {update.message}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-civic-textSecondary">No updates yet from the department.</p>
                      )}
                    </div>

                    {/* Share Button */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleShare(selectedReport.id)}
                        className="flex items-center gap-2 bg-civic-parchment text-civic-textPrimary rounded-full px-6 py-3 font-medium hover:bg-civic-parchment/80 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        Share this issue
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MyReports
