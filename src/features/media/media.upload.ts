import { CREPE_CONFIG } from '../../config/crepe.config'

export const isAllowedMediaUpload = (file: File): boolean =>
  CREPE_CONFIG.upload.allowedTypes.includes(file.type)

export const getAllowedMediaTypeLabel = (mimeType: string): string => mimeType.split('/')[1]
