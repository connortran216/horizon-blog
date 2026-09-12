# Horizon redesign: approved design tokens v0.2

Decision date: 2026-09-05.
Scope: Horizon Blog UI/UX redesign, frontend project /Users/trantuancanh/Personal/work/horizon-blog/horizon-blog.
Status: User approved recording this direction and all tokens in Beads after viewing the revised light/dark mockups. This is a design baseline; not implemented in production, not a complete component design system, and not a claim that all product flows have been designed or tested.

## Approved direction and durable corrections
- Selected reference: the SECOND displayed image of the fresh Terra / Signal / Nocturne ideation set: SIGNAL, cobalt with restrained lime.
- User rejected prior exploration for keeping old design tokens; do not treat the old slate-blue palette or old geometry/font rules as fixed constraints for this authorized redesign.
- User then said all directions were too rigid/lifeless and explicitly required dark mode.
- Approved evolution: retain Signal identity, soften typography and shapes, introduce restrained layered surfaces and meaningful tactile editorial illustration.
- Preserve personal technical-blog purpose and actual capabilities. Do not turn public reading into a dashboard, course system or marketing feature inventory.
- Same layout, hierarchy and core content in light and dark modes. Dark mode is designed with semantic roles, not mechanical inversion.
- Exact token values below are authoritative for implementation; generated raster images are visual references and are not pixel-accurate token or font specifications.
- Semantic token names may stay stable while their values and usage change. A redesign must materially reconsider palette, type, geometry, spacing, depth, illustration and motion, rather than just move sections.
- Motion communicates interaction/state; no continuous distracting motion in article prose. Liveliness should come from illustration, meaningful emphasis, soft interaction feedback and spacing.

## Color tokens
| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| bg.page | #F5F7FC | #0D1220 | Page canvas |
| bg.surface | #FFFFFF | #151D2E | Cards and content surfaces |
| bg.subtle | #EDF1FA | #1A2438 | Secondary inset and gentle hover surface |
| bg.elevated | #FFFFFF | #1C2740 | Menus, popovers and modals |
| text.primary | #17213A | #E9EEFA | Headings and primary content |
| text.secondary | #53617A | #A7B4CC | Descriptions and supporting text |
| text.muted | #5D6B82 | #8B9AB5 | Dates, read time and captions |
| action.primary | #3158D4 | #8AA4FF | Primary action fill |
| action.hover | #2648B6 | #A4B8FF | Primary action hover fill |
| text.onAction | #FFFFFF | #101A35 | Text and icons on primary actions |
| link.default | #294BC4 | #A9BAFF | Inline content links |
| accent.lime | #DDF89A | #C5EC83 | Restrained brand emphasis |
| text.onAccent | #263A12 | #1C2C0C | Text on lime accent |
| border.subtle | #DCE3EF | #2B3852 | Quiet separators |
| border.control | #7E8BA5 | #697B9D | Visible input/control boundary |
| focus.ring | #3158D4 | #ABC0FF | Keyboard focus |
| status.success | #206B43 | #80D7A1 | Successful save/operation |
| status.warning | #8A5300 | #F1C36C | Warning |
| status.danger | #B42336 | #FF929F | Errors and dangerous actions |

## Typography, layout, spacing, shape and focus
Type sizes are font-size / line-height. Specific mobile/desktop breakpoints are not yet approved; preserve these intended sizes and define responsive interpolation during prototype work.
| Token | Value | Role |
| --- | --- | --- |
| font.heading | Be Vietnam Pro; weight 600-700 | Less heavy than the initial Signal mockup; Vietnamese support required |
| font.body | Be Vietnam Pro; weight 400 | Consistent readable UI/prose |
| font.code | ui-monospace, SFMono-Regular, Menlo, monospace | Technical code content |
| type.display | Mobile 40px/48px; desktop 64px/72px | Font size / line height |
| type.pageTitle | Mobile 32px/40px; desktop 44px/54px | Page and article headings |
| type.cardTitle | 22px/30px; weight 600 | Article previews |
| type.body | 16px/26px | General UI |
| type.prose | Mobile 18px/30px; desktop 19px/32px | Long-form reader |
| type.meta | 13px/20px; weight 400-500 | Metadata |
| layout.prose | max-width: 68ch | Comfortable line length |
| space.scale | 4, 8, 12, 16, 24, 32, 48, 64, 96px | Shared spacing scale |
| space.section | Mobile 48px; desktop 80px | Section rhythm; intentional 80px exception to shared scale |
| radius.control | 12px | Buttons and inputs |
| radius.card | 20px | Cards and preview images |
| radius.feature | 28px | Featured illustration surfaces |
| radius.tag | 999px | Tags/chips only |
| focus.width | 2px | Visible focus outline |
| focus.offset | 3px | Space between focus outline and control |

