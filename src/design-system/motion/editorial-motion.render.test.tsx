import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import horizonTheme from '../../theme/horizon'
import { InteractionTrace } from './InteractionTrace'
import { MarginalNote } from './MarginalNote'
import { TimelineEntry } from './TimelineEntry'

function render(element: React.ReactElement) {
  return renderToStaticMarkup(<ChakraProvider theme={horizonTheme}>{element}</ChakraProvider>)
}

describe('editorial motion wrappers', () => {
  it('keeps marginal-note content in document order', () => {
    const markup = render(
      <MarginalNote>
        <h3>Stay curious</h3>
        <p>The supporting note remains ordinary readable content.</p>
      </MarginalNote>,
    )

    expect(markup.indexOf('Stay curious')).toBeLessThan(markup.indexOf('supporting note'))
  })

  it('adds a decorative trace without replacing the native action', () => {
    const markup = render(
      <InteractionTrace active>
        <a href="mailto:sample@example.com">Write an email</a>
      </InteractionTrace>,
    )

    expect(markup).toContain('href="mailto:sample@example.com"')
    expect(markup).toContain('data-interaction-trace="active"')
    expect(markup).toContain('aria-hidden="true"')
  })

  it('makes the screen timeline keyboard-engageable and hides its marker in print', () => {
    const markup = render(
      <TimelineEntry>
        <article>
          <h3>Backend Engineer</h3>
        </article>
      </TimelineEntry>,
    )

    expect(markup).toContain('tabindex="0"')
    expect(markup).toContain('data-timeline-marker="idle"')
    expect(markup).toContain('@media print')
    expect(markup).toContain('Backend Engineer')
  })
})
