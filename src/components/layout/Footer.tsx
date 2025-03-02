import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  useColorModeValue,
  IconButton,
} from '@chakra-ui/react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
    >
      <Container
        as={Stack}
        maxW="container.xl"
        py={4}
        spacing={4}
        justify="center"
        align="center"
      >
        <Stack direction="row" spacing={6}>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
        </Stack>
        
        <Stack direction="row" spacing={6}>
          <IconButton
            aria-label="GitHub"
            icon={<FaGithub />}
            size="md"
            color="current"
            variant="ghost"
          />
          <IconButton
            aria-label="Twitter"
            icon={<FaTwitter />}
            size="md"
            color="current"
            variant="ghost"
          />
          <IconButton
            aria-label="LinkedIn"
            icon={<FaLinkedin />}
            size="md"
            color="current"
            variant="ghost"
          />
        </Stack>
        
        <Text>© {new Date().getFullYear()} Horizon. All rights reserved</Text>
      </Container>
    </Box>
  );
};

export default Footer; 