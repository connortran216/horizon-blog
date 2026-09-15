import { describe, expect, it } from 'vitest'

import horizonTheme from './horizon'
import { semanticColors, reducedMotionQuery } from './tokens'

/** What Chakra hands a style function. Only the parts these tests exercise. */
interface StyleProps {
  colorScheme: string
  colorMode: 'light' | 'dark'
  theme: typeof horizonTheme
}

describe('v2 Chakra adapter', () => {
  it('pairs every semantic role for both colour modes', () => {
    for (const token of Object.keys(semanticColors) as (keyof typeof semanticColors)[]) {
      const entry = horizonTheme.semanticTokens.colors[token]

      expect(entry, `${token} missing from the v2 theme`).toBeDefined()
      expect(entry.default, `${token} has no light value`).toBe(semanticColors[token].light)
      expect(entry._dark, `${token} has no dark value`).toBe(semanticColors[token].dark)
    }
  })

  it('uses the locally hosted Vietnamese-capable family', () => {
    expect(horizonTheme.fonts.body).toContain('Be Vietnam Pro')
    expect(horizonTheme.fonts.heading).toContain('Be Vietnam Pro')
    expect(horizonTheme.fonts.mono).toContain('ui-monospace')
  })

  it('exposes the approved shape and measure scales', () => {
    expect(horizonTheme.radii.control).toBe('12px')
    expect(horizonTheme.radii.card).toBe('20px')
    expect(horizonTheme.radii.feature).toBe('28px')
    expect(horizonTheme.sizes.prose).toBe('68ch')
    expect(horizonTheme.sizes.content).toBe('1120px')
  })

  it('uses the prototype layout transitions as breakpoints', () => {
    // A pixel above the prototype's max-width boundaries, because Chakra
    // breakpoints are min-widths.
    expect(horizonTheme.breakpoints.sm).toBe('681px')
    expect(horizonTheme.breakpoints.lg).toBe('1001px')
  })

  it('switches the type ramp where the prototype drops heading sizes', () => {
    expect(horizonTheme.textStyles.display.fontSize).toEqual({ base: '40px', sm: '64px' })
    expect(horizonTheme.textStyles.prose.lineHeight).toEqual({ base: '30px', sm: '32px' })
  })

  it('collapses motion under reduced motion instead of dropping state feedback', () => {
    const global = horizonTheme.styles.global as Record<string, Record<string, unknown>>
    const reduced = global[`@media ${reducedMotionQuery}`]

    expect(reduced).toBeDefined()

    const reset = reduced['*, *::before, *::after'] as Record<string, string>

    expect(reset.transitionDuration).toBe('0.01ms !important')
    expect(reset.animationDuration).toBe('0.01ms !important')
    // The rules survive, so hover, focus and saved states still change - instantly.
    expect(reset).not.toHaveProperty('transitionProperty')
  })

  it('lets an unbreakable string break, so it cannot set a box width', () => {
    const global = horizonTheme.styles.global as Record<string, Record<string, unknown>>

    // `anywhere` and not `break-word`: only `anywhere` also shrinks min-content,
    // which is what stops a flex child's `min-width: auto` floor from widening
    // to the length of a URL. Measured: the sign-in heading went 1042px -> 343px
    // and the page 709px -> 375px at a 375px viewport.
    expect(global['*'].overflowWrap).toBe('anywhere')
  })

  it('leaves block code unbroken, because a split token is a corrupted one', () => {
    const global = horizonTheme.styles.global as Record<string, Record<string, unknown>>

    // Inline `code` is deliberately absent here: inside a sentence it wraps with
    // the prose, or a long identifier bursts the article at 375.
    expect(global['pre, pre *'].overflowWrap).toBe('normal')
  })

  it('gives keyboard focus a visible ring in both themes', () => {
    const global = horizonTheme.styles.global as Record<string, Record<string, unknown>>
    const focus = global['*:focus-visible']

    expect(focus.outline).toBe('2px solid')
    expect(focus.outlineColor).toBe('focus.ring')
    expect(focus.outlineOffset).toBe('3px')
  })

  it('wires component variants to roles the system defines', () => {
    /*
     * extendTheme composes our variant with Chakra's default rather than
     * replacing it, so the default still runs and still needs the props it
     * derives from. What matters is that our values win the merge - hence the
     * check that no colorScheme-derived shard survives.
     */
    const props: StyleProps = { colorScheme: 'gray', colorMode: 'light', theme: horizonTheme }
    const variants = horizonTheme.components.Button.variants as Record<
      string,
      (props: StyleProps) => unknown
    >

    for (const name of ['solid', 'ghost', 'outline', 'danger']) {
      const style = JSON.stringify(variants[name](props))

      expect(style, `Button ${name} leaks a colorScheme-derived value`).not.toContain('undefined.')
    }

    const solid = variants.solid(props) as Record<string, never>

    expect(semanticColors).toHaveProperty(solid.bg)
    expect(semanticColors).toHaveProperty(solid.color)
  })

  /*
   * The surface v2 actually publishes. Chakra ships further variants - filled,
   * flushed, unstyled - which still carry its grey and its focus blue. They are
   * unreachable here because every field pins `variant: outline`, and because v2
   * pages consume the form primitives from `dsv2.3.3` rather than a raw Chakra
   * Input. Restyling variants the system does not offer would only make the
   * surface look wider than it is.
   */
  const V2_SURFACE: Record<string, string[]> = {
    Button: ['solid', 'ghost', 'outline', 'link', 'danger'],
    Input: ['outline'],
    Textarea: ['outline'],
    FormLabel: [],
    Link: [],
    Card: [],
    Menu: [],
    Modal: [],
  }

  it('pins the variant on every component that has an unused Chakra default', () => {
    expect(horizonTheme.components.Input.defaultProps.variant).toBe('outline')
    expect(horizonTheme.components.Textarea.defaultProps.variant).toBe('outline')
    expect(horizonTheme.components.Button.defaultProps.variant).toBe('solid')
  })

  /*
   * Found by measuring the built gallery, not by reading the code: a loading
   * button carries aria-disabled="true" so it stops taking clicks while keeping
   * focus, and Chakra's `_disabled` styling matches [aria-disabled=true] too, so
   * a button that was merely working painted itself with the disabled fill -
   * 1.81:1 in light and 1.64:1 in dark, against a 4.5:1 floor.
   *
   * WCAG 1.4.3 exempts inactive components, not busy ones, and "Publishing
   * post" is exactly the text a reader needs while waiting.
   */
  it('keeps a busy control at its resting fill rather than the disabled one', () => {
    const props: StyleProps = { colorScheme: 'gray', colorMode: 'light', theme: horizonTheme }
    const variants = horizonTheme.components.Button.variants as Record<
      string,
      (props: StyleProps) => Record<string, never>
    >

    for (const name of ['solid', 'ghost', 'outline', 'danger']) {
      const style = variants[name](props)
      // Both routes into the busy state: our controlState sets aria-busy,
      // Chakra's own isLoading sets data-loading.
      const busy = style['&[aria-busy="true"], &[data-loading]'] as
        | Record<string, string>
        | undefined

      expect(busy, `Button ${name} has no busy style`).toBeDefined()
      expect(busy?.opacity, `Button ${name} dims while busy`).toBe(1)

      const disabled = style._disabled as Record<string, string>

      // Whatever the busy state paints, it must not be the disabled paint.
      for (const property of ['bg', 'color', 'borderColor']) {
        if (busy?.[property] === undefined || disabled[property] === undefined) continue

        expect(
          busy[property],
          `Button ${name} paints ${property} the same when busy as when disabled`,
        ).not.toBe(disabled[property])
      }
    }
  })

  it('lets no Chakra default colour survive the merge', () => {
    const props: StyleProps = { colorScheme: 'gray', colorMode: 'light', theme: horizonTheme }

    const resolve = (value: unknown): unknown =>
      typeof value === 'function' ? (value as (p: StyleProps) => unknown)(props) : value

    for (const [name, variants] of Object.entries(V2_SURFACE)) {
      const component = horizonTheme.components[name] as Record<string, never>
      const parts = [component.baseStyle, ...variants.map((variant) => component.variants[variant])]
      const rendered = JSON.stringify(parts.map(resolve))

      // A Chakra palette entry or a bare hex is a value the system never chose;
      // either one means a default leaked through the override.
      expect(rendered, `${name} keeps a Chakra palette colour`).not.toMatch(
        /"(gray|blue|red|green|teal|purple|whiteAlpha|blackAlpha)\.\d/,
      )
      expect(rendered, `${name} keeps a raw hex colour`).not.toMatch(/"#[0-9a-fA-F]{3,8}"/)
      expect(rendered, `${name} keeps a colorScheme-derived value`).not.toContain('undefined.')
    }
  })
})
