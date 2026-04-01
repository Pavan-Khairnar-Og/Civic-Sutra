// services/imageAnalysis.js
/**
 * Groq AI Image Analysis Service
 * 
 * This service analyzes images to detect civic issues using Groq's Llama 4 Scout model.
 * It classifies issues, determines severity, and suggests appropriate departments.
 * 
 * Features:
 * - Civic issue classification (pothole, garbage, streetlight, etc.)
 * - Confidence scoring and severity assessment
 * - Department suggestion for routing
 * - Structured JSON response format
 * - Error handling and fallback responses
 */

// Get API key from environment variables (browser compatible)
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const CIVIC_ISSUE_PROMPT = `You are a civic issue detection AI 
for Indian cities. Analyze the image and return ONLY a valid 
JSON object. No markdown, no code fences, no explanation.

{
  "issueType": "pothole OR garbage OR streetlight OR water_leak OR road_damage OR graffiti OR fallen_tree OR sewage OR traffic OR other",
  "confidence": <number between 0.0 and 1.0>,
  "severity": "low OR medium OR high OR critical",
  "suggestedDepartment": "Roads OR Sanitation OR Electricity OR Water OR Parks OR Municipal Administration OR Traffic OR Other",
  "isValidCivicIssue": <true or false>,
  "reasoning": "<one sentence: why you classified it>",
  "detectedObjects": ["<object1 you actually see>", "<object2>", "<object3>"],
  "ai_description": "<2-3 sentences about what you ACTUALLY see in THIS image: describe the visible problem, its scale, and risk to citizens. Never use placeholder text.>"
}

Critical rules:
- detectedObjects must list real things visible in the image
- ai_description must be unique to this specific image
- Return ONLY the JSON object, nothing else`;

/**
 * Analyze an image for civic issues using Groq AI
 * @param {string} base64ImageData - Base64 encoded image data (without data: prefix)
 * @param {string} mimeType - Image MIME type (default: "image/jpeg")
 * @returns {Promise<Object>} Analysis result with issue classification
 */
export async function analyzeIssueImage(base64ImageData, mimeType = "image/jpeg") {
  try {
    // Validate API key
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key not configured. Please set VITE_GROQ_API_KEY environment variable.');
    }

    // Validate input data
    if (!base64ImageData) {
      throw new Error('No image data provided for analysis.');
    }

    // Clean base64 data (remove data URL prefix if present)
    const cleanBase64 = base64ImageData.replace(/^data:image\/[a-z]+;base64,/, '');

    console.log('Starting image analysis with Groq AI...');

    // For Groq, we need to convert the image to a data URL format that can be included in the prompt
    const imageDataUrl = `data:${mimeType};base64,${cleanBase64}`;

    const response = await fetch(
      `https://api.groq.com/openai/v1/chat/completions`,
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "system",
              content: CIVIC_ISSUE_PROMPT
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this image for civic issues and provide the JSON response as specified in the system prompt."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageDataUrl
                  }
                }
              ]
            }
          ],
          temperature: 0.1,   // Low temp = more consistent classification
          max_tokens: 500,
          response_format: { type: "json_object" }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Invalid response format from Groq API');
    }

    const rawText = data.choices[0].message.content;
    console.log('Raw Groq response:', rawText);

    // Parse JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(rawText);
    } catch (parseError) {
      // Try to extract JSON from the response if it contains extra text
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON response from Groq API');
      }
    }

    console.log("Parsed ai_description:", analysisResult.ai_description);
    
    // Validate required fields
    const validatedResult = {
      issueType: analysisResult.issueType || 'other',
      confidence: Math.max(0, Math.min(1, analysisResult.confidence || 0)),
      severity: ['low', 'medium', 'high', 'critical'].includes(analysisResult.severity) 
        ? analysisResult.severity 
        : 'low',
      description: analysisResult.ai_description || analysisResult.description || null,
      ai_description: analysisResult.ai_description ?? null,
      detectedObjects: analysisResult.detectedObjects || [],
      suggestedDepartment: ['Roads', 'Sanitation', 'Electricity', 'Water', 'Parks', 'Other']
        .includes(analysisResult.suggestedDepartment) 
        ? analysisResult.suggestedDepartment 
        : 'Other',
      isValidCivicIssue: Boolean(analysisResult.isValidCivicIssue),
      reasoning: analysisResult.reasoning || 'No reasoning provided',
      timestamp: new Date().toISOString()
    };

    console.log('Analysis result:', validatedResult);
    return validatedResult;

  } catch (error) {
    console.error("Image analysis failed:", error);
    
    // Return structured error response
    return {
      issueType: "other",
      confidence: 0,
      severity: "low",
      description: "Analysis failed",
      ai_description: null,
      detectedObjects: [],
      suggestedDepartment: "Other",
      isValidCivicIssue: false,
      reasoning: `Analysis error: ${error.message}`,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Test function to verify Groq API connection
 * @returns {Promise<boolean>} True if API is accessible
 */
export async function testGroqConnection() {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('API key not configured');
    }

    const response = await fetch(
      `https://api.groq.com/openai/v1/chat/completions`,
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "user",
              content: "Respond with 'OK' to test connection"
            }
          ],
          temperature: 0.1,
          max_tokens: 10,
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Groq connection test failed:", error);
    return false;
  }
}

/**
 * Get supported issue types
 * @returns {Array<string>} List of supported civic issue types
 */
export function getSupportedIssueTypes() {
  return [
    'pothole',
    'garbage', 
    'streetlight',
    'water_leak',
    'road_damage',
    'graffiti',
    'fallen_tree',
    'sewage',
    'other'
  ];
}

/**
 * Get supported severity levels
 * @returns {Array<string>} List of supported severity levels
 */
export function getSupportedSeverityLevels() {
  return ['low', 'medium', 'high', 'critical'];
}

/**
 * Get supported departments
 * @returns {Array<string>} List of supported departments
 */
export function getSupportedDepartments() {
  return ['Roads', 'Sanitation', 'Electricity', 'Water', 'Parks', 'Other'];
}

/**
 * Validate analysis result format
 * @param {Object} result - Analysis result to validate
 * @returns {boolean} True if result is valid
 */
export function validateAnalysisResult(result) {
  const requiredFields = ['issueType', 'confidence', 'severity', 'description', 'suggestedDepartment', 'isValidCivicIssue', 'reasoning'];
  
  return requiredFields.every(field => result.hasOwnProperty(field)) &&
         getSupportedIssueTypes().includes(result.issueType) &&
         typeof result.confidence === 'number' && result.confidence >= 0 && result.confidence <= 1 &&
         getSupportedSeverityLevels().includes(result.severity) &&
         getSupportedDepartments().includes(result.suggestedDepartment) &&
         typeof result.isValidCivicIssue === 'boolean';
}

export default {
  analyzeIssueImage,
  testGroqConnection,
  getSupportedIssueTypes,
  getSupportedSeverityLevels,
  getSupportedDepartments,
  validateAnalysisResult
};
