import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { analyzeIssueImage, testGroqConnection, getSupportedIssueTypes } from '../services/imageAnalysis'
import { analyzeIssueImageMock, testMockConnection } from '../services/mockImageAnalysis'
import Button from './ui/Button'
import Card from './ui/Card'
import Badge from './ui/Badge'

/**
 * Image Analysis Test Component
 * Tests Groq AI integration for civic issue detection
 */
const ImageAnalysisTest = () => {
  const { isLight } = useTheme()
  const [testResult, setTestResult] = useState(null)
  const [connectionResult, setConnectionResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [error, setError] = useState('')
  const [useMock, setUseMock] = useState(false)

  // Test Groq API connection
  const testConnection = async () => {
    setIsTestingConnection(true)
    setError('')
    setConnectionResult(null)

    try {
      const isConnected = await testGroqConnection()
      setConnectionResult({
        success: isConnected,
        message: isConnected ? 'Groq API is accessible' : 'Failed to connect to Groq API'
      })
    } catch (err) {
      const errorMessage = err.message || 'Connection failed'
      setError(errorMessage)
      setConnectionResult({
        success: false,
        error: errorMessage,
        isQuotaError: errorMessage.includes('quota') || errorMessage.includes('429')
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  // Test image analysis with fallback to mock
  const testImageAnalysis = async () => {
    setIsLoading(true)
    setError('')
    setTestResult(null)

    try {
      let result;
      
      if (useMock) {
        // Use mock service
        result = await analyzeIssueImageMock(null, 'image/jpeg')
      } else {
        // Try real Gemini API first
        try {
          result = await analyzeIssueImage(null, 'image/jpeg')
        } catch (geminiError) {
          // Check if it's a quota error
          if (geminiError.message.includes('quota') || geminiError.message.includes('429')) {
            // Fallback to mock
            console.log('Gemini quota exceeded, using mock service...')
            result = await analyzeIssueImageMock(null, 'image/jpeg')
            result.wasQuotaError = true
          } else {
            throw geminiError
          }
        }
      }
      
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

  // Test with real image file with fallback
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setIsLoading(true)
    setError('')
    setTestResult(null)

    try {
      let result;
      
      // Convert file to base64
      const base64Data = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = reader.result.split(',')[1]
          resolve(base64)
        }
        reader.readAsDataURL(file)
      })

      if (useMock) {
        // Use mock service
        result = await analyzeIssueImageMock(base64Data, file.type)
      } else {
        // Try real Gemini API first
        try {
          result = await analyzeIssueImage(base64Data, file.type)
        } catch (geminiError) {
          // Check if it's a quota error
          if (geminiError.message.includes('quota') || geminiError.message.includes('429')) {
            // Fallback to mock
            console.log('Gemini quota exceeded, using mock service...')
            result = await analyzeIssueImageMock(base64Data, file.type)
            result.wasQuotaError = true
          } else {
            throw geminiError
          }
        }
      }
      
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
          🤖 Groq AI Image Analysis Test
        </h1>
        <p className="text-text/60 mb-6">
          Test Groq AI integration for civic issue detection
        </p>
      </div>

      {/* Environment Check */}
      <Card className="mb-8">
        <h3 className="text-xl font-semibold text-text mb-4">🔑 Environment Check</h3>
        <div className="p-4 bg-muted/10 rounded-lg">
          <p className="text-sm text-text/60 mb-2">
            <strong>GROQ_API_KEY:</strong> 
            <span className={`ml-2 ${import.meta.env.VITE_GROQ_API_KEY ? 'text-success' : 'text-danger'}`}>
              {import.meta.env.VITE_GROQ_API_KEY ? '✅ Configured' : '❌ Missing'}
            </span>
          </p>
          {!import.meta.env.VITE_GROQ_API_KEY && (
            <p className="text-xs text-danger/80 mt-2">
              Add VITE_GROQ_API_KEY to your .env file
            </p>
          )}
        </div>
      </Card>

      {/* Quota Warning */}
      {connectionResult?.isQuotaError && (
        <Card className="mb-8 border-warning/20 bg-warning/10">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center mr-4">
              <span className="text-warning">⚠️</span>
            </div>
            <div className="flex-1">
              <p className="text-warning font-medium mb-1">Groq API Quota Exceeded</p>
              <p className="text-sm text-warning/80 mb-2">
                Free tier quota has been exhausted. The system will automatically use mock data for testing.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="warning" 
                  size="sm"
                  onClick={() => setUseMock(true)}
                >
                  🎭 Use Mock Service
                </Button>
                <a 
                  href="https://console.groq.com/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-warning underline"
                >
                  Get New API Key
                </a>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Mock Mode Toggle */}
      <Card className="mb-8">
        <h3 className="text-xl font-semibold text-text mb-4">🎭 Testing Mode</h3>
        <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
          <div>
            <p className="font-medium text-text mb-1">Mock Service</p>
            <p className="text-sm text-text/60">
              Use simulated AI responses for testing when quota is exceeded
            </p>
          </div>
          <Button 
            variant={useMock ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setUseMock(!useMock)}
          >
            {useMock ? '🎭 Mock ON' : '🤖 Real API'}
          </Button>
        </div>
        {useMock && (
          <div className="mt-3 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm text-primary/80">
              💡 Mock service provides realistic responses for all supported issue types without using API quota.
            </p>
          </div>
        )}
      </Card>
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
          
          {/* Mock/Fallback Indicator */}
          {(testResult.isMock || testResult.wasQuotaError) && (
            <div className={`mb-4 p-3 rounded-lg ${
              testResult.wasQuotaError 
                ? 'bg-warning/10 border border-warning/20' 
                : 'bg-primary/10 border border-primary/20'
            }`}>
              <div className="flex items-center">
                <span className="mr-2">
                  {testResult.wasQuotaError ? '⚠️' : '🎭'}
                </span>
                <div>
                  <p className={`font-medium ${
                    testResult.wasQuotaError ? 'text-warning' : 'text-primary'
                  }`}>
                    {testResult.wasQuotaError ? 'API Quota Exceeded - Using Mock Data' : 'Mock Service Active'}
                  </p>
                  <p className="text-sm text-text/60">
                    {testResult.wasQuotaError 
                      ? 'Groq API quota was exceeded, showing simulated response for testing'
                      : 'This is a simulated response for testing purposes'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
          
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
