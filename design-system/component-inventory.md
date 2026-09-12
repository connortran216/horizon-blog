# Horizon component inventory

Status: Active baseline for `horizon-blog-dsv2`.

This inventory is the migration ledger. A production page may adopt v2 only after every non-page row is implemented, retained with evidence, adapted, or explicitly deprecated and the B6 coverage gate passes.

## Scope and counts

- Total UI implementation and composition files: **138**
- Non-page component and infrastructure files: **91**
- Deferred page/app composition files: **47**
- Test files are excluded from inventory counts; tests are coverage evidence for their owning row.

### By category

| Category | Files |
| --- | ---: |
| account-identity-pattern | 16 |
| app-composition | 3 |
| app-shell | 5 |
| behavior-infrastructure | 5 |
| compatibility-layout | 3 |
| data-admin-pattern | 9 |
| editor-integration | 5 |
| editor-publishing-pattern | 5 |
| media-pattern | 1 |
| motion-primitive | 9 |
| navigation-primitive | 2 |
| page-composition | 45 |
| post-pattern | 12 |
| reader-conversation-pattern | 8 |
| reader-integration | 2 |
| series-pattern | 6 |
| shared-ui | 2 |

### By disposition

| Disposition | Files |
| --- | ---: |
| adapt | 72 |
| compatibility | 3 |
| deferred-page-migration | 47 |
| replace-with-adapter | 11 |
| retain-behavior | 5 |

## Ledger

