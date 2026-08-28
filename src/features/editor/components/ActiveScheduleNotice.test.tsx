import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import theme from '../../../theme'
import ActiveScheduleNotice from './ActiveScheduleNotice'

describe('ActiveScheduleNotice', () => {
  it('keeps the active schedule visible while editing', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={theme}>
        <ActiveScheduleNotice scheduledAt="2026-08-28T02:00:00Z" onManage={vi.fn()} />
      </ChakraProvider>,
    )

    expect(markup).toContain('This blog is scheduled.')
    expect(markup).toContain('Content changes do not remove the schedule.')
    expect(markup).toContain('Manage schedule')
  })
})
