import { CREPE_CONFIG } from '../../config/crepe.config'

const SVG_FALLBACK_EXTENSIONS = new Set(['.svg'])
const GENERIC_MIME_TYPES = new Set(['', 'application/octet-stream', 'text/xml', 'application/xml'])

const getLowercaseExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex < 0) return ''
  return filename.slice(lastDotIndex).toLowerCase()
}

export const isAllowedMediaUpload = (file: File): boolean => {
  if (CREPE_CONFIG.upload.allowedTypes.includes(file.type)) {
    return true
  }

  if (GENERIC_MIME_TYPES.has(file.type)) {
    return SVG_FALLBACK_EXTENSIONS.has(getLowercaseExtension(file.name))
  }

  return false
}

export const getAllowedMediaTypeLabel = (mimeType: string): string =>
  mimeType === 'image/svg+xml' ? 'svg' : mimeType.split('/')[1]
