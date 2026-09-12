/**
 * What `ResponsiveImage` actually emits.
 *
 * `media.test.ts` proves the decisions; this file proves they reach the DOM.
 * The question "is `object-fit` on the image, and is the frame the same frame
 * either way" cannot be answered by a pure function, so it is rendered - see
 * the Testing section of `CONVENTIONS.md`.
 *
 * Only `absent` and `loading` are reachable without a browser: `ready`, `error`
 * and `retrying` are entered by events an image element raises. The box across
 * all five is held by `mediaFrameStyle`, which takes no status and no fit, and
 * `media.test.ts` states that.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import { ResponsiveImage } from './ResponsiveImage'
import type { MediaFit } from './media.logic'

const RATIO = '16 / 9'
const SOURCE = 'https://cdn.example.com/cover.png'
/** The stylesheet is minified on the way out, so the spaces may or may not survive. */
const RESERVED_BOX = /aspect-ratio:\s*16\s*\/\s*9/

function render(element: JSX.Element): string {
  return renderToStaticMarkup(<ChakraProvider theme={horizonTheme}>{element}</ChakraProvider>)
}

function cover(fit?: MediaFit, src: string | null = SOURCE) {
  return render(
    <ResponsiveImage
      aspectRatio={RATIO}
      fit={fit}
      src={src}
      alt="A cover whose artwork runs to its own edges"
      task="the cover image"
      absentCaption="A blog with no cover"
      loading="eager"
    />,
  )
}

describe('the fit reaches the image', () => {
  it('crops to fill when no fit is asked for', () => {
    expect(cover()).toContain('object-fit:cover')
  })

  it('shows the whole image when `contain` is asked for', () => {
    const markup = cover('contain')

    expect(markup).toContain('object-fit:contain')
    expect(markup).not.toContain('object-fit:cover')
  })

  it('still emits one image with the source and the alt text', () => {
    const markup = cover('contain')

    expect(markup).toContain(`src="${SOURCE}"`)
    expect(markup).toContain('alt="A cover whose artwork runs to its own edges"')
  })
})

describe('the reserved box survives the fit', () => {
  /*
   * The frame reserves its ratio before the browser has decided anything about
   * the picture, which is why an absent cover and a loading one both have to
   * carry it. If `contain` ever reached `MediaFrame`, one of these four would
   * be the one that changed.
   */
  it('holds the ratio with or without a source, at either fit', () => {
    const combinations = [
      cover('cover', SOURCE),
      cover('contain', SOURCE),
      cover('cover', null),
      cover('contain', null),
    ]

    for (const markup of combinations) {
      expect(markup).toMatch(RESERVED_BOX)
    }
  })

  it('paints the absent state inside the frame rather than collapsing it', () => {
    const markup = cover('contain', null)

    expect(markup).toMatch(RESERVED_BOX)
    expect(markup).toContain('A blog with no cover')
    // No source, so there is no image to fit at all - and the caption sits on
    // the frame's own ground.
    expect(markup).not.toContain('object-fit')
  })
})
