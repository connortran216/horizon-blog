# Deferred Public Hydration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep crawler-readable public HTML usable while deferring the full SPA entry until authentication, meaningful interaction, or a bounded idle timeout.

**Architecture:** Extend SEO document injection with explicit `deferred`, `immediate`, and `omit`
entry modes. The HTTP gateway selects the mode from final route/status policy, while the existing
React entry and application architecture remain unchanged.

**Tech Stack:** Node.js HTTP gateway, Vite production HTML, React 18, Vitest, Lighthouse

---

### Task 1: Document entry modes

**Files:**
- Modify: `scripts/seo/render.test.mjs`
- Modify: `scripts/seo/render.mjs`

- [x] **Step 1: Write failing document-injection tests**

Add assertions that deferred mode removes the original module script, emits one guarded dynamic
import loader with authentication/interaction/timeout triggers, immediate mode preserves the
original module script, and omit mode removes it without a loader.

- [x] **Step 2: Run the focused test and verify RED**

Run: `rtk yarn test scripts/seo/render.test.mjs`

Expected: FAIL because `injectDocument` does not accept an entry mode or create a deferred loader.

- [x] **Step 3: Implement entry transformation**

Extract the same-origin module entry tag from built HTML, serialize its source safely, and transform
it according to the requested mode. Add scoped fallback styles only for deferred documents.

- [x] **Step 4: Run the focused test and verify GREEN**

Run: `rtk yarn test scripts/seo/render.test.mjs`

Expected: all render tests pass.

### Task 2: Select hydration policy in the gateway

**Files:**
- Modify: `scripts/seo/server.test.mjs`
- Modify: `scripts/seo/server.mjs`

- [x] **Step 1: Write failing route-policy tests**

Assert that public content pages use deferred loading, private pages retain the immediate module
entry, and 404/503 pages omit application loading.

- [x] **Step 2: Run the focused test and verify RED**

Run: `rtk yarn test scripts/seo/server.test.mjs`

Expected: FAIL because every HTML response currently preserves the original module script.

- [x] **Step 3: Implement final-status policy selection**

Select `deferred` only for successful public content, `immediate` for successful private pages, and
`omit` for error responses. Pass the mode into `injectDocument`.

- [x] **Step 4: Run the focused test and verify GREEN**

Run: `rtk yarn test scripts/seo/server.test.mjs`

Expected: all gateway tests pass.

### Task 3: Verify the production behavior

**Files:**
- Modify: `specs/007-seo-rendering-gateway/tasks.md`

- [x] **Step 1: Run repository quality gates**

Run: `rtk yarn test && rtk yarn lint && rtk yarn tsc --noEmit && rtk yarn format`

Expected: zero failures.

- [x] **Step 2: Build and inspect the entry**

Run: `rtk yarn build`

Expected: production build succeeds and `dist/index.html` contains one Vite module entry.

- [x] **Step 3: Run the production gateway matrix**

Verify public HTML contains semantic fallback content and a deferred loader but no eager module tag;
private HTML contains the eager module tag; 404/503 HTML contains neither.

- [x] **Step 4: Verify runtime takeover**

Use a browser/runtime harness to prove no entry request occurs initially, interaction requests the
entry once, and React replaces the fallback.

- [x] **Step 5: Rerun Lighthouse**

Run mobile Lighthouse against the exact production gateway build and record Performance, FCP, LCP,
CLS, transferred bytes, and unused JavaScript relative to the baseline.

- [x] **Step 6: Record evidence**

Append the final behavior and measured values to
`specs/007-seo-rendering-gateway/tasks.md`.
