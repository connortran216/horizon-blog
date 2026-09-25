/**
 * Horizon Design System v2 - one section of a written report.
 *
 * The analytics patterns used to box themselves: a trend, a funnel, a list of
 * notes, each a flat card, until a page of them read as a dashboard. A report
 * section is the same content opened on a rule instead - a hairline across the
 * top and the section's own heading under it, like the sections of a printed
 * report. It owns that rule and nothing else: no fill, no radius, no shadow.
 *
 * Internal to the data patterns; callers use the patterns.
 */

import type { ReactNode } from 'react'

import { componentTokens, space } from '../../../theme/tokens'
import { Stack } from '../../components/layout'

export interface ReportSectionProps {
  children: ReactNode
}

export function ReportSection({ children }: ReportSectionProps) {
  return (
    <Stack
      as="section"
      gap={4}
      minW="0"
      paddingBlockStart={space[6]}
      borderTopWidth="1px"
      borderTopStyle="solid"
      borderTopColor={componentTokens.workspace.tableBorder}
    >
      {children}
    </Stack>
  )
}
