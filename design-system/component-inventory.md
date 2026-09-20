# Horizon component inventory

Status: Active baseline for `horizon-blog-dsv2`.

This inventory is the migration ledger. A production page may adopt v2 only after every non-page row is implemented, retained with evidence, adapted, or explicitly deprecated and the B6 coverage gate passes.

## Scope and counts

- Total UI implementation and composition files: **125**
- Non-page component and infrastructure files: **76**
- Page/app composition files: **49** - of which **4** are still deferred.
- Migrated to the v2 system so far: **101** across releases M2-M7, the app shell, and `horizon-blog-y2e.debt.1`.
- Test files are excluded from inventory counts; tests are coverage evidence for their owning row.

### By category

| Category | Files |
| --- | ---: |
| account-identity-pattern | 9 |
| app-composition | 3 |
| app-shell | 4 |
| behavior-infrastructure | 5 |
| data-admin-pattern | 9 |
| editor-integration | 3 |
| editor-publishing-pattern | 4 |
| media-pattern | 1 |
| motion-primitive | 9 |
| navigation-primitive | 2 |
| page-composition | 46 |
| post-pattern | 11 |
| reader-conversation-pattern | 8 |
| reader-integration | 2 |
| series-pattern | 6 |
| shared-ui | 2 |

### By disposition

| Disposition | Files |
| --- | ---: |
| adapt | 4 |
| deferred-page-migration | 4 |
| migrated | 100 |
| replace-with-adapter | 11 |
| retain-behavior | 5 |

`migrated` is a page-migration disposition: the file now composes `src/design-system` and no longer
uses a compatibility-bridge token name. It stays in the ledger because it is still a legacy-tree
file; it leaves when the file does.

## Ledger

