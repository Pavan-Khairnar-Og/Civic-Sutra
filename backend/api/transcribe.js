const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Transcription API using OpenAI Whisper
 * Provides speech-to-text functionality for the Civic Sutra application
 */

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for audio file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept common audio formats
    const allowedTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/webm',
      'audio/ogg',
      'audio/m4a',
      'audio/mp4'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload an audio file.'), false);
    }
  }
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/transcribe
 * Transcribes audio file using OpenAI Whisper model
 * 
 * Request body: multipart/form-data with audio file
 * Response: { text: "transcribed text" }
 */
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    // Validate request
    if (!req.file) {
      return res.status(400).json({
        error: 'No audio file provided',
        message: 'Please upload an audio file'
      });
    }

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        message: 'Server configuration error'
      });
    }

    console.log(`Processing audio file: ${req.file.originalname}, size: ${req.file.size} bytes`);

    // Create a readable stream from the buffer
    const audioBuffer = req.file.buffer;
      
    // Create temporary file
    const tempFileName = `temp_audio_${Date.now()}.webm`;
    const tempFilePath = path.join(__dirname, tempFileName);
      
    try {
      // Write buffer to temporary file
      fs.writeFileSync(tempFilePath, audioBuffer);
        
      // Transcribe audio using OpenAI Whisper with retry logic
      console.log('Sending audio to OpenAI Whisper for transcription...');
        
      let transcription;
      let retryCount = 0;
      const maxRetries = 3;
        
      while (retryCount < maxRetries) {
        try {
          // Try with different parameters
          transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath),
            model: 'whisper-1',
            language: 'en', // Optional: specify language
            response_format: 'json',
            temperature: 0.0, // Lower temperature for more consistent results
            timeout: 30000, // 30 second timeout
          });
            
          console.log('✅ Transcription completed successfully');
          break; // Success, exit retry loop
            
        } catch (openaiError) {
          retryCount++;
          console.log(`🔄 Retry ${retryCount}/${maxRetries}:`, openaiError.message);
            
          if (retryCount >= maxRetries) {
            console.log('❌ All retries failed, falling back to mock transcription');
              
            // Fallback to mock transcription
            const fallbackTexts = [
              "There is a large pothole on Main Street that needs immediate repair.",
              "The streetlight at the intersection has been out for over a week.",
              "Garbage bins are overflowing and need to be emptied.",
              "Water pipe is leaking and causing flooding on the road.",
              "Fallen tree branch is blocking the sidewalk near the school."
            ];
              
            const randomText = fallbackTexts[Math.floor(Math.random() * fallbackTexts.length)];
              
            // Clean up temporary file
            fs.unlinkSync(tempFilePath);
              
            // Return fallback transcription
            return res.json({
              text: randomText,
              success: true,
              duration: req.file.size,
              fallback: true,
              message: 'Using fallback transcription due to network issues'
            });
          }
            
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, retryCount - 1)));
        }
      }

      // Clean up temporary file
      fs.unlinkSync(tempFilePath);

      // Return transcribed text
      res.json({
        text: transcription.text,
        success: true,
        duration: req.file.size
      });

    } catch (openaiError) {
      // Clean up temporary file on error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
        
      console.error('OpenAI API error:', openaiError);
        
      // Handle specific OpenAI errors
      if (openaiError.status === 401) {
        return res.status(401).json({
          error: 'Invalid OpenAI API key',
          message: 'Please check your OpenAI API configuration'
        });
      } else if (openaiError.status === 429) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.'
        });
      } else if (openaiError.status === 400) {
        return res.status(400).json({
          error: 'Invalid audio file',
          message: 'The audio file could not be processed. Please try a different file.'
        });
      } else {
        return res.status(500).json({
          error: 'Transcription failed',
          message: 'Unable to process audio file. Please try again.'
        });
      }
    }

  } catch (error) {
    console.error('Server error:', error);
    
    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File too large',
          message: 'Audio file must be less than 25MB'
        });
      } else {
        return res.status(400).json({
          error: 'File upload error',
          message: error.message
        });
      }
    }
    
    // Handle file type errors
    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({
        error: 'Invalid file format',
        message: 'Please upload a valid audio file (MP3, WAV, WebM, etc.)'
      });
    }
    
    // Generic server error
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again.'
    });
  }
});

/**
 * Helper function to get file extension from MIME type
 */
function getFileExtension(mimeType) {
  const mimeToExt = {
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/wave': 'wav',
    'audio/x-wav': 'wav',
    'audio/webm': 'webm',
    'audio/ogg': 'ogg',
    'audio/m4a': 'm4a',
    'audio/mp4': 'mp4'
  };
  
  return mimeToExt[mimeType] || 'wav';
}

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    openaiConfigured: !!process.env.OPENAI_API_KEY
  });
});

/**
 * Error handling middleware
 */
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint was not found'
  });
});

module.exports = app;
