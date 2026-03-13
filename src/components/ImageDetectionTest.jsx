import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import Button from './ui/Button'
import Card from './ui/Card'
import Badge from './ui/Badge'

/**
 * Test component for Image Detection API
 * Helps verify the Google Vision API is working properly
 */
const ImageDetectionTest = () => {
  const { isLight } = useTheme()
  const [testResult, setTestResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Test API with a sample image URL
  const testAPI = async () => {
    setIsLoading(true)
    setError('')
    setTestResult(null)

    try {
      // Create a simple test image (1x1 pixel PNG)
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#FF0000'
      ctx.fillRect(0, 0, 1, 1)
      
      // Convert to Base64
      const base64Image = canvas.toDataURL('image/png').split(',')[1]

      // Call Vision API
      const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate'
      const API_KEY = 'AIzaSyCZu8wrFDtLCewJRVhuADFaZ1LAiHt6hec'
      
      const requestBody = {
        requests: [
          {
            image: {
              content: base64Image
            },
            features: [
              {
                type: 'LABEL_DETECTION',
                maxResults: 10
              }
            ]
          }
        ]
      }

      const response = await fetch(`${VISION_API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'API call failed')
      }

      const data = await response.json()
      setTestResult({
        success: true,
        labels: data.responses[0]?.labelAnnotations || [],
        rawResponse: data
      })

    } catch (err) {
      setError(err.message)
      setTestResult({
        success: false,
        error: err.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Test API key validity
  const testAPIKey = async () => {
    setIsLoading(true)
    setError('')
    setTestResult(null)

    try {
      // Simple API key test with minimal request
      const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate'
      const API_KEY = 'AIzaSyCZu8wrFDtLCewJRVhuADFaZ1LAiHt6hec'
      
      // Test with empty request to check API key validity
      const testResponse = await fetch(`${VISION_API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            image: { content: 'invalid' },
            features: [{ type: 'LABEL_DETECTION', maxResults: 1 }]
          }]
        })
      })

      const data = await testResponse.json()
      
      if (testResponse.status === 400 && data.error?.message?.includes('API key')) {
        throw new Error('Invalid API key')
      } else if (testResponse.status === 403) {
        throw new Error('API key not authorized or quota exceeded')
      } else {
        setTestResult({
          success: true,
          message: 'API key is valid (test request processed)',
          status: testResponse.status,
          response: data
        })
      }

    } catch (err) {
      setError(err.message)
      setTestResult({
        success: false,
        error: err.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text mb-4">
          🧪 Image Detection API Test
        </h1>
        <p className="text-text/60 mb-6">
          Test if the Google Vision API is working properly
        </p>
      </div>

      {/* Test Controls */}
      <Card className="mb-8">
        <h3 className="text-xl font-semibold text-text mb-4">🔧 API Tests</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Button 
            variant="primary" 
            onClick={testAPIKey}
            disabled={isLoading}
            loading={isLoading}
            fullWidth={true}
          >
            🔑 Test API Key
          </Button>
          <Button 
            variant="secondary" 
            onClick={testAPI}
            disabled={isLoading}
            loading={isLoading}
            fullWidth={true}
          >
            🖼️ Test Image Detection
          </Button>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="mb-8">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-text font-medium">Testing API...</p>
            <p className="text-sm text-text/60">Please wait</p>
          </div>
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
              <p className="text-danger font-medium">Test Failed</p>
              <p className="text-sm text-danger/80">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Test Results */}
      {testResult && (
        <Card>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-text mb-2">📊 Test Results</h3>
            <Badge variant={testResult.success ? 'success' : 'danger'}>
              {testResult.success ? '✅ Success' : '❌ Failed'}
            </Badge>
          </div>

          {testResult.success ? (
            <div className="space-y-4">
              {testResult.message && (
                <div className="p-4 bg-success/10 rounded-lg">
                  <p className="text-success font-medium">{testResult.message}</p>
                </div>
              )}

              {testResult.labels && testResult.labels.length > 0 && (
                <div>
                  <h4 className="font-medium text-text mb-3">Detected Labels:</h4>
                  <div className="space-y-2">
                    {testResult.labels.map((label, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                        <span className="font-medium text-text capitalize">{label.description}</span>
                        <Badge variant="primary">
                          {Math.round(label.score * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {testResult.status && (
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-text/60">
                    <strong>HTTP Status:</strong> {testResult.status}
                  </p>
                </div>
              )}

              {/* Raw Response (for debugging) */}
              {testResult.rawResponse && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-text/60 hover:text-text">
                    📋 View Raw API Response
                  </summary>
                  <pre className="mt-2 p-4 bg-muted/10 rounded-lg text-xs text-text/80 overflow-x-auto">
                    {JSON.stringify(testResult.rawResponse, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ) : (
            <div className="p-4 bg-danger/10 rounded-lg">
              <p className="text-danger font-medium">Error Details:</p>
              <p className="text-sm text-danger/80 mt-1">{testResult.error}</p>
            </div>
          )}
        </Card>
      )}

      {/* Troubleshooting Guide */}
      <Card className="mt-8">
        <h3 className="text-xl font-semibold text-text mb-4">🔧 Troubleshooting</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-text mb-2">Common Issues:</h4>
            <ul className="space-y-2 text-sm text-text/60">
              <li>• <strong>API Key Issues:</strong> Check if the API key is valid and has Vision API enabled</li>
              <li>• <strong>Quota Exceeded:</strong> Google Cloud Vision API has usage limits</li>
              <li>• <strong>Network Issues:</strong> Check internet connection and CORS settings</li>
              <li>• <strong>Image Format:</strong> Ensure images are JPG or PNG and under 5MB</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-text mb-2">Manual Testing:</h4>
            <div className="p-4 bg-muted/10 rounded-lg">
              <p className="text-sm text-text/60 mb-2">You can test the API directly:</p>
              <code className="block p-2 bg-text/10 rounded text-xs text-text/80 break-all">
                {'curl -X POST "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyCZu8wrFDtLCewJRVhuADFaZ1LAiHt6hec" \\ -H "Content-Type: application/json" \\ -d \'{"requests":[{"image":{"content":"BASE64_IMAGE"},"features":[{"type":"LABEL_DETECTION","maxResults":10}]}]}\' '}
              </code>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ImageDetectionTest
