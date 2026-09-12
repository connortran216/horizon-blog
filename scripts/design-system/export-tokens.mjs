/**
 * Export the typed v2 token source to `design-system/tokens.json`.
 *
 * The JSON is a generated mirror, never a second source of truth: design tools
 * and the B6 coverage audit read it, `src/theme/tokens/` defines it. A drift test
 * in `src/theme/tokens/tokens.export.test.ts` fails if the checked-in file falls
 * behind, so regenerate with `yarn tokens:export` after changing a token.
 *
 * Vite loads the TypeScript source because it is already a declared dependency;
 * reaching for a transitive bundler would mean adding a dependency to read our
 * own tokens.
 */

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createServer } from 'vite';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..');
const entry = 'src/theme/tokens/index.ts';
const target = path.join(repoRoot, 'design-system', 'tokens.json');

export async function loadTokens() {
  const server = await createServer({
    root: repoRoot,
    configFile: false,
    logLevel: 'silent',
    server: { middlewareMode: true },
  });

  try {
    const { tokens } = await server.ssrLoadModule(`/${entry}`);

    return tokens;
  } finally {
    await server.close();
  }
}

export function serialise(tokens) {
  return `${JSON.stringify(tokens, null, 2)}\n`;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const tokens = await loadTokens();

  await writeFile(target, serialise(tokens), 'utf8');

  const roles = Object.keys(tokens.semantic.colors).length;
  const families = Object.keys(tokens.components).length;

  console.log(
    `design-system/tokens.json written: ${roles} semantic roles, ${families} component families`,
  );
}
