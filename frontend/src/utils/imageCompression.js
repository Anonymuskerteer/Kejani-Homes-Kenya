/**
 * Compress an image file before uploading
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width (default: 1200)
 * @param {number} options.maxHeight - Maximum height (default: 800)
 * @param {number} options.quality - Quality from 0 to 1 (default: 0.8)
 * @param {number} options.maxSizeMB - Maximum file size in MB (default: 1MB)
 * @returns {Promise<File>} - Compressed image file
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.8,
    maxSizeMB = 1,
  } = options

  // If file is already small enough, return as-is
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB <= maxSizeMB) {
    return file
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width
        let height = img.height

        // For very large images, scale down more aggressively
        const scaleFactor = fileSizeMB > 5 ? 0.5 : fileSizeMB > 3 ? 0.7 : 1
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
        
        // Apply additional scaling for large files
        width = Math.round(width * scaleFactor)
        height = Math.round(height * scaleFactor)

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        
        // Use better image quality settings
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        // Recursive compression to ensure file is under size limit
        const attemptCompression = (currentQuality, attempt = 1) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'))
                return
              }

              const blobSizeMB = blob.size / (1024 * 1024)
              
              // If still too large and we have attempts left, reduce quality further
              if (blob.size > maxSizeMB * 1024 * 1024 && attempt < 5) {
                const newQuality = Math.max(0.1, currentQuality * 0.6)
                attemptCompression(newQuality, attempt + 1)
              } else {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                })
                resolve(compressedFile)
              }
            },
            'image/jpeg',
            currentQuality
          )
        }

        // Start compression with initial quality
        attemptCompression(quality)
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Compress multiple image files
 * @param {File[]} files - Array of image files
 * @param {Object} options - Compression options
 * @returns {Promise<File[]>} - Array of compressed image files
 */
export async function compressImages(files, options = {}) {
  const compressionPromises = files.map((file) => compressImage(file, options))
  return Promise.all(compressionPromises)
}
