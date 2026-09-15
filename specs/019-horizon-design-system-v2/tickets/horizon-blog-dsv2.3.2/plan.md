# Plan for horizon-blog-dsv2.3.2

## Spec

[`spec.md`](./spec.md)

## Files and symbols

- `src/design-system/components/actions/**`
- `src/design-system/components/navigation/**`

## Implementation checklist

- [ ] Build Button, IconButton, ActionLink, NavItem, ThemeToggle, and RailControl variants.
- [ ] Define default, hover, press, focus, current, disabled, loading, and danger states.
- [ ] Keep native link and button semantics.
- [ ] Add touch-safe sizing and reduced-motion equivalents.

## Verification

- [ ] No interactive divs.
- [ ] Focus remains visible in both themes.
- [ ] Hover transforms never shift layout.
- [ ] Controls do not depend on hover for meaning.
- [ ] Run the narrowest relevant tests and TypeScript check.
- [ ] Run `rtk code-review-graph detect-changes --base origin/main --brief` before commit.

## Risks

- Compatibility adapters can hide incomplete migration; every adapter must remain visible in the inventory.
- Component abstraction can erase domain identity; shared primitives own behavior while patterns own content hierarchy.
- Motion can regress accessibility or performance; reduced-motion and cleanup behavior are acceptance criteria.
