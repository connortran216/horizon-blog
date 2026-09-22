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
  HoverLift,
  InteractionTrace,
  LayoutTransition,
  MarginalNote,
  PressFeedback,
  Reveal,
  Stagger,
  StateHandoff,
  Surface,
  Text,
  TimelineEntry,
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
  PressFeedback: PressFeedbackEntry,
  Reveal: RevealEntry,
  Stagger: StaggerEntry,
  StateHandoff: StateHandoffEntry,
  TimelineEntry: TimelineEntryEntry,
  useMotionPolicy: UseMotionPolicyEntry,
  useReducedMotionPreference: UseReducedMotionPreferenceEntry,
  useRevealInView: UseRevealInViewEntry,
  useViewTransition: UseViewTransitionEntry,
} satisfies Record<string, EntryRenderer>
