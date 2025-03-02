import { Box, Container, Flex } from '@chakra-ui/react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Flex minH="100vh" direction="column">
      <Navbar />
      <Container maxW="container.xl" flex="1" py={8}>
        <Box as="main">{children}</Box>
      </Container>
      <Footer />
    </Flex>
  );
};

export default Layout; 