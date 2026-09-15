import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import ContactPage from './ContactPage'

const renderPage = () =>
  renderToStaticMarkup(
    <ChakraProvider theme={horizonTheme}>
      <ContactPage />
    </ChakraProvider>,
  )

describe('ContactPage editorial letter', () => {
  it('renders the approved invitation once and removes the obsolete reasons section', () => {
    const markup = renderPage()

    expect(markup).toContain('A quieter inbox')
    expect(markup).toContain('for deeper')
    expect(markup).toContain('conversations.')
    expect(markup).toContain('A little context goes a long way.')
    expect(markup).toContain('- Canh')
    expect(markup).toContain('Writing feedback')
    expect(markup).toContain('Frontend architecture')
    expect(markup).toContain('Product conversations')
    expect(markup).not.toContain('A few helpful reasons to reach out')
    expect(markup.match(/<h1/g)).toHaveLength(1)
  })

  it('keeps one exact action for each real contact destination', () => {
    const markup = renderPage()

    expect(markup).toContain('href="mailto:canhtran210699@gmail.com"')
    expect(markup).toContain('aria-label="Write an email to canhtran210699@gmail.com"')
    expect(markup).toContain('href="tel:+84963452909"')
    expect(markup.match(/mailto:canhtran210699@gmail.com/g)).toHaveLength(1)
    expect(markup.match(/tel:\+84963452909/g)).toHaveLength(1)
  })

  it('offers a named copy action and keeps location informational', () => {
    const markup = renderPage()

    expect(markup).toContain('aria-label="Copy email address"')
    expect(markup).toContain('role="status"')
    expect(markup).toContain('canhtran210699@<wbr/>gmail.com')
    expect(markup).toContain('Ho Chi Minh City, Vietnam')
    expect(markup).not.toMatch(/href="[^"]*Ho Chi Minh City/)
  })
})
