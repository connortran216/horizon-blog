/**
 * Horizon Design System v2 - motion entries.
 *
 * Every panel here answers to the gallery motion control, which drives the same
 * media query the system reads. Switching it to reduced should stop travel and
 * leave colour, opacity and focus alone.
 */

import { useRef, useState } from 'react'
import { Box } from '@chakra-ui/react'

import {
  COPY_MARKER,
  Eyebrow,
  Heading,
  HoverLift,
  InteractionTrace,
  LayoutTransition,
  MarginalNote,
  NO_VEIL,
  PointerLight,
  PressFeedback,
  Reveal,
  SIGNAL_HOST,
  SignalLine,
  SignalRoute,
  SignalTarget,
  Stagger,
  StateHandoff,
  Surface,
  SynapseField,
  Text,
  TimelineEntry,
  Typeset,
  useMotionPolicy,
  useReducedMotionPreference,
  useRevealInView,
  useViewTransition,
} from '../../index'
import { radii, space } from '../../../theme/tokens'
import { Filler, ReadOut, type EntryRenderer } from './support'

/** A plain control for the harnesses. Not a design-system button on purpose. */
function HarnessButton({
  onClick,
  children,
}: {
  readonly onClick: () => void
  readonly children: string
}) {
  return (
    <Box
      as="button"
      type="button"
      onClick={onClick}
      bg="bg.subtle"
      color="text.primary"
      border="1px solid"
      borderColor="border.control"
      borderRadius={radii.control}
      px={space[3]}
      py={space[2]}
      textStyle="meta"
    >
      {children}
    </Box>
  )
}

const fieldDensity: Record<string, number> = { bare: 40, sparse: 18, dense: 64 }

/** The hero's own composition, small: an eyebrow and a headline the field writes. */
function FieldCopy() {
  return (
    <Box p={space[8]} maxW="60%" {...{ [COPY_MARKER]: '' }}>
      <SignalTarget>
        <Eyebrow as="p">Horizon blog</Eyebrow>
      </SignalTarget>
      <Heading as="h2" recipe="sectionTitle">
        <Typeset emphasis="curious readers.">
          Human stories, blogs, and thoughtful writing for curious readers.
        </Typeset>
      </Heading>
    </Box>
  )
}

function SynapseFieldEntry({ state }: { readonly state: string }) {
  if (state === 'as the page') {
    return (
      <Box bg="bg.page" mx={`-${space[6]}`}>
        <SynapseField key={state} variant="canvas" minH="360px" density={56}>
          <FieldCopy />
        </SynapseField>
      </Box>
    )
  }

  if (state === 'with copy') {
    return (
      <SynapseField key={state} maxW="720px" minH="320px" display="flex" alignItems="center">
        <FieldCopy />
      </SynapseField>
    )
  }

  if (state === 'leaning') {
    return <LeaningFieldEntry />
  }

  return (
    <SynapseField
      key={state}
      maxW="720px"
      minH="300px"
      density={fieldDensity[state] ?? 40}
      veil={NO_VEIL}
    />
  )
}

/** Three places on the plate, the way About's editorial track uses them. */
const leaningPlaces = [
  { label: 'Lean high', point: { x: 0.8, y: 0.26 } },
  { label: 'Lean out', point: { x: 0.9, y: 0.5 } },
  { label: 'Lean low', point: { x: 0.78, y: 0.74 } },
] as const

function LeaningFieldEntry() {
  const [place, setPlace] = useState(0)

  return (
    <Box display="flex" flexDirection="column" gap={space[3]}>
      <Box display="flex" gap={space[2]}>
        {leaningPlaces.map((item, index) => (
          <HarnessButton key={item.label} onClick={() => setPlace(index)}>
            {item.label}
          </HarnessButton>
        ))}
      </Box>
      <SynapseField
        maxW="720px"
        minH="300px"
        density={30}
        veil={NO_VEIL}
        focus={leaningPlaces[place].point}
      />
    </Box>
  )
}

