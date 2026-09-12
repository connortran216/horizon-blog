/**
 * Horizon Design System v2 - sharing a blog.
 *
 * A menu of destinations. The three networks are real links with real hrefs, so
 * middle-click and open-in-new-tab work and a reader can see where they lead;
 * only "Copy the link" is a button, because it is the only one that acts on
 * this page rather than leaving it.
 *
 * Copy success and copy failure are both announced. A clipboard write can be
 * refused - insecure origin, denied permission, no clipboard API - and a share
 * control that silently does nothing is the version of this component that
 * reaches production and never gets reported.
 */

import { useEffect, useReducer, useRef, type ElementType } from 'react'
import {
  Box,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  VisuallyHidden,
  type BoxProps,
} from '@chakra-ui/react'
import { FiShare2 } from 'react-icons/fi'

import { componentTokens, radii, space } from '../../../theme/tokens'
import { Button } from '../../components/actions'
import { createDisposerBag, guardAsync } from '../../motion'
import {
  idleShareState,
  shareAnnouncement,
  shareHref,
  shareLiveRegion,
  shareReducer,
  shareTargets,
  type ShareMethod,
} from './reaction.logic'

export interface ShareActionProps extends Omit<BoxProps, 'children' | 'onSelect'> {
  /** The blog's absolute URL. */
  url: string
  /** The blog's title, used as the share text. */
  title: string
  /** Told which method was used, for the analytics contract the API expects. */
  onShare?: (method: ShareMethod) => void
  writeToClipboard?: (text: string) => Promise<void>
  label?: string
}

/**
 * The trigger is the system's own `Button`, so the menu opens from a real
 * `button` with the system's focus ring and touch target.
 *
 * It is widened to `ElementType` because Chakra's polymorphic `as` cannot infer
 * the props of a component whose own props narrow Chakra's - `Button` omits
 * `variant` and `size` on purpose - and the alternative is either an unsafe
 * cast or a second, hand-styled trigger that would drift from the primitive.
 */
const ShareTrigger: ElementType = Button

const defaultClipboard = (text: string): Promise<void> => {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return Promise.reject(new Error('This browser has no clipboard API.'))
  }

  return navigator.clipboard.writeText(text)
}

export function ShareAction({
  url,
  title,
  onShare,
  writeToClipboard = defaultClipboard,
  label = 'Share this blog',
  ...rest
}: ShareActionProps) {
  const [share, dispatch] = useReducer(shareReducer, idleShareState)
  const bagRef = useRef(createDisposerBag())

  useEffect(() => {
    const bag = bagRef.current

    return () => bag.dispose()
  }, [])

  const copyLink = () => {
    dispatch({ type: 'copy' })
    onShare?.('copy_link')
    bagRef.current.add(
      guardAsync(writeToClipboard(url), {
        onResolved: () => dispatch({ type: 'succeeded' }),
        onRejected: () => dispatch({ type: 'failed' }),
      }),
    )
  }

  const announcement = shareAnnouncement(share.status)
  const live = shareLiveRegion(share.status)

  return (
    <Box display="inline-flex" alignItems="center" {...rest}>
      <Menu placement="top" isLazy>
        <MenuButton
          as={ShareTrigger}
          tone="quiet"
          iconStart={<FiShare2 aria-hidden="true" />}
          aria-label={label}
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
            {shareTargets().map((target) => {
              const href = shareHref(target.method, url, title)

              if (target.isLocal || !href) {
                return (
                  <MenuItem
                    key={target.method}
                    onClick={copyLink}
                    bg="transparent"
                    color="text.primary"
                    minH={componentTokens.control.minTouchTarget}
                    borderRadius={radii.control}
                    _hover={{ bg: componentTokens.control.quietHoverBg }}
                    _focus={{ bg: componentTokens.control.quietHoverBg }}
                  >
                    {target.label}
                  </MenuItem>
                )
              }

              return (
                <MenuItem
                  key={target.method}
                  as="a"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onShare?.(target.method)}
                  bg="transparent"
                  color="text.primary"
                  minH={componentTokens.control.minTouchTarget}
                  borderRadius={radii.control}
                  _hover={{ bg: componentTokens.control.quietHoverBg }}
                  _focus={{ bg: componentTokens.control.quietHoverBg }}
                >
                  {target.label}
                  <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
                </MenuItem>
              )
            })}
          </MenuList>
        </Portal>
      </Menu>

      {announcement ? (
        <VisuallyHidden role={live.role} aria-live={live['aria-live']}>
          {announcement}
        </VisuallyHidden>
      ) : null}
    </Box>
  )
}
