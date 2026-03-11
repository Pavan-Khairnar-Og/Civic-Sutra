/**
 * Application constants and configuration
 * Central place for all constant values used throughout the app
 */

// Issue types with labels and icons
export const ISSUE_TYPES = [
  { value: 'pothole', label: 'Pothole', icon: '🚗', department: 'public-works' },
  { value: 'garbage', label: 'Garbage/Waste', icon: '🗑️', department: 'sanitation' },
  { value: 'water-leakage', label: 'Water Leakage', icon: '💧', department: 'water' },
  { value: 'streetlight', label: 'Broken Streetlight', icon: '💡', department: 'electricity' },
  { value: 'traffic-signal', label: 'Traffic Signal', icon: '🚦', department: 'traffic' },
  { value: 'tree', label: 'Tree/Fallen Branch', icon: '🌳', department: 'parks' },
  { value: 'construction', label: 'Construction Issue', icon: '🏗️', department: 'public-works' },
  { value: 'power', label: 'Power/Electrical', icon: '🔌', department: 'electricity' },
  { value: 'other', label: 'Other', icon: '📝', department: 'public-works' }
]

// Status options with colors
export const ISSUE_STATUS = [
  { value: 'pending', label: 'Pending', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  { value: 'in-progress', label: 'In Progress', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  { value: 'resolved', label: 'Resolved', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' }
]

// Priority levels with colors
export const PRIORITY_LEVELS = [
  { value: 'high', label: 'High', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800', description: 'Urgent - Immediate attention required' },
  { value: 'medium', label: 'Medium', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-800', description: 'Needs attention - Should be addressed soon' },
  { value: 'low', label: 'Low', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-800', description: 'Minor issue - Can be addressed in routine maintenance' }
]

// Government departments
export const DEPARTMENTS = [
  { value: 'public-works', label: 'Public Works', description: 'Road maintenance, infrastructure' },
  { value: 'sanitation', label: 'Sanitation', description: 'Waste management, cleaning' },
  { value: 'water', label: 'Water Department', description: 'Water supply, drainage' },
  { value: 'electricity', label: 'Electricity', description: 'Streetlights, power issues' },
  { value: 'traffic', label: 'Traffic Control', description: 'Traffic signals, road safety' },
  { value: 'parks', label: 'Parks & Recreation', description: 'Parks, trees, recreational facilities' }
]

// Navigation routes
export const ROUTES = {
  HOME: '/',
  REPORT_ISSUE: '/report',
  MY_REPORTS: '/my-reports',
  MAP_VIEW: '/map',
  ADMIN_DASHBOARD: '/admin',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PROFILE: '/profile'
}

// API endpoints
export const API_ENDPOINTS = {
  REPORTS: '/api/reports',
  ANALYZE_ISSUE: '/api/ai/analyze',
  UPLOAD_IMAGE: '/api/upload/image',
  TRANSCRIBE_AUDIO: '/api/audio/transcribe',
  USER_PROFILE: '/api/user/profile'
}

// File upload constraints
export const UPLOAD_CONSTRAINTS = {
  IMAGE: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxDimensions: { width: 2048, height: 2048 }
  },
  AUDIO: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/webm'],
    maxDuration: 300 // 5 minutes in seconds
  }
}

// Form validation rules
export const VALIDATION_RULES = {
  TITLE: {
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-.,!?]+$/
  },
  DESCRIPTION: {
    required: true,
    minLength: 10,
    maxLength: 1000
  },
  EMAIL: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  PHONE: {
    pattern: /^[\d\s\-\+\(\)]+$/,
    minLength: 10,
    maxLength: 20
  },
  LOCATION: {
    required: true,
    minLength: 5,
    maxLength: 200
  }
}

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  AUTH_REQUIRED: 'You must be logged in to perform this action.',
  PERMISSION_DENIED: 'You don\'t have permission to perform this action.',
  INVALID_INPUT: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a supported file format.',
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again later.',
  LOCATION_REQUIRED: 'Please select a location on the map.',
  IMAGE_REQUIRED: 'Please upload an image of the issue.',
  DESCRIPTION_REQUIRED: 'Please provide a description of the issue.'
}

// Success messages
export const SUCCESS_MESSAGES = {
  REPORT_SUBMITTED: 'Issue reported successfully! We\'ll review it shortly.',
  REPORT_UPDATED: 'Report updated successfully.',
  REPORT_DELETED: 'Report deleted successfully.',
  LOGIN_SUCCESS: 'Logged in successfully.',
  SIGNUP_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.'
}

// Time formats
export const TIME_FORMATS = {
  DATE_ONLY: 'MMM DD, YYYY',
  DATE_TIME: 'MMM DD, YYYY HH:mm',
  RELATIVE: 'relative', // e.g., "2 hours ago"
  SHORT: 'MM/DD/YYYY',
  LONG: 'dddd, MMMM DD, YYYY'
}

// Map configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: [20.5937, 78.9629], // India center
  DEFAULT_ZOOM: 5,
  MAX_ZOOM: 18,
  MIN_ZOOM: 3,
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}

// AI configuration
export const AI_CONFIG = {
  CONFIDENCE_THRESHOLD: 0.7,
  MAX_DESCRIPTION_LENGTH: 1000,
  SUPPORTED_LANGUAGES: ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa'],
  ANALYSIS_TIMEOUT: 30000, // 30 seconds
  BATCH_SIZE: 10
}

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  DEFAULT_PAGE: 1
}

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'civic_sutra_auth_token',
  USER_PREFERENCES: 'civic_sutra_user_preferences',
  LAST_LOCATION: 'civic_sutra_last_location',
  DRAFT_REPORT: 'civic_sutra_draft_report',
  APP_VERSION: 'civic_sutra_app_version'
}

// App metadata
export const APP_INFO = {
  NAME: 'Civic Sutra',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-powered civic issue reporting platform',
  AUTHOR: 'Civic Sutra Team',
  SUPPORT_EMAIL: 'support@civicsutra.com',
  WEBSITE: 'https://civicsutra.com'
}

// Theme colors
export const COLORS = {
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8'
  },
  SUCCESS: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d'
  },
  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309'
  },
  ERROR: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c'
  }
}

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px'
}

export default {
  ISSUE_TYPES,
  ISSUE_STATUS,
  PRIORITY_LEVELS,
  DEPARTMENTS,
  ROUTES,
  API_ENDPOINTS,
  UPLOAD_CONSTRAINTS,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TIME_FORMATS,
  MAP_CONFIG,
  AI_CONFIG,
  PAGINATION,
  STORAGE_KEYS,
  APP_INFO,
  COLORS,
  BREAKPOINTS
}
