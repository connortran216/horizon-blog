# Tasks

- [x] Regression checks for overlay positioning and dismissal.
- [x] Fix panel positioning and outside-click behavior.
- [x] Validate layout stability, keyboard, themes and viewport fit.

Validation: 19 Navbar tests pass; both new regression tests failed before the fix. ESLint, TypeScript and production build pass. Browser at 375x812: header stays 65px, heading stays y=157, scrollY stays 0 when opening. Scrolled light-theme page also keeps position; short viewport panel scrolls internally.
