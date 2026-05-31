# Feature Specification: Rewrite CV Achievements

**Feature Branch**: `main`
**Created**: 2026-05-31
**Status**: Ready for planning
**Input**: Rewrite CV content so experience bullets communicate achievements and outcomes instead of only listing responsibilities.

## User Scenarios & Testing

### User Story 1 - Read outcome-focused CV experience (Priority: P1)

As a visitor reviewing the CV page, I want the experience section to explain the value and results of the work so that the profile feels more meaningful and credible than a responsibility list.

**Why this priority**: The CV is a public professional profile. Outcome-oriented bullets better communicate seniority, business value, and engineering impact.

**Independent Test**: Inspect the CV experience bullets and confirm they focus on enabled outcomes, improved workflows, strengthened systems, or supported teams without inventing unverified metrics.

**Acceptance Scenarios**:

1. **Given** a CV experience entry describes backend work, **When** a visitor reads the bullet, **Then** the bullet explains what capability or business workflow the work enabled.
2. **Given** an achievement cannot be quantified from the current source, **When** the bullet is rewritten, **Then** it uses credible qualitative outcome language instead of invented numbers.
3. **Given** the CV includes employers, roles, dates, links, and technology stacks, **When** the rewrite is complete, **Then** those facts remain unchanged.
4. **Given** public project descriptions already include verified achievements, **When** the rewrite is complete, **Then** existing verified metrics such as challenge results and accuracy remain intact.

## Requirements

### Functional Requirements

- **FR-001**: Experience bullets MUST be rewritten toward achievements, value, and outcomes rather than task-only phrasing.
- **FR-002**: The rewrite MUST NOT invent employers, dates, responsibilities, technologies, production URLs, metrics, awards, or business results.
- **FR-003**: The rewrite MUST preserve the current CV structure, section ordering, links, project entries, education facts, and stack lists.
- **FR-004**: The rewrite SHOULD reduce repetitive verbs such as "Built", "Worked on", and "Contributed to" where outcome phrasing is clearer.
- **FR-005**: The rewrite MUST keep a concise, credible resume tone suitable for a public CV page and PDF export.

### Key Entities

- **CV profile**: The public resume data shown on the CV page.
- **Experience highlight**: A bullet under a professional role that describes work impact.
- **Verified fact**: Existing resume content such as role, employer, date, stack, production URL, public project metric, or source-supported responsibility.

## Success Criteria

- **SC-001**: Every experience entry has outcome-focused bullets that describe user, business, system, or team value.
- **SC-002**: No new numeric metrics or unverifiable claims are introduced.
- **SC-003**: Existing CV data shape remains compatible with the page.
- **SC-004**: Frontend lint passes for the repository using the supported Node runtime.

## Assumptions

- The existing CV data is the factual source available for this task.
- Qualitative achievement language is acceptable when measured results are not available.
- This is content-only; no layout, styling, API, routing, or backend change is required.
