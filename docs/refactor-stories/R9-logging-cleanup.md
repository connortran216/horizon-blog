# R9 - Logging Cleanup

## Header

- Project: Horizon Blog frontend
- Service: Production logging hygiene
- Dependencies: R6
- Blockers: none

## Context

Editor and reader flows contain debug logs that are useful during development but noisy in production. This story removes or gates debug logging while preserving meaningful failure logs. See [plan section 5, Phase 9](../clean-architecture-refactor-plan.md#phase-9-logging-cleanup).

## Acceptance Criteria

### Functional Requirements

- User-facing behavior is unchanged after debug logs are removed.
  - Verify: `yarn build`
  - Pass: Editor, reader, and profile consumers compile without removed log-side effects.

### Technical Requirements

- Production debug `console.log` calls are removed from `src`.
  - Verify: `rg "console\\.log" src`
  - Pass: No matches, or every match is documented as intentional in this story.

- Meaningful failure logging remains.
  - Verify: `rg "console\\.error" src`
  - Pass: Failure logs still exist for important catch paths.

- No new logging abstraction is introduced.
  - Verify: `rg "logger|createLogger|logService" src`
  - Pass: No new logging abstraction appears unless separately approved.

### Quality Gates

- Lint passes.
  - Verify: `yarn lint`
  - Pass: Command exits `0`.

- Build passes.
  - Verify: `yarn build`
  - Pass: Command exits `0`.

## Interface Contracts

None. This story changes logging hygiene only.

## Technical Approach

Focus Area: production cleanliness. The safest approach is to remove debug logs rather than add a logging system, because the repo guidance asks for minimal logging and the current need is noise reduction, not observability redesign.

## Non-Goals

- Do not add analytics.
- Do not add a logger dependency.
- Do not remove meaningful error handling.

## Definition of Done

- Debug `console.log` calls are gone or documented.
- Important `console.error` paths remain.
- Lint and build pass.

