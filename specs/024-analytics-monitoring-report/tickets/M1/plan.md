# M1: Report data and controls implementation plan

Spec: spec.md. Architecture: existing repository/service/hook/component boundary. Stack: React18, TypeScript, Chakra, v2 semantic primitives, Vitest. Execute inline under orchestrate-epic with writing-plans/executing-plans discipline.

## Files
- src/features/author-analytics/author-analytics.service.ts
- src/features/author-analytics/useBlogMetrics.ts
- src/features/author-analytics/author-analytics.report.ts
- src/features/author-analytics/components/AnalyticsReportSection.tsx
- src/features/author-analytics/components/AnalyticsReportSummary.tsx
- src/features/author-analytics/components/AnalyticsDateRangeFilter.tsx

## Ordered checklist
- [x] Write targeted behavioral tests covering acceptance criteria and run red.
- [x] Implement mapped files in dependency order without altering backend contracts.
- [x] Run `rtk yarn test src/features/author-analytics` and inspect output.
- [x] Run `rtk yarn tsc --noEmit` and targeted Prettier; fix any regressions.
- [x] Review actual diff against each acceptance criterion and record evidence.

## Coverage
- AC1: Fetch all metric pages with cancellation, no duplicate rows or silently partial failures. Verify through targeted tests and rendered report review.
- AC2: Filter titles across pages and sort before paginating; invalid URL query values have safe defaults. Verify through targeted tests and rendered report review.
- AC3: Use compact keyboard-accessible UTC range disclosure and report section primitives. Verify through targeted tests and rendered report review.

Shared data helpers belong to M1. M2 owns overview controls; M3 owns detail, design docs, combined validation and Storybook examples. No commits authorized.
