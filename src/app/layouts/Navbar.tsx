/**
 * The site header, on the design system.
 *
 * Everything visual here comes from `componentTokens.header`, which the system
 * has always defined and nothing ever used: the bar's fill, its border, its two
 * heights, and the rest/active/hover colours that `NavItem` reads. The bar was
 * previously a `Glassmorphism` wrapper around raw Chakra, so the one component
 * every reader sees on every route was the one component still on the old
 * system.
 *
 * Three behaviours changed, and each was a defect rather than a preference:
 *
 * - **The current page is now marked.** `NavItem` renders React Router's
 *   `NavLink`, which writes `aria-current="page"` itself. The old
 *   `NavLinkButton` was a plain `Button` inside a `Link` and marked nothing, so
 *   the navigation never said where you were.
 * - **Sign in is a link, not a button inside one.** It used to be
 *   `<RouterLink><AnimatedPrimaryButton>`, which nests an interactive control
 *   inside another - two tab stops for one destination, and invalid HTML.
 *   `ActionLink` at primary weight is a real `a` wearing the Button recipe.
 * - **The theme toggle is available to everyone.** It used to live inside
 *   `UserMenu`, which only renders for a signed-in user, so a reader who was
 *   not signed in could not switch to dark at all.
 */

import { useEffect, useState } from 'react'
import { Box, Flex, useDisclosure, useToast } from '@chakra-ui/react'
import { FiMenu, FiX } from 'react-icons/fi'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'

import {
  ActionLink,
  Button,
  ContentContainer,
  IconButton,
  NavItem,
  Reveal,
  Stack,
  ThemeToggle,
} from '../../design-system'
import { componentTokens, layout, space } from '../../theme/tokens'
import { useAuth } from '../../context/AuthContext'
import { getBlogService, toPublicPostPath } from '../../core'
import BrandLogo from '../../components/ui/BrandLogo'
import '../../features/editor/editor.window'
import UserMenu from './UserMenu'
import { SITE_LINKS } from './nav-links'
import { can } from '../../core/authorization/authorization'

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isEditorPage = location.pathname === '/blog-editor'
  const toast = useToast()
  const [editorState, setEditorState] = useState<{
    title: string
    content_markdown: string
    handlePublish?: () => Promise<boolean>
  }>({ title: '', content_markdown: '' })
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const canWrite = can(user?.authorization, 'content:manage:own')

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

  const handleLogout = async () => {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)
    try {
      const result = await logout()
      if (!result.serverRevoked) {
        toast({
          title: 'Signed out on this tab',
          description:
            'Server revocation could not be confirmed. Sign in again only after checking your connection.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        })
      }
      navigate('/')
    } finally {
      setIsLoggingOut(false)
    }
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

    try {
      const post = await getBlogService().publishPost(null, {
        title: editorState.title.trim(),
        content_markdown: editorState.content_markdown,
        content_json: '{}',
      })

      toast({
        title: 'Success',
        description: 'Your blog is now live.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      const { particleSystem } = await import('../../components/core/animations/ParticleSystem')
      particleSystem.showSuccessParticles()
      navigate(toPublicPostPath(post.id))
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
    <Box
      as="header"
      className="app-navbar"
      position="sticky"
      top={0}
      /*
       * Chakra's own `sticky` step. The bar used to write `zIndex={1000}`, which
       * sits above the toast layer and below nothing in particular; the named
       * step keeps it under `AppFrame`'s skip link, which has to stay reachable
       * over the header it skips past.
       */
      zIndex="sticky"
      bg={componentTokens.header.bg}
      borderBottom="1px solid"
      borderColor={componentTokens.header.border}
    >
      <ContentContainer>
        <Flex
          minH={{ base: layout.header.mobile, sm: layout.header.desktop }}
          alignItems="center"
          justifyContent="space-between"
          gap={space[4]}
        >
          <Reveal trigger="mount">
            <Flex alignItems="center" gap={{ base: space[4], sm: space[8] }} minW={0}>
              <IconButton
                label={isOpen ? 'Close menu' : 'Open menu'}
                tone="quiet"
                icon={isOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
                display={{ sm: 'none' }}
                onClick={onToggle}
                aria-expanded={isOpen}
                aria-controls="site-navigation-mobile"
              />

              <Box
                as={RouterLink}
                to="/"
                aria-label="Horizon home"
                display="inline-flex"
                alignItems="center"
                lineHeight="0"
                flexShrink={0}
                // The wordmark is 38px tall on its own; the link around it is a
                // target like any other and takes the system's 44px floor.
                minH={componentTokens.control.minTouchTarget}
              >
                <BrandLogo variant="icon" display={{ base: 'block', sm: 'none' }} />
                <BrandLogo variant="full" display={{ base: 'none', sm: 'block' }} />
              </Box>

              <Flex
                as="nav"
                aria-label="Site"
                gap={space[1]}
                display={{ base: 'none', sm: 'flex' }}
              >
                {SITE_LINKS.map((link) => (
                  <NavItem key={link.path} to={link.path}>
                    {link.name}
                  </NavItem>
                ))}
              </Flex>
            </Flex>
          </Reveal>

          <Reveal trigger="mount" delay={0.1}>
            <Flex alignItems="center" gap={space[3]}>
              <ThemeToggle />

              {user && canWrite && !isEditorPage ? (
                <NavItem to="/blog-editor">Write</NavItem>
              ) : null}

              {user && canWrite && isEditorPage ? (
                <Button tone="primary" onClick={handlePublish}>
                  Publish
                </Button>
              ) : null}

              {user ? (
                <UserMenu user={user} onLogout={handleLogout} isLoggingOut={isLoggingOut} />
              ) : (
                <ActionLink to="/login" weight="primary">
                  Sign in
                </ActionLink>
              )}
            </Flex>
          </Reveal>
        </Flex>

        {isOpen ? (
          <Box id="site-navigation-mobile" pb={space[4]} display={{ sm: 'none' }}>
            <Stack as="nav" aria-label="Site" gap={1}>
              {SITE_LINKS.map((link) => (
                <NavItem key={link.path} to={link.path} onClick={onToggle} justifyContent="start">
                  {link.name}
                </NavItem>
              ))}
            </Stack>
          </Box>
        ) : null}
      </ContentContainer>
    </Box>
  )
}

export default Navbar
