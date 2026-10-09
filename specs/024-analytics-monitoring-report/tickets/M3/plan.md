# M3: Blog report and verification implementation plan

Spec: spec.md. Architecture: existing repository/service/hook/component boundary. Stack: React18, TypeScript, Chakra, v2 semantic primitives, Vitest. Execute inline under orchestrate-epic with writing-plans/executing-plans discipline.

## Files
- src/features/author-analytics/pages/BlogAnalyticsPage.tsx
- src/features/author-analytics/components/BlogReadingReport.tsx
- src/features/author-analytics/components/ReadingRetentionChart.tsx
- design-system/pages/analytics.md

## Ordered checklist
- [x] Write targeted behavioral tests covering acceptance criteria and run red.
- [x] Implement mapped files in dependency order without altering backend contracts.
- [x] Run `rtk yarn test src/features/author-analytics` and inspect output.
- [x] Run `rtk yarn tsc --noEmit` and targeted Prettier; fix any regressions.
- [x] Review actual diff against each acceptance criterion and record evidence.

## Coverage
- AC1: All retention/source/action sections visible without question tabs; insight details retained. Verify through targeted tests and rendered report review.
- AC2: Missing/zero/partial stages never fabricate causal conclusions or ratios. Verify through targeted tests and rendered report review.
- AC3: Source bars are labeled share of source views; source quality is not falsely represented. Verify through targeted tests and rendered report review.
- AC4: Targeted tests, TypeScript, lint, build and rendered desktop/mobile/theme checks are recorded. Verify through targeted tests and rendered report review.

Shared data helpers belong to M1. M2 owns overview controls; M3 owns detail, design docs, combined validation and Storybook examples. No commits authorized.
