import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Flex,
  HStack,
  IconButton,
  Stack,
  useColorMode,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { CloseIcon, HamburgerIcon } from '@chakra-ui/icons'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getBlogRepository } from '../../core/di/container'
import { AnimatedPrimaryButton } from '../../components/core/animations/AnimatedButton'
import { Glassmorphism } from '../../components/core/animations/Glassmorphism'
import { MotionWrapper } from '../../components/core/animations/MotionWrapper'
import '../../features/editor/editor.window'
import NavLinkButton from './NavLinkButton'
import UserMenu from './UserMenu'
import { SITE_LINKS } from './nav-links'

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure()
  const { user, logout } = useAuth()
  const { colorMode, toggleColorMode } = useColorMode()
  const navigate = useNavigate()
  const location = useLocation()
  const isEditorPage = location.pathname === '/blog-editor'
  const toast = useToast()
  const [editorState, setEditorState] = useState<{
    title: string
    content_markdown: string
    handlePublish?: () => Promise<boolean>
  }>({ title: '', content_markdown: '' })

  useEffect(() => {
    const checkEditorState = () => {
      if (window.editorState) {
        setEditorState(window.editorState)
      }
    }

    checkEditorState()
    const interval = setInterval(checkEditorState, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handlePublish = async () => {
    if (editorState.handlePublish) {
      await editorState.handlePublish()
      return
    }

    if (!editorState.title?.trim()) {
      toast({
        title: 'Error',
        description: 'Title is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const slug = editorState.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    try {
      const result = await getBlogRepository().createPost({
        title: editorState.title.trim(),
        content_markdown: editorState.content_markdown,
        content_json: '{}',
        slug,
        author: {
          username: user?.username || 'Anonymous',
          avatar: user?.avatar,
        },
        status: 'published',
      })

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to save blog post')
      }

      toast({
        title: 'Success',
        description: 'Your blog is now live.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      const { particleSystem } = await import('../../components/core/animations/ParticleSystem')
      particleSystem.showSuccessParticles()
      navigate(`/blog/${result.data.id}`)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to publish your story. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Glassmorphism
      px={4}
      intensity="light"
      position="sticky"
      top={0}
      zIndex={1000}
      backdropFilter="blur(20px)"
    >
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <MotionWrapper variant="fadeInLeft" delay={0.1}>
            <IconButton
              size="md"
              icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
              aria-label="Open Menu"
              display={{ md: 'none' }}
              onClick={onToggle}
            />
          </MotionWrapper>

          <MotionWrapper variant="fadeInUp" delay={0.2}>
            <HStack spacing={8} alignItems="center">
              <Box fontWeight="bold" fontSize="xl">
                <RouterLink to="/">Horizon</RouterLink>
              </Box>
              <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
                {SITE_LINKS.map((link, index) => (
                  <MotionWrapper key={link.path} variant="fadeInUp" delay={0.3 + index * 0.1}>
                    <NavLinkButton to={link.path}>{link.name}</NavLinkButton>
                  </MotionWrapper>
                ))}
              </HStack>
            </HStack>
          </MotionWrapper>

          <MotionWrapper variant="fadeInRight" delay={0.4}>
            <Flex alignItems="center" gap={4}>
              {user && !isEditorPage ? (
                <NavLinkButton to="/blog-editor">Write</NavLinkButton>
              ) : null}
              {user && isEditorPage ? (
                <AnimatedPrimaryButton onClick={handlePublish} mr={2}>
                  Publish
                </AnimatedPrimaryButton>
              ) : null}
              {user ? (
                <UserMenu
                  user={user}
                  colorMode={colorMode}
                  onToggleColorMode={toggleColorMode}
                  onLogout={handleLogout}
                />
              ) : (
                <RouterLink to="/login">
                  <AnimatedPrimaryButton>Sign in</AnimatedPrimaryButton>
                </RouterLink>
              )}
            </Flex>
          </MotionWrapper>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as="nav" spacing={4}>
              {SITE_LINKS.map((link) => (
                <NavLinkButton key={link.path} to={link.path}>
                  {link.name}
                </NavLinkButton>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Container>
    </Glassmorphism>
  )
}

export default Navbar
