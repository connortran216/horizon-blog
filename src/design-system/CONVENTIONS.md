# Horizon Design System v2 — implementation conventions

Read this before adding anything under `src/design-system/`.

Governing documents: [`DESIGN.md`](../../DESIGN.md) for the design contract,
[`design-system/component-inventory.md`](../../design-system/component-inventory.md) for what each
legacy file maps to.

## Hard rules

1. **Nothing here is imported by a production page.** The migration gate is
   `horizon-blog-dsv2.7.3`. Until it passes, `src/features/**` and `src/pages/**` keep their current
   imports and their current appearance.
2. **No raw design values.** Every colour, radius, spacing, duration and easing comes from
   `src/theme/tokens`. A literal hex, px radius or ms duration in a component is a bug.
3. **No new dependencies.** React 18, TypeScript, Chakra UI v2, Framer Motion and React Router are
   what exist. Ask the owner before reaching for anything else — including test libraries.
4. **One visual owner per surface.** A component owns its border, radius, shadow, clipping, hover
   depth and focus outline, or it owns none of them and lets a parent decide. Never both.
5. **Primitives own behaviour, patterns own hierarchy.** A primitive knows about states; it does not
   know it is showing a blog post.

## Token access

```ts
import { componentTokens, duration, semanticColors, transitionFor } from '../../../theme/tokens'
```

There is no path alias in this repo — use relative imports. Chakra style props take semantic role
names directly (`bg="bg.surface"`, `color="text.primary"`) because `horizonTheme` registers every
role as a Chakra semantic token.

## Component shape

Each component is a folder-level module with a named export, re-exported from its area barrel:

```
src/design-system/
  components/
    actions/
      Button.tsx
      Button.logic.ts        # pure decisions, when there are any
      Button.test.ts         # tests the logic module
      index.ts               # barrel for the area
  index.ts                   # top-level barrel, owned by the orchestrator
```

Props extend the underlying Chakra or DOM props rather than redefining them, so a caller can still
pass `aria-*`, `data-*` and event handlers:

```ts
export interface ActionButtonProps extends Omit<ChakraButtonProps, 'variant'> {
  variant?: ActionVariant
}
```

## Testing

There is no jsdom and no Testing Library here, and adding either is an owner decision, not a
component decision. But that does **not** mean components go unrendered: around two dozen existing
tests render to static markup with `renderToStaticMarkup` from `react-dom/server`, which needs no
DOM. `ProtectedRoute`, `HomePage`, `SeriesCard`, `BlogPage` and `CommentThread` all do it. Use it.

(An earlier version of this file claimed the repo never renders in tests. It was wrong, and it cost
work: agents avoided a capability the repo already had, and one wrote a render test to verify its
own component and then deleted it, believing it was forbidden.)

Two tools, two jobs:

**Pure functions for decisions.** Put the decision in a `*.logic.ts` module and test it there.

```ts
// Field.logic.ts
export function fieldAria(props: FieldAriaInput): FieldAriaOutput { ... }

// Field.test.ts
it('links the error message to the input', () => {
  expect(fieldAria({ id: 'email', error: 'Required' }).input['aria-describedby']).toBe('email-error')
})
```

That covers aria wiring, state precedence, variant selection, size mapping, reduced-motion branching,
and retry and error transitions well — and it keeps those decisions testable without a renderer.

**Static markup for composition.** When the question is "does this component actually emit that
element, that attribute, that text", render it:

```tsx
const markup = renderToStaticMarkup(
  <ChakraProvider theme={horizonTheme}>
    <MemoryRouter>
      <PostCard post={samplePost} />
    </MemoryRouter>
  </ChakraProvider>,
)

expect(markup).toContain('aria-current="page"')
```

Reach for it when a pure function cannot answer the question: the rendered element type, aria
attributes that only exist once composed, whether a slot renders at all, the document outline.

What neither covers, and which therefore belongs to the gallery and the manual accessibility matrix:
real focus movement, real screen-reader output, real paint, real layout. Static markup proves what
was emitted, not what it looks like or how it behaves. Do not fake those and call the requirement met.

## Accessibility floor

Every interactive component:

- uses a native `button`, `a`, `input` or `summary` — never a `div` with a click handler;
- keeps a visible focus ring in both themes (the global `*:focus-visible` rule already provides it —
  do not remove it with a custom `_focus`);
- reaches 44×44px of touch target where space permits;
- never encodes meaning in hover or colour alone;
- links its label, hint and error with `aria-describedby` / `aria-labelledby`, and marks invalid
  fields with `aria-invalid`.

## Motion

- Transform and opacity only. Hover lift is at most 2px and must not change layout footprint.
- Under `prefers-reduced-motion: reduce`, translation, parallax, ambient movement and pointer
  following stop; colour, opacity and focus feedback stay.
- Every timer, observer and animation frame is cleaned up on unmount. A test should be able to prove
  it, which means the subscription belongs in a pure helper or an explicit effect, not inline in JSX.
- Continuous animation is reserved for loading, and for the two sanctioned artworks
  (`SynapseField` on Home and on About). Both stop under reduced motion - `synapseScene` is the
  shape of that decision. Decoration never gates content: an anchor the field has not written by
  `fallbackMs` appears on its own.
- A canvas is allowed only for artwork the DOM cannot carry at sixty frames a second, and it paints
  with the resolved values of the system's colour variables (`parseColorChannels`), never a literal.
- A motion primitive paints only motion. `PointerLight`, `Typeset` and `SignalTarget` own no
  border, radius, shadow or clip; they sit _inside_ the `Surface` or heading that does.
  `SynapseField` is the one exception because it is artwork and shell at once, and it delegates
  those four things to a `Surface` of its own.
- Selectors (`& > *`, `&:hover [data-x]`, `@media`) travel in `sx`. Written as plain props they are
  not style props to Chakra and reach the DOM as attribute names React refuses.
