# Plan for horizon-blog-dsv2.2.2

## Spec

[`spec.md`](./spec.md)

## Files and symbols

- `src/theme/index.ts`
- `src/theme/index.test.ts`
- `src/theme/fonts.css`
- `src/main.tsx`
- `public/fonts/be-vietnam-pro/**`

## Implementation checklist

- [ ] Build the Chakra theme from token modules.
- [ ] Keep temporary compatibility aliases for legacy semantic names.
- [ ] Install the already approved local Be Vietnam Pro assets from the prototype handoff.
- [ ] Define global focus, color-mode, reduced-motion, and base component behavior.
- [ ] Verify current route snapshots and build behavior remain structurally stable.

## Verification

- [ ] Existing pages compile without page edits.
- [ ] Theme tests cover compatibility aliases and paired tokens.
- [ ] Font loading uses local assets and font-display swap.
- [ ] Reduced motion disables theme animation without removing state feedback.
- [ ] Run the narrowest relevant tests and TypeScript check.
- [ ] Run `rtk code-review-graph detect-changes --base origin/main --brief` before commit.

## Risks

- Compatibility adapters can hide incomplete migration; every adapter must remain visible in the inventory.
- Component abstraction can erase domain identity; shared primitives own behavior while patterns own content hierarchy.
- Motion can regress accessibility or performance; reduced-motion and cleanup behavior are acceptance criteria.
