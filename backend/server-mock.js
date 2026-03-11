require('dotenv').config();
const transcribeApp = require('./api/transcribe-mock');

/**
 * Mock server file for Civic Sutra backend
 * Starts the Express server in mock mode for testing without OpenAI
 */

const PORT = process.env.PORT || 3001;

// Start the server
transcribeApp.listen(PORT, () => {
  console.log(`🎤 Civic Sutra Mock Transcription Server running on port ${PORT}`);
  console.log(`📝 API endpoint: http://localhost:${PORT}/api/transcribe`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Running in MOCK MODE - No OpenAI API required`);
  console.log(`\n📋 Mock Transcriptions Available:`);
  console.log(`   • Pothole repair requests`);
  console.log(`   • Streetlight issues`);
  console.log(`   • Garbage collection problems`);
  console.log(`   • Water leakage reports`);
  console.log(`   • Traffic safety concerns`);
  console.log(`\n🔄 To use real OpenAI API:`);
  console.log(`   1. Get an OpenAI API key from https://platform.openai.com/`);
  console.log(`   2. Update .env file with your API key`);
  console.log(`   3. Run: npm run dev (instead of npm run mock)`);
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
