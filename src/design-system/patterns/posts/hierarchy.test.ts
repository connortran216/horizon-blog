import { describe, expect, it } from 'vitest'

import {
  duplicatedWords,
  hierarchyContext,
  labelWords,
  labelsAreRedundant,
  normaliseLabel,
  resolveHierarchyLabel,
} from './hierarchy.logic'

/** dsv2.5.1 acceptance 2: content does not duplicate hierarchy labels. */
describe('normaliseLabel', () => {
  it('folds case, punctuation and runs of whitespace', () => {
    expect(normaliseLabel('  Latest — Writing!  ')).toBe('latest writing')
  })

  it('keeps diacritics, because Vietnamese headings are real content', () => {
    expect(normaliseLabel('Bàn về hệ thống')).toBe('bàn về hệ thống')
  })
})

describe('labelWords', () => {
  it('drops stop words', () => {
    expect(labelWords('All of the writing')).toEqual(['writing'])
  })

  it('drops bare numbers, so "Series 01" is about the word Series', () => {
    expect(labelWords('Series 01')).toEqual(['series'])
  })
})

describe('hierarchyContext', () => {
  it('collects the significant words a section has already spoken', () => {
    expect(hierarchyContext('Fresh perspectives', 'Latest writing').sort()).toEqual([
      'fresh',
      'latest',
      'perspectives',
      'writing',
    ])
  })

  it('ignores absent labels', () => {
    expect(hierarchyContext(null, undefined, 'Series')).toEqual(['series'])
  })

  it('does not repeat a word two labels share', () => {
    expect(hierarchyContext('Latest writing', 'Latest')).toEqual(['latest', 'writing'])
  })
})

describe('resolveHierarchyLabel', () => {
  const latestWriting = hierarchyContext('Fresh perspectives', 'Latest writing')

  it('suppresses a card label that only echoes the section heading', () => {
    expect(resolveHierarchyLabel('Latest', latestWriting)).toBeNull()
    expect(resolveHierarchyLabel('Recent writing', latestWriting)).toBeNull()
  })

  it('keeps a label that adds something the section did not say', () => {
    expect(resolveHierarchyLabel('Signature', latestWriting)).toBe('Signature')
  })

  it('suppresses the whole label rather than inventing a shorter one', () => {
    // "Lead blog" under "Latest writing" shares nothing, so it survives; under a
    // "Latest blogs" heading it shares "blog" and disappears entirely rather
    // than becoming the word "Lead", which nobody wrote.
    expect(resolveHierarchyLabel('Lead blog', hierarchyContext('Latest blogs'))).toBeNull()
  })

  it('keeps every label when there is no section context', () => {
    expect(resolveHierarchyLabel('Latest')).toBe('Latest')
    expect(resolveHierarchyLabel('Latest', [])).toBe('Latest')
  })

  it('treats a blank label as no label', () => {
    expect(resolveHierarchyLabel('   ', latestWriting)).toBeNull()
    expect(resolveHierarchyLabel(null, latestWriting)).toBeNull()
  })

  it('ignores stop words when deciding, so "the blog" is not saved by "the"', () => {
    expect(resolveHierarchyLabel('The blog', hierarchyContext('Blog'))).toBeNull()
  })
})

describe('duplicatedWords', () => {
  it('names the offending word so a review finding is actionable', () => {
    expect(duplicatedWords('Latest blog', hierarchyContext('Latest writing'))).toEqual(['latest'])
  })

  it('quotes the card’s own spelling, not the folded form', () => {
    expect(duplicatedWords('Lead blog', hierarchyContext('Latest blogs'))).toEqual(['blog'])
  })

  it('finds nothing when the words genuinely differ', () => {
    expect(duplicatedWords('Signature', hierarchyContext('Latest writing'))).toEqual([])
  })

  it('is empty for an absent candidate', () => {
    expect(duplicatedWords(undefined, ['latest'])).toEqual([])
  })
})

describe('labelsAreRedundant', () => {
  it('reports a set of sibling labels that would all disappear', () => {
    const context = hierarchyContext('Latest writing')

    expect(labelsAreRedundant(['Latest', 'Latest writing'], context)).toBe(true)
    expect(labelsAreRedundant(['Latest', 'Signature'], context)).toBe(false)
  })

  it('says nothing about an empty set', () => {
    expect(labelsAreRedundant([], ['latest'])).toBe(false)
  })
})
