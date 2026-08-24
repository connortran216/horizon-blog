import type { ResolvedMediaSource, ResolveMediaSourceResult } from './media.api'

export interface ResponsiveImageAttributes {
  src: string
  srcSet?: string
  sizes?: string
  width?: number
  height?: number
  loading: 'eager' | 'lazy'
  decoding: 'async'
  fetchPriority?: 'high'
}

export const getResponsiveImageAttributes = (
  source: ResolvedMediaSource,
  sizes: string,
  priority = false,
): ResponsiveImageAttributes => {
  const srcSet = source.variants
    .filter((variant) => variant.url && variant.width > 0)
    .sort((left, right) => left.width - right.width)
    .map((variant) => `${variant.url} ${variant.width}w`)
    .join(', ')

  return {
    src: source.url,
    srcSet: srcSet || undefined,
    sizes: srcSet ? sizes : undefined,
    width: source.width && source.width > 0 ? source.width : undefined,
    height: source.height && source.height > 0 ? source.height : undefined,
    loading: priority ? 'eager' : 'lazy',
    decoding: 'async',
    fetchPriority: priority ? 'high' : undefined,
  }
}

const setOptionalAttribute = (
  element: HTMLImageElement,
  name: string,
  value: string | number | undefined,
): void => {
  if (value === undefined) {
    element.removeAttribute(name)
    return
  }
  element.setAttribute(name, String(value))
}

export const applyResponsiveMediaAttributes = (
  root: ParentNode,
  sources: ResolveMediaSourceResult,
): void => {
  const byUrl = new Map(Object.values(sources).map((source) => [source.url, source]))

  root.querySelectorAll('img').forEach((element) => {
    const source = byUrl.get(element.getAttribute('src') || '')
    if (!source) return

    const attributes = getResponsiveImageAttributes(
      source,
      '(max-width: 768px) 100vw, 736px',
    )
    setOptionalAttribute(element, 'srcset', attributes.srcSet)
    setOptionalAttribute(element, 'sizes', attributes.sizes)
    setOptionalAttribute(element, 'width', attributes.width)
    setOptionalAttribute(element, 'height', attributes.height)
    element.loading = attributes.loading
    element.decoding = attributes.decoding
  })
}
