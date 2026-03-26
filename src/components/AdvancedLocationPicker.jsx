import React, { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * Advanced Location Picker Component
 * Uses Leaflet and OpenStreetMap for precise location selection
 * Provides both GPS detection and manual map selection
 */
const AdvancedLocationPicker = ({ onLocationChange, initialLocation }) => {
  const [location, setLocation] = useState(initialLocation || { latitude: null, longitude: null })
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState('')
  const [map, setMap] = useState(null)
  const [marker, setMarker] = useState(null)
  const [address, setAddress] = useState('')
  
  const mapRef = useRef(null)
  const geocoderRef = useRef(null)

  // Fix Leaflet default icon issue
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    })
  }, [])

  /**
   * Handle map resize when container changes
   */
  useEffect(() => {
    if (!map) return

    const handleResize = () => {
      if (map) {
        map.invalidateSize()
      }
    }

    // Add resize observer
    const resizeObserver = new ResizeObserver(handleResize)
    
    if (mapRef.current) {
      resizeObserver.observe(mapRef.current)
    }

    return () => {
      if (mapRef.current) {
        resizeObserver.unobserve(mapRef.current)
      }
      resizeObserver.disconnect()
    }
  }, [map])

  /**
   * Initialize map when component mounts
   */
  useEffect(() => {
    if (!mapRef.current || map) return

    let leafletMap = null

    // Wait a bit for the container to be properly sized
    const initTimer = setTimeout(() => {
      if (!mapRef.current) return

      // Check if container has dimensions
      const container = mapRef.current
      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        console.warn('Map container has no dimensions, retrying...')
        return
      }

      try {
        // Initialize map centered on default location (center of India)
        leafletMap = L.map(mapRef.current, {
          center: [20.5937, 78.9629],
          zoom: 5,
          zoomControl: true
        })

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(leafletMap)

        // Add click handler for manual location selection
        leafletMap.on('click', handleMapClick)

        setMap(leafletMap)
        console.log('🗺️ Leaflet map initialized successfully')
      } catch (error) {
        console.error('Error initializing map:', error)
        setError('Failed to load map. Please refresh the page.')
      }
    }, 100)

    return () => {
      clearTimeout(initTimer)
      if (leafletMap) {
        leafletMap.off('click', handleMapClick)
        leafletMap.remove()
      }
    }
  }, [])

  /**
   * Handle map click for manual location selection
   */
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng
    updateLocation(lat, lng)
    reverseGeocode(lat, lng)
  }

  /**
   * Update location and map marker
   */
  const updateLocation = (latitude, longitude) => {
    const newLocation = { latitude, longitude }
    setLocation(newLocation)
    
    // Only call onLocationChange if it's a function
    if (typeof onLocationChange === 'function') {
      onLocationChange(newLocation)
    }
    
    setError('')

    // Update or create marker
    if (map) {
      if (marker) {
        marker.setLatLng([latitude, longitude])
      } else {
        const newMarker = L.marker([latitude, longitude]).addTo(map)
        setMarker(newMarker)
      }
      
      // Center map on new location
      map.setView([latitude, longitude], 15)
    }
  }

  /**
   * Get current GPS location
   */
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    setIsLocating(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        updateLocation(latitude, longitude)
        reverseGeocode(latitude, longitude)
        setIsLocating(false)
      },
      (error) => {
        setIsLocating(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access denied. Please enable location permissions.')
            break
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.')
            break
          case error.TIMEOUT:
            setError('Location request timed out.')
            break
          default:
            setError('An unknown error occurred while getting location.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  /**
   * Reverse geocoding to get address from coordinates
   */
  const reverseGeocode = async (lat, lon) => {
    try {
      // Using Nominatim OpenStreetMap reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'CivicSutra/1.0'
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data.display_name) {
          setAddress(data.display_name)
        }
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      // Don't show error to user, just log it
    }
  }

  /**
   * Search for location by address
   */
  const searchLocation = async (searchTerm) => {
    if (!searchTerm.trim()) return

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=1`,
        {
          headers: {
            'User-Agent': 'CivicSutra/1.0'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          const { lat, lon, display_name } = data[0]
          updateLocation(parseFloat(lat), parseFloat(lon))
          setAddress(display_name)
        } else {
          setError('Location not found. Please try a different search term.')
        }
      }
    } catch (error) {
      setError('Failed to search location. Please try again.')
    }
  }

  /**
   * Clear location
   */
  const clearLocation = () => {
    setLocation({ latitude: null, longitude: null })
    setAddress('')
    onLocationChange({ latitude: null, longitude: null })
    
    if (marker && map) {
      map.removeLayer(marker)
      setMarker(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Location Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isLocating}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {isLocating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              📍 Getting Location...
            </>
          ) : (
            '📍 Use Current Location'
          )}
        </button>

        {location.latitude && location.longitude && (
          <button
            type="button"
            onClick={clearLocation}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            🗑️ Clear Location
          </button>
        )}
      </div>

      {/* Location Search */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search for a location (address, landmark, etc.)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              searchLocation(e.target.value)
            }
          }}
        />
        <button
          type="button"
          onClick={(e) => {
            const input = e.target.previousElementSibling
            searchLocation(input.value)
          }}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          🔍 Search
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Current Location Display */}
      {location.latitude && location.longitude && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">📍 Selected Location:</p>
              <div className="text-sm text-blue-600 mt-1">
                <div>Latitude: {location.latitude.toFixed(6)}</div>
                <div>Longitude: {location.longitude.toFixed(6)}</div>
              </div>
              {address && (
                <div className="text-sm text-blue-700 mt-2">
                  <strong>Address:</strong> {address}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="bg-gray-100 rounded-lg overflow-hidden relative map-container" style={{ height: '400px', width: '100%' }}>
        <div
          ref={mapRef}
          className="w-full h-full"
          style={{ minHeight: '400px', minWidth: '300px' }}
        />
      </div>

      {/* Usage Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <p className="text-sm text-green-800">
          🗺️ <strong>Advanced Location Features:</strong>
        </p>
        <ul className="text-xs text-green-700 mt-1 space-y-1">
          <li>• 📍 Click "Use Current Location" for GPS detection</li>
          <li>• 🖱️ Click anywhere on the map to select location</li>
          <li>• 🔍 Search for addresses, landmarks, or places</li>
          <li>• 🗺️ Interactive OpenStreetMap with zoom controls</li>
          <li>• 📍 Precise coordinates with 6 decimal accuracy</li>
          <li>• 🏠 Reverse geocoding shows address details</li>
        </ul>
      </div>
    </div>
  )
}

export default AdvancedLocationPicker
