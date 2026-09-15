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
 */

import { Eyebrow, Heading, Stack, Text } from '../../../design-system'

const BlogArchiveHero = () => (
  <Stack as="header" gap={6} maxW="4xl">
    <Eyebrow as="p">Horizon blog</Eyebrow>

    <Heading as="h1" recipe="pageTitle">
      Thoughtful blogs about life, work, and technology.
    </Heading>

    <Text recipe="prose">
      Browse the latest blogs, search by topic, and open the writing that deserves your full
      attention.
    </Text>
  </Stack>
)

export default BlogArchiveHero
