# R8 - Dependency Injection Wiring Cleanup

## Header

- Project: Horizon Blog frontend
- Service: Core dependency injection
- Dependencies: R3, R5, R6, R7
- Blockers: migrated services must expose constructors that accept explicit dependencies

## Context

The DI container exists, but services still pull dependencies from global getters in constructors and hooks can still reach repositories directly. This story makes dependency direction explicit so services are easier to test and UI code depends on use-case interfaces. See [plan section 5, Phase 8](../clean-architecture-refactor-plan.md#phase-8-improve-di-wiring).

## Acceptance Criteria

### Functional Requirements

- Existing exported getters continue to work.
  - Verify: `yarn build`
  - Pass: Existing imports from `src/core` and `src/core/di/container` compile.

- App startup still resolves blog, profile, and auth services.
  - Verify: `yarn build`
  - Pass: No DI resolution type errors or circular import errors appear during build.

### Technical Requirements

- `BlogService` is constructed with an explicit `IBlogRepository`.
  - Verify: `rg "constructor\\(.*IBlogRepository|getBlogRepository\\(" src/core/services/blog.service.ts`
  - Pass: Constructor accepts repository dependency and no longer falls back to `getBlogRepository()` where possible.

- `ProfileService` is constructed with an explicit `IProfileRepository`.
  - Verify: `rg "constructor\\(.*IProfileRepository|getProfileRepository\\(" src/core/services/profile.service.ts`
  - Pass: Constructor accepts repository dependency and no longer falls back to `getProfileRepository()` where possible.

- Container wires repository instances before service instances.
  - Verify: `sed -n '110,150p' src/core/di/container.ts`
  - Pass: Default registration creates repositories first and passes them into service factories.

- UI hooks do not call `getBlogRepository()` for migrated blog flows.
  - Verify: `rg "getBlogRepository" src/features src/app src/components`
  - Pass: No migrated UI flow imports `getBlogRepository()` directly.

### Quality Gates

- Lint passes.
  - Verify: `yarn lint`
  - Pass: Command exits `0`.

- Build passes.
  - Verify: `yarn build`
  - Pass: Command exits `0`.

## Interface Contracts

Produces:

```ts
export class BlogService implements IBlogService {
  constructor(repository: IBlogRepository, config?: Partial<BlogServiceConfig>)
}

export class ProfileService implements IProfileService {
  constructor(repository: IProfileRepository)
}
```

Consumes:

```ts
export const getBlogService: () => IBlogService
export const getProfileService: () => IProfileService
export const getAuthService: () => IAuthService
```

## Technical Approach

Focus Area: dependency inversion. The container should own object wiring, while services should receive dependencies rather than locating them globally. Exported getters can remain as composition helpers for React hooks until a provider-based pattern is worth introducing.

## Non-Goals

- Do not introduce a new DI library.
- Do not convert the app to React service providers.
- Do not remove compatibility exports in this story.

## Definition of Done

- Service constructors accept explicit dependencies.
- Container wires dependencies explicitly.
- Migrated UI flows do not retrieve repositories directly.
- Lint and build pass.

## Execution Notes

- Status: Done
- `BlogService` now requires an explicit `IBlogRepository` constructor dependency.
- `ProfileService` now requires an explicit `IProfileRepository` constructor dependency.
- DI container service factories now resolve repositories and pass them into service factory functions.
- Existing exported getters remain compatible.
- Avoided `SERVICE_TOKENS` in constructor-time default registration to prevent temporal initialization issues before the constant is declared.
- Validation: constructor/dependency search confirmed explicit repository constructor parameters and no service fallback getter calls.
- Validation: `yarn lint` exited `0`.
- Validation: `yarn build` exited `0`; Vite reported chunk-size warnings only.
