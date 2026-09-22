/**
 * Horizon Design System v2 - the gallery index, as data.
 *
 * Every runtime export of `src/design-system/index.ts` - each component, each
 * hook, and the one context object - appears here exactly once, spelled the way
 * the barrel spells it, together with the barrel it comes from and the states
 * the gallery demonstrates for it.
 *
 * This file is deliberately a literal array of literal objects. The B7 coverage
 * audit reads it statically to prove the gallery covers the barrel, so nothing
 * here may be assembled at runtime, derived from a dynamic import, or spread in
 * from somewhere else. Adding an export to the design system means adding a row
 * here; `entries/index.ts` is typed from `GalleryEntryName`, so forgetting the
 * matching renderer is a compile error rather than a hole in the review.
 *
 * The pure logic modules the barrel also re-exports - `postPresentation`,
 * `fieldAria`, `scheduleState` and the rest - are not rows here. They render
 * nothing; they are covered by their own unit tests, and every one of them is
 * exercised indirectly by the component whose behaviour it decides.
 */

import type { GalleryEntry } from './types'

export const galleryRegistry = [
  /* ---------------------------------------------------------------- layout */
  {
    name: 'AppFrame',
    area: 'layout',
    states: [{ name: 'ready', kind: 'ready' }],
  },
  {
    name: 'ContentContainer',
    area: 'layout',
    states: [
      { name: 'content width', kind: 'ready' },
      { name: 'prose width' },
      { name: 'full width' },
    ],
  },
  {
    name: 'Section',
    area: 'layout',
    states: [{ name: 'comfortable', kind: 'ready' }, { name: 'compact' }, { name: 'flush' }],
  },
  {
    name: 'Stack',
    area: 'layout',
    states: [{ name: 'column', kind: 'ready' }, { name: 'row' }],
  },
  {
    name: 'Grid',
    area: 'layout',
    states: [{ name: 'two columns', kind: 'ready' }, { name: 'three columns' }],
  },
  {
    name: 'ProseMeasure',
    area: 'layout',
    states: [{ name: 'ready', kind: 'ready' }, { name: 'centred' }],
  },

  /* --------------------------------------------------------------- surface */
  {
    name: 'Surface',
    area: 'surface',
    states: [
      { name: 'flat', kind: 'ready' },
      { name: 'raised' },
      { name: 'feature' },
      { name: 'interactive' },
    ],
  },
  {
    name: 'Divider',
    area: 'surface',
    states: [{ name: 'horizontal', kind: 'ready' }, { name: 'labelled' }, { name: 'vertical' }],
  },

  /* ------------------------------------------------------------ typography */
  {
    name: 'Text',
    area: 'typography',
    states: [
      { name: 'body', kind: 'ready' },
      { name: 'prose' },
      { name: 'metadata' },
      { name: 'clamped to two lines' },
    ],
  },
  {
    name: 'Heading',
    area: 'typography',
    states: [
      { name: 'display', kind: 'ready' },
      { name: 'pageTitle' },
      { name: 'sectionTitle' },
      { name: 'cardTitle' },
    ],
  },
  {
    name: 'Eyebrow',
    area: 'typography',
    states: [{ name: 'ready', kind: 'ready' }],
  },
  {
    name: 'SectionLabel',
    area: 'typography',
    states: [{ name: 'ready', kind: 'ready' }],
  },
  {
    name: 'Metadata',
    area: 'typography',
    states: [{ name: 'ready', kind: 'ready' }],
  },

  /* --------------------------------------------------------------- actions */
  {
    name: 'Button',
    area: 'actions',
    states: [
      { name: 'primary', kind: 'ready' },
      { name: 'secondary' },
      { name: 'quiet' },
      { name: 'link' },
      { name: 'danger' },
      { name: 'loading', kind: 'loading' },
      { name: 'disabled' },
    ],
  },
  {
    name: 'IconButton',
    area: 'actions',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'pressed' },
      { name: 'loading', kind: 'loading' },
      { name: 'disabled' },
    ],
  },
  {
    name: 'ActionLink',
    area: 'actions',
    states: [
      { name: 'in-app route', kind: 'ready' },
      { name: 'external' },
      { name: 'with icons' },
      { name: 'primary weight' },
      { name: 'secondary weight' },
    ],
  },

  /* ------------------------------------------------------------ navigation */
  {
    name: 'NavItem',
    area: 'navigation',
    states: [
      { name: 'route', kind: 'ready' },
      { name: 'current route' },
      { name: 'external' },
      { name: 'in-page command' },
      { name: 'disabled' },
    ],
  },
  {
    name: 'ThemeToggle',
    area: 'navigation',
    states: [{ name: 'ready', kind: 'ready' }],
    note: 'Driven by the gallery theme control, so the toggle and the control agree.',
  },
  {
    name: 'RailControl',
    area: 'navigation',
    states: [{ name: 'next', kind: 'ready' }, { name: 'previous' }, { name: 'disabled' }],
  },

  /* ----------------------------------------------------------------- forms */
  {
    name: 'Field',
    area: 'forms',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'required with hint' },
      { name: 'invalid', kind: 'error' },
      { name: 'group' },
    ],
  },
  {
    name: 'Input',
    area: 'forms',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'invalid', kind: 'error' },
      { name: 'disabled' },
    ],
  },
  {
    name: 'Textarea',
    area: 'forms',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'invalid', kind: 'error' },
    ],
  },
  {
    name: 'Select',
    area: 'forms',
    states: [{ name: 'ready', kind: 'ready' }, { name: 'disabled' }],
  },
  {
    name: 'Checkbox',
    area: 'forms',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'checked' },
      { name: 'invalid', kind: 'error' },
      { name: 'disabled' },
    ],
  },
  {
    name: 'Radio',
    area: 'forms',
    states: [{ name: 'group', kind: 'ready' }, { name: 'disabled' }],
    note: 'A radio only means anything inside a group, so the group is the entry.',
  },
  {
    name: 'Switch',
    area: 'forms',
    states: [{ name: 'off', kind: 'ready' }, { name: 'on' }, { name: 'disabled' }],
  },
  {
    name: 'FieldContext',
    area: 'forms',
    states: [{ name: 'inside a Field', kind: 'ready' }],
    note: 'A context object. Demonstrated by a reader mounted inside a real Field.',
  },
  {
    name: 'useFieldAria',
    area: 'forms',
    states: [{ name: 'inside a Field', kind: 'ready' }, { name: 'outside a Field' }],
    note: 'A hook. Its return value is printed by a gallery harness.',
  },

  /* ---------------------------------------------------------------- status */
  {
    name: 'Chip',
    area: 'status',
    states: [
      { name: 'static', kind: 'ready' },
      { name: 'selectable' },
      { name: 'selected' },
      { name: 'disabled' },
    ],
  },
  {
    name: 'StatusBadge',
    area: 'status',
    states: [
      { name: 'neutral', kind: 'ready' },
      { name: 'success' },
      { name: 'warning' },
      { name: 'danger' },
      { name: 'live' },
    ],
  },

  /* ---------------------------------------------------------------- motion */
  {
    name: 'HoverLift',
    area: 'motion',
    states: [{ name: 'ready', kind: 'ready' }, { name: 'disabled' }],
  },
  {
    name: 'InteractionTrace',
    area: 'motion',
    states: [{ name: 'interactive', kind: 'ready' }, { name: 'confirmed' }],
  },
  {
    name: 'LayoutTransition',
    area: 'motion',
    states: [{ name: 'reorderable', kind: 'ready' }],
    note: 'Driven by a gallery harness that shuffles its children on demand.',
  },
  {
    name: 'MarginalNote',
    area: 'motion',
    states: [{ name: 'in view', kind: 'ready' }],
  },
  {
    name: 'PointerLight',
    area: 'motion',
    states: [{ name: 'ready', kind: 'ready' }, { name: 'disabled' }],
    note: 'Inside a feature Surface over sample artwork. Needs a fine pointer: on a touch viewport it renders the artwork alone.',
  },
  {
    name: 'PressFeedback',
    area: 'motion',
    states: [{ name: 'ready', kind: 'ready' }, { name: 'disabled' }],
  },
  {
    name: 'Reveal',
    area: 'motion',
    states: [{ name: 'on mount', kind: 'ready' }, { name: 'in view' }],
  },
  {
    name: 'SignalTarget',
    area: 'motion',
    states: [{ name: 'in a field', kind: 'ready' }, { name: 'outside a field' }],
    note: 'Inside a SynapseField it waits for its signal; outside one it is simply visible.',
  },
  {
    name: 'Stagger',
    area: 'motion',
    states: [{ name: 'on mount', kind: 'ready' }],
  },
  {
    name: 'StateHandoff',
    area: 'motion',
    states: [{ name: 'explicit state', kind: 'ready' }],
    note: 'The content swaps immediately; only the acknowledgement trace animates.',
  },
  {
    name: 'SynapseField',
    area: 'motion',
    states: [
      { name: 'bare', kind: 'ready' },
      { name: 'sparse' },
      { name: 'dense' },
      { name: 'with copy' },
    ],
    note: 'Home hero artwork and shell. `with copy` lays a SignalTarget and a Typeset on it so the writing can be reviewed; hover to stir the field.',
  },
  {
    name: 'TimelineEntry',
    area: 'motion',
    states: [{ name: 'screen and print', kind: 'ready' }],
  },
  {
    name: 'Typeset',
    area: 'motion',
    states: [
      { name: 'on mount', kind: 'ready' },
      { name: 'in view' },
      { name: 'with emphasis' },
      { name: 'in a field' },
    ],
    note: 'Inside a display Heading, which is the only place it belongs. `in a field` sits on a SynapseField and is written by it.',
  },
  {
    name: 'useMotionPolicy',
    area: 'motion',
    states: [{ name: 'current policy', kind: 'ready' }],
    note: 'A hook. The resolved policy is printed by a gallery harness.',
  },
  {
    name: 'useReducedMotionPreference',
    area: 'motion',
    states: [{ name: 'current preference', kind: 'ready' }],
    note: 'A hook. Reads the query the gallery motion control drives.',
  },
  {
    name: 'useRevealInView',
    area: 'motion',
    states: [{ name: 'observed', kind: 'ready' }],
    note: 'A hook. A gallery harness reports whether its element has been seen.',
  },
  {
    name: 'useViewTransition',
    area: 'motion',
    states: [{ name: 'ready', kind: 'ready' }],
    note: 'A hook. A gallery harness runs a real update through it.',
  },

  /* -------------------------------------------------------------- feedback */
  {
    name: 'FeedbackSurface',
    area: 'feedback',
    states: [
      { name: 'loading', kind: 'loading' },
      { name: 'empty', kind: 'empty' },
      { name: 'error', kind: 'error' },
      { name: 'permission' },
      { name: 'missing' },
      { name: 'offline' },
      { name: 'success', kind: 'ready' },
    ],
  },
  {
    name: 'EmptyState',
    area: 'feedback',
    states: [{ name: 'empty', kind: 'empty' }, { name: 'empty with an action' }],
  },
  {
    name: 'ErrorState',
    area: 'feedback',
    states: [{ name: 'error', kind: 'error' }, { name: 'error with a retry' }],
  },
  {
    name: 'MissingState',
    area: 'feedback',
    states: [{ name: 'missing', kind: 'error' }],
  },
  {
    name: 'OfflineState',
    area: 'feedback',
    states: [{ name: 'offline', kind: 'error' }],
  },
  {
    name: 'PermissionState',
    area: 'feedback',
    states: [{ name: 'denied', kind: 'error' }],
  },
  {
    name: 'LoadingIndicator',
    area: 'feedback',
    states: [
      { name: 'route', kind: 'loading' },
      { name: 'panel' },
      { name: 'inline' },
      { name: 'label hidden' },
    ],
  },
  {
    name: 'PageLoading',
    area: 'feedback',
    states: [{ name: 'loading', kind: 'loading' }],
  },
  {
    name: 'PanelLoading',
    area: 'feedback',
    states: [{ name: 'loading', kind: 'loading' }],
  },
  {
    name: 'InlineLoading',
    area: 'feedback',
    states: [{ name: 'loading', kind: 'loading' }],
  },
  {
    name: 'RetryAction',
    area: 'feedback',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'retrying', kind: 'loading' },
      { name: 'attempts spent', kind: 'error' },
    ],
  },
  {
    name: 'Skeleton',
    area: 'feedback',
    states: [
      { name: 'text', kind: 'loading' },
      { name: 'media' },
      { name: 'block' },
      { name: 'circle' },
    ],
  },

  /* ----------------------------------------------------------------- media */
  {
    name: 'MediaFrame',
    area: 'media',
    states: [{ name: 'empty frame', kind: 'ready' }, { name: 'holding an image' }],
  },
  {
    name: 'ResponsiveImage',
    area: 'media',
    states: [
      { name: 'from the media control', kind: 'ready' },
      { name: 'always broken', kind: 'error' },
      { name: 'decorative' },
      /* `fit="contain"`: the whole image, in the same box. */
      { name: 'shown complete' },
    ],
  },
  {
    name: 'MediaPlaceholder',
    area: 'media',
    states: [
      { name: 'absent', kind: 'empty' },
      { name: 'loading', kind: 'loading' },
      { name: 'retrying', kind: 'loading' },
    ],
  },
  {
    name: 'MediaError',
    area: 'media',
    states: [{ name: 'error', kind: 'error' }, { name: 'error with a retry' }],
  },
  {
    name: 'MediaRetry',
    area: 'media',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'retrying', kind: 'loading' },
    ],
  },
  {
    name: 'useMediaState',
    area: 'media',
    states: [{ name: 'live state machine', kind: 'ready' }],
    note: 'A hook. A gallery harness prints the state and offers the retry it returns.',
  },

  /* ----------------------------------------------------------------- posts */
  {
    name: 'AuthorIdentity',
    area: 'posts',
    states: [
      { name: 'with an avatar', kind: 'ready' },
      { name: 'initials only' },
      { name: 'unknown author' },
    ],
  },
  {
    name: 'PostMetadata',
    area: 'posts',
    states: [{ name: 'ready', kind: 'ready' }, { name: 'inside a Series' }],
  },
  {
    name: 'SignatureStory',
    area: 'posts',
    states: [{ name: 'ready', kind: 'ready' }],
  },
  {
    name: 'FeaturedStory',
    area: 'posts',
    states: [{ name: 'ready', kind: 'ready' }],
  },
  {
    name: 'PostCard',
    area: 'posts',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'no artwork' },
      { name: 'many topics' },
      { name: 'complete cover' },
    ],
  },
  {
    name: 'PostRow',
    area: 'posts',
    states: [{ name: 'ready', kind: 'ready' }, { name: 'compact' }],
  },
  {
    name: 'FilterBar',
    area: 'posts',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'filters active' },
      { name: 'loading tags', kind: 'loading' },
      { name: 'tags failed', kind: 'error' },
    ],
  },
  {
    name: 'Pagination',
    area: 'posts',
    states: [{ name: 'middle page', kind: 'ready' }, { name: 'first page' }, { name: 'compact' }],
  },

  /* ---------------------------------------------------------------- series */
  {
    name: 'SeriesCover',
    area: 'series',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'no artwork', kind: 'empty' },
    ],
  },
  {
    name: 'SeriesCard',
    area: 'series',
    states: [{ name: 'ready', kind: 'ready' }, { name: 'no artwork or description' }],
  },
  {
    name: 'SeriesRail',
    area: 'series',
    states: [
      { name: 'ready', kind: 'ready' },
      /* `cardOptions={{ showCover: false }}` - the source carries no artwork. */
      { name: 'no artwork on the shelf' },
      { name: 'loading more', kind: 'loading' },
      { name: 'load failed', kind: 'error' },
      { name: 'empty', kind: 'empty' },
    ],
  },
  {
    name: 'RailOverlayControls',
    area: 'series',
    states: [{ name: 'both directions', kind: 'ready' }, { name: 'at the start' }],
  },
  {
    name: 'SeriesContext',
    area: 'series',
    states: [{ name: 'mid-Series', kind: 'ready' }, { name: 'first part' }],
  },
  {
    name: 'PartList',
    area: 'series',
    states: [{ name: 'ready', kind: 'ready' }, { name: 'with a current part' }],
  },
  {
    name: 'ManageSeriesItem',
    area: 'series',
    states: [
      { name: 'first of three', kind: 'ready' },
      { name: 'middle' },
      { name: 'last' },
      { name: 'busy', kind: 'loading' },
    ],
  },

  /* ---------------------------------------------------------------- reader */
  {
    name: 'ReaderFrame',
    area: 'reader',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'loading', kind: 'loading' },
      { name: 'failed', kind: 'error' },
      { name: 'missing' },
    ],
  },
  {
    name: 'Prose',
    area: 'reader',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'nothing to render', kind: 'empty' },
      { name: 'render failed', kind: 'error' },
    ],
  },
  {
    name: 'CodeBlock',
    area: 'reader',
    states: [{ name: 'ready', kind: 'ready' }, { name: 'no language' }],
  },
  {
    name: 'DiagramFrame',
    area: 'reader',
    states: [
      { name: 'rendered', kind: 'ready' },
      { name: 'source shown' },
      { name: 'render failed', kind: 'error' },
    ],
  },
  {
    name: 'TOC',
    area: 'reader',
    states: [{ name: 'rail', kind: 'ready' }, { name: 'disclosure' }],
  },
  {
    name: 'ReadingProgress',
    area: 'reader',
    states: [{ name: 'tracking a scroller', kind: 'ready' }],
    note: 'Needs a real scrollable element, so it is mounted over a gallery scroller.',
  },
  {
    name: 'ReactionBar',
    area: 'reader',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'reacted' },
      { name: 'reacting', kind: 'loading' },
      { name: 'unavailable' },
    ],
  },
  {
    name: 'ShareAction',
    area: 'reader',
    states: [{ name: 'ready', kind: 'ready' }],
  },
  {
    name: 'CommentThread',
    area: 'reader',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'loading', kind: 'loading' },
      { name: 'no comments yet', kind: 'empty' },
      { name: 'failed', kind: 'error' },
      { name: 'closed' },
    ],
  },

  /* --------------------------------------------------------------- account */
  {
    name: 'AuthPanel',
    area: 'account',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'submitting', kind: 'loading' },
      { name: 'validation error', kind: 'error' },
      { name: 'unavailable' },
    ],
  },
  {
    name: 'AuthMethod',
    area: 'account',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'redirecting', kind: 'loading' },
      { name: 'disabled' },
    ],
  },
  {
    name: 'AuthMethodSeparator',
    area: 'account',
    states: [{ name: 'ready', kind: 'ready' }],
  },
  {
    name: 'AuthAlert',
    area: 'account',
    states: [
      { name: 'error', kind: 'error' },
      { name: 'success', kind: 'ready' },
      { name: 'permission' },
      { name: 'info' },
    ],
  },
  {
    name: 'AuthCallbackFeedback',
    area: 'account',
    states: [
      { name: 'pending', kind: 'loading' },
      { name: 'succeeded', kind: 'ready' },
      { name: 'failed', kind: 'error' },
    ],
  },
  {
    name: 'VerificationFeedback',
    area: 'account',
    states: [
      { name: 'awaiting the link', kind: 'ready' },
      { name: 'checking', kind: 'loading' },
      { name: 'verified' },
      { name: 'link unusable', kind: 'error' },
    ],
  },
  {
    name: 'ProfileHeader',
    area: 'account',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'workspace' },
      { name: 'no biography', kind: 'empty' },
      { name: 'loading', kind: 'loading' },
      { name: 'missing', kind: 'error' },
      { name: 'denied' },
    ],
  },
  {
    name: 'Avatar',
    area: 'account',
    states: [
      { name: 'small', kind: 'ready' },
      { name: 'medium' },
      { name: 'large' },
      { name: 'image failed', kind: 'error' },
    ],
  },
  {
    name: 'AvatarEditor',
    area: 'account',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'workspace' },
      { name: 'uploading', kind: 'loading' },
      { name: 'upload failed', kind: 'error' },
      { name: 'image failed' },
      { name: 'disabled' },
    ],
  },
  {
    name: 'ContactCard',
    area: 'account',
    states: [{ name: 'email', kind: 'ready' }, { name: 'link' }, { name: 'location' }],
  },
  {
    name: 'ContactPrompt',
    area: 'account',
    states: [{ name: 'ready', kind: 'ready' }],
  },
  {
    name: 'CVEntry',
    area: 'account',
    states: [{ name: 'role', kind: 'ready' }, { name: 'project' }],
  },

  /* ---------------------------------------------------------------- editor */
  {
    name: 'WorkspaceShell',
    area: 'editor',
    states: [
      { name: 'write', kind: 'ready' },
      { name: 'split' },
      { name: 'preview' },
      { name: 'denied', kind: 'error' },
    ],
  },
  {
    name: 'EditorToolbar',
    area: 'editor',
    states: [{ name: 'ready', kind: 'ready' }],
  },
  {
    name: 'MetadataBar',
    area: 'editor',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'title rejected', kind: 'error' },
      { name: 'disabled' },
    ],
  },
  {
    name: 'TagField',
    area: 'editor',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'empty', kind: 'empty' },
      { name: 'rejected', kind: 'error' },
    ],
  },
  {
    name: 'MediaControl',
    area: 'editor',
    states: [
      { name: 'no cover yet', kind: 'empty' },
      { name: 'cover chosen', kind: 'ready' },
      { name: 'uploading', kind: 'loading' },
      { name: 'upload failed', kind: 'error' },
      { name: 'denied' },
    ],
  },
  {
    name: 'PreviewCard',
    area: 'editor',
    states: [{ name: 'ready', kind: 'ready' }],
  },
  {
    name: 'AutosaveState',
    area: 'editor',
    states: [
      { name: 'idle', kind: 'ready' },
      { name: 'unsaved changes' },
      { name: 'saving', kind: 'loading' },
      { name: 'saved' },
      { name: 'failed', kind: 'error' },
      { name: 'offline' },
      { name: 'permission lost' },
    ],
  },
  {
    name: 'PublishPanel',
    area: 'editor',
    states: [
      { name: 'publish now', kind: 'ready' },
      { name: 'schedule' },
      { name: 'submitting', kind: 'loading' },
      { name: 'submit failed', kind: 'error' },
      { name: 'denied' },
    ],
  },
  {
    name: 'ScheduleNotice',
    area: 'editor',
    states: [
      { name: 'scheduled', kind: 'ready' },
      { name: 'publishing', kind: 'loading' },
      { name: 'overdue', kind: 'error' },
      { name: 'unreadable timestamp' },
    ],
  },
  {
    name: 'SeriesManagerForm',
    area: 'editor',
    states: [
      { name: 'idle', kind: 'ready' },
      { name: 'unsaved order' },
      { name: 'saving', kind: 'loading' },
      { name: 'save failed', kind: 'error' },
      { name: 'deleting', kind: 'loading' },
      { name: 'delete denied' },
      { name: 'empty Series', kind: 'empty' },
      { name: 'loading', kind: 'loading' },
      { name: 'permission lost', kind: 'error' },
    ],
    note: 'The rows are ManageSeriesItem from the Series area; the delete confirmation is DestructiveAction.',
  },

  /* ------------------------------------------------------------------ data */
  {
    name: 'Metric',
    area: 'data',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'approximate' },
      { name: 'with a caveat' },
      { name: 'loading', kind: 'loading' },
    ],
  },
  {
    name: 'MetricGrid',
    area: 'data',
    states: [{ name: 'ready', kind: 'ready' }],
  },
  {
    name: 'Trend',
    area: 'data',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'flat' },
      { name: 'one point' },
      { name: 'no data', kind: 'empty' },
      { name: 'loading', kind: 'loading' },
      { name: 'failed', kind: 'error' },
      { name: 'denied' },
    ],
  },
  {
    name: 'Funnel',
    area: 'data',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'nobody arrived', kind: 'empty' },
    ],
  },
  {
    name: 'Breakdown',
    area: 'data',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'no sources', kind: 'empty' },
    ],
  },
  {
    name: 'DataTable',
    area: 'data',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'no rows', kind: 'empty' },
      { name: 'loading', kind: 'loading' },
      { name: 'failed', kind: 'error' },
    ],
  },
  {
    name: 'DateRange',
    area: 'data',
    states: [{ name: 'preset', kind: 'ready' }, { name: 'custom' }, { name: 'disabled' }],
  },
  {
    name: 'InsightList',
    area: 'data',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'nothing to report', kind: 'empty' },
      { name: 'failed', kind: 'error' },
    ],
  },
  {
    name: 'PermissionTable',
    area: 'data',
    states: [
      { name: 'ready', kind: 'ready' },
      { name: 'denied', kind: 'error' },
    ],
  },
  {
    name: 'DestructiveAction',
    area: 'data',
    states: [
      { name: 'reversible', kind: 'ready' },
      { name: 'typed confirmation' },
      { name: 'submitting', kind: 'loading' },
      { name: 'failed', kind: 'error' },
      { name: 'denied' },
    ],
  },
] as const satisfies readonly GalleryEntry[]

/** Every entry name, as a union, so a missing renderer is a compile error. */
export type GalleryEntryName = (typeof galleryRegistry)[number]['name']

/**
 * The same rows, widened to the declared interface. The UI iterates this one;
 * the audit reads the literal above.
 */
export const galleryEntries: readonly GalleryEntry[] = galleryRegistry

/** The areas in the order the top-level barrel lists them. */
export const galleryAreaOrder = [
  'layout',
  'surface',
  'typography',
  'actions',
  'navigation',
  'forms',
  'status',
  'motion',
  'feedback',
  'media',
  'posts',
  'series',
  'reader',
  'account',
  'editor',
  'data',
] as const
