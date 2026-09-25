/**
 * Horizon Design System v2 - a headline that sets itself.
 *
 * Wrap the text of a display heading and each word rises through its baseline
 * in turn. It renders only inline elements, so it is valid inside an `h1`, and
 * it paints nothing of its own - except, when asked, one rule.
 *
 * Inside a `SynapseField` the words are anchors: each one waits for the field
 * to send it a signal and rises when the signal lands, glowing for a pulse in
 * the action colour. The network writes the sentence. Outside a field the
 * words rise on their own, a tick apart.
 *
 * `emphasis` names a run of words to underline. The rule is a hairline in the
 * action colour that draws itself left to right beneath the phrase once the
 * whole sentence has landed - or, in a field, when the signal reaches each
 * emphasised word. It is decoration, hidden from assistive technology along
 * with the moving words.
 *
 * Assistive technology reads the sentence once, whole, from a visually hidden
 * span; the moving words are hidden from it. Splitting a heading into a dozen
 * inline-blocks otherwise makes some screen readers pause between every word.
 */

import { Fragment, useRef } from 'react'
import { Box, VisuallyHidden } from '@chakra-ui/react'
import { motion } from 'framer-motion'

import { componentTokens, type DurationToken } from '../../theme/tokens'
import { durationSeconds, transitionFor, type MotionPolicy } from './policy.logic'
import { synapseTiming } from './synapse.logic'
import { useSynapseSignals } from './synapseContext'
import {
  typesetClip,
  typesetDelays,
  typesetEmphasis,
  typesetRule,
  typesetRuleDelays,
  typesetVariants,
  typesetWords,
  type TypesetWord,
} from './typeset.logic'
import { useMotionPolicy } from './useMotionPolicy'
import { useRevealInView } from './useRevealInView'
import { useSynapseAnchor } from './useSynapseAnchor'

export interface TypesetProps {
  /** The sentence. A string, because a word is the unit that moves. */
  children: string
  /** `mount` for a headline above the fold; `inView` for one further down. */
  trigger?: 'mount' | 'inView'
  /** Entry duration for each word. The editorial `reveal` by default. */
  duration?: DurationToken
  /** Seconds before the first word. Ignored inside a field. */
  initialDelay?: number
  /** A run of words, as written, to underline with a drawn rule. */
  emphasis?: string
  className?: string
}

const MotionBox = motion(Box)
const litGlow = { blur: componentTokens.signal.haloBlur } as const
const lineBox = { display: 'inline-block', clipPath: typesetClip, position: 'relative' } as const
const wordStyle = { display: 'inline-block' } as const

export function Typeset({
  children,
  trigger = 'mount',
  duration = 'reveal',
  initialDelay = 0,
  emphasis,
  className,
}: TypesetProps) {
  const policy = useMotionPolicy()
  const inField = useSynapseSignals() !== null
  const ref = useRef<HTMLSpanElement>(null)
  const revealed = useRevealInView(ref, { enabled: trigger === 'inView' && !inField })
  const words = typesetWords(children)
  const delays = inField ? words.map(() => 0) : typesetDelays(words.length, policy, initialDelay)
  const wordSeconds = durationSeconds(duration, policy)
  const marked = typesetEmphasis(words, emphasis)
  const ruleDelays = inField
    ? new Map([...marked].map((index) => [index, 0]))
    : typesetRuleDelays(marked, delays, wordSeconds, policy)

  return (
    <span ref={ref} className={className}>
      <VisuallyHidden>{children}</VisuallyHidden>
      <span aria-hidden="true">
        {words.map((item, index) => (
          <Fragment key={item.key}>
            {index > 0 ? ' ' : null}
            <Word
              word={item}
              policy={policy}
              duration={duration}
              delay={delays[index]}
              revealed={revealed}
              ruled={marked.has(index)}
              ruleDelay={ruleDelays.get(index) ?? 0}
            />
          </Fragment>
        ))}
      </span>
    </span>
  )
}

interface WordProps {
  readonly word: TypesetWord
  readonly policy: MotionPolicy
  readonly duration: DurationToken
  readonly delay: number
  /** The sentence as a whole has been asked to appear. */
  readonly revealed: boolean
  readonly ruled: boolean
  readonly ruleDelay: number
}

/**
 * One word. In a field it is an anchor and appears when hit; otherwise it
 * appears when the sentence is revealed, after its own delay.
 */
function Word({ word, policy, duration, delay, revealed, ruled, ruleDelay }: WordProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const timing = synapseTiming(policy)
  const { hit, lit } = useSynapseAnchor(ref, Math.round(timing.pulse * 1000))
  const visible = revealed && hit
  const variants = typesetVariants(policy)

  return (
    <span ref={ref} style={lineBox}>
      <MotionBox
        as="span"
        display="inline-block"
        style={wordStyle}
        data-lit={lit ? 'true' : undefined}
        initial="hidden"
        animate={visible ? 'visible' : 'hidden'}
        variants={variants}
        transition={transitionFor(duration, policy, delay)}
        sx={{
          transition:
            'color var(--chakra-transition-duration-fast), text-shadow var(--chakra-transition-duration-fast)',
          '&[data-lit="true"]': {
            color: 'action.primary',
            // The glow is the field's ink: cobalt on the light canvas, lime on the dark.
            textShadow: `0 0 ${litGlow.blur} var(--chakra-colors-ambient-glow)`,
            _dark: { textShadow: `0 0 ${litGlow.blur} var(--chakra-colors-ambient-accentGlow)` },
          },
        }}
      >
        {word.text}
      </MotionBox>
      {ruled ? (
        <MotionBox
          as="span"
          data-typeset-rule=""
          position="absolute"
          insetX={0}
          bottom={typesetRule.bottom}
          height={typesetRule.height}
          bg="action.primary"
          borderRadius="full"
          sx={{ transformOrigin: 'left center' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: visible ? 1 : 0 }}
          transition={transitionFor(duration, policy, ruleDelay)}
        />
      ) : null}
    </span>
  )
}
