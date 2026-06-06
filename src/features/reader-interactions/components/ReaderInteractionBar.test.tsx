import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ReaderInteractionBar from './ReaderInteractionBar'

describe('ReaderInteractionBar', () => {
  it('keeps the heart control visible when reaction state is unavailable', () => {
    const markup = renderToStaticMarkup(
      <ReaderInteractionBar
        state={null}
        onToggleHeart={() => undefined}
        onShare={() => undefined}
      />,
    )

    expect(markup).toContain('aria-label="Heart this blog"')
    expect(markup).toContain('disabled=""')
    expect(markup).toContain('Reactions unavailable')
  })
})
