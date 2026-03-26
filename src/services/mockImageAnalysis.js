/**
 * Mock Image Analysis Service
 * 
 * This is a fallback service for when Gemini API quota is exceeded.
 * It provides realistic mock responses for testing purposes.
 */

const mockResponses = [
  {
    issueType: "pothole",
    confidence: 0.85,
    severity: "medium",
    description: "Large pothole detected in road surface",
    suggestedDepartment: "Roads",
    isValidCivicIssue: true,
    reasoning: "Clear depression in asphalt surface typical of pothole damage"
  },
  {
    issueType: "garbage",
    confidence: 0.92,
    severity: "low",
    description: "Accumulated trash and debris on sidewalk",
    suggestedDepartment: "Sanitation",
    isValidCivicIssue: true,
    reasoning: "Visible waste materials that need cleanup"
  },
  {
    issueType: "streetlight",
    confidence: 0.78,
    severity: "high",
    description: "Damaged streetlight pole with exposed wiring",
    suggestedDepartment: "Electricity",
    isValidCivicIssue: true,
    reasoning: "Broken lighting infrastructure poses safety risk"
  },
  {
    issueType: "water_leak",
    confidence: 0.88,
    severity: "critical",
    description: "Water leaking from underground pipe",
    suggestedDepartment: "Water",
    isValidCivicIssue: true,
    reasoning: "Active water leak causing infrastructure damage"
  },
  {
    issueType: "graffiti",
    confidence: 0.65,
    severity: "low",
    description: "Graffiti tags on public wall",
    suggestedDepartment: "Parks",
    isValidCivicIssue: true,
    reasoning: "Vandalism requiring cleanup"
  },
  {
    issueType: "fallen_tree",
    confidence: 0.95,
    severity: "high",
    description: "Tree fallen across roadway",
    suggestedDepartment: "Parks",
    isValidCivicIssue: true,
    reasoning: "Obstruction requiring immediate removal"
  },
  {
    issueType: "sewage",
    confidence: 0.82,
    severity: "critical",
    description: "Sewage backup visible on street",
    suggestedDepartment: "Water",
    isValidCivicIssue: true,
    reasoning: "Public health hazard requiring immediate attention"
  },
  {
    issueType: "other",
    confidence: 0.45,
    severity: "low",
    description: "General maintenance issue detected",
    suggestedDepartment: "Other",
    isValidCivicIssue: false,
    reasoning: "Not clearly a civic issue or requires human review"
  }
];

/**
 * Mock analyze function that simulates Gemini AI responses
 * @param {string} base64ImageData - Base64 image data (ignored in mock)
 * @param {string} mimeType - Image MIME type (ignored in mock)
 * @returns {Promise<Object>} Mock analysis result
 */
export async function analyzeIssueImageMock(base64ImageData, mimeType = "image/jpeg") {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  // Select a random mock response
  const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
  
  // Add some variation to confidence
  const confidenceVariation = (Math.random() - 0.5) * 0.2; // ±0.1 variation
  const adjustedConfidence = Math.max(0.1, Math.min(1.0, randomResponse.confidence + confidenceVariation));

  return {
    ...randomResponse,
    confidence: Math.round(adjustedConfidence * 100) / 100, // Round to 2 decimal places
    timestamp: new Date().toISOString(),
    isMock: true // Flag to indicate this is mock data
  };
}

/**
 * Mock connection test - always succeeds
 * @returns {Promise<boolean>} Always true for mock
 */
export async function testMockConnection() {
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
}

/**
 * Get mock supported issue types
 * @returns {Array<string>} List of supported issue types
 */
export function getMockSupportedIssueTypes() {
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
 * Mock validation - always returns true for valid mock data
 * @param {Object} result - Mock result to validate
 * @returns {boolean} Always true for mock data
 */
export function validateMockResult(result) {
  return result && result.isMock === true;
}

export default {
  analyzeIssueImageMock,
  testMockConnection,
  getMockSupportedIssueTypes,
  validateMockResult
};
