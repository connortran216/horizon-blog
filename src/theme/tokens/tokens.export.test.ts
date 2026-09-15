import { describe, expect, it } from 'vitest'

import exportedTokens from '../../../design-system/tokens.json'
import { tokens } from './index'

describe('design-system/tokens.json', () => {
  it('matches the typed token source', () => {
    expect(
      exportedTokens,
      'design-system/tokens.json is stale - regenerate it with `yarn tokens:export`',
    ).toEqual(JSON.parse(JSON.stringify(tokens)))
  })
})
