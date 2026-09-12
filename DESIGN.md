# Design

## Source of truth

Status: Active for Design System v2 development. Production pages remain on the legacy composition until `horizon-blog-dsv2.7.3` passes.

Date: 2026-09-10.

Product surfaces: public discovery, Series, long-form reading, account, profile, authoring, publishing, analytics, and access management.

Evidence reviewed:

- Approved 26-screen Signal prototype under `../prototypes/horizon-uiux`.
- Beads decisions `horizon-design-system-v0.2`, `horizon-prototype-approved-2026-09-06`, and `horizon-signal-behavioral-system-v1`.
- Production source after the complete R1/R3 rollback at commit `536c262`.
- Current Chakra theme, design docs, shared animation components, routes, and TSX UI files.
- [`design-system/component-inventory.md`](./design-system/component-inventory.md), which classifies 138 UI implementation and composition files.

Authority order: current user decisions, this document, component inventory and component/page docs, typed v2 source, then legacy implementation as compatibility evidence.

## Brand

Horizon is a personal technical blog with editorial clarity, tactile depth, purposeful motion, and a visible human point of view.

Personality: curious, thoughtful, technically credible, warm, calm enough for long reading, and expressive during discovery.

Trust signals: real author identity and content; clear dates, reading time, Series order and status; honest async feedback; stable navigation and typography.

Avoid:

- Flat screens with no interaction feedback or oversized empty navigation chrome.
- One rounded-card treatment for every domain.
- Dashboard styling on public reading surfaces.
- Decorative motion that competes with prose.
- Generic gradients, excessive glass, random glow, or purple as the default action.
- Invented content, metrics, API behavior, biography, or capabilities.

## Product goals

Goals:

- Make reading comfortable and discovery engaging.
- Give writing, Series, media, conversation, and workspace state distinct interaction languages.
- Provide one system for paired themes, responsive behavior, motion, accessibility, and async feedback.
- Let pages compose stable patterns instead of redefining design values.
- Complete and verify component coverage before page migration.

Non-goals:

- Changing backend, API, auth, scheduling, routing, or editor contracts.
- Replacing Chakra, React Router, Milkdown, Crepe, or Framer Motion in this Epic.
- Building one universal card.
- Replacing production page composition before the readiness gate.

Success signals:

- Every legacy UI file has a v2 owner and disposition.
- Every v2 export appears with required states in the component gallery.
- Light/dark, keyboard/touch, normal/reduced motion, long content, failure, and small-screen behavior pass review.
- Page migration introduces no new raw color, spacing, radius, shadow, or motion values.

## Personas and jobs

### Reader

Find useful writing, understand it before opening, read long technical material, navigate code/diagrams/Series, and interact with clear feedback on mobile or desktop, including slow and failed media.

### Author and owner

Draft, recover, preview, publish, schedule, organize, and measure writing with explicit save, upload, permission, and publication state.

### Administrator

Find users and manage access with visible current state, consequences, and confirmation.

## Information architecture

- Primary public navigation: Home, Blog, Series, About.
- Secondary destinations: Contact, CV, author archive, account, and author workspace.
- Home: brand idea, Signature, Series discovery, then distinct latest writing.
- Blog: discovery utility, topics, feature, results, and pagination.
- Series: book-like identity, overview, ordered parts, and reading context.
- Reader: article identity, stable prose, contextual navigation, feedback, and conversation.
- Workspace: task state and primary action before decoration.
- Desktop header: compact 72px floating surface capped to the content frame.
- Mobile header: 64px with detached menu panel; opening navigation never expands the header.

## Design principles

1. **Reading stays stable.** Discovery may be expressive; prose motion remains restrained.
2. **Behavior is part of the contract.** Components define rest, hover, press, focus, touch, reveal, navigation, responsive, reduced-motion, and applicable async/media states.
3. **Shared primitives, distinct patterns.** Primitives own behavior; domain patterns own hierarchy and identity.
4. **Real content before acceptance.** Test long Vietnamese/English text, missing/broken media, failures, permission denial, and partial data.
5. **One visual owner per surface.** One component owns border, radius, shadow, clipping, hover depth, and focus outline.
6. **Motion communicates cause and response.** Use it for entry, selection, navigation, reordering, progress, loading, and success.
7. **Compatibility stays visible.** Every legacy adapter has an inventory row, target, owner, and removal gate.

