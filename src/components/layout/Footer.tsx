import { Box, Container, Stack, Text, Link, useColorModeValue, IconButton } from '@chakra-ui/react'
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa'

const Footer = () => {
  const footerBg = useColorModeValue('gray.50', 'bg.secondary')
  const textColor = useColorModeValue('gray.700', 'text.secondary')
  const linkColor = useColorModeValue('gray.700', 'text.secondary')
  const linkHoverColor = useColorModeValue('black', 'text.primary')

  return (
    <Box bg={footerBg} color={textColor} borderTop="1px" borderColor="border.subtle">
      <Container as={Stack} maxW="container.xl" py={4} spacing={4} justify="center" align="center">
        <Stack direction="row" spacing={6}>
          <Link href="/" color={linkColor} _hover={{ color: linkHoverColor }}>
            Home
          </Link>
          <Link href="/about" color={linkColor} _hover={{ color: linkHoverColor }}>
            About
          </Link>
          <Link href="/blog" color={linkColor} _hover={{ color: linkHoverColor }}>
            Blog
          </Link>
          <Link href="/contact" color={linkColor} _hover={{ color: linkHoverColor }}>
            Contact
          </Link>
        </Stack>

        <Stack direction="row" spacing={6}>
          <IconButton
            aria-label="GitHub"
            icon={<FaGithub />}
            size="md"
            color={linkColor}
            variant="ghost"
            _hover={{ color: linkHoverColor, bg: 'bg.tertiary' }}
          />
          <IconButton
            aria-label="Twitter"
            icon={<FaTwitter />}
            size="md"
            color={linkColor}
            variant="ghost"
            _hover={{ color: linkHoverColor, bg: 'bg.tertiary' }}
          />
          <IconButton
            aria-label="LinkedIn"
            icon={<FaLinkedin />}
            size="md"
            color={linkColor}
            variant="ghost"
            _hover={{ color: linkHoverColor, bg: 'bg.tertiary' }}
          />
        </Stack>

        <Text color={textColor}>© {new Date().getFullYear()} Horizon. All rights reserved</Text>
      </Container>
    </Box>
  )
}

export default Footer
