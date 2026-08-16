# Research: Series Learning Paths Frontend

## Decision: Feature-local architecture

- **Decision**: Add a `series` feature with typed transport, service mapping, hooks, progress storage, components, and route pages.
- **Rationale**: Keeps API DTOs out of UI and matches the established feature-first flow.
- **Alternatives considered**: Extending the shared blog repository was rejected because series has distinct owner and reader use cases.

## Decision: Calm editorial learning path

- **Decision**: Use the existing reader tokens and typography with a single standard series panel and a scan-first ordered list.
- **Rationale**: Horizon is a personal blog; the feature should add context without resembling a course dashboard.
- **Alternatives considered**: A gamified course UI and persistent animated timeline were rejected as visual paradigm changes.

## Decision: Browser-local visited progress

- **Decision**: Record opened member blog IDs in versioned first-party local storage and label the result as read/opened progress rather than completion.
- **Rationale**: Provides resume value without account state or backend privacy scope.
- **Alternatives considered**: Account sync is deferred; percentage based on scroll completion would conflate analytics with user-owned progress.

## Decision: Dedicated management route plus publish selector

- **Decision**: Put complete CRUD/order management on `/series/manage`; publication review only selects zero or one existing series.
- **Rationale**: Protects the focused publish layout while keeping the common assignment action close to publishing.
- **Alternatives considered**: Full series editing inside the publish card would make the editor feel dashboard-heavy.

## Decision: Series failure isolation

- **Decision**: Public context failures resolve to no series UI and never block the article.
- **Rationale**: Reading remains the highest-priority product surface.
- **Alternatives considered**: Whole-page error propagation was rejected.

## UI/UX skill influence

- Retain semantic HTML, labelled controls, visible focus, responsive stacking, and 150-300ms interaction feedback.
- Follow the local Horizon system instead of the skill's generic playful typography or pink CTA recommendation.
