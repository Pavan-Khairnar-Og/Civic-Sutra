import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { supabase, imageReports } from '../services/supabase'
import { analyzeIssueImage } from '../services/imageAnalysis'
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
  const [location, setLocation] = useState({ latitude: null, longitude: null, address: null })
  const [voiceTranscript, setVoiceTranscript] = useState('')
  
  // State for AI analysis
  const [aiResult, setAiResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // State for user information
  const [citizenName, setCitizenName] = useState('')
  const [citizenEmail, setCitizenEmail] = useState('')
  const [title, setTitle] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // State for UI management
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
   * Takes snapshot from camera and converts to image data
   * Enhanced with AI analysis integration
   */
  const capturePhoto = async () => {
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
      
      setSuccess('Photo captured successfully! Analyzing with AI...')
      setTimeout(() => setSuccess(''), 3000)
      
      // Start AI analysis
      await analyzeImageWithAI(imageDataUrl)
      
    } catch (error) {
      setError('Failed to capture photo. Please try again.')
      console.error('Photo capture error:', error)
    }
  }

  /**
   * Analyze captured image with Groq AI
   * @param {string} imageDataUrl - Base64 image data
   */
  const analyzeImageWithAI = async (imageDataUrl) => {
    try {
      setIsAnalyzing(true)
      setError('')
      
      // Convert data URL to base64 (remove prefix)
      const base64Data = imageDataUrl.replace(/^data:image\/[a-z]+;base64,/, '')
      
      // Analyze with Groq AI
      const result = await analyzeIssueImage(base64Data, 'image/jpeg')
      
      setAiResult(result)
      
      // Auto-fill title based on AI result
      if (result.isValidCivicIssue && result.issueType) {
        setTitle(`AI Detected: ${result.issueType.charAt(0).toUpperCase() + result.issueType.slice(1)}`)
      }
      
      setSuccess('AI analysis complete! Issue classified successfully.')
      setTimeout(() => setSuccess(''), 3000)
      
    } catch (error) {
      console.error('AI analysis error:', error)
      setError('AI analysis failed. You can still submit the report manually.')
      // Don't block submission if AI fails
    } finally {
      setIsAnalyzing(false)
    }
  }

  /**
   * Upload image to Supabase Storage with fallback
   * Enhanced with better error handling and logging
   * @param {string} imageDataUrl - Base64 image data
   * @returns {string} Public URL of uploaded image
   */
  const uploadImageToSupabase = async (imageDataUrl) => {
    try {
      console.log('Starting image upload...')
      
      // Check if Supabase is properly configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Supabase configuration missing. Please check environment variables.')
      }
      
      // Convert base64 to blob with error handling
      const response = await fetch(imageDataUrl)
      if (!response.ok) {
        throw new Error('Failed to process image data')
      }
      
      const blob = await response.blob()
      console.log('Image blob created, size:', blob.size, 'bytes')

      // Check blob size (Supabase has limits)
      if (blob.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('Image too large. Please use an image smaller than 10MB.')
      }

      // Generate unique filename with URL-safe characters
      const fileName = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`
      const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `reports/${safeFileName}`

      console.log('Uploading file:', filePath)

      // Upload to Supabase Storage using correct API
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('report-images')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        
        // Handle specific Supabase errors
        if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
          throw new Error('Storage bucket "report-images" not found. Please create it in Supabase dashboard.')
        } else if (uploadError.message.includes('permission') || uploadError.message.includes('unauthorized')) {
          throw new Error('Permission denied. Please check Supabase storage permissions.')
        } else if (uploadError.message.includes('quota') || uploadError.message.includes('limit')) {
          throw new Error('Storage quota exceeded. Please try again later.')
        } else {
          throw new Error(`Upload failed: ${uploadError.message}`)
        }
      }

      console.log('Upload successful:', uploadData)

      // Get public URL with proper error handling
      const { data: urlData } = supabase.storage
        .from('report-images')
        .getPublicUrl(filePath)

      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to get public URL')
      }

      console.log('Public URL:', urlData.publicUrl)

      return urlData.publicUrl

    } catch (error) {
      console.error('Image upload error:', error)
      
      // Return a more specific error message
      if (error.message.includes('Supabase configuration missing')) {
        throw new Error('Database not configured. Please contact administrator.')
      } else if (error.message.includes('bucket')) {
        throw new Error('Storage not configured. Please contact administrator.')
      } else if (error.message.includes('permission')) {
        throw new Error('Access denied. Please check your permissions.')
      } else {
        throw new Error(`Image upload failed: ${error.message}`)
      }
    }
  }

  /**
   * Submit report to Supabase database with AI integration
   * Enhanced with comprehensive validation and error handling
   * Uploads image, uses AI analysis, and saves complete report data
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

    setIsSubmitting(true)
    setError('')

    try {
      // Get current user (allow anonymous submissions)
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      // Step 1: Convert image data URL to File object
      const response = await fetch(capturedImage)
      if (!response.ok) {
        throw new Error('Failed to process image data')
      }
      
      const blob = await response.blob()
      const file = new File([blob], 'report-image.jpg', { type: 'image/jpeg' })

      // Step 2: Upload image using new uploadReportImage function
      // For anonymous users, use a temporary ID for folder structure
      const userId = user?.id || 'anonymous'
      const { imageUrl, imagePath } = await imageReports.uploadReportImage(file, userId)

      // Step 3: Prepare complete report data with AI results
      const reportData = {
        userId: user?.id || null,
        citizenName: citizenName.trim() || null,
        citizenEmail: citizenEmail.trim() || user?.email || null,
        title: title.trim() || (aiResult?.isValidCivicIssue 
          ? `AI Detected: ${aiResult.issueType.charAt(0).toUpperCase() + aiResult.issueType.slice(1)}`
          : 'Civic Issue Report'),
        description: voiceTranscript.trim() || description.trim(),
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address || null
        },
        imageUrl,
        imagePath,
        aiResult: aiResult || {
          issueType: 'other',
          confidence: 0,
          severity: 'low',
          description: description.trim() || 'No description provided',
          suggestedDepartment: 'Other',
          isValidCivicIssue: false,
          reasoning: 'No AI analysis available'
        }
      }

      console.log('Submitting report with data:', reportData)

      // Step 4: Save complete report using new saveReport function
      const savedReport = await imageReports.saveReport(reportData)

      // Success! Navigate to my-reports with success parameter
      setSuccess('Report submitted successfully! Your civic issue has been recorded.')
      setTimeout(() => {
        if (user) {
          navigate('/my-reports?success=' + savedReport.id)
        } else {
          navigate('/', { 
            state: { 
              message: 'Report submitted successfully! You can view all reports on the map.',
              type: 'success'
            }
          })
        }
      }, 2000)

    } catch (error) {
      console.error('Submit error:', error)
      setError(error.message || 'Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
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
    setLocation({ latitude: null, longitude: null, address: null })
    
    // Reset new state variables
    setAiResult(null)
    setIsAnalyzing(false)
    setCitizenName('')
    setCitizenEmail('')
    setTitle('')
    setIsSubmitting(false)
  }

  /**
   * Handle form submission
   * Wrapper function for submitReport to match button onClick handler
   */
  const handleSubmit = async () => {
    await submitReport()
  }

  /**
   * Retake photo
   * Clears current image, AI results, and restarts camera
   */
  const retakePhoto = () => {
    setCapturedImage(null)
    setAiResult(null)
    setTitle('')
    setError('')
    setSuccess('')
    startCamera()
  }

  /**
   * Delete photo
   * Clears current image and AI results without restarting camera
   */
  const deletePhoto = () => {
    setCapturedImage(null)
    setAiResult(null)
    setTitle('')
    setError('')
    setSuccess('')
  }

  /**
   * Check authentication status and get user info
   */
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
      
      // Pre-fill email if user is authenticated
      if (user?.email && !citizenEmail) {
        setCitizenEmail(user.email)
      }
    }
    
    checkAuth()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user)
      if (session?.user?.email && !citizenEmail) {
        setCitizenEmail(session.user.email)
      }
    })
    
    return () => subscription.unsubscribe()
  }, [citizenEmail])

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

          {/* Citizen Information Section */}
          <Card hover={true} className="group">
            <Card.Header>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-text">Your Information</h2>
                    <p className="text-sm text-text/60">
                      {isAuthenticated ? 'Optional contact details' : 'Optional - Submit anonymously or provide contact info'}
                    </p>
                  </div>
                </div>
                {isAuthenticated && (
                  <Badge variant="success" size="sm">
                    ✓ Signed In
                  </Badge>
                )}
              </div>
            </Card.Header>
            
            <Card.Body>
              {!isAuthenticated && (
                <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center">
                    <span className="text-primary mr-2">ℹ️</span>
                    <p className="text-sm text-primary/80">
                      You're submitting anonymously. Sign in to track your reports and receive updates.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Your Name (Optional)"
                  placeholder={isAuthenticated ? "Your name" : "Anonymous citizen"}
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  helperText={isAuthenticated ? "Helps us follow up on your report" : "Optional - helps us follow up"}
                />
                
                <Input
                  label="Email (Optional)"
                  type="email"
                  placeholder={isAuthenticated ? "your@email.com" : "email@example.com"}
                  value={citizenEmail}
                  onChange={(e) => setCitizenEmail(e.target.value)}
                  helperText={isAuthenticated ? "For status updates and notifications" : "Optional - for updates on your report"}
                  disabled={isAuthenticated && !!supabase.auth.getUser().then(d => d.data?.user?.email)}
                />
              </div>
            </Card.Body>
          </Card>

          {/* AI Analysis Results Section */}
          {aiResult && (
            <Card className="border-success/20 bg-success/5">
              <Card.Header>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-text">AI Analysis Results</h2>
                    <p className="text-sm text-text/60">Issue automatically classified</p>
                  </div>
                </div>
              </Card.Header>
              
              <Card.Body>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-text mb-3">Issue Classification</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                        <span className="text-sm font-medium">Type:</span>
                        <Badge variant={aiResult.isValidCivicIssue ? 'success' : 'muted'}>
                          {aiResult.issueType}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                        <span className="text-sm font-medium">Severity:</span>
                        <Badge variant={
                          aiResult.severity === 'critical' ? 'danger' :
                          aiResult.severity === 'high' ? 'warning' :
                          aiResult.severity === 'medium' ? 'primary' : 'success'
                        }>
                          {aiResult.severity}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                        <span className="text-sm font-medium">Department:</span>
                        <Badge variant="outline">
                          {aiResult.suggestedDepartment}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-text mb-3">Analysis Details</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-muted/10 rounded-lg">
                        <span className="text-sm font-medium">Confidence:</span>
                        <div className="flex items-center mt-1">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-success transition-all duration-500"
                              style={{ width: `${aiResult.confidence * 100}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-success font-medium">
                            {Math.round(aiResult.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-muted/10 rounded-lg">
                        <span className="text-sm font-medium">AI Description:</span>
                        <p className="text-sm text-text/80 mt-1">{aiResult.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {aiResult.reasoning && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                    <h4 className="text-sm font-medium text-primary mb-1">AI Reasoning:</h4>
                    <p className="text-sm text-primary/80">{aiResult.reasoning}</p>
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-warning/10 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-warning mr-2">💡</span>
                    <p className="text-sm text-warning/80">
                      This AI analysis helps us route your report to the right department and prioritize it accordingly.
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* AI Analysis Loading */}
          {isAnalyzing && (
            <Card className="border-primary/20 bg-primary/5">
              <Card.Body>
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl animate-pulse">🤖</span>
                    </div>
                    <h3 className="text-lg font-semibold text-text mb-2">Analyzing with AI...</h3>
                    <p className="text-sm text-text/60">Our AI is analyzing your image to classify the issue</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

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
                disabled={isSubmitting || isAnalyzing || !description.trim() || !location.latitude}
                loading={isSubmitting}
                fullWidth={true}
                className="text-lg py-6 shadow-soft hover:shadow-medium transform hover:scale-105 transition-all duration-200"
              >
                {isSubmitting ? 'Submitting...' : isAnalyzing ? 'Analyzing...' : '🚀 Submit Issue Report'}
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
