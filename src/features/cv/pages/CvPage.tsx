import {
  Box,
  Button,
  Container,
  Heading,
  Icon,
  Link,
  SimpleGrid,
  Stack,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import CvExperienceCard from '../components/CvExperienceCard'
import CvProjectEntry from '../components/CvProjectEntry'
import { cvProfile } from '../cv.data'
import { CvLinkItem } from '../cv.types'

const headingFont = "'Newsreader', serif"

const getReadableLinkText = (href: string) => {
  try {
    const url = new URL(href)
    const path = decodeURIComponent(url.pathname).replace(/\/$/, '')
    return `${url.hostname}${path}`
  } catch {
    return href.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }
}

const hasHref = (item: CvLinkItem): item is CvLinkItem & { href: string } => Boolean(item.href)

const CvPage = () => {
  const externalLinks = cvProfile.links.filter(hasHref)
  const actionLinks = cvProfile.links.filter((item) => item.label === 'Export PDF' || item.to)

  const handlePrint = () => {
    window.print()
  }

  return (
    <Box className="cv-page" pb={{ base: 12, md: 16 }}>
      <Container maxW="4xl" py={{ base: 8, md: 12 }}>
        <Box
          className="cv-document"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius={{ base: '2xl', md: '3xl' }}
          bg="bg.elevated"
          boxShadow="xl"
          px={{ base: 6, md: 10 }}
          py={{ base: 7, md: 10 }}
        >
          <Stack spacing={{ base: 8, md: 10 }}>
            <Stack
              as="header"
              className="cv-document-header"
              spacing={{ base: 5, md: 6 }}
              pb={{ base: 6, md: 7 }}
            >
              <Stack
                direction={{ base: 'column', md: 'row' }}
                justify="space-between"
                align={{ base: 'flex-start', md: 'flex-start' }}
                gap={4}
              >
                <Stack spacing={2}>
                  <Heading
                    fontFamily={headingFont}
                    fontSize={{ base: '4xl', md: '6xl' }}
                    lineHeight={{ base: 0.96, md: 0.92 }}
                    letterSpacing="-0.06em"
                    color="text.primary"
                  >
                    {cvProfile.name}
                  </Heading>
                  <Text
                    className="cv-role"
                    fontSize={{ base: 'lg', md: 'xl' }}
                    fontWeight="semibold"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color="action.primary"
                  >
                    {cvProfile.title}
                  </Text>
                </Stack>

                <Wrap className="cv-actions cv-no-print" spacing={2.5} justify="flex-end">
                  {actionLinks.map((item) => {
                    if (item.label === 'Export PDF') {
                      return (
                        <WrapItem key={item.label}>
                          <Button
                            leftIcon={<Icon as={item.icon} />}
                            onClick={handlePrint}
                            variant="ghost"
                            size="sm"
                            color="action.primary"
                            _hover={{ bg: 'action.subtle', color: 'action.hover' }}
                          >
                            {item.label}
                          </Button>
                        </WrapItem>
                      )
                    }

                    if (item.to) {
                      return (
                        <WrapItem key={item.label}>
                          <Button
                            as={RouterLink}
                            to={item.to}
                            leftIcon={<Icon as={item.icon} />}
                            variant="ghost"
                            size="sm"
                            color="action.primary"
                            _hover={{ bg: 'action.subtle', color: 'action.hover' }}
                          >
                            {item.label}
                          </Button>
                        </WrapItem>
                      )
                    }

                    return null
                  })}
                </Wrap>
              </Stack>

              <Wrap className="cv-contact-list" spacing={4} rowGap={2}>
                <WrapItem>
                  <Text className="cv-contact-item" color="text.secondary">
                    {cvProfile.location}
                  </Text>
                </WrapItem>
                <WrapItem>
                  <Link
                    href={`mailto:${cvProfile.email}`}
                    className="cv-contact-link"
                    color="text.secondary"
                    _hover={{ color: 'action.hover' }}
                  >
                    {cvProfile.email}
                  </Link>
                </WrapItem>
                {externalLinks.map((item) => (
                  <WrapItem key={item.label}>
                    <Link
                      href={item.href}
                      target={item.isExternal ? '_blank' : undefined}
                      rel={item.isExternal ? 'noreferrer' : undefined}
                      className="cv-contact-link"
                      color="text.secondary"
                      _hover={{ color: 'action.hover' }}
                    >
                      {getReadableLinkText(item.href)}
                    </Link>
                  </WrapItem>
                ))}
              </Wrap>
            </Stack>

            <Stack as="section" className="cv-section" spacing={4}>
              <Text
                className="cv-section-label"
                fontSize="xs"
                color="text.tertiary"
                textTransform="uppercase"
                letterSpacing="0.18em"
              >
                Summary
              </Text>
              <Text className="cv-body-text" color="text.secondary" lineHeight="tall">
                {cvProfile.summary}
              </Text>
            </Stack>

            <Stack as="section" className="cv-section" spacing={4}>
              <Text
                className="cv-section-label"
                fontSize="xs"
                color="text.tertiary"
                textTransform="uppercase"
                letterSpacing="0.18em"
              >
                Core Stack & Domains
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacingX={{ base: 0, md: 8 }} spacingY={4}>
                {cvProfile.competencies.map((group) => (
                  <Stack key={group.title} spacing={1}>
                    <Text
                      className="cv-entry-label"
                      color="text.primary"
                      fontSize="sm"
                      fontWeight="semibold"
                    >
                      {group.title}
                    </Text>
                    <Text className="cv-body-text" color="text.secondary" lineHeight="tall">
                      {group.items.join(', ')}
                    </Text>
                  </Stack>
                ))}
              </SimpleGrid>
            </Stack>

            <Stack as="section" className="cv-section" spacing={5}>
              <Text
                className="cv-section-label"
                fontSize="xs"
                color="text.tertiary"
                textTransform="uppercase"
                letterSpacing="0.18em"
              >
                Experience
              </Text>
              <Stack spacing={0}>
                {cvProfile.experience.map((experience) => (
                  <CvExperienceCard
                    key={`${experience.company}-${experience.role}`}
                    experience={experience}
                  />
                ))}
              </Stack>
            </Stack>

            <Stack as="section" className="cv-section" spacing={5}>
              <Text
                className="cv-section-label"
                fontSize="xs"
                color="text.tertiary"
                textTransform="uppercase"
                letterSpacing="0.18em"
              >
                Personal Projects
              </Text>
              <Stack spacing={0}>
                {cvProfile.projects.map((project) => (
                  <CvProjectEntry key={`${project.title}-${project.period}`} project={project} />
                ))}
              </Stack>
            </Stack>

            <Stack as="section" className="cv-section" spacing={5}>
              <Text
                className="cv-section-label"
                fontSize="xs"
                color="text.tertiary"
                textTransform="uppercase"
                letterSpacing="0.18em"
              >
                Education
              </Text>
              <Stack spacing={0}>
                {cvProfile.education.map((item) => (
                  <Box key={`${item.school}-${item.degree}`} className="cv-entry cv-avoid-break">
                    <Stack spacing={3}>
                      <Stack
                        direction={{ base: 'column', md: 'row' }}
                        justify="space-between"
                        align={{ base: 'flex-start', md: 'baseline' }}
                        gap={2}
                      >
                        <Stack spacing={1}>
                          <Heading as="h3" size="md" color="text.primary" letterSpacing="-0.03em">
                            {item.degree}
                          </Heading>
                          <Text
                            className="cv-entry-kicker"
                            color="text.primary"
                            fontWeight="semibold"
                          >
                            {item.school}
                          </Text>
                        </Stack>
                        <Text
                          className="cv-entry-period"
                          color="text.tertiary"
                          fontSize="sm"
                          textTransform="uppercase"
                          letterSpacing="0.12em"
                        >
                          {item.period}
                        </Text>
                      </Stack>

                      <Stack as="ul" className="cv-bullet-list" spacing={2} pl={5}>
                        {item.details.map((detail) => (
                          <Text
                            as="li"
                            key={detail}
                            className="cv-body-text"
                            color="text.secondary"
                            lineHeight="tall"
                          >
                            {detail}
                          </Text>
                        ))}
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  )
}

export default CvPage
