import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, storage } from '../services/supabase'
import SpeechToText from '../components/SpeechToText'
import AdvancedLocationPicker from '../components/AdvancedLocationPicker'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'

/**
 * ReportIssue page component - Modern, mobile-first design
 * Enhanced implementation with camera capture, GPS location detection, voice recording, and Supabase integration
 * Clean, intuitive interface for non-technical users
 */
const ReportIssue = () => {
  const navigate = useNavigate()
  
  // State for form data
  const [description, setDescription] = useState('')
  const [capturedImage, setCapturedImage] = useState(null)
  const [location, setLocation] = useState({ latitude: null, longitude: null })
  const [voiceTranscript, setVoiceTranscript] = useState('')
  
  // State for UI management
  const [isLoading, setIsLoading] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Refs for camera and video stream
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  /**
   * Start camera stream
   * Requests camera permission and starts video stream
   * Includes detailed error handling for different permission scenarios
   */
  const startCamera = async () => {
    try {
      setError('')
      setIsCapturing(true)

      // Request camera access with ideal settings
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use rear camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      // Store stream reference for cleanup
      streamRef.current = stream

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

    } catch (error) {
      setIsCapturing(false)
      let errorMessage = 'Unable to access camera'
      
      // Provide specific error messages based on error type
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera access denied. Please allow camera permissions in your browser settings and refresh the page.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on your device. Please ensure your device has a working camera.'
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application. Please close other applications that might be using the camera.'
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera constraints cannot be satisfied. Please try refreshing the page or using a different browser.'
      } else {
        errorMessage = `Camera error: ${error.message || 'Unknown error occurred'}`
      }
      
      setError(errorMessage)
    }
  }

  /**
   * Stop camera stream
   * Cleanup function to properly stop video stream and release resources
   */
  const stopCamera = () => {
    if (streamRef.current) {
      // Stop all tracks in the stream
      streamRef.current.getTracks().forEach(track => {
        track.stop()
        track.enabled = false // Explicitly disable track
      })
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsCapturing(false)
  }

  /**
   * Capture photo from video stream
   * Takes a snapshot from video and converts it to image data
   * Includes validation and error handling
   */
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera not ready. Please try starting the camera again.')
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    // Validate video state
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Camera not providing valid video stream. Please try again.')
      return
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    try {
      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to image data URL with quality settings
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setCapturedImage(imageDataUrl)

      // Stop camera after successful capture
      stopCamera()
      
      setSuccess('Photo captured successfully!')
      setTimeout(() => setSuccess(''), 3000)
      
    } catch (error) {
      setError('Failed to capture photo. Please try again.')
      console.error('Photo capture error:', error)
    }
  }

  /**
   * Upload image to Supabase Storage
   * Enhanced with better error handling and logging
   * @param {string} imageDataUrl - Base64 image data
   * @returns {string} Public URL of uploaded image
   */
  const uploadImageToSupabase = async (imageDataUrl) => {
    try {
      // Convert base64 to blob with error handling
      const response = await fetch(imageDataUrl)
      if (!response.ok) {
        throw new Error('Failed to process image data')
      }
      
      const blob = await response.blob()

      // Generate unique filename with URL-safe characters
      const fileName = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`
      const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `reports/${safeFileName}`

      console.log('Uploading file:', filePath)

      // Upload to Supabase Storage with retry logic
      const { data: uploadData, error: uploadError } = await storage.upload(
        'report-images', // bucket name
        filePath,
        blob,
        {
          cacheControl: '3600',
          upsert: false
        }
      )

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      console.log('Upload successful:', uploadData)

      // Get public URL with proper error handling
      const { data } = supabase.storage
        .from('report-images')
        .getPublicUrl(filePath)

      if (!data || !data.publicUrl) {
        throw new Error('Failed to get public URL')
      }

      console.log('Public URL:', data.publicUrl)

      return data.publicUrl

    } catch (error) {
      console.error('Image upload error:', error)
      throw new Error('Failed to upload image')
    }
  }

  /**
   * Submit report to Supabase database
   * Enhanced with comprehensive validation and error handling
   * Uploads image and saves report data
   */
  const submitReport = async () => {
    // Enhanced validation with specific error messages
    if (!capturedImage) {
      setError('Please capture a photo of the issue before submitting.')
      return
    }

    if (!description.trim() && !voiceTranscript.trim()) {
      setError('Please provide either a written description or record a voice message.')
      return
    }

    if (!location.latitude || !location.longitude) {
      setError('Please enable location detection or wait for GPS to load.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Step 1: Upload image to Supabase Storage
      const imageUrl = await uploadImageToSupabase(capturedImage)

      // Step 2: Prepare report data with all required fields
      const reportData = {
        image_url: imageUrl,
        description: voiceTranscript.trim() || description.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
        status: 'pending',
        created_at: new Date().toISOString()
      }

      console.log('Submitting report:', reportData)

      // Step 3: Save report data to Supabase database
      const { data, error: insertError } = await supabase
        .from('reports')
        .insert([reportData])
        .select()

      if (insertError) {
        throw insertError
      }

      // Success! Navigate to reports page
      setSuccess('Report submitted successfully! Your civic issue has been recorded.')
      setTimeout(() => {
        navigate('/my-reports', { 
          state: { message: 'Issue reported successfully!' }
        })
      }, 2000)

    } catch (error) {
      console.error('Submit error:', error)
      setError(error.message || 'Failed to submit report. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Reset form
   * Clears all form data and captured media
   */
  const resetForm = () => {
    setDescription('')
    setCapturedImage(null)
    setVoiceTranscript('')
    setError('')
    setSuccess('')
    stopCamera()
    setLocation({ latitude: null, longitude: null })
  }

  /**
   * Handle form submission
   * Wrapper function for submitReport to match button onClick handler
   */
  const handleSubmit = async () => {
    await submitReport()
  }

  /**
   * Cleanup camera stream when component unmounts
   */
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Report a Civic Issue
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help improve your community by reporting issues. Your voice matters!
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <div className="flex items-center">
              <span className="text-2xl mr-3">✅</span>
              <p className="text-green-800 font-medium">{success}</p>
            </div>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <div className="flex items-center">
              <span className="text-2xl mr-3">❌</span>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </Card>
        )}

        <div className="space-y-6">
          {/* Camera Capture Section */}
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                📷 Capture Photo Evidence
              </h2>
            </Card.Header>
            
            <Card.Body>
              {/* Camera Preview / Captured Image */}
              <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4" style={{ minHeight: '280px' }}>
                {isCapturing ? (
                  // Live camera preview
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ minHeight: '280px' }}
                  />
                ) : capturedImage ? (
                  // Show captured image
                  <img
                    src={capturedImage}
                    alt="Captured issue"
                    className="w-full h-full object-cover"
                    style={{ minHeight: '280px' }}
                    onError={(e) => {
                      console.error('Image load error:', e)
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+Error'
                    }}
                  />
                ) : (
                  // Placeholder
                  <div className="flex items-center justify-center h-full" style={{ minHeight: '280px' }}>
                    <div className="text-center">
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-gray-500">No photo captured yet</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                {!isCapturing && !capturedImage && (
                  <Button 
                    variant="primary" 
                    onClick={startCamera}
                    fullWidth={true}
                    className="sm:flex-1"
                  >
                    📸 Start Camera
                  </Button>
                )}
                
                {isCapturing && (
                  <>
                    <Button 
                      variant="success" 
                      onClick={capturePhoto}
                      disabled={isLoading}
                      loading={isLoading}
                      fullWidth={true}
                      className="sm:flex-1"
                    >
                      📸 Capture Photo
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={stopCamera}
                      fullWidth={true}
                      className="sm:flex-1"
                    >
                      ❌ Cancel
                    </Button>
                  </>
                )}
                
                {capturedImage && (
                  <>
                    <Button 
                      variant="warning" 
                      onClick={retakePhoto}
                      fullWidth={true}
                      className="sm:flex-1"
                    >
                      🔄 Retake Photo
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={deletePhoto}
                      fullWidth={true}
                      className="sm:flex-1"
                    >
                      🗑️ Delete Photo
                    </Button>
                  </>
                )}
              </div>

              {/* Hidden canvas for image capture */}
              <canvas ref={canvasRef} className="hidden" />
            </Card.Body>
          </Card>

          {/* Speech-to-Text Section */}
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                🎤 Voice Description
              </h2>
            </Card.Header>
            
            <Card.Body>
              <SpeechToText 
                onTranscript={(transcript) => {
                  setVoiceTranscript(transcript)
                  setDescription(transcript)
                }}
                currentTranscript={voiceTranscript}
              />
            </Card.Body>
          </Card>

          {/* Description Input Section */}
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                📝 Issue Description
              </h2>
            </Card.Header>
            
            <Card.Body>
              <Input.Textarea
                label="Describe the civic issue"
                placeholder="Please provide details about the issue you're reporting..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required={true}
                helperText="Be as specific as possible to help us address the issue quickly"
              />
            </Card.Body>
          </Card>

          {/* Location Section */}
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                📍 Issue Location
              </h2>
            </Card.Header>
            
            <Card.Body>
              <AdvancedLocationPicker 
                onLocationChange={(newLocation) => setLocation(newLocation)}
                initialLocation={location}
              />
              
              {location.latitude && location.longitude && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">📍</span>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Location Selected</p>
                      <p className="text-xs text-blue-700 font-mono">
                        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Submit Section */}
          <Card>
            <Card.Body>
              <Button 
                variant="primary" 
                size="lg"
                onClick={handleSubmit}
                disabled={isLoading || !description.trim() || !location.latitude}
                loading={isLoading}
                fullWidth={true}
                className="text-lg py-4"
              >
                {isLoading ? 'Submitting...' : '🚀 Submit Issue Report'}
              </Button>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  By submitting, you agree to help improve your community
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ReportIssue
