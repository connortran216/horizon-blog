import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import theme from '../../../theme'
import BlogPage from './BlogPage'

const renderPage = (path: string) =>
  renderToStaticMarkup(
    <ChakraProvider theme={theme}>
      <MemoryRouter initialEntries={[path]}>
        <BlogPage />
      </MemoryRouter>
    </ChakraProvider>,
  )

describe('BlogPage Series placement', () => {
  it('shows the compact shelf only on the unfiltered first page', () => {
    expect(renderPage('/blog')).toContain('View all series')
    expect(renderPage('/blog?q=database')).not.toContain('View all series')
    expect(renderPage('/blog?tags=postgresql')).not.toContain('View all series')
    expect(renderPage('/blog?page=2')).not.toContain('View all series')
  })
})
