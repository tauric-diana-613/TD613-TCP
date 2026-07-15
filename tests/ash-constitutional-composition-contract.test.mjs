import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');

test('canonical Keep owns its complete constitutional composition', async () => {
  const html = await read('app/dome-world/ash-keep.html');
  const modules = ['/dome-world/ash-keep.js', '/dome-world/ash-convergence.js', '/dome-world/ash-lifecycle.js', '/dome-world/ash-workspace-bridge.js', '/dome-world/ash-case-controls.js'];
  assert.match(html, /name="ash-constitutional-composition" content="v0\.1"/);
  let cursor = -1;
  for (const module of modules) {
    const index = html.indexOf(module);
    assert.ok(index > cursor, `${module} must appear in canonical order`);
    cursor = index;
  }
  assert.doesNotMatch(html, /surface=ash-keep-js/);
});

test('delivery layers validate or redirect instead of rewriting the Keep core', async () => {
  const shell = await read('api/dome-world-shell.js');
  const entry = await read('app/dome-world/ash-keep-entry.js');
  const core = await read('app/dome-world/ash-keep.js');
  assert.doesNotMatch(shell, /DRAFT_MARKER|SAVE_POINT_MARKER|CAPSULE_MARKER|REVIEW_BINDING|WORKSPACE_BINDING/);
  assert.match(entry, /window\.location\.replace\(canonicalKeepRoute\(\)\)/);
  assert.doesNotMatch(entry, /document\.write|governed-inline/);
  assert.match(core, /caseMapDigest: state\.caseMap\.case_map_digest/);
  assert.match(core, /releaseReceiptReference: state\.latestRelease\?\.receipt_id \|\| null/);
  assert.doesNotMatch(core, /location\.reload\(\)/);
});

test('current convergence producers do not carry active claim-ceiling vocabulary', async () => {
  const sources = await Promise.all([
    read('app/engine/ash-constitutional-convergence.js'),
    read('app/engine/ash-lifecycle.js'),
    read('app/dome-world/ash-convergence.js'),
    read('app/dome-world/ash-keep.html')
  ]);
  for (const source of sources) assert.doesNotMatch(source, /cannot_establish|claimCeiling|claim_ceiling|Claim Ceiling/);
});
