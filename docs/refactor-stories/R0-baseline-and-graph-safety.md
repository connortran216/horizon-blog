# R0 - Baseline and Graph Safety

## Header

- Project: Horizon Blog frontend
- Service: Refactor safety and repository analysis
- Dependencies: none
- Blockers: `code-review-graph` registry may be empty or stale

## Context

This story establishes the current state before production refactors begin. It protects later work by separating pre-existing lint/build problems from regressions introduced during the architecture cleanup. See [plan section 5, Phase 0](../clean-architecture-refactor-plan.md#phase-0-refresh-graph-and-baseline).

## Acceptance Criteria

### Functional Requirements

- Confirm whether `code-review-graph` can inspect the repo.
  - Verify: `code-review-graph stats` or the available graph stats tool for `/Users/trantuancanh/Personal/work/golang/horizon-blog`
  - Pass: Output includes file/node/edge counts and a timestamp, or the limitation is documented in this story.

- Record baseline git state before implementation starts.
  - Verify: `git status --short`
  - Pass: Output is copied into the story notes or summarized with known untracked/modified paths.

### Technical Requirements

- Run baseline lint without applying fixes.
  - Verify: `yarn lint`
  - Pass: Command exits `0`, or failures are recorded as pre-existing baseline issues.

- Run baseline build.
  - Verify: `yarn build`
  - Pass: Command exits `0`, or failures are recorded as pre-existing baseline issues.

### Quality Gates

- No production source refactor is included in this story.
  - Verify: `git diff -- src`
  - Pass: No source-code diff exists for this story.

## Interface Contracts

None. This story produces baseline evidence only.

## Technical Approach

Focus Area: refactor safety. The key decision is to capture the current quality and graph state before changing architecture, so later failures can be attributed correctly. If graph tools are unavailable, source inspection remains acceptable, but the limitation must be explicit.

## Non-Goals

- Do not fix lint/build failures in this story.
- Do not change production code.
- Do not rebuild app architecture.

## Definition of Done

- Baseline graph status is recorded.
- Baseline `git status --short` is recorded.
- Baseline `yarn lint` result is recorded.
- Baseline `yarn build` result is recorded.

