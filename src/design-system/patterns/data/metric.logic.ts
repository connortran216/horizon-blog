/**
 * Horizon Design System v2 - metric formatting and sample honesty.
 *
 * `horizon-blog-dsv2.6.3` acceptance 1: approximate metrics are labelled.
 *
 * The backend already knows which numbers are estimates - `AnalyticsSummary`
 * carries `uniqueReadersApproximate` beside `estimatedUniqueReaders`. What this
 * module does is make it impossible to render one without saying so. `formatted`
 * and the `approximate` label are produced together by one function, and the
 * approximate branch has no shape in which the marker is absent.
 *
 * The second thing here is sample honesty. A completion rate computed from four
 * reading sessions is arithmetically fine and editorially worthless, and a
 * dashboard that shows "68%" without saying it came from four sessions invites
 * an author to rewrite their introduction on the strength of noise.
 */

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

export type MetricKind = 'count' | 'percent' | 'duration'

export interface MetricValueInput {
  readonly value: number
  readonly kind?: MetricKind
  /** The backend says this number is an estimate. */
  readonly isApproximate?: boolean
  readonly locale?: string
}

export interface MetricValueOutput {
  /** What is drawn. Carries the `~` prefix when the number is an estimate. */
  readonly display: string
  /** The number alone, without any marker. For a table cell that has its own. */
  readonly bare: string
  readonly isApproximate: boolean
  /**
   * The visible marker, or `null`. A chip, not a colour: an estimate has to be
   * distinguishable in greyscale and readable at a glance.
   */
  readonly marker: string | null
  /**
   * What assistive technology hears after the number. `~` is silent in most
   * screen readers, so the word has to be there as well.
   */
  readonly spokenSuffix: string | null
}

const integerFormat = (locale?: string) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 0 })

/**
 * Seconds as something a person reads. `95` is "1m 35s", not "95 seconds" and
 * certainly not "0.0264 hours".
 */
export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(total / 60)
  const rest = total % 60

  if (minutes === 0) {
    return `${rest}s`
  }

  return rest === 0 ? `${minutes}m` : `${minutes}m ${rest}s`
}

/**
 * A ratio as a percentage. One decimal place only when it carries information -
 * "68%" beats "68.0%", and "68.4%" beats "68%" when the difference is the
 * point.
 */
