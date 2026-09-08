import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import publicWriting from '../__fixtures__/public-writing.json'
import theme from '../../../theme'
import Navbar from '../../../app/layouts/Navbar'
import HomePage from './HomePage'
import type { BlogPostSummary } from '../../../core'
import { partitionHomeWriting } from '../home.presentation'
const state = vi.hoisted(() => ({ posts: [] as BlogPostSummary[], loading: false, error: false }))
vi.mock('../useHomeWriting', () => ({
  useHomeWriting: () => ({
    ...partitionHomeWriting(state.posts),
    loading: state.loading,
    error: state.error,
    retry: () => {},
  }),
}))
vi.mock('../../series/usePublicSeriesList', () => ({
  usePublicSeriesList: () => ({ items: [], loading: false, error: false }),
}))
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: null, logout: async () => ({ serverRevoked: true }) }),
}))
const render = () =>
  renderToStaticMarkup(
    <ChakraProvider theme={theme}>
      <MemoryRouter>
        <Navbar />
        <main>
          <HomePage />
        </main>
      </MemoryRouter>
    </ChakraProvider>,
  )
describe('Home release states', () => {
  it('renders real-shaped public writing with a distinct Signature and six Latest cards', () => {
    state.posts = publicWriting as BlogPostSummary[]
    state.error = false
    state.loading = false
    const html = render()
    expect(html).toContain('Signature')
    expect((html.match(/class="signal-story"/g) || []).length).toBe(6)
    expect(html).toContain('Latest writing')
  })
  it('shows a retry action on service failure', () => {
    state.error = true
    state.loading = false
    expect(render()).toContain('Writing could not load')
    expect(render()).toContain('Try again')
  })
  it('keeps loading and true empty states separate', () => {
    state.posts = []
    state.error = false
    state.loading = true
    expect(render()).toContain('Loading writing')
    state.loading = false
    expect(render()).toContain('A little space for new ideas.')
  })
})
