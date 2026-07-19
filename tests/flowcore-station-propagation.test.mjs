import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
import {
  PRIMARY_PROPAGATION_STATIONS,
  PROPAGATION_SIDECARS,
  STATION_RESPONSIBILITY_ROLES,
  compileStationPropagationScene,
  compileStationPropagationBundle,
  verifyStationPropagationBundle
} from '../app/engine/flowcore-station-propagation.js';

const fixturePath = 'app/dome-world/fixtures/pedagogue/cross-station-propagation.json';
const data = () => JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const options = { cryptoImpl: webcrypto };

async function compile() {
  const value = data();
  return compileStationPropagationBundle(value.fixtures, options);
}

test('P7 primary and sidecar station registries remain canonical', () => {
  assert.deepEqual(PRIMARY_PROPAGATION_STATIONS, ['Hush', 'Aperture', 'Safe Harbor', 'Phason']);
  assert.deepEqual(PROPAGATION_SIDECARS, ['EO-RFD', 'ACEDIT', 'KIRA']);
  assert.deepEqual(STATION_RESPONSIBILITY_ROLES, ['observed', 'contextualized', 'reconstructed', 'rendered', 'decided']);
});

test('four station scenes compile with four AIA routes and bounded sidecars', async () => {
  const bundle = await compile();
  assert.equal(bundle.station_packages.length, 4);
  assert.deepEqual(bundle.station_packages.map(item => item.origin_station).sort(), [...PRIMARY_PROPAGATION_STATIONS].sort());
  for (const packageView of bundle.station_packages) {
    assert.equal(packageView.receipt_verification.valid, true);
    assert.equal(packageView.aia_invariant_report.all_invariants_preserved, true);
    assert.equal(packageView.aia_invariant_report.authority_transferred, false);
    assert.deepEqual(Object.keys(packageView.aia_views), ['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']);
    assert.equal(packageView.station_responsibility.operational_action_authority, packageView.origin_station);
    assert.equal(packageView.propagation.receipt_may_cross, true);
    assert.equal(packageView.propagation.raw_content_may_cross, false);
    assert.equal(packageView.propagation.authority_may_cross, false);
    assert.equal(packageView.propagation.automatic_phase_advance, false);
    assert.equal(packageView.propagation.automatic_station_mutation, false);
    assert.equal(packageView.authority.flowcore_commands_station, false);
    assert.equal(packageView.closure.status, 'OPEN');
    for (const sidecar of packageView.sidecars) {
      assert.ok(PROPAGATION_SIDECARS.includes(sidecar.station));
      assert.equal(sidecar.can_advance_cycle, false);
      assert.equal(sidecar.can_mutate_station, false);
      assert.equal(sidecar.can_authorize_ash_action, false);
      assert.equal(sidecar.can_authorize_release, false);
      assert.equal(sidecar.authority_may_cross, false);
    }
    for (const frame of Object.values(packageView.reduced_mobile_frames)) {
      assert.equal(frame.reduced_motion, true);
      assert.equal(frame.viewport.layout, 'SINGLE_COLUMN_390');
      assert.equal(frame.viewport.horizontal_overflow_allowed, false);
      assert.equal(frame.structured_dom_summary.rest_available, true);
      assert.equal(frame.structured_dom_summary.exit_available, true);
    }
  }
});

test('station-specific evidence remains non-equivalent', async () => {
  const bundle = await compile();
  const byStation = Object.fromEntries(bundle.station_packages.map(item => [item.origin_station, item.station_responsibility.evidence]));
  assert.equal(byStation.Hush.speech_act_retained, true);
  assert.equal(byStation.Hush.register_changed, true);
  assert.equal(byStation.Aperture.candidate_models_visible, true);
  assert.equal(byStation.Aperture.abstention_visible, true);
  assert.equal(byStation['Safe Harbor'].transport_performed_false, true);
  assert.equal(byStation['Safe Harbor'].return_route_visible, true);
  assert.equal(byStation.Phason.content_anchor_stationary, true);
  assert.equal(byStation.Phason.publication_authority_false, true);
  assert.equal(new Set(bundle.station_packages.map(item => JSON.stringify(item.station_responsibility.evidence))).size, 4);
});

