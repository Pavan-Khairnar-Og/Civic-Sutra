# 🚀 Groq AI Setup Guide

## 📋 Quick Setup Steps

### 1. Get Your Groq API Key

1. **Go to Groq Console**: https://console.groq.com/keys
2. **Sign up** or **Sign in** with your account
3. **Click "Create Key"**
4. **Copy the API key** (starts with "gsk_")
5. **Add it to your .env file** (see below)

### 2. Add API Key to .env File

Your `.env` file should already have:
```env
# Groq API Configuration (Required for Image Analysis)
# Get your Groq API key from: https://console.groq.com/keys
VITE_GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
```

**Replace the placeholder** `gsk_xxxxxxxxxxxxxxxx` with your actual API key.

### 3. Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

### 4. Test the Integration

Navigate to: http://localhost:5173/gemini-test

- ✅ **Check "Environment Check"** section
- ✅ **Click "🔌 Test Connection"**
- ✅ **Try "🖼️ Test Sample Image"**

## 🔍 API Key Sources

### Groq Console (Recommended)
- **URL**: https://console.groq.com/keys
- **Cost**: Free tier available
- **Models**: Llama 4 Scout, Llama 3.1, Mixtral, etc.
- **Usage**: Generous free tier limits

### Model Information
- **Primary Model**: `meta-llama/llama-4-scout-17b-16e-instruct`
- **Speed**: Very fast inference
- **Quality**: Excellent for image analysis
- **Cost**: Very affordable

## ⚠️ Important Notes

### Security
- **Never commit .env files** to Git
- **Never share API keys** publicly
- **Use environment variables** only

### Testing
- **Test connection first** before using with real images
- **Check browser console** for error messages
- **Verify API key format** (should start with "gsk_")

### Troubleshooting
- **"API key not configured"** → Check .env file spelling
- **"Connection failed"** → Verify API key is valid
- **"Invalid response"** → Check Groq API status
- **"Rate limited"** → Wait a moment and retry

## 🎯 Next Steps

Once your API key is working:

1. **Test with sample images** at `/gemini-test`
2. **Upload real civic issue images** to test classification
3. **Integrate into ReportIssue component** for automatic analysis
4. **Monitor usage** in Groq console

## 📊 Groq vs Gemini Comparison

| Feature | Groq | Gemini |
|---------|------|---------|
| **Speed** | ⚡ Very Fast | 🐢 Slower |
| **Cost** | 💰 Very Affordable | 💸 More Expensive |
| **Free Tier** | 🎁 Generous | ⚠️ Limited |
| **Models** | 🦙 Llama 4 Scout | 🤖 Gemini 2.0 |
| **Image Analysis** | ✅ Excellent | ✅ Good |
| **Rate Limits** | 🚀 High | 📊 Lower |

## 🚀 Advantages of Groq

### Performance
- **Ultra-fast inference** (sub-second responses)
- **High throughput** for multiple requests
- **Consistent performance** under load

### Cost Efficiency
- **Very low cost per token**
- **Generous free tier** for development
- **No hidden fees** or complex pricing

### Model Quality
- **Llama 4 Scout** is excellent for image analysis
- **Structured responses** with JSON format
- **Reliable classification** for civic issues

## 📞 Support and Resources

### Documentation
- **Groq Docs**: https://console.groq.com/docs
- **API Reference**: https://console.groq.com/docs/api
- **Rate Limits**: https://console.groq.com/docs/rate-limits

### Community
- **Discord**: https://discord.gg/groq
- **GitHub**: https://github.com/groq
- **Examples**: https://github.com/groq/groq-examples

### Monitoring
- **Usage Dashboard**: https://console.groq.com/usage
- **API Keys**: https://console.groq.com/keys
- **Rate Limits**: https://console.groq.com/rate-limits

## 🔧 Technical Details

### API Endpoint
```
https://api.groq.com/openai/v1/chat/completions
```

### Model Used
```
meta-llama/llama-4-scout-17b-16e-instruct
```

### Request Format
```javascript
{
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  messages: [
    {
      role: "system",
      content: "Civic issue detection prompt..."
    },
    {
      role: "user", 
      content: [
        { type: "text", text: "Analyze this image..." },
        { type: "image_url", image_url: { url: "data:image/jpeg;base64,..." } }
      ]
    }
  ],
  temperature: 0.1,
  max_tokens: 500,
  response_format: { type: "json_object" }
}
```

## 🎉 Ready to Use!

Once you have your Groq API key configured:

1. **Replace the placeholder** in your .env file
2. **Restart your dev server**
3. **Test at `/gemini-test`**
4. **Enjoy ultra-fast AI analysis!**

**Groq provides much better performance and cost efficiency compared to Gemini for this use case!** 🚀✨
