# Story 04: Validate Reader Independence and Cross-Repo Performance

**Dependencies**: Stories 02-03 and deployed backend optimization
**Owns**: final integration evidence

## Acceptance Criteria

- Article content remains usable when analytics and reaction requests delay or fail.
- Reaction failure degrades only the interaction control.
- Protected analytics remains lazy and sends no owner requests from public routes.
- Lint, type check, focused tests, build, contract, payload, and production timing gates pass.

## Validation

- Add only the minimum production change proven necessary by an independence test.
- Use the owner-provided local/deployed browser target for manual journeys.
- Record backend/frontend contract and performance evidence together.

## Definition of Done

- [ ] T023-T030 complete.
- [ ] Full validation passes or a concrete external blocker is recorded.
- [ ] Commit and validation recorded in `checklist.md`.
