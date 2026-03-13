import React, { useState, useRef, useCallback } from 'react'
import { useTheme } from '../context/ThemeContext'
import Button from './ui/Button'
import Card from './ui/Card'
import Badge from './ui/Badge'

/**
 * Google Cloud Vision API Image Detection Component
 * 
 * This component integrates with Google Vision API to detect objects and concepts
 * in uploaded images using LABEL_DETECTION feature.
 * 
 * API Endpoint: https://vision.googleapis.com/v1/images:annotate
 * 
 * Features:
 * - Image upload (JPG/PNG, max 5MB)
 * - Drag-and-drop support
 * - Base64 conversion for API transmission
 * - Loading states and error handling
 * - Confidence visualization with progress bars
 * - Responsive design with theme support
 */

const ImageDetection = () => {
  const { isLight } = useTheme()
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [detectedLabels, setDetectedLabels] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  
  const fileInputRef = useRef(null)
  const dragCounter = useRef(0)

  // Google Vision API configuration
  const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate'
  const API_KEY = 'AIzaSyCZu8wrFDtLCewJRVhuADFaZ1LAiHt6hec'
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const SUPPORTED_FORMATS = ['image/jpeg', 'image/png']

  /**
   * Convert image file to Base64
   * @param {File} file - Image file to convert
   * @returns {Promise<string>} Base64 encoded image
   */
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        // Remove data URL prefix to get pure Base64
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read image file'))
      }
      
      reader.readAsDataURL(file)
    })
  }

  /**
   * Call Google Vision API for label detection
   * @param {string} base64Image - Base64 encoded image
   * @returns {Promise<Object>} API response
   */
  const detectLabels = async (base64Image) => {
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
      throw new Error(errorData.error?.message || 'Failed to analyze image')
    }

    return response.json()
  }

  /**
   * Process uploaded image and detect labels
   * @param {File} file - Uploaded image file
   */
  const processImage = async (file) => {
    try {
      // Validate file
      if (!SUPPORTED_FORMATS.includes(file.type)) {
        throw new Error('Please upload a JPG or PNG image')
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error('Image size must be less than 5MB')
      }

      // Set loading state
      setIsLoading(true)
      setError('')
      setDetectedLabels([])

      // Create image preview
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
      setUploadedImage(file)

      // Convert to Base64
      const base64Image = await convertToBase64(file)

      // Call Vision API
      const response = await detectLabels(base64Image)
      
      // Extract and process labels
      const labels = response.responses[0]?.labelAnnotations || []
      
      // Format labels with confidence percentages
      const formattedLabels = labels.map(label => ({
        description: label.description,
        confidence: Math.round(label.score * 100),
        score: label.score
      }))

      setDetectedLabels(formattedLabels)

    } catch (err) {
      setError(err.message || 'Failed to process image')
      console.error('Image detection error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle file input change
   * @param {Event} event - File input change event
   */
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      processImage(file)
    }
  }

  /**
   * Handle drag events
   */
  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsDragging(false)
    dragCounter.current = 0
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      processImage(file)
    }
  }, [])

  /**
   * Reset the detection state
   */
  const resetDetection = () => {
    setUploadedImage(null)
    setImagePreview(null)
    setDetectedLabels([])
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * Get confidence color based on percentage
   * @param {number} confidence - Confidence percentage (0-100)
   * @returns {string} Color variant for Badge component
   */
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
          🤖 AI Image Detection
        </h1>
        <p className="text-text/60">
          Upload an image to detect objects and concepts using Google Vision AI
        </p>
      </div>

      {/* Upload Area */}
      <Card className="mb-8">
        <div
          className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center
            transition-all duration-300 cursor-pointer
            ${isDragging 
              ? 'border-primary bg-primary/10 scale-105' 
              : 'border-border hover:border-primary/50 hover:bg-primary/5'
            }
            ${isLoading ? 'pointer-events-none opacity-50' : ''}
          `}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !isLoading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isLoading}
          />

          {isLoading ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-text font-medium">Analyzing image...</p>
              <p className="text-sm text-text/60">Detecting objects and concepts</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted/20 flex items-center justify-center">
                <span className="text-2xl">📸</span>
              </div>
              <div>
                <p className="text-text font-medium mb-2">
                  {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-text/60">
                  JPG or PNG (max 5MB)
                </p>
              </div>
              <Button variant="outline" size="sm">
                Choose File
              </Button>
            </div>
          )}
        </div>
      </Card>

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

      {/* Results Display */}
      {imagePreview && (
        <div className="space-y-8">
          {/* Image Preview */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text">📷 Uploaded Image</h2>
              <Button variant="outline" size="sm" onClick={resetDetection}>
                🗑️ Clear
              </Button>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-muted/10">
              <img
                src={imagePreview}
                alt="Uploaded for detection"
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
          </Card>

          {/* Detection Results */}
          {detectedLabels.length > 0 && (
            <Card>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-text mb-2">
                  🤖 Detection Results
                </h2>
                <p className="text-sm text-text/60">
                  Found {detectedLabels.length} objects/concepts in the image
                </p>
              </div>

              <div className="space-y-4">
                {detectedLabels.map((label, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/10 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">🏷️</div>
                      <div>
                        <p className="font-medium text-text capitalize">
                          {label.description}
                        </p>
                        <p className="text-sm text-text/60">
                          Confidence: {label.confidence}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {/* Confidence Bar */}
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`
                            h-full transition-all duration-500 ease-out
                            ${label.confidence >= 80 ? 'bg-success' : ''}
                            ${label.confidence >= 60 && label.confidence < 80 ? 'bg-primary' : ''}
                            ${label.confidence >= 40 && label.confidence < 60 ? 'bg-warning' : ''}
                            ${label.confidence < 40 ? 'bg-muted' : ''}
                          `}
                          style={{ width: `${label.confidence}%` }}
                        ></div>
                      </div>
                      {/* Confidence Badge */}
                      <Badge variant={getConfidenceColor(label.confidence)}>
                        {label.confidence}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {detectedLabels.length}
                    </p>
                    <p className="text-sm text-text/60">Total Labels</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-success">
                      {detectedLabels.filter(l => l.confidence >= 80).length}
                    </p>
                    <p className="text-sm text-text/60">High Confidence</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {Math.round(detectedLabels.reduce((acc, l) => acc + l.confidence, 0) / detectedLabels.length)}%
                    </p>
                    <p className="text-sm text-text/60">Avg Confidence</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default ImageDetection
