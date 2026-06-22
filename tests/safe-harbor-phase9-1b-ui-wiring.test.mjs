import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pr169 = readFileSync(new URL('../app/safe-harbor/app/safe-harbor-pr169-packet-vault-direct.js', import.meta.url), 'utf8');
const verifyRoom = readFileSync(new URL('../app/safe-harbor/reference/TD613_verify.html', import.meta.url), 'utf8');
const offlineCapsule = readFileSync(new URL('../app/safe-harbor/reference/TD613_offline_capsule.html', import.meta.url), 'utf8');
const manifest = readFileSync(new URL('../app/safe-harbor/reference/td613_manifest.json', import.meta.url), 'utf8');
const trust = readFileSync(new URL('../app/safe-harbor/reference/td613_trust_profile.json', import.meta.url), 'utf8');

assert.ok(pr169.includes('v16-phase9-1b-wire-ui-surfaces'));
assert.ok(pr169.includes('safe-harbor-packet-pipeline.js'));
assert.ok(pr169.includes('safe-harbor-export-policy.js'));
assert.ok(pr169.includes('safe-harbor-clipboard-policy.js'));
assert.ok(pr169.includes("hasRawSegments(saved) ? 'native' : 'export-normalized'"));
assert.ok(pr169.includes('phase9_1b_ui_surface_wiring'));
assert.ok(pr169.includes('pipeline-ui-bridge'));
assert.ok(pr169.includes('packet-preview-copy'));
assert.ok(pr169.includes('forensic-schema-copy'));

for (const room of [verifyRoom, offlineCapsule]) {
  assert.ok(room.includes('Public root'));
  assert.ok(room.includes('Phase 9'));
  assert.ok(room.includes('raw text'));
  assert.ok(room.includes('Khona‌lit-po'));
  assert.ok(room.includes('EO-RFD route'));
  assert.ok(room.includes('custody'));
  assert.ok(room.includes('replay'));
}

const manifestJson = JSON.parse(manifest);
assert.equal(manifestJson.safe_harbor_surface_policy.public_root, 'v2');
assert.equal(manifestJson.safe_harbor_surface_policy.ui_wiring, 'phase9.1B');
assert.equal(manifestJson.safe_harbor_surface_policy.raw_text_public_export, false);
assert.equal(manifestJson.safe_harbor_surface_policy.eo_shorthand, 'EO-RFD route conscience / context lane (interface-only)');

const trustJson = JSON.parse(trust);
assert.equal(trustJson.safe_harbor_surface_policy.public_root, 'v2');
assert.equal(trustJson.safe_harbor_surface_policy.ui_wiring, 'phase9.1B');
assert.equal(trustJson.safe_harbor_surface_policy.khona_lit_po, 'Khona‌lit-po');

console.log('safe-harbor-phase9-1b-ui-wiring: ok');
