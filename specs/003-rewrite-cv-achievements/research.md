# Research: Rewrite CV Achievements

## Decision: Use qualitative outcome language where metrics are unavailable

**Rationale**: The domain guide explicitly says not to invent resume metrics or outcomes. The current CV data contains responsibilities and capabilities but does not provide quantified business results for most roles, so the rewrite should express credible outcomes with verbs such as "enabled", "strengthened", "supported", "improved", and "made".

**Alternatives considered**:

- Add estimated metrics. Rejected because they would be unverifiable.
- Leave bullets as responsibility statements. Rejected because the user requested achievement-focused content.

## Decision: Preserve CV structure and factual fields

**Rationale**: The request is about content framing, not layout or data model changes. Preserving the structure keeps the page and PDF export behavior stable.

**Alternatives considered**:

- Add a new achievements section. Rejected because it changes the CV hierarchy and risks duplicating experience content.
- Rewrite project and education sections broadly. Rejected because the user specifically asked about work content, and project metrics already include verified outcomes where available.

## Decision: Keep achievements concise and public-facing

**Rationale**: The CV page should remain a credible resume document. Bullets should be strong enough to communicate impact but not so broad that they sound inflated.

**Alternatives considered**:

- Use highly promotional phrasing. Rejected because the design-system page guidance asks for concise, professionally credible tone.

## Decision: Treat the owner's role interview as a verified source

**Rationale**: The owner supplied concrete scope, metrics, awards, and deployment details for each role. These facts can replace generic responsibility statements without inventing impact.

**Alternatives considered**:

- Keep all bullets qualitative. Rejected because it would discard credible evidence supplied directly by the owner.
- Add estimates beyond the interview. Rejected because unsupported precision would weaken the CV's credibility.