test('responsibility receipt names observation, context, reconstruction, rendering, and decision without crossing authority', async () => {
  const bundle = await compile();
  const matrix = bundle.responsibility_matrix;
  for (const role of STATION_RESPONSIBILITY_ROLES) assert.ok(matrix[role].length, role);
  assert.ok(matrix.observed.includes('Aperture'));
  assert.ok(matrix.observed.includes('EO-RFD'));
  assert.ok(matrix.contextualized.includes('Hush'));
  assert.ok(matrix.reconstructed.includes('Aperture'));
  assert.ok(matrix.rendered.includes('ACEDIT'));
  assert.ok(matrix.rendered.includes('Dome-World'));
  assert.ok(matrix.decided.includes('Phason'));
  assert.equal(bundle.propagation_receipt.receipts_may_cross, true);
  assert.equal(bundle.propagation_receipt.observations_may_cross, true);
  assert.equal(bundle.propagation_receipt.raw_content_may_cross, false);
  assert.equal(bundle.propagation_receipt.authority_may_cross, false);
  assert.equal(bundle.propagation_receipt.automatic_phase_advance, false);
  assert.equal(bundle.propagation_receipt.automatic_station_mutation, false);
  assert.equal(bundle.propagation_receipt.release_authorized, false);
  assert.equal(bundle.propagation_receipt.closure.status, 'OPEN');
});

test('same governed station fixtures yield deterministic bundle and receipts', async () => {
  const left = await compile();
  const right = await compile();
  assert.equal(left.bundle_id, right.bundle_id);
  assert.equal(left.bundle_digest, right.bundle_digest);
  assert.equal(left.propagation_receipt.receipt_id, right.propagation_receipt.receipt_id);
  assert.equal(left.propagation_receipt.receipt_digest, right.propagation_receipt.receipt_digest);
  assert.deepEqual(left.responsibility_matrix, right.responsibility_matrix);
  assert.equal(verifyStationPropagationBundle(left), true);
});

test('raw source fields reject at the propagation membrane', async () => {
  const value = data();
  value.fixtures[0].scene_input.visible_condition.content = 'forbidden source passage';
  await assert.rejects(() => compileStationPropagationScene(value.fixtures[0], options), /cannot cross/);
});

test('origin-station authority drift rejects', async () => {
  const authorityDrift = data();
  authorityDrift.fixtures[0].scene_input.available_affordances[0].authorized_by_station = 'Aperture';
  await assert.rejects(() => compileStationPropagationScene(authorityDrift.fixtures[0], options), /origin station/);
});

test('duplicate primary-station coverage rejects before propagation', async () => {
  const duplicate = data();
  duplicate.fixtures[3].origin_station = 'Hush';
  duplicate.fixtures[3].scene_input.available_affordances[0].authorized_by_station = 'Hush';
  await assert.rejects(
    () => compileStationPropagationBundle(duplicate.fixtures, options),
    /missing speech_act_retained|coverage is incomplete or duplicated/
  );
});

test('P7 adds no infrastructure, persistence, Ash action, release, or automatic closure', async () => {
  const bundle = await compile();
  assert.equal(bundle.serverless_delta, 0);
  assert.equal(bundle.persistence_delta, 0);
  assert.equal(bundle.raw_content_transport_added, false);
  assert.equal(bundle.station_authority_transferred, false);
  assert.equal(bundle.automatic_phase_advance, false);
  assert.equal(bundle.automatic_station_mutation, false);
  assert.equal(bundle.automatic_ash_action, false);
  assert.equal(bundle.release_authorized, false);
  assert.equal(bundle.human_closure_required, true);
  assert.equal(bundle.closure.status, 'OPEN');
});

test('P7 station observatory exposes explicit station and route selection with static mobile parity', () => {
  const html = fs.readFileSync('app/dome-world/station-propagation-observatory.html', 'utf8');
  const js = fs.readFileSync('app/dome-world/station-propagation-observatory.js', 'utf8');
  const css = fs.readFileSync('app/dome-world/station-propagation-observatory.css', 'utf8');
  assert.match(html, /data-station-nav/);
  assert.match(html, /data-route-nav/);
  assert.match(html, /Receipts may cross/);
  assert.match(html, /Authority does not/);
  assert.match(js, /compileStationPropagationBundle/);
  assert.match(js, /responsibility_matrix/);
  assert.match(css, /max-width: 390px/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(js, /requestAnimationFrame/);
});
