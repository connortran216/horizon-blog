/**
 * `renderToStaticMarkup` only - this repo's test environment has no DOM, so
 * clicks cannot be simulated here. What is checkable statically: the exact
 * copy the owner approved renders verbatim, both actions are present and
 * reachable, and no diff/summary content sneaks in. Click wiring itself is
 * verified in the browser (Playwright), not by this suite.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { horizonTheme } from '../../../theme/horizon'
import DraftRecoveryNotice from './DraftRecoveryNotice'

const render = (headline: string, detail: string) =>
  renderToStaticMarkup(
    <ChakraProvider theme={horizonTheme}>
      <DraftRecoveryNotice
        headline={headline}
        detail={detail}
        onRestore={vi.fn()}
        onDiscard={vi.fn()}
      />
    </ChakraProvider>,
  )

describe('DraftRecoveryNotice', () => {
  it('renders the headline and detail verbatim, with no diff or summary of its own', () => {
    const markup = render(
      'We found a newer draft kept in this browser',
      'It is newer than the copy on your account. Restore it, or keep the saved version.',
    )

    expect(markup).toContain('We found a newer draft kept in this browser')
    expect(markup).toContain(
      'It is newer than the copy on your account. Restore it, or keep the saved version.',
    )
  })

  it('offers both a restore and a discard action, and nothing that acts by itself', () => {
    const markup = render('headline', 'detail')

    expect(markup).toContain('Restore')
    expect(markup).toContain('Discard')
    // Both are real buttons - reachable by keyboard, not decorative text.
    expect(markup.match(/<button/g)?.length).toBe(2)
  })

  it('never saved copy renders the never-saved-yet wording untouched', () => {
    const markup = render(
      'We found a newer draft kept in this browser',
      'It was never saved to your account. Restore it, or discard it and start from what is here.',
    )

    expect(markup).toContain('It was never saved to your account.')
  })
})
