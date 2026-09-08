import signal from './index'
import legacy from './legacy'

// Expand this explicit allowlist only when the corresponding release is validated.
export const themeForPath = (pathname: string) => (pathname === '/' ? signal : legacy)
