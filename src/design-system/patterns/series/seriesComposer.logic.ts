/**
 * Horizon Design System v2 - the decisions behind writing a new Series.
 *
 * The limits are the backend's: a title of at most 160 characters, required,
 * and a description of at most 1000. The composer says them before a request is
 * made, because a server refusal after the author has written a description is
 * the worst moment to learn the rule.
 */

export const SERIES_TITLE_MAX = 160
export const SERIES_DESCRIPTION_MAX = 1000

export interface SeriesComposerInput {
  readonly title: string
  readonly description: string
  readonly isSubmitting: boolean
}

export interface SeriesComposerState {
  readonly canSubmit: boolean
  /**
   * Why the submit button is disabled, said out loud. `null` while it can be
   * pressed, and while a submit is running - the button says that itself.
   */
  readonly blockedReason: string | null
  readonly titleError: string | null
  readonly descriptionError: string | null
  /** "120 of 1,000 characters", for the description hint. */
  readonly descriptionCount: string
}

const count = new Intl.NumberFormat('en-US')

export function seriesComposerState({
  title,
  description,
  isSubmitting,
}: SeriesComposerInput): SeriesComposerState {
  const trimmedTitle = title.trim()
  const titleError =
    trimmedTitle.length > SERIES_TITLE_MAX
      ? `Keep the title to ${SERIES_TITLE_MAX} characters.`
      : null
  const descriptionError =
    description.trim().length > SERIES_DESCRIPTION_MAX
      ? `Keep the description to ${count.format(SERIES_DESCRIPTION_MAX)} characters.`
      : null

  const blockedReason =
    trimmedTitle.length === 0
      ? 'A Series needs a title before it can be created.'
      : (titleError ?? descriptionError)

  return {
    canSubmit: !isSubmitting && blockedReason === null,
    blockedReason: isSubmitting ? null : blockedReason,
    titleError,
    descriptionError,
    descriptionCount: `${count.format(description.trim().length)} of ${count.format(
      SERIES_DESCRIPTION_MAX,
    )} characters`,
  }
}

/** What is sent: trimmed, and an empty description sent as empty. */
export function seriesComposerRequest(title: string, description: string) {
  return { title: title.trim(), description: description.trim() }
}
