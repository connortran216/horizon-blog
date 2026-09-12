/**
 * Horizon Design System v2 - the reading column.
 *
 * A presentation frame, not a renderer. Milkdown, Crepe, Prism and mermaid keep
 * producing the markup; `Prose` owns the measure, the rhythm, the link and code
 * contrast, and the rule that nothing inside it may widen the document.
 *
 * That last rule is the one that needs enforcing from here rather than from the
 * renderer. A markdown table or a fenced block arrives as a bare `table` or
 * `pre` with no wrapper we control, so the local-overflow style is applied by
 * descendant selector - which means a wide table added to an article three
 * years from now is contained without anybody having to remember.
 *
 * `dsv2.5.3` acceptance 1.
 */

import { forwardRef } from 'react'

import { componentTokens, radii, space } from '../../../theme/tokens'
import { ErrorState, RetryAction } from '../../components/feedback'
import { ProseMeasure, type ProseMeasureProps } from '../../components/layout'
import { Text } from '../../components/typography'
import { localScrollStyle, proseRenderState } from './code.logic'

export interface ProseProps extends Omit<ProseMeasureProps, 'children'> {
  children?: React.ReactNode
  /** Set when the renderer threw. The frame shows a failure, not a blank page. */
  renderError?: string | null
  onRetryRender?: () => void
  /** Shown when the article genuinely has no body yet. */
  emptyMessage?: string
}

export const Prose = forwardRef<HTMLElement, ProseProps>(function Prose(
  {
    children,
    renderError = null,
    onRetryRender,
    emptyMessage = 'This blog has no content yet.',
    ...rest
  },
  ref,
) {
  const state = proseRenderState({ hasContent: Boolean(children), error: renderError })
  const scroll = localScrollStyle()

  if (state === 'error') {
    return (
      <ErrorState failedAction="render this blog" align="start">
        {onRetryRender ? (
          <RetryAction failedAction="render this blog" onRetry={onRetryRender} />
        ) : null}
      </ErrorState>
    )
  }

  if (state === 'empty') {
    return (
      <Text as="p" recipe="body">
        {emptyMessage}
      </Text>
    )
  }

  return (
    <ProseMeasure
      ref={ref}
      as="div"
      textStyle="prose"
      color={componentTokens.reader.fg}
      sx={{
        // `anywhere` rather than `break-word`: a 90-character URL in a
        // paragraph is the one piece of prose that will otherwise push the
        // whole column wider than the measure.
        overflowWrap: 'anywhere',

        'p, ul, ol, blockquote': { marginBlock: space[6], color: componentTokens.reader.fg },
        'h2, h3, h4': { color: componentTokens.reader.fg, letterSpacing: 'tight' },
        h2: {
          textStyle: 'sectionTitle',
          marginBlockStart: space[12],
          marginBlockEnd: space[4],
          // A deep link must not land the heading under the floating header.
          scrollMarginBlockStart: space[16],
        },
        h3: {
          textStyle: 'cardTitle',
          marginBlockStart: space[8],
          marginBlockEnd: space[3],
          scrollMarginBlockStart: space[16],
        },
        h4: { textStyle: 'body', marginBlockStart: space[6], marginBlockEnd: space[2] },
        'ul, ol': { paddingInlineStart: space[6] },
        li: { marginBlock: space[2] },
        a: {
          color: componentTokens.reader.link,
          textDecoration: 'underline',
          textUnderlineOffset: space[1],
        },
        blockquote: {
          paddingInline: space[6],
          paddingBlock: space[2],
          borderInlineStartWidth: '3px',
          borderInlineStartStyle: 'solid',
          borderInlineStartColor: componentTokens.reader.tocActive,
          background: componentTokens.card.hoverBg,
          borderStartEndRadius: radii.control,
          borderEndEndRadius: radii.control,
        },
        // Inline code only. A `pre > code` is the block form and is styled by
        // `CodeBlock`, which owns its own frame.
        ':not(pre) > code': {
          background: componentTokens.reader.codeBg,
          borderRadius: radii.control,
          paddingInline: space[1],
          fontFamily: 'mono',
        },
        '::selection': { background: componentTokens.reader.selectionBg },

        // Wide content scrolls inside itself. Applied by descendant selector so
        // markup this component never sees is still contained.
        'pre, table': { ...scroll, display: 'block' },
        table: { borderCollapse: 'collapse', width: '100%' },
        'th, td': {
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: componentTokens.card.border,
          padding: space[3],
          textAlign: 'start',
        },
        img: { maxWidth: '100%', height: 'auto', borderRadius: radii.card },
      }}
      {...rest}
    >
      {children}
    </ProseMeasure>
  )
})
