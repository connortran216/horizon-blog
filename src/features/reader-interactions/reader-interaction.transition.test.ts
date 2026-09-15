import { describe, expect, it } from 'vitest'

import { resolveHeartToggle } from './reader-interaction.transition'
import { ReaderInteractionState } from './reader-interactions.types'

const previous: ReaderInteractionState = {
  postId: 42,
  heartCount: 128,
  viewerHasHearted: true,
  canHeart: true,
}

describe('resolveHeartToggle', () => {
  it('shows exactly the confirmed state on success, never a locally guessed one', () => {
    const confirmed: ReaderInteractionState = {
      postId: 42,
      heartCount: 205,
      viewerHasHearted: false,
      canHeart: true,
    }

    expect(resolveHeartToggle(previous, { type: 'confirmed', state: confirmed })).toEqual(confirmed)
  })

  it('keeps the previous state, unchanged, when the request fails', () => {
    expect(resolveHeartToggle(previous, { type: 'failed' })).toBe(previous)
  })

  it('never fabricates a state in between - only the two real outcomes exist', () => {
    const outcomes: Array<'confirmed' | 'failed'> = ['confirmed', 'failed']

    for (const type of outcomes) {
      const result =
        type === 'confirmed'
          ? resolveHeartToggle(previous, { type, state: previous })
          : resolveHeartToggle(previous, { type })

      // Either the server's own state or the untouched previous one - nothing
      // this function invents, such as an incremented or decremented count.
      expect(result).toBe(previous)
    }
  })
})
