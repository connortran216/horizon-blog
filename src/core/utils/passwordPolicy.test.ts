import { describe, expect, it } from 'vitest'

import { getPasswordPolicyError } from './passwordPolicy'

describe('password policy', () => {
  it.each([
    ['x'.repeat(11), true],
    ['x'.repeat(12), false],
    ['x'.repeat(128), false],
    ['x'.repeat(129), true],
    ['🔒'.repeat(12), false],
  ])('validates password length boundaries', (password, hasError) => {
    expect(Boolean(getPasswordPolicyError(password))).toBe(hasError)
  })
})
