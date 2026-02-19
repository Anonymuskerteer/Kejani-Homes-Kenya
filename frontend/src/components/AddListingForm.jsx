import { useState, useEffect } from 'react'
import { uploadListingImages } from '../api/listings'
import { compressImage } from '../utils/imageCompression'
import MapPicker from './MapPicker'

export default function AddListingForm({ listing, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    rentalType: 'Single Room',
    customType: '',
    deposit: '',
    location: '',
    county: '',
    coordinates: { lat: 0, lng: 0 },
    amenities: [],
    customAmenities: [],
  })

  const [imageFiles, setImageFiles] = useState([]) // actual File objects
  const [previewImages, setPreviewImages] = useState([]) // for display
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [customAmenityInput, setCustomAmenityInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  const amenitiesOptions = [
    'Pool',
    'WiFi',
    'Kitchen',
    'CCTV',
    'Water Always Available',
    'Garbage Collection',
  ]

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        price: listing.price || '',
        rentalType: listing.rentalType || 'Single Room',
        customType: '',
        deposit: listing.deposit || '',
        location: listing.location || '',
        county: listing.county || '',
        coordinates: listing.coordinates || { lat: 0, lng: 0 },
        amenities: listing.amenities || [],
        customAmenities: [],
      })
      // For existing listings, show existing images as previews
      if (listing.images && listing.images.length > 0) {
        setPreviewImages(listing.images.map((url, i) => ({
          url,
          id: `existing-${i}`,
          isExisting: true,
        })))
      } else if (listing.image) {
        setPreviewImages([{ url: listing.image, id: 'existing-0', isExisting: true }])
      }
    }
  }, [listing])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const handleAddCustomAmenity = () => {
    if (customAmenityInput.trim()) {
      setFormData(prev => ({
        ...prev,
        customAmenities: [...prev.customAmenities, customAmenityInput],
      }))
      setCustomAmenityInput('')
    }
  }

  const handleRemoveCustomAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      customAmenities: prev.customAmenities.filter((_, i) => i !== index),
    }))
  }

  const handleImageUpload = async (e) => {
    const files = e.target.files
    if (!files) return

    const newFiles = []
    const newPreviews = []

    const MAX_FILE_SIZE_MB = 8 // Backend allows 10MB, use 8MB for safety margin
    
    for (let file of files) {
      try {
        // Check if file is too large even for compression
        const fileSizeMB = file.size / (1024 * 1024)
        if (fileSizeMB > 50) {
          console.warn(`File ${file.name} is too large (${fileSizeMB.toFixed(1)}MB), skipping`)
          setUploadError(`Image "${file.name}" is too large (${fileSizeMB.toFixed(1)}MB). Please select an image under 50MB.`)
          continue
        }

        // Compress image before uploading
        const compressedFile = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 800,
          quality: 0.8,
          maxSizeMB: MAX_FILE_SIZE_MB,
        })
        newFiles.push(compressedFile)
        const previewUrl = URL.createObjectURL(compressedFile)
        newPreviews.push({
          url: previewUrl,
          id: Date.now() + Math.random(),
          isExisting: false,
          file: compressedFile,
        })
      } catch (error) {
        console.error('Error compressing image:', error)
        setUploadError(`Failed to process image "${file.name}". Please try a different image.`)
      }
    }

    setImageFiles(prev => [...prev, ...newFiles])
    setPreviewImages(prev => [...prev, ...newPreviews])
  }

  const handleRemoveImage = (id) => {
    const imageToRemove = previewImages.find(img => img.id === id)
    setPreviewImages(prev => prev.filter(img => img.id !== id))

    if (imageToRemove && !imageToRemove.isExisting && imageToRemove.file) {
      setImageFiles(prev => prev.filter(f => f !== imageToRemove.file))
      // Revoke the object URL to free memory
      URL.revokeObjectURL(imageToRemove.url)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploadError(null)

    try {
      setUploading(true)

      // Collect existing image URLs (already on Cloudinary)
      const existingImageUrls = previewImages
        .filter(img => img.isExisting)
        .map(img => img.url)

      // Upload new images to Cloudinary
      let newImageUrls = []
      if (imageFiles.length > 0) {
        const uploadResult = await uploadListingImages(imageFiles)
        newImageUrls = uploadResult.images || []
      }

      const allImageUrls = [...existingImageUrls, ...newImageUrls]

      // Map form fields to backend model fields
      const submitData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price) || 0,
        deposit: Number(formData.deposit) || 0,
        location: formData.location,
        county: formData.county,
        rentalType: formData.rentalType,
        customType: formData.customType,
        amenities: formData.amenities,
        customAmenities: formData.customAmenities,
        coordinates: formData.coordinates,
        images: allImageUrls,
      }

      await onSubmit(submitData)
    } catch (err) {
      console.error('Error submitting listing:', err)
      setUploadError(err.message || 'Failed to upload images. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen py-6 px-4">
        <div className="max-w-2xl mx-auto bg-white dark:bg-dark-foreground rounded-card">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-dark-foreground border-b border-border dark:border-dark-border p-4 flex items-center justify-between rounded-t-card">
            <h2 className="text-xl font-bold text-text-primary">
              {listing ? 'Edit Listing' : 'Add New Listing'}
            </h2>
            <button
              onClick={onClose}
              disabled={uploading}
              className="p-2 hover:bg-background dark:hover:bg-dark-background rounded-card transition-colors"
            >
              <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Upload error */}
            {uploadError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-card text-red-700 dark:text-red-400 text-sm">
                {uploadError}
              </div>
            )}

            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Basic Information</h3>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Property Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Modern 2-Bedroom Apartment in Westlands"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your property in detail..."
                  rows="5"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Monthly Rent (KES)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="45000"
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Deposit (KES)</label>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleInputChange}
                    placeholder="45000"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Rental Type</label>
                <select
                  name="rentalType"
                  value={formData.rentalType}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="Single Room">Single Room</option>
                  <option value="Bedsitter">Bedsitter</option>
                  <option value="1 Bedroom">1 Bedroom</option>
                  <option value="2 Bedroom">2 Bedroom</option>
                  <option value="3 Bedroom">3 Bedroom</option>
                  <option value="4 Bedroom">4 Bedroom</option>
                  <option value="Custom">Custom Type</option>
                </select>
              </div>

              {formData.rentalType === 'Custom' && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Custom Rental Type</label>
                  <input
                    type="text"
                    name="customType"
                    value={formData.customType}
                    onChange={handleInputChange}
                    placeholder="e.g., Studio Apartment"
                    className="input-field"
                  />
                </div>
              )}
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Location</h3>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Address</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Westlands, Nairobi"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">County</label>
                <select
                  name="county"
                  value={formData.county}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="">Select County</option>
                  {[
                    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Embu', 'Garissa',
                    'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu',
                    'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia',
                    'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori',
                    'Mombasa', "Murang'a", 'Nairobi', 'Nakuru', 'Nandi', 'Narok',
                    'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita Taveta',
                    'Tana River', 'Transnzoia', 'Turkana', 'Tharaka Nithi', 'Uasin Gishu',
                    'Vihiga', 'Wajir', 'West Pokot'
                  ].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowMapPicker(!showMapPicker)}
                  className="button-secondary w-full flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6.553 3.276A1 1 0 0017 20.382V9.618a1 1 0 00-1.447-.894L9 13m0 0L3.724 9.278M9 13L3.727 9.279m0 0A6 6 0 115.455 2.724M3.727 9.279L9 5.618" />
                  </svg>
                  {showMapPicker ? 'Close Map Picker' : 'Select on Map'}
                </button>
              </div>

              {showMapPicker && (
                <div className="p-4 bg-background dark:bg-dark-background rounded-card border border-border dark:border-dark-border">
                  <MapPicker
                    coordinates={formData.coordinates}
                    onCoordinatesChange={(coords) => 
                      setFormData(prev => ({ 
                        ...prev, 
                        coordinates: coords 
                      }))
                    }
                    address={formData.location}
                    height="300px"
                  />
                </div>
              )}
            </div>

            {/* Amenities Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Amenities</h3>

              <div className="space-y-3">
                {amenitiesOptions.map(amenity => (
                  <label key={amenity} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="w-4 h-4 rounded border-border cursor-pointer"
                    />
                    <span className="text-text-primary">{amenity}</span>
                  </label>
                ))}
              </div>

              {/* Custom amenities */}
              {formData.customAmenities.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-border dark:border-dark-border">
                  {formData.customAmenities.map((amenity, index) => (
                    <div key={index} className="flex items-center justify-between bg-background dark:bg-dark-background p-3 rounded-card">
                      <span className="text-text-primary">{amenity}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomAmenity(index)}
                        className="text-error hover:text-red-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add custom amenity */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={customAmenityInput}
                  onChange={(e) => setCustomAmenityInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCustomAmenity()}
                  placeholder="Add custom amenity..."
                  className="input-field flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAmenity}
                  className="button-secondary px-4"
                >
                  +
                </button>
              </div>
            </div>

            {/* Images Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Property Images</h3>

              <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-border dark:border-dark-border rounded-card cursor-pointer hover:bg-background dark:hover:bg-dark-background transition-colors">
                <div className="text-center">
                  <svg className="w-8 h-8 text-text-secondary mb-2 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="font-medium text-text-primary">Drag and drop images or click to select</p>
                  <p className="text-sm text-text-secondary">PNG, JPG up to 5MB each (max 10 images)</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Image previews */}
              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {previewImages.map(image => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-card"
                      />
                      {image.isExisting && (
                        <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
                          Uploaded
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(image.id)}
                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-card"
                      >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form actions */}
            <div className="flex gap-3 sticky bottom-0 bg-white dark:bg-dark-foreground pt-6 border-t border-border dark:border-dark-border -mx-6 px-6 py-4">
              <button
                type="submit"
                disabled={uploading}
                className="button-primary flex-1 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  listing ? 'Update Listing' : 'Create Listing'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="button-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
