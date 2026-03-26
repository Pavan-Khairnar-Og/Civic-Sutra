import React from 'react'
import Card from './ui/Card'
import Badge from './ui/Badge'

/**
 * AIAnalysisDetails component
 * Displays detailed AI analysis results for civic issues
 * Shows confidence scores, classification details, and reasoning
 * Used in Admin Dashboard for detailed report view
 */
const AIAnalysisDetails = ({ report, showFullDetails = true }) => {
  // Get confidence color based on score
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'success'
    if (confidence >= 0.6) return 'primary'
    if (confidence >= 0.4) return 'warning'
    return 'muted'
  }

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'danger'
      case 'high': return 'warning'
      case 'medium': return 'primary'
      case 'low': return 'success'
      default: return 'muted'
    }
  }

  // Get department icon
  const getDepartmentIcon = (department) => {
    switch (department?.toLowerCase()) {
      case 'roads': return '🛣️'
      case 'sanitation': return '🗑️'
      case 'electricity': return '⚡'
      case 'water': return '💧'
      case 'parks': return '🌳'
      case 'other': return '🏢'
      default: return '📋'
    }
  }

  // Get issue type icon
  const getIssueTypeIcon = (issueType) => {
    switch (issueType?.toLowerCase()) {
      case 'pothole': return '🕳️'
      case 'garbage': return '🗑️'
      case 'streetlight': return '💡'
      case 'water_leak': return '💧'
      case 'road_damage': return '🛣️'
      case 'graffiti': return '🎨'
      case 'fallen_tree': return '🌳'
      case 'sewage': return '🚽'
      default: return '📋'
    }
  }

  // If no AI analysis data, show placeholder
  if (!report.ai_issue_type && !report.ai_confidence) {
    return (
      <Card className="border-gray-200 bg-gray-50">
        <Card.Body className="p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No AI Analysis Available
            </h3>
            <p className="text-sm text-gray-500">
              This report was submitted without AI-powered analysis.
            </p>
          </div>
        </Card.Body>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <Card.Header>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text">AI Analysis Results</h3>
            <p className="text-sm text-text/60">
              Automated classification and assessment
            </p>
          </div>
          {report.ai_valid && (
            <Badge variant="success" size="sm">
              ✓ Valid Issue
            </Badge>
          )}
        </div>
      </Card.Header>
      
      <Card.Body className="space-y-6">
        {/* Primary Classification */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-text mb-3">Issue Classification</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                <span className="text-sm font-medium text-text">Type:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getIssueTypeIcon(report.ai_issue_type)}</span>
                  <Badge variant={report.ai_valid ? 'success' : 'muted'}>
                    {report.ai_issue_type || 'Unknown'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                <span className="text-sm font-medium text-text">Severity:</span>
                <Badge variant={getSeverityColor(report.ai_severity)}>
                  {report.ai_severity || 'Unknown'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                <span className="text-sm font-medium text-text">Department:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getDepartmentIcon(report.ai_department)}</span>
                  <Badge variant="outline">
                    {report.ai_department || 'Unassigned'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-text mb-3">Analysis Metrics</h4>
            <div className="space-y-3">
              <div className="p-3 bg-muted/10 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-text">Confidence Score:</span>
                  <Badge variant={getConfidenceColor(report.ai_confidence)}>
                    {Math.round((report.ai_confidence || 0) * 100)}%
                  </Badge>
                </div>
                <div className="flex items-center">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-${getConfidenceColor(report.ai_confidence)} transition-all duration-500`}
                      style={{ 
                        width: `${(report.ai_confidence || 0) * 100}%`,
                        backgroundColor: getConfidenceColor(report.ai_confidence) === 'success' ? '#10b981' :
                                       getConfidenceColor(report.ai_confidence) === 'primary' ? '#3b82f6' :
                                       getConfidenceColor(report.ai_confidence) === 'warning' ? '#f59e0b' : '#6b7280'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-muted/10 rounded-lg">
                <span className="text-sm font-medium text-text">Priority Score:</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-2xl font-bold text-primary">
                    {report.priority_score || 0}
                  </span>
                  <Badge variant={getSeverityColor(report.priority)}>
                    {report.priority || 'Medium'} Priority
                  </Badge>
                </div>
                <p className="text-xs text-text/60 mt-1">
                  Calculated: Severity (40pts) + Confidence (30pts) + Valid (30pts)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Description */}
        {report.ai_description && (
          <div>
            <h4 className="font-medium text-text mb-2">AI Description</h4>
            <div className="p-4 bg-muted/10 rounded-lg">
              <p className="text-sm text-text/80 leading-relaxed">
                {report.ai_description}
              </p>
            </div>
          </div>
        )}

        {/* AI Reasoning */}
        {report.ai_reasoning && (
          <div>
            <h4 className="font-medium text-text mb-2">AI Reasoning</h4>
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-primary/80 leading-relaxed">
                {report.ai_reasoning}
              </p>
            </div>
          </div>
        )}

        {/* Analysis Metadata */}
        {showFullDetails && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/10 rounded-lg">
              <h5 className="text-sm font-medium text-text mb-2">Analysis Metadata</h5>
              <div className="space-y-1 text-xs text-text/60">
                <div className="flex justify-between">
                  <span>Valid Civic Issue:</span>
                  <Badge variant={report.ai_valid ? 'success' : 'muted'} size="sm">
                    {report.ai_valid ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Assigned Department:</span>
                  <span className="font-mono">{report.assigned_department || 'Auto-assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Issue Type:</span>
                  <span className="font-mono">{report.issue_type || 'Auto-detected'}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-muted/10 rounded-lg">
              <h5 className="text-sm font-medium text-text mb-2">Processing Info</h5>
              <div className="space-y-1 text-xs text-text/60">
                <div className="flex justify-between">
                  <span>AI Model:</span>
                  <span className="font-mono">Groq Llama 4 Scout</span>
                </div>
                <div className="flex justify-between">
                  <span>Analysis Date:</span>
                  <span className="font-mono">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Time:</span>
                  <span className="font-mono">&lt; 2 seconds</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Guidance */}
        <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
          <div className="flex items-start">
            <span className="text-warning mr-3 mt-1">💡</span>
            <div>
              <h5 className="text-sm font-medium text-warning mb-1">Admin Guidance</h5>
              <p className="text-sm text-warning/80 leading-relaxed">
                This AI analysis helps prioritize and route reports efficiently. 
                {report.ai_valid 
                  ? ' The issue has been validated as a legitimate civic concern.'
                  : ' The AI suggests this may not be a standard civic issue - please review manually.'
                }
                {report.ai_confidence >= 0.8 
                  ? ' High confidence indicates reliable classification.'
                  : ' Lower confidence suggests manual review may be beneficial.'
                }
              </p>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

export default AIAnalysisDetails
