# Analytics monitoring report

Source: user selected compact report mockup and explicitly corrected Views to counts only; invoked orchestrate-epic on 2026-10-08. See approved-mockup.png. Visual approval is recorded; written implementation plans are agent-reviewed, not separately human-approved.

Goal: monitor overall readership, find a blog across all result pages, and inspect retention/sources/actions without switching diagnostic tabs.

Scope: frontend only, existing APIs, validated local changes. No dependencies, backend changes, commits, pushes, merges or deployment. Existing auth, permission, UTC range, freshness, errors/retry, pagination and deep links remain supported. Actual trend comes from the API, never mock chart values.

Overview: compact title/date/summary; numbered Audience over time daily views chart with numeric axis; numbered Blog performance searchable sortable report with linked titles, numeric Views, bounded 0-100% Completion and active duration. No progress meter for unbounded counts. Search covers all API pages; fetch all pages using existing endpoint and fail visibly rather than present partial results as complete.

Detail: compact title/date/summary, numbered retention with factual early-drop observation and count-based curve; source counts with share-of-observed-source-views bars; compact action totals and expandable link/reaction/insight evidence. Never present attribution quality zeros as verified quality: omit source completion/time columns without changing underlying API data. Do not infer why a reader left or imply a closed session from progress alone. Use 'did not reach' wording.

Low samples: show the actual view denominator rather than an arbitrary significance threshold or invented completed count. Missing stages produce no inferred observation. Preserve supplied backend insights with sample size/evidence in expandable details.

Responsive: both themes, 375px and desktop, semantic headings, labels and keyboard controls, reduced motion. Use feature-owned components and existing design-system tokens. No new route or global redesign.

Acceptance is mapped in each ticket spec/plan. Dependencies are source-inferred: report data/controls precede overview; shared sections precede detail. One bundle avoids same-feature file collisions. Critical path M1 -> M2 -> M3 -> combined validation.
