export const getTrackedLinkUrl = (target: EventTarget | null) => {
  if (!target || typeof (target as Element).closest !== 'function') return null

  const link = (target as Element).closest('a[href]')
  const href = link?.getAttribute('href')
  if (!href || href.startsWith('#')) return null

  try {
    const baseUrl = typeof window === 'undefined' ? 'https://blog.example/' : window.location.href
    const url = new URL(href, baseUrl)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null

    return url.toString()
  } catch {
    return null
  }
}
