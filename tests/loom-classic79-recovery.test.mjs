import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('../app/dome-world/', import.meta.url);
const read = name => readFileSync(new URL(name, root), 'utf8');
const html = read('holonomy-loom-classic79.html');
const css = read('holonomy-loom/loom-couture-classic79.css');
const js = read('holonomy-loom/ai-workspace-classic79.js');
const template = read('holonomy-loom/workspace-template-classic79.js');
const modern = read('holonomy-loom/ai-workspace.js');
const canonicalEngine = read('../engine/portable-loom-browser-package.js');

test('Classic 79 preserves source-authored editorial interface, not a contemporary CSS skin', () => {
  assert.match(html, /loom-couture-classic79\.css/);
  assert.match(html, /ai-workspace-classic79\.js/);
  assert.match(js, /workspace-template-classic79\.js/);
  assert.match(js, /tutorial-membrane-classic79\.js/);
  assert.match(template, /Firewall your online life from AI\./);
  assert.match(css, /border-radius:52px 6px 52px 6px/);
  assert.match(css, /linear-gradient\(112deg,#efecf4/);
  assert.doesNotMatch(js, /LOOM_TUTORIAL_SCREENS/);
});

test('Classic 79 does not mutate the canonical Loom UI or its current science module', () => {
  const digest = value => createHash('sha256').update(value).digest('hex');
  assert.notEqual(digest(js), digest(modern), 'two independently inspectable controllers');
  assert.match(js, /buildPortableLoomBrowserPackage/);
  assert.match(js, /loom-portable-session\.zip/);
  assert.match(js, /cancelSessionBundle\(\)/);
  assert.match(canonicalEngine, /tomography|math/i);
  assert.match(js, /buildPortableLoomBrowserPackage\(base|prepareSessionBundle\(base/);
  assert.doesNotMatch(js, /downloadJson\('loom-portable-session\.json',portableSessionExport\)/);
});
