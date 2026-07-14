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

const hushTarget = "  await openWorkspace(page, 'draft');\n  await page.locator('#protectedLiterals').fill('Synthetic Person');";
const hushReplacement = [
  "  await openWorkspace(page, 'draft');",
  `  const selectedProviderExcerpt = ${JSON.stringify(selectedExcerpt)};`,
  "  await page.locator('#draftBody').fill(selectedProviderExcerpt);",
  "  await page.locator('#protectedLiterals').fill('Synthetic Person');"
].join('\n');

const layoutTarget = `    const clipped = visible
      .map(node => ({ id: node.id || node.textContent?.trim().slice(0, 32) || node.tagName, rect: node.getBoundingClientRect() }))
      .filter(item => item.rect.left < -1 || item.rect.right > window.innerWidth + 1)
      .map(item => item.id);`;
const layoutReplacement = `    const scrollLaneFor = node => {
      let parent = node.parentElement;
      while (parent && parent !== document.body) {
        const style = getComputedStyle(parent);
        const intentionallyScrollable = /(auto|scroll)/.test(style.overflowX)
          && parent.scrollWidth > parent.clientWidth + 1;
        if (intentionallyScrollable) return parent;
        parent = parent.parentElement;
      }
      return null;
    };
    const positioned = visible.map(node => ({
      id: node.id || node.textContent?.trim().slice(0, 32) || node.tagName,
      rect: node.getBoundingClientRect(),
      scroll_lane: scrollLaneFor(node)?.className || null
    }));
    const clipped = positioned
      .filter(item => !item.scroll_lane && (item.rect.left < -1 || item.rect.right > window.innerWidth + 1))
      .map(item => item.id);
    const scrollLaneControls = positioned
      .filter(item => item.scroll_lane && (item.rect.left < -1 || item.rect.right > window.innerWidth + 1))
      .map(item => ({ id: item.id, lane: item.scroll_lane }));`;
const returnTarget = '      clipped_controls: clipped,\n      workspace_tab_count: tabs.length,';
const returnReplacement = '      clipped_controls: clipped,\n      scroll_lane_controls: scrollLaneControls,\n      workspace_tab_count: tabs.length,';

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function replaceExactlyOnce(source, target, replacement, label) {
  const count = source.split(target).length - 1;
  if (count !== 1) {
    throw new Error(`Fixture runner requires exactly one ${label} seam; observed ${count}.`);
  }
  return source.replace(target, replacement);
}

const source = await fs.readFile(sourcePath, 'utf8');
let runtime = replaceExactlyOnce(source, hushTarget, hushReplacement, 'declared Hush selection');
runtime = replaceExactlyOnce(runtime, layoutTarget, layoutReplacement, 'mobile scroll-lane classification');
runtime = replaceExactlyOnce(runtime, returnTarget, returnReplacement, 'layout receipt return');

if (runtime === source || !runtime.includes('selectedProviderExcerpt') || !runtime.includes('scroll_lane_controls')) {
  throw new Error('Fixture runner did not materialize every declared runtime seam.');
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
  runtime_transformations: [
    'DECLARE_SELECTED_EXCERPT_AFTER_UNKEPT_DRAFT_RELOAD',
    'CLASSIFY_INTENTIONAL_HORIZONTAL_SCROLL_LANES_SEPARATELY_FROM_CLIPPING'
  ],
  scroll_lane_rule: 'overflow-x auto-or-scroll plus scrollWidth greater than clientWidth',
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
