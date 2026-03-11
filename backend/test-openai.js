const OpenAI = require('openai');
require('dotenv').config();

// Simple OpenAI API connectivity test
async function testOpenAIConnection() {
  try {
    console.log('🔍 Testing OpenAI API connectivity...');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Test with a simple text completion (no audio)
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "Hello World"' }],
      max_tokens: 10,
    });

    console.log('✅ OpenAI API connection successful!');
    console.log('📝 Response:', completion.choices[0].message.content);

  } catch (error) {
    console.error('❌ OpenAI API connection failed:', error.message);
    
    if (error.code === 'ECONNRESET') {
      console.log('🔧 Network connection reset detected');
      console.log('💡 Solutions:');
      console.log('   1. Try again in 2-3 minutes');
      console.log('   2. Check if VPN is blocking the connection');
      console.log('   3. Try different network (WiFi/mobile data)');
      console.log('   4. Check Windows Defender firewall');
    } else if (error.status === 401) {
      console.log('🔑 API key issue - check your OpenAI API key');
    } else if (error.status === 429) {
      console.log('⏱️ Rate limit - wait a few minutes');
    }
  }
}

testOpenAIConnection();
