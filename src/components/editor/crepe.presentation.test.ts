import { describe, expect, it } from 'vitest'
import { widensDocument } from '../../design-system'
import { CREPE_LOCAL_SCROLL } from './crepe.presentation'

const [selector] = Object.keys(CREPE_LOCAL_SCROLL)
const rule = Object.values(CREPE_LOCAL_SCROLL)[0]

describe('Crepe wide-content containment', () => {
  it('cannot let a wide code block or table widen the document', () => {
    // `widensDocument` is the design system's own predicate, so this checks the
    // same three properties `CodeBlock` and `DiagramFrame` are checked against
    // rather than a hand-written copy of them that could drift.
    expect(widensDocument(rule)).toBe(false)
  })

  it('makes the container a block, so overflow applies to a table at all', () => {
    expect(rule.display).toBe('block')
  })

  it('reaches both the editor wrapper and the Milkdown surface', () => {
    // `crepe-theme.css` targets `.crepe-editor-wrapper table` and Crepe's own
    // stylesheet targets `.milkdown`. Missing either leaves one of them winning.
    expect(selector).toContain('.crepe-editor-wrapper pre')
    expect(selector).toContain('.crepe-editor-wrapper table')
    expect(selector).toContain('.milkdown pre')
    expect(selector).toContain('.milkdown table')
  })

  it('is nested one level deeper than the stylesheet it outranks', () => {
    // Equal specificity would make the winner depend on which stylesheet the
    // bundler injected last, and `crepe-theme.css` arrives with a lazy chunk.
    expect(selector.startsWith('& ')).toBe(true)
  })
})
