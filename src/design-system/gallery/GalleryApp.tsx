/**
 * Horizon Design System v2 - the gallery shell.
 *
 * Chrome, not product. Everything outside a preview panel is plain Chakra
 * layout on design tokens, deliberately unlike any production surface, so a
 * reviewer is never in doubt about which part of the page is the thing under
 * review.
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Box, useColorMode } from '@chakra-ui/react'

import { radii, reviewWidths, space } from '../../theme/tokens'
import { GalleryProvider } from './GalleryContext'
import { entryRenderers } from './entries'
import { galleryAreaOrder, galleryEntries } from './registry'
import { setReducedMotionOverride } from './motionOverride'
import type {
  ContentChoice,
  GalleryControls,
  GalleryEntry,
  MediaChoice,
  MotionChoice,
  StateChoice,
  ViewportChoice,
} from './types'

/**
 * Reduced motion, applied to the preview frame as CSS as well as through the
 * media query. `none` rather than a collapsed duration: the gallery has no
 * transition listeners to keep alive, and a keyword needs no design value.
 */
const REDUCED_MOTION_CSS = `
[data-gallery-motion='reduced'],
[data-gallery-motion='reduced'] *,
[data-gallery-motion='reduced'] *::before,
[data-gallery-motion='reduced'] *::after {
  transition: none !important;
  animation: none !important;
  scroll-behavior: auto !important;
}
`

const VIEWPORTS = reviewWidths
const MOTIONS: readonly MotionChoice[] = ['normal', 'reduced']
const CONTENTS: readonly ContentChoice[] = ['normal', 'long']
const MEDIAS: readonly MediaChoice[] = ['present', 'missing', 'broken']
const STATES: readonly StateChoice[] = ['all', 'ready', 'loading', 'empty', 'error']

function anchorFor(name: string): string {
  return `gallery-entry-${name}`
}

function ControlButton({
  isActive,
  onClick,
  children,
}: {
  readonly isActive: boolean
  readonly onClick: () => void
  readonly children: ReactNode
}) {
  return (
    <Box
      as="button"
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      textStyle="meta"
      px={space[3]}
      py={space[1]}
      minH={space[8]}
      borderRadius={radii.tag}
      border="1px solid"
      borderColor={isActive ? 'action.primary' : 'border.control'}
      bg={isActive ? 'action.primary' : 'bg.surface'}
      color={isActive ? 'text.onAction' : 'text.secondary'}
    >
      {children}
    </Box>
  )
}

function ControlGroup<Value extends string>({
  label,
  options,
  value,
  onChange,
}: {
  readonly label: string
  readonly options: readonly Value[]
  readonly value: Value
  readonly onChange: (next: Value) => void
}) {
  return (
    <Box as="fieldset" border="none" p={0} m={0}>
      <Box as="legend" textStyle="meta" color="text.muted" mb={space[1]}>
        {label}
      </Box>
      <Box display="flex" flexWrap="wrap" gap={space[1]}>
        {options.map((option) => (
          <ControlButton key={option} isActive={option === value} onClick={() => onChange(option)}>
            {option}
          </ControlButton>
        ))}
      </Box>
    </Box>
  )
}

