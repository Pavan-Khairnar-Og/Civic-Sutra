import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { 
  ArrowLeft, MapPin, Calendar, User, FileText, AlertTriangle,
  CheckCircle, Clock, Plus, Download, Share2, MessageSquare
} from 'lucide-react'
import { supabase } from '../services/supabase'

/**
 * ReportDetail page component
 * Displays detailed information about a specific report
 */
const ReportDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadReport = async () => {
      try {
        // Fetch report from Supabase
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) {
          console.error('Failed to load report:', error)
          setReport(null)
        } else if (data) {
          setReport(data)
        } else {
          // Report not found
          setReport(null)
        }
      } catch (err) {
        console.error('Failed to load report:', err)
        setReport(null)
      } finally {
        setLoading(false)
      }
    }
    
    loadReport()
  }, [id])

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4" />
      case 'in_progress':
      case 'under_review': return <Clock className="w-4 h-4" />
      case 'pending': return <AlertTriangle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getResponseTime = (severity) => {
    const times = {
      critical: '24-48 hours',
      high: '3-5 days',
      medium: '1-2 weeks',
      low: '2-4 weeks'
    }
    return times[severity] || times.medium
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-civic-parchment pt-20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-[#E8E4DC] rounded w-48 mb-8"></div>
            <div className="bg-white rounded-2xl p-8 border border-[#E8E4DC]">
              <div className="h-6 bg-[#E8E4DC] rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-[#E8E4DC] rounded w-full mb-2"></div>
              <div className="h-4 bg-[#E8E4DC] rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-civic-parchment pt-20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-[#C8C4BC] mx-auto mb-4" />
            <h3 className="text-[#1C1917] font-semibold text-xl mb-2">
              Report Not Found
            </h3>
            <p className="text-[#6B6560] text-sm mb-6">
              The report you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/my-reports')}
              className="bg-[#D4522A] text-white rounded-full px-6 py-2.5 font-medium transition-colors hover:bg-[#B8441F]"
            >
              Back to My Reports
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-civic-parchment pt-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/my-reports')}
            className="p-2 rounded-lg hover:bg-[#F8F6F1] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#1C1917]" />
          </button>
          <div>
            <h1 className="serif text-3xl font-bold text-[#1C1917]">
              Report Details
            </h1>
            <p className="text-[#6B6560] text-sm">
              Report ID: {report.id}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Report Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-8">
            {/* Title and Status */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="font-semibold text-[#1C1917] text-2xl mb-3">
                  {report.title}
                </h2>
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
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="p-2 rounded-lg hover:bg-[#F8F6F1] transition-colors">
                  <Share2 className="w-4 h-4 text-[#1C1917]" />
                </button>
                <button className="p-2 rounded-lg hover:bg-[#F8F6F1] transition-colors">
                  <Download className="w-4 h-4 text-[#1C1917]" />
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-medium text-[#1C1917] mb-2">Description</h3>
              <p className="text-[#6B6560] leading-relaxed">
                {report.description}
              </p>
            </div>

            {/* Images */}
            {report.image_url && (
              <div className="mb-6">
                <h3 className="font-medium text-[#1C1917] mb-3">Attached Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="relative group cursor-pointer">
                    <img
                      src={report.image_url}
                      alt="Report image"
                      className="w-full h-64 object-cover rounded-xl"
                      onClick={() => {
                        // Open image in new tab
                        const newWindow = window.open()
                        newWindow.document.write(`<img src="${report.image_url}" style="max-width:100%;height:auto;" />`)
                        newWindow.document.title = 'Report Image'
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-xl flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white rounded-lg px-3 py-2 text-xs font-medium text-[#1C1917] shadow-lg">
                          Click to enlarge
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#6B6560] mt-2">
                  Click on any image to view it in full size
                </p>
              </div>
            )}

            {/* Location */}
            <div className="mb-6">
              <h3 className="font-medium text-[#1C1917] mb-3">Location</h3>
              <div className="bg-[#F8F6F1] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-[#D4522A]" />
                  <span className="text-[#1C1917]">
                    {report.address || 'Location not specified'}
                  </span>
                </div>
                {(report.ward || report.pin_code) && (
                  <div className="text-sm text-[#6B6560]">
                    {report.ward && `Ward ${report.ward}`}
                    {report.ward && report.pin_code && ' • '}
                    {report.pin_code}
                  </div>
                )}
                {report.latitude && report.longitude && (
                  <div className="text-xs text-[#6B6560] mt-1">
                    Coordinates: {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-[#E8E4DC]">
              <div>
                <div className="flex items-center gap-2 text-sm text-[#6B6560] mb-1">
                  <Calendar className="w-4 h-4" />
                  Submitted
                </div>
                <div className="text-[#1C1917] font-medium">
                  {formatDate(report.created_at || report.submittedAt)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-[#6B6560] mb-1">
                  <User className="w-4 h-4" />
                  Submitted by
                </div>
                <div className="text-[#1C1917] font-medium">
                  {report.is_anonymous ? 'Anonymous User' : report.citizen_email || 'Unknown User'}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-[#6B6560] mb-1">
                  <Clock className="w-4 h-4" />
                  Est. Response Time
                </div>
                <div className="text-[#1C1917] font-medium">
                  {getResponseTime(report.ai_severity)}
                </div>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-8">
            <h3 className="font-medium text-[#1C1917] mb-6">Status Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#E9A84C] rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-[#1C1917]">Report Submitted</div>
                  <div className="text-sm text-[#6B6560]">
                    {formatDate(report.created_at || report.submittedAt)} - Your report has been received and is under review.
                  </div>
                </div>
              </div>
              
              {report.status !== 'pending' && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[#2A9D8F] rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#1C1917]">Under Review</div>
                    <div className="text-sm text-[#6B6560]">
                      Your report is being reviewed by the relevant department.
                    </div>
                  </div>
                </div>
              )}
              
              {report.status === 'in_progress' && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[#D4522A] rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#1C1917]">In Progress</div>
                    <div className="text-sm text-[#6B6560]">
                      Action is being taken to resolve your report.
                    </div>
                  </div>
                </div>
              )}
              
              {report.status === 'resolved' && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[#2A9D8F] rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#1C1917]">Resolved</div>
                    <div className="text-sm text-[#6B6560]">
                      Your report has been successfully resolved.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-8">
            <h3 className="font-medium text-[#1C1917] mb-4">Actions</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#D4522A] text-white rounded-xl font-medium hover:bg-[#B8441F] transition-colors">
                <MessageSquare className="w-4 h-4" />
                Add Comment
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-[#E8E4DC] text-[#1C1917] rounded-xl font-medium hover:bg-[#F8F6F1] transition-colors">
                <Plus className="w-4 h-4" />
                Report Similar Issue
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ReportDetail
