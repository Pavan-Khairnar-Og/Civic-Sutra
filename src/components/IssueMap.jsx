import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Import heatmap plugin
import 'leaflet.heat'

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
const StatusMarker = ({ issue, onClick, getMarkerColor }) => {
  // Create custom icon based on status
  const getCustomIcon = (status) => {
    const iconColor = getMarkerColor(status)
    
    return L.divIcon({
      html: `
        <div style="
          background-color: ${iconColor};
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      className: 'custom-marker',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -8]
    })
  }

  const icon = getCustomIcon(issue.status)

  return (
    <Marker
      position={[issue.latitude, issue.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => onClick(issue)
      }}
    >
      <Popup>
        <div className="p-2 min-w-[200px]">
          {/* Issue Image */}
          {issue.imageUrl && (
            <img 
              src={issue.imageUrl} 
              alt={issue.title || 'Issue image'}
              className="w-full h-32 object-cover rounded mb-2"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          )}
          
          {/* Issue Title */}
          <h3 className="font-semibold text-sm mb-1">
            {issue.title || 'Untitled Issue'}
          </h3>
          
          {/* Issue Description */}
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {issue.description || 'No description available'}
          </p>
          
          {/* Status Badge */}
          <div className="flex items-center justify-between mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              issue.status === 'pending' ? 'bg-red-100 text-red-800' :
              issue.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
              issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {issue.status || 'pending'}
            </span>
            {issue.issueType && (
              <span className="text-xs text-gray-500">
                {issue.issueType}
              </span>
            )}
          </div>
          
          {/* Location */}
          <div className="text-xs text-gray-500 mb-2">
            📍 {issue.latitude?.toFixed(6)}, {issue.longitude?.toFixed(6)}
          </div>
          
          {/* Date */}
          <div className="text-xs text-gray-400">
            {new Date(issue.created_at).toLocaleDateString()}
          </div>
          
          {/* Click for details */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClick(issue)
            }}
            className="mt-2 w-full px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
          >
            View Details
          </button>
        </div>
      </Popup>
    </Marker>
  )
}

/**
 * Heatmap Layer Component
 */
const HeatmapLayer = ({ reports }) => {
  const map = useMap()
  const heatmapLayerRef = useRef(null)

  useEffect(() => {
    if (!map || !reports.length) return

    // Clear existing heatmap
    if (heatmapLayerRef.current) {
      map.removeLayer(heatmapLayerRef.current)
    }

    // Prepare heatmap data
    const heatData = reports
      .filter(report => report.latitude && report.longitude)
      .map(report => [report.latitude, report.longitude, 0.8]) // intensity value

    if (heatData.length > 0) {
      // Create heatmap layer
      heatmapLayerRef.current = L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.0: 'blue',
          0.5: 'yellow',
          0.8: 'orange',
          1.0: 'red'
        }
      }).addTo(map)
    }

    // Cleanup
    return () => {
      if (heatmapLayerRef.current) {
        map.removeLayer(heatmapLayerRef.current)
      }
    }
  }, [map, reports])

  return null
}

/**
 * Enhanced IssueMap component with advanced visualization
 * Features color-coded markers, heatmap layer, and interactive popups
 */
const IssueMap = ({ 
  reports, 
  center = [20.5937, 78.9629], 
  zoom = 5, 
  userLocation, 
  showHeatmap = false,
  onReportSelect,
  getMarkerColor,
  height = '100%'
}) => {
  const [mapCenter, setMapCenter] = useState(center)
  const [mapZoom, setMapZoom] = useState(zoom)

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude])
      setMapZoom(13)
    }
  }, [userLocation])

  // Filter reports with valid coordinates
  const validReports = reports.filter(report => 
    report.latitude && 
    report.longitude && 
    !isNaN(report.latitude) && 
    !isNaN(report.longitude)
  )

  return (
    <div style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        {/* OpenStreetMap Tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Heatmap Layer */}
        {showHeatmap && validReports.length > 0 && (
          <HeatmapLayer reports={validReports} />
        )}
        
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={L.divIcon({
              html: `
                <div style="
                  background-color: #3B82F6;
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                  animation: pulse 2s infinite;
                "></div>
              `,
              className: 'user-location-marker',
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            })}
          >
            <Popup>
              <div className="text-center">
                <div className="font-semibold text-sm">Your Location</div>
                <div className="text-xs text-gray-600">
                  {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Issue Markers */}
        {!showHeatmap && validReports.map((report) => (
          <StatusMarker
            key={report.id}
            issue={report}
            onClick={onReportSelect}
            getMarkerColor={getMarkerColor}
          />
        ))}
        
        {/* Map Events */}
        <MapEvents onLocationSelect={() => {}} />
      </MapContainer>
      
      {/* Custom Styles */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .leaflet-popup-content {
          margin: 0 !important;
          border-radius: 8px;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
      `}</style>
    </div>
  )
}

export default IssueMap
