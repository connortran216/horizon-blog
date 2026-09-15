/**
 * A short promise the site makes, as a card.
 *
 * Nothing references this component: Home stopped rendering a row of promises
 * before this release and the file was left behind. It is kept off legacy
 * tokens so the compatibility bridge has one fewer caller, and it should be
 * deleted with its inventory row rather than migrated again.
 */

import { Box } from '@chakra-ui/react'
import { IconType } from 'react-icons'

import { componentTokens, space } from '../../../theme/tokens'
import { Heading, Stack, Surface, Text } from '../../../design-system'

interface PromiseCardProps {
  icon: IconType
  title: string
  description: string
}

const PromiseCard = ({ icon, title, description }: PromiseCardProps) => (
  <Surface as="article" depth="raised" height="100%">
    <Stack gap={4}>
      <Box
        display="grid"
        placeItems="center"
        width={space[12]}
        height={space[12]}
        borderRadius={componentTokens.control.radius}
        bg="bg.subtle"
        color="action.primary"
      >
        <Box as={icon} aria-hidden="true" />
      </Box>
      <Stack gap={2}>
        <Heading as="h3" recipe="cardTitle">
          {title}
        </Heading>
        <Text recipe="body">{description}</Text>
      </Stack>
    </Stack>
  </Surface>
)

export default PromiseCard
