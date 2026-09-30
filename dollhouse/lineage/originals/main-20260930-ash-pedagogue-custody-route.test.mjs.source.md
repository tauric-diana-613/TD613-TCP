import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
import {
  ASH_LIFECYCLE_STATES,
  deriveAshLifecycle
} from '../app/engine/ash-lifecycle.js';
import {
  compileAshCustodyPedagogueScene,
  compileAshCustodyWorldDelta,
  mapAshLifecycleToPedagoguePhase
} from '../app/engine/ash-pedagogue-adapter.js';

const data = JSON.parse(fs.readFileSync('app/dome-world/fixtures/pedagogue/ash-custody-pedagogue-scenarios.json', 'utf8'));
const clone = value => structuredClone(value);

function snapshot(name) {
  const source = clone(data.scenarios[name].snapshot);
  if (source.readinessReceipt === '$shared.readinessReceipt') source.readinessReceipt = clone(data.shared.readinessReceipt);
  if (source.custodyReceipt === '$shared.custodyReceipt') source.custodyReceipt = clone(data.shared.custodyReceipt);
  if (source.caseMap === '$scenarios.case_bound.snapshot.caseMap') source.caseMap = clone(data.scenarios.case_bound.snapshot.caseMap);
  return source;
}

function options(suffix = 'base', beforeSnapshot = null) {
  return {
    ...data.determinism,
    idSeed: `${data.determinism.idSeed}:${suffix}`,
    cryptoImpl: webcrypto,
    beforeSnapshot
  };
}

test('exact Ash lifecycle maps to bounded pedagogue posture without automatic advance', () => {
  const provisional = deriveAshLifecycle(snapshot('provisional'));
  const mapped = mapAshLifecycleToPedagoguePhase(provisional);
  assert.equal(provisional.state, ASH_LIFECYCLE_STATES.CUSTODY_ROOT_PROVISIONAL);
  assert.equal(mapped.primary_phase, 'HELD');
  assert.equal(mapped.automatic_advance, false);
  assert.equal(mapped.flowcore_commands_station, false);
  assert.equal(mapped.station_owner, 'Ash');
  assert.equal(mapped.closure.status, 'OPEN');
});

test('provisional custody yields consequence, exact hold, recovery, rest, and exit', async () => {
  const packageView = await compileAshCustodyPedagogueScene(snapshot('provisional'), options('provisional', snapshot('readiness')));
  assert.equal(packageView.lifecycle.state, ASH_LIFECYCLE_STATES.CUSTODY_ROOT_PROVISIONAL);
  assert.ok(packageView.lifecycle.holds.includes('CUSTODY_DIGEST_NOT_VERIFIED'));
  assert.equal(packageView.world_delta.rooms_open, false);
  assert.equal(packageView.world_delta.routes_open, false);
  assert.equal(packageView.world_delta.raw_content_imported, false);
  assert.equal(packageView.world_delta.transport_performed, false);
  assert.equal(packageView.world_delta.ash_state_mutated_by_adapter, false);
  assert.equal(packageView.world_delta.pedagogue_release_authorized, false);
  const hold = packageView.hold_scenes.find(item => item.code === 'CUSTODY_DIGEST_NOT_VERIFIED');
  assert.match(hold.consequence, /not completed local verification/);
  assert.match(hold.recovery, /Retry verification/);
  assert.equal(hold.blame_language, false);
  assert.equal(hold.increased_recovery_cost, false);
  assert.equal(hold.rest_available, true);
  assert.equal(hold.exit_available, true);
});

test('case binding explains exact Case Map consequences without widening authority', async () => {
  const packageView = await compileAshCustodyPedagogueScene(snapshot('case_bound'), options('case-bound', snapshot('verified')));
  assert.equal(packageView.lifecycle.state, ASH_LIFECYCLE_STATES.CASE_BOUND);
  assert.equal(packageView.world_delta.case_map_digest_changed, true);
  assert.equal(packageView.world_delta.rooms_open, true);
  assert.equal(packageView.world_delta.routes_open, true);
  assert.equal(packageView.world_delta.chronology_root_index, 0);
  assert.match(packageView.comprehension_contract.what_stayed_local, /bytes remain outside the Case Map/i);
  assert.match(packageView.comprehension_contract.what_ash_created, /chronology index zero/i);
  assert.match(packageView.comprehension_contract.what_changed_in_case, /Case Map digest changes/i);
  assert.match(packageView.comprehension_contract.what_remains_unauthorized, /does not prove truth/i);
  assert.match(packageView.comprehension_contract.what_may_happen_next, /Rebuild Test|rest/i);
  assert.equal(packageView.authority.release_authorized, false);
  assert.equal(packageView.authority.automatic_ash_action, false);
  assert.equal(packageView.authority.station_authority_transferred, false);
  assert.equal(packageView.closure.status, 'OPEN');
});

