import { useState } from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
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
const DEFAULT_ZOOM = 15

export default function MapDisplay({ 
  coordinates = { lat: 0, lng: 0 }, 
  address = '',
  height = '200px' 
}) {
  const [locationError, setLocationError] = useState(null)
  const [userLocation, setUserLocation] = useState(null)

  // Check if we have valid coordinates
  const hasValidCoordinates = coordinates && coordinates.lat !== 0 && coordinates.lng !== 0

  // Get user's current location using browser geolocation
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({
          lat: Number(latitude.toFixed(6)),
          lng: Number(longitude.toFixed(6)),
        })
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please enable location permissions.')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable. Please try again.')
            break
          case error.TIMEOUT:
            setLocationError('Location request timed out. Please try again.')
            break
          default:
            setLocationError('Failed to get your location. Please try again.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  if (!hasValidCoordinates) {
    return (
      <div 
        className="bg-gray-100 dark:bg-dark-background rounded-card flex flex-col items-center justify-center border border-border dark:border-dark-border"
        style={{ height }}
      >
        <div className="text-center text-muted dark:text-dark-muted">
          <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <p className="text-sm">No location coordinates available</p>
        </div>
        {/* Use My Location button even when no coordinates */}
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="mt-3 text-sm text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Use My Location
        </button>
        {locationError && (
          <p className="text-xs text-error mt-2">{locationError}</p>
        )}
      </div>
    )
  }

  const mapCenter = [coordinates.lat, coordinates.lng]

  // Open in external map
  const openInGoogleMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`, '_blank')
  }

  const openInOpenStreetMap = () => {
    window.open(`https://www.openstreetmap.org/?mlat=${coordinates.lat}&mlon=${coordinates.lng}#map=15/${coordinates.lat}/${coordinates.lng}`, '_blank')
  }

  return (
    <div className="space-y-2">
      {/* Map container */}
      <div 
        className="rounded-card overflow-hidden border border-border dark:border-dark-border"
        style={{ height }}
      >
        <MapContainer
          center={mapCenter}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[coordinates.lat, coordinates.lng]} />
        </MapContainer>
      </div>

      {/* Address and external links */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {address && (
          <p className="text-sm text-text-secondary flex items-center gap-1">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {address}
          </p>
        )}
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            className="text-xs text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            My Location
          </button>
          <span className="text-border dark:text-dark-border">|</span>
          <button
            type="button"
            onClick={openInGoogleMaps}
            className="text-xs text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Google Maps
          </button>
          <span className="text-border dark:text-dark-border">|</span>
          <button
            type="button"
            onClick={openInOpenStreetMap}
            className="text-xs text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            OpenStreetMap
          </button>
        </div>
      </div>
      
      {/* Location error message */}
      {locationError && (
        <p className="text-xs text-error">{locationError}</p>
      )}
    </div>
  )
}
