import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, storage } from '../services/supabase'
import SpeechToText from '../components/SpeechToText'
import AdvancedLocationPicker from '../components/AdvancedLocationPicker'

/**
 * ReportIssue page component
 * Enhanced implementation with camera capture, GPS location detection, voice recording, and Supabase integration
 * Provides comprehensive civic issue reporting functionality
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
   * Cleanup camera stream when component unmounts
   */
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Report a Civic Issue
        </h1>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Camera Capture Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📷 Capture Photo
            </h2>
            
            <div className="space-y-4">
              {/* Camera Preview / Captured Image */}
              <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
                {isCapturing ? (
                  // Live camera preview
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ minHeight: '300px' }}
                  />
                ) : capturedImage ? (
                  // Show captured image
                  <img
                    src={capturedImage}
                    alt="Captured issue"
                    className="w-full h-full object-cover"
                    style={{ minHeight: '300px' }}
                    onError={(e) => {
                      console.error('Image load error:', e)
                    }}
                  />
                ) : (
                  // Placeholder when no camera is active
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="text-gray-400 text-6xl mb-4">📷</div>
                      <p className="text-gray-600">No photo captured yet</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="flex space-x-4">
                {!isCapturing && !capturedImage && (
                  <button
                    type="button"
                    onClick={startCamera}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    📷 Start Camera
                  </button>
                )}

                {isCapturing && (
                  <>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      📸 Capture Photo
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {capturedImage && (
                  <>
                    <button
                      type="button"
                      onClick={() => setCapturedImage(null)}
                      className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                    >
                      🔄 Retake Photo
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Hidden canvas for image capture */}
            <canvas ref={canvasRef} className="hidden" />
          </section>

          {/* Speech-to-Text Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              🎤 Speech-to-Text Description
            </h2>
            
            <SpeechToText 
              onTranscript={(transcript) => {
                setVoiceTranscript(transcript)
                setDescription(transcript)
              }}
              currentTranscript={voiceTranscript}
            />
          </section>

          {/* Advanced Location Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              �️ Advanced Location Picker
            </h2>
            
            <AdvancedLocationPicker 
              onLocationChange={(newLocation) => setLocation(newLocation)}
              initialLocation={location}
            />
          </section>

          {/* Description Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              ✏️ Description
            </h2>
            
            <div>
              <label htmlFor="issue-description" className="block text-sm font-medium text-gray-700 mb-2">
                Issue Description *
              </label>
              <textarea
                id="issue-description"
                name="issue-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide a detailed description of the civic issue you're reporting..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                {description.length}/500 characters
              </p>
            </div>
          </section>

          {/* Submit Section */}
          <section>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={submitReport}
                disabled={isLoading || !capturedImage || (!description.trim() && !voiceTranscript.trim()) || !location.latitude}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Report...
                  </span>
                ) : (
                  '📤 Submit Report'
                )}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                🔄 Reset Form
              </button>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>• All fields marked with * are required</p>
              <p>• You can either type a description OR record a voice message</p>
              <p>• Your report will be submitted with "pending" status</p>
              <p>• Location and photo help us resolve issues faster</p>
              <p>• Voice recording uses AI transcription for accurate text conversion</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default ReportIssue
