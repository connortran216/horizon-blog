import { describe, expect, it } from 'vitest'
import { CrepeFeature } from '@milkdown/crepe'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import {
  authoringOnlyFeatures,
  crepeFeatures,
  crepeSurface,
  readingCodeMirrorExtensions,
  renderingFeatures,
} from './crepe.features'

describe('crepeSurface', () => {
  it('maps the readOnly prop onto the two surfaces', () => {
    expect(crepeSurface(true)).toBe('reading')
    expect(crepeSurface(false)).toBe('writing')
  })
})

describe('crepeFeatures', () => {
  it('gives a reading surface none of the authoring features', () => {
    const features = crepeFeatures('reading')

    authoringOnlyFeatures.forEach((feature) => {
      expect(features[feature]).toBe(false)
    })
  })

  it('gives a writing surface every authoring feature', () => {
    const features = crepeFeatures('writing')

    authoringOnlyFeatures.forEach((feature) => {
      expect(features[feature]).toBe(true)
    })
  })

  it('keeps every rendering feature on both surfaces', () => {
    // A reading surface is not a stripped-down document. CodeMirror *is* the
    // code highlighter, and tables, images and list items are content - turning
    // any of them off would change what the article looks like, which is not
    // what making it read-only is for.
    renderingFeatures.forEach((feature) => {
      expect(crepeFeatures('reading')[feature]).toBe(true)
      expect(crepeFeatures('writing')[feature]).toBe(true)
    })
  })

  it('names every feature it decides, so none falls back to a Crepe default', () => {
    // `defaultFeatures` turns the block handle and the placeholder on. A key
    // left out of this record is a feature nobody chose.
    const decided = Object.keys(crepeFeatures('reading'))

    expect(decided).toContain(CrepeFeature.BlockEdit)
    expect(decided).toContain(CrepeFeature.Placeholder)
    expect(decided).toContain(CrepeFeature.LinkTooltip)
    expect(decided).toContain(CrepeFeature.Toolbar)
  })
})

describe('readingCodeMirrorExtensions', () => {
  const state = EditorState.create({ extensions: readingCodeMirrorExtensions() })

  it('makes the code block itself non-editable', () => {
    // This is the facet that decides `contenteditable` on `.cm-content`.
    // ProseMirror's own editable flag never reaches it, which is why a published
    // article shipped twenty editable code blocks.
    expect(state.facet(EditorView.editable)).toBe(false)
  })

  it('marks the state read-only, so the block is announced as read-only', () => {
    expect(state.readOnly).toBe(true)
  })
})