/** Replays a route: a fresh key is a fresh travel. */
function SignalRouteEntry({ state }: { readonly state: string }) {
  const [nonce, setNonce] = useState(0)
  const replay = (
    <HarnessButton onClick={() => setNonce((current) => current + 1)}>Replay</HarnessButton>
  )

  if (state === 'down a divider') {
    return (
      <Box display="flex" flexDirection="column" gap={space[3]}>
        {replay}
        <SignalRoute
          key={nonce}
          orientation="vertical"
          trigger="mount"
          position="relative"
          pl={space[8]}
          maxW="420px"
        >
          <SignalLine position="absolute" insetBlock={0} left={0} />
          <Box display="flex" flexDirection="column" gap={space[8]}>
            {['Email', 'Phone', 'Location'].map((label) => (
              <Box key={label} display="flex" gap={space[4]} alignItems="center">
                <SignalTarget>
                  <Box boxSize={space[8]} borderRadius="full" bg="bg.subtle" />
                </SignalTarget>
                <Text recipe="body">{label}</Text>
              </Box>
            ))}
          </Box>
        </SignalRoute>
      </Box>
    )
  }

  if (state === 'over a band') {
    return (
      <Box display="flex" flexDirection="column" gap={space[3]}>
        {replay}
        <SignalRoute key={nonce} trigger="mount" maxW="720px">
          <SignalLine tone="action" mb={space[6]} />
          <Box display="grid" gridTemplateColumns="repeat(4, minmax(0, 1fr))" gap={space[6]}>
            {['5+ years', 'Python', 'Systems', 'Writing'].map((value) => (
              <SignalTarget key={value}>
                <Heading as="h3" recipe="sectionTitle">
                  {value}
                </Heading>
              </SignalTarget>
            ))}
          </Box>
        </SignalRoute>
      </Box>
    )
  }

  return (
    <Box display="flex" flexDirection="column" gap={space[3]}>
      {replay}
      <SignalRoute key={nonce} pace="order" trigger="mount" maxW="720px">
        <SignalTarget>
          <Eyebrow as="p">Horizon blog</Eyebrow>
        </SignalTarget>
        <Heading as="h2" recipe="display">
          <Typeset emphasis="technology.">
            Thoughtful blogs about life, work, and technology.
          </Typeset>
        </Heading>
        <SignalLine mt={space[6]} />
      </SignalRoute>
    </Box>
  )
}

function SignalLineEntry({ state }: { readonly state: string }) {
  if (state === 'vertical') {
    return (
      <Box {...{ [SIGNAL_HOST]: '' }} display="flex" gap={space[4]} height="160px" maxW="420px">
        <SignalLine orientation="vertical" tone="action" />
        <Text recipe="body">Hover this block: the line draws down its edge.</Text>
      </Box>
    )
  }

  return (
    <Surface depth="raised" isInteractive maxW="360px" padded={false} {...{ [SIGNAL_HOST]: '' }}>
      <Box aspectRatio="16 / 9" bg="bg.subtle" />
      <SignalLine tone={state === 'quiet' ? 'quiet' : 'action'} />
      <Box p={space[6]}>
        <Text recipe="body">Hover or focus the card: its cover seam draws.</Text>
      </Box>
    </Surface>
  )
}

function SignalTargetEntry({ state }: { readonly state: string }) {
  const target = (
    <SignalTarget>
      <Text recipe="body">Copy that waits for its signal.</Text>
    </SignalTarget>
  )

  if (state === 'outside a field') {
    return <Filler>{target}</Filler>
  }

  return (
    <SynapseField key={state} maxW="560px" minH="220px" display="flex" alignItems="center">
      <Box p={space[8]}>{target}</Box>
    </SynapseField>
  )
}

