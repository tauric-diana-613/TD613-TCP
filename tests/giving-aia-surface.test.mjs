import assert from 'node:assert/strict';
import {
  GIVING_AIA_SURFACE_BINDING,
  GIVING_AIA_SURFACE_REFERENCE,
  GIVING_OBSERVATION_APERTURE_SCHEMA,
  compileGivingAiaProjectionFamily,
  installGivingAiaSurface
} from '../app/giving/history/giving-aia-surface.js';

async function phaseReceipt(name) {
  if (process.env.GITHUB_ACTIONS !== 'true') return;
  const { mkdir, writeFile } = await import('node:fs/promises');
  await mkdir('artifacts/giving-contract-markers', { recursive: true });
  await writeFile(`artifacts/giving-contract-markers/aia-${name}.pass`, 'PASS\n');
}

class FakeDocument extends EventTarget {
  constructor() {
    super();
    this.documentElement = { dataset: {} };
  }
}

class FakeRuntime extends EventTarget {
  constructor() {
    super();
    this.document = new FakeDocument();
    this.CustomEvent = CustomEvent;
    this.__TD613_GIVING_APERTURE_CONTEXT = null;
  }
}

const aperture = {
  schema: GIVING_OBSERVATION_APERTURE_SCHEMA,
  selected_source_count: 4,
  selected_source_ids: ['fec-schedule-a', 'fl-soe', 'voterfocus-jax', 'easyvote-duval'],
  date_from: '2020-01-01',
  date_to: '2026-08-17',
  exact_match: true,
  alias_count: 2,
  amount_min_present: false,
  amount_max_present: true,
  practice_mode: false,
  query_identity_redacted: true,
  raw_records_included: false,
  donor_identity_included: false,
  authority_effect: 'NONE'
};

assert.equal(GIVING_AIA_SURFACE_BINDING.surface_reference, GIVING_AIA_SURFACE_REFERENCE);
assert.equal(GIVING_AIA_SURFACE_BINDING.host_station, 'Dome-World');
assert.equal(GIVING_AIA_SURFACE_BINDING.governance_context, 'TD613');
assert.deepEqual(GIVING_AIA_SURFACE_BINDING.routes, ['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']);
assert.equal(GIVING_AIA_SURFACE_BINDING.route_inference_forbidden, true);
assert.equal(GIVING_AIA_SURFACE_BINDING.authority.authority_may_cross, false);
assert.equal(GIVING_AIA_SURFACE_BINDING.authority.human_closure_required, true);
await phaseReceipt('binding');

const family = compileGivingAiaProjectionFamily({
  governed_reference: 'test-cycle-1',
  source_instance_count: 4,
  source_receipt_count: 4,
  held_route_count: 1,
  aperture_context_observed: true,
  observation_aperture: aperture,
  source_status: 'OBSERVED',
  observation_status: 'UNRESOLVED',
  missingness: ['HELD_SOURCE_ROUTE_PRESENT'],
  contradictions: [],
  authorized_actions: ['RESEARCH_REVIEW', 'DOSSIER_CUSTODY']
});
await phaseReceipt('family-compiled');
assert.equal(family.report.all_invariants_preserved, true);
assert.equal(family.report.all_surfaces_non_equivalent, true);
assert.equal(family.report.authority_transferred, false);
assert.equal(family.report.route_inference_forbidden, true);
await phaseReceipt('family-report');
assert.equal(family.projections.length, 4, 'observation aperture must not create a fifth AIA route');
assert.deepEqual(new Set(family.projections.map((projection) => projection.route)).size, 4);
assert.ok(family.projections.every((projection) => projection.user_level_score === null));
assert.ok(family.projections.every((projection) => projection.authority.authority_may_cross === false));
await phaseReceipt('family-shape');
assert.ok(family.projections.every((projection) => projection.invariants.provenance.source_instance_count === 4));
assert.ok(family.projections.every((projection) => projection.invariants.provenance.observation_aperture?.query_identity_redacted === true));
assert.ok(family.projections.every((projection) => projection.invariants.claim_ceiling.includes('ABSENCE_OUTSIDE_OBSERVATION_APERTURE_UNRESOLVED')));
await phaseReceipt('family-invariants');
await phaseReceipt('family');

