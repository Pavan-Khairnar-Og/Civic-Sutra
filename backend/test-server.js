const http = require('http');
const formidable = require('formidable');

// Simple test server to verify connection with file upload support
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Simple test server running with file upload support'
    }));
    return;
  }

  if (req.url === '/api/transcribe' && req.method === 'POST') {
    // Parse multipart form data
    const form = new formidable.IncomingForm();
    
    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to parse form data' }));
        return;
      }

      console.log('📁 Received file upload:', files.audio ? files.audio.name : 'No file');
      console.log('📊 File size:', files.audio ? files.audio.size : '0 bytes');

      // Simulate processing delay
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          text: "Test transcription: There is a pothole on Main Street that needs repair.",
          success: true,
          fileSize: files.audio ? files.audio.size : 0,
          fileName: files.audio ? files.audio.name : 'unknown'
        }));
      }, 1000);
    });

    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🧪 Simple test server running on http://localhost:${PORT}`);
  console.log(`📋 Test endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   POST http://localhost:${PORT}/api/transcribe`);
  console.log(`\n🎤 This server now handles file uploads properly`);
  console.log(`📁 Supports multipart/form-data audio files`);
});

console.log('Starting test server with file upload support...');
