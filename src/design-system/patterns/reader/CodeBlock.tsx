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
  codeLanguageLabel,
  copyAnnouncement,
  copyIsBusy,
  copyLabel,
  copyLiveRegion,
  copyReducer,
  idleCopyState,
  localScrollStyle,
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

  // One bag for the component's whole life: a clipboard promise that settles
  // after unmount is ignored rather than setting state on a gone component.
  useEffect(() => {
    const bag = bagRef.current

    return () => bag.dispose()
  }, [])

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
        fontFamily="mono"
        textStyle="meta"
        sx={localScrollStyle()}
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
