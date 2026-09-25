# Contact

## Intent

The Contact page is an editorial invitation to start a thoughtful conversation. It is not a lead-generation, support, or sales form.

## Covered Routes

- `/contact`

## Primary Actions

- read the author's invitation and suggested conversation topics
- write an email to the preferred address
- copy the email address with visible and announced feedback
- use the secondary phone channel when needed

## Layout

- desktop: an asymmetrical two-column composition with the editorial letter on the left and a compact contact rail on the right
- one subtle divider may separate the columns
- narrow viewports: one reading-order stack — invitation, topics, email, phone, location
- the main contact experience stays compact enough that the start of the shared footer is visible at a 1440x1024-class viewport

## Hierarchy

1. `Contact Horizon` eyebrow and one expressive `h1`
2. one invitation, one expectation sentence, and the author sign-off
3. one compact inline topic list
4. `Get in touch` rail with email first
5. quieter phone and location rows separated by dividers

## Core Components

- `ContentContainer`
- `Section`
- `Stack`
- Chakra `Grid` for the page-only responsive composition
- `Heading`, `Text`, `Eyebrow`, `SectionLabel`
- `ActionLink`, `IconButton`, `Divider`
- feature-owned `ContactRail`

The rail is a Contact feature composition, not a new global design-system component. `ContactCard` and `ContactPrompt` remain available for other contexts but are not part of this page.

## Contact Contract

- email is the only primary action and uses `mailto:canhtran210699@gmail.com`
- the visible email may break after `@`, but never inside `gmail.com`; its accessible name remains the complete address
- the copy control has idle, busy, success, and failure states; success and failure are visible and announced without moving focus
- phone uses `tel:+84963452909`
- `Ho Chi Minh City, Vietnam` is plain text until a real destination is approved
- no form fields, submit state, backend endpoint, map link, or duplicated reason-card section

## Motion

- quiet: the title is typeset with the drawn rule under "conversations."
- the column divider is a vertical `SignalLine` in a route; its signal lights each channel's mark
  as it passes - only the marks wait, never a word, address or action
- below the grid breakpoint the divider is not drawn and the marks are simply present
- respect reduced-motion preferences

## Accessibility Notes

- preserve one `h1`, logical section headings, the app `main` landmark, skip link, and current-page navigation semantics
- keep email, copy, and phone as three distinct tab stops with distinct purposes
- adjacent labels provide icon meaning, so rail icons are decorative
- every control follows the design-system 44px touch-target and visible-focus contracts
- copy feedback uses an appropriate live region and never steals focus

## Content Notes

- language is personal, calm, and authored
- keep the approved topic list concise: writing feedback, frontend architecture, and product conversations
- avoid enterprise-contact language, promotional cards, testimonials, and repeated explanations
