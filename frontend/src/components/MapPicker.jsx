import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon for Vite bundler
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [12, -20],
})

L.Marker.prototype.options.icon = DefaultIcon

// Default center: Nairobi, Kenya
const DEFAULT_CENTER = { lat: -1.2921, lng: 36.8219 }
const DEFAULT_ZOOM = 13

// Location marker component with drag functionality
function LocationMarker({ coordinates, onCoordinatesChange }) {
  const markerRef = useRef(null)
  
  const eventHandlers = {
    dragend() {
      const marker = markerRef.current
      if (marker != null) {
        const position = marker.getLatLng()
        onCoordinatesChange({
          lat: Number(position.lat.toFixed(6)),
          lng: Number(position.lng.toFixed(6)),
        })
      }
    },
  }

  // Only render marker if we have valid numeric coordinates
  if (!coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number' || (coordinates.lat === 0 && coordinates.lng === 0)) {
    return null
  }

  return (
    <Marker
      ref={markerRef}
      position={[coordinates.lat, coordinates.lng]}
      draggable={true}
      eventHandlers={eventHandlers}
    />
  )
}

// Map click handler component
function MapClickHandler({ onCoordinatesChange }) {
  useMapEvents({
    click(e) {
      onCoordinatesChange({
        lat: Number(e.latlng.lat.toFixed(6)),
        lng: Number(e.latlng.lng.toFixed(6)),
      })
    },
  })
  return null
}

// Recenter map when coordinates change
function MapRecenter({ coordinates }) {
  const map = useMap()
  
  useEffect(() => {
    if (coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number' && coordinates.lat !== 0 && coordinates.lng !== 0) {
      map.setView([coordinates.lat, coordinates.lng], map.getZoom())
    }
  }, [coordinates, map])
  
  return null
}

export default function MapPicker({ 
  coordinates = { lat: 0, lng: 0 }, 
  onCoordinatesChange,
  address = '',
  height = '300px' 
}) {
  const [searchQuery, setSearchQuery] = useState(address)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)

  // Determine map center - ensure coordinates are valid numbers
  const mapCenter = coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number' && coordinates.lat !== 0 && coordinates.lng !== 0
    ? [coordinates.lat, coordinates.lng]
    : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]

  // Geocoding search using Nominatim (OpenStreetMap)
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchError(null)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=ke`
      )
      const data = await response.json()
      
      if (data && data[0]) {
        onCoordinatesChange({
          lat: Number(parseFloat(data[0].lat).toFixed(6)),
          lng: Number(parseFloat(data[0].lon).toFixed(6)),
        })
      } else {
        setSearchError('Location not found. Try a different search term.')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      setSearchError('Failed to search. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  // Reset to default view
  const handleResetView = () => {
    onCoordinatesChange({ lat: 0, lng: 0 })
  }

  // Get user's current location using browser geolocation
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSearchError('Geolocation is not supported by your browser')
      return
    }

    setIsSearching(true)
    setSearchError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        onCoordinatesChange({
          lat: Number(latitude.toFixed(6)),
          lng: Number(longitude.toFixed(6)),
        })
        setIsSearching(false)
        // Update search query to show current location
        setSearchQuery(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
      },
      (error) => {
        setIsSearching(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setSearchError('Location access denied. Please enable location permissions in your browser settings.')
            break
          case error.POSITION_UNAVAILABLE:
            setSearchError('Location information unavailable. Please try again.')
            break
          case error.TIMEOUT:
            setSearchError('Location request timed out. Please try again.')
            break
          default:
            setSearchError('Failed to get your location. Please try again.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search location in Kenya..."
          className="input-field flex-1 text-sm"
        />
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isSearching}
          className="button-secondary px-3 py-2 text-sm flex items-center gap-1"
          title="Use my current location"
        >
          {isSearching ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
        <button
          type="submit"
          disabled={isSearching}
          className="button-primary px-3 py-2 text-sm flex items-center gap-1"
        >
          {isSearching ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </form>

      {/* Search error */}
      {searchError && (
        <p className="text-sm text-error">{searchError}</p>
      )}

      {/* Map container */}
      <div 
        className="rounded-card overflow-hidden border border-border dark:border-dark-border"
        style={{ height }}
      >
        <MapContainer
          center={mapCenter}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onCoordinatesChange={onCoordinatesChange} />
          <LocationMarker coordinates={coordinates} onCoordinatesChange={onCoordinatesChange} />
          <MapRecenter coordinates={coordinates} />
        </MapContainer>
      </div>

      {/* Coordinates display and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-sm text-text-secondary">
          {coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number' && coordinates.lat !== 0 && coordinates.lng !== 0 ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="font-mono">
                {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </span>
            </span>
          ) : (
            <span className="text-muted dark:text-dark-muted">
              Click on the map or search to set location
            </span>
          )}
        </div>
        {coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number' && coordinates.lat !== 0 && coordinates.lng !== 0 && (
          <button
            type="button"
            onClick={handleResetView}
            className="text-sm text-primary hover:text-primary-dark transition-colors"
          >
            Clear location
          </button>
        )}
      </div>

      {/* Instructions */}
      <p className="text-xs text-muted dark:text-dark-muted">
        Click on the map to place a marker, or drag the marker to adjust the position.
      </p>
    </div>
  )
}