## Depth and motion
| Token | Value | Role |
| --- | --- | --- |
| shadow.card.light | 0 8px 24px rgb(23 33 58 / 6%) | Subtle depth where card emphasis is useful |
| shadow.card.dark | 0 8px 24px rgb(0 0 0 / 20%) | Pair with lighter surface tone |
| motion.fast | 120ms | Button/icon colors and focus feedback |
| motion.normal | 200ms | Hover, menus and state transitions |
| motion.enter | 320ms | Initial appearance of prominent content |
| motion.ease | cubic-bezier(0.22, 1, 0.36, 1) | Soft deceleration |
| motion.hoverLift | -2px | Transform only; do not change document layout |
| motion.revealDistance | 8px | Entry translation |
| motion.reduced | Remove translation; immediate feedback | Honor prefers-reduced-motion; long-form reader is nearly static |

## Color verification already performed
- Calculated sRGB contrast for text.primary, text.secondary, text.muted, link.default, status.success, status.warning, status.danger against bg.page, bg.surface, bg.elevated and bg.subtle in both modes: minimum 4.77:1.
- Primary action label/fill: light 6.04:1; dark 7.23:1. Dark primary buttons use dark text, not white.
- Control borders against those four surfaces: minimum light 3.03:1, dark 3.48:1.
- This is arithmetic color validation only. Rendered UI, focus visibility, disabled/error states, font loading, mobile layouts and reduced-motion behavior still require prototype QA.

## Exact visual reference mapping
Original selected Signal (second image in fresh ideation set):
/Users/trantuancanh/.codex/generated_images/01a0711a-c6bc-7783-95ec-7c8d1217ee39/exec-2a56803e-4987-4f7a-ad98-a8a4dc2d5b43.png

Latest revised LIGHT mockup (displayed before DARK; same paired concept):
/Users/trantuancanh/.codex/generated_images/01a0711a-c6bc-7783-95ec-7c8d1217ee39/exec-a1bd0db3-8024-4fe9-9daf-eaf382805376.png

Latest revised DARK mockup:
/Users/trantuancanh/.codex/generated_images/01a0711a-c6bc-7783-95ec-7c8d1217ee39/exec-e7333395-dc69-42ed-89cb-169b0efe921a.png

References are static homepage mockups only; they do not demonstrate animation, functioning navigation, responsive behavior, or a finished whole-product redesign. Copy selected assets into the prototype workspace before code references them.

## Next work and remaining design decisions
1. Ground a product-wide screen/flow map in current routes: public Home/Blog/search/Reader/Series/author/About/Contact/CV; author editor/preview/publish/schedule/profile/series management/analytics; auth/account/access management and error/empty/loading states.
2. Build an isolated interactive public-reading prototype first: Home -> Blog/search -> Reader -> Series, desktop and mobile, with functioning light/dark switch, navigation, search/filter mock data, TOC and lightweight interactions.
3. Build a component showcase against these tokens: buttons, links, inputs, tags, cards, menus, modal, toast, skeleton, prose, code, tables and diagram containers. Document default/hover/focus/active/disabled/loading/error states. Do not invent unapproved exact values for missing states.
4. Validate rendered light/dark and mobile, keyboard/focus, color contrast, Vietnamese font rendering, long headings, reduced motion and reading content (code/tables/diagrams).
5. Extend the agreed system to authoring, management and auth screens; then formalize full design-system documentation and production migration stories.

Implementation guardrails: existing production React/TypeScript/Chakra architecture and real API/product behavior remain authoritative. No unapproved production dependencies/architecture changes. Repo requires Spec Kit + Superpowers planning artifacts before repo implementation; Beads memory does not replace these. Existing design-system/MASTER.md and theme code have not been rewritten by this persistence request. Do not commit/push Git or Dolt unless explicitly requested.