| Legacy file | Category | Disposition | Owner | v2 target | Required coverage |
| --- | --- | --- | --- | --- | --- |
| `src/App.tsx` | app-composition | deferred-page-migration | page migration epic | App | Route composition; retain behavior during component Epic |
| `src/Routes.tsx` | app-composition | deferred-page-migration | page migration epic | Routes | Route composition; retain behavior during component Epic |
| `src/app/layouts/AppLayout.tsx` | app-shell | migrated | B2 / horizon-blog-dsv2.3.2 | AppLayout | Paired themes; desktop/mobile; hover/focus/touch; reduced motion |
| `src/app/layouts/Footer.tsx` | app-shell | migrated | B2 / horizon-blog-dsv2.3.2 | SiteFooter | Paired themes; desktop/mobile; hover/focus/touch; reduced motion |
| `src/app/layouts/Navbar.tsx` | app-shell | migrated | B2 / horizon-blog-dsv2.3.2 | SiteHeader and NavItem | Paired themes; desktop/mobile; hover/focus/touch; reduced motion |
| `src/app/layouts/UserMenu.tsx` | app-shell | migrated | B2 / horizon-blog-dsv2.3.2 | UserMenu | Paired themes; desktop/mobile; hover/focus/touch; reduced motion |
| `src/components/Pagination.tsx` | navigation-primitive | replace-with-adapter | B2 / horizon-blog-dsv2.3.2 | Pagination | Hover/focus/disabled/loading/touch/reduced motion |
| `src/components/PaginationControls.tsx` | navigation-primitive | replace-with-adapter | B2 / horizon-blog-dsv2.3.2 | Pagination and PageJump | Hover/focus/disabled/loading/touch/reduced motion |
| `src/components/ProtectedRoute.tsx` | behavior-infrastructure | retain-behavior | B6 / horizon-blog-dsv2.7.2 | ProtectedRoute | No visual rewrite; verify compatibility and accessibility |
| `src/components/core/animations/Accessibility.tsx` | motion-primitive | replace-with-adapter | B3 / horizon-blog-dsv2.4.1 | Accessibility | Normal/reduced motion; pointer/keyboard/touch; cleanup |
| `src/components/core/animations/AnimatedButton.tsx` | motion-primitive | replace-with-adapter | B3 / horizon-blog-dsv2.4.1 | ActionButton compatibility adapter | Normal/reduced motion; pointer/keyboard/touch; cleanup |
| `src/components/core/animations/AnimatedCard.tsx` | motion-primitive | replace-with-adapter | B3 / horizon-blog-dsv2.4.1 | InteractiveSurface compatibility adapter | Normal/reduced motion; pointer/keyboard/touch; cleanup |
| `src/components/core/animations/BlogDetailAnimations.tsx` | motion-primitive | replace-with-adapter | B3 / horizon-blog-dsv2.4.1 | BlogDetailAnimations | Normal/reduced motion; pointer/keyboard/touch; cleanup |
| `src/components/core/animations/Glassmorphism.tsx` | motion-primitive | replace-with-adapter | B3 / horizon-blog-dsv2.4.1 | Surface depth variants | Normal/reduced motion; pointer/keyboard/touch; cleanup |
| `src/components/core/animations/LoadingState.tsx` | motion-primitive | replace-with-adapter | B3 / horizon-blog-dsv2.4.1 | PageLoading and PanelLoading | Normal/reduced motion; pointer/keyboard/touch; cleanup |
| `src/components/core/animations/MotionWrapper.tsx` | motion-primitive | replace-with-adapter | B3 / horizon-blog-dsv2.4.1 | Reveal and Stagger | Normal/reduced motion; pointer/keyboard/touch; cleanup |
| `src/components/core/animations/ParticleSystem.tsx` | motion-primitive | replace-with-adapter | B3 / horizon-blog-dsv2.4.1 | AmbientArtwork or explicit deprecation | Normal/reduced motion; pointer/keyboard/touch; cleanup |
| `src/components/core/animations/ShimmerLoader.tsx` | motion-primitive | replace-with-adapter | B3 / horizon-blog-dsv2.4.1 | Skeleton | Normal/reduced motion; pointer/keyboard/touch; cleanup |
| `src/components/editor/CrepeEditor.tsx` | editor-integration | migrated | M6 / horizon-blog-y2e | v2 CrepeEditor pattern | Dense responsive workspace; async/error/permission states |
| `src/components/editor/CrepePreview.tsx` | editor-integration | migrated | M6 / horizon-blog-y2e | v2 CrepePreview pattern | Dense responsive workspace; async/error/permission states |
| `src/components/editor/MermaidZoomModal.tsx` | editor-integration | migrated | M6 / horizon-blog-y2e | v2 MermaidZoomModal pattern | Dense responsive workspace; async/error/permission states |
| `src/components/reader/MarkdownReader.tsx` | reader-integration | migrated | M4 / horizon-blog-y2e | Prose, localScrollStyle | Prose owns the measure, contrast and local overflow; marked/DOMPurify/Shiki unchanged. Shiki shell restyled with reader and card role tokens only - the two gradients, eleven rgba() literals, five hex colours and the `obsidian.text.*` names are gone |
| `src/components/reader/MilkdownReader.tsx` | reader-integration | migrated | M4 / horizon-blog-y2e | Prose, ErrorState via Prose renderError | Milkdown/commonmark/GFM/Prism/nord unchanged; the 170-line hand-written document theme and its `obsidian.*` and `gray.*` names are replaced by Prose. Setup failure is the system error state |
| `src/components/seo/ClientSeoSync.tsx` | behavior-infrastructure | retain-behavior | B6 / horizon-blog-dsv2.7.2 | ClientSeoSync | No visual rewrite; verify compatibility and accessibility |
| `src/components/ui/BrandFaviconSync.tsx` | behavior-infrastructure | retain-behavior | B6 / horizon-blog-dsv2.7.2 | BrandFaviconSync | No visual rewrite; verify compatibility and accessibility |
| `src/components/ui/BrandLogo.tsx` | shared-ui | adapt | B2 / horizon-blog-dsv2.3 | BrandMark | Paired themes; responsive; all applicable interactive states |
| `src/components/ui/StatChip.tsx` | shared-ui | adapt | B2 / horizon-blog-dsv2.3 | MetricBadge | Paired themes; responsive; all applicable interactive states |
| `src/context/AuthContext.tsx` | behavior-infrastructure | retain-behavior | B6 / horizon-blog-dsv2.7.2 | AuthContext | No visual rewrite; verify session state consumers and loading handoff |
| `src/core/components/ErrorBoundary.tsx` | behavior-infrastructure | retain-behavior | B6 / horizon-blog-dsv2.7.2 | ErrorBoundary | No visual rewrite; verify compatibility and accessibility |
| `src/features/about/components/AboutHero.tsx` | account-identity-pattern | migrated | M2 / horizon-blog-y2e | Surface (feature depth), Heading, Text, Eyebrow, Divider, Grid, Stack, ActionLink, useMotionPolicy | Paired themes at 375/768/1024/1440; ambient track stops under reduced motion; no compatibility-bridge token; track decisions in `aboutHero.logic.ts`, tested in `aboutHero.test.ts` |
| `src/features/about/components/AboutStatCard.tsx` | account-identity-pattern | migrated | M2 / horizon-blog-y2e | Surface, Stack, Eyebrow, Heading, Text | Paired themes; long Vietnamese and English labels; no compatibility-bridge token. `Metric` rejected: every value is a phrase, not a number |
| `src/features/about/pages/AboutPage.tsx` | page-composition | migrated | M2 / horizon-blog-y2e | ContentContainer, Section, Grid, Stack, Surface, Heading, Text, Eyebrow, Chip, ActionLink, ResponsiveImage, Reveal, Stagger | Paired themes at 375/768/1024/1440; portrait loading/absent/failed/retry through `ResponsiveImage`; reduced motion; no compatibility-bridge token |
| `src/features/access-management/pages/AccessManagementPage.tsx` | page-composition | migrated | M7 / horizon-blog-y2e.6.3 | PermissionTable, DestructiveAction, ContentContainer, Section, Stack, Heading, Text, Eyebrow, EmptyState, ErrorState, PermissionState, RetryAction, PageLoading | Role select always shows `serverRole`, never the requested one; a role change stages a `DestructiveAction` confirm and only calls the server `onConfirm`, staying open with the server's message on a refusal; loading/denied/error/empty states on the list itself; no compatibility-bridge token |
| `src/features/auth/pages/ForgotPasswordPage.tsx` | page-composition | migrated | M5 / horizon-blog-y2e | ForgotPasswordPage | Consume completed v2 patterns after B6 gate |
| `src/features/auth/pages/LoginCallbackPage.tsx` | page-composition | migrated | M5 / horizon-blog-y2e | LoginCallbackPage | Consume completed v2 patterns after B6 gate |
| `src/features/auth/pages/LoginPage.tsx` | page-composition | migrated | M5 / horizon-blog-y2e | LoginPage | Consume completed v2 patterns after B6 gate |
| `src/features/auth/pages/RegisterPage.tsx` | page-composition | migrated | M5 / horizon-blog-y2e | RegisterPage | Consume completed v2 patterns after B6 gate |
| `src/features/auth/pages/ResetPasswordPage.tsx` | page-composition | migrated | M5 / horizon-blog-y2e | ResetPasswordPage | Consume completed v2 patterns after B6 gate |
| `src/features/auth/pages/VerifyEmailPage.tsx` | page-composition | migrated | M5 / horizon-blog-y2e | VerifyEmailPage | Consume completed v2 patterns after B6 gate |
| `src/features/author-analytics/components/AnalyticsDateRangeFilter.tsx` | data-admin-pattern | migrated | M7 / horizon-blog-y2e.6.3 | DateRange pattern | Loading/empty/error/partial/denied via the pattern it wraps; responsive overflow; no compatibility-bridge token |
| `src/features/author-analytics/components/AnalyticsInsightList.tsx` | data-admin-pattern | migrated | M7 / horizon-blog-y2e.6.3 | InsightList pattern | Loading/empty/error/partial/denied via the pattern it wraps; responsive overflow; no compatibility-bridge token |
| `src/features/author-analytics/components/AnalyticsReactionTrend.tsx` | data-admin-pattern | migrated | M7 / horizon-blog-y2e.6.3 | MetricGrid and Trend patterns | Loading/empty/error/partial/denied via the patterns it wraps; responsive overflow; no compatibility-bridge token |
| `src/features/author-analytics/components/AnalyticsSummaryMetrics.tsx` | data-admin-pattern | migrated | M7 / horizon-blog-y2e.6.3 | Metric, MetricGrid patterns | Supersedes `AnalyticsMetricCard.tsx` (removed); loading/denied/error/empty via `dataPanelState`, since `Metric` alone has no denied/error shape; approximate readers labelled via `metricValue`; no compatibility-bridge token |
| `src/features/author-analytics/components/AnalyticsTrendChart.tsx` | data-admin-pattern | migrated | M7 / horizon-blog-y2e.6.3 | Trend pattern | Loading/empty/error/partial/denied via the pattern it wraps; partial-coverage notice via `assessCoverage`; no compatibility-bridge token |
| `src/features/author-analytics/components/BlogMetricsTable.tsx` | data-admin-pattern | migrated | M7 / horizon-blog-y2e.6.3 | DataTable pattern | Loading/empty/error/partial/denied via the pattern it wraps; table scrolls within its own container at 320/375, never the document; no compatibility-bridge token |
| `src/features/author-analytics/components/LinkPerformanceTable.tsx` | data-admin-pattern | migrated | M7 / horizon-blog-y2e.6.3 | DataTable pattern | Loading/empty/error/partial/denied via the pattern it wraps; responsive overflow; no compatibility-bridge token |
| `src/features/author-analytics/components/ReaderProgressFunnel.tsx` | data-admin-pattern | migrated | M7 / horizon-blog-y2e.6.3 | Funnel pattern | Loading/empty/error/partial/denied via the pattern it wraps; zero-sample distinguished from loading/error via `assessSample`; no compatibility-bridge token |
| `src/features/author-analytics/components/TrafficSourceBreakdown.tsx` | data-admin-pattern | migrated | M7 / horizon-blog-y2e.6.3 | Breakdown pattern | Loading/empty/error/partial/denied via the pattern it wraps; responsive overflow; no compatibility-bridge token |
| `src/features/author-analytics/pages/AnalyticsOverviewPage.tsx` | page-composition | migrated | M7 / horizon-blog-y2e.6.3 | AnalyticsSummaryMetrics, AnalyticsTrendChart, AnalyticsInsightList, BlogMetricsTable, AnalyticsDateRangeFilter, ContentContainer, Section, Stack | Summary, trend, insights and table each carry independent loading/denied/error/empty state; approximate readers labelled via `metricValue`; table scrolls within its own container, never the document; no compatibility-bridge token |
| `src/features/author-analytics/pages/BlogAnalyticsPage.tsx` | page-composition | migrated | M7 / horizon-blog-y2e.6.3 | AnalyticsSummaryMetrics, ReaderProgressFunnel, AnalyticsReactionTrend, LinkPerformanceTable, TrafficSourceBreakdown, AnalyticsInsightList, AnalyticsDateRangeFilter, ContentContainer, Section, Grid, Stack | One request backs every panel, so loading/denied/error are shared while each panel keeps its own zero-sample copy; no compatibility-bridge token |
| `src/features/authors/components/AuthorArchiveHero.tsx` | post-pattern | migrated | M3 / horizon-blog-y2e | v2 AuthorArchiveHero pattern | Long content; media states; hover/focus/touch; responsive themes |
| `src/features/authors/components/AuthorArchiveStoryListItem.tsx` | post-pattern | migrated | M3 / horizon-blog-y2e | v2 AuthorArchiveStoryListItem pattern | Long content; media states; hover/focus/touch; responsive themes |
| `src/features/authors/pages/AuthorArchivePage.tsx` | page-composition | migrated | M3 / horizon-blog-y2e | AuthorArchivePage | Consume completed v2 patterns after B6 gate |
| `src/features/blog/components/BlogArchiveHero.tsx` | post-pattern | migrated | M3 / horizon-blog-y2e | v2 BlogArchiveHero pattern | Long content; media states; hover/focus/touch; responsive themes |
| `src/features/blog/components/BlogFilterToolbar.tsx` | post-pattern | migrated | M3 / horizon-blog-y2e | v2 BlogFilterToolbar pattern | Long content; media states; hover/focus/touch; responsive themes |
| `src/features/blog/components/BlogReaderFrame.tsx` | post-pattern | migrated | M4 / horizon-blog-y2e | ReaderFrame, Prose, ReadingProgress, TOC (through ReaderFrame), Heading, Metadata, AuthorIdentity, Chip, Button, Stack, Section, InlineLoading | Paired themes at 375/768/1024/1440; code and tables scroll inside themselves; reduced motion stops the smooth in-page scroll; loading, missing and failed are three distinct states. Active heading and deep links in `useReaderHeadings.ts`; analytics progress in `useReadingProgressReport.ts`; document order asserted in `BlogReaderFrame.test.tsx` |
| `src/features/blog/components/EditorialCard.tsx` | post-pattern | migrated | M3 / horizon-blog-y2e | PostCard and PostRow | Long content; media states; hover/focus/touch; responsive themes |
| `src/features/blog/components/FeaturedStory.tsx` | post-pattern | migrated | M3 / horizon-blog-y2e | FeaturedStory | Long content; media states; hover/focus/touch; responsive themes |
| `src/features/blog/components/RelatedPosts.tsx` | post-pattern | migrated | M4 / horizon-blog-y2e | PostRow, Stack, Heading, hierarchyContext | Long Vietnamese and English titles; absent and failed covers through the pattern; no invented excerpt. Moved from a 280px sticky rail into the reading column, where the excerpt fits |
| `src/features/blog/pages/BlogDetailPage.tsx` | page-composition | migrated | M4 / horizon-blog-y2e | BlogReaderFrame over ReaderFrame; ReaderInteractionBar; CommentSection; SeriesContextCard; RelatedPosts | Hooks, routing and the related-posts request unchanged; a 404 is now a missing state and a transport failure an error state. Covered by `BlogDetailPage.performance.test.tsx` |
| `src/features/blog/pages/BlogPage.tsx` | page-composition | migrated | M3 / horizon-blog-y2e | BlogPage | Consume completed v2 patterns after B6 gate |
| `src/features/comments/components/CommentActions.tsx` | reader-conversation-pattern | migrated | M4 / horizon-blog-y2e | Button (quiet and danger tones), Stack, canReplyTo | API capabilities plus the design system depth cap decide which controls exist; removal keeps its confirmation. The dialog is still Chakra `AlertDialog` - the system has no dialog primitive (gap reported) |
| `src/features/comments/components/CommentComposer.tsx` | reader-conversation-pattern | migrated | M4 / horizon-blog-y2e | Field, Textarea, Button, Stack, Text | Label, hint and error wired by `Field`; vertical-only resize; submit success and failure unchanged. `AnimatedPrimaryButton` removed |
| `src/features/comments/components/CommentItem.tsx` | reader-conversation-pattern | migrated | M4 / horizon-blog-y2e | AuthorIdentity, Text, Stack, commentBody, commentTimestamp, commentAuthorName, threadIndent | Removed comments keep a tombstone; a deleted account is named; body wraps at 375px; indent stops at the API depth cap |
| `src/features/comments/components/CommentSection.tsx` | reader-conversation-pattern | migrated | M4 / horizon-blog-y2e | FeedbackSurface, EmptyState, ErrorState, PanelLoading, RetryAction, Heading, Text, Button, Stack, conversationStatus, composerAvailability, commentCountLabel | Unavailable, loading, error, closed, empty and ready in that fixed order; signed-out, permission-denied and closed composer states. `useBlogComments` untouched. Covered by `CommentSection.test.tsx` and `CommentSection.states.test.tsx` |
| `src/features/comments/components/CommentThread.tsx` | reader-conversation-pattern | migrated | M4 / horizon-blog-y2e | Button, ErrorState, RetryAction, replyToggleLabel | Keeps the cursor-paged reply lifecycle the design system `CommentThread` cannot express (gap reported); nesting, depth cap and live replies under a removed parent unchanged |
| `src/features/contact/components/ContactRail.tsx` | contact-pattern | migrated | 021 / horizon-blog-e8c | ActionLink, IconButton, Divider, Eyebrow, SectionLabel, Stack, Text, shared copy state | Feature-owned composition because the Storybook pilot exposes no Contact rail; exact `mailto:`/`tel:` semantics, informational location, intentional email break after `@`, and visible/live copy success or failure |
| `src/features/contact/pages/ContactPage.tsx` | page-composition | migrated | 021 / horizon-blog-e8c | ContentContainer, Section, Chakra Grid, Stack, Heading, Text, Eyebrow, Divider, ContactRail | Editorial Letter composition; invitation and inline topics precede the email-first rail; paired themes at 320/375/768/1024/1440; no form, reason-card grid, raw design value, or compatibility-bridge token |
| `src/features/cv/pages/CvPage.tsx` | page-composition | migrated | M2 / horizon-blog-y2e | ContentContainer, Section, Surface, Stack, Grid, Heading, Text, Eyebrow, Metadata, Button, ActionLink, CVEntry | Paired themes at 375/768/1024/1440; print from both themes; keeps the `cv-*` class hooks that `src/index.css` print rules key on, and pins the v2 colour roles that block does not cover |
| `src/features/editor/components/ActiveScheduleNotice.tsx` | editor-publishing-pattern | migrated | M6 / horizon-blog-y2e | v2 ActiveScheduleNotice pattern | Autosave/upload/publish/schedule/recovery/permission states |
| `src/features/editor/components/DraftRecoveryNotice.tsx` | editor-publishing-pattern | migrated | debt.1 / horizon-blog-y2e | FeedbackSurface, Button, Stack | Added by `horizon-blog-y2e.debt.1`: wires the `blog_draft_backup` local backup back into the editor via `WorkspaceShell`'s banner slot, gated on `draftRecovery()` and a strict per-post ownership check so one post's backup can never be offered while editing another |
| `src/features/editor/components/EditorTagField.tsx` | editor-publishing-pattern | migrated | M6 / horizon-blog-y2e | v2 EditorTagField pattern | Autosave/upload/publish/schedule/recovery/permission states |
| `src/features/editor/components/EditorWorkspace.tsx` | editor-publishing-pattern | migrated | M6 / horizon-blog-y2e | v2 EditorWorkspace pattern | Autosave/upload/publish/schedule/recovery/permission states |
| `src/features/editor/components/PublishBlogPreviewCard.tsx` | editor-publishing-pattern | migrated | M6 / horizon-blog-y2e | v2 PublishBlogPreviewCard pattern | Autosave/upload/publish/schedule/recovery/permission states |
| `src/features/editor/pages/BlogEditorPage.tsx` | page-composition | migrated | M6 / horizon-blog-y2e | BlogEditorPage | Consume completed v2 patterns after B6 gate |
| `src/features/editor/pages/PublishBlogPage.tsx` | page-composition | migrated | M6 / horizon-blog-y2e | PublishBlogPage | Consume completed v2 patterns after B6 gate |
| `src/features/errors/pages/NotFoundPage.tsx` | page-composition | migrated | uix.9 / horizon-blog-y2e | ContentContainer, Section, Stack, Heading, MissingState, ActionLink | Added by `uix.9`: `Routes.tsx` had no `path="*"`, so an unknown address rendered an empty `main`. Neutral missing tone, a real `h1`, and three ways onward; paired themes at 375/768/1024/1440 |
| `src/features/home/components/HeroArchivePreview.tsx` | post-pattern | migrated | M3 / horizon-blog-y2e | SignatureStory | Long content; media states; hover/focus/touch; responsive themes |
| `src/features/home/components/PromiseCard.tsx` | post-pattern | migrated | M3 / horizon-blog-y2e | v2 PromiseCard pattern | Long content; media states; hover/focus/touch; responsive themes |
| `src/features/home/components/StoryCard.tsx` | post-pattern | migrated | M3 / horizon-blog-y2e | PostCard | Long content; media states; hover/focus/touch; responsive themes |
| `src/features/home/pages/HomePage.tsx` | page-composition | migrated | M3 / horizon-blog-y2e | HomePage | Consume completed v2 patterns after B6 gate |
| `src/features/media/components/DefaultPostCover.tsx` | media-pattern | adapt | B3 / horizon-blog-dsv2.4.3 | MediaPlaceholder | Loading/ready/absent/error/retry; stable ratio; alt semantics |
| `src/features/oauth/pages/McpAuthorizePage.tsx` | page-composition | migrated | M5 / horizon-blog-y2e | McpAuthorizePage | Consume completed v2 patterns after B6 gate |
| `src/features/profile/components/AvatarPreviewModal.tsx` | account-identity-pattern | migrated | M6 / horizon-blog-y2e | v2 AvatarPreviewModal pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/profile/components/EditProfileModal.tsx` | account-identity-pattern | migrated | M6 / horizon-blog-y2e | v2 EditProfileModal pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/profile/components/ProfileBlogGrid.tsx` | account-identity-pattern | migrated | M6 / horizon-blog-y2e | v2 ProfileBlogGrid pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/profile/components/ProfileHeaderCard.tsx` | account-identity-pattern | migrated | 022 / horizon-blog-7lg | ProfileHeader `workspace`, AvatarEditor `workspace`, ActionLink, Button | Editorial split with square portrait overlay; quiet edit action beneath name; one permission-gated writing CTA; semantic unboxed facts; default/public presentations unchanged; gallery acceptance state covers the Storybook MCP account-pattern gap |
| `src/features/profile/components/ProfilePostsSection.tsx` | account-identity-pattern | migrated | M6 / horizon-blog-y2e | v2 ProfilePostsSection pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/profile/components/ProfileScheduledList.tsx` | account-identity-pattern | migrated | M6 / horizon-blog-y2e | v2 ProfileScheduledList pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/profile/components/ProfileScheduledRow.tsx` | account-identity-pattern | migrated | M6 / horizon-blog-y2e | v2 ProfileScheduledRow pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/profile/pages/ProfileBlogDetailPage.tsx` | page-composition | migrated | M4 / horizon-blog-y2e | BlogReaderFrame, Heading, StatusBadge, Text | Ownership check and redirect unchanged; a draft is marked in words and an icon, not a hue alone; the two Framer Motion entrances are gone. Covered by `ProfileBlogDetailPage.test.tsx` |
| `src/features/reader-interactions/components/HeartButton.tsx` | reader-conversation-pattern | migrated | M4 / horizon-blog-y2e | Button, reactionButtonState | Disabled rather than hidden so the count stays readable; count hidden from the accessibility tree, spoken in the name; `red.500`/`red.600` removed |
| `src/features/reader-interactions/components/ReaderInteractionBar.tsx` | reader-conversation-pattern | migrated | M4 / horizon-blog-y2e | IconButton, ActionLink, Text, reactionUnavailableNotice; ReactionBar layout reproduced | Sits in `ReaderFrame`'s feedback region, after the prose, never beside the byline; a reader who cannot react is told why; control tokens own the touch target and the disabled treatment |
| `src/features/reader-interactions/components/ShareButton.tsx` | reader-conversation-pattern | migrated | M4 / horizon-blog-y2e | Button trigger, shareTargets, overlay and control role tokens | Not `ShareAction`: that component owns navigation and the clipboard itself, which would double-open every target against `useReaderInteractions.share` (gap reported). Success and failure feedback stay with the hook |
| `src/features/series/components/SeriesCard.tsx` | series-pattern | migrated | M3 / horizon-blog-y2e | SeriesCard | Book identity; ordered parts; rail controls; async states |
| `src/features/series/components/SeriesContextCard.tsx` | series-pattern | migrated | M3 / horizon-blog-y2e | SeriesContext | Book identity; ordered parts; rail controls; async states |
| `src/features/series/components/SeriesManager.tsx` | series-pattern | migrated | M6 / horizon-blog-y2e | SeriesManagerForm, composing ManageSeriesItem rows | Book identity; ordered parts; async states. Identity fields, add-a-blog, explicit save and server-owned delete; idle, dirty, saving, saved, save-failed, deleting, delete-denied, empty, loading and permission-loss states resolved in `seriesManager.logic.ts` and tested in `seriesManager.test.ts`; paint and focus behaviour belong to the B6 gallery |
| `src/features/series/components/SeriesPartList.tsx` | series-pattern | migrated | M3 / horizon-blog-y2e | SeriesPartList | Book identity; ordered parts; rail controls; async states |
| `src/features/series/components/SeriesShelf.tsx` | series-pattern | migrated | M3 / horizon-blog-y2e | SeriesRail | Book identity; ordered parts; rail controls; async states |
| `src/features/series/pages/ManageSeriesPage.tsx` | page-composition | migrated | M6 / horizon-blog-y2e | ManageSeriesPage | Consume completed v2 patterns after B6 gate |
| `src/features/series/pages/SeriesIndexPage.tsx` | page-composition | migrated | M3 / horizon-blog-y2e | SeriesIndexPage | Consume completed v2 patterns after B6 gate |
| `src/features/series/pages/SeriesPage.tsx` | page-composition | migrated | M3 / horizon-blog-y2e | SeriesPage | Consume completed v2 patterns after B6 gate |
| `src/main.tsx` | app-composition | adapt | B1 / horizon-blog-dsv2.2.2 | App bootstrap and theme provider | Chakra v2 theme mount, colour-mode script, local font loading, reduced motion |
| `src/pages/About.tsx` | page-composition | migrated | M2 / horizon-blog-y2e | About | Route wrapper; re-exports the migrated `AboutPage` |
| `src/pages/Analytics.tsx` | page-composition | deferred-page-migration | page migration epic | Analytics | Consume completed v2 patterns after B6 gate |
| `src/pages/AuthorArchive.tsx` | page-composition | migrated | M3 / horizon-blog-y2e | AuthorArchive | Consume completed v2 patterns after B6 gate |
| `src/pages/Blog.tsx` | page-composition | migrated | M3 / horizon-blog-y2e | Blog | Consume completed v2 patterns after B6 gate |
| `src/pages/BlogAnalytics.tsx` | page-composition | deferred-page-migration | page migration epic | BlogAnalytics | Consume completed v2 patterns after B6 gate |
| `src/pages/BlogDetail.tsx` | page-composition | migrated | M4 / horizon-blog-y2e | BlogDetail | Route wrapper; re-exports the migrated `BlogDetailPage` |
| `src/pages/BlogEditor.tsx` | page-composition | migrated | M6 / horizon-blog-y2e | BlogEditor | Consume completed v2 patterns after B6 gate |
| `src/pages/Contact.tsx` | page-composition | migrated | M2 / horizon-blog-y2e | Contact | Route wrapper; re-exports the migrated `ContactPage` |
| `src/pages/Cv.tsx` | page-composition | migrated | M2 / horizon-blog-y2e | Cv | Route wrapper; re-exports the migrated `CvPage` |
| `src/pages/ForgotPassword.tsx` | page-composition | migrated | M5 / horizon-blog-y2e | ForgotPassword | Consume completed v2 patterns after B6 gate |
| `src/pages/Home.tsx` | page-composition | migrated | M3 / horizon-blog-y2e | Home | Consume completed v2 patterns after B6 gate |
| `src/pages/Login.tsx` | page-composition | migrated | M5 / horizon-blog-y2e | Login | Consume completed v2 patterns after B6 gate |
| `src/pages/ManageSeries.tsx` | page-composition | migrated | M6 / horizon-blog-y2e | ManageSeries | Consume completed v2 patterns after B6 gate |
| `src/pages/OAuthAuthorize.tsx` | page-composition | migrated | M5 / horizon-blog-y2e | OAuthAuthorize | Consume completed v2 patterns after B6 gate |
| `src/pages/Profile.tsx` | page-composition | migrated | M6 / horizon-blog-y2e | Profile | Consume completed v2 patterns after B6 gate |
| `src/pages/ProfileBlogDetail.tsx` | page-composition | migrated | M4 / horizon-blog-y2e | ProfileBlogDetail | Route wrapper; re-exports the migrated `ProfileBlogDetailPage` |
| `src/pages/PublishBlog.tsx` | page-composition | migrated | M6 / horizon-blog-y2e | PublishBlog | Consume completed v2 patterns after B6 gate |
| `src/pages/Register.tsx` | page-composition | migrated | M5 / horizon-blog-y2e | Register | Consume completed v2 patterns after B6 gate |
| `src/pages/ResetPassword.tsx` | page-composition | migrated | M5 / horizon-blog-y2e | ResetPassword | Consume completed v2 patterns after B6 gate |
| `src/pages/Series.tsx` | page-composition | migrated | M3 / horizon-blog-y2e | Series | Consume completed v2 patterns after B6 gate |
| `src/pages/SeriesIndex.tsx` | page-composition | migrated | M3 / horizon-blog-y2e | SeriesIndex | Consume completed v2 patterns after B6 gate |
| `src/pages/VerifyEmail.tsx` | page-composition | migrated | M5 / horizon-blog-y2e | VerifyEmail | Consume completed v2 patterns after B6 gate |

## Coverage rules

1. This ledger tracks the **legacy** tree. Adding a visual implementation file anywhere outside
   `src/design-system/` requires adding a row in the same change. Files inside `src/design-system/`
   are the v2 system itself and are covered instead by the gallery check in
   `yarn coverage:design-system` — writing each component down in both places would only let the two
   copies drift.
2. A compatibility adapter must name its v2 target and removal gate.
3. A retained-behavior row still requires theme and accessibility compatibility evidence when it renders UI.
4. Deferred page rows may consume completed patterns only after `horizon-blog-dsv2.7.3` passes.
5. Page migration may not introduce new raw color, shadow, radius, spacing, or motion values.
