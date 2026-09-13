/**
 * Rewritten for release M4. The bar is now composed from the design system's
 * controls and its `reactionUnavailableNotice`, so the old literal "Reactions
 * unavailable" is the system's own wording - and it now distinguishes a reader
 * who could react if they signed in from a blog where reactions are off, which
 * the previous single string could not.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import theme from '../../../theme/horizon'
import ReaderInteractionBar from './ReaderInteractionBar'

const render = (element: JSX.Element) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <ChakraProvider theme={theme}>{element}</ChakraProvider>
    </MemoryRouter>,
  )

describe('ReaderInteractionBar', () => {
  it('keeps the heart control visible, and says why, when reactions are unavailable', () => {
    const signedOut = render(
      <ReaderInteractionBar
        state={null}
        onToggleHeart={() => undefined}
        onShare={() => undefined}
      />,
    )
    const signedIn = render(
      <ReaderInteractionBar
        state={null}
        isAuthenticated
        onToggleHeart={() => undefined}
        onShare={() => undefined}
      />,
    )

    expect(signedOut).toContain('aria-label="Heart this blog"')
    expect(signedOut).toContain('disabled=""')
    expect(signedOut).toContain('Sign in to react to this blog.')
    expect(signedIn).toContain('Reactions are unavailable for this blog.')
  })

  it('renders a post-content action row with unavailable future actions named', () => {
    const markup = render(
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
    expect(markup).toContain('aria-label="Go to comments"')
    expect(markup).toContain('href="#comments"')
    expect(markup).toContain('aria-label="Repost is not available yet"')
    expect(markup).toContain('aria-label="Share this blog"')
    expect(markup).toContain('aria-label="More actions are not available yet"')
    expect(markup).toContain('12')
  })
})
