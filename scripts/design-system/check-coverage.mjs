/**
 * Coverage audit for Horizon Design System v2 (`horizon-blog-dsv2.7.2`).
 *
 * Answers one question: is there anything in this system that nobody has
 * accounted for? Three ways that can happen, and one check each:
 *
 *   1. A legacy UI file exists that the migration ledger never mentions, or the
 *      ledger names a file that no longer exists.
 *   2. A ledger row is not deferred but has no owner or no v2 target - work
 *      that looks assigned and is not.
 *   3. A v2 component is exported but never mounted in the gallery, so nobody
 *      has ever looked at it in both themes at four widths.
 *
 * Run with `yarn coverage:design-system`. Exits non-zero on any finding and
 * writes `design-system/coverage-report.md` either way, so the report always
 * describes the run that just happened rather than the last good one.
 *
 * Scope note: the ledger tracks the LEGACY tree. Files under
 * `src/design-system/` are the v2 system itself and are covered by check 3
 * against the gallery registry, not by ledger rows - otherwise every component
 * would have to be written down twice and the two copies would drift.
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createServer } from 'vite';
import { glob } from 'node:fs/promises';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..');
const inventoryPath = path.join(repoRoot, 'design-system', 'component-inventory.md');
const reportPath = path.join(repoRoot, 'design-system', 'coverage-report.md');

const BARREL = '/src/design-system/index.ts';
const REGISTRY = '/src/design-system/gallery/registry.ts';

/** A ledger row that points at a page is the page-migration epic's problem. */
const DEFERRED = 'deferred-page-migration';

async function listLegacyUiFiles() {
  const files = [];

  for await (const entry of glob('src/**/*.tsx', { cwd: repoRoot })) {
    const normalised = entry.split(path.sep).join('/');

    if (normalised.endsWith('.test.tsx')) continue;
    // The v2 tree is not part of the legacy ledger; see the scope note above.
    if (normalised.startsWith('src/design-system/')) continue;

    files.push(normalised);
  }

  return files.sort();
}

