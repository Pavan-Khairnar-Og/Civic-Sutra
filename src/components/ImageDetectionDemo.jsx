import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Button from './ui/Button'
import Card from './ui/Card'
import Badge from './ui/Badge'

/**
 * Simple demonstration component for AI Vision Detection
 * Shows example workflow and sample results
 */
const ImageDetectionDemo = () => {
  const { isLight } = useTheme()

  const exampleResults = [
    { description: 'car', confidence: 95 },
    { description: 'vehicle', confidence: 92 },
    { description: 'automobile', confidence: 88 },
    { description: 'wheel', confidence: 76 },
    { description: 'road', confidence: 68 },
    { description: 'outdoor', confidence: 54 }
  ]

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'success'
    if (confidence >= 60) return 'primary'
    if (confidence >= 40) return 'warning'
    return 'muted'
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text mb-4">
          🤖 AI Vision Detection Demo
        </h1>
        <p className="text-text/60 mb-6">
          See how Google Vision AI can detect objects in images
        </p>
        <Link to="/ai-vision">
          <Button variant="primary" size="lg">
            Try Live Detection →
          </Button>
        </Link>
      </div>

      {/* Example Workflow */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card>
          <h3 className="text-xl font-semibold text-text mb-4">📸 Upload Image</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✓</span>
              <span className="text-text">Drag & drop or click to upload</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✓</span>
              <span className="text-text">Supports JPG & PNG formats</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✓</span>
              <span className="text-text">Maximum file size: 5MB</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✓</span>
              <span className="text-text">Automatic Base64 conversion</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold text-text mb-4">🤖 AI Analysis</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✓</span>
              <span className="text-text">Google Cloud Vision API</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✓</span>
              <span className="text-text">LABEL_DETECTION feature</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✓</span>
              <span className="text-text">Up to 10 object labels</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✓</span>
              <span className="text-text">Confidence scores (0-100%)</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Sample Results */}
      <Card>
        <h3 className="text-xl font-semibold text-text mb-4">📊 Sample Results</h3>
        <div className="mb-6">
          <img
            src="https://via.placeholder.com/400x300?text=Sample+Car+Image"
            alt="Sample car image"
            className="w-full h-auto max-h-64 object-cover rounded-xl mb-4"
          />
          <p className="text-sm text-text/60 mb-4">
            Example: A car image would detect these objects:
          </p>
        </div>

        <div className="space-y-3">
          {exampleResults.map((result, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-xl bg-muted/10"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">🏷️</span>
                <span className="font-medium text-text capitalize">
                  {result.description}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`
                      h-full transition-all duration-500 ease-out
                      ${result.confidence >= 80 ? 'bg-success' : ''}
                      ${result.confidence >= 60 && result.confidence < 80 ? 'bg-primary' : ''}
                      ${result.confidence >= 40 && result.confidence < 60 ? 'bg-warning' : ''}
                      ${result.confidence < 40 ? 'bg-muted' : ''}
                    `}
                    style={{ width: `${result.confidence}%` }}
                  ></div>
                </div>
                <Badge variant={getConfidenceColor(result.confidence)}>
                  {result.confidence}%
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">6</p>
              <p className="text-sm text-text/60">Labels Found</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">3</p>
              <p className="text-sm text-text/60">High Confidence</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">79%</p>
              <p className="text-sm text-text/60">Avg Confidence</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Technical Details */}
      <Card className="mt-8">
        <h3 className="text-xl font-semibold text-text mb-4">⚙️ Technical Implementation</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-text mb-2">API Endpoint:</h4>
            <code className="block p-3 bg-muted/10 rounded-lg text-sm text-text/80 break-all">
              https://vision.googleapis.com/v1/images:annotate?key=AIzaSyCZu8wrFDtLCewJRVhuADFaZ1LAiHt6hec
            </code>
          </div>
          
          <div>
            <h4 className="font-medium text-text mb-2">Request Structure:</h4>
            <pre className="block p-3 bg-muted/10 rounded-lg text-sm text-text/80 overflow-x-auto">
{`{
  "requests": [
    {
      "image": {
        "content": "BASE64_IMAGE"
      },
      "features": [
        {
          "type": "LABEL_DETECTION",
          "maxResults": 10
        }
      ]
    }
  ]
}`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium text-text mb-2">Response Processing:</h4>
            <pre className="block p-3 bg-muted/10 rounded-lg text-sm text-text/80 overflow-x-auto">
{`// Extract labels from API response
const labels = response.responses[0]?.labelAnnotations || []

// Format with confidence percentages
const formattedLabels = labels.map(label => ({
  description: label.description,
  confidence: Math.round(label.score * 100)
}))`}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ImageDetectionDemo
