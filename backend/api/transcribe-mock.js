const express = require('express');
const multer = require('multer');
const cors = require('cors');

/**
 * Mock Transcription API for testing without OpenAI
 * Simulates transcription responses for development
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

/**
 * Mock transcription responses for testing
 */
const mockTranscriptions = [
  "There is a large pothole on Main Street that needs immediate repair.",
  "The streetlight at the intersection has been out for over a week.",
  "Garbage bins are overflowing and need to be emptied.",
  "Water pipe is leaking and causing flooding on the road.",
  "Fallen tree branch is blocking the sidewalk near the school.",
  "Traffic lights are not working properly at the busy intersection.",
  "The road surface is damaged and creating safety hazards for vehicles.",
  "Street signs are missing or not clearly visible.",
  "Public park needs maintenance and cleaning.",
  "Drainage system is blocked causing water accumulation."
];

/**
 * POST /api/transcribe
 * Mock transcription endpoint for testing
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

    console.log(`Processing audio file: ${req.file.originalname}, size: ${req.file.size} bytes`);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate random mock transcription
    const randomIndex = Math.floor(Math.random() * mockTranscriptions.length);
    const mockText = mockTranscriptions[randomIndex];

    console.log('Mock transcription completed successfully');

    // Return mock transcribed text
    res.json({
      text: mockText,
      success: true,
      duration: req.file.size,
      mock: true
    });

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
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    openaiConfigured: false,
    mockMode: true,
    message: 'Running in mock mode for testing'
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
