/**
 * The share menu.
 *
 * Deliberately not the design system's `ShareAction`, and the reason belongs in
 * the file rather than in a review comment. `ShareAction` owns navigation and
 * the clipboard itself and treats `onShare` as an analytics notification;
 * `useReaderInteractions.share(method)` owns all three - it opens the share
 * window, writes the clipboard, raises the toast and records the event. Wiring
 * one to the other would open every social target twice, and the alternative -
 * splitting the hook - is a behaviour change this release does not make.
 *
 * So the destinations come from the design system's `shareTargets`, the trigger
 * is the system's `Button`, the surface uses the overlay role tokens, and the
 * feature keeps the single `onShare` contract the hook exposes. Reported as a
 * design-system gap.
 */

import { Menu, MenuButton, MenuItem, MenuList, Portal } from '@chakra-ui/react'
import { FiShare2 } from 'react-icons/fi'
import type { ElementType } from 'react'

import { Button, shareTargets } from '../../../design-system'
import { componentTokens, radii, space } from '../../../theme/tokens'
import { ReaderShareMethod } from '../reader-interactions.types'

interface ShareButtonProps {
  isLoading?: boolean
  onShare: (method: ReaderShareMethod) => void
}

/**
 * Chakra's polymorphic `as` cannot infer the props of a component whose own
 * props narrow Chakra's - `Button` omits `variant` and `size` on purpose - so
 * the trigger is widened the same way `ShareAction` widens it.
 */
const ShareTrigger: ElementType = Button

const ShareButton = ({ isLoading = false, onShare }: ShareButtonProps) => (
  <Menu placement="top" isLazy>
    <MenuButton
      as={ShareTrigger}
      tone="quiet"
      isLoading={isLoading}
      loadingLabel="Opening the share options"
      iconStart={<FiShare2 aria-hidden="true" />}
      aria-label="Share this blog"
    >
      Share
    </MenuButton>
    <Portal>
      <MenuList
        bg={componentTokens.overlay.bg}
        borderColor={componentTokens.overlay.border}
        borderRadius={componentTokens.overlay.radius}
        paddingBlock={space[2]}
      >
        {shareTargets().map((target) => (
          <MenuItem
            key={target.method}
            bg="transparent"
            color="text.primary"
            minH={componentTokens.control.minTouchTarget}
            borderRadius={radii.control}
            _hover={{ bg: componentTokens.control.quietHoverBg }}
            _focus={{ bg: componentTokens.control.quietHoverBg }}
            onClick={() => onShare(target.method)}
          >
            {target.label}
          </MenuItem>
        ))}
      </MenuList>
    </Portal>
  </Menu>
)

export default ShareButton
