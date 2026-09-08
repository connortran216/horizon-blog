# R1 Home and menu plan

Spec: [spec.md](spec.md). Source: release-plan.md and approved design-handoff.

- [x] Add `src/theme/route-theme.ts` selector and immutable prior theme; choose theme inside Router in App without changing service/auth behavior.
- [x] Replace Navbar presentation and NavLinkButton markup; retain handlers, canWrite guards, UserMenu; navigation is Blog/Series/About.
- [x] Add home partition utility and loading hook with unmount guard/retry.
- [x] Replace Home/HeroArchivePreview/StoryCard presentation; use existing resolved-cover media and SeriesShelf service. Add optional editorial SeriesShelf variant owned by R1.
- [ ] Test partition and route-theme fallback; run lint/types/tests/build and visual QA.

Local checks and browser sample completed; backend-connected acceptance remains pending. See [R1 report](../../R1-report.md).
