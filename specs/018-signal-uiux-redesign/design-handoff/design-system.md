# Horizon design system — prototype v0.2

The approved Signal direction uses cobalt actions, restrained lime emphasis, warm Vietnamese typography, soft card geometry and technical editorial imagery. See the exact baseline in `approved-tokens.md` and `tokens.json` rather than sampling colors from generated images.

## Foundations

All 19 color roles have light and dark values. Page/surface/subtle/elevated surfaces, three foreground levels, primary/hover/on-action, link, lime/on-accent, quiet/control borders, focus and success/warning/danger use semantic roles. The dark primary button uses a dark label for contrast. Be Vietnam Pro 400/600/700 is bundled locally. Code uses system monospace. Reading width is capped at 68ch.

Display is 64/72 desktop and 40/48 mobile. Standard page headings are 44/54 and 32/40. Long article titles use up to 56px desktop leading and 42px mobile leading to accommodate Vietnamese wrapping. Prose is 19/32 and 18/30. Dense workspace labels are intentional smaller component-specific variants of the 16/26 body scale. Core spacing, shape, elevation and motion values remain the approved baseline.

## Components and usage

| Component | Behavior | States |
| --- | --- | --- |
| Button / icon button | One primary action per action group; visible label or accessible name | Default, hover, focus, disabled, loading, danger |
| Link / navigation | Native href with local client navigation, browser back/forward | Default, active, keyboard focus |
| Input / textarea / select | Visible label, optional hint, required and error messages | Default, focus, disabled, invalid |
| Tag / badge | Topic chips versus draft/published/scheduled state | Selected filter, status icon plus text |
| Article row/card | Artwork, title, useful excerpt and metadata | Hover lift, linked title |
| Dialog | Native modal focus containment, Escape and backdrop dismissal | Confirmation, editing, diagram zoom |
| Toast | Polite live feedback; explicit dismiss action | Success/error |
| Prose | Headings, list, quote, links, Markdown tables and code-copy bar | Table/code horizontal scroll inside container |
| Diagram | Mermaid strict mode, paired theme, code toggle and zoom | Rendered, code, failure |
| Feedback | Stable page-sized illustration/icon, description and next action | Empty, loading, error, denied, missing, success |
| Publishing | Explicit preview, mode choice, visible local timezone, confirm step | Draft, scheduled date, published demo, invalid date |

## Responsive behavior

At <=680px the header exposes mobile navigation, grids stack, reading TOC becomes a disclosure, editor split mode stacks, tables scroll within their container, Series selector scrolls locally and analytics metrics use two columns. At 681–1000px the layouts use intermediate two-column grids. Desktop homepage uses a wider editorial frame; reader and workspace retain their own content widths. These breakpoints are prototype decisions rather than previously approved token values.

## Accessibility and motion

Focus uses a 2px ring with 3px offset. Status messages include text and icons, not color alone. Form controls have visible labels; images that carry content have alt text. Actions are native buttons/links. Entry 320ms, normal 200ms, fast 120ms and a maximum 2px hover lift keep motion quiet. `prefers-reduced-motion` removes animation and translation. No ongoing decorative movement in long-form prose.

The UI Kit demonstrates representative component states. This is a prototype system, not an audited production component package or Figma library. A production migration must preserve API permission checks and the backend model where a scheduled publication is a draft carrying a timestamp, not a new server status enum.

## Review revision — 2026-09-06

The user requested more visible motion and depth on Home and About. These scoped extensions supersede the quiet baseline for those editorial surfaces: layered editorial/hover shadows, 480ms staggered scroll reveals, 7–8s gentle artwork float, and 2px card hover lift. Reduced-motion disables reveals, float and hover transforms. Reading pages retain the original motion behavior.

Navigation uses a 72px-high, max-1120px floating surface with the three links grouped beside the logo; mobile is 64px. Home separates Signature (temporarily the newest available article) from six Latest Writing cards, excluding Signature by ID. Series has its own section. About restores the production founder avatar, biography, CV, GitHub and LinkedIn links.

## Interaction motion study

- Card/Signature to Reader: selected cover uses a 300ms same-document View Transition; unsupported browsers and reduced-motion use immediate navigation. Native links retain modifier-click behavior. API reference: https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition
- Navigation: one sliding indicator, 260ms; directional link icons move 3px on hover.
- Blog: keyed card positions animate for 260ms when filtering/sorting; new cards fade and rise 8px. Topic chips transition over 180ms.
- Theme: semantic surface/text colors transition over 300ms; selected sun/moon rotates 24 degrees, illustration swaps fade in.
- Like: one short icon pop on activation, including a descriptive accessible name and pressed state. Copy: successful clipboard writes show a check and Copied! for 1.8 seconds; failure retains explicit feedback.
- Reader: 3px progress bar tracks prose, and the TOC indicator follows the current heading with aria-current. Scroll work is requestAnimationFrame-coalesced and observes prose resizing.
- Series: connector between numbered parts; hover/focus highlights each number and outgoing connection.
- Signature: cobalt radial light follows mouse position inside the cover on hover-capable devices; disabled for touch/reduced motion.
- Explore prototype exposes a persistent Reduce motion checkbox. This adds to, and never overrides, the OS reduced-motion preference.

No production dependencies were added.
