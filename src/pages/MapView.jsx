import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../services/supabase'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Search, X, ChevronLeft, ChevronRight, MapPin, ZoomIn, ZoomOut, Maximize2, Target, Filter, Calendar } from 'lucide-react'
import L from 'leaflet'
import toast from 'react-hot-toast'

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'

/**
 * Map View Page - Complete interactive map with filters and heatmaps
 * Displays civic issue reports on an interactive map of Mumbai
 */

// Sample Mumbai data if no real data exists
const sampleReports = [
  {
    id: 'sample-1',
    title: 'Water leakage on main pipeline',
    description: 'Major water leakage causing road damage',
    ai_issue_type: 'Water Supply',
    ai_severity: 'high',
    status: 'pending',
    address: 'Linking Road, Bandra West, Mumbai',
    latitude: 19.0596,
    longitude: 72.8297,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    citizen_email: 'sample@example.com',
    is_anonymous: false,
    upvotes: 12
  },
  {
    id: 'sample-2',
    title: 'Pothole damage on SV Road',
    description: 'Large potholes causing traffic issues',
    ai_issue_type: 'Roads & Footpaths',
    ai_severity: 'critical',
    status: 'in_progress',
    address: 'SV Road, Andheri West, Mumbai',
    latitude: 19.1193,
    longitude: 72.8465,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    citizen_email: 'sample2@example.com',
    is_anonymous: false,
    upvotes: 8
  },
  {
    id: 'sample-3',
    title: 'Street light not working',
    description: 'Dark street causing safety concerns',
    ai_issue_type: 'Street Lighting',
    ai_severity: 'medium',
    status: 'resolved',
    address: 'LBS Marg, Ghatkopar, Mumbai',
    latitude: 19.0835,
    longitude: 72.9048,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    citizen_email: 'sample3@example.com',
    is_anonymous: false,
    upvotes: 5
  },
  {
    id: 'sample-4',
    title: 'Garbage accumulation',
    description: 'Uncollected garbage for over a week',
    ai_issue_type: 'Sanitation & Waste',
    ai_severity: 'high',
    status: 'pending',
    address: 'Pedder Road, Marine Drive, Mumbai',
    latitude: 18.9594,
    longitude: 72.8200,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    citizen_email: 'sample4@example.com',
    is_anonymous: false,
    upvotes: 15
  },
  {
    id: 'sample-5',
    title: 'Park maintenance needed',
    description: 'Overgrown grass and broken benches',
    ai_issue_type: 'Parks & Gardens',
    ai_severity: 'low',
    status: 'pending',
    address: 'Juhu Garden, Juhu, Mumbai',
    latitude: 19.1076,
    longitude: 72.8267,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    citizen_email: 'sample5@example.com',
    is_anonymous: false,
    upvotes: 3
  },
  {
    id: 'sample-6',
    title: 'Traffic signal malfunction',
    description: 'Signal not working properly',
    ai_issue_type: 'Public Safety',
    ai_severity: 'critical',
    status: 'in_progress',
    address: 'Worli Sea Face, Worli, Mumbai',
    latitude: 19.0170,
    longitude: 72.8196,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    citizen_email: 'sample6@example.com',
    is_anonymous: false,
    upvotes: 20
  },
  {
    id: 'sample-7',
    title: 'Drainage blockage',
    description: 'Blocked drainage causing water logging',
    ai_issue_type: 'Municipal Administration',
    ai_severity: 'high',
    status: 'pending',
    address: 'Tilak Road, Dadar, Mumbai',
    latitude: 19.0196,
    longitude: 72.8445,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    citizen_email: 'sample7@example.com',
    is_anonymous: false,
    upvotes: 10
  },
  {
    id: 'sample-8',
    title: 'Broken water pipe',
    description: 'Water pipe burst on main road',
    ai_issue_type: 'Water Supply',
    ai_severity: 'critical',
    status: 'under_review',
    address: 'CST Road, Sion, Mumbai',
    latitude: 19.0458,
    longitude: 72.8681,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    citizen_email: 'sample8@example.com',
    is_anonymous: false,
    upvotes: 18
  },
  {
    id: 'sample-9',
    title: 'Footpath repair needed',
    description: 'Damaged footpath causing accidents',
    ai_issue_type: 'Roads & Footpaths',
    ai_severity: 'medium',
    status: 'resolved',
    address: 'Carter Road, Bandra, Mumbai',
    latitude: 19.0594,
    longitude: 72.8281,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    citizen_email: 'sample9@example.com',
    is_anonymous: false,
    upvotes: 7
  },
  {
    id: 'sample-10',
    title: 'Street light pole damaged',
    description: 'Pole leaning dangerously',
    ai_issue_type: 'Street Lighting',
    ai_severity: 'high',
    status: 'pending',
    address: 'Hill Road, Bandra, Mumbai',
    latitude: 19.0600,
    longitude: 72.8250,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    citizen_email: 'sample10@example.com',
    is_anonymous: false,
    upvotes: 11
  },
  {
    id: 'sample-11',
    title: 'Illegal dumping',
    description: 'Construction waste being dumped',
    ai_issue_type: 'Sanitation & Waste',
    ai_severity: 'medium',
    status: 'in_progress',
    address: 'Mahalaxmi, Mumbai',
    latitude: 19.0114,
    longitude: 72.8342,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    citizen_email: 'sample11@example.com',
    is_anonymous: false,
    upvotes: 9
  },
  {
    id: 'sample-12',
    title: 'Tree trimming needed',
    description: 'Overgrown branches blocking road',
    ai_issue_type: 'Parks & Gardens',
    ai_severity: 'low',
    status: 'pending',
    address: 'Napean Sea Road, Mumbai',
    latitude: 19.0486,
    longitude: 72.8174,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    citizen_email: 'sample12@example.com',
    is_anonymous: false,
    upvotes: 4
  },
  {
    id: 'sample-13',
    title: 'Fire safety equipment missing',
    description: 'No fire extinguishers in building',
    ai_issue_type: 'Public Safety',
    ai_severity: 'critical',
    status: 'under_review',
    address: 'Bandra-Worli Sea Link, Mumbai',
    latitude: 19.0300,
    longitude: 72.8200,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    citizen_email: 'sample13@example.com',
    is_anonymous: false,
    upvotes: 22
  },
  {
    id: 'sample-14',
    title: 'Road marking faded',
    description: 'Lane markings not visible',
    ai_issue_type: 'Roads & Footpaths',
    ai_severity: 'medium',
    status: 'resolved',
    address: 'Western Express Highway, Mumbai',
    latitude: 19.1020,
    longitude: 72.8750,
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    citizen_email: 'sample14@example.com',
    is_anonymous: false,
    upvotes: 6
  },
  {
    id: 'sample-15',
    title: 'Water contamination',
    description: 'Dirty water supply in area',
    ai_issue_type: 'Water Supply',
    ai_severity: 'critical',
    status: 'in_progress',
    address: 'Marine Lines, Mumbai',
    latitude: 18.9450,
    longitude: 72.8250,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    citizen_email: 'sample15@example.com',
    is_anonymous: false,
    upvotes: 25
  }
]

