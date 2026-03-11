import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

/**
 * MapEvents component
 * Handles map click events to capture location
 */
const MapEvents = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng
      onLocationSelect({ latitude: lat, longitude: lng })
    },
  })
  return null
}

/**
 * Custom marker component with status-based colors
 */
const StatusMarker = ({ issue }) => {
  // Create custom icon based on status
  const getCustomIcon = (status) => {
    let iconColor = '#666666' // default gray
    
    switch (status?.toLowerCase()) {
      case 'pending':
        iconColor = '#F59E0B' // yellow
        break
      case 'in_progress':
        iconColor = '#3B82F6' // blue
        break
      case 'resolved':
        iconColor = '#10B981' // green
        break
      default:
        iconColor = '#EF4444' // red
    }

    return L.divIcon({
      html: `
        <div style="
          background-color: ${iconColor};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">
          ${status?.toLowerCase() === 'pending' ? '⏳' : 
            status?.toLowerCase() === 'in_progress' ? '🔧' : 
            status?.toLowerCase() === 'resolved' ? '✅' : '📋'}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    })
  }

  return (
    <Marker 
      position={[issue.latitude, issue.longitude]}
      icon={getCustomIcon(issue.status)}
    >
      <Popup>
        <div className="max-w-xs">
          {/* Issue Image */}
          {issue.image_url && (
            <div className="mb-3">
              <img
                src={issue.image_url}
                alt="Issue image"
                className="w-full h-32 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available'
                }}
              />
            </div>
          )}
          
          {/* Issue Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">
                Civic Issue Report
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                issue.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                issue.status?.toLowerCase() === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                issue.status?.toLowerCase() === 'resolved' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {issue.status || 'pending'}
              </span>
            </div>
            
            {/* Description */}
            {issue.description && (
              <div>
                <p className="text-sm text-gray-700">
                  {issue.description.length > 150 
                    ? `${issue.description.substring(0, 150)}...` 
                    : issue.description}
                </p>
              </div>
            )}
            
            {/* Location */}
            <div className="text-xs text-gray-500">
              <strong>Location:</strong><br />
              {issue.latitude?.toFixed(6)}, {issue.longitude?.toFixed(6)}
            </div>
            
            {/* Time */}
            {issue.created_at && (
              <div className="text-xs text-gray-500">
                <strong>Reported:</strong><br />
                {new Date(issue.created_at).toLocaleString()}
              </div>
            )}
            
            {/* Report ID */}
            <div className="text-xs text-gray-400 pt-2 border-t">
              ID: {issue.id?.substring(0, 8)}...
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

/**
 * IssueMap component
 * Interactive map for viewing issue locations with status-based markers
 * Uses Leaflet and OpenStreetMap
 */
const IssueMap = ({ 
  reports = [], 
  height = '400px',
  centerOnUser = true,
  showControls = true 
}) => {
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]) // Default to India center
  const [mapZoom, setMapZoom] = useState(5)
  const [userLocation, setUserLocation] = useState(null)

  // Get user's current location on component mount
  useEffect(() => {
    if (centerOnUser && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const location = { latitude, longitude }
          setUserLocation(location)
          setMapCenter([latitude, longitude])
          setMapZoom(13)
        },
        (error) => {
          console.error('Error getting location:', error)
          // Keep default center if location access is denied
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    }
  }, [centerOnUser])

  // Center map on user location
  const centerOnUserLocation = () => {
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude])
      setMapZoom(15)
    } else {
      // Try to get location again
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            const location = { latitude, longitude }
            setUserLocation(location)
            setMapCenter([latitude, longitude])
            setMapZoom(15)
          },
          (error) => {
            alert('Unable to get your current location. Please enable location services.')
          }
        )
      }
    }
  }

  // Filter reports with valid coordinates
  const validReports = reports.filter(report => 
    report && 
    report.latitude && 
    report.longitude &&
    !isNaN(report.latitude) && 
    !isNaN(report.longitude)
  )

  // Get statistics for display
  const stats = {
    total: validReports.length,
    pending: validReports.filter(r => r.status === 'pending').length,
    inProgress: validReports.filter(r => r.status === 'in_progress').length,
    resolved: validReports.filter(r => r.status === 'resolved').length
  }

  return (
    <div className="space-y-4">
      {/* Map Controls and Statistics */}
      {showControls && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          {/* Statistics */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Pending ({stats.pending})</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>In Progress ({stats.inProgress})</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Resolved ({stats.resolved})</span>
            </div>
            <div className="text-sm text-gray-500">
              Total: {stats.total}
            </div>
          </div>
          
          {/* Location Controls */}
          <div className="flex space-x-2">
            <button
              onClick={centerOnUserLocation}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              📍 My Location
            </button>
            
            {/* Fit all markers */}
            {validReports.length > 0 && (
              <button
                onClick={() => {
                  // Calculate bounds to fit all markers
                  const bounds = validReports.reduce((acc, report) => {
                    acc.extend([report.latitude, report.longitude])
                    return acc
                  }, L.latLngBounds())
                  
                  // This would need to be implemented with map reference
                  // For now, just zoom out to show more area
                  setMapZoom(10)
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                🗺️ Show All
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Map Container */}
      <div 
        className="rounded-lg overflow-hidden border border-gray-300 shadow-lg"
        style={{ height }}
      >
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* User Location Marker */}
          {userLocation && (
            <Marker position={[userLocation.latitude, userLocation.longitude]}>
              <Popup>
                <div className="text-sm">
                  <strong>Your Location</strong><br />
                  Lat: {userLocation.latitude.toFixed(6)}<br />
                  Lng: {userLocation.longitude.toFixed(6)}
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Issue Markers */}
          {validReports.map((report) => (
            <StatusMarker key={report.id} issue={report} />
          ))}
        </MapContainer>
      </div>
      
      {/* Map Instructions */}
      <div className="text-sm text-gray-500 space-y-1">
        <p>�️ Click on markers to view issue details</p>
        <p>📍 Use "My Location" to center map on your current position</p>
        <p>🎯 Marker colors indicate issue status: Yellow (Pending), Blue (In Progress), Green (Resolved)</p>
      </div>
    </div>
  )
}

export default IssueMap
