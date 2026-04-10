import { Box, Link, Stack, Text, Wrap, WrapItem } from '@chakra-ui/react'
import { CvProject } from '../cv.types'

interface CvProjectEntryProps {
  project: CvProject
}

const getReadableLinkText = (href: string) => {
  try {
    const url = new URL(href)
    const path = decodeURIComponent(url.pathname).replace(/\/$/, '')
    return `${url.hostname}${path}`
  } catch {
    return href.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }
}

const CvProjectEntry = ({ project }: CvProjectEntryProps) => (
  <Box className="cv-entry cv-avoid-break">
    <Stack spacing={3}>
      <Stack
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'flex-start', md: 'baseline' }}
        gap={2}
      >
        <Text className="cv-entry-title" color="text.primary" fontWeight="semibold" fontSize="lg">
          {project.title}
        </Text>
        {project.period ? (
          <Text
            className="cv-entry-period"
            color="text.tertiary"
            fontSize="sm"
            textTransform="uppercase"
            letterSpacing="0.12em"
          >
            {project.period}
          </Text>
        ) : null}
      </Stack>

      {(project.githubUrl || project.publicationUrl) && (
        <Wrap spacing={3} rowGap={1.5}>
          {project.githubUrl ? (
            <WrapItem>
              <Text className="cv-body-text" color="text.secondary">
                <Text
                  as="span"
                  className="cv-entry-label"
                  color="text.primary"
                  fontWeight="semibold"
                >
                  GitHub:
                </Text>{' '}
                <Link
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="cv-entry-link"
                  color="action.primary"
                  _hover={{ color: 'action.hover' }}
                >
                  {getReadableLinkText(project.githubUrl)}
                </Link>
              </Text>
            </WrapItem>
          ) : null}
          {project.publicationUrl ? (
            <WrapItem>
              <Text className="cv-body-text" color="text.secondary">
                <Text
                  as="span"
                  className="cv-entry-label"
                  color="text.primary"
                  fontWeight="semibold"
                >
                  Publication:
                </Text>{' '}
                <Link
                  href={project.publicationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="cv-entry-link"
                  color="action.primary"
                  _hover={{ color: 'action.hover' }}
                >
                  {getReadableLinkText(project.publicationUrl)}
                </Link>
              </Text>
            </WrapItem>
          ) : null}
        </Wrap>
      )}

      <Text className="cv-body-text" color="text.secondary" lineHeight="tall">
        {project.description}
      </Text>

      <Text className="cv-body-text" color="text.secondary" lineHeight="tall">
        <Text as="span" className="cv-entry-label" color="text.primary" fontWeight="semibold">
          Tech stack:
        </Text>{' '}
        {project.stack.join(', ')}
      </Text>
    </Stack>
  </Box>
)

export default CvProjectEntry
