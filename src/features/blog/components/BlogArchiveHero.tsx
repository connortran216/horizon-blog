/**
 * The blog archive's editorial header.
 *
 * It says what the page is and nothing else. The search field moved into
 * `BlogFilterToolbar`, which is now the design system's `FilterBar` and owns
 * search, topics and the row of filters currently in force together - a reader
 * who wants to narrow the list finds every control for it in one place instead
 * of two.
 *
 * The three stat boxes went with it. "13 blogs", "Page 2 of 7" and "Search
 * results" are now said once each, by the filter bar's result summary and by
 * the pagination control that owns the page count.
 *
 * It speaks Home's Dawn language at an inner page's volume. The title is on
 * the `display` recipe like every public page title, and a hairline beneath
 * the header is a `SignalRoute`: it draws itself when the page opens, its tip
 * a signal, and the eyebrow and each word of the title are written in order as
 * the tip travels, the last word getting the drawn rule. Assistive
 * technology hears the title once, whole.
 */

import {
  Eyebrow,
  Heading,
  SignalLine,
  SignalRoute,
  SignalTarget,
  Stack,
  Text,
  Typeset,
} from '../../../design-system'

export const BLOG_HEADLINE = 'Thoughtful blogs about life, work, and technology.'
export const BLOG_EMPHASIS = 'technology.'

const BlogArchiveHero = () => (
  <SignalRoute as="header" pace="order" trigger="mount">
    <Stack gap={6} maxW="4xl">
      <SignalTarget>
        <Eyebrow as="p">Horizon blog</Eyebrow>
      </SignalTarget>

      <Heading as="h1" recipe="display">
        <Typeset emphasis={BLOG_EMPHASIS}>{BLOG_HEADLINE}</Typeset>
      </Heading>

      <Text recipe="prose">
        Browse the latest blogs, search by topic, and open the writing that deserves your full
        attention.
      </Text>
    </Stack>

    <SignalLine mt={8} />
  </SignalRoute>
)

export default BlogArchiveHero