function PointerLightEntry({ state }: { readonly state: string }) {
  return (
    <Box maxW="560px">
      <Surface depth="feature" padded={false}>
        <PointerLight disabled={state === 'disabled'}>
          {/* Sample artwork with no image dependency: a quiet ambient wash. */}
          <Box
            sx={{ aspectRatio: '16 / 10' }}
            bgGradient="linear(to-br, ambient.glow, bg.subtle 55%, ambient.sweep)"
          />
        </PointerLight>
      </Surface>
    </Box>
  )
}

function TypesetEntry({ state }: { readonly state: string }) {
  const [nonce, setNonce] = useState(0)

  if (state === 'in a field') {
    return (
      <SynapseField maxW="720px" minH="300px" display="flex" alignItems="center">
        <Box p={space[8]} maxW="70%">
          <Heading as="h2" recipe="sectionTitle">
            <Typeset emphasis="curious readers.">
              Human stories, blogs, and thoughtful writing for curious readers.
            </Typeset>
          </Heading>
        </Box>
      </SynapseField>
    )
  }

  return (
    <Box display="flex" flexDirection="column" gap={space[3]}>
      <HarnessButton onClick={() => setNonce((current) => current + 1)}>
        Set the headline again
      </HarnessButton>
      <Heading as="h2" recipe="display">
        <Typeset
          key={nonce}
          trigger={state === 'in view' ? 'inView' : 'mount'}
          emphasis={state === 'with emphasis' ? 'curious readers.' : undefined}
        >
          Human stories, blogs, and thoughtful writing for curious readers.
        </Typeset>
      </Heading>
    </Box>
  )
}

function HoverLiftEntry({ state }: { readonly state: string }) {
  return (
    <HoverLift disabled={state === 'disabled'}>
      <Surface depth="raised" isInteractive padded>
        <Text recipe="body">Hover this sample surface.</Text>
      </Surface>
    </HoverLift>
  )
}

function PressFeedbackEntry({ state }: { readonly state: string }) {
  return (
    <PressFeedback disabled={state === 'disabled'}>
      <Surface depth="raised" isInteractive padded>
        <Text recipe="body">Press and hold this sample surface.</Text>
      </Surface>
    </PressFeedback>
  )
}

function LayoutTransitionEntry() {
  const [items, setItems] = useState(['One', 'Two', 'Three', 'Four'])

  return (
    <Box display="flex" flexDirection="column" gap={space[3]}>
      <HarnessButton onClick={() => setItems((current) => [...current.slice(1), current[0]])}>
        Reorder the sample list
      </HarnessButton>
      <Box display="flex" flexWrap="wrap" gap={space[2]}>
        {items.map((item) => (
          <LayoutTransition key={item} layoutGroupId="gallery-layout-transition">
            <Filler>{item}</Filler>
          </LayoutTransition>
        ))}
      </Box>
    </Box>
  )
}

function RevealEntry({ state }: { readonly state: string }) {
  const [nonce, setNonce] = useState(0)

  return (
    <Box display="flex" flexDirection="column" gap={space[3]}>
      <HarnessButton onClick={() => setNonce((current) => current + 1)}>
        Replay the reveal
      </HarnessButton>
      <Reveal key={nonce} trigger={state === 'in view' ? 'inView' : 'mount'} duration="reveal">
        <Filler>Sample content that reveals.</Filler>
      </Reveal>
    </Box>
  )
}

function StaggerEntry() {
  const [nonce, setNonce] = useState(0)

  return (
    <Box display="flex" flexDirection="column" gap={space[3]}>
      <HarnessButton onClick={() => setNonce((current) => current + 1)}>
        Replay the stagger
      </HarnessButton>
      <Box key={nonce} display="flex" flexDirection="column" gap={space[2]}>
        <Stagger trigger="mount">
          <Filler>First</Filler>
          <Filler>Second</Filler>
          <Filler>Third</Filler>
          <Filler>Fourth</Filler>
        </Stagger>
      </Box>
    </Box>
  )
}

