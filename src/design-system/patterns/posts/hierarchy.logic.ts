/**
 * Horizon Design System v2 - hierarchy label de-duplication.
 *
 * `dsv2.5.1` acceptance 2: "Content does not duplicate hierarchy labels."
 *
 * The failure it names is real and it is in the current production Home page: a
 * section headed "Latest writing" whose first card carries a "Lead blog" badge
 * and whose siblings carry "Recent blog". The reader has already been told this
 * is the latest writing; repeating it on every card spends the one line of
 * eyebrow space on a word that carries no new information, and it makes the
 * cards look like they belong to different collections when they do not.
 *
 * So a card's own label is not a constant. It is resolved against what the
 * enclosing section has already said, and it disappears when it would only echo
 * that. The context is passed in explicitly - a pattern never reaches up the
 * DOM to find its heading - which is also what makes this testable.
 */

/**
 * Words that carry no hierarchy meaning on their own. A card labelled "The
 * blog" under a section headed "Blog" is a duplicate; a card labelled "Series"
 * under a section headed "Latest writing" is not, and neither list should be
 * decided by whether someone typed "the".
 */
const STOP_WORDS = new Set([
  'a',
  'all',
  'an',
  'and',
  'for',
  'from',
  'in',
  'more',
  'my',
  'of',
  'on',
  'or',
  'our',
  'the',
  'to',
  'with',
  'your',
])

/**
 * Lower case, strip punctuation and collapse whitespace. Diacritics are kept:
 * Vietnamese section headings are real content here, and folding them would
 * make "bàn" and "ban" the same word.
 */
export function normaliseLabel(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Significant words: no stop words, no bare numbers, nothing empty. */
export function labelWords(value: string): string[] {
  return normaliseLabel(value)
    .split(' ')
    .filter((word) => word.length > 0 && !STOP_WORDS.has(word) && !/^\p{N}+$/u.test(word))
}

/**
 * Build the set of words a section has already spoken. Callers pass the eyebrow
 * and the heading; anything else the section renders as a label can be added.
 */
export function hierarchyContext(...labels: readonly (string | null | undefined)[]): string[] {
  const words = new Set<string>()

  for (const label of labels) {
    if (!label) {
      continue
    }

    for (const word of labelWords(label)) {
      words.add(word)
    }
  }

  return [...words]
}

/**
 * Fold a regular English plural so "blog" and "blogs" are the same word.
 *
 * Deliberately crude: it exists so a card labelled "Lead blog" is caught under
 * a heading that says "Latest blogs", which is the exact case this system has.
 * It is not a stemmer and is never shown to a reader - only the raw words are.
 */
function stem(word: string): string {
  if (word.length > 4 && word.endsWith('ies')) {
    return `${word.slice(0, -3)}y`
  }

  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) {
    return word.slice(0, -1)
  }

  return word
}

/**
 * The significant words a candidate label shares with its context.
 *
 * Returned rather than reduced to a boolean because the overlap is what makes a
 * review finding legible: "Lead blog duplicates blog" is actionable, "duplicate
 * label" is not, and the gallery in B6 can show the offending word.
 *
 * The words come back in the candidate's own spelling, not the folded form, so
 * the finding quotes what is actually on the card.
 */
export function duplicatedWords(
  candidate: string | null | undefined,
  context: readonly string[],
): string[] {
  if (!candidate) {
    return []
  }

  const contextStems = new Set(context.map(stem))

  return labelWords(candidate).filter((word) => contextStems.has(stem(word)))
}

/**
 * The label a card should actually render, or `null` for no label at all.
 *
 * Suppression is all-or-nothing on purpose. A label with its duplicated word
 * removed - "Lead blog" under "Latest writing" becoming "Lead" - is a new
 * phrase nobody wrote, and inventing copy is exactly what `DESIGN.md` forbids.
 * Either the whole label adds something, or the card is quieter without it.
 *
 * With no context supplied nothing is suppressed: a card rendered on its own,
 * or in the B6 gallery, has no section to repeat.
 */
export function resolveHierarchyLabel(
  candidate: string | null | undefined,
  context: readonly string[] = [],
): string | null {
  const trimmed = candidate?.trim() ?? ''

  if (trimmed.length === 0 || context.length === 0) {
    return trimmed.length > 0 ? trimmed : null
  }

  return duplicatedWords(trimmed, context).length > 0 ? null : trimmed
}

/**
 * Whether a whole set of sibling labels would collapse to nothing.
 *
 * If every card in a section loses its label, the section is not carrying a
 * distinction the cards can express - and the honest fix is to drop the labels
 * from the design rather than to keep one arbitrarily. The gallery reports this
 * so the decision is visible instead of silent.
 */
export function labelsAreRedundant(
  candidates: readonly (string | null | undefined)[],
  context: readonly string[],
): boolean {
  if (candidates.length === 0) {
    return false
  }

  return candidates.every((candidate) => resolveHierarchyLabel(candidate, context) === null)
}
