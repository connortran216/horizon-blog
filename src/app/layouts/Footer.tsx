/**
 * The site footer, on the design system.
 *
 * It was the one surface in the app where light mode was not on the token
 * system at all. Every colour came from a `useColorModeValue` pair whose halves
 * belonged to different systems:
 *
 *   useColorModeValue('gray.50',  'bg.secondary')
 *   useColorModeValue('gray.700', 'text.secondary')
 *   useColorModeValue('black',    'text.primary')
 *
 * Light took Chakra's stock grey ramp; dark took Horizon roles, and those by
 * their *legacy alias* names from the compatibility bridge rather than the v2
 * roles the bridge forwards to. So this file would have broken the moment the
 * bridge came out in release M8. Semantic tokens already carry both themes, so
 * the pairs are gone rather than corrected - there is nothing left to pair.
 *
 * Two behaviours were broken and are fixed here:
 *
 * - **The social icons went nowhere.** Three `IconButton`s with a label and no
 *   `href`: a reader clicking the GitHub mark got nothing at all. They are
 *   links now, to the profiles in `SOCIAL_LINKS`.
 * - **The footer navigation left the app.** Its links used `href="/about"`,
 *   which is a full document load - the router, the theme and every cache
 *   thrown away to move between two pages of the same site.
 */

import { Box } from '@chakra-ui/react'
import { FiGithub, FiLinkedin } from 'react-icons/fi'

import { ActionLink, ContentContainer, Stack, Text } from '../../design-system'
import { componentTokens, space } from '../../theme/tokens'
import { SITE_LINKS, SOCIAL_LINKS } from './nav-links'

const icons = { GitHub: FiGithub, LinkedIn: FiLinkedin } as const

const Footer = () => {
  return (
    <Box
      as="footer"
      className="app-footer"
      bg="bg.surface"
      color="text.secondary"
      borderTop="1px solid"
      borderColor="border.subtle"
    >
      <ContentContainer>
        <Stack gap={4} alignItems="center" paddingBlock={space[8]}>
          <Stack as="nav" aria-label="Footer" direction="row" gap={6} flexWrap="wrap">
            {SITE_LINKS.map((link) => (
              <ActionLink
                key={link.path}
                to={link.path}
                underline="hover"
                color="text.secondary"
                /*
                 * A standalone call to action, not a word inside a sentence, so
                 * it takes the system's own 44px floor. `ActionLink` applies
                 * that sizing only at button weight, which leaves every text
                 * weight used this way at the height of its line box - 26px
                 * here. See `horizon-blog-7et`, which is the same defect
                 * everywhere else on the site.
                 */
                minH={componentTokens.control.minTouchTarget}
                alignItems="center"
                /*
                 * The same inline padding `NavItem` gives a header link, so a
                 * short word reaches the floor in both dimensions: "Blog" is
                 * 35px of text and would otherwise be a 35px-wide target.
                 * Padding rather than `minWidth`, so the box grows around the
                 * word instead of leaving it adrift in a fixed one.
                 */
                paddingInline={space[3]}
              >
                {link.name}
              </ActionLink>
            ))}
          </Stack>

          <Stack direction="row" gap={4}>
            {SOCIAL_LINKS.map((social) => {
              const Icon = icons[social.name]

              return (
                <ActionLink
                  key={social.name}
                  href={social.href}
                  // The label is an icon, so there is no text for an underline
                  // to sit under; the colour shift on hover is the whole state.
                  underline="hover"
                  color="text.secondary"
                  aria-label={social.name}
                  minH="44px"
                  minW="44px"
                  justifyContent="center"
                  _hover={{ color: 'text.primary' }}
                >
                  <Icon aria-hidden="true" />
                </ActionLink>
              )
            })}
          </Stack>

          <Text recipe="metadata">© {new Date().getFullYear()} Horizon. All rights reserved</Text>
        </Stack>
      </ContentContainer>
    </Box>
  )
}

export default Footer
