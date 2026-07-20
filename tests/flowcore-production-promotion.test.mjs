import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { webcrypto } from 'node:crypto';

import {
  PROMOTION_STATES,
  REQUIRED_PROMOTION_ARTIFACTS,
  compileRollbackPlan,
  compilePromotionPacket,
  verifyPromotionPacket
} from '../app/engine/flowcore-production-promotion.js';
import { FLOWCORE_PROMOTION_CONFIG } from '../app/dome-world/data/flowcore-promotion-config-v01.js';

const fixture = () => JSON.parse(fs.readFileSync('app/dome-world/fixtures/pedagogue/flowcore-promotion-evidence.json', 'utf8'));
const options = data => ({ ...data.determinism, cryptoImpl: webcrypto });

test('P10 promotion state order is explicit and merge-independent', () => {
  assert.deepEqual(PROMOTION_STATES, ['DESIGNED', 'IMPLEMENTED', 'HARDENED', 'RUNTIME_DEMONSTRATED', 'PRODUCTION_DEMONSTRATED']);
  assert.equal(FLOWCORE_PROMOTION_CONFIG.feature_gate.default_enabled, false);
  assert.equal(FLOWCORE_PROMOTION_CONFIG.feature_gate.presentation_layer_only, true);
  assert.equal(FLOWCORE_PROMOTION_CONFIG.feature_gate.governed_state_mutation_allowed, false);
  assert.equal(FLOWCORE_PROMOTION_CONFIG.feature_gate.route_promotion_authorized, false);
  assert.equal(FLOWCORE_PROMOTION_CONFIG.authority.config_can_enable_itself, false);
  assert.equal(FLOWCORE_PROMOTION_CONFIG.authority.human_promotion_required, true);
});

test('observed runtime evidence remains HARDENED while empirical and production gates are held', async () => {
  const data = fixture();
  const packet = await compilePromotionPacket(data, options(data));
  assert.equal(packet.current_state, 'HARDENED');
  assert.equal(packet.promotion_complete, false);
  assert.equal(packet.state_inferred_from_merge, false);
  assert.equal(packet.state_inferred_from_deployment, false);
  assert.deepEqual(Object.keys(packet.evidence), REQUIRED_PROMOTION_ARTIFACTS);
  for (const key of ['browser_matrix', 'mobile_evidence', 'reduced_motion_evidence', 'performance_evidence']) {
    assert.equal(packet.evidence[key].status, 'PASS', `${key} must remain observed PASS`);
    assert.equal(packet.evidence[key].observation_is_merge_inference, false);
  }
  assert.equal(packet.evidence.browser_matrix.matrix.firefox_desktop, 'PASS');
  assert.equal(packet.evidence.browser_matrix.matrix.webkit_ios_viewport, 'PASS');
  assert.equal(packet.evidence.mobile_evidence.landscape, 'PASS');
  assert.equal(packet.evidence.mobile_evidence.rotation, 'PASS');
  assert.equal(packet.evidence.reduced_motion_evidence.browser_runtime_observed, true);
  assert.equal(packet.evidence.performance_evidence.browser_frame_trace_observed, true);
  const codes = packet.promotion_holds.map(item => item.code);
  assert.ok(codes.includes('EMPIRICAL_EXIT_GATE_HELD'));
  assert.ok(!codes.includes('RUNTIME_EVIDENCE_INCOMPLETE'));
  assert.ok(codes.includes('PRODUCTION_PROBE_NOT_OBSERVED'));
  assert.ok(codes.includes('PRODUCTION_PROMOTION_NOT_COMPLETE'));
  assert.equal(packet.empirical_validation.merge_may_satisfy_gate, false);
  assert.equal(packet.empirical_validation.deployment_may_satisfy_gate, false);
  assert.equal(packet.feature_gate.default_enabled, false);
  assert.equal(packet.feature_gate.public_route_promotion_authorized, false);
  assert.equal(packet.authority.packet_can_enable_feature, false);
  assert.equal(packet.authority.packet_can_authorize_release, false);
  assert.equal(packet.authority.packet_can_close_program, false);
  assert.equal(packet.closure.status, 'OPEN');
  assert.equal(verifyPromotionPacket(packet), true);
});

