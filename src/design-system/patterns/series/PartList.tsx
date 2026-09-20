/**
 * Horizon Design System v2 - the blogs, in order.
 *
 * An ordered list, and a real `ol`: the reading order is the content, so it
 * belongs in the markup rather than in a set of numbers drawn beside a stack of
 * divs. A screen reader announces "list, 8 items, item 3" without any help from
 * us, and that is exactly the information the connectors draw for everyone else.
 *
 * The connectors are what stop this reading as a column of post cards. Each
 * part carries an ordinal marker with a line running up to the part above and
 * down to the one below; the run has a visible beginning and end; and when the
 * reader is inside the Series, everything up to their position is drawn in the
 * active colour. `partConnector` owns those decisions.
 *
 * Pointing at a part, or tabbing to its title, lights that part's ordinal
 * marker and the connector leaving it for the next one - `y2e.3.2` asks for
 * both, and the outgoing segment is what makes the emphasis read as a position
 * in an order rather than as a row highlight. `data-group` on the `li` is the
 * scope: `_groupHover` and `_groupFocusWithin` reach the two pieces from
 * inside, so the row keeps its list semantics and the keyboard gets the same
 * emphasis the pointer does. It is colour only, on `transitionFor` - reduced
 * motion removes travel and keeps immediate state feedback, so there is
 * nothing here for it to take away.
 */

import { Box, type BoxProps } from '@chakra-ui/react'
import { FiArrowRight } from 'react-icons/fi'

import { space, transitionFor } from '../../../theme/tokens'
import { ActionLink } from '../../components/actions'
import type { HeadingElement } from '../../components/layout'
import { Chip } from '../../components/status'
import { Eyebrow, Heading, Metadata, Text } from '../../components/typography'
import { cardLinkOverlayStyle, readingTimeLabel, visibleTags } from '../posts'
import {
  connectorColor,
  partConnector,
  partLabel,
  partOrdinal,
  seriesPresentation,
  type SeriesPartSummary,
} from './series.logic'

export interface PartListProps extends Omit<BoxProps, 'children' | 'as'> {
  parts: readonly SeriesPartSummary[]
  /** Landmark name for the list. */
  label?: string
  /** Zero-based index of the part the reader is on, when inside the Series. */
  currentIndex?: number | null
  titleAs?: HeadingElement
  /** Topics shown per part before the overflow chip takes over. */
  tagLimit?: number
}

export function PartList({
  parts,
  label = 'Blogs in this Series',
  currentIndex = null,
  titleAs = 'h3',
  tagLimit = 3,
  ...rest
}: PartListProps) {
  const presentation = seriesPresentation()
  const total = parts.length

  return (
    <Box as="ol" aria-label={label} listStyleType="none" margin={0} padding={0} {...rest}>
      {parts.map((part, index) => {
        const connector = partConnector(index, total, currentIndex)
        const lineColor = connectorColor(connector)
        const reading = readingTimeLabel(part.readingMinutes)
        const tags = visibleTags(part.tags, tagLimit)
        const isCurrent = connector.state === 'current'

        return (
          <Box
            as="li"
            key={part.id}
            data-group
            data-part-state={connector.state}
            data-active={isCurrent ? 'true' : undefined}
            position="relative"
            display="grid"
            gridTemplateColumns={`${presentation.ordinalSize} minmax(0, 1fr) auto`}
            alignItems="start"
            columnGap={{ base: space[3], sm: space[6] }}
            paddingBlock={space[6]}
          >
            {/* The line above and the line below, drawn as two separate runs so
                the ordinal marker sits in the gap rather than on top of a rule. */}
            {connector.above ? (
              <Box
                aria-hidden="true"
                position="absolute"
                insetBlockStart={0}
                insetInlineStart={`calc(${presentation.ordinalSize} / 2)`}
                width="2px"
                height={space[6]}
                bg={lineColor}
                transition={transitionFor('background-color')}
              />
            ) : null}
            {connector.below ? (
              <Box
                aria-hidden="true"
                position="absolute"
                insetBlockStart={`calc(${space[6]} + ${presentation.ordinalSize})`}
                insetBlockEnd={0}
                insetInlineStart={`calc(${presentation.ordinalSize} / 2)`}
                width="2px"
                bg={lineColor}
                transition={transitionFor('background-color')}
                _groupHover={{ bg: presentation.connectorActive }}
                _groupFocusWithin={{ bg: presentation.connectorActive }}
              />
            ) : null}

            <Box
              aria-hidden="true"
              display="grid"
              placeItems="center"
              width={presentation.ordinalSize}
              height={presentation.ordinalSize}
              borderRadius={presentation.cardRadius}
              bg={isCurrent ? presentation.connectorActive : 'bg.subtle'}
              color={isCurrent ? 'text.onAction' : presentation.partRest}
              textStyle="meta"
              transition={`${transitionFor('background-color')}, ${transitionFor('color')}`}
              _groupHover={{ bg: presentation.connectorActive, color: 'text.onAction' }}
              _groupFocusWithin={{ bg: presentation.connectorActive, color: 'text.onAction' }}
            >
              {partOrdinal(part.position)}
            </Box>

            <Box display="flex" flexDirection="column" gap={space[2]} minW={0}>
              <Eyebrow as="p" color={isCurrent ? 'action.primary' : undefined}>
                {partLabel(part.position, total)}
                {isCurrent ? ' · You are here' : ''}
              </Eyebrow>

              <Heading as={titleAs} recipe="cardTitle">
                <ActionLink
                  to={part.href}
                  underline="hover"
                  color={isCurrent ? presentation.partCurrent : 'text.primary'}
                  aria-current={isCurrent ? 'true' : undefined}
                  _after={cardLinkOverlayStyle()}
                >
                  {part.title}
                </ActionLink>
              </Heading>

              {part.excerpt?.trim() ? (
                <Text recipe="body" lineClamp={2}>
                  {part.excerpt}
                </Text>
              ) : null}

              {reading || tags.visible.length > 0 ? (
                <Metadata position="relative" zIndex={1}>
                  {reading ? <Box as="span">{reading}</Box> : null}
                  {tags.visible.map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                  ))}
                  {tags.overflowLabel ? (
                    <Chip aria-label={tags.overflowSrLabel ?? undefined}>{tags.overflowLabel}</Chip>
                  ) : null}
                </Metadata>
              ) : null}
            </Box>

            <Box
              as={FiArrowRight}
              aria-hidden="true"
              color="action.primary"
              alignSelf="center"
              display={{ base: 'none', sm: 'block' }}
            />
          </Box>
        )
      })}
    </Box>
  )
}
