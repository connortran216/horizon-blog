/**
 * CV - migrated onto Horizon Design System v2 (release M2).
 *
 * Every role, project and qualification is a `CVEntry`, which is the pattern
 * that replaced the two near-identical legacy entry components. The page keeps
 * the `cv-*` class hooks: `src/index.css` owns the CV's print stylesheet - page
 * size, the hidden navigation, the section and entry separators, the two-column
 * competency grid that must survive an A4 sheet - and that file is outside this
 * release. The classes are print contract, not styling the page does itself.
 */

import { Box, Icon } from '@chakra-ui/react'

import { semanticColor, space } from '../../../theme/tokens'
import {
  ActionLink,
  Button,
  CVEntry,
  ContentContainer,
  Grid,
  Heading,
  Metadata,
  Section,
  SectionLabel,
  Stack,
  Surface,
  Text,
  readableLinkText,
  type CVEntryLink,
} from '../../../design-system'
import { cvProfile } from '../cv.data'
import { CvLinkItem, CvProject } from '../cv.types'
import '../cv-fonts.css'

/**
 * Print is a second theme. `src/index.css` already owns most of it, but it was
 * written against the legacy role names; these are the v2 roles it does not
 * cover, pinned to the light pair straight from the token source so a reader
 * printing from dark mode does not get pale link and metadata text on paper.
 */
const printOverrides = {
  '--chakra-colors-bg-page': semanticColor('bg.page', 'light'),
  '--chakra-colors-bg-surface': semanticColor('bg.surface', 'light'),
  '--chakra-colors-bg-subtle': semanticColor('bg.subtle', 'light'),
  '--chakra-colors-bg-elevated': semanticColor('bg.elevated', 'light'),
  '--chakra-colors-text-primary': semanticColor('text.primary', 'light'),
  '--chakra-colors-text-secondary': semanticColor('text.secondary', 'light'),
  '--chakra-colors-text-muted': semanticColor('text.muted', 'light'),
  '--chakra-colors-link-default': semanticColor('link.default', 'light'),
  '--chakra-colors-action-primary': semanticColor('action.primary', 'light'),
  '--chakra-colors-action-hover': semanticColor('action.hover', 'light'),
  '--chakra-colors-border-subtle': semanticColor('border.subtle', 'light'),
  '--chakra-colors-border-control': semanticColor('border.control', 'light'),

  /*
   * `Surface` clips, at every depth, because it draws a radius. A clipped block
   * cannot be paginated - a browser has nowhere to put the overflow but the
   * first sheet - and this CV is four pages long. Print is the one context
   * where the document surface gives its clipping up, and the radius it was
   * protecting is removed on the same sheet.
   */
  '.cv-document': { overflow: 'visible' },
} as const

const hasHref = (item: CvLinkItem): item is CvLinkItem & { href: string } => Boolean(item.href)

function projectLinks(project: CvProject): CVEntryLink[] {
  const links: CVEntryLink[] = []

  if (project.githubUrl) {
    links.push({ label: 'GitHub', href: project.githubUrl })
  }

  if (project.publicationUrl) {
    links.push({ label: 'Publication', href: project.publicationUrl })
  }

  return links
}

const CvPage = () => {
  const externalLinks = cvProfile.links.filter(hasHref)
  const actionLinks = cvProfile.links.filter((item) => item.label === 'Export PDF' || item.to)

  const handlePrint = () => {
    window.print()
  }

  return (
    <Box className="cv-page" sx={{ '@media print': printOverrides }}>
      <ContentContainer width="prose">
        <Section density="comfortable">
          <Surface
            className="cv-document"
            as="article"
            depth="feature"
            p={{ base: space[6], sm: space[8] }}
          >
            <Stack gap={8}>
              <Stack
                as="header"
                className="cv-document-header"
                gap={6}
                pb={{ base: space[6], sm: space[8] }}
              >
                <Stack
                  direction="row"
                  collapseAt="md"
                  gap={4}
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Stack gap={2}>
                    <Heading recipe="display" as="h1">
                      {cvProfile.name}
                    </Heading>
                    <Text
                      className="cv-role"
                      recipe="body"
                      as="p"
                      color="action.primary"
                      fontWeight="semibold"
                      letterSpacing="wider"
                      textTransform="uppercase"
                    >
                      {cvProfile.title}
                    </Text>
                  </Stack>

                  <Stack
                    className="cv-actions cv-no-print"
                    direction="row"
                    collapseAt={undefined}
                    gap={3}
                    flexWrap="wrap"
                    alignItems="center"
                    justifyContent="flex-end"
                  >
                    {actionLinks.map((item) => {
                      if (item.label === 'Export PDF') {
                        return (
                          <Button
                            key={item.label}
                            tone="quiet"
                            size="sm"
                            onClick={handlePrint}
                            iconStart={<Icon as={item.icon} aria-hidden="true" />}
                          >
                            {item.label}
                          </Button>
                        )
                      }

                      if (item.to) {
                        return (
                          <ActionLink
                            key={item.label}
                            to={item.to}
                            underline="hover"
                            iconStart={<Icon as={item.icon} aria-hidden="true" />}
                            color="action.primary"
                            fontWeight="semibold"
                          >
                            {item.label}
                          </ActionLink>
                        )
                      }

                      return null
                    })}
                  </Stack>
                </Stack>

                <Metadata as="ul" className="cv-contact-list" gap={space[4]}>
                  <Box as="li" className="cv-contact-item">
                    {cvProfile.location}
                  </Box>
                  <Box as="li">
                    <ActionLink
                      href={`mailto:${cvProfile.email}`}
                      underline="hover"
                      className="cv-contact-link"
                    >
                      {cvProfile.email}
                    </ActionLink>
                  </Box>
                  {externalLinks.map((item) => (
                    <Box as="li" key={item.label}>
                      {/*
                       * The visible text is the destination rather than the
                       * label, because a printed CV has to carry something a
                       * reader could type. `ActionLink` still resolves the
                       * external target and `rel` for the screen version.
                       */}
                      <ActionLink
                        href={item.href}
                        isExternal={item.isExternal}
                        underline="hover"
                        className="cv-contact-link"
                      >
                        {readableLinkText(item.href)}
                      </ActionLink>
                    </Box>
                  ))}
                </Metadata>
              </Stack>

              <Stack as="section" className="cv-section" gap={4}>
                <SectionLabel className="cv-section-label">Summary</SectionLabel>
                <Text className="cv-body-text cv-section-body" recipe="body" whiteSpace="pre-line">
                  {cvProfile.summary}
                </Text>
              </Stack>

              <Stack as="section" className="cv-section" gap={4}>
                <SectionLabel className="cv-section-label">Core Stack</SectionLabel>
                <Grid className="cv-competency-grid cv-section-body" columns={2} gap={4}>
                  {cvProfile.competencies.map((group) => (
                    <Stack key={group.title} className="cv-competency-item" gap={1}>
                      <Text
                        className="cv-entry-label"
                        recipe="metadata"
                        as="p"
                        color="text.primary"
                        fontWeight="semibold"
                      >
                        {group.title}
                      </Text>
                      <Text className="cv-body-text" recipe="body">
                        {group.items.join(', ')}
                      </Text>
                    </Stack>
                  ))}
                </Grid>
              </Stack>

              <Stack as="section" className="cv-section" gap={6}>
                <SectionLabel className="cv-section-label">Experience</SectionLabel>
                <Box className="cv-section-body">
                  {cvProfile.experience.map((experience) => (
                    <Box
                      key={`${experience.company}-${experience.role}`}
                      className="cv-entry cv-avoid-break"
                    >
                      <CVEntry
                        title={experience.role}
                        organisation={experience.company}
                        period={experience.period}
                        highlights={experience.highlights}
                        stack={experience.stack}
                        headingLevel="h3"
                      />
                    </Box>
                  ))}
                </Box>
              </Stack>

              <Stack as="section" className="cv-section" gap={6}>
                <SectionLabel className="cv-section-label">Personal Projects</SectionLabel>
                <Box className="cv-section-body">
                  {cvProfile.projects.map((project) => (
                    <Box
                      key={`${project.title}-${project.period}`}
                      className="cv-entry cv-avoid-break"
                    >
                      <CVEntry
                        title={project.title}
                        period={project.period}
                        description={project.description}
                        links={projectLinks(project)}
                        stack={project.stack}
                        headingLevel="h3"
                      />
                    </Box>
                  ))}
                </Box>
              </Stack>

              <Stack as="section" className="cv-section" gap={6}>
                <SectionLabel className="cv-section-label">Education</SectionLabel>
                <Box className="cv-section-body">
                  {cvProfile.education.map((item) => (
                    <Box key={`${item.school}-${item.degree}`} className="cv-entry cv-avoid-break">
                      <CVEntry
                        title={item.degree}
                        organisation={item.school}
                        period={item.period}
                        highlights={item.details}
                        headingLevel="h3"
                      />
                    </Box>
                  ))}
                </Box>
              </Stack>
            </Stack>
          </Surface>
        </Section>
      </ContentContainer>
    </Box>
  )
}

export default CvPage
