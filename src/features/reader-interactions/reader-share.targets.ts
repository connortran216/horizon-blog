import { ReaderShareMethod } from './reader-interactions.types'

export interface ReaderShareTargetInput {
  title?: string
  url: string
}

export const buildReaderShareTargetUrl = (
  method: ReaderShareMethod,
  { title, url }: ReaderShareTargetInput,
) => {
  const encodedUrl = encodeURIComponent(url)

  switch (method) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    case 'x':
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(title || '')}`
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    case 'copy_link':
      return null
  }
}
