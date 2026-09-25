/**
 * Static-markup checks for the analytics patterns as a written report: what
 * they emit once they stop boxing themselves. Real travel belongs to the
 * gallery.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import { radii } from '../../../theme/tokens'
import { DataTable } from './DataTable'
import { InsightList } from './InsightList'
import { Metric, MetricGrid } from './Metric'
import { Trend } from './Trend'

const withoutStyles = (markup: string) => markup.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<ChakraProvider theme={horizonTheme}>{node}</ChakraProvider>)

describe('a row of metrics', () => {
  const markup = withoutStyles(
    render(
      <MetricGrid columns={3}>
        <Metric label="Views" value={1460} emphasis="lead" />
        <Metric label="Unique readers" value={1010} isApproximate emphasis="lead" />
        <Metric label="Active read" value={262} kind="duration" />
      </MetricGrid>,
    ),
  )

  it('opens on one rule that writes the figures', () => {
    expect(markup.match(/data-signal-line=""/g)).toHaveLength(1)
  })

  it('keeps each metric an article with its own heading and honest estimate', () => {
    expect(markup.match(/<article/g)).toHaveLength(3)
    expect(markup.match(/<h3/g)).toHaveLength(3)
    expect(markup).toContain('~1,010')
    expect(markup).toContain('approximate')
  })
})

describe('an unframed table', () => {
  const table = (framed: boolean) =>
    render(
      <DataTable
        caption="Link performance"
        framed={framed}
        columns={[{ key: 'label', label: 'Link', render: (row: { label: string }) => row.label }]}
        rows={[{ label: 'Useful resource' }]}
        rowKey={(row) => row.label}
      />,
    )

  it('drops the box a management table keeps', () => {
    expect(table(true)).toContain(`border-radius:${radii.card}`)
    expect(table(false)).not.toContain(`border-radius:${radii.card}`)
  })

  it('sends its scrolling and figure rules as CSS, not as DOM attributes', () => {
    const markup = withoutStyles(table(false))

    expect(markup).not.toMatch(/webkitoverflowscrolling|fontvariantnumeric/i)
  })
})

describe('the notes and the trend', () => {
  it('states evidence as a sentence', () => {
    const markup = render(
      <InsightList
        insights={[
          {
            code: 'completion',
            message: 'Readers finished this blog more often than your average.',
            sampleSize: 150,
            evidence: [{ metric: 'Completion', value: '62%', baseline: '51%' }],
          },
        ]}
      />,
    )

    expect(markup).toContain('62%, against a 51% baseline')
  })

  it('draws its line behind a window and keeps the readable summary', () => {
    const markup = render(
      <Trend
        title="Views"
        points={[
          { label: '2026-09-20', value: 4 },
          { label: '2026-09-21', value: 12 },
        ]}
      />,
    )

    expect(markup).toContain('data-trend-geometry="line"')
    expect(markup).toContain('Views: 2 days from 2026-09-20 to 2026-09-21')
    expect(markup).toContain('translateX(-100%)')
  })
})
