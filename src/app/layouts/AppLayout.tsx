import { ReactNode } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import Navbar from './Navbar'
import Footer from './Footer'

interface AppLayoutProps {
  children: ReactNode
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <Flex minH="100vh" direction="column">
      <Navbar />
      <Box as="main" flex="1">
        {children}
      </Box>
      <Footer />
    </Flex>
  )
}

export default AppLayout
