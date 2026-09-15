import { describe, expect, it } from 'vitest'

import { semanticColors, typeScale } from '../../../theme/tokens'
import { headingElements } from '../layout/semanticElements'
import {
  headingLevel,
  headingRecipeNames,
  resolveTextElement,
  typographyRecipe,
  typographyRecipeNames,
  type TypographyRecipeName,
} from './typography.logic'

/**
 * dsv2.3.1: "Expose semantic typography recipes for display, page title,
 * section title, card title, body, prose, and metadata."
 */
describe('typography recipes', () => {
  it('exposes exactly the seven documented editorial roles', () => {
    expect(typographyRecipeNames).toEqual([
      'display',
      'pageTitle',
      'sectionTitle',
      'cardTitle',
      'body',
      'prose',
      'metadata',
    ])
  })

  it('binds every recipe to a size that exists in the type ramp', () => {
    for (const name of typographyRecipeNames) {
      expect(Object.keys(typeScale)).toContain(typographyRecipe(name).textStyle)
    }
  })

  it('binds every recipe to a paired semantic colour role', () => {
    for (const name of typographyRecipeNames) {
      expect(Object.keys(semanticColors)).toContain(typographyRecipe(name).color)
    }
  })

  it('defaults the four title roles to a heading element', () => {
    for (const name of headingRecipeNames) {
      expect(headingElements).toContain(typographyRecipe(name).element)
    }
  })

  it('defaults body, prose and metadata to a paragraph, not a heading', () => {
    for (const name of ['body', 'prose', 'metadata'] satisfies TypographyRecipeName[]) {
      expect(typographyRecipe(name).element).toBe('p')
    }
  })

  it('descends in heading rank as the title roles get smaller', () => {
    const ranks = headingRecipeNames.map((name) => {
      const element = typographyRecipe(name).element

      return headingLevel(element as (typeof headingElements)[number])
    })

    expect(ranks).toEqual([...ranks].sort((first, second) => first - second))
  })

  it('gives sectionTitle its own step in the ramp', () => {
    expect(typographyRecipe('sectionTitle').textStyle).toBe('sectionTitle')
    expect(Object.keys(typeScale)).toContain('sectionTitle')
  })

  it('separates the section and card roles by size as well as outline rank', () => {
    expect(typographyRecipe('sectionTitle').element).toBe('h2')
    expect(typographyRecipe('cardTitle').element).toBe('h3')

    // A section heading that matched the cards beneath it would flatten the
    // hierarchy, which is what borrowing cardTitle used to do.
    expect(typeScale.sectionTitle.fontSize).not.toEqual(typeScale.cardTitle.fontSize)
  })

  it('keeps the ramp monotonic through the new step', () => {
    const size = (name: 'pageTitle' | 'sectionTitle' | 'cardTitle', index: 0 | 1) =>
      Number.parseInt(typeScale[name].fontSize[index], 10)

    for (const index of [0, 1] as const) {
      expect(size('pageTitle', index)).toBeGreaterThan(size('sectionTitle', index))
      expect(size('sectionTitle', index)).toBeGreaterThan(size('cardTitle', index))
    }
  })
})

describe('resolveTextElement', () => {
  it('falls back to the recipe default when no element is given', () => {
    expect(resolveTextElement('display')).toEqual({ element: 'h1', isHeading: true })
    expect(resolveTextElement('body')).toEqual({ element: 'p', isHeading: false })
  })

  it('lets the caller keep the size while fixing the document outline', () => {
    expect(resolveTextElement('display', 'h2')).toEqual({ element: 'h2', isHeading: true })
  })

  it('lets a title recipe render as non-heading text when it is not a heading', () => {
    expect(resolveTextElement('cardTitle', 'span')).toEqual({ element: 'span', isHeading: false })
  })

  it('reports metadata rendered inside a definition list as non-heading', () => {
    expect(resolveTextElement('metadata', 'dd').isHeading).toBe(false)
  })
})

describe('headingLevel', () => {
  it('reads the rank off the element name', () => {
    expect(headingLevel('h1')).toBe(1)
    expect(headingLevel('h6')).toBe(6)
  })
})
