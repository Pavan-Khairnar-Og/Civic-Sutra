import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CloudUpload, X, MapPin, CheckCircle, AlertTriangle, Clock, 
  ChevronLeft, ChevronRight, Loader2, Check, Info
} from 'lucide-react'
import { supabase, imageReports } from '../services/supabase'
import { analyzeIssueImage } from '../services/imageAnalysis'

// Simple UUID generator function
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Normalize severity from AI analysis
const normalizeSeverity = (s) => {
  const lower = (s || '').toLowerCase().trim();
  if (lower.includes('critical') || lower.includes('severe') ||
      lower.includes('emergency') || lower.includes('dangerous')) {
    return 'critical';
  }
  if (lower.includes('high') || lower.includes('major') ||
      lower.includes('serious') || lower.includes('urgent')) {
    return 'high';
  }
  if (lower.includes('low') || lower.includes('minor') ||
      lower.includes('cosmetic')) {
    return 'low';
  }
  return 'medium';
};

// Normalize confidence to 0-100 scale
const normalizeConfidence = (c) => {
  if (!c) return 50;
  if (c > 1) return Math.min(Math.round(c), 100);
  return Math.min(Math.round(c * 100), 100);
};

const ReportIssue = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, isAnonymous } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [reportId, setReportId] = useState('')
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: [],
    category: '',
    severity: 'medium',
    location: null,
    address: '',
    landmark: '',
    ward: '',
    pinCode: '',
    termsAccepted: false
  })

  // Separate state for File objects and preview URLs
  const [imageFiles, setImageFiles] = useState([])     // actual File objects for API
  const [imagePreviews, setImagePreviews] = useState([]) // URLs for display only

  // AI classification
  const [isClassifying, setIsClassifying] = useState(false)
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false)
  const [textAnalysis, setTextAnalysis] = useState(null)
  const [imageAnalysis, setImageAnalysis] = useState(null)
  const [aiClassification, setAiClassification] = useState(null)
  const [overrideClassification, setOverrideClassification] = useState(false)

  // Map state
  const [mapCenter] = useState([19.0760, 72.8777]) // Mumbai
  const [markerPosition, setMarkerPosition] = useState(null)

  // Silently capture accurate location immediately on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMarkerPosition(prev => prev || [pos.coords.latitude, pos.coords.longitude])
        },
        () => {} // silently fail if denied
      )
    }
  }, [])

  // File upload
  const [isDragOver, setIsDragOver] = useState(false)

  // AI Classification Logic
  const classifyIssue = useCallback((title, description) => {
    const text = `${title} ${description}`.toLowerCase()
    
    const categories = {
      'Water Supply': {
        keywords: ['leak', 'pipe', 'water', 'flood', 'drain', 'sewage', 'tap', 'supply'],
        icon: '💧',
        color: '#0077B6'
      },
      'Roads & Footpaths': {
        keywords: ['pothole', 'road', 'footpath', 'pavement', 'crack', 'tar', 'street'],
        icon: '🚧',
        color: '#92400E'
      },
      'Street Lighting': {
        keywords: ['light', 'lamp', 'streetlight', 'dark', 'bulb', 'pole'],
        icon: '💡',
        color: '#D97706'
      },
      'Sanitation & Waste': {
        keywords: ['garbage', 'trash', 'waste', 'smell', 'dump', 'litter', 'clean'],
        icon: '🗑️',
        color: '#4A4E69'
      },
      'Parks & Gardens': {
        keywords: ['park', 'tree', 'garden', 'bench', 'grass', 'plant'],
        icon: '🌳',
        color: '#2A9D8F'
      },
      'Public Safety': {
        keywords: ['crime', 'theft', 'unsafe', 'danger', 'fight', 'noise', 'security'],
        icon: '🚨',
        color: '#C1121F'
      },
      'Municipal Administration': {
        keywords: [],
        icon: '🏢',
        color: '#6B6560'
      }
    }

    // Find matching category
    let matchedCategory = 'Municipal Administration'
    let confidence = 0.7

    for (const [category, data] of Object.entries(categories)) {
      const matches = data.keywords.filter(keyword => text.includes(keyword))
      if (matches.length > 0) {
        matchedCategory = category
        confidence = Math.min(0.95, 0.7 + (matches.length * 0.1))
        break
      }
    }

    // Determine severity
    let severity = 'medium'
    const severityKeywords = {
      critical: ['critical', 'emergency', 'dangerous', 'life threatening'],
      high: ['urgent', 'immediate', 'serious', 'severe'],
      low: ['minor', 'small', 'slight', 'low']
    }

    const exclamationCount = (text.match(/!/g) || []).length
    if (exclamationCount >= 3 || severityKeywords.critical.some(kw => text.includes(kw))) {
      severity = 'critical'
    } else if (exclamationCount >= 2 || severityKeywords.high.some(kw => text.includes(kw))) {
      severity = 'high'
    } else if (severityKeywords.low.some(kw => text.includes(kw))) {
      severity = 'low'
    }

    return {
      category: matchedCategory,
      severity,
      confidence: Math.round(confidence * 100),
      icon: categories[matchedCategory].icon,
      color: categories[matchedCategory].color,
      ai_description: null
    }
  }, [])

  // Image Analysis Logic - REAL GROQ API
  const analyzeImage = async (file) => {
    // Guard clause — make sure it's a real File
    if (!file || !(file instanceof Blob)) {
      console.error("analyzeImage: invalid file passed:", file);
      return {
        issueType: 'other',
        confidence: 0,
        severity: 'low',
        suggestedDepartment: 'Other',
        isValidCivicIssue: false,
        reasoning: 'Invalid file provided',
        ai_description: null,
        detectedObjects: []
      };
    }
    
    try {
      console.log("1. analyzeImage called with file:", file.name, file.type, file.size);
      
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = () => reject(new Error("FileReader failed"));
        reader.readAsDataURL(file);  // file is now guaranteed to be a Blob
      });

      console.log("2. base64 length:", base64.length);
      console.log("3. Calling Groq API...");

      // Call real Groq API
      const result = await analyzeIssueImage(base64, file.type);

      console.log("4. Raw Groq result:", result);
      console.log("5. ai_description:", result?.ai_description);
      console.log("6. detectedObjects:", result?.detectedObjects);
      
      return result;
    } catch (error) {
      console.error("Image analysis error:", error);
      return {
        issueType: 'other',
        confidence: 0,
        severity: 'low',
        suggestedDepartment: 'Other',
        isValidCivicIssue: false,
        reasoning: 'Analysis failed',
        ai_description: null,
        detectedObjects: [],
        error: error.message
      };
    }
  };

  // Trigger AI classification
  useEffect(() => {
    const totalWords = formData.title.split(' ').filter(w => w.length > 0).length + 
                      formData.description.split(' ').filter(w => w.length > 0).length
    
    if (totalWords >= 4) {
      setIsClassifying(true)
      const timer = setTimeout(() => {
        const result = classifyIssue(formData.title, formData.description)
        setTextAnalysis(result)
        updateCombinedResult()
        setIsClassifying(false)
      }, 1200)
      
      return () => clearTimeout(timer)
    }
  }, [formData.title, formData.description, classifyIssue])

  // Update combined result when both analyses are available
  const updateCombinedResult = ({ 
    imageAnalysis: imgResult = null, 
    textAnalysis: txtResult = null,
    hasImage = false,
    hasText = false 
  } = {}) => {
    
    console.log("updateCombinedResult called with params:", {
      imgResult,
      txtResult,
      hasImage,
      hasText
    });
    
    // Use passed parameters directly, NOT state variables
    const finalImageAnalysis = imgResult;
    const finalTextAnalysis = txtResult;
    
    // Determine final category
    let finalCategory = null;
    let finalConfidence = 0;
    let finalSeverity = 'medium';
    let finalDepartment = null;

    if (finalImageAnalysis?.issueType) {
      finalCategory = finalImageAnalysis.issueType;
      finalConfidence = Math.round((finalImageAnalysis.confidence || 0) * 100);
      finalSeverity = finalImageAnalysis.severity || 'medium';
      finalDepartment = finalImageAnalysis.suggestedDepartment;
    }

    if (!finalCategory) {
      console.log("No finalCategory - imageAnalysis was:", finalImageAnalysis);
      return;
    }

    // Build the classification object
    const categories = {
      'pothole': { icon: '🕳️', color: '#D4522A' },
      'garbage': { icon: '🗑️', color: '#E9A84C' },
      'streetlight': { icon: '💡', color: '#E9A84C' },
      'water_leak': { icon: '💧', color: '#2A9D8F' },
      'road_damage': { icon: '🛣️', color: '#D4522A' },
      'graffiti': { icon: '🎨', color: '#D4522A' },
      'fallen_tree': { icon: '🌳', color: '#2A9D8F' },
      'sewage': { icon: '🚽', color: '#6B6560' },
      'traffic': { icon: '🚦', color: '#D4522A' },
      'other': { icon: '🏢', color: '#6B6560' }
    };

    const classification = {
      category: finalCategory,
      severity: finalSeverity,
      confidence: finalConfidence,
      icon: categories[finalCategory]?.icon || '🏢',
      color: categories[finalCategory]?.color || '#6B6560',
      ai_description: finalImageAnalysis?.ai_description || null,
      detectedObjects: finalImageAnalysis?.detectedObjects || [],
    };

    console.log("Setting aiClassification:", classification);
    setAiClassification(classification);
    
    // Update form severity with AI-determined severity
    setFormData(prev => ({ ...prev, severity: finalSeverity }));
  };

  // File upload handlers
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
  }, [])

  const handleFiles = async (files) => {
    // Validate files
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    );
    
    if (validFiles.length === 0) {
      console.error("No valid files selected");
      return;
    }

    // Store actual File objects for API analysis
    setImageFiles(validFiles);
    
    // Create preview URLs (synchronous, no Promise needed)
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
    
    // Create the formatted objects for form submission
    const newImages = validFiles.map(file => ({
      id: generateUUID(),
      name: file.name,
      url: URL.createObjectURL(file), // Create fresh URL for form
      file: file, // Keep the actual file for upload
      size: file.size,
      type: file.type,
      uploaded: false // Not yet uploaded to Supabase
    }));
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 4)
    }));
    
    // Analyze the FIRST image immediately
    setIsAnalyzingImage(true);
    try {
      const result = await analyzeImage(validFiles[0]);
      setImageAnalysis(result);          // still update state for other uses
      updateCombinedResult({             // pass fresh result directly ✅
        imageAnalysis: result,
        textAnalysis: textAnalysis,      // current state value (or null)
        hasImage: true,
        hasText: !!textAnalysis
      });
    } catch (error) {
      console.error('Image analysis failed:', error);
      setImageAnalysis({
        issueType: 'other',
        confidence: 0,
        severity: 'low',
        suggestedDepartment: 'Other',
        isValidCivicIssue: false,
        reasoning: 'Analysis failed',
        ai_description: null,
        detectedObjects: []
      });
    } finally {
      setIsAnalyzingImage(false);
    }
  }

  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }))
  }

  // Geolocation handler
  const handleUseMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setMarkerPosition([latitude, longitude])
        reverseGeocode(latitude, longitude)
      },
      (error) => {
        console.error('Location error:', error)
      }
    )
  }

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      )
      const data = await response.json()
      setFormData(prev => ({
        ...prev,
        address: data.display_name || 'Location found'
      }))
    } catch (error) {
      console.error('Geocoding error:', error)
    }
  }

  // Form submission
  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Upload images to Supabase Storage
      const uploadedImages = []
      for (const image of formData.images) {
        if (image.file && !image.uploaded) {
          try {
            // Use user.id or user.email as identifier
            const userId = user?.id || user?.email || 'anonymous'
            const uploadResult = await imageReports.uploadReportImage(image.file, userId)
            uploadedImages.push({
              id: image.id,
              name: image.name,
              url: uploadResult.imageUrl,
              path: uploadResult.imagePath
            })
          } catch (error) {
            console.error('Failed to upload image:', error)
            throw new Error(`Failed to upload image ${image.name}: ${error.message}`)
          }
        }
      }

      // Use AI-determined severity only
      const finalSeverity = formData.severity;

      // Use user's selected category or AI category as fallback
      const finalCategory = formData.category || aiClassification?.category || 'Municipal Administration';

      // Create AI result object for the existing schema
      const aiResult = {
        issueType: finalCategory,
        suggestedDepartment: finalCategory,
        severity: normalizeSeverity(finalSeverity),
        description: formData.description,
        reasoning: `AI classified this as ${finalCategory} with ${finalSeverity} severity`,
        confidence: normalizeConfidence(aiClassification?.confidence || 85),
        isValidCivicIssue: true
      }

      // Use the existing saveReport function
      const reportData = await imageReports.saveReport({
        userId: null, // We don't have UUID, use citizen_email instead
        citizenName: user?.name || null,
        citizenEmail: user?.email || null,
        title: formData.title,
        description: formData.description,
        location: {
          latitude: markerPosition ? markerPosition[0] : mapCenter[0],
          longitude: markerPosition ? markerPosition[1] : mapCenter[1],
          address: formData.address || 'Location detected automatically'
        },
        imageUrl: uploadedImages[0]?.url || null,
        imagePath: uploadedImages[0]?.path || null,
        aiResult: aiResult
      })

      // Generate report ID for display
      const displayId = `CS-2024-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      setReportId(displayId)
      setSubmitSuccess(true)

    } catch (error) {
      console.error('Submission error:', error)
      // You could show an error message to the user here
      alert(`Failed to submit report: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      images: [],
      category: '',
      severity: 'medium',
      location: null,
      address: '',
      landmark: '',
      ward: '',
      pinCode: '',
      termsAccepted: false
    })
    setAiClassification(null)
    setTextAnalysis(null)
    setImageAnalysis(null)
    setMarkerPosition(null)
    setCurrentStep(1)
    setSubmitSuccess(false)
  }

  const getResponseTime = (severity) => {
    const times = {
      critical: '24-48 hours',
      high: '3-5 days',
      medium: '1-2 weeks',
      low: '2-4 weeks'
    }
    return times[severity] || '1-2 weeks'
  }

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-[#C1121F] text-white',
      high: 'bg-[#E9A84C] text-white',
      medium: 'bg-[#D4522A] text-white',
      low: 'bg-[#2A9D8F] text-white'
    }
    return colors[severity] || colors.medium
  }

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <motion.div
            layoutId="activeStep"
            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
              step === currentStep
                ? 'bg-[#D4522A] text-white'
                : step < currentStep
                ? 'bg-[#2A9D8F] text-white'
                : 'bg-[#E8E4DC] text-[#6B6560]'
            }`}
          >
            {step < currentStep ? <Check className="w-5 h-5" /> : step}
          </motion.div>
          {step < 3 && (
            <div className={`w-16 h-0.5 mx-2 ${
              step < currentStep ? 'bg-[#2A9D8F]' : 'bg-[#E8E4DC]'
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  // Preview card component
  const PreviewCard = () => (
    <div className="sticky top-24 bg-white rounded-2xl border border-civic-muted p-6">
      <h3 className="font-semibold text-civic-textPrimary mb-4">{t('issue.issueDetails')}</h3>
      
      <div className="space-y-3">
        <div>
          <div className="text-sm text-civic-textSecondary">{t('issue.title')}</div>
          <div className="font-medium text-civic-textPrimary">
            {formData.title || t('reportForm.issueTitle')}
          </div>
        </div>

        {aiClassification && (
          <>
            <div>
              <div className="text-sm text-civic-textSecondary">{t('dashboard.analytics')}</div>
              <div className="font-medium text-civic-textPrimary">
                {aiClassification.category}
              </div>
            </div>
            <div>
              <div className="text-sm text-civic-textSecondary">{t('issue.severity')}</div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(aiClassification.severity)}`}>
                {aiClassification.severity.toUpperCase()}
              </div>
            </div>
          </>
        )}

        <div>
          <div className="text-sm text-civic-textSecondary">{t('issue.location')}</div>
          <div className="font-medium text-civic-textPrimary">
            {formData.address || t('reportForm.enterAddress')}
          </div>
        </div>

        <div>
          <div className="text-sm text-civic-textSecondary">Report Type</div>
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            isAnonymous ? 'bg-[#E9A84C] text-white' : 'bg-[#2A9D8F] text-white'
          }`}>
            {isAnonymous ? 'Anonymous Report' : 'Citizen Report'}
          </div>
        </div>

        {formData.images.length > 0 && (
          <div>
            <div className="text-sm text-civic-textSecondary">Images</div>
            <div className="font-medium text-civic-textPrimary">
              {formData.images.length} photo{formData.images.length !== 1 ? 's' : ''} attached
            </div>
          </div>
        )}
      </div>

      {aiClassification && (
        <div className="mt-4 pt-4 border-t border-civic-muted">
          <div className="flex items-center gap-2 text-sm text-civic-textSecondary">
            <Clock className="w-4 h-4" />
            <span>Estimated response: {getResponseTime(aiClassification.severity)}</span>
          </div>
        </div>
      )}
    </div>
  )

  // Success screen component
  const SuccessScreen = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="w-20 h-20 bg-[#2A9D8F] rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10 text-white" />
      </div>
      
      <h2 className="serif text-3xl font-bold text-civic-textPrimary mb-4">
        Report Submitted!
      </h2>
      
      <div className="text-civic-textSecondary mb-6">
        Report ID: <span className="font-mono font-medium">{reportId}</span>
      </div>

      <div className="bg-white rounded-2xl border border-civic-muted p-6 mb-8 text-left">
        <h3 className="font-semibold text-civic-textPrimary mb-4">What happens next?</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#D4522A] text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">1</div>
            <div>
              <div className="font-medium text-civic-textPrimary">Review by Department</div>
              <div className="text-sm text-civic-textSecondary">Your report will be reviewed by the relevant department</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#D4522A] text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">2</div>
            <div>
              <div className="font-medium text-civic-textPrimary">Action Taken</div>
              <div className="text-sm text-civic-textSecondary">Appropriate action will be initiated</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#D4522A] text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">3</div>
            <div>
              <div className="font-medium text-civic-textPrimary">Status Update</div>
              <div className="text-sm text-civic-textSecondary">You'll receive updates on the resolution</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate('/my-reports')}
          className="px-6 py-3 bg-[#D4522A] text-white rounded-full font-medium hover:bg-[#B8441F] transition-colors"
        >
          Track this Report
        </button>
        <button
          onClick={resetForm}
          className="px-6 py-3 border border-civic-muted text-civic-textPrimary rounded-full font-medium hover:bg-civic-muted transition-colors"
        >
          Report Another Issue
        </button>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-civic-parchment pt-20">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="serif text-4xl font-bold text-civic-textPrimary mb-2">
            {t('issue.reportIssue')}
          </h1>
          <p className="text-civic-textSecondary">
            {t('home.step1Desc')}
          </p>
        </div>

        {/* Success Screen */}
        {submitSuccess ? (
          <div className="max-w-2xl mx-auto">
            <SuccessScreen />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <StepIndicator />

              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-6"
                  >
                    {/* Issue Title */}
                    <div>
                      <label className="block font-medium text-civic-textPrimary mb-2">
                        {t('issue.whatsTheProblem')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('reportForm.issueTitle')}
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-white border border-civic-muted rounded-xl px-4 py-3 focus:border-[#D4522A] outline-none ring-2 ring-[#FBF0EB] transition-colors"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block font-medium text-civic-textPrimary mb-2">
                        {t('issue.description')}
                      </label>
                      <textarea
                        rows={4}
                        placeholder={t('issue.describeIssue')}
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-white border border-civic-muted rounded-xl px-4 py-3 focus:border-[#D4522A] outline-none ring-2 ring-[#FBF0EB] transition-colors resize-none"
                      />
                    </div>

                    {/* AI Analysis will determine severity automatically */}

                    {/* Image Upload */}
                    <div>
                      <label className="block font-medium text-civic-textPrimary mb-2">
                        {t('issue.addPhotos')}
                      </label>
                      <div
                        className={`border-2 rounded-2xl p-10 text-center transition-colors cursor-pointer ${
                          isDragOver
                            ? 'border-[#D4522A] bg-[#FBF0EB]'
                            : 'border-civic-muted bg-white'
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault()
                          setIsDragOver(true)
                        }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-input').click()}
                      >
                        <CloudUpload className="w-12 h-12 text-civic-textSecondary mx-auto mb-4" />
                        <div className="text-civic-textPrimary font-medium mb-2">
                          Drag & drop photos here
                        </div>
                        <div className="text-civic-textSecondary text-sm">
                          or click to browse
                        </div>
                        <div className="text-civic-textSecondary text-xs mt-1">
                          JPG, PNG up to 10MB
                        </div>
                        <input
                          id="file-input"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileInput}
                          className="hidden"
                        />
                      </div>

                      {/* Image Thumbnails */}
                      {formData.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          {formData.images.map((image) => (
                            <div key={image.id} className="relative group">
                              <img
                                src={image.url}
                                alt={image.name}
                                className="w-full h-24 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => {
                          // Open image in new tab
                          const newWindow = window.open()
                          newWindow.document.write(`<img src="${image.url}" style="max-width:100%;height:auto;" />`)
                          newWindow.document.title = image.name
                        }}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeImage(image.id)
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-[#C1121F] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {formData.images.length > 0 && (
                        <p className="text-xs text-[#6B6560] mt-2">
                          Click on any image to view it in full size
                        </p>
                      )}
                    </div>

                    {/* AI Classification */}
                    {isClassifying && (
                      <div className="bg-white rounded-2xl border border-civic-muted p-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin text-[#D4522A]" />
                            <span className="text-civic-textPrimary">🤖 Analyzing text...</span>
                          </div>
                          {/* Skeleton shimmer bars */}
                          <div className="space-y-2">
                            <div className="h-4 bg-[#E8E4DC] rounded animate-pulse"></div>
                            <div className="h-3 bg-[#E8E4DC] rounded w-3/4 animate-pulse"></div>
                            <div className="h-3 bg-[#E8E4DC] rounded w-1/2 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isAnalyzingImage && (
                      <div className="bg-white rounded-2xl border border-civic-muted p-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin text-[#D4522A]" />
                            <span className="text-civic-textPrimary">📸 Analyzing image...</span>
                          </div>
                          {/* Skeleton shimmer bars */}
                          <div className="space-y-2">
                            <div className="h-4 bg-[#E8E4DC] rounded animate-pulse"></div>
                            <div className="h-3 bg-[#E8E4DC] rounded w-3/4 animate-pulse"></div>
                            <div className="h-3 bg-[#E8E4DC] rounded w-1/2 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Combined Analysis Result */}
                    {(() => {
                      const cardData = aiClassification || imageAnalysis;
                      const visibilityCheck = {
                        aiClassification: !!aiClassification,
                        imageAnalysis: !!imageAnalysis,
                        hasData: !!cardData,
                        isClassifying,
                        isAnalyzingImage,
                        shouldShow: !!cardData && !isClassifying && !isAnalyzingImage,
                        aiClassificationData: aiClassification,
                        imageAnalysisData: imageAnalysis,
                        textAnalysisData: textAnalysis
                      };
                      console.log("CARD VISIBILITY CHECK:", visibilityCheck);
                      console.log("aiClassification value:", aiClassification);
                      console.log("imageAnalysis value:", imageAnalysis);
                      console.log("Final shouldShow:", visibilityCheck.shouldShow);
                      return !!cardData && !isClassifying && !isAnalyzingImage;
                    })() && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#E8F6F4] border border-[#2A9D8F]/20 rounded-2xl p-5"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm font-medium text-[#2A9D8F] uppercase tracking-wider">
                            🤖 AI Analysis Complete
                          </div>
                          {!overrideClassification && (
                            <button
                              onClick={() => setOverrideClassification(true)}
                              className="text-[#2A9D8F] text-sm font-medium hover:underline"
                            >
                              Override ↓
                            </button>
                          )}
                        </div>

                        {/* Text Analysis */}
                        {textAnalysis && (
                          <div className="mb-3">
                            <div className="text-sm text-civic-textSecondary mb-1">📝 Text Analysis:</div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{textAnalysis.icon}</span>
                              <span className="font-medium text-civic-textPrimary">{textAnalysis.category}</span>
                              <span className="text-xs text-civic-textSecondary">({textAnalysis.confidence}%)</span>
                            </div>
                          </div>
                        )}

                        {/* Image Analysis */}
                        {imageAnalysis && (
                          <div className="mb-3">
                            <div className="text-sm text-civic-textSecondary mb-1">📸 Image Analysis:</div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{(aiClassification || imageAnalysis).icon}</span>
                              <span className="font-medium text-civic-textPrimary">{imageAnalysis.issueType}</span>
                              <span className="text-xs text-civic-textSecondary">({Math.round(imageAnalysis.confidence * 100)}%)</span>
                            </div>
                          </div>
                        )}

                        {/* Objects Detected */}
                        {imageAnalysis?.detectedObjects && imageAnalysis.detectedObjects.length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm text-civic-textSecondary mb-1">🏷️ Objects Detected:</div>
                            <div className="flex flex-wrap gap-2">
                              {imageAnalysis.detectedObjects.map((obj, i) => (
                                <span key={i} className="px-2 py-1 bg-[#F8F6F1] text-civic-textSecondary rounded-full text-xs">
                                  {obj}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Divider */}
                        {(textAnalysis && imageAnalysis) && (
                          <div className="h-px bg-[#2A9D8F]/20 my-3"></div>
                        )}

                        {/* Final Classification */}
                        <div className="mb-3">
                          <div className="text-sm text-civic-textSecondary mb-2">Final Classification:</div>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{(aiClassification || imageAnalysis).icon}</span>
                            <span className="font-bold text-civic-textPrimary text-lg">{(aiClassification || imageAnalysis).category}</span>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor((aiClassification || imageAnalysis).severity)}`}>
                              {(aiClassification || imageAnalysis).severity.toUpperCase()}
                            </div>
                          </div>
                          <div className="text-sm text-civic-textSecondary mt-1">
                            Combined confidence: {(aiClassification || imageAnalysis).confidence}%
                          </div>
                          <div className="h-1.5 rounded-full bg-[#E8E4DC] mt-2 overflow-hidden">
                            <div
                              className="bg-[#2A9D8F] h-full transition-all duration-500"
                              style={{ width: `${(aiClassification || imageAnalysis).confidence}%` }}
                            />
                          </div>
                        </div>

                        {(aiClassification || imageAnalysis)?.ai_description && (
                          <div className="mb-3 pt-3 border-t border-[#2A9D8F]/20">
                            <div className="flex items-center gap-1.5 text-sm font-medium text-civic-textSecondary mb-1.5">
                              <span className="text-[#2A9D8F]">🔍</span> AI Observations
                            </div>
                            <div className="text-sm text-civic-textSecondary italic leading-relaxed pl-1">
                              "{(aiClassification || imageAnalysis).ai_description}"
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-civic-textSecondary">
                          AI has automatically routed this to the correct department.
                        </div>
                      </motion.div>
                    )}

                    {/* Single Text Analysis (when no image) */}
                    {textAnalysis && !isAnalyzingImage && !imageAnalysis && !aiClassification && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-civic-muted p-6"
                      >
                        <div className="text-xs font-medium text-[#2A9D8F] uppercase tracking-wider mb-3">
                          🤖 AI Classification Result
                        </div>
                        
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`px-4 py-2 rounded-full text-white font-medium ${getSeverityColor(textAnalysis.severity)}`}>
                            {textAnalysis.severity.toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="bg-[#E8E4DC] rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-[#2A9D8F] h-full transition-all duration-500"
                                style={{ width: `${textAnalysis.confidence}%` }}
                              />
                            </div>
                            <div className="text-xs text-civic-textSecondary mt-1">
                              {textAnalysis.confidence}% confidence
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#F8F6F1] rounded-xl p-4 mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{textAnalysis.icon}</span>
                            <div className="font-medium text-civic-textPrimary">
                              {textAnalysis.category}
                            </div>
                          </div>
                          <div className="text-sm text-civic-textSecondary mt-1">
                            You can override this below if needed
                          </div>
                        </div>

                        {!overrideClassification && (
                          <button
                            onClick={() => setOverrideClassification(true)}
                            className="text-[#D4522A] text-sm font-medium hover:underline"
                          >
                            Override classification
                          </button>
                        )}
                      </motion.div>
                    )}

                    {/* Override Classification */}
                    {overrideClassification && (
                      <div className="space-y-4">
                        <div>
                          <label className="block font-medium text-civic-textPrimary mb-2">
                            Department
                          </label>
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full bg-white border border-civic-muted rounded-xl px-4 py-3 focus:border-[#D4522A] outline-none ring-2 ring-[#FBF0EB]"
                          >
                            <option value="">Select department</option>
                            <option value="Water Supply">Water Supply</option>
                            <option value="Roads & Footpaths">Roads & Footpaths</option>
                            <option value="Street Lighting">Street Lighting</option>
                            <option value="Sanitation & Waste">Sanitation & Waste</option>
                            <option value="Parks & Gardens">Parks & Gardens</option>
                            <option value="Public Safety">Public Safety</option>
                            <option value="Municipal Administration">Municipal Administration</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-medium text-civic-textPrimary mb-2">
                            Severity (Auto-determined by AI)
                          </label>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(formData.severity)}`}>
                            {formData.severity.toUpperCase()} - AI Determined
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => setCurrentStep(2)}
                        disabled={!formData.title || !formData.description}
                        className="px-6 py-3 bg-[#D4522A] text-white rounded-full font-medium hover:bg-[#B8441F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        Next: Add Location
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-6"
                  >
                    {/* Location Button */}
                    <button
                      onClick={handleUseMyLocation}
                      className="px-4 py-2 border-2 border-[#2A9D8F] text-[#2A9D8F] rounded-full font-medium hover:bg-[#E8F6F4] transition-colors flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      Use My Location
                    </button>

                    {/* Map Container */}
                    <div className="bg-white rounded-2xl overflow-hidden border border-civic-muted">
                      <div className="h-96 flex items-center justify-center bg-[#F8F6F1] relative">
                        {/* Simple map placeholder */}
                        <div className="absolute inset-0 opacity-20">
                          <div className="w-full h-full" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231C1917' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                            backgroundSize: '40px 40px'
                          }}></div>
                        </div>
                        <div className="text-center relative z-10">
                          <MapPin className="w-12 h-12 text-civic-textSecondary mx-auto mb-4" />
                          <div className="text-civic-textPrimary font-medium">
                            Click on the map to set issue location
                          </div>
                          <div className="text-civic-textSecondary text-sm">
                            Or use "Use My Location" button above
                          </div>
                          {markerPosition && (
                            <div className="mt-4 text-sm text-[#2A9D8F] font-medium">
                              Location set at {markerPosition[0].toFixed(4)}, {markerPosition[1].toFixed(4)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Address Display */}
                    {formData.address && (
                      <div className="bg-white rounded-xl border border-civic-muted px-4 py-3 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#2A9D8F]" />
                        <div className="flex-1 text-civic-textPrimary">
                          {formData.address}
                        </div>
                      </div>
                    )}

                    {/* Additional Location Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="block font-medium text-civic-textPrimary mb-2">
                          Landmark / Nearby Reference (optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Near Shivaji Park entrance"
                          value={formData.landmark}
                          onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                          className="w-full bg-white border border-civic-muted rounded-xl px-4 py-3 focus:border-[#D4522A] outline-none ring-2 ring-[#FBF0EB]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-civic-textPrimary mb-2">
                            Ward Number (optional)
                          </label>
                          <select
                            value={formData.ward}
                            onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                            className="w-full bg-white border border-civic-muted rounded-xl px-4 py-3 focus:border-[#D4522A] outline-none ring-2 ring-[#FBF0EB]"
                          >
                            <option value="">Select ward</option>
                            {Array.from({ length: 30 }, (_, i) => (
                              <option key={i + 1} value={i + 1}>
                                Ward {i + 1}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-medium text-civic-textPrimary mb-2">
                            Pin Code (optional)
                          </label>
                          <input
                            type="text"
                            placeholder="400001"
                            maxLength={6}
                            value={formData.pinCode}
                            onChange={(e) => setFormData(prev => ({ ...prev, pinCode: e.target.value }))}
                            className="w-full bg-white border border-civic-muted rounded-xl px-4 py-3 focus:border-[#D4522A] outline-none ring-2 ring-[#FBF0EB]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="px-6 py-3 border border-civic-muted text-civic-textPrimary rounded-full font-medium hover:bg-civic-muted transition-colors flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </button>
                      <button
                        onClick={() => setCurrentStep(3)}
                        disabled={!formData.address}
                        className="px-6 py-3 bg-[#D4522A] text-white rounded-full font-medium hover:bg-[#B8441F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        Next: Review
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-6"
                  >
                    {/* Review Card */}
                    <div className="bg-white rounded-2xl border border-civic-muted p-8">
                      <h3 className="font-semibold text-civic-textPrimary mb-6">Review Your Report</h3>
                      
                      {/* Issue Details */}
                      <div className="mb-6">
                        <h4 className="font-medium text-civic-textPrimary mb-3">Issue Details</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="serif text-xl font-bold text-civic-textPrimary">
                              {formData.title}
                            </div>
                            <div className="text-civic-textSecondary mt-1">
                              {formData.description}
                            </div>
                          </div>

                          {formData.images.length > 0 && (
                            <div className="flex gap-2">
                              {formData.images.map((image) => (
                                <img
                                  key={image.id}
                                  src={image.url}
                                  alt={image.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          )}

                          <div className="flex gap-3">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(formData.severity)}`}>
                              {formData.severity.toUpperCase()}
                            </div>
                            <div className="px-3 py-1 rounded-full text-xs font-medium bg-[#F8F6F1] text-civic-textPrimary">
                              {formData.category}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="mb-6">
                        <h4 className="font-medium text-civic-textPrimary mb-3">Location</h4>
                        
                        {/* Mini static map */}
                        {markerPosition && (
                          <div className="h-32 bg-[#F8F6F1] rounded-xl overflow-hidden mb-3 relative border border-civic-muted">
                            <div className="absolute inset-0 opacity-20">
                              <div className="w-full h-full" style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231C1917' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                                backgroundSize: '40px 40px'
                              }}></div>
                            </div>
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                <MapPin className="w-8 h-8 text-[#D4522A] mx-auto mb-1" />
                                <div className="text-xs text-civic-textPrimary font-medium">
                                  {markerPosition[0].toFixed(4)}, {markerPosition[1].toFixed(4)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <div className="text-civic-textPrimary">
                            {formData.address || 'Location not set'}
                          </div>
                          {(formData.ward || formData.pinCode) && (
                            <div className="text-civic-textSecondary text-sm">
                              {formData.ward && `Ward ${formData.ward}`}
                              {formData.ward && formData.pinCode && ' • '}
                              {formData.pinCode}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Anonymous Notice */}
                      {isAnonymous && (
                        <div className="bg-[#FBF0EB] rounded-xl p-4 mb-6">
                          <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-[#E9A84C] mt-0.5" />
                            <div>
                              <div className="font-medium text-civic-textPrimary mb-1">
                                Anonymous Submission
                              </div>
                              <div className="text-sm text-civic-textSecondary">
                                You're submitting anonymously. This report will be saved to your device only and cannot be tracked if you clear your browser data. Consider signing in for better tracking.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Terms Checkbox */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={formData.termsAccepted}
                          onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                          className="mt-1 w-4 h-4 text-[#D4522A] border-civic-muted rounded focus:ring-[#FBF0EB]"
                        />
                        <label htmlFor="terms" className="text-civic-textPrimary text-sm">
                          I confirm this report is genuine and not a false complaint.
                        </label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleSubmit}
                        disabled={!formData.termsAccepted || isSubmitting}
                        className="px-8 py-3 bg-[#D4522A] text-white rounded-full font-medium hover:bg-[#B8441F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('common.loading')}
                          </>
                        ) : (
                          t('reportForm.submitReport')
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Preview Card */}
            <div className="lg:col-span-1">
              <PreviewCard />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportIssue
