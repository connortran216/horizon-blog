/**
 * Horizon Design System v2 - layout, surface and typography entries.
 */

import { Box } from '@chakra-ui/react'

import {
  ContentContainer,
  Divider,
  Eyebrow,
  SectionLabel,
  Grid,
  Heading,
  Metadata,
  ProseMeasure,
  Section,
  Stack,
  Surface,
  Text,
  AppFrame,
} from '../../index'
import { space } from '../../../theme/tokens'
import { useGallery } from '../GalleryContext'
import { longCopy } from '../content'
import { Filler, type EntryRenderer } from './support'

const SAMPLE_SENTENCE =
  'Sample body copy. One paragraph at ordinary length, so the measure and the ' +
  'line height can be judged against the type ramp.'

function AppFrameEntry() {
  return (
    <AppFrame skipToId="gallery-app-frame-main">
      <Box id="gallery-app-frame-main" tabIndex={-1}>
        <Filler>Sample page content inside the frame. Tab here to reveal the skip link.</Filler>
      </Box>
    </AppFrame>
  )
}

function ContentContainerEntry({ state }: { readonly state: string }) {
  const width = state === 'prose width' ? 'prose' : state === 'full width' ? 'full' : 'content'

  return (
    <ContentContainer width={width}>
      <Filler>Sample content at the {width} width.</Filler>
    </ContentContainer>
  )
}

function SectionEntry({ state }: { readonly state: string }) {
  const density = state === 'compact' ? 'compact' : state === 'flush' ? 'flush' : 'comfortable'

  return (
    <Box bg="bg.subtle">
      <Section density={density} as="div">
        <Filler>Sample section content at {density} density.</Filler>
      </Section>
    </Box>
  )
}

function StackEntry({ state }: { readonly state: string }) {
  return (
    <Stack direction={state === 'row' ? 'row' : 'column'} gap={3}>
      <Filler>One</Filler>
      <Filler>Two</Filler>
      <Filler>Three</Filler>
    </Stack>
  )
}

function GridEntry({ state }: { readonly state: string }) {
  return (
    <Grid columns={state === 'three columns' ? 3 : 2} gap={3}>
      <Filler>One</Filler>
      <Filler>Two</Filler>
      <Filler>Three</Filler>
      <Filler>Four</Filler>
    </Grid>
  )
}

function ProseMeasureEntry({ state }: { readonly state: string }) {
  const gallery = useGallery()

  return (
    <ProseMeasure centered={state === 'centred'}>
      <Text recipe="prose">{gallery.copy(SAMPLE_SENTENCE, longCopy.excerpt)}</Text>
    </ProseMeasure>
  )
}

function SurfaceEntry({ state }: { readonly state: string }) {
  const depth = state === 'raised' ? 'raised' : state === 'feature' ? 'feature' : 'flat'

  return (
    <Surface depth={depth} isInteractive={state === 'interactive'} padded>
      <Text recipe="body">Sample surface at {state} depth.</Text>
    </Surface>
  )
}

function DividerEntry({ state }: { readonly state: string }) {
  if (state === 'vertical') {
    return (
      <Box display="flex" alignItems="stretch" gap={space[3]} height={space[12]}>
        <Text recipe="metadata">Before</Text>
        <Divider orientation="vertical" />
        <Text recipe="metadata">After</Text>
      </Box>
    )
  }

  return (
    <Box>
      <Text recipe="body">Above the rule.</Text>
      <Divider label={state === 'labelled' ? 'Sample label' : undefined} />
      <Text recipe="body">Below the rule.</Text>
    </Box>
  )
}

function TextEntry({ state }: { readonly state: string }) {
  const gallery = useGallery()
  const body = gallery.copy(SAMPLE_SENTENCE, longCopy.excerpt)

  if (state === 'clamped to two lines') {
    return (
      <Text recipe="body" lineClamp={2}>
        {longCopy.excerpt}
      </Text>
    )
  }

  const recipe = state === 'prose' ? 'prose' : state === 'metadata' ? 'metadata' : 'body'

  return <Text recipe={recipe}>{body}</Text>
}

function HeadingEntry({ state }: { readonly state: string }) {
  const gallery = useGallery()
  const title = gallery.copy('Sample heading at this size', longCopy.title)

  if (state === 'pageTitle') {
    return (
      <Heading recipe="pageTitle" as="h2">
        {title}
      </Heading>
    )
  }

  if (state === 'sectionTitle') {
    return (
      <Heading recipe="sectionTitle" as="h3">
        {title}
      </Heading>
    )
  }

  if (state === 'cardTitle') {
    return (
      <Heading recipe="cardTitle" as="h4">
        {title}
      </Heading>
    )
  }

  return (
    <Heading recipe="display" as="h2">
      {title}
    </Heading>
  )
}

function EyebrowEntry() {
  const gallery = useGallery()

  return <Eyebrow>{gallery.copy('Sample eyebrow', longCopy.label)}</Eyebrow>
}

/*
 * Shown next to `Eyebrow` on purpose: the two are visually identical and mean
 * opposite things. An eyebrow categorises the heading below it and stays out of
 * the outline; a section label is the only name its group has and must be in
 * the outline. The gallery is where that distinction is easiest to miss.
 */
function SectionLabelEntry() {
  const gallery = useGallery()

  return <SectionLabel>{gallery.copy('Sample section label', longCopy.label)}</SectionLabel>
}

function MetadataEntry() {
  return (
    <Metadata>
      <span>14 Aug 2026</span>
      <span>9 min read</span>
      <span>Sample Author</span>
    </Metadata>
  )
}

export const layoutEntries = {
  AppFrame: AppFrameEntry,
  ContentContainer: ContentContainerEntry,
  Section: SectionEntry,
  Stack: StackEntry,
  Grid: GridEntry,
  ProseMeasure: ProseMeasureEntry,
  Surface: SurfaceEntry,
  Divider: DividerEntry,
  Text: TextEntry,
  Heading: HeadingEntry,
  Eyebrow: EyebrowEntry,
  SectionLabel: SectionLabelEntry,
  Metadata: MetadataEntry,
} satisfies Record<string, EntryRenderer>
