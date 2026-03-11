# Civic Sutra Backend - Speech to Text Transcription

This backend service provides AI-powered speech-to-text transcription using OpenAI's Whisper model for the Civic Sutra application.

## Features

- 🎤 **Real-time Audio Transcription** - Converts voice recordings to text using OpenAI Whisper
- 📁 **File Upload Support** - Handles multiple audio formats (MP3, WAV, WebM, etc.)
- 🛡️ **Error Handling** - Comprehensive error handling for various scenarios
- 🚀 **Fast Processing** - Optimized for quick transcription turnaround
- 🔒 **Secure API** - Proper validation and security measures

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables:**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your OpenAI API key
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

3. **Start the Server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Or production mode
   npm start
   ```

The server will start on `http://localhost:3001`

### API Endpoints

#### POST /api/transcribe

Transcribes audio files using OpenAI Whisper.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: audio file (field name: "audio")

**Response:**
```json
{
  "text": "There is a pothole near the main road",
  "success": true,
  "duration": 1024000
}
```

**Error Response:**
```json
{
  "error": "Invalid file type",
  "message": "Please upload a valid audio file (MP3, WAV, WebM, etc.)"
}
```

#### GET /api/health

Health check endpoint to verify server status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-03-11T15:30:00.000Z",
  "openaiConfigured": true
}
```

## Supported Audio Formats

- MP3 (audio/mpeg, audio/mp3)
- WAV (audio/wav, audio/wave, audio/x-wav)
- WebM (audio/webm)
- OGG (audio/ogg)
- M4A (audio/m4a)
- MP4 (audio/mp4)

## File Size Limit

- Maximum file size: 25MB
- Recommended recording length: Under 25 seconds for best results

## Error Handling

The API handles various error scenarios:

- **File Size Errors:** Returns clear message for files exceeding 25MB
- **Format Errors:** Validates audio file formats
- **API Key Errors:** Handles missing or invalid OpenAI API keys
- **Rate Limiting:** Manages OpenAI API rate limits
- **Network Errors:** Graceful handling of connectivity issues

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `PORT` | Server port (default: 3001) | No |
| `CORS_ORIGIN` | Allowed CORS origin | No |

## Security Features

- **File Type Validation:** Only accepts audio files
- **Size Limitation:** Prevents large file uploads
- **CORS Protection:** Configurable CORS settings
- **Error Sanitization:** Safe error messages

## Development

### Project Structure

```
backend/
├── api/
│   └── transcribe.js    # Main transcription API
├── server.js            # Express server setup
├── package.json         # Dependencies and scripts
├── .env.example         # Environment variables template
└── README.md           # This file
```

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Ensure you've set `OPENAI_API_KEY` in your `.env` file

2. **"Unable to connect to transcription service"**
   - Verify the backend server is running on port 3001
   - Check if the frontend is pointing to the correct backend URL

3. **"Microphone access denied"**
   - This is a browser permission issue
   - Users need to allow microphone access in their browser

4. **"File too large"**
   - Keep recordings under 25 seconds
   - The API has a 25MB file size limit

### Testing the API

You can test the API using curl:

```bash
curl -X POST \
  http://localhost:3001/api/transcribe \
  -H 'Content-Type: multipart/form-data' \
  -F 'audio=@test-audio.mp3'
```

## Integration with Frontend

The frontend (`VoiceRecorder` component) automatically:

1. Records audio in WebM format
2. Sends it to this backend API
3. Receives transcribed text
4. Updates the form field with the transcription

## Production Deployment

For production deployment:

1. Set proper environment variables
2. Use a process manager like PM2
3. Configure reverse proxy (nginx/Apache)
4. Enable HTTPS
5. Set up monitoring and logging

## License

MIT License - see LICENSE file for details
