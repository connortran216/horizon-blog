/**
 * Horizon Design System v2 - a diagram inside prose.
 *
 * mermaid keeps drawing the diagram. This owns the frame: a caption, a way to
 * read the source instead, local scroll for a diagram wider than the column,
 * and the failure state.
 *
 * The failure state is the reason this component exists. A diagram that does
 * not render leaves an empty bordered box in the middle of an explanation, and
 * the reader has no way to know whether something was meant to be there. Its
 * source is a description of the diagram, so that is what is shown instead -
 * which also means a reader whose browser blocked the renderer still gets the
 * content.
 */

import { type ReactNode } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'
import { FiCode, FiImage } from 'react-icons/fi'

import { componentTokens, radii, space } from '../../../theme/tokens'
import { Button } from '../../components/actions'
import { Text } from '../../components/typography'
import {
  diagramFailureMessage,
  diagramSourceToggleAvailable,
  diagramView,
  localScrollStyle,
} from './code.logic'

export interface DiagramFrameProps extends Omit<BoxProps, 'children' | 'title'> {
  /** The rendered diagram. Usually an `svg` produced elsewhere. */
  children?: ReactNode
  /** What the diagram shows: "Request flow". Also its accessible name. */
  caption: string
  /** The diagram's own source, shown on failure or on request. */
  source?: string | null
  /** The renderer threw. */
  hasError?: boolean
  /** Controlled: whether the source is being shown instead of the diagram. */
  showSource?: boolean
  onToggleSource?: (next: boolean) => void
  /** A longer text description, for a diagram whose caption is not enough. */
  description?: string
}

export function DiagramFrame({
  children,
  caption,
  source = null,
  hasError = false,
  showSource = false,
  onToggleSource,
  description,
  ...rest
}: DiagramFrameProps) {
  const input = { hasError, showSource, hasSource: Boolean(source) }
  const view = diagramView(input)
  const canToggle = diagramSourceToggleAvailable(input) && onToggleSource !== undefined
  const scroll = localScrollStyle()

  return (
    <Box
      as="figure"
      margin={0}
      marginBlock={space[6]}
      borderWidth="1px"
      borderStyle="solid"
      borderColor={componentTokens.card.border}
      borderRadius={radii.card}
      bg={componentTokens.card.bg}
      overflow="hidden"
      {...rest}
    >
      <Box
        display="flex"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="space-between"
        rowGap={space[2]}
        columnGap={space[3]}
        paddingInline={space[4]}
        paddingBlock={space[2]}
        borderBottomWidth="1px"
        borderBottomStyle="solid"
        borderBottomColor={componentTokens.card.border}
      >
        {/*
         * `minWidth: 0` is the fix, not `flexWrap` alone - a flex item's
         * automatic minimum size is its content's unwrapped width, so
         * without this the caption would rather overflow the row than wrap.
         * With it, a caption too long to sit beside the toggle on one line
         * wraps onto its own line or lines instead of pushing the row wider
         * than the frame; a caption that fits stays exactly where it was,
         * left of the toggle on the same line.
         */}
        <Text as="span" recipe="metadata" minWidth={0}>
          {caption}
        </Text>

        {canToggle ? (
          // The old label repeated the whole caption - "Show the Sample
          // diagram: how a request finds a server source" - which made the
          // toggle itself as wide as the overflow it was supposed to fix, in
          // a button Chakra keeps `white-space: nowrap` by default. Wrapping
          // the row does nothing for a single control that is wider than the
          // frame on its own. The caption still names which diagram this
          // toggles - it is the visible text immediately to this button's
          // left, read together with it - so the short label loses nothing
          // an aria-label doesn't restate for anyone not reading the row
          // visually. `size="md"` (44px - the `sm` a code-block toolbar
          // usually gets, per control.logic.ts, does not clear the touch
          // target) is a local override, same as the aria-label: neither
          // touches the shared Button component.
          <Button
            tone="quiet"
            size="md"
            flexShrink={0}
            aria-label={showSource ? `Show the ${caption} diagram` : `Show the ${caption} source`}
            onClick={() => onToggleSource?.(!showSource)}
            iconStart={showSource ? <FiImage aria-hidden="true" /> : <FiCode aria-hidden="true" />}
          >
            {showSource ? 'Show diagram' : 'Show source'}
          </Button>
        ) : null}
      </Box>

      {hasError ? (
        <Text as="p" recipe="body" role="status" padding={space[4]} paddingBottom={0}>
          {diagramFailureMessage(caption)}
        </Text>
      ) : null}

      {view === 'diagram' ? (
        <Box
          role="img"
          aria-label={description ?? caption}
          padding={space[6]}
          sx={{ ...scroll, '& svg': { maxWidth: '100%', height: 'auto' } }}
        >
          {children}
        </Box>
      ) : (
        <Box
          as="pre"
          tabIndex={0}
          role="group"
          aria-label={`${caption} source`}
          margin={0}
          padding={space[4]}
          fontFamily="mono"
          textStyle="meta"
          bg={componentTokens.reader.codeBg}
          sx={scroll}
        >
          {source}
        </Box>
      )}

      {description ? (
        <Box
          as="figcaption"
          paddingInline={space[4]}
          paddingBottom={space[4]}
          textStyle="meta"
          color={componentTokens.reader.secondaryFg}
        >
          {description}
        </Box>
      ) : null}
    </Box>
  )
}