test('rollback preserves all governed records and creates no release, transport, or migration', () => {
  const plan = compileRollbackPlan(fixture().rollback);
  for (const required of ['custody_records', 'case_maps', 'receipts', 'route_memory', 'release_state', 'local_commitments']) assert.ok(plan.preserves.includes(required));
  assert.equal(plan.feature_gate_path, 'presentation-layer-only');
  assert.equal(plan.default_enabled, false);
  assert.equal(plan.restores_prior_ui, true);
  assert.equal(plan.rollback_mutates_governed_state, false);
  assert.equal(plan.rollback_requires_data_migration, false);
  assert.equal(plan.rollback_creates_release, false);
  assert.equal(plan.rollback_creates_transport, false);
  assert.equal(plan.human_authorization_required, true);
  assert.equal(plan.closure.status, 'OPEN');
});

test('rollback rejects missing preservation and governed-state mutation', () => {
  const data = fixture();
  assert.throws(() => compileRollbackPlan({ ...data.rollback, preserves: data.rollback.preserves.filter(item => item !== 'case_maps') }), /case_maps/);
  assert.throws(() => compileRollbackPlan({ ...data.rollback, feature_gate_path: 'data-layer' }), /presentation-layer-only/);
  assert.throws(() => compileRollbackPlan({ ...data.rollback, rollback_mutates_governed_state: true }), /cannot mutate governed state/i);
});

test('promotion packet rejects missing artifacts and a self-enabling feature gate', async () => {
  const data = fixture();
  const missing = JSON.parse(JSON.stringify(data));
  delete missing.evidence.production_probe_receipt;
  await assert.rejects(() => compilePromotionPacket(missing, options(missing)), /production_probe_receipt evidence is required/);
  const enabled = JSON.parse(JSON.stringify(data));
  enabled.feature_gate.default_enabled = true;
  const enabledPacket = await compilePromotionPacket(enabled, options(enabled));
  assert.equal(enabledPacket.current_state, 'IMPLEMENTED');
  assert.ok(enabledPacket.promotion_holds.some(item => item.code === 'FEATURE_GATE_DEFAULT_NOT_OFF'));
  assert.throws(() => verifyPromotionPacket(enabledPacket), /Feature gate boundary widened/);
  const mutation = JSON.parse(JSON.stringify(data));
  mutation.feature_gate.governed_state_mutation_allowed = true;
  await assert.rejects(() => compilePromotionPacket(mutation, options(mutation)), /presentation-only feature gate/);
});

test('runtime state requires observed runtime evidence and the empirical exit gate', async () => {
  const data = fixture();
  data.empirical_validation.empirical_exit_gate_passed = true;
  data.empirical_validation.human_adult_evidence_present = true;
  data.empirical_validation.reason = 'HUMAN_REVIEW_THRESHOLD_SATISFIED';
  const packet = await compilePromotionPacket(data, { ...options(data), idSeed: 'td613-p10-runtime' });
  assert.equal(packet.current_state, 'RUNTIME_DEMONSTRATED');
  assert.equal(packet.promotion_complete, false);
  assert.ok(packet.promotion_holds.some(item => item.code === 'PRODUCTION_PROBE_NOT_OBSERVED'));
  assert.equal(verifyPromotionPacket(packet), true);
});

