import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import horizonTheme from '../../../theme/horizon'
import { Trend } from './Trend'

describe('Trend confirmed-data transition', () => {
  it('renders final geometry, summary and table values in the same commit', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider theme={horizonTheme}>
        <Trend
          title="Views"
          points={[
            { label: '2026-09-20', value: 4 },
            { label: '2026-09-21', value: 12 },
          ]}
        />
      </ChakraProvider>,
    )

    expect(markup).toContain('data-trend-geometry="area"')
    expect(markup).toContain('data-trend-geometry="line"')
    expect(markup).toContain('Views: 2 days from 2026-09-20 to 2026-09-21')
    expect(markup).toContain('<td')
    expect(markup).toContain('12')
  })
})
