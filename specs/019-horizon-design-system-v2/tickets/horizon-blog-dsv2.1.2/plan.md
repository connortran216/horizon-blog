# Plan for horizon-blog-dsv2.1.2

## Spec

[`spec.md`](./spec.md)

## Files and symbols

- `DESIGN.md`
- `design-system/MASTER.md`
- `design-system/components/README.md`
- `design-system/pages/README.md`

## Implementation checklist

- [ ] Consolidate approved prototype, Beads decisions, current product behavior, and implementation constraints.
- [ ] Define brand, goals, personas, information architecture, principles, visual language, components, accessibility, responsive behavior, states, voice, constraints, and open questions.
- [ ] Document the no-page-migration gate and system ownership rules.
- [ ] Remove contradictions that describe the legacy Obsidian palette as the intended future system.

## Verification

- [ ] DESIGN.md contains every required design-workflow section.
- [ ] Approved light/dark and motion requirements are explicit.
- [ ] Existing service, auth, editor, and route contracts remain non-goals for redesign.
- [ ] Run the narrowest relevant tests and TypeScript check.
- [ ] Run `rtk code-review-graph detect-changes --base origin/main --brief` before commit.

## Risks

- Compatibility adapters can hide incomplete migration; every adapter must remain visible in the inventory.
- Component abstraction can erase domain identity; shared primitives own behavior while patterns own content hierarchy.
- Motion can regress accessibility or performance; reduced-motion and cleanup behavior are acceptance criteria.
