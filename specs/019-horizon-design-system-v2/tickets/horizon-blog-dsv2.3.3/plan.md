# Plan for horizon-blog-dsv2.3.3

## Spec

[`spec.md`](./spec.md)

## Files and symbols

- `src/design-system/components/forms/**`
- `src/design-system/components/status/**`

## Implementation checklist

- [ ] Build Field, Input, Textarea, Select, Checkbox, Radio, Switch, Chip, and StatusBadge wrappers.
- [ ] Standardize labels, hints, required markers, validation messages, and aria linkage.
- [ ] Cover disabled, read-only, invalid, loading, and success states.
- [ ] Add long-label and mobile coverage.

## Verification

- [ ] Every field has a programmatic label.
- [ ] Errors are announced and not color-only.
- [ ] Touch targets and contrast meet the design contract.
- [ ] Run the narrowest relevant tests and TypeScript check.
- [ ] Run `rtk code-review-graph detect-changes --base origin/main --brief` before commit.

## Risks

- Compatibility adapters can hide incomplete migration; every adapter must remain visible in the inventory.
- Component abstraction can erase domain identity; shared primitives own behavior while patterns own content hierarchy.
- Motion can regress accessibility or performance; reduced-motion and cleanup behavior are acceptance criteria.
