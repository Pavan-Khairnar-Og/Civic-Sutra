import { useState, useEffect, useCallback } from 'react'
import { reports } from '../services/supabase'

/**
 * Custom hook for managing reports
 * Provides CRUD operations and state management for civic issue reports
 */
export const useReports = (options = {}) => {
  const [reportsList, setReportsList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  })

  // Default options
  const {
    filters = {},
    orderBy = 'created_at',
    ascending = false,
    autoLoad = true,
    userId = null
  } = options

  /**
   * Load reports based on current filters and options
   */
  const loadReports = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const queryOptions = {
        orderBy,
        ascending,
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit
      }
      
      let result
      if (userId) {
        result = await reports.getByUser(userId, filters)
      } else {
        result = await reports.getAll(filters, queryOptions)
      }
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      setReportsList(result.data || [])
      
      // Update pagination total (in real app, this would come from a count query)
      setPagination(prev => ({
        ...prev,
        total: result.data?.length || 0
      }))
      
    } catch (err) {
      setError(err.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [filters, orderBy, ascending, pagination.limit, pagination.page, userId])

  /**
   * Create a new report
   * @param {object} reportData - Report data to create
   */
  const createReport = async (reportData) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await reports.create(reportData)
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      // Add new report to list
      if (result.data && result.data[0]) {
        setReportsList(prev => [result.data[0], ...prev])
      }
      
      return { success: true, data: result.data?.[0] }
    } catch (err) {
      setError(err.message || 'Failed to create report')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Update an existing report
   * @param {string} reportId - ID of report to update
   * @param {object} updateData - Data to update
   */
  const updateReport = async (reportId, updateData) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await reports.update(reportId, updateData)
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      // Update report in list
      if (result.data && result.data[0]) {
        setReportsList(prev => 
          prev.map(report => 
            report.id === reportId ? result.data[0] : report
          )
        )
      }
      
      return { success: true, data: result.data?.[0] }
    } catch (err) {
      setError(err.message || 'Failed to update report')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Delete a report
   * @param {string} reportId - ID of report to delete
   */
  const deleteReport = async (reportId) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await reports.delete(reportId)
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      // Remove report from list
      setReportsList(prev => prev.filter(report => report.id !== reportId))
      
      return { success: true }
    } catch (err) {
      setError(err.message || 'Failed to delete report')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Get a single report by ID
   * @param {string} reportId - ID of report to fetch
   */
  const getReport = async (reportId) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await reports.getById(reportId)
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      return { success: true, data: result.data }
    } catch (err) {
      setError(err.message || 'Failed to fetch report')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Refresh reports list
   */
  const refresh = useCallback(() => {
    return loadReports()
  }, [loadReports])

  /**
   * Update filters
   * @param {object} newFilters - New filter values
   */
  const updateFilters = (newFilters) => {
    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, page: 1 }))
    // This would trigger a re-load in a real implementation
  }

  /**
   * Change page
   * @param {number} newPage - New page number
   */
  const changePage = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  /**
   * Change page size
   * @param {number} newLimit - New page size
   */
  const changePageSize = (newLimit) => {
    setPagination(prev => ({ 
      ...prev, 
      limit: newLimit,
      page: 1 // Reset to first page
    }))
  }

  /**
   * Reset error state
   */
  const resetError = () => {
    setError(null)
  }

  // Auto-load reports on mount and when dependencies change
  useEffect(() => {
    if (autoLoad) {
      loadReports()
    }
  }, [loadReports, autoLoad])

  return {
    reports: reportsList,
    loading,
    error,
    pagination,
    createReport,
    updateReport,
    deleteReport,
    getReport,
    refresh,
    updateFilters,
    changePage,
    changePageSize,
    resetError,
    // Computed values
    totalPages: Math.ceil(pagination.total / pagination.limit),
    hasNextPage: pagination.page * pagination.limit < pagination.total,
    hasPrevPage: pagination.page > 1
  }
}

/**
 * Custom hook for a single report
 * Provides state management for individual report operations
 */
export const useReport = (reportId) => {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Load report data
   */
  const loadReport = useCallback(async () => {
    if (!reportId) return
    
    try {
      setLoading(true)
      setError(null)
      
      const result = await reports.getById(reportId)
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      setReport(result.data)
    } catch (err) {
      setError(err.message || 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }, [reportId])

  /**
   * Update report
   * @param {object} updateData - Data to update
   */
  const updateReportData = async (updateData) => {
    if (!reportId) return { success: false, error: 'No report ID provided' }
    
    try {
      setLoading(true)
      setError(null)
      
      const result = await reports.update(reportId, updateData)
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      setReport(result.data?.[0] || report)
      return { success: true, data: result.data?.[0] }
    } catch (err) {
      setError(err.message || 'Failed to update report')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Reset error state
   */
  const resetError = () => {
    setError(null)
  }

  // Load report on mount and when ID changes
  useEffect(() => {
    loadReport()
  }, [loadReport])

  return {
    report,
    loading,
    error,
    updateReport: updateReportData,
    refresh: loadReport,
    resetError
  }
}

export default useReports