## Visual language

### Color

- `bg.page`: `#F5F7FC` / `#0D1220`.
- `bg.surface`: `#FFFFFF` / `#151D2E`.
- `bg.subtle`: `#EDF1FA` / `#1A2438`.
- `bg.elevated`: `#FFFFFF` / `#1C2740`.
- `text.primary`: `#17213A` / `#E9EEFA`.
- `text.secondary`: `#53617A` / `#A7B4CC`.
- `text.muted`: `#5D6B82` / `#8B9AB5`.
- `action.primary`: `#3158D4` / `#8AA4FF`.
- `accent.lime`: `#DDF89A` / `#C5EC83`.

Action tokens communicate interaction. Accent tokens communicate atmosphere or rare emphasis. Remaining border, focus, link, on-color, and status values come from the approved token source.

### Typography, layout, and shape

- Locally bundled Be Vietnam Pro for headings/body; system monospace for code.
- Display 40/48 mobile and 64/72 desktop; page title 32/40 and 44/54; card title 22/30; body 16/26; prose 18/30 and 19/32; metadata 13/20.
- Prose measure 68ch; content frame 1120px; spacing 4, 8, 12, 16, 24, 32, 48, 64, 96px; section rhythm 48px mobile and 80px desktop.
- Controls use 12px radius, cards 20px, feature artwork 28px, and pills only for compact tags/status.
- Layered editorial elevation belongs to featured discovery surfaces; hover depth cannot change layout footprint.

### Motion

- Fast 120ms; normal 200ms; navigation/layout 260–300ms; prominent entry 320ms; editorial reveal up to 480ms.
- Ease `cubic-bezier(0.22, 1, 0.36, 1)`; lift at most 2px; reveal distance at most 8px.
- Approved behaviors include sliding nav indication, directional icon travel, filter reordering, theme feedback, reaction pop, copy confirmation, reading progress, active TOC, Series connectors, and desktop Signature pointer light.
- Ambient movement is limited to suitable Home/About artwork, pauses on interaction, and stops under reduced motion. Continuous animation is otherwise reserved for loading.

### Imagery and iconography

Use technical editorial imagery with stable aspect ratios and explicit loading/failure states. Content images have alt text; decoration is hidden. Use current SVG/icon libraries rather than emoji UI icons.

## Components

Token layers:

1. Primitive palette, type, space, radius, elevation, duration, easing, and breakpoints.
2. Semantic canvas, surface, text, action, focus, border, status, loading, media, overlay, and selection roles.
3. Component aliases for header, control, field, card, feature, reader, Series, feedback, and workspace.
4. Chakra adapter plus temporary legacy aliases.

Shared primitives:

- Layout/type: AppFrame, ContentContainer, Section, Stack, Grid, ProseMeasure, Surface, Divider, TextStyle, Eyebrow, Heading, Metadata.
- Actions/forms: Button, IconButton, ActionLink, NavItem, ThemeToggle, RailControl, Field, Input, Textarea, Select, Checkbox, Radio, Switch, Chip, StatusBadge.
- Motion/feedback/media: Reveal, Stagger, HoverLift, PressFeedback, LayoutTransition, PageLoading, PanelLoading, InlineLoading, Skeleton, Empty/Error/Permission/Missing/Offline states, MediaFrame, ResponsiveImage, MediaPlaceholder, MediaError, MediaRetry.

Domain patterns:

- Posts: SignatureStory, FeaturedStory, PostCard, PostRow, PostMetadata, AuthorIdentity, FilterBar, Pagination.
- Series: SeriesCover, SeriesCard, SeriesRail, overlay rail controls, SeriesContext, SeriesPartList, ManageSeriesItem.
- Reader: ReaderFrame, Prose, CodeBlock, DiagramFrame, TOC, ReadingProgress, ReaderFeedbackBar, ReactionButton, ShareAction, CommentThread.
- Account/workspace/data: AuthPanel, VerificationFeedback, ProfileHeader, AvatarEditor, ContactCard, CVEntry, WorkspaceShell, EditorToolbar, AutosaveState, PublishPanel, ScheduleNotice, Metric, Trend, Funnel, DataTable, PermissionTable, DestructiveAction.

