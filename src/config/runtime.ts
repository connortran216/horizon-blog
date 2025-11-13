/**
 * Runtime configuration that determines values based on the current environment
 * This allows the app to work correctly in both development and production
 * without relying on build-time environment variables
 */

export const getRuntimeConfig = () => {
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === ''

  return {
    beHost: isLocalhost ? 'http://localhost:8080' : 'https://blog-api.connortran.io.vn',
  }
}
