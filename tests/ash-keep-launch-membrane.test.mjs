import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { governCore, governDocument } from '../app/dome-world/ash-keep-entry.js';

const documentSource = await readFile(new URL('../app/dome-world/ash-keep.html', import.meta.url), 'utf8');
const coreSource = await readFile(new URL('../app/dome-world/ash-keep.js', import.meta.url), 'utf8');
const researchHydrationSource = await readFile(new URL('../app/dome-world/ash-research-profile-hydration.js', import.meta.url), 'utf8');

 test('Ash Keep document presents the canonical case-entry membrane and case controls', () => {
  const rendered = governDocument(documentSource);

  assert.match(rendered, /class="launch" id="launch" role="dialog"/);
  assert.match(rendered, /id="startDemo">Start a demo<\/button>/);
  assert.match(rendered, /id="newCase">New case<\/button>/);
  assert.match(rendered, /id="saveCase"[^>]*>Save Case<\/button>/);
  assert.match(rendered, /id="closeCase"[^>]*>Close Case<\/button>/);
  assert.equal(governDocument(rendered), rendered, 'document governance remains idempotent');
});

test('Ash Keep fallback core preserves canonical launch and case-transition behavior', () => {
  const governed = governCore(coreSource);

  assert.match(governed, /caseMapDigest: state\.caseMap\.case_map_digest/);
  assert.match(governed, /announce\('case-opened'\)/);
  assert.match(governed, /announce\('case-created'/);
  assert.match(governed, /\$\('launch'\)\.classList\.add\('hidden'\)/);
  assert.match(governed, /\$\('launch'\)\.classList\.remove\('hidden'\)/);
  assert.doesNotMatch(governed, /location\.reload\(\)/);
  assert.equal(governCore(governed), governed, 'core governance remains idempotent');
});

test('Research ingress layer owns the governed desktop scroll axis', () => {
  assert.match(researchHydrationSource, /ASH_INGRESS_MEMBRANE_VERSION/);
  assert.match(researchHydrationSource, /overflow-y:auto!important/);
  assert.match(researchHydrationSource, /scrollbar-gutter:stable both-edges/);
  assert.match(researchHydrationSource, /\.launch-panel\{[\s\S]*margin:auto!important/);
  assert.match(researchHydrationSource, /max-block-size:none/);
});