// Department categories with colors
const categories = [
  { id: 'water_supply', name: 'Water Supply', icon: '💧', color: '#0077B6' },
  { id: 'roads_footpaths', name: 'Roads & Footpaths', icon: '🚧', color: '#6B4226' },
  { id: 'street_lighting', name: 'Street Lighting', icon: '💡', color: '#F4A261' },
  { id: 'sanitation_waste', name: 'Sanitation & Waste', icon: '🗑️', color: '#4A4E69' },
  { id: 'parks_gardens', name: 'Parks & Gardens', icon: '🌳', color: '#2A9D8F' },
  { id: 'public_safety', name: 'Public Safety', icon: '🚨', color: '#C1121F' },
  { id: 'municipal_administration', name: 'Municipal Administration', icon: '🏢', color: '#6B6560' }
]

const severities = [
  { id: 'critical', name: 'Critical', color: '#DC2626' },
  { id: 'high', name: 'High', color: '#EA580C' },
  { id: 'medium', name: 'Medium', color: '#D97706' },
  { id: 'low', name: 'Low', color: '#059669' }
]

// Helper function to translate category names
const getCategoryTranslation = (categoryId, t) => {
  const categoryKey = categoryId.replace(/[^a-z0-9]/g, '_').toLowerCase();
  return t(`category.${categoryKey}`);
};

// Helper function to translate severity names
const getSeverityTranslation = (severityId, t) => {
  return t(`reportForm.${severityId}`);
};

