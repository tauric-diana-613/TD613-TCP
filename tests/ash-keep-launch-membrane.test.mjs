import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { governCore, governDocument } from '../app/dome-world/ash-keep-entry.js';

const documentSource = await readFile(new URL('../app/dome-world/ash-keep.html', import.meta.url), 'utf8');
const coreSource = await readFile(new URL('../app/dome-world/ash-keep.js', import.meta.url), 'utf8');

test('Ash Keep document presents a boot gate and a returnable case-entry membrane', () => {
  const rendered = governDocument(documentSource);

  assert.match(rendered, /data-td613-ash-launch-membrane/);
  assert.match(rendered, /class="launch booting" id="launch"/);
  assert.match(rendered, /id="openLaunch"/);
  assert.match(rendered, /id="closeLaunch"/);
  assert.match(rendered, />Return to case<\/button>/);
  assert.match(rendered, /role="dialog"/);
  assert.equal(governDocument(rendered), rendered, 'document governance remains idempotent');
});

test('Ash Keep core waits for local boot resolution and can reopen or close case entry', () => {
  const governed = governCore(coreSource);

  assert.match(governed, /td613 launch membrane state/);
  assert.match(governed, /function setLaunchOpen\(/);
  assert.match(governed, /setLaunchOpen\(true, \{ returnable: false \}\)/);
  assert.match(governed, /\$\('openLaunch'\)\.addEventListener\('click'/);
  assert.match(governed, /\$\('closeLaunch'\)\.addEventListener\('click'/);
  assert.match(governed, /event\.key === 'Escape'/);
  assert.doesNotMatch(governed, /\$\('launch'\)\.classList\.(?:add|remove)\('hidden'\)/);
  assert.equal(governCore(governed), governed, 'core governance remains idempotent');
});
