import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const sourcePath = path.join(here, 'ash-keep-production-probe.mjs');
const runtimeDir = path.resolve(
  process.env.TD613_PROBE_RUNTIME_DIR || path.join(repoRoot, 'artifacts', 'ash-keep-probe-runtime')
);
const runtimePath = path.join(runtimeDir, 'ash-keep-production-probe.runtime.mjs');
const manifestPath = path.join(runtimeDir, 'fixture-manifest.json');
const selectedExcerpt = process.env.TD613_SELECTED_EXCERPT
  || 'The synthetic archive index changed between two public revisions.';

const target = "  await openWorkspace(page, 'draft');\n  await page.locator('#protectedLiterals').fill('Synthetic Person');";
const replacement = [
  "  await openWorkspace(page, 'draft');",
  `  const selectedProviderExcerpt = ${JSON.stringify(selectedExcerpt)};`,
  "  await page.locator('#draftBody').fill(selectedProviderExcerpt);",
  "  await page.locator('#protectedLiterals').fill('Synthetic Person');"
].join('\n');

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

const source = await fs.readFile(sourcePath, 'utf8');
const targetCount = source.split(target).length - 1;
if (targetCount !== 1) {
  throw new Error(`Fixture runner requires exactly one declared Hush selection seam; observed ${targetCount}.`);
}

const runtime = source.replace(target, replacement);
if (runtime === source || !runtime.includes('selectedProviderExcerpt')) {
  throw new Error('Fixture runner did not materialize the declared selected excerpt.');
}

await fs.mkdir(runtimeDir, { recursive: true });
await fs.writeFile(runtimePath, runtime, 'utf8');
await fs.writeFile(manifestPath, `${JSON.stringify({
  schema: 'td613.ash-keep.production-probe-fixture-manifest/v0.1',
  source_probe: path.relative(repoRoot, sourcePath),
  runtime_probe: path.relative(repoRoot, runtimePath),
  source_probe_sha256: sha256(source),
  runtime_probe_sha256: sha256(runtime),
  selected_excerpt_sha256: sha256(selectedExcerpt),
  selected_excerpt_character_count: selectedExcerpt.length,
  source_mutated: false,
  runtime_copy_ephemeral: true,
  fixture_class: 'SYNTHETIC_OPERATOR_SELECTED_EXCERPT',
  promotion_authorized: false
}, null, 2)}\n`, 'utf8');

const child = spawn(process.execPath, [runtimePath], {
  cwd: repoRoot,
  env: process.env,
  stdio: 'inherit'
});

const exitCode = await new Promise((resolve, reject) => {
  child.once('error', reject);
  child.once('exit', code => resolve(code ?? 1));
});

if (exitCode !== 0) process.exit(exitCode);