// Helper function to map database category names to translation keys
const mapCategoryToTranslationKey = (categoryName) => {
  const categoryMapping = {
    'Water Supply': 'water_supply',
    'Roads & Footpaths': 'roads_footpaths', 
    'Street Lighting': 'street_lighting',
    'Sanitation & Waste': 'sanitation_waste',
    'Parks & Gardens': 'parks_gardens',
    'Public Safety': 'public_safety',
    'Municipal Administration': 'municipal_administration'
  };
  return categoryMapping[categoryName] || categoryName.replace(/[^a-z0-9]/g, '_').toLowerCase();
};

const statuses = [
  { id: 'pending', name: 'Pending', color: '#F59E0B' },
  { id: 'under_review', name: 'Under Review', color: '#3B82F6' },
  { id: 'in_progress', name: 'In Progress', color: '#F97316' },
  { id: 'resolved', name: 'Resolved', color: '#10B981' }
]

// Custom marker component
const createCustomMarker = (category, severity) => {
  // Handle both old format ("Water Supply") and new format ("water_supply")
  const categoryKey = mapCategoryToTranslationKey(category);
  const categoryInfo = categories.find(c => c.id === category || c.id === categoryKey) || categories[0];
  const severityInfo = severities.find(s => s.id === severity) || severities[0];
  
  // Fallback colors if category not found
  const defaultCategoryColor = '#6B6560';
  const defaultSeverityColor = '#F59E0B';
  
  const svgIcon = `
    <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 2.89.87 5.56 2.34 7.78L16 40l13.66-16.22C31.13 21.56 32 18.89 32 16 32 7.16 24.84 0 16 0z" 
            fill="${categoryInfo?.color || defaultCategoryColor}" 
            stroke="#fff" 
            stroke-width="2"/>
      <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">
        ${categoryInfo?.icon || '📍'}
      </text>
      <circle cx="26" cy="6" r="4" fill="${severityInfo?.color || defaultSeverityColor}" stroke="#fff" stroke-width="1"/>
    </svg>
  `
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40]
  })
}

// Heatmap layer component
function HeatmapLayer({ reports, viewMode }) {
  const map = useMap()
  const heatmapRef = useRef(null)

  useEffect(() => {
    console.log('HeatmapLayer useEffect triggered', { viewMode, reportsCount: reports.length })
    
    // Check if leaflet.heat plugin is available
    if (typeof L.heatLayer === 'undefined') {
      console.warn('Leaflet.heat plugin not loaded', { L, heatLayer: L.heatLayer })
      return
    }

    console.log('Leaflet.heat plugin is available')

    if (viewMode === 'heatmap' || viewMode === 'both') {
      // Remove existing heatmap if any
      if (heatmapRef.current) {
        map.removeLayer(heatmapRef.current)
        console.log('Removed existing heatmap')
      }

      // Prepare heat data with intensity based on severity
      const heatData = reports.map(report => {
        const severityWeight = {
          'critical': 1.0,
          'high': 0.9,
          'medium': 0.7,
          'low': 0.5
        }
        
        const intensity = severityWeight[report.ai_severity] || 0.5
        console.log('Report data:', { 
          id: report.id, 
          lat: report.latitude, 
          lng: report.longitude, 
          severity: report.ai_severity, 
          intensity 
        })
        
        return [
          report.latitude,
          report.longitude,
          intensity
        ]
      })

      console.log('Heat data prepared:', { totalPoints: heatData.length, sampleData: heatData.slice(0, 3) })

      // Create new heatmap with performance optimizations
      if (heatData.length > 0) {
        try {
          // Use the same data as pins for consistency
          console.log('Creating heatmap with real data:', heatData)
          
          heatmapRef.current = L.heatLayer(heatData, {
            radius: 50,        // Even larger radius
            blur: 25,         // Even larger blur
            maxZoom: 17,
            max: 1.0,
            minOpacity: 0.6,    // Higher minimum opacity
            gradient: {
              0.0: '#FF0000',    // Bright red for low intensity
              0.4: '#FF6600',    // Orange
              0.7: '#FFCC00',    // Yellow
              1.0: '#00FF00'     // Bright green for high intensity
            }
          }).addTo(map)
          
          console.log('Heatmap created successfully', heatmapRef.current)
          
          // Force canvas to front and ensure visibility
          setTimeout(() => {
            const canvasElements = document.querySelectorAll('canvas')
            console.log('Found canvas elements:', canvasElements.length)
            canvasElements.forEach((canvas, index) => {
              if (canvas.width > 0 && canvas.height > 0) {
                canvas.style.zIndex = '1000'
                canvas.style.pointerEvents = 'none'
                canvas.style.opacity = '1'
                canvas.style.position = 'absolute'
                canvas.style.top = '0'
                canvas.style.left = '0'
                console.log(`Canvas ${index} styled:`, {
                  width: canvas.width,
                  height: canvas.height,
                  zIndex: canvas.style.zIndex,
                  opacity: canvas.style.opacity
                })
              }
            })
          }, 500)
          
        } catch (error) {
          console.error('Error creating heatmap:', error)
        }
      } else {
        console.warn('No heat data available')
      }
    } else {
      // Remove heatmap when not in heatmap mode
      if (heatmapRef.current) {
        map.removeLayer(heatmapRef.current)
        heatmapRef.current = null
        console.log('Heatmap removed (not in heatmap mode)')
      }
    }

    return () => {
      if (heatmapRef.current) {
        map.removeLayer(heatmapRef.current)
        console.log('Heatmap cleaned up')
      }
    }
  }, [map, reports, viewMode])

  return null
}

