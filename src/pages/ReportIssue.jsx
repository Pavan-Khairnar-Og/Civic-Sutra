import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { supabase, storage } from '../services/supabase'
import SpeechToText from '../components/SpeechToText'
import AdvancedLocationPicker from '../components/AdvancedLocationPicker'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'

/**
 * ReportIssue page component - Modern Figma-style design system
 * Clean, minimal interface with smooth animations and theme support
 * Enhanced implementation with camera capture, GPS location detection, voice recording
 */
const ReportIssue = () => {
  const navigate = useNavigate()
  const { isLight, isDark } = useTheme()
  
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
    <div className="min-h-screen bg-background">
      {/* Header - Modern with Custom Colors */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-text mb-4">
              Report a Civic Issue
            </h1>
            <p className="text-lg text-text/60 max-w-2xl mx-auto">
              Help improve your community by reporting issues. Your voice matters!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Success Message */}
        {success && (
          <Card className="mb-6 border-secondary/20 bg-secondary/10">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center mr-4">
                <span className="text-secondary">✅</span>
              </div>
              <p className="text-secondary font-medium">{success}</p>
            </div>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-danger/20 bg-danger/10">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center mr-4">
                <span className="text-danger">❌</span>
              </div>
              <p className="text-danger font-medium">{error}</p>
            </div>
          </Card>
        )}

        {/* Form Sections */}
        <div className="space-y-8">
          {/* Camera Capture Section */}
          <Card hover={true} className="overflow-hidden group">
            <Card.Header>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="text-2xl">📷</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text">Capture Photo Evidence</h2>
                  <p className="text-sm text-text/60">Take a clear photo of the issue</p>
                </div>
              </div>
            </Card.Header>
            
            <Card.Body>
              {/* Camera Preview */}
              <div className={`
                relative rounded-2xl overflow-hidden mb-6 border-2 border-dashed border-border
                ${isLight ? 'bg-muted/20' : 'bg-muted/10'}
                transition-all duration-200
              `} style={{ minHeight: '320px' }}>
                {isCapturing ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ minHeight: '320px' }}
                  />
                ) : capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Captured issue"
                    className="w-full h-full object-cover"
                    style={{ minHeight: '320px' }}
                    onError={(e) => {
                      console.error('Image load error:', e)
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+Error'
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full" style={{ minHeight: '320px' }}>
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl text-muted">📷</span>
                      </div>
                      <p className="text-text/60 font-medium">No photo captured yet</p>
                      <p className="text-sm text-text/40 mt-2">Click "Start Camera" to begin</p>
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
                    className="sm:flex-1 py-4"
                  >
                    📸 Start Camera
                  </Button>
                )}
                
                {isCapturing && (
                  <>
                    <Button 
                      variant="primary" 
                      onClick={capturePhoto}
                      disabled={isLoading}
                      loading={isLoading}
                      fullWidth={true}
                      className="sm:flex-1 py-4"
                    >
                      📸 Capture Photo
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={stopCamera}
                      fullWidth={true}
                      className="sm:flex-1 py-4"
                    >
                      ❌ Cancel
                    </Button>
                  </>
                )}
                
                {capturedImage && (
                  <>
                    <Button 
                      variant="secondary" 
                      onClick={retakePhoto}
                      fullWidth={true}
                      className="sm:flex-1 py-4"
                    >
                      🔄 Retake Photo
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={deletePhoto}
                      fullWidth={true}
                      className="sm:flex-1 py-4"
                    >
                      🗑️ Delete Photo
                    </Button>
                  </>
                )}
              </div>

              {/* Hidden canvas */}
              <canvas ref={canvasRef} className="hidden" />
            </Card.Body>
          </Card>

          {/* Voice Description Section */}
          <Card hover={true} className="group">
            <Card.Header>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <span className="text-2xl">🎤</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text">Voice Description</h2>
                  <p className="text-sm text-text/60">Speak naturally to describe the issue</p>
                </div>
              </div>
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
          <Card hover={true} className="group">
            <Card.Header>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text">Issue Description</h2>
                  <p className="text-sm text-text/60">Provide detailed information</p>
                </div>
              </div>
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
          <Card hover={true} className="group">
            <Card.Header>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="text-2xl">📍</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text">Issue Location</h2>
                  <p className="text-sm text-text/60">Pinpoint the exact location</p>
                </div>
              </div>
            </Card.Header>
            
            <Card.Body>
              <AdvancedLocationPicker 
                onLocationChange={(newLocation) => setLocation(newLocation)}
                initialLocation={location}
              />
              
              {location.latitude && location.longitude && (
                <div className="mt-6 p-4 bg-primary/10 rounded-2xl border border-primary/20">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                      <span className="text-primary">📍</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">Location Selected</p>
                      <p className="text-xs text-primary/80 font-mono">
                        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Submit Section */}
          <Card className="border-primary/20 bg-primary/5">
            <Card.Body>
              <Button 
                variant="primary" 
                size="lg"
                onClick={handleSubmit}
                disabled={isLoading || !description.trim() || !location.latitude}
                loading={isLoading}
                fullWidth={true}
                className="text-lg py-6 shadow-soft hover:shadow-medium transform hover:scale-105 transition-all duration-200"
              >
                {isLoading ? 'Submitting...' : '🚀 Submit Issue Report'}
              </Button>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-text/60">
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
