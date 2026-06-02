# Feature Specification: Redesign Contact Direct

**Feature Branch**: `main`
**Created**: 2026-06-01
**Status**: Ready for planning
**Input**: Redesign the Contact page, remove the message form, and make direct contact options the primary experience.

## User Scenarios & Testing

### User Story 1 - Choose a direct contact method (Priority: P1)

As a visitor on the Contact page, I want to quickly choose the best direct contact method so that I can reach out without filling out a placeholder form.

**Why this priority**: The current form does not send to a real backend and creates false expectations. Direct email and phone actions are clearer and more honest.

**Independent Test**: Visit `/contact` and confirm the page has no message form, no fake submit action, and clear direct contact options for email, phone, and location.

**Acceptance Scenarios**:

1. **Given** a visitor opens `/contact`, **When** the page loads, **Then** the primary action is to email directly.
2. **Given** a visitor wants another contact method, **When** they scan the page, **Then** phone and location details are visible without opening a form.
3. **Given** a visitor previously expected a form, **When** they inspect the page, **Then** there are no name, email, subject, message, submit, loading, or toast-based form interactions.
4. **Given** the Contact page belongs to a personal blog, **When** a visitor reads the content, **Then** the copy feels personal, calm, and invitation-oriented rather than support or sales oriented.

### User Story 2 - Understand what to include in an outreach message (Priority: P2)

As a visitor considering whether to reach out, I want light guidance on good reasons to contact the author so that my email has useful context.

**Why this priority**: Removing the form should not make the page feel empty. Guidance keeps the page useful while preserving a direct-contact experience.

**Independent Test**: Visit `/contact` and confirm the page includes concise prompts for writing feedback, frontend/product conversations, and clear expectations.

**Acceptance Scenarios**:

1. **Given** a visitor is unsure what to send, **When** they read the guidance cards, **Then** they understand the page welcomes blog feedback, frontend/product discussion, and concise context.
2. **Given** the page is viewed on mobile, **When** the visitor scans the guidance, **Then** the content remains readable and does not crowd the primary contact options.

## Requirements

### Functional Requirements

- **FR-001**: The Contact page MUST remove the message form and all associated state, submit handling, loading behavior, validation surfaces, and submit toasts.
- **FR-002**: The Contact page MUST present email as the primary contact action using the existing email address.
- **FR-003**: The Contact page MUST keep phone and location visible as secondary contact details.
- **FR-004**: The Contact page MUST keep concise outreach guidance for writing feedback, frontend/product conversations, and clear expectations.
- **FR-005**: The redesign MUST follow the Contact page design-system guidance: concise intro, calm information cards, one clear contact experience, quiet motion, and personal non-sales copy.
- **FR-006**: The redesign MUST use semantic design tokens and preserve readable contrast in light and dark modes.
- **FR-007**: The page MUST remain responsive across mobile and desktop layouts without text overlap or card surfaces blending together.
- **FR-008**: The feature MUST NOT introduce new production dependencies or backend/API behavior.

### Key Entities

- **Contact method**: A direct way to reach the author, including label, value, icon, and optional action link.
- **Outreach prompt**: A short guidance item that explains what kind of message is useful.

## Success Criteria

- **SC-001**: `/contact` contains zero form fields and zero submit controls.
- **SC-002**: A visitor can identify the direct email action within the first viewport on desktop and mobile.
- **SC-003**: Email, phone, and location remain visible and readable in both light and dark modes.
- **SC-004**: Repository lint passes after the redesign.

## Assumptions

- The existing email, phone number, and location are still the correct contact details.
- No backend contact endpoint should be added for this task.
- The owner runs the dev server, so validation should use static checks unless a server is already available.
