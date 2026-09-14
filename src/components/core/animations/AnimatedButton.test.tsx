/**
 * What the button actually emitted, not what the token table promises.
 *
 * `tokens.test.ts` already asserts that `text.onAction` on `action.primary`
 * clears 4.5:1 in both themes, and it passed the whole time the navbar's primary
 * button was measuring 2.38:1 in dark - because the token pairing was never the
 * problem. The component was reading `color: 'white'` and never touching the
 * pair. A test of the tokens cannot see that; a test of the rendered control can.
 *
 * Chakra compiles style props to Emotion rules, and outside a browser Emotion
 * inlines those rules into the markup as `<style>` tags. So `renderToStaticMarkup`
 * - the renderer this repo already uses for composition tests - is enough to read
 * back the declarations a control emitted, resolve the CSS custom properties in
 * them against the token table, and measure the result in both themes.
 */

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ChakraProvider } from '@chakra-ui/react'
// The theme the application actually mounts (`App.tsx`), not the legacy one
// still exported from `src/theme/index.ts`.
import horizonTheme from '../../../theme/horizon'
import {
  contrastRatio,
  semanticColor,
  semanticColors,
  textContrastFloor,
  type SemanticColorToken,
} from '../../../theme/tokens'
import { AnimatedGhostButton, AnimatedOutlineButton, AnimatedPrimaryButton } from './AnimatedButton'

const modes = ['light', 'dark'] as const

/**
 * Chakra registers every semantic role as `--chakra-colors-<role with dots as
 * dashes>`, so the emitted declaration can be mapped back to the role it came
 * from - and a declaration that maps to nothing is a colour the token table never
 * agreed to.
 */
const roleByCssVar = new Map<string, SemanticColorToken>(
  (Object.keys(semanticColors) as SemanticColorToken[]).map((role) => [
    `--chakra-colors-${role.replace(/\./g, '-')}`,
    role,
  ]),
)

const renderRules = (element: React.ReactElement) => {
  const markup = renderToStaticMarkup(
    <ChakraProvider theme={horizonTheme}>{element}</ChakraProvider>,
  )
  const buttonClass = markup.match(/<button[^>]*class="[^"]*\b(css-[a-z0-9]+)\b/i)?.[1]

  expect(buttonClass, 'the control rendered a button with an Emotion class').toBeTruthy()

  // The base rule only - not `:hover`, `:disabled` or the media queries that
  // follow it in the same style tag.
  const base = markup.match(new RegExp(`\\.${buttonClass}\\{([^}]*)\\}`))?.[1]

  expect(base, 'the emitted rule for that button was found in the markup').toBeTruthy()

  return { markup, declarations: base as string }
}

const declaration = (rules: string, property: string) => {
  // Emotion emits vendor-prefixed duplicates first; the last one is what applies.
  const matches = [...rules.matchAll(new RegExp(`(?:^|;)${property}:([^;]+)`, 'g'))]

  return matches.length ? matches[matches.length - 1][1].trim() : undefined
}

const roleOf = (value: string | undefined) => {
  const varName = value?.match(/var\((--chakra-colors-[a-zA-Z0-9-]+)\)/)?.[1]

  return varName ? roleByCssVar.get(varName) : undefined
}

describe('AnimatedPrimaryButton', () => {
  const { declarations } = renderRules(<AnimatedPrimaryButton>Sign in</AnimatedPrimaryButton>)
  const background = declaration(declarations, 'background')
  const color = declaration(declarations, 'color')

  it('paints its fill from a semantic role', () => {
    expect(roleOf(background), `background was ${background}`).toBe('action.primary')
  })

  it('takes its label colour from the role paired with that fill', () => {
    // Not `white`. The pairing is `control.solidFg`, which resolves to
    // `text.onAction` - white in light, near-black in dark.
    expect(roleOf(color), `color was ${color}`).toBe('text.onAction')
  })

  it('clears the AA floor on its own fill in both themes', () => {
    const labelRole = roleOf(color) as SemanticColorToken
    const fillRole = roleOf(background) as SemanticColorToken

    for (const mode of modes) {
      const ratio = contrastRatio(semanticColor(labelRole, mode), semanticColor(fillRole, mode))

      expect(ratio, `${labelRole} on ${fillRole} (${mode})`).toBeGreaterThanOrEqual(
        textContrastFloor,
      )
    }
  })

  it('names no colour of its own', () => {
    // A literal here is how the defect got in: a hex, an rgb() or a bare colour
    // keyword in the emitted rule is a value nobody signed off. `currentColor`
    // is the exception - it is a reference to the label colour, not a pigment.
    const literal = declarations.match(/(?:^|;)(?:background|color|border-color):\s*(#|rgb)/)

    expect(literal, `emitted rule: ${declarations}`).toBeNull()
  })
})

describe('the quiet variants', () => {
  // They take their colours from the Chakra variant, so they must not be
  // overridden with a solid pairing they are not sitting on.
  it.each([
    ['ghost', <AnimatedGhostButton key="ghost">Cancel</AnimatedGhostButton>],
    ['outline', <AnimatedOutlineButton key="outline">Cancel</AnimatedOutlineButton>],
  ])('does not paint %s with the solid action fill', (_name, element) => {
    const { declarations } = renderRules(element)

    expect(roleOf(declaration(declarations, 'background'))).not.toBe('action.primary')
  })
})
