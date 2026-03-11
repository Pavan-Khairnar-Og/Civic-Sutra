require('dotenv').config();
const transcribeApp = require('./api/transcribe');

/**
 * Main server file for Civic Sutra backend
 * Starts the Express server and handles routing
 */

const PORT = process.env.PORT || 3001;

// Start the server
transcribeApp.listen(PORT, () => {
  console.log(`🎤 Civic Sutra Transcription Server running on port ${PORT}`);
  console.log(`📝 API endpoint: http://localhost:${PORT}/api/transcribe`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  
  // Check OpenAI configuration
  if (process.env.OPENAI_API_KEY) {
    console.log('✅ OpenAI API key is configured');
  } else {
    console.log('⚠️  OpenAI API key is not configured');
    console.log('   Please set OPENAI_API_KEY in your .env file');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});