| Legacy file | Category | Disposition | Owner | v2 target | Required coverage |
| --- | --- | --- | --- | --- | --- |
| `src/App.tsx` | app-composition | deferred-page-migration | page migration epic | App | Route composition; retain behavior during component Epic |
| `src/Routes.tsx` | app-composition | deferred-page-migration | page migration epic | Routes | Route composition; retain behavior during component Epic |
| `src/app/layouts/AppLayout.tsx` | app-shell | adapt | B2 / horizon-blog-dsv2.3.2 | AppLayout | Paired themes; desktop/mobile; hover/focus/touch; reduced motion |
| `src/app/layouts/Footer.tsx` | app-shell | adapt | B2 / horizon-blog-dsv2.3.2 | SiteFooter | Paired themes; desktop/mobile; hover/focus/touch; reduced motion |
| `src/app/layouts/NavLinkButton.tsx` | app-shell | adapt | B2 / horizon-blog-dsv2.3.2 | NavLinkButton | Paired themes; desktop/mobile; hover/focus/touch; reduced motion |
| `src/app/layouts/Navbar.tsx` | app-shell | adapt | B2 / horizon-blog-dsv2.3.2 | SiteHeader and NavItem | Paired themes; desktop/mobile; hover/focus/touch; reduced motion |
| `src/app/layouts/UserMenu.tsx` | app-shell | adapt | B2 / horizon-blog-dsv2.3.2 | UserMenu | Paired themes; desktop/mobile; hover/focus/touch; reduced motion |
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
| `src/components/editor/CrepeEditor.tsx` | editor-integration | adapt | B5 / horizon-blog-dsv2.6.2 | v2 CrepeEditor pattern | Dense responsive workspace; async/error/permission states |
| `src/components/editor/CrepePreview.tsx` | editor-integration | adapt | B5 / horizon-blog-dsv2.6.2 | v2 CrepePreview pattern | Dense responsive workspace; async/error/permission states |
| `src/components/editor/MarkdownEditor.tsx` | editor-integration | adapt | B5 / horizon-blog-dsv2.6.2 | v2 MarkdownEditor pattern | Dense responsive workspace; async/error/permission states |
| `src/components/editor/MermaidZoomModal.tsx` | editor-integration | adapt | B5 / horizon-blog-dsv2.6.2 | v2 MermaidZoomModal pattern | Dense responsive workspace; async/error/permission states |
| `src/components/editor/MilkdownEditor.tsx` | editor-integration | adapt | B5 / horizon-blog-dsv2.6.2 | v2 MilkdownEditor pattern | Dense responsive workspace; async/error/permission states |
| `src/components/layout/Footer.tsx` | compatibility-layout | compatibility | B2 / horizon-blog-dsv2.3.1 | SiteFooter | Retain re-export until page migration removes old import |
| `src/components/layout/Layout.tsx` | compatibility-layout | compatibility | B2 / horizon-blog-dsv2.3.1 | Layout | Retain re-export until page migration removes old import |
| `src/components/layout/Navbar.tsx` | compatibility-layout | compatibility | B2 / horizon-blog-dsv2.3.1 | SiteHeader and NavItem | Retain re-export until page migration removes old import |
| `src/components/reader/MarkdownReader.tsx` | reader-integration | adapt | B4 / horizon-blog-dsv2.5.3 | Prose | Prose contrast; code/table overflow; render failure |
| `src/components/reader/MilkdownReader.tsx` | reader-integration | adapt | B4 / horizon-blog-dsv2.5.3 | Prose renderer adapter | Prose contrast; code/table overflow; render failure |
| `src/components/seo/ClientSeoSync.tsx` | behavior-infrastructure | retain-behavior | B6 / horizon-blog-dsv2.7.2 | ClientSeoSync | No visual rewrite; verify compatibility and accessibility |
| `src/components/ui/BrandFaviconSync.tsx` | behavior-infrastructure | retain-behavior | B6 / horizon-blog-dsv2.7.2 | BrandFaviconSync | No visual rewrite; verify compatibility and accessibility |
| `src/components/ui/BrandLogo.tsx` | shared-ui | adapt | B2 / horizon-blog-dsv2.3 | BrandMark | Paired themes; responsive; all applicable interactive states |
| `src/components/ui/StatChip.tsx` | shared-ui | adapt | B2 / horizon-blog-dsv2.3 | MetricBadge | Paired themes; responsive; all applicable interactive states |
| `src/context/AuthContext.tsx` | behavior-infrastructure | retain-behavior | B6 / horizon-blog-dsv2.7.2 | AuthContext | No visual rewrite; verify session state consumers and loading handoff |
| `src/core/components/ErrorBoundary.tsx` | behavior-infrastructure | retain-behavior | B6 / horizon-blog-dsv2.7.2 | ErrorBoundary | No visual rewrite; verify compatibility and accessibility |
| `src/features/about/components/AboutHero.tsx` | account-identity-pattern | adapt | B5 / horizon-blog-dsv2.6.1 | v2 AboutHero pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/about/components/AboutStatCard.tsx` | account-identity-pattern | adapt | B5 / horizon-blog-dsv2.6.1 | v2 AboutStatCard pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/about/pages/AboutPage.tsx` | page-composition | deferred-page-migration | page migration epic | AboutPage | Consume completed v2 patterns after B6 gate |
| `src/features/access-management/pages/AccessManagementPage.tsx` | page-composition | deferred-page-migration | page migration epic | AccessManagementPage | Consume completed v2 patterns after B6 gate |
| `src/features/auth/components/AuthMethodDivider.tsx` | account-identity-pattern | adapt | B5 / horizon-blog-dsv2.6.1 | v2 AuthMethodDivider pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/auth/components/AuthShell.tsx` | account-identity-pattern | adapt | B5 / horizon-blog-dsv2.6.1 | v2 AuthShell pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/auth/components/GoogleAuthButton.tsx` | account-identity-pattern | adapt | B5 / horizon-blog-dsv2.6.1 | v2 GoogleAuthButton pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/auth/pages/ForgotPasswordPage.tsx` | page-composition | deferred-page-migration | page migration epic | ForgotPasswordPage | Consume completed v2 patterns after B6 gate |
| `src/features/auth/pages/LoginCallbackPage.tsx` | page-composition | deferred-page-migration | page migration epic | LoginCallbackPage | Consume completed v2 patterns after B6 gate |
| `src/features/auth/pages/LoginPage.tsx` | page-composition | deferred-page-migration | page migration epic | LoginPage | Consume completed v2 patterns after B6 gate |
| `src/features/auth/pages/RegisterPage.tsx` | page-composition | deferred-page-migration | page migration epic | RegisterPage | Consume completed v2 patterns after B6 gate |
| `src/features/auth/pages/ResetPasswordPage.tsx` | page-composition | deferred-page-migration | page migration epic | ResetPasswordPage | Consume completed v2 patterns after B6 gate |
| `src/features/auth/pages/VerifyEmailPage.tsx` | page-composition | deferred-page-migration | page migration epic | VerifyEmailPage | Consume completed v2 patterns after B6 gate |
| `src/features/author-analytics/components/AnalyticsDateRangeFilter.tsx` | data-admin-pattern | adapt | B5 / horizon-blog-dsv2.6.3 | v2 AnalyticsDateRangeFilter pattern | Loading/empty/error/partial/denied; responsive overflow |
| `src/features/author-analytics/components/AnalyticsInsightList.tsx` | data-admin-pattern | adapt | B5 / horizon-blog-dsv2.6.3 | v2 AnalyticsInsightList pattern | Loading/empty/error/partial/denied; responsive overflow |
| `src/features/author-analytics/components/AnalyticsMetricCard.tsx` | data-admin-pattern | adapt | B5 / horizon-blog-dsv2.6.3 | v2 AnalyticsMetricCard pattern | Loading/empty/error/partial/denied; responsive overflow |
| `src/features/author-analytics/components/AnalyticsReactionTrend.tsx` | data-admin-pattern | adapt | B5 / horizon-blog-dsv2.6.3 | v2 AnalyticsReactionTrend pattern | Loading/empty/error/partial/denied; responsive overflow |
| `src/features/author-analytics/components/AnalyticsTrendChart.tsx` | data-admin-pattern | adapt | B5 / horizon-blog-dsv2.6.3 | v2 AnalyticsTrendChart pattern | Loading/empty/error/partial/denied; responsive overflow |
| `src/features/author-analytics/components/BlogMetricsTable.tsx` | data-admin-pattern | adapt | B5 / horizon-blog-dsv2.6.3 | v2 BlogMetricsTable pattern | Loading/empty/error/partial/denied; responsive overflow |
| `src/features/author-analytics/components/LinkPerformanceTable.tsx` | data-admin-pattern | adapt | B5 / horizon-blog-dsv2.6.3 | v2 LinkPerformanceTable pattern | Loading/empty/error/partial/denied; responsive overflow |
| `src/features/author-analytics/components/ReaderProgressFunnel.tsx` | data-admin-pattern | adapt | B5 / horizon-blog-dsv2.6.3 | v2 ReaderProgressFunnel pattern | Loading/empty/error/partial/denied; responsive overflow |
| `src/features/author-analytics/components/TrafficSourceBreakdown.tsx` | data-admin-pattern | adapt | B5 / horizon-blog-dsv2.6.3 | v2 TrafficSourceBreakdown pattern | Loading/empty/error/partial/denied; responsive overflow |
| `src/features/author-analytics/pages/AnalyticsOverviewPage.tsx` | page-composition | deferred-page-migration | page migration epic | AnalyticsOverviewPage | Consume completed v2 patterns after B6 gate |
| `src/features/author-analytics/pages/BlogAnalyticsPage.tsx` | page-composition | deferred-page-migration | page migration epic | BlogAnalyticsPage | Consume completed v2 patterns after B6 gate |
| `src/features/authors/components/AuthorArchiveHero.tsx` | post-pattern | adapt | B4 / horizon-blog-dsv2.5.1 | v2 AuthorArchiveHero pattern | Long content; media states; hover/focus/touch; responsive themes |
| `src/features/authors/components/AuthorArchiveStoryListItem.tsx` | post-pattern | adapt | B4 / horizon-blog-dsv2.5.1 | v2 AuthorArchiveStoryListItem pattern | Long content; media states; hover/focus/touch; responsive themes |
| `src/features/authors/pages/AuthorArchivePage.tsx` | page-composition | deferred-page-migration | page migration epic | AuthorArchivePage | Consume completed v2 patterns after B6 gate |
| `src/features/blog/components/BlogArchiveHero.tsx` | post-pattern | adapt | B4 / horizon-blog-dsv2.5.1 | v2 BlogArchiveHero pattern | Long content; media states; hover/focus/touch; responsive themes |
| `src/features/blog/components/BlogFilterToolbar.tsx` | post-pattern | adapt | B4 / horizon-blog-dsv2.5.1 | v2 BlogFilterToolbar pattern | Long content; media states; hover/focus/touch; responsive themes |
| `src/features/blog/components/BlogReaderFrame.tsx` | post-pattern | adapt | B4 / horizon-blog-dsv2.5.1 | ReaderFrame | Long content; media states; hover/focus/touch; responsive themes |
| `src/features/blog/components/EditorialCard.tsx` | post-pattern | adapt | B4 / horizon-blog-dsv2.5.1 | PostCard and PostRow | Long content; media states; hover/focus/touch; responsive themes |
| `src/features/blog/components/FeaturedStory.tsx` | post-pattern | adapt | B4 / horizon-blog-dsv2.5.1 | FeaturedStory | Long content; media states; hover/focus/touch; responsive themes |
| `src/features/blog/components/RelatedPosts.tsx` | post-pattern | adapt | B4 / horizon-blog-dsv2.5.1 | v2 RelatedPosts pattern | Long content; media states; hover/focus/touch; responsive themes |
| `src/features/blog/components/TableOfContents.tsx` | post-pattern | adapt | B4 / horizon-blog-dsv2.5.1 | TableOfContents | Long content; media states; hover/focus/touch; responsive themes |
| `src/features/blog/pages/BlogDetailPage.tsx` | page-composition | deferred-page-migration | page migration epic | BlogDetailPage | Consume completed v2 patterns after B6 gate |
| `src/features/blog/pages/BlogPage.tsx` | page-composition | deferred-page-migration | page migration epic | BlogPage | Consume completed v2 patterns after B6 gate |
| `src/features/comments/components/CommentActions.tsx` | reader-conversation-pattern | adapt | B4 / horizon-blog-dsv2.5.3 | v2 CommentActions pattern | Success/error; auth state; focus/touch; reduced motion |
| `src/features/comments/components/CommentComposer.tsx` | reader-conversation-pattern | adapt | B4 / horizon-blog-dsv2.5.3 | v2 CommentComposer pattern | Success/error; auth state; focus/touch; reduced motion |
| `src/features/comments/components/CommentItem.tsx` | reader-conversation-pattern | adapt | B4 / horizon-blog-dsv2.5.3 | v2 CommentItem pattern | Success/error; auth state; focus/touch; reduced motion |
| `src/features/comments/components/CommentSection.tsx` | reader-conversation-pattern | adapt | B4 / horizon-blog-dsv2.5.3 | v2 CommentSection pattern | Success/error; auth state; focus/touch; reduced motion |
| `src/features/comments/components/CommentThread.tsx` | reader-conversation-pattern | adapt | B4 / horizon-blog-dsv2.5.3 | v2 CommentThread pattern | Success/error; auth state; focus/touch; reduced motion |
| `src/features/contact/components/ContactInfoCard.tsx` | account-identity-pattern | adapt | B5 / horizon-blog-dsv2.6.1 | v2 ContactInfoCard pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/contact/components/ContactPromptCard.tsx` | account-identity-pattern | adapt | B5 / horizon-blog-dsv2.6.1 | v2 ContactPromptCard pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/contact/pages/ContactPage.tsx` | page-composition | deferred-page-migration | page migration epic | ContactPage | Consume completed v2 patterns after B6 gate |
| `src/features/cv/components/CvExperienceCard.tsx` | account-identity-pattern | adapt | B5 / horizon-blog-dsv2.6.1 | v2 CvExperienceCard pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/cv/components/CvProjectEntry.tsx` | account-identity-pattern | adapt | B5 / horizon-blog-dsv2.6.1 | v2 CvProjectEntry pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/cv/pages/CvPage.tsx` | page-composition | deferred-page-migration | page migration epic | CvPage | Consume completed v2 patterns after B6 gate |
| `src/features/editor/components/ActiveScheduleNotice.tsx` | editor-publishing-pattern | adapt | B5 / horizon-blog-dsv2.6.2 | v2 ActiveScheduleNotice pattern | Autosave/upload/publish/schedule/recovery/permission states |
| `src/features/editor/components/EditorMetaBar.tsx` | editor-publishing-pattern | adapt | B5 / horizon-blog-dsv2.6.2 | v2 EditorMetaBar pattern | Autosave/upload/publish/schedule/recovery/permission states |
| `src/features/editor/components/EditorTagField.tsx` | editor-publishing-pattern | adapt | B5 / horizon-blog-dsv2.6.2 | v2 EditorTagField pattern | Autosave/upload/publish/schedule/recovery/permission states |
| `src/features/editor/components/EditorWorkspace.tsx` | editor-publishing-pattern | adapt | B5 / horizon-blog-dsv2.6.2 | v2 EditorWorkspace pattern | Autosave/upload/publish/schedule/recovery/permission states |
| `src/features/editor/components/PublishBlogPreviewCard.tsx` | editor-publishing-pattern | adapt | B5 / horizon-blog-dsv2.6.2 | v2 PublishBlogPreviewCard pattern | Autosave/upload/publish/schedule/recovery/permission states |
| `src/features/editor/pages/BlogEditorPage.tsx` | page-composition | deferred-page-migration | page migration epic | BlogEditorPage | Consume completed v2 patterns after B6 gate |
| `src/features/editor/pages/PublishBlogPage.tsx` | page-composition | deferred-page-migration | page migration epic | PublishBlogPage | Consume completed v2 patterns after B6 gate |
| `src/features/home/components/HeroArchivePreview.tsx` | post-pattern | adapt | B4 / horizon-blog-dsv2.5.1 | SignatureStory | Long content; media states; hover/focus/touch; responsive themes |
| `src/features/home/components/PromiseCard.tsx` | post-pattern | adapt | B4 / horizon-blog-dsv2.5.1 | v2 PromiseCard pattern | Long content; media states; hover/focus/touch; responsive themes |
| `src/features/home/components/StoryCard.tsx` | post-pattern | adapt | B4 / horizon-blog-dsv2.5.1 | PostCard | Long content; media states; hover/focus/touch; responsive themes |
| `src/features/home/pages/HomePage.tsx` | page-composition | deferred-page-migration | page migration epic | HomePage | Consume completed v2 patterns after B6 gate |
| `src/features/media/components/DefaultPostCover.tsx` | media-pattern | adapt | B3 / horizon-blog-dsv2.4.3 | MediaPlaceholder | Loading/ready/absent/error/retry; stable ratio; alt semantics |
| `src/features/oauth/pages/McpAuthorizePage.tsx` | page-composition | deferred-page-migration | page migration epic | McpAuthorizePage | Consume completed v2 patterns after B6 gate |
| `src/features/profile/components/AvatarPreviewModal.tsx` | account-identity-pattern | adapt | B5 / horizon-blog-dsv2.6.1 | v2 AvatarPreviewModal pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/profile/components/EditProfileModal.tsx` | account-identity-pattern | adapt | B5 / horizon-blog-dsv2.6.1 | v2 EditProfileModal pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/profile/components/ProfileBlogGrid.tsx` | account-identity-pattern | adapt | B5 / horizon-blog-dsv2.6.1 | v2 ProfileBlogGrid pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/profile/components/ProfileHeaderCard.tsx` | account-identity-pattern | adapt | B5 / horizon-blog-dsv2.6.1 | v2 ProfileHeaderCard pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/profile/components/ProfilePostsSection.tsx` | account-identity-pattern | adapt | B5 / horizon-blog-dsv2.6.1 | v2 ProfilePostsSection pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/profile/components/ProfileScheduledList.tsx` | account-identity-pattern | adapt | B5 / horizon-blog-dsv2.6.1 | v2 ProfileScheduledList pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/profile/components/ProfileScheduledRow.tsx` | account-identity-pattern | adapt | B5 / horizon-blog-dsv2.6.1 | v2 ProfileScheduledRow pattern | Validation/identity/media; responsive themes; permission states |
| `src/features/profile/pages/ProfileBlogDetailPage.tsx` | page-composition | deferred-page-migration | page migration epic | ProfileBlogDetailPage | Consume completed v2 patterns after B6 gate |
| `src/features/reader-interactions/components/HeartButton.tsx` | reader-conversation-pattern | adapt | B4 / horizon-blog-dsv2.5.3 | ReactionButton | Success/error; auth state; focus/touch; reduced motion |
| `src/features/reader-interactions/components/ReaderInteractionBar.tsx` | reader-conversation-pattern | adapt | B4 / horizon-blog-dsv2.5.3 | ReaderFeedbackBar | Success/error; auth state; focus/touch; reduced motion |
| `src/features/reader-interactions/components/ShareButton.tsx` | reader-conversation-pattern | adapt | B4 / horizon-blog-dsv2.5.3 | ShareAction | Success/error; auth state; focus/touch; reduced motion |
| `src/features/series/components/SeriesCard.tsx` | series-pattern | adapt | B4 / horizon-blog-dsv2.5.2 | SeriesCard | Book identity; ordered parts; rail controls; async states |
| `src/features/series/components/SeriesContextCard.tsx` | series-pattern | adapt | B4 / horizon-blog-dsv2.5.2 | SeriesContext | Book identity; ordered parts; rail controls; async states |
| `src/features/series/components/SeriesManager.tsx` | series-pattern | adapt | B5 / horizon-blog-dsv2.6.2 | SeriesManagerForm, composing ManageSeriesItem rows | Book identity; ordered parts; async states. Identity fields, add-a-blog, explicit save and server-owned delete; idle, dirty, saving, saved, save-failed, deleting, delete-denied, empty, loading and permission-loss states resolved in `seriesManager.logic.ts` and tested in `seriesManager.test.ts`; paint and focus behaviour belong to the B6 gallery |
| `src/features/series/components/SeriesPartList.tsx` | series-pattern | adapt | B4 / horizon-blog-dsv2.5.2 | SeriesPartList | Book identity; ordered parts; rail controls; async states |
| `src/features/series/components/SeriesPostContext.tsx` | series-pattern | adapt | B4 / horizon-blog-dsv2.5.2 | v2 SeriesPostContext pattern | Book identity; ordered parts; rail controls; async states |
| `src/features/series/components/SeriesShelf.tsx` | series-pattern | adapt | B4 / horizon-blog-dsv2.5.2 | SeriesRail | Book identity; ordered parts; rail controls; async states |
| `src/features/series/pages/ManageSeriesPage.tsx` | page-composition | deferred-page-migration | page migration epic | ManageSeriesPage | Consume completed v2 patterns after B6 gate |
| `src/features/series/pages/SeriesIndexPage.tsx` | page-composition | deferred-page-migration | page migration epic | SeriesIndexPage | Consume completed v2 patterns after B6 gate |
| `src/features/series/pages/SeriesPage.tsx` | page-composition | deferred-page-migration | page migration epic | SeriesPage | Consume completed v2 patterns after B6 gate |
| `src/main.tsx` | app-composition | adapt | B1 / horizon-blog-dsv2.2.2 | App bootstrap and theme provider | Chakra v2 theme mount, colour-mode script, local font loading, reduced motion |
| `src/pages/About.tsx` | page-composition | deferred-page-migration | page migration epic | About | Consume completed v2 patterns after B6 gate |
| `src/pages/Analytics.tsx` | page-composition | deferred-page-migration | page migration epic | Analytics | Consume completed v2 patterns after B6 gate |
| `src/pages/AuthorArchive.tsx` | page-composition | deferred-page-migration | page migration epic | AuthorArchive | Consume completed v2 patterns after B6 gate |
| `src/pages/Blog.tsx` | page-composition | deferred-page-migration | page migration epic | Blog | Consume completed v2 patterns after B6 gate |
| `src/pages/BlogAnalytics.tsx` | page-composition | deferred-page-migration | page migration epic | BlogAnalytics | Consume completed v2 patterns after B6 gate |
| `src/pages/BlogDetail.tsx` | page-composition | deferred-page-migration | page migration epic | BlogDetail | Consume completed v2 patterns after B6 gate |
| `src/pages/BlogEditor.tsx` | page-composition | deferred-page-migration | page migration epic | BlogEditor | Consume completed v2 patterns after B6 gate |
| `src/pages/Contact.tsx` | page-composition | deferred-page-migration | page migration epic | Contact | Consume completed v2 patterns after B6 gate |
| `src/pages/Cv.tsx` | page-composition | deferred-page-migration | page migration epic | Cv | Consume completed v2 patterns after B6 gate |
| `src/pages/ForgotPassword.tsx` | page-composition | deferred-page-migration | page migration epic | ForgotPassword | Consume completed v2 patterns after B6 gate |
| `src/pages/Home.tsx` | page-composition | deferred-page-migration | page migration epic | Home | Consume completed v2 patterns after B6 gate |
| `src/pages/Login.tsx` | page-composition | deferred-page-migration | page migration epic | Login | Consume completed v2 patterns after B6 gate |
| `src/pages/ManageSeries.tsx` | page-composition | deferred-page-migration | page migration epic | ManageSeries | Consume completed v2 patterns after B6 gate |
| `src/pages/OAuthAuthorize.tsx` | page-composition | deferred-page-migration | page migration epic | OAuthAuthorize | Consume completed v2 patterns after B6 gate |
| `src/pages/Profile.tsx` | page-composition | deferred-page-migration | page migration epic | Profile | Consume completed v2 patterns after B6 gate |
| `src/pages/ProfileBlogDetail.tsx` | page-composition | deferred-page-migration | page migration epic | ProfileBlogDetail | Consume completed v2 patterns after B6 gate |
| `src/pages/PublishBlog.tsx` | page-composition | deferred-page-migration | page migration epic | PublishBlog | Consume completed v2 patterns after B6 gate |
| `src/pages/Register.tsx` | page-composition | deferred-page-migration | page migration epic | Register | Consume completed v2 patterns after B6 gate |
| `src/pages/ResetPassword.tsx` | page-composition | deferred-page-migration | page migration epic | ResetPassword | Consume completed v2 patterns after B6 gate |
| `src/pages/Series.tsx` | page-composition | deferred-page-migration | page migration epic | Series | Consume completed v2 patterns after B6 gate |
| `src/pages/SeriesIndex.tsx` | page-composition | deferred-page-migration | page migration epic | SeriesIndex | Consume completed v2 patterns after B6 gate |
| `src/pages/VerifyEmail.tsx` | page-composition | deferred-page-migration | page migration epic | VerifyEmail | Consume completed v2 patterns after B6 gate |

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
