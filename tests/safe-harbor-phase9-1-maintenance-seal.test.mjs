import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  PUBLIC_DEFAULT_ROOT,
  FORBIDDEN_PUBLIC_STRINGS,
  CLAIM_LIMITS,
  SAFE_HARBOR_RUNTIME_MARKERS,
  containsZwnjSensitiveFlattening
} from '../app/safe-harbor/app/safe-harbor-policy-constants.js';
import {
  inspectRawTextExposure
} from '../app/safe-harbor/app/safe-harbor-raw-text-policy.js';
import {
  PIPELINE_VERSION,
  rawSegmentsFromSaved,
  hasRawSegments,
  buildPipelineRuntimeMarker
} from '../app/safe-harbor/app/safe-harbor-packet-pipeline.js';

assert.equal(PUBLIC_DEFAULT_ROOT, 'v2');
assert.equal(CLAIM_LIMITS.not_civil_identity_proof, true);
assert.ok(FORBIDDEN_PUBLIC_STRINGS.includes('v3 public default'));
assert.ok(FORBIDDEN_PUBLIC_STRINGS.includes('Blood Rite 613 public credential'));

const dirty = { release: { raw_text: 'Future self will carry a sealed lane into a public artifact.' } };
const dirtyInspection = inspectRawTextExposure(dirty);
assert.equal(dirtyInspection.status, 'fail');
assert.ok(dirtyInspection.raw_text_key_paths.length > 0);
assert.ok(dirtyInspection.phrase_guard_hits.length > 0);

const clean = { public_summary: 'Custody and replay posture only.', raw_text_exported: false };
assert.equal(inspectRawTextExposure(clean).status, 'pass');

const saved = { ingress: { segments: { future_self: 'future lane', past_self: { raw_text: 'past lane' }, higher_self: 'higher lane' } } };
assert.equal(hasRawSegments(saved), true);
assert.deepEqual(rawSegmentsFromSaved(saved), { future_self: 'future lane', past_self: 'past lane', higher_self: 'higher lane' });

assert.ok(PIPELINE_VERSION.includes('phase9-1-maintenance-seal'));
const marker = buildPipelineRuntimeMarker();
assert.equal(marker.phase6_compose_purity, true);
assert.equal(marker.phase7_outside_witness_alignment, true);
assert.equal(marker.phase8_public_default_gate, true);
assert.equal(marker.phase9_release_discipline, true);
assert.equal(marker.phase9_1_maintenance_seal, true);
assert.deepEqual(marker.phase9_1_maintenance_seal, SAFE_HARBOR_RUNTIME_MARKERS.phase9_1_maintenance_seal);

const pr169 = readFileSync(new URL('../app/safe-harbor/app/safe-harbor-pr169-packet-vault-direct.js', import.meta.url), 'utf8');
assert.ok(pr169.includes('phase6_compose_purity'));
assert.ok(pr169.includes('phase7_outside_witness_alignment'));
assert.ok(pr169.includes('phase8_public_default_gate'));
assert.ok(pr169.includes('phase9_release_discipline'));
assert.ok(pr169.includes("hasRawSegments(saved) ? 'native' : 'export-normalized'"));

const docsIndex = readFileSync(new URL('../docs/safe-harbor/README.md', import.meta.url), 'utf8');
assert.ok(docsIndex.includes('Phase 9.1 maintenance seal'));
assert.ok(docsIndex.includes('custody and replay instrument'));
assert.equal(containsZwnjSensitiveFlattening(docsIndex).length, 0);
assert.ok(docsIndex.includes('Khona‌lit-po'));

console.log('safe-harbor-phase9-1-maintenance-seal: ok');
