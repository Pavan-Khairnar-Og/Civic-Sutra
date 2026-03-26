// services/imageAnalysis.js
/**
 * Gemini AI Image Analysis Service
 * 
 * This service analyzes images to detect civic issues using Google's Gemini AI.
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
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

const CIVIC_ISSUE_PROMPT = `
You are a civic issue detection AI. Analyze this image and respond ONLY in this JSON format:
{
  "issueType": "pothole | garbage | streetlight | water_leak | road_damage | graffiti | fallen_tree | sewage | other",
  "confidence": 0.0-1.0,
  "severity": "low | medium | high | critical",
  "description": "Brief description of the issue",
  "suggestedDepartment": "Roads | Sanitation | Electricity | Water | Parks | Other",
  "isValidCivicIssue": true/false,
  "reasoning": "Why you classified it this way"
}
If no civic issue is detected, set isValidCivicIssue to false.
`;

/**
 * Analyze an image for civic issues using Gemini AI
 * @param {string} base64ImageData - Base64 encoded image data (without data: prefix)
 * @param {string} mimeType - Image MIME type (default: "image/jpeg")
 * @returns {Promise<Object>} Analysis result with issue classification
 */
export async function analyzeIssueImage(base64ImageData, mimeType = "image/jpeg") {
  try {
    // Validate API key
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY environment variable.');
    }

    // Validate input data
    if (!base64ImageData) {
      throw new Error('No image data provided for analysis.');
    }

    // Clean base64 data (remove data URL prefix if present)
    const cleanBase64 = base64ImageData.replace(/^data:image\/[a-z]+;base64,/, '');

    console.log('Starting image analysis with Gemini AI...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: CIVIC_ISSUE_PROMPT },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: cleanBase64,   // base64 string WITHOUT the data:image/jpeg;base64, prefix
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,   // Low temp = more consistent classification
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    const rawText = data.candidates[0].content.parts[0].text;
    console.log('Raw Gemini response:', rawText);

    // Strip markdown code fences if present and clean whitespace
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    
    // Parse JSON response
    const analysisResult = JSON.parse(cleaned);
    
    // Validate required fields
    const validatedResult = {
      issueType: analysisResult.issueType || 'other',
      confidence: Math.max(0, Math.min(1, analysisResult.confidence || 0)),
      severity: ['low', 'medium', 'high', 'critical'].includes(analysisResult.severity) 
        ? analysisResult.severity 
        : 'low',
      description: analysisResult.description || 'No description provided',
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
      suggestedDepartment: "Other",
      isValidCivicIssue: false,
      reasoning: `Analysis error: ${error.message}`,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Test function to verify Gemini API connection
 * @returns {Promise<boolean>} True if API is accessible
 */
export async function testGeminiConnection() {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('API key not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: "Respond with 'OK' to test connection" }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10,
          },
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Gemini connection test failed:", error);
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
  testGeminiConnection,
  getSupportedIssueTypes,
  getSupportedSeverityLevels,
  getSupportedDepartments,
  validateAnalysisResult
};
