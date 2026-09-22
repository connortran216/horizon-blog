/**
 * Horizon Design System v2 - typesetting a headline.
 *
 * A display headline does not arrive as one block. Each word rises through its
 * own baseline - clipped at the line box, the way the sun clears a horizon - a
 * `tick` after the word before it. The decisions live here so a test can hold
 * them without a renderer: how a sentence splits, how long each word waits, and
 * what "rise" means when the reader has asked for less motion.
 */

import { transform } from '../../theme/tokens'
import { staggerDelays, type MotionPolicy } from './policy.logic'

export interface TypesetWord {
  readonly text: string
  /** Stable across re-renders of the same sentence; unique within it. */
  readonly key: string
}

/**
 * Words, not letters. Letter-by-letter arrival is the effect every landing page
 * has, and at 64px it reads as a typewriter. A word is the unit a reader
 * actually takes in, so it is the unit that moves.
 *
 * Runs of whitespace collapse and punctuation stays attached to its word, so
 * "readers." is one word and never a dot arriving on its own.
 */
export function typesetWords(text: string): TypesetWord[] {
  return text
    .trim()
    .split(/\s+/u)
    .filter((word) => word.length > 0)
    .map((word, index) => ({ text: word, key: `${index}:${word}` }))
}

/**
 * Per-word entry delays in seconds, one `tick` apart. The cap is the same one
 * `Stagger` uses, so a very long headline is still fully set well inside a
 * second. Under reduced motion every word is zero and the line fades in whole.
 */
export function typesetDelays(count: number, policy: MotionPolicy, initialDelay = 0): number[] {
  return staggerDelays({ count, policy, step: 'tick', initialDelay })
}

export interface TypesetTarget {
  readonly opacity: number
  /** A CSS length. `em`, so the rise scales with the type ramp it sits in. */
  readonly y: string
}

export interface TypesetVariants {
  [state: string]: TypesetTarget
  hidden: TypesetTarget
  visible: TypesetTarget
}

/** No travel under reduced motion; the opacity change is the whole entry. */
export function typesetVariants(policy: MotionPolicy): TypesetVariants {
  return {
    hidden: { opacity: 0, y: policy.translation ? transform.typesetRise : '0em' },
    visible: { opacity: 1, y: '0em' },
  }
}

/**
 * Which words carry the drawn underline. `emphasis` is a run of words as the
 * reader sees them - "curious readers." - matched case-sensitively against the
 * sentence's own words, so a stray trailing space or a different split cannot
 * make it miss. The first match wins; no match means no underline.
 */
export function typesetEmphasis(words: readonly TypesetWord[], emphasis?: string): Set<number> {
  const target = emphasis === undefined ? [] : typesetWords(emphasis).map((word) => word.text)
  const marked = new Set<number>()

  if (target.length === 0 || target.length > words.length) {
    return marked
  }

  for (let start = 0; start + target.length <= words.length; start += 1) {
    if (target.every((text, offset) => words[start + offset].text === text)) {
      for (let offset = 0; offset < target.length; offset += 1) {
        marked.add(start + offset)
      }

      return marked
    }
  }

  return marked
}

/**
 * When each emphasised word's rule starts drawing, in seconds: after the last
 * word of the sentence has landed, one after another so the line travels left
 * to right beneath the phrase. Zero for every rule under reduced motion.
 */
export function typesetRuleDelays(
  marked: ReadonlySet<number>,
  wordDelays: readonly number[],
  wordDuration: number,
  policy: MotionPolicy,
): Map<number, number> {
  const delays = new Map<number, number>()
  const order = [...marked].sort((a, b) => a - b)
  const settled = wordDelays.length > 0 ? Math.max(...wordDelays) + wordDuration : 0

  order.forEach((index, position) => {
    delays.set(index, policy.reduced ? 0 : settled + position * wordDuration * 0.5)
  })

  return delays
}

/** The rule's thickness and seat, in em so they scale with the type ramp. */
export const typesetRule = { height: '0.06em', bottom: '0.02em' } as const

/**
 * The clip each word rises through. Closed only at the bottom - that edge is
 * the horizon - and opened generously above and to the sides so an ascender,
 * an italic overhang or a Vietnamese stacked diacritic is never cut once the
 * word has landed. The small allowance below the line box is for descenders
 * at the display ramp's tight leading.
 */
export const typesetClip = 'inset(-0.4em -0.15em -0.1em -0.15em)'
