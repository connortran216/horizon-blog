# Tasks: Authentication Session Lifecycle

## Phase 1: Setup

- [X] T001 Audit current auth/public-optional API callers in `src/core/services/` and record the required request modes in tests
- [X] T002 [P] Add target auth response and request-mode types in `src/core/types/auth.types.ts`

## Phase 2: Foundational

- [X] T003 Write memory-only token-store tests in `src/core/services/access-token.store.test.ts`
- [X] T004 Implement the access-token store in `src/core/services/access-token.store.ts`
- [X] T005 [P] Write raw auth transport tests in `src/core/services/auth.transport.test.ts`
- [X] T006 Implement credentialed non-retrying auth transport in `src/core/services/auth.transport.ts`
- [X] T007 Wire token/session services through `src/core/di/container.ts`

## Phase 3: User Story 1 - Sign in and stay signed in

**Independent test**: Login/registration stores access only in memory; reload refreshes then loads `/users/me`; invalid session settles signed out.

- [X] T008 [P] [US1] Add AuthSessionService login/register/bootstrap tests in `src/core/services/auth-session.service.test.ts`
- [X] T009 [US1] Implement login, registration, bootstrap, and access state in `src/core/services/auth-session.service.ts`
- [X] T010 [US1] Refactor AuthContext hydration around refresh then `/users/me` in `src/context/AuthContext.tsx`
- [X] T011 [US1] Update auth service/page mappings for `access_token` compatibility in `src/core/services/auth.service.ts` and `src/features/auth/`
- [X] T012 [US1] Remove the legacy localStorage token during bootstrap and add migration tests in `src/context/AuthContext.test.tsx`

## Phase 4: User Story 2 - Refresh once and retry safely

**Independent test**: Concurrent `401`s make one refresh; all methods retry once with the current token; `403` leaves session intact.

- [X] T013 [P] [US2] Add unified request pipeline tests for JSON/FormData/status behavior in `src/core/services/api.service.test.ts`
- [X] T014 [US2] Refactor ApiService to a request-factory pipeline with `credentials: include` in `src/core/services/api.service.ts`
- [X] T015 [US2] Refactor the auth interceptor to use injected memory state in `src/core/services/auth.interceptor.ts`
- [X] T016 [US2] Implement token-version race handling, one refresh, one retry, and one unauthorized emission in `src/core/services/auth-session.service.ts`
- [X] T017 [US2] Mark optional public callers explicitly in affected files under `src/core/services/` and `src/features/`

## Phase 5: User Story 3 - Coordinate multiple tabs

**Independent test**: Two simultaneous tabs produce one refresh request and receive only ephemeral access/logout state.

- [X] T018 [P] [US3] Add lock/channel coordination tests in `src/core/services/auth-session-coordinator.test.ts`
- [X] T019 [US3] Implement Web Locks/BroadcastChannel coordination in `src/core/services/auth-session-coordinator.ts`
- [X] T020 [US3] Integrate cross-tab rotation and fail-closed behavior in `src/core/services/auth-session.service.ts`

## Phase 6: User Story 4 - Log out clearly

**Independent test**: Logout requests server revocation, always clears memory, informs tabs, and distinguishes network uncertainty.

- [X] T021 [P] [US4] Add logout success/failure/context tests in `src/core/services/auth-session.service.test.ts` and `src/context/AuthContext.test.tsx`
- [X] T022 [US4] Implement async logout and cross-tab notification in `src/core/services/auth-session.service.ts` and `src/context/AuthContext.tsx`
- [X] T023 [US4] Update logout UI handling in `src/app/layouts/Navbar.tsx` and `src/app/layouts/UserMenu.tsx`

## Phase 7: User Story 5 - Complete Google sign-in without URL credentials

**Independent test**: Callback parses no credential, rejects unsafe redirects, waits for restored session, and preserves safe provider errors.

- [X] T024 [P] [US5] Add Google callback/redirect tests in `src/features/auth/pages/LoginCallbackPage.test.tsx` and `src/features/auth/utils/googleSso.test.ts`
- [X] T025 [US5] Remove JWT fragment handling in `src/features/auth/pages/LoginCallbackPage.tsx` and `src/features/auth/utils/googleSso.ts`
- [X] T026 [US5] Make callback wait for AuthContext restoration before navigation in `src/features/auth/pages/LoginCallbackPage.tsx`

## Phase 8: OAuth bridge and polish

- [X] T027 Remove manual fallback bearer display/copy from `src/features/oauth/pages/McpAuthorizePage.tsx` and its tests
- [X] T028 [P] Update auth/domain documentation and API snapshot in `docs/agent-guides/domain.md` and `api-docs.json`
- [X] T029 Remove `jwt-decode` from `package.json` and `yarn.lock` only if repository-wide usage is zero
- [X] T030 Run targeted/full tests, type-check, lint, build, storage-leakage, two-tab, Google, `401`, and `403` checks

## Dependencies

- Foundational token store and raw transport block every story.
- US1 establishes lifecycle state before US2 request retry and US3 cross-tab coordination.
- US4 uses the same coordinator but can be tested in parallel with Google callback work.
- OAuth bridge cleanup is independent after backend completion contract is available.

## Parallel opportunities

- T002 and T003/T005.
- Request-pipeline tests and session-service tests can be authored in parallel.
- Google callback and logout UI work can proceed after AuthContext stabilizes.
- Documentation and dependency cleanup can run after implementation behavior is fixed.

## Implementation strategy

The MVP is Foundational + US1 while the backend still issues 24-hour tokens. US2 and US3 must be complete and production-verified before the backend changes access TTL to 15 minutes.