function parseInventory(markdown) {
  const rows = [];

  for (const line of markdown.split('\n')) {
    if (!line.startsWith('| `src/')) continue;

    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());

    if (cells.length < 6) continue;

    const [file, category, disposition, owner, target, coverage] = cells;

    rows.push({
      file: file.replace(/`/g, ''),
      category,
      disposition,
      owner,
      target,
      coverage,
    });
  }

  return rows;
}

/**
 * Components, as opposed to the logic functions and types that share the
 * barrel. The heuristic is deliberately simple - an exported function whose
 * name starts with a capital - and it is stated in the report so a reader can
 * judge it rather than trust it.
 */
function componentExports(module) {
  return Object.entries(module)
    .filter(([name, value]) => /^[A-Z]/.test(name) && typeof value === 'function')
    .map(([name]) => name)
    .sort();
}

async function loadModules() {
  const server = await createServer({
    root: repoRoot,
    configFile: false,
    logLevel: 'silent',
    server: { middlewareMode: true },
  });

  try {
    const barrel = await server.ssrLoadModule(BARREL);
    let registry = null;
    let registryError = null;

    try {
      registry = await server.ssrLoadModule(REGISTRY);
    } catch (error) {
      registryError = error instanceof Error ? error.message : String(error);
    }

    return { barrel, registry, registryError };
  } finally {
    await server.close();
  }
}

function galleryEntries(registry) {
  if (!registry) return null;

  const value =
    registry.galleryRegistry ?? registry.registry ?? registry.entries ?? registry.default;

  return Array.isArray(value) ? value : null;
}

function entryNames(entries) {
  const names = new Set();

  for (const entry of entries) {
    if (typeof entry?.name === 'string') names.add(entry.name);
    if (typeof entry?.component === 'string') names.add(entry.component);

    for (const covered of entry?.covers ?? []) {
      if (typeof covered === 'string') names.add(covered);
    }
  }

  return names;
}

async function main() {
  const findings = [];
  const notes = [];

  const [inventoryMarkdown, legacyFiles] = await Promise.all([
    readFile(inventoryPath, 'utf8'),
    listLegacyUiFiles(),
  ]);

  const rows = parseInventory(inventoryMarkdown);

  // --- 1. ledger against the filesystem -----------------------------------

  const rowFiles = rows.map((row) => row.file);
  const duplicates = rowFiles.filter((file, index) => rowFiles.indexOf(file) !== index);

  for (const file of [...new Set(duplicates)]) {
    findings.push({ check: 'ledger', detail: `\`${file}\` has more than one ledger row` });
  }

  const rowSet = new Set(rowFiles);
  const fileSet = new Set(legacyFiles);

  for (const file of legacyFiles) {
    if (!rowSet.has(file)) {
      findings.push({ check: 'ledger', detail: `\`${file}\` exists but has no ledger row` });
    }
  }

  for (const file of rowFiles) {
    if (!fileSet.has(file)) {
      findings.push({ check: 'ledger', detail: `ledger row \`${file}\` points at a missing file` });
    }
  }

  // --- 2. every non-deferred row is actually assigned ----------------------

  for (const row of rows) {
    if (row.disposition === DEFERRED) continue;

    if (!row.owner || row.owner === '-') {
      findings.push({ check: 'ownership', detail: `\`${row.file}\` has no owner` });
    }

    if (!row.target || row.target === '-') {
      findings.push({ check: 'ownership', detail: `\`${row.file}\` names no v2 target` });
    }

    if (row.disposition === 'compatibility' && !/until|remove/i.test(row.coverage)) {
      findings.push({
        check: 'compatibility',
        detail: `\`${row.file}\` is a compatibility alias with no removal condition`,
      });
    }
  }

  // --- 3. every exported component is in the gallery -----------------------

  const { barrel, registry, registryError } = await loadModules();
  const exported = componentExports(barrel);
  const entries = galleryEntries(registry);

  let covered = 0;

  if (!registry) {
    findings.push({
      check: 'gallery',
      detail: `the gallery registry could not be loaded, so no export is demonstrated (${registryError})`,
    });
  } else if (!entries) {
    findings.push({
      check: 'gallery',
      detail: 'the gallery registry loaded but exports no array of entries',
    });
  } else {
    const names = entryNames(entries);

    for (const name of exported) {
      if (names.has(name)) covered += 1;
      else findings.push({ check: 'gallery', detail: `\`${name}\` is exported but not in the gallery` });
    }

    notes.push(`Gallery entries: ${entries.length}.`);
  }

  // --- report --------------------------------------------------------------

  const byDisposition = rows.reduce((counts, row) => {
    counts[row.disposition] = (counts[row.disposition] ?? 0) + 1;
    return counts;
  }, {});

  const lines = [
    '# Design system coverage report',
    '',
    `Generated by \`yarn coverage:design-system\` on ${new Date().toISOString().slice(0, 10)}.`,
    'Regenerate it rather than editing it.',
    '',
    '## What this checks',
    '',
    '1. **Ledger against the filesystem.** Every legacy UI file has exactly one row, and every',
    '   row points at a file that exists. Files under `src/design-system/` are the v2 system',
    '   itself and are covered by check 3 instead, so that no component has to be written down',
    '   twice.',
    '2. **Ownership.** Every row that is not deferred to the page-migration epic names an owner',
    '   and a v2 target, and every compatibility alias states when it goes away.',
    '3. **Gallery.** Every component exported from `src/design-system/index.ts` appears in the',
    '   gallery registry. "Component" here means an exported function whose name begins with a',
    '   capital - a heuristic, stated so it can be judged rather than trusted.',
    '',
    '## Counts',
    '',
    `- Legacy UI files on disk: **${legacyFiles.length}**`,
    `- Ledger rows: **${rows.length}**`,
    `- Exported v2 components: **${exported.length}**`,
    `- Exported components demonstrated in the gallery: **${covered}**`,
    '',
    '| Disposition | Rows |',
    '| --- | ---: |',
    ...Object.entries(byDisposition)
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([disposition, count]) => `| ${disposition} | ${count} |`),
    '',
    ...notes.map((note) => `${note}\n`),
    '## Findings',
    '',
  ];

  if (findings.length === 0) {
    lines.push('None. Every legacy file is accounted for and every v2 export is demonstrated.');
  } else {
    lines.push(`**${findings.length}** unresolved.`, '');

    const grouped = findings.reduce((groups, finding) => {
      (groups[finding.check] ??= []).push(finding.detail);
      return groups;
    }, {});

    for (const [check, details] of Object.entries(grouped)) {
      lines.push(`### ${check} (${details.length})`, '');
      lines.push(...details.map((detail) => `- ${detail}`), '');
    }
  }

  await writeFile(reportPath, `${lines.join('\n')}\n`, 'utf8');

  console.log(
    `${legacyFiles.length} legacy files, ${rows.length} ledger rows, ${covered}/${exported.length} exports in the gallery`,
  );
  console.log('report: design-system/coverage-report.md');

  if (findings.length > 0) {
    console.error(`\n${findings.length} finding(s):`);
    for (const finding of findings) console.error(`  [${finding.check}] ${finding.detail}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  await main();
}
