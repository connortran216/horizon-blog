# Incremental release plan

User approved incremental delivery 2026-09-08. R1 combines foundations and Home/menu in the existing B1 worktree to avoid uncommitted dependency loss. Old tickets are retained; release grouping supersedes original serial B1-B6 delivery grouping.

R1: horizon-blog-y2e.1.1, horizon-blog-y2e.1.2, horizon-blog-y2e.2.1
R2: horizon-blog-y2e.2.2, horizon-blog-y2e.5.2
R3: horizon-blog-y2e.3.1, horizon-blog-y2e.3.2
R4: horizon-blog-y2e.4.1, horizon-blog-y2e.4.2
R5: horizon-blog-y2e.5.1
R6: horizon-blog-y2e.6.1, horizon-blog-y2e.6.2

R1 scope: route-based theme selection enables Signal only on `/`; all other routes retain the exact prior theme. Compact shared navigation keeps auth, logout and editor publish behavior. Home reuses getPublishedPosts, media resolution and public Series services; six unique latest entries exclude Signature. Loading, empty, error/retry required. Existing uploaded covers retain aspect and use responsive media attributes.

Checks: route-theme isolation; partition deduplication/empty/short input; lint/types/full tests/build; browser desktop/mobile light/dark and old-route regression. No dev/backend server is launched against repo instructions; built static preview is permitted for visual validation. Live API failures must be disclosed rather than replaced by production fixtures.