test('stale pre-custody derivatives remain non-current and cannot jump release gates', async () => {
  const stale = snapshot('stale_rebuild');
  const lifecycle = deriveAshLifecycle(stale);
  assert.equal(lifecycle.state, ASH_LIFECYCLE_STATES.CASE_BOUND);
  assert.ok(lifecycle.holds.includes('CURRENT_REBUILD_TEST_ABSENT'));
  assert.equal(lifecycle.gates.local_release, false);
  const delta = compileAshCustodyWorldDelta(snapshot('verified'), stale);
  assert.deepEqual(delta.stale_derivative_kinds, ['latestTest']);
  const packageView = await compileAshCustodyPedagogueScene(stale, options('stale', snapshot('verified')));
  assert.equal(packageView.non_regression.stale_derivatives_remain_non_current, true);
  assert.equal(packageView.non_regression.automatic_release_added, false);
  assert.equal(packageView.lifecycle.references.release_receipt, null);
});

test('all four AIA views preserve source and claim boundaries with complete reduced-motion parity', async () => {
  const packageView = await compileAshCustodyPedagogueScene(snapshot('verified'), options('views', snapshot('provisional')));
  assert.deepEqual(Object.keys(packageView.aia_views), ['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']);
  assert.equal(packageView.aia_invariant_report.all_invariants_preserved, true);
  assert.equal(packageView.aia_invariant_report.authority_transferred, false);
  for (const frame of Object.values(packageView.reduced_mobile_frames)) {
    assert.equal(frame.reduced_motion, true);
    assert.equal(frame.viewport.layout, 'SINGLE_COLUMN_390');
    assert.equal(frame.viewport.horizontal_overflow_allowed, false);
    assert.equal(frame.structured_dom_summary.rest_available, true);
    assert.equal(frame.structured_dom_summary.exit_available, true);
  }
  assert.equal(packageView.receipt_verification.valid, true);
});

test('same exact local snapshot yields deterministic package and receipts', async () => {
  const left = await compileAshCustodyPedagogueScene(snapshot('rebuild_eligible'), options('deterministic', snapshot('case_bound')));
  const right = await compileAshCustodyPedagogueScene(snapshot('rebuild_eligible'), options('deterministic', snapshot('case_bound')));
  assert.equal(left.package_id, right.package_id);
  assert.equal(left.package_digest, right.package_digest);
  assert.equal(left.pedagogue_receipt.receipt_digest, right.pedagogue_receipt.receipt_digest);
  assert.equal(left.lifecycle_receipt.lifecycle_digest, right.lifecycle_receipt.lifecycle_digest);
  assert.ok(left.transfer_encounter);
  assert.equal(left.transfer_encounter.authority.automatic_ash_action, false);
});

test('raw content cannot enter the adapter', async () => {
  await assert.rejects(
    () => compileAshCustodyPedagogueScene({ ...snapshot('verified'), text: 'sensitive source passage' }, options('raw')),
    /raw content/
  );
  assert.throws(
    () => compileAshCustodyWorldDelta(null, { ...snapshot('arrival'), bytes: [1, 2, 3] }),
    /raw content/
  );
});

test('P6 surface is consequence-first, mobile complete, and owns no animation loop', () => {
  const html = fs.readFileSync('app/dome-world/ash-custody-pedagogue.html', 'utf8');
  const js = fs.readFileSync('app/dome-world/ash-custody-pedagogue.js', 'utf8');
  const css = fs.readFileSync('app/dome-world/ash-custody-pedagogue.css', 'utf8');
  assert.match(html, /What stayed local/);
  assert.match(html, /What Ash created/);
  assert.match(html, /What changed in the case/);
  assert.match(html, /What did not become authorized/);
  assert.match(html, /What may happen next/);
  assert.match(js, /compileAshCustodyPedagogueScene/);
  assert.match(css, /max-width: 390px/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(js, /requestAnimationFrame/);
});
