# Plan for horizon-blog-dsv2.2.1

## Spec

[`spec.md`](./spec.md)

## Files and symbols

- `src/theme/tokens/primitives.ts`
- `src/theme/tokens/semantic.ts`
- `src/theme/tokens/motion.ts`
- `src/theme/tokens/components.ts`
- `src/theme/tokens/index.ts`
- `design-system/tokens.json`

## Implementation checklist

- [ ] Translate the approved 46-token baseline into typed modules.
- [ ] Add missing semantic roles for overlays, disabled states, inverse surfaces, selection, code, and media feedback only when derived from an existing need.
- [ ] Separate primitives from semantic roles and component aliases.
- [ ] Add contract tests for paired theme values and stable token names.

## Verification

- [ ] TypeScript rejects unknown token names.
- [ ] Light and dark semantic roles are paired.
- [ ] No page-specific token is introduced.
- [ ] Contrast-critical pairs retain approved values.
- [ ] Run the narrowest relevant tests and TypeScript check.
- [ ] Run `rtk code-review-graph detect-changes --base origin/main --brief` before commit.

## Risks

- Compatibility adapters can hide incomplete migration; every adapter must remain visible in the inventory.
- Component abstraction can erase domain identity; shared primitives own behavior while patterns own content hierarchy.
- Motion can regress accessibility or performance; reduced-motion and cleanup behavior are acceptance criteria.