New v2 source lives under `src/design-system/` and `src/theme/tokens/`. Existing feature components remain production owners until page migration. The gallery is isolated from production navigation and service state.

## Accessibility

- Target WCAG 2.2 AA.
- Text contrast at least 4.5:1; control boundaries meet applicable contrast.
- Focus uses a visible 2px ring with 3px offset in both themes.
- Native buttons/links and programmatic current, pressed, and expanded states.
- Touch targets at least 44×44px where space permits; no meaning depends on hover.
- Visible field labels, linked hints, announced errors, and status beyond color.
- Reduced motion removes translation, parallax, ambient float, pointer following, and decorative layout movement while preserving immediate state feedback.
- Code, tables, diagrams, and long prose stay keyboard accessible and scroll locally when needed.

## Responsive behavior

Required widths: 375, 768, 1024, and 1440px.

- Mobile navigation uses a detached panel.
- Horizontal rails preserve native touch scrolling, show a next-item peek, snap, and add controls for capable input.
- Reader TOC becomes a disclosure; editor splits stack without hiding state/actions.
- Tables/code scroll locally and never widen the document.
- Hover-only pointer effects are disabled on touch.

## Interaction states

Every applicable component covers rest, hover, focus-visible, pressed, selected/current, disabled, read-only, loading, danger, ready, empty, absent-media, partial, error, retrying, offline, denied, missing, and success across themes, widths, input modes, and motion preferences.

Loading policy: PageLoading for blocked routes, PanelLoading for blocked regions, Skeleton for progressive content shape, a dedicated media state machine for images, and compact feedback for inline actions.

## Content voice

- Prefer “blog”, “writing”, “read”, “Series”, and “Part X of Y”.
- Loading/error text names the task or failed action; buttons use concrete verbs.
- Empty states explain absence and the next valid action.
- Scheduling copy reflects backend truth: a scheduled publication remains a draft with a timestamp.
- Preserve actual founder identity, biography, contacts, CV, and article content.

## Implementation constraints

- React 18, TypeScript, Vite, Chakra UI, React Router, Framer Motion, Milkdown, and Crepe remain in place.
- Yarn only; no new production dependency without explicit approval.
- Preserve `apiService -> repository/API adapter -> service/use-case -> hook/page -> component`.
- Reusable design values come from tokens. Recurring motion uses transform/opacity and avoids layout shift.
- Side effects, data fetching, media resolution, timers, and observers stay outside render paths or clean up explicitly.
- Every v2 export appears in the gallery; automation compares inventory, registry, adapters, and examples.
- Validate through targeted/full tests, lint, typecheck, format, build, graph change detection, accessibility, responsive, and visual review.
- No commit, push, merge, or deploy until separately authorized.

## Settled questions

- **Gallery entry.** The component gallery is a second Vite entry (`ui-kit.html`, the name the
  ticket plan uses), not a
  development-only route. A guarded route lives in the production router and relies on
  tree-shaking to stay out of the shipped bundle; a separate entry cannot leak into it at all,
  and the gallery is a build-time artefact rather than something the app has to exclude at
  runtime. Cost is the extra build configuration. Owner: B6.
- **Legacy adapter warnings.** Each compatibility adapter warns once per adapter in development,
  naming the v2 component that replaces it. Migration debt should be visible while someone is
  editing the code, not only in the inventory table. Warning once keeps the console readable.
  Owner: B6.
- **PostCard cover.** The cover is full-bleed, reaching the card edge, matching the approved
  prototype's `.article-card`. Single ownership is preserved in the API rather than by override:
  the cover frame declines its corners (`radius="container"`), the card `Surface` draws the card
  radius and clips to it, and the card padding moves from the surface to the copy block beneath the
  cover. Owner: B6.

## Open questions

- [ ] Validate derived disabled, overlay, code, and media colors as rendered before stabilizing
      them. Their contrast is currently verified arithmetically only. Owner: B6 accessibility
      matrix; affects contrast and token API.

