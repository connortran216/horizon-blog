/**
 * Syntax colours for every code listing, on the design system's own tokens.
 *
 * CodeMirror ships One Dark. It is a fixed dark palette with no idea the site
 * has a light theme, and measured on an article at 1440 in light, against
 * `bg.code`, all nine of its colours failed the 4.5:1 floor - the worst, plain
 * numbers, at 1.53:1. This replaces it on both surfaces, reading and writing.
 *
 * **Why the colours are CSS variables and not values.** A CodeMirror extension
 * is fixed when the editor is constructed, but the theme changes under a live
 * page whenever the reader uses the toggle. Naming Chakra's own variables lets
 * one static extension serve both themes: Chakra publishes every semantic token
 * as `--chakra-colors-<token with dots as dashes>` and rewrites them on the
 * colour-mode switch, so the listing follows the page without the editor being
 * rebuilt. Rebuilding it would mean tearing down every CodeMirror instance in
 * the document to change a colour.
 *
 * The token pairs, and the arithmetic behind them, are in
 * `src/theme/tokens/semantic.ts` under `code.syntax.*`.
 */

import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { Prec, type Extension } from '@codemirror/state'

/** `code.syntax.keyword` becomes `var(--chakra-colors-code-syntax-keyword)`. */
const token = (name: string) => `var(--chakra-colors-code-syntax-${name})`

/**
 * Lezer's tag set is much finer than eight roles, which is the point: a listing
 * that gives every token class its own pigment is the "random colour" the
 * design system's Avoid list rules out. Tags not named here inherit the code
 * block's own text colour, which is the default `text.primary` on `bg.code` at
 * 13.9:1 - a legible fallback rather than an invisible one, so a language whose
 * grammar emits tags this list never mentions still reads correctly.
 */
export const horizonHighlightStyle = HighlightStyle.define([
  { tag: [tags.keyword, tags.modifier, tags.controlKeyword], color: token('keyword') },
  {
    tag: [tags.function(tags.variableName), tags.function(tags.propertyName), tags.macroName],
    color: token('function'),
  },
  {
    tag: [tags.typeName, tags.className, tags.namespace, tags.standard(tags.name)],
    color: token('type'),
  },
  { tag: [tags.string, tags.special(tags.string), tags.regexp], color: token('string') },
  { tag: [tags.number, tags.bool, tags.atom, tags.literal], color: token('number') },
  {
    tag: [tags.operator, tags.punctuation, tags.separator, tags.bracket],
    color: token('operator'),
  },
  {
    tag: [tags.comment, tags.lineComment, tags.blockComment, tags.docComment],
    color: token('comment'),
    fontStyle: 'italic',
  },
  { tag: [tags.invalid], color: token('invalid') },
])

/**
 * Handed to Crepe's CodeMirror feature as its `theme`, on both surfaces.
 *
 * Two things had to be true for this to replace One Dark, and each was measured
 * failing first:
 *
 * - **It must not be an array.** Crepe merges with lodash `defaultsDeep`, which
 *   walks arrays element by element. `oneDark` is an array, so handing it
 *   another array merged the two: index 0 became ours and One Dark's highlight
 *   style survived at index 1. The listing came out with our code background
 *   and One Dark's colours, which is exactly what the measurement showed.
 *   `Prec` returns a single object, so there is nothing for `defaultsDeep` to
 *   recurse into.
 * - **It must outrank what remains.** CodeMirror resolves highlighters by
 *   precedence and the first to claim a tag wins; `basicSetup` registers
 *   `defaultHighlightStyle` before any config is read. `highest` settles that
 *   without depending on the order Crepe happens to build its list in.
 */
export function horizonSyntaxExtensions(): Extension {
  return Prec.highest(syntaxHighlighting(horizonHighlightStyle))
}