const runtime = new FakeRuntime();
const updates = [];
runtime.addEventListener('td613:giving:aia-updated', (event) => updates.push(event.detail));
const api = installGivingAiaSurface(runtime);
assert.equal(api.revision, 0);
assert.equal(api.receipt.raw_records_included, false);
assert.equal(api.receipt.donor_identity_included, false);
assert.equal(api.receipt.observation_aperture_present, false);
assert.equal(runtime.document.documentElement.dataset.givingAiaSurface, 'bound');
assert.equal(runtime.document.documentElement.dataset.givingAiaObservationAperture, 'missing');

runtime.document.dispatchEvent(new CustomEvent('td613:giving-run-settled', {
  detail: {
    schema: 'td613.giving.run-settled/v1',
    cycle_id: 'giving-run-7',
    status: 'HELD',
    source_states: [
      { source_id: 'one', label: 'Source one', status: 'COMPLETE' },
      { source_id: 'two', label: 'Source two', status: 'PARTIAL' },
      { source_id: 'three', label: 'Source three', status: 'COMPLETE' }
    ],
    held_sources: [
      { source_id: 'two', label: 'Source two', status: 'PARTIAL' }
    ],
    observation_aperture: {
      ...aperture,
      selected_source_count: 3,
      selected_source_ids: ['one', 'two', 'three']
    }
  }
}));

assert.equal(api.revision, 1, 'settled Giving runs must mechanically advance the AIA runtime');
assert.equal(api.receipt.governed_reference, 'giving-run-7');
assert.equal(api.receipt.source_instance_count, 3);
assert.equal(api.receipt.source_receipt_count, 3);
assert.equal(api.receipt.held_route_count, 1);
assert.equal(api.receipt.observation_status, 'UNRESOLVED');
assert.equal(api.receipt.observation_aperture_present, true);
assert.equal(api.receipt.observation_selected_source_count, 3);
assert.equal(api.receipt.observation_exact_match, true);
assert.equal(api.receipt.observation_practice_mode, false);
assert.equal(api.receipt.absence_outside_aperture_unresolved, true);
assert.equal(api.receipt.query_identity_redacted, true);
assert.equal(api.receipt.route_count, 4);
assert.equal(api.receipt.all_invariants_preserved, true);
assert.equal(api.receipt.all_surfaces_non_equivalent, true);
assert.equal(api.receipt.authority_transferred, false);
assert.equal(api.receipt.raw_records_included, false);
assert.equal(api.receipt.donor_identity_included, false);
assert.equal(runtime.document.documentElement.dataset.givingAiaRevision, '1');
assert.equal(runtime.document.documentElement.dataset.givingAiaObservation, 'unresolved');
assert.equal(runtime.document.documentElement.dataset.givingAiaObservationAperture, 'qualified');
assert.equal(updates.length, 1);
assert.equal(updates[0].reason, 'giving-run-settled');
assert.equal(updates[0].receipt.held_route_count, 1);
await phaseReceipt('runtime');

const audit = api.project('AUDIT');
assert.equal(audit.route, 'AUDIT');
assert.equal(audit.surface.receipts.held_route_count, 1);
assert.deepEqual(audit.surface.missingness, ['HELD_SOURCE_ROUTE_PRESENT']);
assert.equal(audit.surface.observation_aperture.query_identity_redacted, true);
assert.deepEqual(audit.surface.observation_aperture.selected_source_ids, ['one', 'two', 'three']);
assert.match(audit.surface.negative_observation_ceiling, /Absence outside that aperture remains unresolved/);
assert.equal(audit.surface.abstention, 'Unresolved or withheld source state remains unresolved or withheld.');
assert.equal(audit.authority.automatic_release, false);
assert.equal(audit.authority.human_closure_required, true);
await phaseReceipt('audit');

console.log('giving-aia-surface.test.mjs passed: four canonical AIA routes preserve bounded observation aperture, negative-space claim ceiling, and zero authority transfer.');