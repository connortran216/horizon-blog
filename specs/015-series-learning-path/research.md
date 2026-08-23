# Research: Series Discovery and Reading Frontend

## Decision: Feature-local architecture

- **Decision**: Keep the `series` feature boundary with typed transport, service mapping, hooks, components, and route pages; remove the obsolete public progress helper during the approved UI update.
- **Rationale**: Keeps API DTOs out of UI and matches the established feature-first flow.
- **Alternatives considered**: Extending the shared blog repository was rejected because series has distinct owner and reader use cases.

## Decision: Calm editorial Series surfaces

- **Decision**: Use the existing reader tokens and typography with a single standard series panel and a scan-first ordered list.
- **Rationale**: Horizon is a personal blog; the feature should add context without resembling a course dashboard.
- **Alternatives considered**: A gamified course UI, progress dashboard, and persistent animated timeline were rejected as visual paradigm changes.

## Decision: No public reading progress

- **Decision**: Do not show local opened state, checkmarks, progress bars, completion percentages, or account-synced reading progress.
- **Rationale**: The approved design is an ordered editorial reading surface, not a course tracker; read state also introduces privacy and semantic ambiguity without a dedicated user-owned model.
- **Alternatives considered**: Browser-local opened state and scroll-based completion were rejected because they imply progress semantics the product has not defined.

## Decision: Public discovery without changing the navbar

- **Decision**: Add a Series shelf after the Home hero, a compact shelf on the default unfiltered Blog view, and a dedicated `/series` index. Keep the global navbar unchanged.
- **Rationale**: Series becomes discoverable where readers already browse while avoiding a permanent navigation item before enough content exists.
- **Alternatives considered**: A global Series nav item was deferred; splitting the normal blog feed into standalone and Series feeds was rejected because it breaks chronological discovery.

## Decision: Backend-owned public summary and blog membership context

- **Decision**: Consume a public Series list contract plus optional Series context on public blog summaries. Fetch the featured Series detail only when the index needs its ordered preview.
- **Rationale**: Avoids N+1 context requests from Home and Blog, keeps membership and position authoritative, and avoids returning every part of every Series in the list response.
- **Alternatives considered**: One request per visible blog and returning complete parts for every listed Series were rejected for avoidable request and payload growth.

## Decision: Approved detail metadata is derived from public blogs

- **Decision**: Show part excerpts, per-part reading time, total reading time, last-updated date, and optional topics derived only from public member-blog metadata.
- **Rationale**: These fields make the approved detail design scannable without adding a second Series content model.
- **Alternatives considered**: New Series-specific topic and reading-time fields were rejected because the underlying blogs already own that information.

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
- Use the approved screen inventory in [ui-ux.md](./ui-ux.md) as the page-composition source of truth.
