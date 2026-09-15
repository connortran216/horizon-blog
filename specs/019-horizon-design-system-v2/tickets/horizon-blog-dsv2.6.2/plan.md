# Plan for horizon-blog-dsv2.6.2

## Spec

[`spec.md`](./spec.md)

## Files and symbols

- `src/design-system/patterns/editor/**`
- `src/components/editor/**`
- `src/features/editor/components/**`

## Implementation checklist

- [ ] Build WorkspaceShell, EditorToolbar, MetadataBar, TagField, MediaControl, PreviewCard, AutosaveState, PublishPanel, and ScheduleNotice.
- [ ] Represent saving, saved, failed, offline, uploading, invalid date, scheduled, permission loss, and recovery.
- [ ] Keep editor integrations and services unchanged.
- [ ] Provide responsive stacked workspace behavior.

## Verification

- [ ] Scheduled publication remains a draft timestamp.
- [ ] No editor library replacement.
- [ ] Critical state is never communicated by motion or color alone.
- [ ] Run the narrowest relevant tests and TypeScript check.
- [ ] Run `rtk code-review-graph detect-changes --base origin/main --brief` before commit.

## Risks

- Compatibility adapters can hide incomplete migration; every adapter must remain visible in the inventory.
- Component abstraction can erase domain identity; shared primitives own behavior while patterns own content hierarchy.
- Motion can regress accessibility or performance; reduced-motion and cleanup behavior are acceptance criteria.
