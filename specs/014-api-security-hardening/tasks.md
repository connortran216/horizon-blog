# Tasks: API Security Hardening

## Phase 1: Setup

- [ ] T001 Record approved backend contract version and rollout dependencies in `specs/014-api-security-hardening/checklists/readiness.md`
- [ ] T002 [P] Add security canary/storage assertion helpers in `src/features/auth/test/securityAssertions.ts`
- [ ] T003 [P] Add account-security error/status types in `src/core/types/auth.types.ts`

## Phase 2: Foundational transport

- [ ] T004 Add non-replaying request-mode tests in `src/core/services/api.service.test.ts`
- [ ] T005 Implement explicit one-attempt sensitive transport behavior in `src/core/services/api.service.ts` and `src/core/services/auth.transport.ts`
- [x] T006 [P] Add auth pending/verification adapter tests in `src/core/services/auth.transport.test.ts`
- [ ] T007 Add pending, verification, resend, and reauthentication methods in `src/core/services/auth.transport.ts`
- [ ] T008 Wire account-security service dependencies in `src/core/di/container.ts`

## Phase 3: User Story 1 - Verified registration

**Independent test**: Registration creates no session; verify/resend states work; unverified login and Google conflict stay signed out.

- [x] T009 [P] [US1] Add registration pending tests in `src/core/services/auth-session.service.test.ts` and auth page tests
- [x] T010 [US1] Change registration to pending behavior in `src/core/services/auth-session.service.ts`, `src/context/AuthContext.tsx`, and register feature files
- [x] T011 [P] [US1] Add verification route/page tests in `src/features/auth/pages/VerifyEmailPage.test.tsx`
- [x] T012 [US1] Implement verification/resend flow in `src/features/auth/pages/VerifyEmailPage.tsx` and focused auth components
- [x] T013 [US1] Register the verification route in `src/Routes.tsx`
- [x] T014 [P] [US1] Add unverified-login and Google-conflict tests in login/callback test files under `src/features/auth/`
- [x] T015 [US1] Handle verification-required login and Google conflict in login/callback files under `src/features/auth/`

## Phase 4: User Story 2 - Sensitive account actions

**Independent test**: Password/Google proof stays ephemeral, each mutation submits once, success signs out, and legacy endpoints are unused.

- [ ] T016 [P] [US2] Add account-security adapter/service tests in `src/features/account-security/accountSecurity.test.ts`
- [ ] T017 [US2] Implement API adapter and service in `src/features/account-security/accountSecurity.api.ts` and `accountSecurity.service.ts`
- [ ] T018 [P] [US2] Add ephemeral proof controller tests in `src/features/account-security/useReauthentication.test.ts`
- [ ] T019 [US2] Implement password/Google proof orchestration in `src/features/account-security/useReauthentication.ts`
- [ ] T020 [P] [US2] Add password/email/deletion panel tests under `src/features/account-security/components/`
- [ ] T021 [US2] Implement accessible account-security panels/components under `src/features/account-security/components/`
- [ ] T022 [US2] Integrate account security into the existing profile/account page under `src/features/profile/`
- [ ] T023 [US2] Clear session after successful mutation through `src/core/services/auth-session.service.ts` and `src/context/AuthContext.tsx`
- [ ] T024 [US2] Remove legacy user-by-ID mutation calls from affected repositories/services under `src/core/`

## Phase 5: User Story 3 - Bounded error UX

**Independent test**: `429`, `413`, invalid proof/verification, duplicate email, and last-admin conflict render correctly without automatic replay or secret retention.

- [ ] T025 [P] [US3] Add retry-window and sanitized error-mapping tests in `src/core/services/api.service.test.ts`
- [ ] T026 [US3] Add status-aware sanitized error mapping under `src/core/services/` and `src/features/account-security/`
- [ ] T027 [US3] Add accessible retry/expired/conflict states to auth and account-security components

## Phase 6: User Story 4 - Media and anonymous engagement

**Independent test**: New SVG selection is blocked, existing SVG rendering remains, and interaction/analytics JSON contains no visitor ID.

- [x] T028 [P] [US4] Add JPEG/PNG-only selection tests under `src/features/media/`
- [x] T029 [US4] Remove SVG from upload accept/validation paths under `src/features/media/` and editor media components
- [ ] T030 [P] [US4] Add visitor-ID absence tests to analytics/reaction adapter tests under `src/core/` and `src/features/`
- [ ] T031 [US4] Remove visitor-ID generation, persistence, and payload fields from analytics/reaction adapters

## Phase 7: Contract and verification

- [x] T032 Update `api-docs.json` only from approved backend-generated Swagger
- [x] T033 Update auth/API/domain guidance in `docs/agent-guides/domain.md` and route reference if needed
- [ ] T034 Run targeted/full tests, type-check, lint, format check, build, and storage/leakage assertions from `quickstart.md`
- [ ] T035 Record cross-repo/staging results and remaining approvals in `specs/014-api-security-hardening/checklists/readiness.md`

## Dependencies

- Backend contract approval blocks implementation beyond test scaffolding.
- Foundational one-attempt transport blocks proof-bound mutations.
- US1 must deploy before backend registration enforcement.
- US2 must deploy before backend legacy-route removal.
- US4 visitor cleanup waits for backend cookie compatibility.

## Parallel opportunities

- T002, T003, and T006.
- Verification UI and account-security service tests can proceed in parallel after contract approval.
- Media and visitor work are independent of account flows.

## Implementation strategy

The frontend MVP is Foundational + US1 so the backend can safely enable verified registration. US2 is the next mandatory slice before legacy sensitive routes are removed.