function EntryIndex({ state }: { readonly state: StateChoice }) {
  return (
    <Box
      as="nav"
      aria-label="Component and state index"
      flex="0 0 auto"
      width={{ base: '100%', lg: space[24] }}
      minW={{ lg: '260px' }}
      maxH={{ lg: '100vh' }}
      overflowY={{ lg: 'auto' }}
      position={{ lg: 'sticky' }}
      top="0"
      borderRight={{ lg: '1px solid' }}
      borderColor="border.subtle"
      p={space[4]}
    >
      <Box textStyle="meta" color="text.muted" mb={space[3]}>
        {galleryEntries.length} entries
      </Box>
      {galleryAreaOrder.map((area) => {
        const entries = galleryEntries.filter((entry) => entry.area === area)

        if (entries.length === 0) {
          return null
        }

        return (
          <Box key={area} mb={space[4]}>
            <Box textStyle="meta" fontWeight="semibold" color="text.primary" mb={space[1]}>
              {area}
            </Box>
            <Box as="ul" listStyleType="none" m={0} p={0}>
              {entries.map((entry) => {
                const visible = entry.states.filter(
                  (item) => state === 'all' || item.kind === state,
                )

                return (
                  <Box as="li" key={entry.name} mb={space[1]}>
                    <Box
                      as="a"
                      href={`#${anchorFor(entry.name)}`}
                      textStyle="meta"
                      color={visible.length === 0 ? 'text.disabled' : 'link.default'}
                      textDecoration="none"
                      display="block"
                    >
                      {entry.name}
                    </Box>
                    <Box textStyle="meta" color="text.muted">
                      {entry.states.map((item) => item.name).join(' · ')}
                    </Box>
                  </Box>
                )
              })}
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

function EntrySection({
  entry,
  state,
}: {
  readonly entry: GalleryEntry
  readonly state: StateChoice
}) {
  const Renderer = entryRenderers[entry.name as keyof typeof entryRenderers]
  const visible = entry.states.filter((item) => state === 'all' || item.kind === state)

  return (
    <Box
      as="section"
      id={anchorFor(entry.name)}
      aria-labelledby={`${anchorFor(entry.name)}-heading`}
      borderTop="1px solid"
      borderColor="border.subtle"
      py={space[8]}
      scrollMarginTop={space[24]}
    >
      <Box display="flex" flexWrap="wrap" alignItems="baseline" gap={space[3]} mb={space[4]}>
        <Box as="h2" id={`${anchorFor(entry.name)}-heading`} textStyle="sectionTitle">
          {entry.name}
        </Box>
        <Box
          textStyle="meta"
          color="text.secondary"
          bg="bg.subtle"
          borderRadius={radii.tag}
          px={space[2]}
          py={space[1]}
        >
          {entry.area}
        </Box>
      </Box>

      {entry.note === undefined ? null : (
        <Box textStyle="meta" color="text.muted" mb={space[4]}>
          {entry.note}
        </Box>
      )}

      {visible.length === 0 ? (
        <Box textStyle="meta" color="text.muted">
          No {state} state. This entry demonstrates: {entry.states.map((s) => s.name).join(', ')}.
        </Box>
      ) : (
        <Box display="flex" flexWrap="wrap" gap={space[6]} alignItems="flex-start">
          {visible.map((item) => {
            const isWideWorkspace = entry.name === 'ProfileHeader' && item.name === 'workspace'

            return (
              <Box
                key={item.name}
                as="figure"
                m={0}
                flex={isWideWorkspace ? '0 0 100%' : '1 1 320px'}
                minW="0"
                display="flex"
                flexDirection="column"
                gap={space[2]}
              >
                <Box as="figcaption" textStyle="meta" color="text.muted">
                  {item.name}
                  {item.kind === undefined ? '' : ` (${item.kind})`}
                </Box>
                <Box
                  border="1px solid"
                  borderColor="border.subtle"
                  borderRadius={radii.card}
                  p={space[4]}
                  bg="bg.page"
                  minW="0"
                  overflowX="auto"
                >
                  <Renderer state={item.name} />
                </Box>
              </Box>
            )
          })}
        </Box>
      )}
    </Box>
  )
}

export function GalleryApp() {
  const { colorMode, setColorMode } = useColorMode()
  const [viewport, setViewport] = useState<ViewportChoice>('1440px')
  const [motion, setMotion] = useState<MotionChoice>('normal')
  const [content, setContent] = useState<ContentChoice>('normal')
  const [media, setMedia] = useState<MediaChoice>('present')
  const [state, setState] = useState<StateChoice>('all')

  useEffect(() => {
    setReducedMotionOverride(motion === 'reduced')
  }, [motion])

  const controls = useMemo<GalleryControls>(
    () => ({
      theme: colorMode === 'dark' ? 'dark' : 'light',
      viewport,
      motion,
      content,
      media,
      state,
    }),
    [colorMode, viewport, motion, content, media, state],
  )

  return (
    <Box display="flex" flexDirection={{ base: 'column', lg: 'row' }} alignItems="flex-start">
      <style>{REDUCED_MOTION_CSS}</style>

      <EntryIndex state={state} />

      <Box flex="1 1 auto" minW="0" p={space[4]}>
        <Box as="header" mb={space[6]}>
          <Box as="h1" textStyle="pageTitle" mb={space[1]}>
            Horizon v2 component gallery
          </Box>
          <Box textStyle="meta" color="text.muted" maxW="content">
            A review surface. It mounts `horizonTheme` and the sample fixtures only - no router
            beyond an in-memory one, no auth, no API. Every panel below is the real exported
            component. The viewport control constrains the preview frame; CSS breakpoints still
            follow the browser window, so narrow the window too when checking a responsive switch.
          </Box>
        </Box>

        <Box
          as="section"
          aria-label="Gallery controls"
          position={{ lg: 'sticky' }}
          top="0"
          zIndex={1}
          bg="bg.surface"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius={radii.card}
          p={space[4]}
          mb={space[6]}
          display="flex"
          flexWrap="wrap"
          gap={space[6]}
        >
          <ControlGroup
            label="theme"
            options={['light', 'dark'] as const}
            value={colorMode === 'dark' ? 'dark' : 'light'}
            onChange={setColorMode}
          />
          <ControlGroup
            label="viewport"
            options={VIEWPORTS}
            value={viewport}
            onChange={setViewport}
          />
          <ControlGroup label="motion" options={MOTIONS} value={motion} onChange={setMotion} />
          <ControlGroup label="content" options={CONTENTS} value={content} onChange={setContent} />
          <ControlGroup label="media" options={MEDIAS} value={media} onChange={setMedia} />
          <ControlGroup label="state" options={STATES} value={state} onChange={setState} />
        </Box>

        <Box
          data-gallery-motion={motion}
          maxW={viewport}
          borderRadius={radii.card}
          border="1px dashed"
          borderColor="border.control"
          px={space[4]}
        >
          <GalleryProvider controls={controls}>
            {galleryAreaOrder.flatMap((area) =>
              galleryEntries
                .filter((entry) => entry.area === area)
                .map((entry) => <EntrySection key={entry.name} entry={entry} state={state} />),
            )}
          </GalleryProvider>
        </Box>
      </Box>
    </Box>
  )
}
