import { useEffect } from 'react'
import { useColorMode } from '@chakra-ui/react'

const LIGHT_FAVICON = '/branding/horizon-icon-light.png'
const DARK_FAVICON = '/branding/horizon-icon-dark.png'
const FAVICON_SELECTOR = 'link[data-horizon-favicon="true"]'

const BrandFaviconSync = () => {
  const { colorMode } = useColorMode()

  useEffect(() => {
    const href = colorMode === 'dark' ? DARK_FAVICON : LIGHT_FAVICON
    let favicon = document.head.querySelector<HTMLLinkElement>(FAVICON_SELECTOR)

    if (!favicon) {
      favicon = document.createElement('link')
      favicon.rel = 'icon'
      favicon.type = 'image/png'
      favicon.setAttribute('data-horizon-favicon', 'true')
      document.head.appendChild(favicon)
    }

    favicon.href = href
  }, [colorMode])

  return null
}

export default BrandFaviconSync