test('production state additionally requires an observed exact-main probe', async () => {
  const data = fixture();
  data.evidence.production_probe_receipt = {
    status: 'PASS',
    references: ['issue-405-terminal-receipt'],
    exact_main_sha_verified: true,
    production_url_verified: true,
    application_tree_drift: 'none',
    observed_at: '2026-07-20T01:28:02Z',
    observation_is_merge_inference: false
  };
  data.empirical_validation.empirical_exit_gate_passed = true;
  data.empirical_validation.human_adult_evidence_present = true;
  data.empirical_validation.reason = 'HUMAN_REVIEW_THRESHOLD_SATISFIED';
  const packet = await compilePromotionPacket(data, { ...options(data), idSeed: 'td613-p10-production' });
  assert.equal(packet.current_state, 'PRODUCTION_DEMONSTRATED');
  assert.equal(packet.promotion_complete, true);
  assert.equal(packet.promotion_holds.length, 0);
  assert.equal(verifyPromotionPacket(packet), true);

  const inexact = JSON.parse(JSON.stringify(data));
  inexact.evidence.production_probe_receipt.exact_main_sha_verified = false;
  const held = await compilePromotionPacket(inexact, { ...options(inexact), idSeed: 'td613-p10-inexact' });
  assert.equal(held.current_state, 'RUNTIME_DEMONSTRATED');
  assert.equal(held.promotion_complete, false);
});

test('merge or deployment flags supplied by a caller cannot advance state', async () => {
  const data = fixture();
  data.merge_completed = true;
  data.deployment_completed = true;
  const packet = await compilePromotionPacket(data, { ...options(data), idSeed: 'td613-p10-no-inference' });
  assert.equal(packet.current_state, 'HARDENED');
  assert.equal(packet.state_inferred_from_merge, false);
  assert.equal(packet.state_inferred_from_deployment, false);
  assert.equal(packet.empirical_validation.empirical_exit_gate_passed, false);
});

test('P10 promotion packet is deterministic under frozen evidence', async () => {
  const data = fixture();
  const left = await compilePromotionPacket(data, options(data));
  const right = await compilePromotionPacket(data, options(data));
  assert.equal(left.packet_id, right.packet_id);
  assert.equal(left.packet_digest, right.packet_digest);
  assert.deepEqual(left.promotion_holds, right.promotion_holds);
  assert.deepEqual(left.rollback, right.rollback);
});

test('documentation and dashboard expose honest state, rollback, mobile, and reduced-motion parity', () => {
  const html = fs.readFileSync('app/dome-world/flowcore-promotion-dashboard.html', 'utf8');
  const js = fs.readFileSync('app/dome-world/flowcore-promotion-dashboard.js', 'utf8');
  const css = fs.readFileSync('app/dome-world/flowcore-promotion-dashboard.css', 'utf8');
  const index = fs.readFileSync('app/dome-world/docs/FLOWCORE_PEDAGOGUE_PROGRAM_INDEX_V0_1.md', 'utf8');
  const rollback = fs.readFileSync('app/dome-world/docs/FLOWCORE_PEDAGOGUE_ROLLBACK_PROCEDURE_V0_1.md', 'utf8');
  const schema = JSON.parse(fs.readFileSync('app/dome-world/schemas/flowcore-promotion-v01.schema.json', 'utf8'));
  assert.match(html, /data-evidence-nav/);
  assert.match(html, /Merge and deployment do not advance/);
  assert.match(html, /cannot enable the feature/);
  for (const control of ['data-rest', 'data-return', 'data-replay', 'data-exit']) assert.match(html, new RegExp(control));
  assert.match(js, /compilePromotionPacket/);
  assert.match(js, /Promotion holds/);
  assert.match(js, /Rollback preserves/);
  assert.doesNotMatch(js, /requestAnimationFrame|localStorage|indexedDB/);
  assert.match(css, /max-width: 390px/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(index, /implementation state: HARDENED/);
  assert.match(index, /production demonstrated: false/);
  assert.match(rollback, /Rollback may not/);
  assert.match(rollback, /closure: OPEN/);
  assert.equal(schema.$id, 'td613.flowcore.promotion/v0.1');
});
