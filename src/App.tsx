import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { BrowserRouter as Router, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Routes from './Routes'
import AppLayout from './app/layouts/AppLayout'
import ClientSeoSync from './components/seo/ClientSeoSync'
import BrandFaviconSync from './components/ui/BrandFaviconSync'
import { themeForPath } from './theme/route-theme'

function ThemedApp() {
  const { pathname } = useLocation()
  const theme = themeForPath(pathname)
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <BrandFaviconSync />
        <AuthProvider>
          <ClientSeoSync />
          <AppLayout>
            <Routes />
          </AppLayout>
        </AuthProvider>
      </ChakraProvider>
    </>
  )
}

function App() {
  return (
    <Router>
      <ThemedApp />
    </Router>
  )
}

export default App
