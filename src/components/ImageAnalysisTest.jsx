import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { analyzeIssueImage, testGeminiConnection, getSupportedIssueTypes } from '../services/imageAnalysis'
import Button from './ui/Button'
import Card from './ui/Card'
import Badge from './ui/Badge'

/**
 * Image Analysis Test Component
 * Tests Gemini AI integration for civic issue detection
 */
const ImageAnalysisTest = () => {
  const { isLight } = useTheme()
  const [testResult, setTestResult] = useState(null)
  const [connectionResult, setConnectionResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [error, setError] = useState('')

  // Test Gemini API connection
  const testConnection = async () => {
    setIsTestingConnection(true)
    setError('')
    setConnectionResult(null)

    try {
      const isConnected = await testGeminiConnection()
      setConnectionResult({
        success: isConnected,
        message: isConnected ? 'Gemini API is accessible' : 'Failed to connect to Gemini API'
      })
    } catch (err) {
      setError(err.message)
      setConnectionResult({
        success: false,
        error: err.message
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  // Test image analysis with sample image
  const testImageAnalysis = async () => {
    setIsLoading(true)
    setError('')
    setTestResult(null)

    try {
      // Create a simple test image (1x1 pixel)
      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 100
      const ctx = canvas.getContext('2d')
      
      // Draw a simple shape that might look like a pothole or issue
      ctx.fillStyle = '#666666'
      ctx.fillRect(20, 20, 60, 60)
      ctx.fillStyle = '#333333'
      ctx.beginPath()
      ctx.arc(50, 50, 20, 0, Math.PI * 2)
      ctx.fill()
      
      // Convert to base64
      const base64Data = canvas.toDataURL('image/jpeg').split(',')[1]

      // Analyze the image
      const result = await analyzeIssueImage(base64Data, 'image/jpeg')
      setTestResult(result)

    } catch (err) {
      setError(err.message)
      setTestResult({
        error: err.message,
        issueType: 'other',
        confidence: 0,
        severity: 'low',
        isValidCivicIssue: false
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Test with real image file
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setIsLoading(true)
    setError('')
    setTestResult(null)

    try {
      // Convert file to base64
      const base64Data = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = reader.result.split(',')[1]
          resolve(base64)
        }
        reader.readAsDataURL(file)
      })

      // Analyze the image
      const result = await analyzeIssueImage(base64Data, file.type)
      setTestResult(result)

    } catch (err) {
      setError(err.message)
      setTestResult({
        error: err.message,
        issueType: 'other',
        confidence: 0,
        severity: 'low',
        isValidCivicIssue: false
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'success',
      medium: 'primary', 
      high: 'warning',
      critical: 'danger'
    }
    return colors[severity] || 'muted'
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'success'
    if (confidence >= 0.6) return 'primary'
    if (confidence >= 0.4) return 'warning'
    return 'muted'
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text mb-4">
          🤖 Gemini AI Image Analysis Test
        </h1>
        <p className="text-text/60 mb-6">
          Test Gemini AI integration for civic issue detection
        </p>
      </div>

      {/* Environment Check */}
      <Card className="mb-8">
        <h3 className="text-xl font-semibold text-text mb-4">🔑 Environment Check</h3>
        <div className="p-4 bg-muted/10 rounded-lg">
          <p className="text-sm text-text/60 mb-2">
            <strong>GEMINI_API_KEY:</strong> 
            <span className={`ml-2 ${import.meta.env.VITE_GEMINI_API_KEY ? 'text-success' : 'text-danger'}`}>
              {import.meta.env.VITE_GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}
            </span>
          </p>
          {!import.meta.env.VITE_GEMINI_API_KEY && (
            <p className="text-xs text-danger/80 mt-2">
              Add VITE_GEMINI_API_KEY to your .env file
            </p>
          )}
        </div>
      </Card>

      {/* Test Controls */}
      <Card className="mb-8">
        <h3 className="text-xl font-semibold text-text mb-4">🧪 Test Controls</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Button 
            variant="primary" 
            onClick={testConnection}
            disabled={isTestingConnection}
            loading={isTestingConnection}
            fullWidth={true}
          >
            🔌 Test Connection
          </Button>
          <Button 
            variant="secondary" 
            onClick={testImageAnalysis}
            disabled={isLoading}
            loading={isLoading}
            fullWidth={true}
          >
            🖼️ Test Sample Image
          </Button>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-text mb-2">
            📁 Test with Real Image:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="w-full p-2 border border-border rounded-lg bg-surface text-text"
          />
        </div>
      </Card>

      {/* Connection Test Results */}
      {connectionResult && (
        <Card className="mb-8">
          <h3 className="text-xl font-semibold text-text mb-4">🔌 Connection Test</h3>
          <div className={`p-4 rounded-lg ${
            connectionResult.success 
              ? 'bg-success/10 border border-success/20' 
              : 'bg-danger/10 border border-danger/20'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-text">
                Gemini API Connection
              </span>
              <Badge variant={connectionResult.success ? 'success' : 'danger'}>
                {connectionResult.success ? 'Connected' : 'Failed'}
              </Badge>
            </div>
            <p className={`text-sm ${
              connectionResult.success ? 'text-success/80' : 'text-danger/80'
            }`}>
              {connectionResult.message}
            </p>
            {connectionResult.error && (
              <p className="text-xs text-danger/60 mt-2">
                Error: {connectionResult.error}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Analysis Test Results */}
      {testResult && (
        <Card className="mb-8">
          <h3 className="text-xl font-semibold text-text mb-4">🤖 Analysis Results</h3>
          
          {testResult.error ? (
            <div className="p-4 bg-danger/10 rounded-lg border border-danger/20">
              <p className="text-danger font-medium mb-2">Analysis Failed</p>
              <p className="text-sm text-danger/80">{testResult.error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Issue Type */}
              <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                <span className="font-medium text-text">Issue Type:</span>
                <Badge variant="primary">
                  {testResult.issueType}
                </Badge>
              </div>

              {/* Confidence */}
              <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                <span className="font-medium text-text">Confidence:</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 bg-${getConfidenceColor(testResult.confidence)}`}
                      style={{ width: `${testResult.confidence * 100}%` }}
                    ></div>
                  </div>
                  <Badge variant={getConfidenceColor(testResult.confidence)}>
                    {Math.round(testResult.confidence * 100)}%
                  </Badge>
                </div>
              </div>

              {/* Severity */}
              <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                <span className="font-medium text-text">Severity:</span>
                <Badge variant={getSeverityColor(testResult.severity)}>
                  {testResult.severity}
                </Badge>
              </div>

              {/* Department */}
              <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                <span className="font-medium text-text">Department:</span>
                <Badge variant="outline">
                  {testResult.suggestedDepartment}
                </Badge>
              </div>

              {/* Valid Issue */}
              <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                <span className="font-medium text-text">Valid Civic Issue:</span>
                <Badge variant={testResult.isValidCivicIssue ? 'success' : 'muted'}>
                  {testResult.isValidCivicIssue ? 'Yes' : 'No'}
                </Badge>
              </div>

              {/* Description */}
              <div className="p-3 bg-muted/10 rounded-lg">
                <p className="font-medium text-text mb-2">Description:</p>
                <p className="text-sm text-text/80">{testResult.description}</p>
              </div>

              {/* Reasoning */}
              <div className="p-3 bg-muted/10 rounded-lg">
                <p className="font-medium text-text mb-2">AI Reasoning:</p>
                <p className="text-sm text-text/80">{testResult.reasoning}</p>
              </div>

              {/* Timestamp */}
              {testResult.timestamp && (
                <div className="p-3 bg-muted/10 rounded-lg">
                  <p className="font-medium text-text mb-2">Analysis Time:</p>
                  <p className="text-sm text-text/80">
                    {new Date(testResult.timestamp).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="mb-8 border-danger/20 bg-danger/10">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center mr-4">
              <span className="text-danger">❌</span>
            </div>
            <div>
              <p className="text-danger font-medium">Error</p>
              <p className="text-sm text-danger/80">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Supported Features */}
      <Card>
        <h3 className="text-xl font-semibold text-text mb-4">📋 Supported Features</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-text mb-2">Issue Types:</h4>
            <div className="flex flex-wrap gap-1">
              {getSupportedIssueTypes().map(type => (
                <Badge key={type} variant="outline" size="sm">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-text mb-2">Severity Levels:</h4>
            <div className="flex flex-wrap gap-1">
              {['low', 'medium', 'high', 'critical'].map(level => (
                <Badge key={level} variant={getSeverityColor(level)} size="sm">
                  {level}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-text mb-2">Departments:</h4>
            <div className="flex flex-wrap gap-1">
              {['Roads', 'Sanitation', 'Electricity', 'Water', 'Parks', 'Other'].map(dept => (
                <Badge key={dept} variant="outline" size="sm">
                  {dept}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ImageAnalysisTest
