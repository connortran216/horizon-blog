# Research: Blog Interaction Analytics Frontend

## Decision: Keep reader interactions and author analytics separate

**Rationale**: Reader measurement and author dashboards have different lifecycles, state, users, and failure behavior. Separate feature modules prevent instrumentation from becoming coupled to dashboard UI.

**Alternatives considered**:

- Put all analytics code under the blog feature: rejected because author analytics would become coupled to public reading code.
- Put analytics inside profile: rejected because profile is an editorial management surface, not a dashboard.

## Decision: Use a dedicated event transport

**Rationale**: Reader events need in-memory batching, bounded retry, and best-effort unload delivery that differ from normal request/response API calls.

**Alternatives considered**:

- Send one request per event: rejected because it creates unnecessary traffic.
- Extend every `apiService` request with analytics behavior: rejected because it mixes unrelated responsibilities.

## Decision: Preserve backend idempotency inputs exactly

**Rationale**: The accepted ClickHouse backend model depends on stable `event_id` retries and cumulative active-time reports with strictly increasing per-session `client_seq`. The frontend owns those client-generated inputs.

**Alternatives considered**:

- Generate new event IDs on retry: rejected because it would create distinct analytics events.
- Send active-time deltas only: rejected because backend active-time rollups use cumulative `argMax(active_ms, client_seq)`.

## Decision: Use one reading-progress source

**Rationale**: The current reader already measures progress for its visual bar. Adding a second independent listener would risk inconsistent milestones and duplicate work.

**Alternatives considered**:

- Add a separate analytics scroll listener: rejected because it creates two sources of truth.

## Decision: Use existing dependencies and accessible SVG/Chakra primitives

**Rationale**: The repository requires explicit approval before adding production dependencies. The required line, bar, funnel, and table views can be implemented behind a visualization boundary with existing tools.

**Alternatives considered**:

- Add a chart library now: deferred until separately approved.
- Use tables only: rejected because the PRD requires visually understandable trends and drop-off.

## Decision: Treat chart and test tooling as explicit owner gates

**Rationale**: The approved TD requires an explicit decision before adding chart or test dependencies. This plan defaults to existing dependencies and current validation gates. Implementation must stop and request approval before adding either dependency category.

**Alternatives considered**:

- Add a chart or test package during implementation without a separate decision: rejected by repository workflow.

**Batch 1 update**: The owner asked for feature test cases and approved starting the recommended frontend Batch 1. Vitest was added as a dev-only test runner for foundation tests. Chart dependencies and any additional test dependency category remain gated behind explicit approval.

## Decision: Freeze backend fixtures before live integration

**Rationale**: Frontend foundation and UI can progress safely against frozen examples, then replace mock data with one focused repository integration story.

**Alternatives considered**:

- Integrate directly against unfinished endpoints: rejected because it creates contract churn and dependencies across every UI task.
