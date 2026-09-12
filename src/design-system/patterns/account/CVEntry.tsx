/**
 * Horizon Design System v2 - a CV entry.
 *
 * One role, project or qualification. It replaces the legacy
 * `CvExperienceCard` and `CvProjectEntry`, which are the same object with
 * different field names.
 *
 * A CV has a second output device. Everything here is arranged so the printed
 * page works:
 *
 * - `cvPrintStyle` drops the surface, the shadow and the radius, and asks the
 *   printer not to split an entry across two sheets. Nothing in the entry
 *   depends on a background tint that a printer will discard.
 * - Every link renders its destination as its own text, through
 *   `readableLinkText`. "GitHub" is a fine link on screen and useless on paper.
 * - The heading rank is a prop. A CV is one long document with real structure,
 *   and a page that gave every entry an `h3` regardless of its section would
 *   produce an outline nobody could navigate.
 */

import { Box } from '@chakra-ui/react'

import { space } from '../../../theme/tokens'
import { ActionLink } from '../../components/actions'
import { Stack } from '../../components/layout'
import { Heading, Metadata, Text } from '../../components/typography'
import type { HeadingElement } from '../../components/layout/semanticElements'
import { cvPrintStyle, readableLinkText } from './identity.logic'

export interface CVEntryLink {
  /** What kind of destination this is: "GitHub", "Publication", "Live site". */
  readonly label: string
  readonly href: string
}

export interface CVEntryProps {
  /** The role, project or qualification. */
  title: string
  /** The organisation, publisher or school. Optional for a personal project. */
  organisation?: string
  /** "2021 - present". Free text, because CV periods are not all dates. */
  period?: string
  /** What was done. Rendered as a real list. */
  highlights?: readonly string[]
  /** Technologies, in the author's own order. */
  stack?: readonly string[]
  /** A paragraph, for entries that read better as prose than as bullets. */
  description?: string
  links?: readonly CVEntryLink[]
  /** Heading rank. Set it to match the section this entry sits in. */
  headingLevel?: HeadingElement
}

export function CVEntry({
  title,
  organisation,
  period,
  highlights,
  stack,
  description,
  links,
  headingLevel = 'h3',
}: CVEntryProps) {
  const print = cvPrintStyle()

  return (
    <Box
      as="article"
      paddingBlock={space[2]}
      sx={{
        // Print is a second theme, not an afterthought. The entry keeps its
        // spacing and its type ramp and gives up only what a printer cannot
        // reproduce.
        '@media print': {
          breakInside: print.breakInside,
          boxShadow: print.boxShadow,
          background: print.background,
          borderRadius: print.borderRadius,
          paddingBlock: print.paddingBlock,
        },
      }}
    >
      <Stack gap={3}>
        <Stack
          direction="row"
          collapseAt="sm"
          gap={2}
          justifyContent="space-between"
          alignItems={{ base: 'flex-start', sm: 'baseline' }}
        >
          <Stack gap={1}>
            <Heading recipe="cardTitle" as={headingLevel}>
              {title}
            </Heading>
            {organisation === undefined ? null : (
              <Text recipe="body" as="p" color="text.primary" fontWeight="semibold">
                {organisation}
              </Text>
            )}
          </Stack>

          {period === undefined ? null : (
            <Metadata as="p" textTransform="uppercase" letterSpacing="wider" flexShrink={0}>
              {period}
            </Metadata>
          )}
        </Stack>

        {description === undefined ? null : <Text recipe="body">{description}</Text>}

        {highlights === undefined || highlights.length === 0 ? null : (
          <Stack as="ul" gap={2} paddingInlineStart={space[4]}>
            {highlights.map((highlight) => (
              <Text key={highlight} recipe="body" as="li" sx={{ listStyleType: 'disc' }}>
                {highlight}
              </Text>
            ))}
          </Stack>
        )}

        {links === undefined || links.length === 0 ? null : (
          <Stack as="ul" gap={1}>
            {links.map((link) => (
              <Text key={link.href} recipe="metadata" as="li">
                <Box as="span" color="text.primary" fontWeight="semibold">
                  {link.label}:
                </Box>{' '}
                {/*
                 * The visible text is the destination, so the printed sheet
                 * carries something a reader could type. `ActionLink` still
                 * resolves the external target and rel for the screen version.
                 */}
                <ActionLink href={link.href}>{readableLinkText(link.href)}</ActionLink>
              </Text>
            ))}
          </Stack>
        )}

        {stack === undefined || stack.length === 0 ? null : (
          <Text recipe="metadata" color="text.secondary">
            <Box as="span" color="text.primary" fontWeight="semibold">
              Tech stack:
            </Box>{' '}
            {stack.join(', ')}
          </Text>
        )}
      </Stack>
    </Box>
  )
}
