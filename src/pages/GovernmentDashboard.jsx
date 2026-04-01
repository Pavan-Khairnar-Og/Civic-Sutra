import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../services/supabase'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Skeleton from '../components/ui/Skeleton'
import { useToast } from '../components/ui/Toast'
import { MapPin, Calendar, User, AlertTriangle, Clock, CheckCircle, TrendingUp, ShieldCheck } from 'lucide-react'

/**
 * Professional Government Dashboard
 * Features issue management, department filtering, analytics, and actions
 * Only accessible to government users and admins
 */
const GovernmentDashboard = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeView, setActiveView] = useState('issues')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedIssues, setSelectedIssues] = useState([])
  const [analytics, setAnalytics] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    inProgress: 0,
    resolvedToday: 0,
    avgResolution: 'No data',
    departmentStats: [],
    priorityStats: [],
    topLocations: []
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { addToast } = useToast()

  // Department categories
  const departments = [
    { id: 'all', name: t('dashboard.allIssues'), icon: '🏛️' },
    { id: 'sanitation', name: t('reportForm.sanitationWaste'), icon: '🗑️' },
    { id: 'water', name: t('reportForm.waterSupply'), icon: '💧' },
    { id: 'electricity', name: t('reportForm.streetLighting'), icon: '⚡' },
    { id: 'public_works', name: t('reportForm.roadsFootpaths'), icon: '🚧' },
    { id: 'health', name: t('reportForm.parksGardens'), icon: '🏥' },
    { id: 'education', name: t('reportForm.publicSafety'), icon: '🎓' },
    { id: 'transport', name: t('reportForm.municipalAdmin'), icon: '🚌' }
  ]

  // Priority levels
  const priorities = [
    { id: 'critical', name: t('reportForm.critical'), color: 'bg-red-500' },
    { id: 'high', name: t('reportForm.high'), color: 'bg-orange-500' },
    { id: 'medium', name: t('reportForm.medium'), color: 'bg-yellow-500' },
    { id: 'low', name: t('reportForm.low'), color: 'bg-green-500' }
  ]

  // Status options
  const statusOptions = [
    { id: 'Pending', name: t('status.pending'), color: 'bg-yellow-100 text-yellow-800' },
    { id: 'Under Review', name: t('status.underReview'), color: 'bg-blue-100 text-blue-800' },
    { id: 'In Progress', name: t('status.inProgress'), color: 'bg-orange-100 text-orange-800' },
    { id: 'Resolved', name: t('status.resolved'), color: 'bg-green-100 text-green-800' }
  ]

  /**
   * Fetch all reports from Supabase
   */
  const fetchReports = async () => {
    try {
      setLoading(true)
      setError('')
      addToast('Loading reports...', 'info')

      // Fetch reports first
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .order('priority_score', { ascending: false })

      if (reportsError) throw reportsError

      if (!reportsData || reportsData.length === 0) {
        setReports([])
        calculateAnalytics([])
        return
      }

      // Get unique non-null user IDs
      const userIds = [...new Set(reportsData.map(r => r.user_id).filter(id => id && id !== ''))]
      
      let profilesMap = {}
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds)
        
        if (!profilesError && profilesData) {
          profilesMap = profilesData.reduce((acc, p) => {
            acc[p.user_id] = p
            return acc
          }, {})
        } else if (profilesError) {
          console.warn('Could not fetch profiles for join:', profilesError.message)
        }
      }

      // Manual join: attach profiles to reports
      const enrichedReports = reportsData.map(report => ({
        ...report,
        profiles: profilesMap[report.user_id] || null
      }))

      console.log('Government Dashboard - Loaded and enriched reports:', enrichedReports.length)
      setReports(enrichedReports)
      calculateAnalytics(enrichedReports)
      addToast(`Successfully loaded ${enrichedReports.length} reports`, 'success')
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
      count: reportsData.filter(r => r.ai_severity?.toLowerCase() === priority.id.toLowerCase()).length
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

    const resolvedToday = reportsData.filter(r => {
      const updated = new Date(r.updated_at || r.created_at);
      const today = new Date();
      return r.status === 'resolved' && 
             updated.getDate() === today.getDate() &&
             updated.getMonth() === today.getMonth() &&
             updated.getFullYear() === today.getFullYear();
    }).length;

    // Calculate Average Resolution Time
    const resolvedReports = reportsData.filter(r => 
      r.status === 'resolved' && r.updated_at && r.created_at
    );

    let avgResolution = 'No data';
    if (resolvedReports.length > 0) {
      const totalMs = resolvedReports.reduce((sum, r) => {
        const created = new Date(r.created_at);
        const updated = new Date(r.updated_at);
        return sum + (updated - created);
      }, 0);
      const avgMs = totalMs / resolvedReports.length;
      const avgDays = avgMs / (1000 * 60 * 60 * 24);
      
      if (avgDays < 1) {
        avgResolution = `${Math.round(avgDays * 24)}h`;
      } else {
        avgResolution = `${avgDays.toFixed(1)}d`;
      }
    }

    setAnalytics({
      total: total || 0,
      resolved: resolved || 0,
      pending: pending || 0,
      inProgress: inProgress || 0,
      resolvedToday: resolvedToday || 0,
      avgResolution: avgResolution || "No data",
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

  if (!user) {
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
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Active" 
          value={analytics.total - analytics.resolved} 
          icon={<AlertTriangle className="text-blue-500" />}
          trend="+5% from last week"
        />
        <MetricCard 
          title="Critical Issues" 
          value={analytics.priorityStats?.find(p => p.id === 'critical')?.count || 0} 
          icon={<ShieldCheck className="text-red-500" />}
          color="text-red-600"
        />
        <MetricCard 
          title="Resolved Today" 
          value={analytics.resolvedToday || 0} 
          icon={<CheckCircle className="text-green-500" />}
        />
        <MetricCard 
          title="Avg. Resolution" 
          value={analytics.avgResolution || "No data"} 
          icon={<Clock className="text-orange-500" />}
        />
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-bold">Issue Command Center</h2>
          <div className="flex gap-3">
            <select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900 border-none rounded-lg text-sm px-3 py-2"
            >
              {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">Priority Score</th>
                <th className="px-6 py-4">Issue</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Reporter</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Reported</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredReports.map(report => (
                <IssueRow 
                  key={report.id} 
                  report={report} 
                  onStatusUpdate={updateIssueStatus}
                  navigate={navigate}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/**
 * Helper Components
 */
const normalizeCategory = (cat) => {
  if (!cat) return 'General';
  const c = cat.toLowerCase();
  if (c.includes('road') || c.includes('footpath')) return 'Roads & Footpaths';
  if (c.includes('water')) return 'Water Supply';
  if (c.includes('light') || c.includes('street')) return 'Street Lighting';
  if (c.includes('sanit') || c.includes('waste')) return 'Sanitation & Waste';
  if (c.includes('park') || c.includes('garden')) return 'Parks & Gardens';
  if (c.includes('safety')) return 'Public Safety';
  if (c.includes('municipal') || c.includes('admin')) return 'Municipal Administration';
  return cat; // return original if no match
};

const MetricCard = ({ title, value, icon, trend, color = "text-gray-900" }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">{icon}</div>
      {trend && <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">{trend}</span>}
    </div>
    <div className="text-sm text-gray-500 font-medium">{title}</div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
  </div>
);

const IssueRow = ({ report, onStatusUpdate, navigate }) => {
    // Use DB priority_score directly, exactly 0-100, no frontend re-calculation
    const score = Math.min(Math.round(report.priority_score || 0), 100);
    
    const pillClass =
      score >= 75 ? 'bg-[#fef2f2] text-[#dc2626]' :
      score >= 55 ? 'bg-[#fff7ed] text-[#c2410c]' :
      score >= 30 ? 'bg-[#fefce8] text-[#a16207]' :
                 'bg-[#f0fdf4] text-[#16a34a]';

    // Fix 3: Reporter name logic
    const getReporterName = (issue) => {
      if (issue.is_anonymous) return 'Anonymous';
      const fullName = issue.profiles?.full_name;
      if (fullName) return fullName.split(' ')[0]; // first name only
      return 'Citizen';
    };

    return (
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors group">
        <td className="px-6 py-4">
          <div className="flex items-start gap-4">
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-gray-100 text-lg mb-2">
                {report.title || 'Untitled Issue'}
              </h3>
              <div className="space-y-2">
                <p className="text-stone-600 dark:text-gray-400 text-sm">
                  {report.description}
                </p>
                <div className="text-xs text-stone-500 dark:text-gray-500 mt-2">
                  Reported: {new Date(report.created_at).toLocaleDateString()}
                </div>
                <div className="text-xs text-stone-500 dark:text-gray-500">
                  ID: {report.id?.slice(0,8).toUpperCase()}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <span className={`inline-flex items-center justify-center
                px-2 py-0.5 rounded-md text-xs font-bold
                ${pillClass}`}>
                {score}
              </span>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="max-w-[240px]">
            {/* Fix 2: Real title prominently displayed */}
            <div className="font-medium text-stone-900 dark:text-gray-100 text-sm truncate max-w-[200px]">
              {report.title || 'Untitled Issue'}
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div>
            {getReporterName(report)}
          </div>
        </td>
        <td className="px-6 py-4">
          <select 
            value={report.status}
            onChange={(e) => onStatusUpdate(report.id, e.target.value)}
            className={`text-[11px] font-bold border-none rounded-full px-3 py-1 cursor-pointer focus:ring-2 focus:ring-blue-500 ${
              report.status === 'resolved' ? 'bg-green-100 text-green-700' :
              report.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
              'bg-yellow-100 text-yellow-700'
            }`}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </td>
        <td className="px-6 py-4 text-xs text-gray-500 font-medium">
          {new Date(report.created_at).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 text-right">
          <button 
            onClick={() => navigate(`/admin/issue/${report.id}`)}
            className="text-xs font-bold text-blue-500 hover:text-blue-600 underline underline-offset-4"
          >
            Details
          </button>
        </td>
      </tr>
    );
  };

  // AI Intelligence Panel Component
  const AIPanel = ({ report }) => {
    if (!report.ai_description) return null;
    
    return (
      <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">🤖</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Intelligence Report</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Auto-generated analysis from AI image processing
          </div>
        </div>

        <div className="space-y-4">
          {/* Issue Classification */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Issue Type</div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {(report.ai_issue_type || report.issue_type || 'General').replace('_', ' ').toUpperCase()}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confidence</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {Math.round((report.ai_confidence || 0) * 100)}%
              </div>
            </div>
          </div>

          {/* Severity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Severity</div>
              <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
                report.ai_severity === 'critical' ? 'bg-red-100 text-red-700' :
                report.ai_severity === 'high' ? 'bg-orange-100 text-orange-700' :
                report.ai_severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {report.ai_severity?.toUpperCase() || 'MEDIUM'}
              </div>
            </div>
          </div>

          {/* AI Observations */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">🔍 AI Observations</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
              "{report.ai_description}"
            </p>
          </div>

          {/* Auto-routing */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">🎯 Auto-routed to</div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {report.ai_department || 'General Department'}
            </div>
          </div>

          {/* Priority Score */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📊 Priority Score</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {Math.min(Math.round(report.priority_score || 0), 100)}/100
            </div>
          </div>
        </div>
      </div>
    );
  };

export default GovernmentDashboard;
