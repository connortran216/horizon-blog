# Epic execution index

Beads owns status. Per-ticket plan checklists record execution.
Release grouping: [release-plan.md](release-plan.md).

| Ticket | Scope | Release |
| --- | --- | --- |
| `horizon-blog-y2e.0.1` | Mount `horizonTheme` app-wide in `src/main.tsx` | M1 |
| `horizon-blog-y2e.5.2` | CV and Contact presentation | M2 |
| `horizon-blog-y2e.2.2` | Founder About and editorial depth | M2 |
| `horizon-blog-y2e.2.1` | Compact navigation and Home Signature | M3 |
| `horizon-blog-y2e.3.1` | Blog and author discovery | M3 |
| `horizon-blog-y2e.3.2` | Public Series journey | M3 |
| `horizon-blog-y2e.4.1` | Reader presentation and feedback | M4 |
| `horizon-blog-y2e.4.2` | Shared navigation and editorial motion | M4 |
| `horizon-blog-y2e.5.1` | Account and OAuth presentation | M5 |
| `horizon-blog-y2e.6.1` | Editor and publishing | M6 |
| `horizon-blog-y2e.6.2` | Profile and Series management | M6 |
| `horizon-blog-y2e.6.3` | Analytics and access management | M7 |
| `horizon-blog-y2e.9.1` | Remove the compatibility layer and legacy theme | M8 |

## Superseded

| Ticket | Superseded by | Why |
| --- | --- | --- |
| `horizon-blog-y2e.1.1` | `dsv2.1.1`, `dsv2.1.2` | Design handoff and canonical documentation were delivered as `DESIGN.md` plus the component inventory |
| `horizon-blog-y2e.1.2` | `dsv2.2.1`, `dsv2.2.2` | Tokens and typography were delivered as the typed token source and the Chakra adapter |

## Notes

- `y2e.2.1` was closed on 2026-09-08 and is reopened: commit `536c262` reverted its code, and the
  navigation and Home patterns it needs now live in the design system, so it is a composition task.
- `y2e.6.2` was split. Profile and Manage Series stay here; analytics and access management moved to
  the new `y2e.6.3`.
- `y2e.6.2` is blocked until the `SeriesManager` gap in `dsv2.5.2` is discharged or descoped.
- The whole epic is blocked until `dsv2.7.3` passes.
