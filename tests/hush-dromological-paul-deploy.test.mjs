import assert from 'node:assert/strict';
import fs from 'fs';
import hushMasks from '../app/data/hush-masks.js';
import {
  applyStyleDiversity,
  getStyleDiversity,
  studioStyleAudit,
  HUSH_STYLE_DIVERSITY_VERSION
} from '../app/engine/hush-style-diversity.js';

const OLD_LABEL = 'Paul Publica';
const LEGACY_ACTIVE_LABEL = 'Dromological Paul';
const NEW_LABEL = 'PAUL';
const NEW_ROLE = 'Human Anchor';
const checkedFiles = [
  'app/data/hush-masks.js',
  'app/engine/hush-style-diversity.js',
  'app/data/hush-mask-studio-audit-pr150.json',
  'app/adversarial-bench.html',
  'app/asset-versions.js'
];

for (const filePath of checkedFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  assert.equal(content.includes(OLD_LABEL), false, `${filePath} still carries retired forum mask label`);
}

const publicMask = hushMasks.find((mask) => mask.id === 'forum-regular');
assert.equal(publicMask?.label, NEW_LABEL);
assert.equal(publicMask?.profileTargets?.wendbineDisplayRole, NEW_ROLE);
assert.match(publicMask?.description || '', /Human Anchor/);
assert.doesNotMatch(publicMask?.description || '', /Dromological Paul/);

const styleProfile = getStyleDiversity({ id: 'forum-regular' });
assert.equal(styleProfile?.label, NEW_LABEL);
assert.match(styleProfile?.surface || '', /Human Anchor/);
assert.doesNotMatch(styleProfile?.surface || '', /dromological/i);
assert.match(HUSH_STYLE_DIVERSITY_VERSION, /dromological-paul-deploy-fix/);

const enriched = applyStyleDiversity({ id: 'forum-regular', label: LEGACY_ACTIVE_LABEL });
assert.equal(enriched.label, NEW_LABEL);
assert.equal(enriched.diversity.surface, 'Human Anchor · public-forum slowdown with civic static');

const auditRow = studioStyleAudit().find((row) => row.id === 'forum-regular');
assert.equal(auditRow?.label, NEW_LABEL);
assert.match(auditRow?.surface || '', /Human Anchor/);

const html = fs.readFileSync('app/adversarial-bench.html', 'utf8');
assert.match(html, /adversarial-bench-light\.js\?v=202607010930/);
assert.match(html, /hush-phase31-1\.js\?v=202607010240/);

console.log('hush-dromological-paul-deploy: ok');
