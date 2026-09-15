/**
 * Whether the browser currently has a connection.
 *
 * This exists because "Save failed" is the wrong thing to tell an author whose
 * wifi dropped: it reads as a problem with their draft, it invites them to
 * retry into the same void, and it does not say that the browser copy is still
 * there. `AutosaveState` already has an offline state with the right words; it
 * just needs to be told.
 *
 * It changes nothing about saving. No timer moves, no request is withheld, and
 * `useAutoSave` neither knows nor cares that this hook exists - its own retry
 * behaviour is unchanged. The only thing that depends on this value is what the
 * indicator says.
 */

import { useEffect, useState } from 'react'

/**
 * `navigator.onLine` is only trustworthy when it is `false`: a browser that
 * says it is online may still be behind a captive portal. Treating anything
 * other than an explicit `false` as connected keeps this from claiming an
 * outage that is not there, and keeps it correct where `navigator` is absent.
 */
const readIsOffline = (): boolean => typeof navigator !== 'undefined' && navigator.onLine === false

export function useConnectionStatus(): boolean {
  const [isOffline, setIsOffline] = useState(readIsOffline)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    // The connection can drop between the first render and this effect.
    setIsOffline(readIsOffline())

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOffline
}
