import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Routes from './Routes'
import AppLayout from './app/layouts/AppLayout'
import ClientSeoSync from './components/seo/ClientSeoSync'
import BrandFaviconSync from './components/ui/BrandFaviconSync'
/*
 * Release M1: the app mounts the v2 theme. The legacy theme still exists for the
 * compatibility bridge's sake and is deleted in M8 (`horizon-blog-y2e.9.1`),
 * once no page reads a legacy token name any more.
 */
import theme from './theme/horizon'

function App() {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <BrandFaviconSync />
        <AuthProvider>
          <Router>
            <ClientSeoSync />
            <AppLayout>
              <Routes />
            </AppLayout>
          </Router>
        </AuthProvider>
      </ChakraProvider>
    </>
  )
}

export default App
