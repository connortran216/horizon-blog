# Tasks: RBAC Authorization

## Phase 1: Setup

- [X] T001 Verify the approved backend contract and current authentication bootstrap/service boundaries
- [X] T002 Load the required architecture, domain, project, workflow, and design-system guidance

## Phase 2: Authorization domain and private context

- [X] T003 [P] Add authorization helper tests in `src/core/authorization/authorization.test.ts`
- [X] T004 Add typed role, permission, authorization context, and pure `can` helper in `src/core/authorization/`
- [X] T005 Extend private auth/profile response mappings and AuthContext state without changing public DTOs

## Phase 3: Permission-aware UX (US1, US2, US5)

- [X] T006 [P] [US1] Add member/author/admin/absent-context route and visibility tests
- [X] T007 [US1] Add optional `requiredPermission` and access-denied rendering to `src/components/ProtectedRoute.tsx`
- [X] T008 [US2] Require author permissions on editor/analytics routes and gate navigation/home/profile author controls
- [X] T009 [US5] Preserve public routes and backend-projected comment capability behavior

## Phase 4: Permission-loss recovery (US3)

- [X] T010 [P] [US3] Add `403` autosave/demotion recovery tests
- [X] T011 [US3] Stop autosave on authoring `403`, preserve draft state, refresh `/users/me`, and show persistent access-loss guidance
- [X] T012 [US3] Add explicit analytics/protected-route forbidden states without clearing authentication

## Phase 5: Minimal role administration (US4)

- [X] T013 [P] [US4] Add API/service state tests for list, changed, no-change, validation, forbidden, missing-user, and last-admin conflict
- [X] T014 [US4] Implement access-management adapter/service/hook types under `src/features/access-management/`
- [X] T015 [US4] Implement the protected `/admin/access` page and navigation entry using the design system

## Phase 6: Polish and verification

- [X] T016 Update private API snapshot/domain guidance after backend Swagger is generated
- [X] T017 Run frontend tests, type-check, lint, production build, and final diff review

## Dependencies

- T003-T005 block all permission-aware UI.
- T006-T009 and T010-T012 may proceed after T005.
- T013-T015 require the backend admin endpoints.
- T016-T017 require all implementation phases.

## Independent test criteria

- **US1 Member**: no author/admin controls; direct protected navigation shows forbidden without logout.
- **US2 Author**: editor and analytics are visible and routable with returned permissions.
- **US3 Demotion**: first authoring `403` stops autosave, keeps local content, and refreshes authorization.
- **US4 Admin**: role assignment UI handles every approved backend response state.
- **US5 Public**: public pages render without private authorization context.
