import React, { useState } from 'react'

/**
 * ImageUploader component
 * Allows users to capture or upload images for issue reports
 * Supports camera capture and file upload
 */
const ImageUploader = ({ onImageSelect, currentImage }) => {
  const [preview, setPreview] = useState(currentImage || null)
  const [isLoading, setIsLoading] = useState(false)

  // Handle file selection from input
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      processImage(file)
    }
  }

  // Process the selected image file
  const processImage = (file) => {
    setIsLoading(true)
    
    // Create a preview URL for the image
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
      onImageSelect(file)
      setIsLoading(false)
    }
    reader.onerror = () => {
      console.error('Error reading file')
      setIsLoading(false)
    }
    reader.readAsDataURL(file)
  }

  // Handle camera capture
  const handleCameraCapture = () => {
    // Create a temporary input element for camera capture
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment' // Use rear camera if available
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        processImage(file)
      }
    }
    input.click()
  }

  // Remove current image
  const removeImage = () => {
    setPreview(null)
    onImageSelect(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={handleCameraCapture}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : '📷 Take Photo'}
        </button>
        
        <label className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors cursor-pointer text-center">
          📁 Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isLoading}
          />
        </label>
        
        {preview && (
          <button
            type="button"
            onClick={removeImage}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            🗑️ Remove
          </button>
        )}
      </div>
      
      {preview && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
          />
        </div>
      )}
      
      {!preview && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            No image selected. Take a photo or upload an image to document the issue.
          </p>
        </div>
      )}
    </div>
  )
}

export default ImageUploader
