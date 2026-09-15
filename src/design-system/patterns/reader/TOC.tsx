/**
 * Horizon Design System v2 - the table of contents.
 *
 * A `nav` of in-page links, in two forms. The `rail` sits beside the prose on a
 * wide screen; the `disclosure` is a native `details`/`summary` above the
 * article on a narrow one, per `DESIGN.md`: "Reader TOC becomes a disclosure."
 *
 * `details` rather than a button and a state flag: it opens without JavaScript,
 * it is in the tab order for free, and browsers already announce it as
 * expanded or collapsed. The active entry carries `aria-current="location"`,
 * which is the value for "the section of this page you are in" - `page` would
 * claim it is a different page.
 */

import { forwardRef } from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'

import { componentTokens, radii, space, transitionFor } from '../../../theme/tokens'
import { Eyebrow } from '../../components/typography'
import {
  tocDisclosureLabel,
  tocIndent,
  tocItems,
  tocLinkAria,
  type ReaderHeading,
} from './reader.logic'

export type TocVariant = 'rail' | 'disclosure'

export interface TOCProps extends Omit<BoxProps, 'children' | 'title'> {
  headings: readonly ReaderHeading[]
  /** The heading the reader is currently in. */
  activeId?: string | null
  variant?: TocVariant
  label?: string
  /** Called with the heading id when an entry is activated. */
  onNavigate?: (id: string) => void
}

function TocLinks({
  headings,
  activeId,
  onNavigate,
}: Pick<TOCProps, 'headings' | 'activeId' | 'onNavigate'>) {
  const items = tocItems(headings, activeId ?? null)

  return (
    <Box as="ol" listStyleType="none" margin={0} padding={0}>
      {items.map((item) => (
        <Box as="li" key={item.id}>
          <Box
            as="a"
            href={item.href}
            onClick={() => onNavigate?.(item.id)}
            {...tocLinkAria(item.isActive)}
            display="block"
            paddingBlock={space[2]}
            paddingInlineStart={tocIndent(item.level)}
            borderInlineStartWidth="2px"
            borderInlineStartStyle="solid"
            borderInlineStartColor={
              item.isActive ? componentTokens.reader.tocActive : componentTokens.card.border
            }
            color={
              item.isActive ? componentTokens.reader.tocActive : componentTokens.reader.tocRest
            }
            textStyle="meta"
            textDecoration="none"
            transition={`${transitionFor('color', 'fast')}, ${transitionFor('border-color', 'fast')}`}
            _hover={{ color: componentTokens.reader.link }}
          >
            {item.text}
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export const TOC = forwardRef<HTMLElement, TOCProps>(function TOC(
  { headings, activeId = null, variant = 'rail', label = 'On this page', onNavigate, ...rest },
  ref,
) {
  // An article with no headings has no table of contents. An empty nav landmark
  // is a stop in the landmark list that leads nowhere.
  if (headings.length === 0) {
    return null
  }

  if (variant === 'disclosure') {
    return (
      <Box
        ref={ref}
        as="nav"
        aria-label={label}
        borderWidth="1px"
        borderStyle="solid"
        borderColor={componentTokens.card.border}
        borderRadius={radii.control}
        padding={space[3]}
        marginBlock={space[6]}
        {...rest}
      >
        <Box as="details">
          <Box
            as="summary"
            cursor="pointer"
            minH={componentTokens.control.minTouchTarget}
            display="flex"
            alignItems="center"
            textStyle="meta"
            color={componentTokens.reader.secondaryFg}
          >
            {tocDisclosureLabel(headings.length, label)}
          </Box>
          <Box paddingBlockStart={space[2]}>
            <TocLinks headings={headings} activeId={activeId} onNavigate={onNavigate} />
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      ref={ref}
      as="nav"
      aria-label={label}
      position="sticky"
      top={space[8]}
      alignSelf="start"
      {...rest}
    >
      <Eyebrow as="p" marginBlockEnd={space[3]}>
        {label}
      </Eyebrow>
      <TocLinks headings={headings} activeId={activeId} onNavigate={onNavigate} />
    </Box>
  )
})
