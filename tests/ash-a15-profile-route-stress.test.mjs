import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ASH_A15_PROFILE_ROUTE_STRESS_VERSION,
  ASH_A15_REGISTRY_VERSION,
  ASH_A15_ASSET_EPOCH,
  ASH_A15_PROFILES,
  ASH_A15_WORKSPACES,
  ASH_A15_AIA_ROUTES,
  compileA15StressMatrix,
  verifyA15StressMatrix
} from '../app/dome-world/ash-a15-profile-route-stress.js';

assert.equal(ASH_A15_PROFILE_ROUTE_STRESS_VERSION, 'td613.ash.a15-profile-route-stress/v0.1');
assert.equal(ASH_A15_REGISTRY_VERSION, 'td613.ash.demo-registry/v0.3-a15');
assert.equal(ASH_A15_ASSET_EPOCH, '20260726-a15-release-v1');
assert.deepEqual(ASH_A15_PROFILES, ['investigation','political_campaign','fundraiser','research','legal','archive']);
assert.deepEqual(ASH_A15_WORKSPACES, ['home','map','work','choir','capsule']);
assert.deepEqual(ASH_A15_AIA_ROUTES, ['experimental','custodial','audit','implementation']);

const matrix = compileA15StressMatrix('same-action');
const receipt = verifyA15StressMatrix(matrix);
assert.equal(matrix.length, 120);
assert.equal(receipt.journeys, 120);
assert.equal(receipt.ontology_leakage, false);
assert.equal(receipt.false_real_world_claims, false);
assert.equal(receipt.sensitive_import, false);
assert.equal(receipt.authority_changed, false);
assert.equal(receipt.source_bytes_moved, false);
assert.equal(receipt.human_review_required, true);
assert.equal(new Set(matrix.map(item => item.message)).size, 120);
for (const profile of ASH_A15_PROFILES) {
  const answers = matrix.filter(item => item.profile === profile);
  assert.equal(answers.length, 20);
  assert.equal(new Set(answers.map(item => item.profile_language)).size, 1);
}
for (const answer of matrix) {
  assert.equal(answer.action, 'same-action');
  assert.equal(answer.ontology_scope, 'SYNTHETIC_PROFILE_LOCAL');
  assert.equal(answer.real_world_claim, false);
  assert.equal(answer.sensitive_import, false);
  assert.equal(answer.custody_changed, false);
  assert.equal(answer.release_authority, false);
  assert.equal(answer.automatic_consequential_action, false);
  assert.equal(answer.human_review_required, true);
}
const workflow = fs.readFileSync(new URL('../.github/workflows/td613-ci.yml', import.meta.url), 'utf8');
assert.match(workflow, /Validate Ash A15 profile-route stress/);
assert.match(workflow, /ash-a15-profile-route-stress\.test\.mjs/);
assert.match(workflow, /ash-a15-profile-route-browser-probe\.mjs/);
const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
assert.equal(vercel.git?.deploymentEnabled, false);
console.log(JSON.stringify(receipt, null, 2));
