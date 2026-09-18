import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const roots = ['server', 'api', 'app', 'tests'];
const retiredModel = new RegExp(['gemini-2', '\\.5'].join(''), 'i');
const retiredConstant = new RegExp(['GEMINI', '25'].join(''));

function filesUnder(root) {
  const out = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) out.push(...filesUnder(full));
    else if (/\.(?:js|mjs|json|html|css)$/.test(entry.name)) out.push(full);
  }
  return out;
}

test('active runtime and current tests contain no retired Gemini generation references', () => {
  const offenders = [];
  for (const root of roots) {
    for (const file of filesUnder(root)) {
      if (file.endsWith('gemini3-only-active-surface.test.mjs')) continue;
      const source = fs.readFileSync(file, 'utf8');
      if (retiredModel.test(source) || retiredConstant.test(source)) offenders.push(file);
    }
  }
  assert.deepEqual(offenders, [], `retired generation references remain on active surfaces: ${offenders.join(', ')}`);
});

test('historical research receipts remain outside the active-surface purge', () => {
  assert.equal(roots.includes('docs/research'), false);
});
