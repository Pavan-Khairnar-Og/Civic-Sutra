import React, { useState, useRef, useEffect } from 'react'

/**
 * Speech-to-Text Component
 * Real-time speech recognition using browser's built-in Web Speech API
 * Converts user's speech directly to text for problem description
 */
const SpeechToText = ({ onTranscript, currentTranscript }) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState(currentTranscript || '')
  const [error, setError] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState('en-US')
  
  const recognitionRef = useRef(null)

  /**
   * Check browser support and initialize speech recognition
   */
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setIsSupported(false)
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    // Configure recognition settings
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = selectedLanguage
    recognition.maxAlternatives = 1

    /**
     * Handle speech recognition results
     */
    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        
        if (result.isFinal) {
          // Final result - add to permanent transcript
          finalTranscript += result[0].transcript + ' '
        } else {
          // Interim result - show as preview
          interimTranscript += result[0].transcript
        }
      }

      // Update transcript with final results
      if (finalTranscript) {
        const newTranscript = transcript + finalTranscript
        setTranscript(newTranscript.trim())
        onTranscript(newTranscript.trim())
      }
    }

    /**
     * Handle speech recognition errors
     */
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      
      switch (event.error) {
        case 'no-speech':
          setError('No speech detected. Please try speaking clearly.')
          break
        case 'audio-capture':
          setError('Microphone not available. Please check your microphone settings.')
          break
        case 'not-allowed':
          setError('Microphone permission denied. Please allow microphone access.')
          break
        case 'network':
          setError('Network error. Please check your internet connection.')
          break
        default:
          setError('Speech recognition error. Please try again.')
      }
      
      setIsListening(false)
    }

    /**
     * Handle speech recognition end
     */
    recognition.onend = () => {
      console.log('Speech recognition ended')
      setIsListening(false)
    }

    /**
     * Handle speech recognition start
     */
    recognition.onstart = () => {
      console.log('Speech recognition started')
      setError('')
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current.onend = null
        recognitionRef.current.onerror = null
        recognitionRef.current.onresult = null
      }
    }
  }, [transcript, onTranscript, selectedLanguage])

  /**
   * Start speech recognition
   */
  const startListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available')
      return
    }

    try {
      setError('')
      recognitionRef.current.start()
      setIsListening(true)
      
      console.log('🎤 Speech recognition started')
      
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      setError('Failed to start speech recognition. Please try again.')
    }
  }

  /**
   * Stop speech recognition
   */
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      console.log('🛑 Speech recognition stopped')
    }
  }

  /**
   * Clear transcript
   */
  const clearTranscript = () => {
    setTranscript('')
    onTranscript('')
  }

  /**
   * Handle manual transcript changes
   */
  const handleTranscriptChange = (e) => {
    const newText = e.target.value
    setTranscript(newText)
    onTranscript(newText)
  }

  return (
    <div className="space-y-4">
      {/* Language Selection */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <label className="block text-sm font-medium text-blue-800 mb-2">
          🌐 Select Language:
        </label>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          disabled={isListening}
          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
        >
          <option value="en-US">English (US)</option>
          <option value="mr-IN">मराठी (Marathi)</option>
          <option value="hi-IN">हिन्दी (Hindi)</option>
          <option value="gu-IN">ગુજરાતી (Gujarati)</option>
          <option value="ta-IN">தமிழ் (Tamil)</option>
          <option value="te-IN">తెలుగు (Telugu)</option>
          <option value="bn-IN">বাংলা (Bengali)</option>
        </select>
        <p className="text-xs text-blue-600 mt-1">
          💡 Select your preferred language for speech recognition
        </p>
      </div>

      {/* Speech Controls */}
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isListening ? (
            <span className="flex items-center">
              <span className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></span>
              🛑 Stop Speaking
            </span>
          ) : (
            '🎤 Start Speaking'
          )}
        </button>
        
        {transcript && (
          <button
            type="button"
            onClick={clearTranscript}
            disabled={isListening}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            🗑️ Clear
          </button>
        )}
      </div>

      {/* Listening Status */}
      {isListening && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-pulse w-3 h-3 bg-green-600 rounded-full mr-3"></div>
            <span className="text-green-700 font-medium">
              🎤 Listening... Speak clearly about the civic issue
            </span>
          </div>
          <p className="text-sm text-green-600 mt-2">
            Your words will appear in real-time below in {selectedLanguage === 'mr-IN' ? 'Marathi' : selectedLanguage === 'en-US' ? 'English' : 'selected language'}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Transcript Display */}
      <div>
        <label htmlFor="speech-transcript" className="block text-sm font-medium text-gray-700 mb-2">
          🎤 Problem Description (Speak or Type):
        </label>
        <textarea
          id="speech-transcript"
          name="speech-transcript"
          value={transcript}
          onChange={handleTranscriptChange}
          placeholder={`Click 'Start Speaking' and describe your civic issue in ${selectedLanguage === 'mr-IN' ? 'Marathi' : 'English'}, or type here manually...`}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
          rows={4}
          disabled={isListening}
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {transcript.length} characters
          </span>
          {isListening && (
            <span className="text-xs text-green-600 animate-pulse">
              🎤 Listening...
            </span>
          )}
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          🎤 <strong>Speech-to-Text Instructions:</strong>
        </p>
        <ul className="text-xs text-blue-700 mt-1 space-y-1">
          <li>• 🌐 Select your preferred language above</li>
          <li>• 🎤 Click "Start Speaking" to begin</li>
          <li>• 🗣️ Speak clearly and at a moderate pace</li>
          <li>• 📝 Your words will appear in real-time</li>
          <li>• 🛑 Click "Stop Speaking" when done</li>
          <li>• ✏️ You can edit the text manually</li>
          <li>• 🌐 Works best in Chrome or Edge browsers</li>
          <li>• 🎯 Perfect for users who prefer speaking over typing</li>
        </ul>
      </div>

      {/* Browser Support Notice */}
      {!isSupported && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Browser Support:</strong>
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            Speech recognition works best in Chrome, Edge, and Safari browsers. 
            If you're using Firefox, please try a different browser or type your issue manually.
          </p>
        </div>
      )}

      {/* Marathi Language Support Notice */}
      {selectedLanguage === 'mr-IN' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="text-sm text-purple-800">
            🇮🇳 <strong>Marathi Support:</strong>
          </p>
          <p className="text-xs text-purple-700 mt-1">
            Marathi speech recognition is now supported! Speak in Marathi and the text will appear in Devanagari script.
            For best results, speak clearly and use standard Marathi pronunciation.
          </p>
        </div>
      )}
    </div>
  )
}

export default SpeechToText
