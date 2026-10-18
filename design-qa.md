# Profile masthead design QA

Source: `/Users/trantuancanh/.codex/generated_images/01a1457e-c476-75d1-ac3f-0fd3b88518f2/exec-35dcc28e-14dd-4f8d-97cd-aa0c2775e1d6.png` (displayed proposal 1).
Implementation: `specs/028-profile-compact-masthead/desktop-dark.png`, `desktop-light.png`, `mobile-dark.png`.
Preview: http://localhost:6007/iframe.html?id=author-profile-header--workspace&viewMode=story&globals=theme:dark

## Comparison
Source 1974x797 image; implementation 1440x900 CSS viewport and pixels (1x). Compare the masthead content region, excluding the existing stats beneath its divider and source presentation margins. Both images opened in the same tool result. Desktop reference hierarchy is preserved: portrait left, write action upper right, name/edit row, biography and metadata. Existing 1120px page frame and production typography constrain sizing. Original user avatar is reused rather than the generated approximation.

- Typography: existing Bitter heading and Public Sans body retained; heading reduced to 48px desktop; biography uses 18/30 prose. Name/edit wrap on mobile.
- Rhythm: compact 180px desktop portrait, 36px column gap and 16px row gaps; stats remain outside redesign scope. Reference's decorative metadata separators omitted as minor polish (P3).
- Colors: semantic dark/light tokens retained, off-white heading and slate copy; primary CTA uses action tokens. Overlay icons use white against dark scrim in both themes.
- Image: real portrait sharp, square crop; camera and expand controls on opposite bottom corners, 44px targets.
- Copy: biography, email/location/site and existing action labels retained. Story counts are fixtures, not account data.
- Focused portrait inspection: initial dark-mode icons were low contrast due to text.onInverse; changed to palette.white and recaptured. Upload control now uses loading semantics (aria-disabled and aria-busy) while remaining focusable; file input disabled during upload.

## Verification
Desktop dark/light screenshots reviewed. Actual viewport checks at 375, 768, 1024 and 1440px show document scrollWidth equal to innerWidth. Mobile dark screenshot reviewed. Full-size modal opens/closes; edit modal opens and saves a changed name in story-local state. Preview source uses existing write route and callback contracts; upload backend and authenticated production route were not exercised. Storybook console has no errors from the profile story; an older unrelated home preview API fetch error exists in tab history.

27 account/profile tests pass; typecheck and lint pass. Existing server-render test warnings concern useLayoutEffect in MemoryRouter.

## Comparison history
1. Initial render: low-contrast portrait icons (P2). Fix: white overlay icon color. Final dark/light captures show legible controls.
2. Final captures: no remaining actionable P0/P1/P2 findings. Desktop composition and mobile wrapping meet selected direction. No new asset generation needed.

## Follow-up polish
P3: reference has metadata separators; implementation keeps the established icon/spacing pattern.

final result: passed
