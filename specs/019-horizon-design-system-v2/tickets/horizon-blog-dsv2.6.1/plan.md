# Plan for horizon-blog-dsv2.6.1

## Spec

[`spec.md`](./spec.md)

## Files and symbols

- `src/design-system/patterns/account/**`
- `src/features/auth/components/**`
- `src/features/profile/components/**`
- `src/features/about/components/**`
- `src/features/contact/components/**`
- `src/features/cv/components/**`

## Implementation checklist

- [ ] Build AuthPanel, AuthMethod, VerificationFeedback, ProfileHeader, AvatarEditor, ContactCard, and CVEntry patterns.
- [ ] Cover signed-out, callback, validation, disabled, permission, empty, and image failure states.
- [ ] Preserve founder and professional content.
- [ ] Provide compatibility adapters.

## Verification

- [ ] No auth or OAuth contract changes.
- [ ] External links and print behavior remain correct.
- [ ] Identity surfaces work in paired themes and mobile.
- [ ] Run the narrowest relevant tests and TypeScript check.
- [ ] Run `rtk code-review-graph detect-changes --base origin/main --brief` before commit.

## Risks

- Compatibility adapters can hide incomplete migration; every adapter must remain visible in the inventory.
- Component abstraction can erase domain identity; shared primitives own behavior while patterns own content hierarchy.
- Motion can regress accessibility or performance; reduced-motion and cleanup behavior are acceptance criteria.
