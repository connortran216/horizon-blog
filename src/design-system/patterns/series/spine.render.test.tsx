/**
 * What the spine and the composer actually emit. The decisions are covered in
 * `spine.test.ts`; these check that they reach the markup.
 */

import { ChakraProvider } from '@chakra-ui/react'
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import { SeriesComposer } from './SeriesComposer'
import { SeriesSpine } from './SeriesSpine'
import { sampleSpineParts } from './fixtures'

const noop = () => undefined

function render(element: ReactElement): string {
  return renderToStaticMarkup(
    <ChakraProvider theme={horizonTheme}>
      <MemoryRouter>{element}</MemoryRouter>
    </ChakraProvider>,
  )
}

describe('SeriesSpine', () => {
  it('lists the parts in order under a named track, each with its spoken fact', () => {
    const markup = render(
      <SeriesSpine title="Sample Series" parts={sampleSpineParts} meta="Updated Oct 8" />,
    )

    expect(markup).toContain('<ol aria-label="Parts of Sample Series, in reading order"')
    expect(markup.match(/<li /g)).toHaveLength(5)
    expect(markup).toContain('Part 4, draft: Sample part 4: still a draft')
    expect(markup).toContain('5 parts · 2 live · 3 not live yet · Updated Oct 8')
    expect(markup).toContain('data-spine-lit')
  })

  it('draws an empty Series as a line still to start, with no list', () => {
    const markup = render(<SeriesSpine title="Sample Series" parts={[]} />)

    expect(markup).not.toContain('<ol')
    expect(markup).toContain('The line starts with the first blog you add.')
    expect(markup).toContain('No parts yet · not shown to readers')
  })

  it('renders the caller action and the title at the requested rank', () => {
    const markup = render(
      <SeriesSpine
        title="Sample Series"
        parts={sampleSpineParts}
        titleAs="h4"
        action={<a href="/manage">Manage</a>}
      />,
    )

    expect(markup).toMatch(/<h4[^>]*>Sample Series<\/h4>/)
    expect(markup).toContain('<a href="/manage">Manage</a>')
  })
})

describe('SeriesComposer', () => {
  it('is a named form with labelled title and description fields', () => {
    const markup = render(
      <SeriesComposer
        title=""
        description=""
        onTitleChange={noop}
        onDescriptionChange={noop}
        onSubmit={noop}
        onCancel={noop}
      />,
    )

    expect(markup).toContain('<form aria-label="New Series"')
    expect(markup).toContain('Series title')
    expect(markup).toContain('Description')
    expect(markup).toContain('maxLength="160"')
    expect(markup).toContain('maxLength="1000"')
    expect(markup).toContain('A Series needs a title before it can be created.')
  })

  it('shows a create failure as an alert and keeps the typed values', () => {
    const markup = render(
      <SeriesComposer
        title="Sample Series"
        description="About it."
        error="This Series could not be created."
        onTitleChange={noop}
        onDescriptionChange={noop}
        onSubmit={noop}
        onCancel={noop}
      />,
    )

    expect(markup).toContain('role="alert"')
    expect(markup).toContain('This Series could not be created.')
    expect(markup).toContain('value="Sample Series"')
    expect(markup).not.toContain('needs a title')
  })
})
