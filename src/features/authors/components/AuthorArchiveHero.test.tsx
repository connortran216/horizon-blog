import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import theme from '../../../theme'
import AuthorArchiveHero from './AuthorArchiveHero'

describe('AuthorArchiveHero', () => {
  it('renders only author data backed by the public archive contract', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <MemoryRouter>
          <AuthorArchiveHero
            author={{ id: 7, name: 'Connor Tran', bio: 'Writes about systems.' }}
            totalPosts={12}
          />
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(markup).toContain('Connor Tran')
    expect(markup).toContain('>12</span>')
    expect(markup).toContain('Articles')
    expect(markup).toContain('Writes about systems.')
    expect(markup).not.toContain('Followers')
    expect(markup).not.toContain('Following')
    expect(markup).not.toContain('18.2k')
  })
})
