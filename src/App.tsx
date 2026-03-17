import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AccessibilityProvider } from './core'
import Routes from './Routes'
import AppLayout from './app/layouts/AppLayout'
import theme from './theme'

function App() {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <AccessibilityProvider enablePanel={true}>
          <AuthProvider>
            <Router>
              <AppLayout>
                <Routes />
              </AppLayout>
            </Router>
          </AuthProvider>
        </AccessibilityProvider>
      </ChakraProvider>
    </>
  )
}

export default App
