import { describe, expect, it } from 'vitest'

import { componentTokens } from '../../../theme/tokens'
import { sampleSpineAllLive, sampleSpineParts, sampleSpineWithGap } from './fixtures'
import {
  SERIES_DESCRIPTION_MAX,
  SERIES_TITLE_MAX,
  seriesComposerRequest,
  seriesComposerState,
} from './seriesComposer.logic'
import {
  SPINE_MARK_LIMIT,
  spineIsDense,
  spineLitExtent,
  spineLiveRun,
  spineMarks,
  spineTally,
  spineTrackLabel,
} from './spine.logic'

describe('spineLiveRun', () => {
  it('counts the published parts a reader can walk from Part 1', () => {
    expect(spineLiveRun(sampleSpineParts)).toBe(2)
    expect(spineLiveRun(sampleSpineAllLive)).toBe(5)
  })

  it('stops at the first part that is not live, even if a later part is', () => {
    expect(spineLiveRun(sampleSpineWithGap)).toBe(1)
  })

  it('is zero when Part 1 is not live, or there are no parts', () => {
    expect(spineLiveRun([{ state: 'draft' }, { state: 'published' }])).toBe(0)
    expect(spineLiveRun([])).toBe(0)
  })
})

describe('spineLitExtent', () => {
  it('reaches the last mark of the run, measured between the first and last mark', () => {
    expect(spineLitExtent(sampleSpineParts)).toBeCloseTo(1 / 4)
    expect(spineLitExtent(sampleSpineAllLive)).toBe(1)
  })

  it('draws no line for a run of one, or a Series of one', () => {
    expect(spineLitExtent(sampleSpineWithGap)).toBe(0)
    expect(spineLitExtent([{ state: 'published' }])).toBe(0)
    expect(spineLitExtent([])).toBe(0)
  })
})

describe('spineIsDense', () => {
  it('keeps separate marks up to the limit and draws a bar past it', () => {
    expect(spineIsDense(SPINE_MARK_LIMIT)).toBe(false)
    expect(spineIsDense(SPINE_MARK_LIMIT + 1)).toBe(true)
  })
})

describe('spineMarks', () => {
  it('numbers the marks in reading order and lights only the run', () => {
    const marks = spineMarks(sampleSpineWithGap)

    expect(marks.map((mark) => mark.position)).toEqual([1, 2, 3])
    expect(marks.map((mark) => mark.lit)).toEqual([true, false, false])
  })

  it('says the whole fact in words, so state never rests on shape or colour', () => {
    const [first, , third] = spineMarks(sampleSpineParts)

    expect(first.spoken).toBe('Part 1, live: Sample part 1: the opening argument')
    expect(third.spoken).toBe('Part 3, scheduled: Sample part 3: waiting for its date')
  })
})

describe('spineTally', () => {
  it('states parts, live and not-yet-live', () => {
    expect(spineTally(sampleSpineParts)).toBe('5 parts · 2 live · 3 not live yet')
  })

  it('drops the not-yet count when everything is live, and uses the singular', () => {
    expect(spineTally(sampleSpineAllLive)).toBe('5 parts · 5 live')
    expect(spineTally([{ state: 'published' }])).toBe('1 part · 1 live')
  })

  it('says an empty Series is not shown to readers', () => {
    expect(spineTally([])).toBe('No parts yet · not shown to readers')
  })
})

describe('spine tokens', () => {
  it('draws each state in a different role', () => {
    const { markLive, markScheduled, markDraft } = componentTokens.series

    expect(new Set([markLive, markScheduled, markDraft]).size).toBe(3)
  })

  it('names its track after the Series', () => {
    expect(spineTrackLabel('Sample Series')).toBe('Parts of Sample Series, in reading order')
  })
})

describe('seriesComposerState', () => {
  it('blocks an empty or blank title and says why', () => {
    const state = seriesComposerState({ title: '   ', description: '', isSubmitting: false })

    expect(state.canSubmit).toBe(false)
    expect(state.blockedReason).toBe('A Series needs a title before it can be created.')
    expect(state.titleError).toBeNull()
  })

  it('allows a title with no description', () => {
    const state = seriesComposerState({ title: 'Sample', description: '', isSubmitting: false })

    expect(state.canSubmit).toBe(true)
    expect(state.blockedReason).toBeNull()
    expect(state.descriptionCount).toBe('0 of 1,000 characters')
  })

  it('enforces the backend limits before a request is made', () => {
    const longTitle = seriesComposerState({
      title: 'x'.repeat(SERIES_TITLE_MAX + 1),
      description: '',
      isSubmitting: false,
    })
    const longDescription = seriesComposerState({
      title: 'Sample',
      description: 'x'.repeat(SERIES_DESCRIPTION_MAX + 1),
      isSubmitting: false,
    })

    expect(longTitle.canSubmit).toBe(false)
    expect(longTitle.titleError).toBe('Keep the title to 160 characters.')
    expect(longDescription.canSubmit).toBe(false)
    expect(longDescription.descriptionError).toBe('Keep the description to 1,000 characters.')
  })

  it('cannot submit twice, and lets the loading button speak instead of a reason', () => {
    const state = seriesComposerState({ title: 'Sample', description: '', isSubmitting: true })

    expect(state.canSubmit).toBe(false)
    expect(state.blockedReason).toBeNull()
  })

  it('sends trimmed values', () => {
    expect(seriesComposerRequest('  Sample  ', '  About it. ')).toEqual({
      title: 'Sample',
      description: 'About it.',
    })
  })
})