export function formatPercent(ratio: number): string {
  const percent = ratio * 100
  const rounded = Math.round(percent * 10) / 10

  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`
}

/**
 * A number, plus whatever has to travel with it.
 *
 * The marker and the spoken suffix are returned from the same call as the
 * display string. A component cannot render `display` and forget the label,
 * because the label is not somewhere else - it is in the value it was handed.
 */
export function metricValue({
  value,
  kind = 'count',
  isApproximate = false,
  locale,
}: MetricValueInput): MetricValueOutput {
  const bare =
    kind === 'percent'
      ? formatPercent(value)
      : kind === 'duration'
        ? formatDuration(value)
        : integerFormat(locale).format(value)

  if (!isApproximate) {
    return { display: bare, bare, isApproximate: false, marker: null, spokenSuffix: null }
  }

  return {
    display: `~${bare}`,
    bare,
    isApproximate: true,
    marker: 'Approx.',
    spokenSuffix: 'approximate',
  }
}

/* -------------------------------------------------------------------------- */
/* Sample size                                                                */
/* -------------------------------------------------------------------------- */

export type SampleQuality = 'none' | 'thin' | 'sufficient'

export interface SampleInput {
  readonly sampleSize: number
  /**
   * Below this, a rate is reported with a caveat rather than as a finding. The
   * caller supplies it, because what counts as thin depends on the metric.
   */
  readonly minimumSample?: number
}

export interface SampleAssessment {
  readonly quality: SampleQuality
  /** Whether a derived rate should be drawn at all. */
  readonly showsRate: boolean
  /** The caveat, or `null` when the sample carries itself. */
  readonly caveat: string | null
}

/**
 * Whether a rate computed from this many observations is worth showing.
 *
 * Zero samples means no rate: 0/0 is not 0%, and drawing a 0% bar for a post
 * nobody has opened tells the author their writing failed when in fact nothing
 * has been measured. A thin sample gets the rate plus a sentence saying how thin
 * it is, because hiding it entirely is its own kind of dishonesty.
 */
export function assessSample({ sampleSize, minimumSample = 30 }: SampleInput): SampleAssessment {
  if (sampleSize <= 0) {
    return {
      quality: 'none',
      showsRate: false,
      caveat: 'No reading sessions in this range yet.',
    }
  }

  if (sampleSize < minimumSample) {
    return {
      quality: 'thin',
      showsRate: true,
      caveat: `Based on ${sampleSize} ${sampleSize === 1 ? 'session' : 'sessions'}. Treat this as a hint, not a finding.`,
    }
  }

  return { quality: 'sufficient', showsRate: true, caveat: null }
}

/* -------------------------------------------------------------------------- */
/* Coverage                                                                   */
/* -------------------------------------------------------------------------- */

export interface CoverageInput {
  /** The last day the pipeline has finished processing. `YYYY-MM-DD`. */
  readonly freshThrough?: string
  /** The last day the reader asked for. `YYYY-MM-DD`. */
  readonly rangeEnd?: string
}

export interface CoverageAssessment {
  readonly isPartial: boolean
  /** What to say above the numbers, or `null` when the range is complete. */
  readonly notice: string | null
}

/**
 * Whether the range the reader asked for is fully covered by the data.
 *
 * Analytics pipelines lag. A dashboard that silently answers a seven-day
 * question with five days of data will be read as a fall in traffic, and the
 * author will go looking for a cause that does not exist.
 *
 * String comparison is deliberate: both values are ISO `YYYY-MM-DD`, which sorts
 * lexicographically, and parsing them into `Date` would introduce a timezone
 * where the API has decided there is none.
 */
export function assessCoverage({ freshThrough, rangeEnd }: CoverageInput): CoverageAssessment {
  if (freshThrough === undefined || rangeEnd === undefined) {
    return { isPartial: false, notice: null }
  }

  if (freshThrough >= rangeEnd) {
    return { isPartial: false, notice: null }
  }

  return {
    isPartial: true,
    notice: `These numbers cover up to ${freshThrough}. The last part of the range is still being processed.`,
  }
}

/* -------------------------------------------------------------------------- */
/* Panel state                                                                */
/* -------------------------------------------------------------------------- */

export type DataPanelStatus = 'loading' | 'denied' | 'error' | 'empty' | 'ready'

export interface DataPanelStateInput {
  readonly isLoading?: boolean
  /** A verb phrase: "view these analytics". Its presence means denied. */
  readonly deniedAction?: string
  /** A verb phrase for the failure: "load your analytics". */
  readonly failedAction?: string
  /** How many rows or points arrived. Zero with no failure means empty. */
  readonly rowCount?: number
}

/**
 * Which single state a data panel is in.
 *
 * Precedence, strongest first: denied, error, loading, empty, ready.
 *
 * Denied first because it is the only one that is not about the data. Error
 * beats loading because a failed request that is being retried should keep
 * showing the failure rather than flickering back to a spinner and looking as
 * if it might work this time. Empty is last, and it is not an error: a post
 * published this morning has no analytics yet and nothing is wrong.
 */
export function dataPanelState({
  isLoading = false,
  deniedAction,
  failedAction,
  rowCount = 0,
}: DataPanelStateInput): DataPanelStatus {
  if (deniedAction !== undefined) {
    return 'denied'
  }

  if (failedAction !== undefined) {
    return 'error'
  }

  if (isLoading) {
    return 'loading'
  }

  return rowCount > 0 ? 'ready' : 'empty'
}
