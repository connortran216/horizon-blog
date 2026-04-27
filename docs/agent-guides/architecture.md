# Architecture Guide

Use this guide when changing data flow, service boundaries, feature structure, or shared abstractions.

## Layering

- UI components should not know backend API response shapes.
- Pages and hooks orchestrate user flows.
- Services/use-cases apply business rules, validation, formatting, and authorization checks.
- Repositories or feature API adapters own `apiService` calls and backend transport details.
- DI container wires shared services and repositories.
- Preferred flow: `apiService -> repository/API adapter -> service/use-case -> hook/page -> component`.

## Dependency Injection

- DI container: `src/core/di/container.ts`.
- Use service getters such as `getBlogService()` from feature/page code.
- Repository getters are for service/container/repository-layer use, not migrated UI flows.
- Register shared services by interface tokens.
- Keep constructors explicit when a service depends on a repository.

## Repository Pattern

- `IBlogRepository` is the blog data access contract.
- `ApiBlogRepository` is the HTTP implementation.
- Repository methods return `RepositoryResult<T>` to normalize errors.
- Repositories may cache or retry transport calls.
- Repositories should not own display-specific business rules when a service or shared mapper exists.

## Service Pattern

- `IBlogService` is the main interface for blog business logic.
- `BlogService` maps API models to UI models through shared mapping utilities.
- Services should throw status-aware `ApiError` when callers need UI-specific error handling.
- Services should keep public, profile, editor, and author use cases explicit rather than leaking repository result handling upward.

## Feature-First Structure

New feature modules should live in `src/features/<feature>/` and may include:

- `*.types.ts` for feature/domain types.
- `*.api.ts` for feature-specific API adapter calls.
- `use<Feature>.ts` or focused hooks for state and orchestration.
- `components/` for feature-owned UI.
- Optional focused files such as `*.format.ts`, `*.range.ts`, or `*.utils.ts`.
- `pages/` for route-level feature composition.

Route wrappers in `src/pages/` should stay thin.

## Error Handling

- `ApiError` carries HTTP status.
- `authInterceptor` handles 401 by clearing auth state and dispatching `auth:unauthorized`.
- Use `logError` and `console.error` sparingly for actionable failures.
- Keep 400, 401, 403, and 404 behavior status-aware in public and authenticated flows.

## Refactor Direction

- Current architecture is moving from page-driven code toward feature-first modules.
- Preserve behavior while moving data access behind services/use-cases.
- Avoid large rewrites unless a report and story plan have been approved.

