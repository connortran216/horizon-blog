# Design QA: Profile Editorial Workspace

## Source and implementation

- approved reference: `specs/022-profile-editorial-workspace/assets/profile-editorial-workspace-reference.png`
- implementation preview: `http://127.0.0.1:4174/ui-kit.html?build=profile-final6#gallery-entry-ProfileHeader`
- behavior contract: `specs/022-profile-editorial-workspace/spec.md`
- production composition: `src/features/profile/components/ProfileHeaderCard.tsx`

## Visual comparison

- the workspace matches the selected split hierarchy: a 30/70 identity rail and writing region on desktop, with the portrait and identity content moving ahead of the writing context on narrow screens
- the portrait is a large square frame with the `Change picture` action clipped inside its lower edge; the overlay keeps a light foreground over the scrim in both themes
- `Connor Tran` uses the display face, with the small `Edit profile` text action directly beneath it
- `Write a blog` is the only dominant CTA in the header and retains its permission gate
- the biography remains the visual focus of the right region and is constrained to a comfortable measure
- Blogs and Drafts are unboxed typographic facts separated by rules, not KPI cards
- the default/public `ProfileHeader` and compact `AvatarEditor` states remain visually unchanged

## Responsive and theme checks

Checked at 320, 375, 768, 1024, and 1440 CSS pixels, with focused comparison in light and dark themes.

- 320/375: one-column reading order is portrait, portrait actions, name, edit action, metadata, workspace label, writing CTA, biography, then stats; copy wraps within the component boundary
- 768: the one-column composition remains readable with the full-size portrait and comfortable text measure
- 1024/1440: the desktop split activates, the identity rail remains subordinate, and the biography and stats retain their hierarchy
- both themes preserve the selected blue action, lime accent, readable portrait overlay, surface separation, and visible focus treatment
- the gallery shell itself adds review padding around the component; the production pattern is explicitly constrained to `width: 100%`, `max-width: 100%`, and zero minimum width so its content does not create horizontal overflow

## Interaction and accessibility checks

- the workspace has one `h1`; Blogs and Drafts remain semantic `dt`/`dd` pairs
- the avatar chooser remains a named file input driven by a visible button and keeps uploading, error, retry, and disabled behavior
- the `Edit profile` button still opens the existing editor callback, and `View full size` still uses the existing preview callback
- keyboard focus from `Edit profile` advances to the email link, followed by the remaining metadata and writing action in DOM order
- protected `/profile/:username` still redirects an unauthenticated visitor to login
- no browser console errors or warnings were observed during desktop dark, desktop light, or mobile checks

## Automated gates

- targeted profile and account-pattern tests: 9 files, 122 tests passed
- TypeScript, ESLint, Prettier, design-system coverage, and production build: passed
- design-system coverage: 126 legacy files, 126 ledger rows, 107/107 exports represented in the gallery
- the full Vitest assertion set passed, but one broad run reported 10 fork-worker startup timeouts from local pool saturation; the targeted changed surface is clean

## Final result

final result: passed
