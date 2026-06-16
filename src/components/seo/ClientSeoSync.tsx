import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const MANAGED_SELECTOR = '[data-horizon-seo="true"]'
const META_BLOCK_PATTERN = /<!--app-meta:start-->([\s\S]*?)<!--app-meta:end-->/i

export const extractManagedSeoHead = (html: string) =>
  String(html).match(META_BLOCK_PATTERN)?.[1].trim()

export const replaceManagedSeoHead = (
  targetDocument: Pick<Document, 'head' | 'createElement'>,
  managedHeadHtml: string,
) => {
  for (const node of targetDocument.head.querySelectorAll(MANAGED_SELECTOR)) {
    node.remove()
  }

  const template = targetDocument.createElement('template')
  template.innerHTML = managedHeadHtml
  targetDocument.head.append(template.content)
}

const ClientSeoSync = () => {
  const location = useLocation()
  const initialRender = useRef(true)

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
      return
    }

    const controller = new AbortController()
    const path = `${location.pathname}${location.search}`

    void fetch(path, {
      credentials: 'same-origin',
      headers: { accept: 'text/html' },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.headers.get('content-type')?.includes('text/html')) {
          return
        }

        const managedHeadHtml = extractManagedSeoHead(await response.text())
        if (managedHeadHtml) {
          replaceManagedSeoHead(document, managedHeadHtml)
        }
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Failed to synchronize page metadata:', error)
        }
      })

    return () => controller.abort()
  }, [location.pathname, location.search])

  return null
}

export default ClientSeoSync
