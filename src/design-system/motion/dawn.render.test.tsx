/**
 * Static-markup checks for the three Dawn primitives: what they emit, not how
 * they look. Real paint and real pointer movement belong to the gallery.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { ActionLink } from '../components/actions'
import { Heading } from '../components/typography'
import theme from '../../theme/horizon'
import { SynapseField } from './SynapseField'
import { SignalTarget } from './SignalTarget'
import { PointerLight } from './PointerLight'
import { Typeset } from './Typeset'

/** Emotion inlines the theme's global stylesheet; the assertions are about the DOM. */
const withoutStyles = (markup: string) => markup.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')

const render = (node: React.ReactElement) =>
  withoutStyles(
    renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <MemoryRouter>{node}</MemoryRouter>
      </ChakraProvider>,
    ),
  )

describe('Typeset', () => {
  it('reads the sentence once to assistive technology and hides the moving words', () => {
    const markup = render(
      <Heading as="h1" recipe="display">
        <Typeset>Human stories for curious readers.</Typeset>
      </Heading>,
    )

    const heading = markup.slice(markup.indexOf('<h1'), markup.indexOf('</h1>'))

    expect(heading).toContain('Human stories for curious readers.')
    expect(heading).toContain('aria-hidden="true"')
    // Only inline elements inside the heading.
    expect(heading).not.toContain('<div')
    // One clipped line box per word.
    expect(heading.match(/clip-path/g)?.length).toBe(5)
  })

  it('draws one rule under each emphasised word and none elsewhere', () => {
    const markup = render(
      <Heading as="h1" recipe="display">
        <Typeset emphasis="curious readers.">Human stories for curious readers.</Typeset>
      </Heading>,
    )

    // Two emphasised words, two rules, and nothing under the other three.
    expect(markup.match(/data-typeset-rule/g)?.length).toBe(2)
  })
})

describe('SynapseField', () => {
  it('is decoration under the copy: a hidden canvas, the copy above it', () => {
    const markup = render(
      <SynapseField>
        <p>copy</p>
      </SynapseField>,
    )

    expect(markup).toContain('<canvas')
    expect(markup).toContain('aria-hidden="true"')
    expect(markup.indexOf('<canvas')).toBeLessThan(markup.indexOf('copy'))
  })

  it('renders a bare field with no children wrapper', () => {
    const markup = render(<SynapseField />)

    expect(markup).toContain('<canvas')
    expect(markup.replace(/<[^>]+>/g, '').trim()).toBe('')
  })
})

describe('SignalTarget', () => {
  it('keeps the copy in the markup whether or not a field is around it', () => {
    expect(render(<SignalTarget>Horizon blog</SignalTarget>)).toContain('Horizon blog')
    expect(
      render(
        <SynapseField>
          <SignalTarget>Horizon blog</SignalTarget>
        </SynapseField>,
      ),
    ).toContain('Horizon blog')
  })
})

describe('PointerLight', () => {
  it('renders the artwork alone on the server, where no pointer can hover', () => {
    const markup = render(
      <PointerLight>
        <span>artwork</span>
      </PointerLight>,
    )

    expect(markup).toContain('artwork')
    // The light overlay is the only thing that would be hidden from assistive technology.
    expect(markup).not.toContain('aria-hidden')
  })
})

describe('ActionLink icon travel', () => {
  it('wraps a trailing icon so only the icon moves on hover', () => {
    const markup = render(
      <ActionLink to="/blog" iconEnd={<svg aria-hidden="true" />}>
        Explore
      </ActionLink>,
    )

    expect(markup).toContain('data-icon-travel="end"')
    expect(markup).not.toContain('data-icon-travel="start"')
  })

  it('lets an in-page link send its arrow down instead', () => {
    const markup = render(
      <ActionLink href="#writing" iconTravel="down" iconEnd={<svg aria-hidden="true" />}>
        Latest writing
      </ActionLink>,
    )

    expect(markup).toContain('data-icon-travel="down"')
    expect(markup).toContain('href="#writing"')
  })
})

describe('SynapseField as the page', () => {
  it('renders no Surface box and the landmark it is asked for', () => {
    const markup = render(
      <SynapseField variant="canvas" as="header">
        <p>copy</p>
      </SynapseField>,
    )

    expect(markup).toContain('<header')
    expect(markup).toContain('<canvas')
    expect(markup).toContain('copy')
  })
})
