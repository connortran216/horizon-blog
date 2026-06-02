# Research: Redesign Contact Direct

## Decision: Remove the local-only contact form instead of wiring a backend

**Rationale**: The user explicitly asked to get rid of the message form. The current form simulates submission and can mislead visitors into thinking a real message was sent.

**Alternatives considered**:

- Keep the form and make it visual-only: rejected because it preserves the confusing interaction.
- Add a backend contact endpoint: rejected because the task is a frontend redesign and the frontend must not invent backend behavior.

## Decision: Make direct email the primary action

**Rationale**: Email is already present and is the most reliable direct contact path. It also keeps the page honest and lightweight.

**Alternatives considered**:

- Make phone primary: rejected because email fits blog feedback and longer technical context better.
- Make all contact methods equal: rejected because the page needs a clear primary action.

## Decision: Keep light outreach guidance

**Rationale**: Removing the form leaves room for concise guidance that helps visitors send better messages without adding process-heavy UI.

**Alternatives considered**:

- Remove prompts entirely: rejected because the page would become too sparse.
- Expand prompts into a long letter: rejected because visitors should reach contact details quickly.

## Decision: Use quiet Chakra surfaces without adding dependencies

**Rationale**: The design-system Contact guidance calls for calm editorial cards, quiet motion, semantic tokens, and personal copy.

**Alternatives considered**:

- Add a new reusable page shell: rejected because this is a scoped route redesign.
- Add new animation or styling dependencies: rejected by scope and repo dependency rules.
