# 🔑 Gemini AI Setup Guide

## 📋 Quick Setup Steps

### 1. Get Your Gemini API Key

1. **Go to Google AI Studio**: https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click "Create API Key"**
4. **Copy the API key** (starts with "AIza...")
5. **Add it to your .env file** (see below)

### 2. Add API Key to .env File

Create a file named `.env` in your project root (same level as package.json):

```env
# Gemini AI Configuration
VITE_GEMINI_API_KEY=AIzaSy...your_actual_api_key_here
```

**Important:**
- Replace `AIzaSy...your_actual_api_key_here` with your real API key
- Keep the `VITE_` prefix (required for Vite)
- Don't share this file or commit it to Git

### 3. Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

### 4. Test the Integration

Navigate to: http://localhost:5173/gemini-test

- ✅ Check "Environment Check" section
- ✅ Click "🔌 Test Connection"
- ✅ Try "🖼️ Test Sample Image"

## 🔍 API Key Sources

### Option 1: Google AI Studio (Recommended)
- **URL**: https://makersuite.google.com/app/apikey
- **Cost**: Free tier available
- **Models**: Gemini 2.0 Flash, Gemini Pro
- **Usage**: Up to 60 requests per minute (free tier)

### Option 2: Google Cloud Platform
- **URL**: https://console.cloud.google.com
- **Service**: Vertex AI
- **Cost**: Pay-as-you-go
- **Usage**: Higher limits for production

## ⚠️ Important Notes

### Security
- **Never commit .env files** to Git
- **Never share API keys** publicly
- **Use environment variables** only

### Testing
- **Test connection first** before using with real images
- **Check browser console** for error messages
- **Verify API key format** (should start with "AIza")

### Troubleshooting
- **"API key not configured"** → Check .env file spelling
- **"Connection failed"** → Verify API key is valid
- **"Invalid response"** → Check Gemini API status

## 🎯 Next Steps

Once your API key is working:

1. **Test with sample images** at `/gemini-test`
2. **Upload real civic issue images** to test classification
3. **Integrate into ReportIssue component** for automatic analysis
4. **Monitor usage** in Google AI Studio dashboard

## 📞 Support

If you encounter issues:

1. **Check the test page** at `/gemini-test` for detailed error messages
2. **Verify API key** format and permissions
3. **Check browser console** for additional error details
4. **Ensure Vite dev server** is restarted after adding .env

## 🔗 Useful Links

- **Google AI Studio**: https://makersuite.google.com
- **Gemini API Docs**: https://ai.google.dev/gemini-api/docs
- **API Key Management**: https://makersuite.google.com/app/apikey
- **Usage Dashboard**: https://makersuite.google.com/app/usagedashboard
