const http = require('http');

// Simple test server that handles multipart form data without dependencies
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
      message: 'Simple test server running'
    }));
    return;
  }

  if (req.url === '/api/transcribe' && req.method === 'POST') {
    // Read the request data (we'll just simulate file processing)
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      console.log('📁 Received audio upload request');
      console.log('📊 Request size:', body.length, 'bytes');
      
      // Simulate processing delay
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          text: "Test transcription: There is a large pothole on Main Street that needs immediate repair.",
          success: true,
          fileSize: body.length
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
  console.log(`\n🎤 This server handles audio uploads without dependencies`);
});

console.log('Starting simple test server...');
