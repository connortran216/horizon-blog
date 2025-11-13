import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Routes from './Routes'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import theme from './theme'

function App() {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <Router>
            <Navbar />
            <Routes />
            <Footer />
          </Router>
        </AuthProvider>
      </ChakraProvider>
    </>
  )
}

export default App
