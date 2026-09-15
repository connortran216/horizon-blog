/**
 * Syntax colours for every code listing, on the design system's own tokens.
 *
 * CodeMirror ships One Dark. It is a fixed dark palette with no idea the site
 * has a light theme, and measured on an article at 1440 in light, against
 * `bg.code`, all nine of its colours failed the 4.5:1 floor - the worst, plain
 * numbers, at 1.53:1. This replaces it on both surfaces, reading and writing -
 * verified in-browser at every role, both themes; see the status note on
 * `horizonSyntaxExtensions` below for the two bugs that stood in the way.
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
 * Handed to Crepe's CodeMirror feature config as `theme` (see `CrepeEditor.tsx`),
 * not folded into `extensions` - that placement is what keeps `oneDark` out of
 * the config lodash's `defaultsDeep` builds. `Prec.highest` here is a
 * defensive no-op, kept in case another extension ever registers a second
 * non-fallback highlighter alongside this one.
 *
 * A second, unrelated bug used to keep every span out of this style even
 * with `oneDark` gone: this project's own `@codemirror/language` dependency
 * resolved to a different version than the rest of the CodeMirror/Milkdown
 * tree, so this style registered against a private facet the actual
 * code-block renderer never read. Fixed by pinning the dependency (see the
 * long comment in `CrepeEditor.tsx` for the full root-cause chain).
 */
export function horizonSyntaxExtensions(): Extension {
  return Prec.highest(syntaxHighlighting(horizonHighlightStyle))
}
