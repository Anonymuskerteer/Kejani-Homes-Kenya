import { useState } from 'react'

export default function FilterBar({ onFiltersChange, isOpen = false, onClose = null, variant = 'sidebar', onResetFilters = null }) {
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    amenities: [],
    location: '',
  })
  const [amenitySearch, setAmenitySearch] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showAmenityDropdown, setShowAmenityDropdown] = useState(false)

  const amenitiesList = [
    'WiFi',
    'Kitchen',
    'Parking',
    'Garden',
    'Gym',
    'Balcony',
    'Furnished',
    'AC',
  ]

  // Filter amenities based on search
  const filteredAmenities = amenitiesList.filter(amenity =>
    amenity.toLowerCase().includes(amenitySearch.toLowerCase()) &&
    !filters.amenities.includes(amenity)
  )

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    // Auto-apply for horizontal variant
    if (variant === 'horizontal') {
      onFiltersChange(newFilters)
    }
  }

  const handleAmenityToggle = (amenity) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity]
    const newFilters = { ...filters, amenities: newAmenities }
    setFilters(newFilters)
    setAmenitySearch('')
    setShowAmenityDropdown(false)
    // Auto-apply for horizontal variant
    if (variant === 'horizontal') {
      onFiltersChange(newFilters)
    }
  }

  const handleAddCustomAmenity = () => {
    if (amenitySearch.trim()) {
      const newAmenity = amenitySearch.trim()
      if (!filters.amenities.includes(newAmenity)) {
        const newAmenities = [...filters.amenities, newAmenity]
        const newFilters = { ...filters, amenities: newAmenities }
        setFilters(newFilters)
        if (variant === 'horizontal') {
          onFiltersChange(newFilters)
        }
      }
      setAmenitySearch('')
      setShowAmenityDropdown(false)
    }
  }

  const handleReset = () => {
    const emptyFilters = {
      priceMin: '',
      priceMax: '',
      bedrooms: '',
      amenities: [],
      location: '',
    }
    setFilters(emptyFilters)
    setAmenitySearch('')
    setIsCollapsed(false)
    if (onResetFilters) {
      onResetFilters()
    } else {
      onFiltersChange(emptyFilters)
    }
  }

  const handleApply = () => {
    onFiltersChange(filters)
    if (onClose) onClose()
  }

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Horizontal variant for desktop top bar
  if (variant === 'horizontal') {
    return (
      <div className="bg-surface border border-border rounded-card p-4">
        {/* Header with collapse toggle */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary">Filters</h3>
          <button
            onClick={handleToggleCollapse}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            title={isCollapsed ? 'Expand filters' : 'Collapse filters'}
          >
            <svg 
              className={`w-5 h-5 text-primary transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>

        {/* Collapsible filter content */}
        {!isCollapsed && (
          <>
            <div className="flex flex-wrap items-end gap-4">
              {/* Location */}
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-medium text-text-secondary mb-1">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="Any location"
                  className="input-field text-sm py-2"
                />
              </div>

              {/* Price Min */}
              <div className="min-w-[120px]">
                <label className="block text-xs font-medium text-text-secondary mb-1">Min Price</label>
                <input
                  type="number"
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  placeholder="Min"
                  className="input-field text-sm py-2"
                />
              </div>

              {/* Price Max */}
              <div className="min-w-[120px]">
                <label className="block text-xs font-medium text-text-secondary mb-1">Max Price</label>
                <input
                  type="number"
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  placeholder="Max"
                  className="input-field text-sm py-2"
                />
              </div>

              {/* Bedrooms */}
              <div className="min-w-[130px]">
                <label className="block text-xs font-medium text-text-secondary mb-1">Bedrooms</label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  className="input-field text-sm py-2"
                >
                  <option value="">Any</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                </select>
              </div>

              {/* Amenities with search dropdown */}
              <div className="min-w-[180px] relative">
                <label className="block text-xs font-medium text-text-secondary mb-1">Amenities</label>
                <div className="relative">
                  <input
                    type="text"
                    value={amenitySearch}
                    onChange={(e) => {
                      setAmenitySearch(e.target.value)
                      setShowAmenityDropdown(true)
                    }}
                    onFocus={() => setShowAmenityDropdown(true)}
                    placeholder="Search amenities..."
                    className="input-field text-sm py-2 w-full"
                  />
                  {/* Dropdown suggestions */}
                  {showAmenityDropdown && (filteredAmenities.length > 0 || amenitySearch.trim()) && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredAmenities.map(amenity => (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => handleAmenityToggle(amenity)}
                          className="w-full text-left px-3 py-2 hover:bg-primary/10 text-sm"
                        >
                          {amenity}
                        </button>
                      ))}
                      {amenitySearch.trim() && !amenitiesList.map(a => a.toLowerCase()).includes(amenitySearch.toLowerCase()) && (
                        <button
                          type="button"
                          onClick={handleAddCustomAmenity}
                          className="w-full text-left px-3 py-2 hover:bg-primary/10 text-sm text-primary font-medium border-t border-border"
                        >
                          + Add "{amenitySearch.trim()}"
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Reset button */}
              <button
                type="button"
                onClick={handleReset}
                className="button-secondary px-4 py-2 text-sm whitespace-nowrap"
              >
                Clear All
              </button>
            </div>

            {/* Selected amenities chips */}
            {filters.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                {filters.amenities.map(amenity => (
                  <span
                    key={amenity}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => handleAmenityToggle(amenity)}
                      className="hover:text-primary/70"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // Sidebar/Drawer variant (default - for mobile drawer)
  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'} lg:hidden`}>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      )}

      {/* Filter content */}
      <div className={`fixed left-0 right-0 bottom-0 bg-white rounded-t-card max-h-[90vh] overflow-y-auto`}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <h3 className="font-semibold text-text-primary">Filters</h3>
            <button onClick={onClose} className="text-text-secondary" type="button">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filter sections */}
          <div className="space-y-6">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="Search location..."
                className="input-field"
              />
            </div>

            {/* Price range */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Price Range (KES)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  placeholder="Min"
                  className="input-field text-sm"
                />
                <input
                  type="number"
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  placeholder="Max"
                  className="input-field text-sm"
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Bedrooms</label>
              <select
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                className="input-field"
              >
                <option value="">Any</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">Amenities</label>
              <div className="grid grid-cols-2 gap-2">
                {amenitiesList.map(amenity => (
                  <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="w-4 h-4 border border-border rounded text-primary"
                    />
                    <span className="text-sm text-text-primary">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-6 border-t border-border mt-6">
            <button
              type="button"
              onClick={handleReset}
              className="button-secondary flex-1"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="button-primary flex-1"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
