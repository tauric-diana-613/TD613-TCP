import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
import {
  INFORMATION_DOME_SCENE_KINDS,
  compileInformationDomeScene,
  compileInformationDomeField,
  verifyInformationDomeField
} from '../app/engine/information-dome-field.js';

const fixturePaths = [
  'app/dome-world/fixtures/pedagogue/gluing-soft-fold.json',
  'app/dome-world/fixtures/pedagogue/phason-content-invariant.json',
  'app/dome-world/fixtures/pedagogue/moire-pair-emergence.json'
];
const fixtures = fixturePaths.map(path => JSON.parse(fs.readFileSync(path, 'utf8')));
const options = { cryptoImpl: webcrypto };

test('each canonical scene completes cycle, views, mobile/reduced parity, and receipts', async () => {
  for (const fixture of fixtures) {
    const pkg = await compileInformationDomeScene(fixture, options);
    assert.deepEqual(pkg.phase_sequence.map(item => item.phase), ['NOTICE', 'ACT', 'WORLD_ANSWERS', 'NAME', 'REST']);
    assert.equal(pkg.receipt_verification.valid, true);
    assert.deepEqual(Object.keys(pkg.aia_views), ['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']);
    assert.equal(pkg.aia_invariant_report.pair_count, 6);
    assert.equal(pkg.aia_invariant_report.all_invariants_preserved, true);
    for (const frame of Object.values(pkg.reduced_mobile_frames)) {
      assert.equal(frame.reduced_motion, true);
      assert.equal(frame.viewport.layout, 'SINGLE_COLUMN_390');
      assert.equal(frame.viewport.horizontal_overflow_allowed, false);
    }
    for (const receipt of Object.values(pkg.visual_receipts)) {
      assert.equal(receipt.modeled, true);
      assert.deepEqual(receipt.claim_ceiling, pkg.scene.claim_ceiling);
      assert.equal(receipt.authority.commands_station, false);
    }
    assert.ok(pkg.research_frame.alternative_explanations.length);
    assert.ok(pkg.research_frame.falsifier.length);
    assert.equal(pkg.authority.station_authority_transferred, false);
    assert.equal(pkg.closure.status, 'OPEN');
  }
});

test('gluing scene preserves visible seam and bounded mismatch claim', async () => {
  const pkg = await compileInformationDomeScene(fixtures[0], options);
  assert.equal(pkg.field_model.model, 'LOCAL_SECTIONS_AND_GLUING_OBSTRUCTION');
  assert.equal(pkg.field_model.seam_remains_visible, true);
  assert.equal(pkg.field_model.mismatch_is_global_verdict, false);
  assert.match(pkg.required_nonclaim, /Mismatch ≠ falsehood/);
});

test('phason scene keeps source anchor stationary while projection changes', async () => {
  const pkg = await compileInformationDomeScene(fixtures[1], options);
  assert.equal(pkg.field_model.model, 'EXACT_PHASON_PROJECTION_CHANGE');
  assert.equal(pkg.field_model.source_anchor.stationary, true);
  assert.notEqual(pkg.field_model.previous_projection, pkg.field_model.new_projection);
  assert.equal(pkg.field_model.browser_float_presented_as_exact, false);
  assert.equal(pkg.field_model.publication_authority_changed, false);
  assert.match(pkg.required_nonclaim, /Projection change ≠ content mutation/);
});

test('Moire scene requires baseline and both singletons before pair residue', async () => {
  const pkg = await compileInformationDomeScene(fixtures[2], options);
  assert.equal(pkg.field_model.model, 'PAIR_EMERGENT_MOIRE_TOPOLOGY');
  assert.deepEqual(pkg.field_model.sequence, ['baseline', 'singleton A', 'singleton B', 'pair A+B', 'pair residue']);
  assert.equal(pkg.field_model.baseline, false);
  assert.equal(pkg.field_model.singleton_a, false);
  assert.equal(pkg.field_model.singleton_b, false);
  assert.equal(pkg.field_model.pair, true);
  assert.equal(pkg.field_model.emergent_topology_detected, true);
  assert.equal(pkg.field_model.pair_residue_grants_authority, false);
  assert.match(pkg.required_nonclaim, /does not establish intent/);
});

test('field compiler is deterministic, complete, synthetic-first, and outside Ash', async () => {
  const left = await compileInformationDomeField(fixtures, options);
  const right = await compileInformationDomeField(fixtures, options);
  assert.deepEqual(left, right);
  assert.deepEqual(left.canonical_scene_kinds, INFORMATION_DOME_SCENE_KINDS);
  assert.equal(left.scene_packages.length, 3);
  assert.equal(left.synthetic_first, true);
  assert.equal(left.ash_integration_authorized, false);
  assert.equal(left.serverless_delta, 0);
  assert.equal(left.authority.ash_custody_authority_unchanged, true);
  assert.equal(verifyInformationDomeField(left), true);
});

test('static proving page owns no animation loop and exposes explicit route controls', () => {
  const page = fs.readFileSync('app/dome-world/information-dome-pedagogue-page.js', 'utf8');
  const html = fs.readFileSync('app/dome-world/information-dome-pedagogue.html', 'utf8');
  assert.equal(page.includes('requestAnimationFrame'), false);
  assert.equal(page.includes('localStorage'), false);
  assert.match(html, /data-route-nav/);
  assert.match(html, /data-rest/);
  assert.match(html, /data-return/);
  assert.match(html, /data-replay/);
  assert.match(html, /Exit to Dome-World/);
});
