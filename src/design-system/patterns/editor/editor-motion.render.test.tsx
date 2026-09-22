import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import { AutosaveState } from './AutosaveState'
import { PublishPanel } from './PublishPanel'

function render(element: React.ReactElement) {
  return renderToStaticMarkup(<ChakraProvider theme={horizonTheme}>{element}</ChakraProvider>)
}

describe('editor motion feedback', () => {
  it('keeps autosave text and live-region semantics authoritative beside the trace', () => {
    const saving = render(<AutosaveState isSaving />)
    const failed = render(<AutosaveState error="The server rejected this save." />)

    expect(saving).toContain('role="status"')
    expect(saving).toContain('Saving your draft')
    expect(saving).toContain('data-autosave-trace="saving"')
    expect(failed).toContain('role="alert"')
    expect(failed).toContain('The server rejected this save.')
    expect(failed).toContain('data-autosave-trace="failed"')
  })

  it('renders publication checks from real readiness without replacing the gate', () => {
    const markup = render(
      <PublishPanel
        mode="schedule"
        onModeChange={vi.fn()}
        date="2026-03-12"
        onDateChange={vi.fn()}
        time="09:00"
        onTimeChange={vi.fn()}
        onSubmit={vi.fn()}
        hasTitle
        hasContent={false}
        isSeriesReady={false}
        now={new Date('2026-03-10T09:00:00Z')}
      />,
    )

    expect(markup).toContain('aria-label="Publication checks"')
    expect(markup).toContain('Title: ready')
    expect(markup).toContain('Writing: check needed')
    expect(markup).toContain('Publication time: ready')
    expect(markup).toContain('Series options: check needed')
    expect(markup).toContain('Add some writing before publishing.')
    expect(markup).toContain('disabled=""')
  })

  it('never turns a request error into a success claim', () => {
    const markup = render(
      <PublishPanel
        mode="now"
        onModeChange={vi.fn()}
        date=""
        onDateChange={vi.fn()}
        time=""
        onTimeChange={vi.fn()}
        onSubmit={vi.fn()}
        hasTitle
        hasContent
        submitError="Publishing failed."
      />,
    )

    expect(markup).toContain('Publishing failed.')
    expect(markup).not.toContain('Published successfully')
  })
})
