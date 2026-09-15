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

import { useEffect, useRef, useState } from 'react'
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
import { shouldCloseOnKey } from './navbar.logic'

const Navbar = () => {
  const { isOpen, onToggle, onClose } = useDisclosure()
  const menuTriggerRef = useRef<HTMLButtonElement>(null)
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

  useEffect(() => {
    // Only bound while the mobile menu is open, and torn down on close or
    // unmount: a listener that outlived the menu would still be reachable
    // (harmless in this handler, but the wrong lifecycle to build on) and
    // would keep the check running on every keystroke for no reason.
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldCloseOnKey(event.key, isOpen)) {
        onClose()
        // Escape must hand focus back to the trigger it came from - the
        // "predictable focus" half of US4 AC5 - rather than letting it fall
        // to the document body.
        menuTriggerRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

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
      <ContentContainer
        /*
         * B-1 (specs/021-contact-editorial-letter): at 320 the brand mark was
         * already on its icon-only variant (32px) below `sm`, and "Sign in"
         * still measured 66x44 across two lines - its natural single-line
         * box needs 85px (52.6px of text plus the control's 16px/side
         * padding) but only 66px was left after the menu button, the brand
         * icon, and the two-button theme toggle (44+44px plus its own
         * padding). The icon-only brand mark (tried first, per plan section
         * 4) was not enough on its own, and one token step of gutter
         * (16px -> 12px, +8px total) still falls 11px short. Dropping the
         * header's own side gutter to `space[1]` (4px) at the narrowest
         * width - a local override, not a change to `containerGutter` - frees
         * 24px, landing "Sign in" at ~90px with a real margin instead of a
         * one-pixel one. `sm` and up keep the system's normal 24px gutter.
         */
        px={{ base: space[1], sm: space[6] }}
      >
        <Flex
          minH={{ base: layout.header.mobile, sm: layout.header.desktop }}
          alignItems="center"
          justifyContent="space-between"
          gap={space[4]}
        >
          <Reveal trigger="mount">
            <Flex alignItems="center" gap={{ base: space[4], sm: space[8] }} minW={0}>
              <IconButton
                ref={menuTriggerRef}
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
                justifyContent="center"
                lineHeight="0"
                flexShrink={0}
                // The wordmark is 38px tall on its own; the link around it is a
                // target like any other and takes the system's 44px floor.
                minH={componentTokens.control.minTouchTarget}
                /*
                 * B-2 (specs/021-contact-editorial-letter): below `sm` the icon
                 * variant is a 32px square (`BrandLogo`'s own `icon` dimensions),
                 * short of the 44px width the control contract asks for (RR-006;
                 * measured 32x44 before this fix). `minW` gives the link a real
                 * 44px hit area; the matching `-6px` margin (half of the 12px
                 * gap between 32 and 44) keeps that hit area from also widening
                 * the header's flex layout, so it does not eat into the room B-1
                 * needs for "Sign in" - the icon renders at the same visual spot,
                 * just with its click target bleeding into the surrounding gaps.
                 * `sm` and up show the full wordmark, already well past 44px, so
                 * neither override applies there.
                 */
                minW={{ base: componentTokens.control.minTouchTarget, sm: 'auto' }}
                mx={{ base: '-6px', sm: 0 }}
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