// Map controller component to get map instance
const MapController = ({ onMapReady }) => {
  const map = useMap()
  useEffect(() => { onMapReady(map) }, [map])
  return null
}

// Map control components
function MapControls({ onMyLocation, onZoomIn, onZoomOut, onFullscreen }) {
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={onMyLocation}
        title="My Location"
        className="w-10 h-10 flex items-center justify-center rounded-xl shadow-md transition-colors duration-150 bg-white border border-[#D4522A]/30 text-[#D4522A] hover:bg-[#F8F6F1] dark:bg-[#1C1C1A] dark:border-[#D4522A]/40 dark:text-[#D4522A] dark:hover:bg-[#2C2C2A]"
      >
        <MapPin className="w-4 h-4" />
      </button>
      
      <div className="rounded-xl shadow-md flex bg-white border border-[#E8E4DC] text-[#1C1917] dark:bg-[#1C1C1A] dark:border-[#2C2C2A] dark:text-[#E8E4DC]">
        <button
          onClick={onZoomIn}
          className="w-10 h-10 flex items-center justify-center transition-colors duration-150 rounded-l-xl hover:bg-[#F8F6F1] dark:hover:bg-[#2C2C2A]"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          className="w-10 h-10 flex items-center justify-center transition-colors duration-150 rounded-r-xl border-l border-[#E8E4DC] dark:border-[#2C2C2A] hover:bg-[#F8F6F1] dark:hover:bg-[#2C2C2A]"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>
      
      <button
        onClick={onFullscreen}
        className="w-10 h-10 flex items-center justify-center rounded-xl shadow-md transition-colors duration-150 bg-white border border-[#E8E4DC] text-[#1C1917] hover:bg-[#F8F6F1] dark:bg-[#1C1C1A] dark:border-[#2C2C2A] dark:text-[#E8E4DC] dark:hover:bg-[#2C2C2A]"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  )
}

