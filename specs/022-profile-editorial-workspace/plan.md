# Implementation Plan: Profile Editorial Workspace

**Spec**: `specs/022-profile-editorial-workspace/spec.md`
**Status**: Complete
**Branch**: `codex/epic-horizon-blog-dsv2`

## Guides Loaded

- `docs/agent-guides/workflow.md`
- `docs/agent-guides/design-system.md`
- `docs/agent-guides/domain.md`
- `docs/agent-guides/project-reference.md`
- `design-system/MASTER.md`
- `design-system/components/README.md`
- `design-system/pages/README.md`
- `design-system/pages/profile.md`
- `design-system/storybook-mcp.md`
- `.specify/memory/constitution.md`

## Discovery Outcome

The Storybook MCP pilot does not expose the account patterns. Current source and the complete `ui-kit.html` gallery confirm that `ProfileHeader` and `AvatarEditor` already own the required identity behavior. The implementation therefore extends those existing patterns with opt-in workspace presentations and keeps their default/public presentation unchanged.

## Implementation

1. Add failing render tests for workspace hierarchy, edit-action placement, permission behavior, semantic stats, and square portrait presentation.
2. Add an opt-in `workspace` layout to `ProfileHeader` with a separate identity-action slot.
3. Add an opt-in `workspace` presentation to `AvatarEditor` that preserves its existing input, progress, failure, and retry state machine.
4. Update `ProfileHeaderCard` to pass `Write a blog` as the primary action and `Edit profile` as the identity action.
5. Add a workspace state to the design-system gallery and document the Storybook capability gap.
6. Verify targeted tests, static gates, browser interactions, responsive themes, and visual fidelity against the approved reference.

## Risk Controls

- Default props retain current public author-archive rendering.
- No business logic moves into render code; permissions remain in `ProfileHeaderCard`.
- No new raw colors, spacing, radii, typography, or breakpoints.
- The workspace portrait presentation reuses the existing file input and state reducer rather than duplicating upload behavior.
- The protected route requires authentication, so browser visual QA uses the design-system gallery state backed by the same production patterns and separately verifies protected-route redirect behavior.

## Verification

- `rtk yarn test src/features/profile src/design-system/patterns/account`
- `rtk yarn tsc --noEmit`
- `rtk yarn lint`
- `rtk yarn format`
- `rtk yarn coverage:design-system`
- `rtk yarn build`
- Browser: `ui-kit.html` workspace state at 320, 375, 768, 1024, and 1440 in both themes; keyboard focus; console errors.
- Browser: protected `/profile/:username` continues to redirect unauthenticated visitors to login.
- `design-qa.md` final result is `passed` before handoff.
