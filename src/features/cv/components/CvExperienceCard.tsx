import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { CvExperience } from '../cv.types'

interface CvExperienceCardProps {
  experience: CvExperience
}

const CvExperienceCard = ({ experience }: CvExperienceCardProps) => (
  <Box className="cv-entry cv-avoid-break">
    <Stack spacing={5}>
      <Stack spacing={1}>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'baseline' }}
          gap={2}
        >
          <Stack spacing={1}>
            <Heading size="lg" color="text.primary" letterSpacing="-0.03em">
              {experience.role}
            </Heading>
            <Text className="cv-entry-kicker" color="text.primary" fontWeight="semibold">
              {experience.company}
            </Text>
          </Stack>
          <Text
            className="cv-entry-period"
            color="text.tertiary"
            textTransform="uppercase"
            letterSpacing="0.12em"
            fontSize="xs"
          >
            {experience.period}
          </Text>
        </Stack>
      </Stack>

      <Stack as="ul" spacing={2.5} pl={5} color="text.secondary" lineHeight="tall">
        {experience.highlights.map((highlight) => (
          <Text as="li" key={highlight} className="cv-body-text">
            {highlight}
          </Text>
        ))}
      </Stack>

      <Text className="cv-body-text" color="text.secondary" lineHeight="tall">
        <Text as="span" className="cv-entry-label" color="text.primary" fontWeight="semibold">
          Tech stack:
        </Text>{' '}
        {experience.stack.join(', ')}
      </Text>
    </Stack>
  </Box>
)

export default CvExperienceCard