// Legend component
function MapLegend() {
  return (
    <div className="absolute bottom-4 right-4 z-[1000] rounded-2xl p-4 shadow-xl border bg-white border-[#E8E4DC] dark:bg-[#1C1C1A] dark:border-[#2C2C2A]">
      <div className="mb-3">
        <h4 className="font-semibold text-sm mb-2 text-[#1C1917] dark:text-[#E8E4DC]">Heatmap Intensity</h4>
        <div className="flex items-center gap-2">
          <div className="w-2 h-4 rounded" style={{ backgroundColor: '#2A9D8F' }}></div>
          <div className="w-2 h-4 rounded" style={{ backgroundColor: '#E9A84C' }}></div>
          <div className="w-2 h-4 rounded" style={{ backgroundColor: '#D4522A' }}></div>
          <div className="w-2 h-4 rounded" style={{ backgroundColor: '#C1121F' }}></div>
        </div>
        <div className="flex justify-between text-xs mt-1 text-[#6B6560]">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold text-sm mb-2 text-[#1C1917] dark:text-[#E8E4DC]">Categories</h4>
        <div className="space-y-1">
          {categories.slice(0, 4).map(category => (
            <div key={category.id} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }}></div>
              <span className="text-[#6B6560] dark:text-[#E8E4DC]">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Issue count display
function IssueCount({ count, t }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-[#D4522A] text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg"
    >
      {t('mapLabels.showing_issues', { count })}
    </motion.div>
  )
}

const MapView = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const mapRef = useRef()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [mapInstance, setMapInstance] = useState(null)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState(categories.map(c => c.id))
  const [selectedSeverities, setSelectedSeverities] = useState([])
  const [selectedStatuses, setSelectedStatuses] = useState([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [viewMode, setViewMode] = useState('both') // 'heatmap', 'pins', 'both'

  // Load reports from Supabase
  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true)
        
        let query = supabase.from('reports').select('*')
        
        // Filter based on user role
        if (!user) {
          query = query.eq('is_anonymous', true)
        } else if (user.role === 'gov' || user.role === 'admin') {
          // Government users see all reports
        } else {
          if (user.email) {
            query = query.eq('citizen_email', user.email)
          } else {
            query = query.eq('is_anonymous', true)
          }
        }
        
        query = query.order('created_at', { ascending: false })
        
        const { data, error } = await query
        
        if (error) {
          console.error('Failed to load reports:', error)
          // Use sample data as fallback
          setReports(sampleReports)
        } else {
          // Add sample data to real data for better visualization
          const allReports = [...(data || []), ...sampleReports]
          setReports(allReports)
        }
      } catch (err) {
        console.error('Failed to load reports:', err)
        setReports(sampleReports)
      } finally {
        setLoading(false)
      }
    }
    
    loadReports()
  }, [user])

  // Filter reports
  const filteredReports = useMemo(() => {
    const filtered = reports.filter(report => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!report.title.toLowerCase().includes(query) && 
            !report.address.toLowerCase().includes(query)) {
          return false
        }
      }
      
      // Category filter - handle both old format ("Water Supply") and new format ("water_supply")
      if (selectedCategories.length > 0) {
        const reportCategoryKey = mapCategoryToTranslationKey(report.ai_issue_type);
        if (!selectedCategories.includes(report.ai_issue_type) && !selectedCategories.includes(reportCategoryKey)) {
          return false;
        }
      }
      
      // Severity filter
      if (selectedSeverities.length > 0 && !selectedSeverities.includes(report.ai_severity)) {
        return false
      }
      
      // Status filter
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(report.status)) {
        return false
      }
      
      // Date filter
      if (dateFrom && new Date(report.created_at) < new Date(dateFrom)) {
        return false
      }
      if (dateTo && new Date(report.created_at) > new Date(dateTo)) {
        return false
      }
      
      return true
    })
    
    console.log('Filtered reports:', { 
      total: filtered.length, 
      viewMode, 
      sampleData: filtered.slice(0, 3).map(r => ({ 
        id: r.id, 
        lat: r.latitude, 
        lng: r.longitude, 
        severity: r.ai_severity 
      }))
    })
    
    return filtered
  }, [reports, searchQuery, selectedCategories, selectedSeverities, selectedStatuses, dateFrom, dateTo, viewMode])

  // Calculate stats
  const stats = useMemo(() => {
    const critical = filteredReports.filter(r => r.ai_severity === 'critical').length
    const resolvedToday = filteredReports.filter(r => 
      r.status === 'resolved' && 
      new Date(r.created_at).toDateString() === new Date().toDateString()
    ).length
    
    return {
      total: filteredReports.length,
      critical,
      resolvedToday
    }
  }, [filteredReports])

  // Category counts
  const categoryCounts = useMemo(() => {
    return categories.map(category => ({
      ...category,
      count: filteredReports.filter(r => 
        r.ai_issue_type === category.id || 
        mapCategoryToTranslationKey(r.ai_issue_type) === category.id
      ).length
    }))
  }, [filteredReports])

  // Map control handlers
  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    
    toast.loading('Getting your location...', { id: 'location' })
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        // Pan and zoom map to user location
        if (mapInstance) {
          mapInstance.flyTo([latitude, longitude], 15, {
            animate: true,
            duration: 1.5
          })
        }
        toast.success('Location found!', { id: 'location' })
      },
      (error) => {
        let message = 'Unable to get location'
        if (error.code === 1) message = 'Location access denied. Please allow location access.'
        if (error.code === 2) message = 'Location unavailable'
        if (error.code === 3) message = 'Location request timed out'
        toast.error(message, { id: 'location' })
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    )
  }

  const handleZoomIn = () => {
    if (mapInstance) {
      mapInstance.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (mapInstance) {
      mapInstance.zoomOut()
    }
  }

  const handleFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    }
  }

  // Filter handlers
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleSeverity = (severityId) => {
    setSelectedSeverities(prev => 
      prev.includes(severityId) 
        ? prev.filter(id => id !== severityId)
        : [...prev, severityId]
    )
  }

  const toggleStatus = (statusId) => {
    setSelectedStatuses(prev => 
      prev.includes(statusId) 
        ? prev.filter(id => id !== statusId)
        : [...prev, statusId]
    )
  }

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategories(categories.map(c => c.id))
    setSelectedSeverities([])
    setSelectedStatuses([])
    setDateFrom('')
    setDateTo('')
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-civic-parchment">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-civic-orange mx-auto mb-4"></div>
          <p className="text-civic-textSecondary">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative" style={{ height: 'calc(100vh - 64px)', width: '100%' }}>
      {/* Map Container */}
      <div className="relative" style={{ height: '100%', width: '100%' }}>
        <MapContainer
          center={[19.0760, 72.8777]}
          zoom={12}
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          
          {/* Map Controller */}
          <MapController onMapReady={setMapInstance} />
          
          {/* Heatmap Layer */}
          <HeatmapLayer reports={filteredReports} viewMode={viewMode} />
          
          {/* Markers */}
          {viewMode === 'pins' || viewMode === 'both' ? (
            filteredReports.map(report => {
              // Handle both old format ("Water Supply") and new format ("water_supply")
              const categoryKey = mapCategoryToTranslationKey(report.ai_issue_type);
              const categoryInfo = categories.find(c => c.id === report.ai_issue_type || c.id === categoryKey) || categories[0];
              const deptIcon = categoryInfo.icon;
              const deptColor = categoryInfo.color;
              const deptColorLight = `${categoryInfo.color}20`;

              const severityInfo = severities.find(s => s.id === report.ai_severity) || severities[0];
              const severityStyle = { backgroundColor: `${severityInfo.color}20`, color: severityInfo.color };

              const statusInfo = statuses.find(s => s.id === report.status) || statuses[0];
              const statusStyle = { backgroundColor: `${statusInfo.color}20`, color: statusInfo.color };
              
              const timeAgo = (dateStr) => {
                if (!dateStr) return '';
                const diffHours = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60));
                if (diffHours < 24) return diffHours === 0 ? 'Just now' : `${diffHours} hours ago`;
                const diffDays = Math.floor(diffHours / 24);
                return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
              };
              
              return (
                <Marker
                  key={report.id}
                  position={[report.latitude, report.longitude]}
                  icon={createCustomMarker(report.ai_issue_type, report.ai_severity)}
                  eventHandlers={{
                    click: () => {
                      setSelectedReport(report)
                      if (mapRef.current) {
                        mapRef.current.setView([report.latitude, report.longitude], 16)
                      }
                    }
                  }}
                >
                  <Popup>
                    <div className="p-4">
                      {/* Department badge */}
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-2"
                        style={{ backgroundColor: deptColorLight, color: deptColor }}>
                        {deptIcon} {categoryInfo.name}
                      </span>
                      
                      {/* Title */}
                      <p className="font-semibold text-[#1C1917] text-sm leading-snug mb-2">{report.title}</p>
                      
                      {/* Severity + Status row */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={severityStyle}>{severityInfo.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={statusStyle}>{statusInfo.name}</span>
                      </div>
                      
                      {/* Location */}
                      <p className="text-xs text-[#6B6560] mb-1">📍 {report.address?.slice(0,40)}...</p>
                      
                      {/* Time */}
                      <p className="text-xs text-[#6B6560] mb-3">{timeAgo(report.created_at)}</p>
                      
                      {/* View button */}
                      <button 
                        onClick={() => navigate(`/report/${report.id}`)}
                        className="w-full bg-[#D4522A] text-white text-xs font-medium py-2 rounded-xl hover:bg-[#B8441F] transition-colors"
                      >
                        View Full Report →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              )
            })
          ) : null}
        </MapContainer>
      </div>

      {/* Map Controls */}
      <MapControls
        onMyLocation={handleMyLocation}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFullscreen={handleFullscreen}
      />

      {/* Legend */}
      <MapLegend />

      {/* Issue Count */}
      <IssueCount count={filteredReports.length} t={t} />

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 300 }}
            exit={{ width: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute left-0 top-0 bottom-0 bg-white border-r border-[#E8E4DC] dark:bg-[#1C1C1A] dark:border-[#2C2C2A] overflow-y-auto z-[999]"
          >
            <div className="p-6" style={{ minWidth: '300px' }}>
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-[#1C1917] dark:text-[#E8E4DC] mb-1">{t('map.mapView')}</h2>
                <p className="text-sm text-[#6B6560]">Showing {filteredReports.length} issues</p>
              </div>

              {/* Search */}
              <div className="mb-6 bg-[#F8F6F1] dark:bg-[#111110] border border-[#E8E4DC] dark:border-[#2C2C2A] rounded-xl p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B6560]" />
                  <input
                    type="text"
                    placeholder={t('map.filterByCategory')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-white border border-[#E8E4DC] text-[#1C1917] dark:bg-[#111110] dark:border-[#2C2C2A] dark:text-[#E8E4DC] focus:outline-none focus:ring-2 focus:ring-[#D4522A]/20"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6 bg-[#F8F6F1] dark:bg-[#111110] border border-[#E8E4DC] dark:border-[#2C2C2A] rounded-xl p-4">
                <h3 className="font-semibold text-[#1C1917] dark:text-[#E8E4DC] mb-3">{t('map.filterByCategory')}</h3>
                <div className="space-y-2">
                  {categoryCounts.map(category => (
                    <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className="rounded border-[#E8E4DC] dark:border-[#2C2C2A] text-[#D4522A] focus:ring-[#D4522A]"
                      />
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }}></div>
                      <span className="text-sm text-[#1C1917] dark:text-[#E8E4DC]">{getCategoryTranslation(category.id, t)}</span>
                      <span className="text-xs text-[#6B6560] bg-white border border-[#E8E4DC] dark:bg-[#2C2C2A] dark:border-[#2C2C2A] px-1.5 py-0.5 rounded-full ml-auto">
                        {category.count}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setSelectedCategories(categories.map(c => c.id))}
                    className="text-xs text-[#D4522A] hover:text-[#B8441F] font-medium transition-colors"
                  >
                    {t('mapLabels.select_all')}
                  </button>
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="text-xs text-[#D4522A] hover:text-[#B8441F] font-medium transition-colors"
                  >
                    {t('mapLabels.deselect_all')}
                  </button>
                </div>
              </div>

              {/* Severity Filter */}
              <div className="mb-6 bg-[#F8F6F1] dark:bg-[#111110] border border-[#E8E4DC] dark:border-[#2C2C2A] rounded-xl p-4">
                <h3 className="font-semibold text-[#1C1917] dark:text-[#E8E4DC] mb-3">{t('issue.severity')}</h3>
                <div className="flex flex-wrap gap-2">
                  {severities.map(severity => {
                    const isActive = selectedSeverities.includes(severity.id);
                    return (
                      <button
                        key={severity.id}
                        onClick={() => toggleSeverity(severity.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                          isActive
                            ? 'bg-[#D4522A] text-white border-[#D4522A]'
                            : 'bg-white text-[#6B6560] border-[#E8E4DC] dark:bg-[#2C2C2A] dark:border-[#2C2C2A] dark:text-[#6B6560]'
                        }`}
                      >
                        {getSeverityTranslation(severity.id, t)}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Status Filter */}
              <div className="mb-6 bg-[#F8F6F1] dark:bg-[#111110] border border-[#E8E4DC] dark:border-[#2C2C2A] rounded-xl p-4">
                <h3 className="font-semibold text-[#1C1917] dark:text-[#E8E4DC] mb-3">Status</h3>
                <div className="flex flex-wrap gap-2">
                  {statuses.map(status => {
                    const isActive = selectedStatuses.includes(status.id);
                    return (
                      <button
                        key={status.id}
                        onClick={() => toggleStatus(status.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                          isActive
                            ? 'bg-[#D4522A] text-white border-[#D4522A]'
                            : 'bg-white text-[#6B6560] border-[#E8E4DC] dark:bg-[#2C2C2A] dark:border-[#2C2C2A] dark:text-[#6B6560]'
                        }`}
                      >
                        {status.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Date Range */}
              <div className="mb-6 bg-[#F8F6F1] dark:bg-[#111110] border border-[#E8E4DC] dark:border-[#2C2C2A] rounded-xl p-4">
                <h3 className="font-semibold text-[#1C1917] dark:text-[#E8E4DC] mb-3">Date Range</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-[#6B6560] block mb-1">From</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl bg-white border border-[#E8E4DC] text-[#1C1917] dark:bg-[#111110] dark:border-[#2C2C2A] dark:text-[#E8E4DC] dark:[&::-webkit-calendar-picker-indicator]:invert focus:outline-none focus:ring-2 focus:ring-[#D4522A]/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#6B6560] block mb-1">To</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl bg-white border border-[#E8E4DC] text-[#1C1917] dark:bg-[#111110] dark:border-[#2C2C2A] dark:text-[#E8E4DC] dark:[&::-webkit-calendar-picker-indicator]:invert focus:outline-none focus:ring-2 focus:ring-[#D4522A]/20"
                    />
                  </div>
                </div>
              </div>

              {/* View Mode */}
              <div className="mb-6 bg-[#F8F6F1] dark:bg-[#111110] border border-[#E8E4DC] dark:border-[#2C2C2A] rounded-xl p-4">
                <h3 className="font-semibold text-[#1C1917] dark:text-[#E8E4DC] mb-3">View Mode</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('heatmap')}
                    className={`flex-1 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                      viewMode === 'heatmap' 
                        ? 'bg-[#D4522A] text-white border-[#D4522A]' 
                        : 'bg-white text-[#6B6560] border-[#E8E4DC] dark:bg-[#2C2C2A] dark:border-[#2C2C2A] dark:text-[#6B6560]'
                    }`}
                  >
                    🔥 Heatmap
                  </button>
                  <button
                    onClick={() => setViewMode('pins')}
                    className={`flex-1 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                      viewMode === 'pins' 
                        ? 'bg-[#D4522A] text-white border-[#D4522A]' 
                        : 'bg-white text-[#6B6560] border-[#E8E4DC] dark:bg-[#2C2C2A] dark:border-[#2C2C2A] dark:text-[#6B6560]'
                    }`}
                  >
                    📍 Pins
                  </button>
                  <button
                    onClick={() => setViewMode('both')}
                    className={`flex-1 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                      viewMode === 'both' 
                        ? 'bg-[#D4522A] text-white border-[#D4522A]' 
                        : 'bg-white text-[#6B6560] border-[#E8E4DC] dark:bg-[#2C2C2A] dark:border-[#2C2C2A] dark:text-[#6B6560]'
                    }`}
                  >
                    🔀 Both
                  </button>
                </div>
              </div>

              {/* Reset Filters */}
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 text-[#D4522A] hover:text-[#B8441F] font-medium text-sm rounded-xl transition-colors mb-6 pb-2"
              >
                Reset All Filters
              </button>

              {/* Stats Cards */}
              <div className="space-y-3">
                <div className="bg-[#F8F6F1] dark:bg-[#111110] border border-[#E8E4DC] dark:border-[#2C2C2A] rounded-xl p-4">
                  <div className="text-2xl font-bold text-[#1C1917] dark:text-[#E8E4DC]">{stats.total}</div>
                  <div className="text-xs text-[#6B6560]">Total Issues</div>
                </div>
                <div className="bg-[#F8F6F1] dark:bg-[#111110] border border-[#E8E4DC] dark:border-[#2C2C2A] rounded-xl p-4">
                  <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
                  <div className="text-xs text-[#6B6560]">Critical Issues</div>
                </div>
                <div className="bg-[#F8F6F1] dark:bg-[#111110] border border-[#E8E4DC] dark:border-[#2C2C2A] rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-600">{stats.resolvedToday}</div>
                  <div className="text-xs text-[#6B6560]">Resolved Today</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-1/2 z-[1001] bg-white dark:bg-[#1C1C1A] border border-[#E8E4DC] dark:border-[#2C2C2A] rounded-full w-8 h-8 flex items-center justify-center shadow-md cursor-pointer transition-all duration-150 hover:shadow-lg"
        style={{ 
          left: sidebarOpen ? '284px' : '0px',
          transform: 'translateY(-50%)'
        }}
      >
        {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  )
}

export default MapView
