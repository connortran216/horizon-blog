/**
 * Horizon Design System v2 - a fenced code block.
 *
 * The frame around code somebody else highlighted. Prism keeps producing the
 * spans; this owns the header, the copy affordance, the local scroll and what
 * happens when the clipboard says no.
 *
 * Copying can fail for reasons the reader cannot fix - an insecure origin, a
 * denied permission, a browser with no clipboard API - so the failure is a real
 * announced state that tells them to select the text instead, not a silent
 * no-op. The confirmation clears when the pointer leaves or focus moves on,
 * because the token source has no confirmation-hold duration and inventing one
 * here would be a raw design value.
 */

import { useEffect, useReducer, useRef, type ReactNode } from 'react'
import { Box, VisuallyHidden, type BoxProps } from '@chakra-ui/react'
import { FiCheck, FiCopy } from 'react-icons/fi'

import { componentTokens, radii, space } from '../../../theme/tokens'
import { Button } from '../../components/actions'
import { Text } from '../../components/typography'
import { createDisposerBag, guardAsync } from '../../motion'
import {
  chakraColorVar,
  codeLanguageLabel,
  codeTextStyle,
  copyAnnouncement,
  copyIsBusy,
  copyLabel,
  copyLiveRegion,
  copyReducer,
  idleCopyState,
  localScrollStyle,
  scrollAffordanceStyle,
  scrollFadeStyle,
  syncScrollFade,
  watchScrollFade,
  type ScrollFadeTarget,
} from './code.logic'

export interface CodeBlockProps extends Omit<BoxProps, 'children' | 'onCopy'> {
  /** The already-highlighted markup. Rendered inside this frame's own `pre`. */
  children: ReactNode
  /** `ts`, `language-ts`, or nothing. Shown above the block. */
  language?: string | null
  /**
   * The plain text to copy. Omit to hide the copy control entirely - a frame
   * with no source text has nothing to put on the clipboard, and a button that
   * copies an empty string is worse than no button.
   */
  code?: string | null
  /**
   * Injected clipboard, so the copy path can be driven from outside the
   * browser. Defaults to `navigator.clipboard`.
   */
  writeToClipboard?: (text: string) => Promise<void>
}

/**
 * The visible signal that this frame's own `pre` scrolls. See
 * `scrollAffordanceStyle` - `card.border` is the same divider colour the
 * frame's own outer border already uses.
 */
const scrollAffordance = scrollAffordanceStyle({
  thumb: chakraColorVar(componentTokens.card.border),
})

/**
 * The fade for this frame's own `pre`. Matched to `reader.codeBg`, the same
 * background the frame's outer surface already paints - see `scrollFadeStyle`
 * for why the colour has to match what it sits on.
 */
const scrollEdgeFade = scrollFadeStyle({
  background: chakraColorVar(componentTokens.reader.codeBg),
})

const defaultClipboard = (text: string): Promise<void> => {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return Promise.reject(new Error('This browser has no clipboard API.'))
  }

  return navigator.clipboard.writeText(text)
}

export function CodeBlock({
  children,
  language,
  code,
  writeToClipboard = defaultClipboard,
  ...rest
}: CodeBlockProps) {
  const [copy, dispatch] = useReducer(copyReducer, idleCopyState)
  const bagRef = useRef(createDisposerBag())
  const preRef = useRef<HTMLPreElement | null>(null)

  // One bag for the component's whole life: a clipboard promise that settles
  // after unmount is ignored rather than setting state on a gone component.
  useEffect(() => {
    const bag = bagRef.current

    return () => bag.dispose()
  }, [])

  /*
   * This frame's own `pre` is never adopted by `Prose`'s sweep - see
   * `isOwnedCodeBlockFrame` there - so it keeps its own fade current here.
   * Re-run when the highlighted markup changes: new `children` can change how
   * much the block overflows without ever firing a `scroll` event, and a
   * `ResizeObserver` catches the same case for a resize of the frame itself.
   */
  useEffect(() => {
    const pre = preRef.current

    if (!pre || typeof window === 'undefined') {
      return
    }

    const target = pre as unknown as ScrollFadeTarget
    const stopWatching = watchScrollFade(target)

    if (typeof ResizeObserver === 'undefined') {
      return stopWatching
    }

    const resize = new ResizeObserver(() => syncScrollFade(target))
    resize.observe(pre)

    return () => {
      stopWatching()
      resize.disconnect()
    }
  }, [children])

  const handleCopy = () => {
    if (!code || copyIsBusy(copy.status)) {
      return
    }

    dispatch({ type: 'copy' })
    bagRef.current.add(
      guardAsync(writeToClipboard(code), {
        onResolved: () => dispatch({ type: 'succeeded' }),
        onRejected: () => dispatch({ type: 'failed' }),
      }),
    )
  }

  const reset = () => dispatch({ type: 'reset' })
  const announcement = copyAnnouncement(copy.status)
  const live = copyLiveRegion(copy.status)

  return (
    <Box
      borderWidth="1px"
      borderStyle="solid"
      borderColor={componentTokens.card.border}
      borderRadius={radii.card}
      bg={componentTokens.reader.codeBg}
      overflow="hidden"
      marginBlock={space[6]}
      onPointerLeave={reset}
      onBlurCapture={reset}
      {...rest}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={space[3]}
        paddingInline={space[4]}
        paddingBlock={space[2]}
        borderBottomWidth="1px"
        borderBottomStyle="solid"
        borderBottomColor={componentTokens.card.border}
      >
        <Text as="span" recipe="metadata">
          {codeLanguageLabel(language)}
        </Text>

        {code ? (
          <Button
            tone="quiet"
            size="sm"
            onClick={handleCopy}
            isLoading={copyIsBusy(copy.status)}
            loadingLabel="Copying the code"
            iconStart={
              copy.status === 'copied' ? (
                <FiCheck aria-hidden="true" />
              ) : (
                <FiCopy aria-hidden="true" />
              )
            }
          >
            {copyLabel(copy.status)}
          </Button>
        ) : null}
      </Box>

      <Box
        as="pre"
        ref={preRef}
        tabIndex={0}
        /*
         * A scroll container has to be focusable or a keyboard-only reader
         * cannot scroll a wide block at all. `role="group"` plus a name is what
         * stops a screen reader announcing a bare focusable region.
         */
        role="group"
        aria-label={`${codeLanguageLabel(language)} code block`}
        margin={0}
        padding={space[4]}
        {...codeTextStyle}
        sx={{ ...localScrollStyle(), ...scrollAffordance, ...scrollEdgeFade }}
      >
        {children}
      </Box>

      {announcement ? (
        <VisuallyHidden role={live.role} aria-live={live['aria-live']}>
          {announcement}
        </VisuallyHidden>
      ) : null}
    </Box>
  )
}
