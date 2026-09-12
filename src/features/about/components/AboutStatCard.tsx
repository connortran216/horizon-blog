/**
 * An About signal - migrated onto Horizon Design System v2 (release M2).
 *
 * `Metric` was the obvious candidate and does not fit: it formats a number, and
 * every value here is a phrase - "5+ years", "Python + Django". So the card
 * composes `Surface`, `Eyebrow` and the type recipes directly, and `Surface`
 * owns the border and radius.
 *
 * `isInteractive` is deliberately off. The card is not a link and nothing
 * happens when it is pressed; hover depth on something you cannot activate is a
 * lie a touch reader never gets to catch.
 */

import { Box, Flex } from '@chakra-ui/react'

import { componentTokens, radii, space } from '../../../theme/tokens'
import { Eyebrow, Heading, Stack, Surface, Text } from '../../../design-system'
import { AboutStatItem } from '../about.types'

const AboutStatCard = ({ icon, label, value, description }: AboutStatItem) => (
  <Surface as="article" depth="flat" height="100%">
    <Stack gap={6} height="100%">
      <Flex align="flex-start" justify="space-between" gap={space[4]}>
        <Flex
          align="center"
          justify="center"
          boxSize={space[12]}
          borderRadius={radii.control}
          bg={componentTokens.control.quietHoverBg}
          color={componentTokens.control.solidBg}
          flexShrink={0}
          aria-hidden="true"
        >
          <Box as={icon} boxSize={space[6]} />
        </Flex>

        <Eyebrow as="p" textAlign="right">
          {label}
        </Eyebrow>
      </Flex>

      <Stack gap={2} flex="1">
        {/*
         * The value is the card's title, so it is the heading, and the label
         * above it is the kicker. An `h3` keeps the four signals as siblings
         * under the section heading rather than inventing a level.
         */}
        <Heading recipe="cardTitle" as="h3">
          {value}
        </Heading>
        {description ? <Text recipe="body">{description}</Text> : null}
      </Stack>
    </Stack>
  </Surface>
)

export default AboutStatCard
