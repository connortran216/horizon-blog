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

  it('renders a post-content icon row with unavailable future actions muted', () => {
    const markup = renderToStaticMarkup(
      <ReaderInteractionBar
        state={{
          postId: 76,
          heartCount: 12,
          viewerHasHearted: false,
          canHeart: true,
        }}
        onToggleHeart={() => undefined}
        onShare={() => undefined}
      />,
    )

    expect(markup).toContain('aria-label="Reader interactions"')
    expect(markup).toContain('aria-label="Heart this blog"')
    expect(markup).toContain('aria-label="Comments are not available yet"')
    expect(markup).toContain('aria-label="Repost is not available yet"')
    expect(markup).toContain('aria-label="Share this blog"')
    expect(markup).toContain('aria-label="More actions are not available yet"')
    expect(markup).toContain('12')
  })
})