function MarginalNoteEntry() {
  return (
    <MarginalNote>
      <Text recipe="body">A supporting note arrives beside its own editorial rule.</Text>
    </MarginalNote>
  )
}

function InteractionTraceEntry({ state }: { readonly state: string }) {
  return (
    <InteractionTrace active={state === 'confirmed'}>
      <HarnessButton onClick={() => undefined}>
        Focus or hover this communication action
      </HarnessButton>
    </InteractionTrace>
  )
}

function TimelineEntryEntry() {
  return (
    <TimelineEntry>
      <Text recipe="body">A focusable timeline entry with screen-only emphasis.</Text>
    </TimelineEntry>
  )
}

function StateHandoffEntry() {
  const [state, setState] = useState('ready')

  return (
    <Box display="flex" flexDirection="column" gap={space[3]}>
      <HarnessButton
        onClick={() => setState((current) => (current === 'ready' ? 'done' : 'ready'))}
      >
        Swap the sample state
      </HarnessButton>
      <StateHandoff stateKey={state}>
        <Filler>Current state: {state}</Filler>
      </StateHandoff>
    </Box>
  )
}

function UseMotionPolicyEntry() {
  const policy = useMotionPolicy()

  return <ReadOut>{JSON.stringify(policy, null, 2)}</ReadOut>
}

function UseReducedMotionPreferenceEntry() {
  const reduced = useReducedMotionPreference()

  return (
    <ReadOut>
      {reduced
        ? 'prefers-reduced-motion: reduce — travel is off.'
        : 'prefers-reduced-motion: no-preference — full motion.'}
    </ReadOut>
  )
}

function UseRevealInViewEntry() {
  const ref = useRef<HTMLDivElement>(null)
  const revealed = useRevealInView(ref)

  return (
    <Box display="flex" flexDirection="column" gap={space[2]}>
      <Box ref={ref}>
        <Filler>The observed sample element.</Filler>
      </Box>
      <ReadOut>{revealed ? 'Seen at least once.' : 'Not seen yet — scroll it into view.'}</ReadOut>
    </Box>
  )
}

function UseViewTransitionEntry() {
  const runTransition = useViewTransition()
  const [label, setLabel] = useState('Sample value A')
  const [animated, setAnimated] = useState<boolean | null>(null)

  return (
    <Box display="flex" flexDirection="column" gap={space[3]}>
      <HarnessButton
        onClick={() => {
          const result = runTransition(() =>
            setLabel((current) => (current.endsWith('A') ? 'Sample value B' : 'Sample value A')),
          )

          setAnimated(result.animated)
        }}
      >
        Swap the sample value
      </HarnessButton>
      <Filler>{label}</Filler>
      <ReadOut>
        {animated === null
          ? 'Not run yet.'
          : animated
            ? 'The browser ran it inside a view transition.'
            : 'Applied immediately: reduced motion, or no browser support.'}
      </ReadOut>
    </Box>
  )
}

export const motionEntries = {
  HoverLift: HoverLiftEntry,
  InteractionTrace: InteractionTraceEntry,
  LayoutTransition: LayoutTransitionEntry,
  MarginalNote: MarginalNoteEntry,
  PointerLight: PointerLightEntry,
  PressFeedback: PressFeedbackEntry,
  Reveal: RevealEntry,
  SignalLine: SignalLineEntry,
  SignalRoute: SignalRouteEntry,
  SignalTarget: SignalTargetEntry,
  Stagger: StaggerEntry,
  StateHandoff: StateHandoffEntry,
  SynapseField: SynapseFieldEntry,
  TimelineEntry: TimelineEntryEntry,
  Typeset: TypesetEntry,
  useMotionPolicy: UseMotionPolicyEntry,
  useReducedMotionPreference: UseReducedMotionPreferenceEntry,
  useRevealInView: UseRevealInViewEntry,
  useViewTransition: UseViewTransitionEntry,
} satisfies Record<string, EntryRenderer>
