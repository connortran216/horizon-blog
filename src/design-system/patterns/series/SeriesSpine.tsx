/**
 * Horizon Design System v2 - one Series, seen by its author.
 *
 * Three columns side by side when there is room: who the Series is (title,
 * description, tally), its spine (one mark per part on a hairline), and the
 * caller's action. The row wraps on its own width, not the viewport's, so in a
 * narrow column the three stack in that order. No surface: the spines sit on the page
 * between rules, the way the profile's other sections do.
 *
 * The spine is a real `ol` - the order is the content - and each mark carries
 * its whole fact in visually hidden text. The marks are not focusable: they are
 * a picture of a list a screen reader already reads, and a row of tab stops
 * that do nothing is worse than none. The light along the line is drawn once,
 * on arrival, and is simply there under reduced motion.
 *
 * `spine.logic.ts` owns every decision; this file only draws them.
 */

import type { ReactNode } from 'react'
import { Box, VisuallyHidden, type BoxProps } from '@chakra-ui/react'
import { motion } from 'framer-motion'

import { componentTokens, space } from '../../../theme/tokens'
import type { HeadingElement } from '../../components/layout'
import { Heading, Text } from '../../components/typography'
import { transitionFor, useMotionPolicy } from '../../motion'
import {
  spineLitExtent,
  spineMarks,
  spineTally,
  spineTrackLabel,
  type SpineMark,
  type SpinePart,
} from './spine.logic'

export interface SeriesSpineProps extends Omit<BoxProps, 'children' | 'title'> {
  title: string
  description?: string | null
  parts: readonly SpinePart[]
  /** A short fact after the tally - "Updated Oct 8". */
  meta?: string | null
  /** The caller's control, usually a link to manage the Series. */
  action?: ReactNode
  titleAs?: HeadingElement
}

const tokens = componentTokens.series
const halfMark = `calc(${tokens.markSize} / 2)`

function Mark({ mark }: { readonly mark: SpineMark }) {
  const filled = mark.state === 'published'

  return (
    <Box
      as="li"
      position="relative"
      display="grid"
      placeItems="center"
      flex="none"
      boxSize={tokens.markSize}
      borderRadius="full"
      borderWidth={filled ? 0 : '2px'}
      borderStyle={mark.state === 'draft' ? 'dashed' : 'solid'}
      borderColor={mark.state === 'scheduled' ? tokens.markScheduled : tokens.markDraft}
      bg={filled ? tokens.markLive : tokens.markGround}
      data-spine-state={mark.state}
      title={mark.spoken}
    >
      {mark.state === 'scheduled' ? (
        // The ring's centre: a scheduled part is a ring with a point in it, so
        // it never reads as a draft drawn in another colour.
        <Box aria-hidden="true" boxSize={space[1]} borderRadius="full" bg={tokens.markScheduled} />
      ) : null}
      <VisuallyHidden>{mark.spoken}</VisuallyHidden>
    </Box>
  )
}

function Track({ title, parts }: { readonly title: string; readonly parts: readonly SpinePart[] }) {
  const policy = useMotionPolicy()

  if (parts.length === 0) {
    return (
      <Box position="relative" display="flex" alignItems="center" minH={space[8]} minW={0}>
        <Box
          aria-hidden="true"
          position="absolute"
          insetInline={0}
          top="50%"
          borderTopWidth="1px"
          borderTopStyle="dashed"
          borderTopColor={tokens.markDraft}
        />
        <Text
          as="span"
          recipe="metadata"
          position="relative"
          bg={tokens.markGround}
          paddingInlineEnd={space[2]}
        >
          The line starts with the first blog you add.
        </Text>
      </Box>
    )
  }

  const extent = spineLitExtent(parts)

  return (
    <Box position="relative" minW={0} minH={space[8]} display="flex" alignItems="center">
      <Box
        aria-hidden="true"
        position="absolute"
        insetInlineStart={halfMark}
        insetInlineEnd={halfMark}
        top="50%"
        height="1px"
        bg={tokens.connector}
      />
      {extent > 0 ? (
        <Box
          aria-hidden="true"
          position="absolute"
          insetInlineStart={halfMark}
          top="50%"
          height="2px"
          marginTop="-1px"
          width={`calc((100% - ${tokens.markSize}) * ${extent})`}
          data-spine-lit=""
        >
          <motion.div
            initial={{ scaleX: policy.reduced ? 1 : 0 }}
            animate={{ scaleX: 1 }}
            transition={transitionFor('reveal', policy)}
            style={{ width: '100%', height: '100%', transformOrigin: 'left center' }}
          >
            <Box width="100%" height="100%" borderRadius="full" bg={tokens.connectorActive} />
          </motion.div>
        </Box>
      ) : null}
      <Box
        as="ol"
        aria-label={spineTrackLabel(title)}
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent={parts.length === 1 ? 'flex-start' : 'space-between'}
        width="100%"
        margin={0}
        padding={0}
        listStyleType="none"
      >
        {spineMarks(parts).map((mark) => (
          <Mark key={mark.id} mark={mark} />
        ))}
      </Box>
    </Box>
  )
}

export function SeriesSpine({
  title,
  description,
  parts,
  meta,
  action,
  titleAs = 'h3',
  ...rest
}: SeriesSpineProps) {
  const summary = description?.trim() ?? ''
  const tally = spineTally(parts)

  return (
    <Box
      display="flex"
      flexWrap="wrap"
      alignItems="center"
      columnGap={space[6]}
      rowGap={space[3]}
      paddingBlock={space[6]}
      borderBottomWidth="1px"
      borderBottomStyle="solid"
      borderBottomColor={tokens.border}
      data-series-spine=""
      {...rest}
    >
      <Box
        flex={`1 1 ${tokens.spineColumnMin}`}
        minW={0}
        display="flex"
        flexDirection="column"
        gap={space[1]}
      >
        <Heading as={titleAs} recipe="cardTitle">
          {title}
        </Heading>
        {summary.length > 0 ? (
          <Text recipe="body" color="text.secondary" lineClamp={2}>
            {summary}
          </Text>
        ) : null}
        <Text recipe="metadata">{meta ? `${tally} · ${meta}` : tally}</Text>
      </Box>

      <Box flex={`1.15 1 ${tokens.spineColumnMin}`} minW={0}>
        <Track title={title} parts={parts} />
      </Box>

      {action ? <Box flex="none">{action}</Box> : null}
    </Box>
  )
}
