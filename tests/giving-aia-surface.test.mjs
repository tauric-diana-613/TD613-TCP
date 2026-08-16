import assert from 'node:assert/strict';
import {
  GIVING_AIA_SURFACE_BINDING,
  GIVING_AIA_SURFACE_REFERENCE,
  compileGivingAiaProjectionFamily,
  installGivingAiaSurface
} from '../app/giving/history/giving-aia-surface.js';

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

assert.equal(GIVING_AIA_SURFACE_BINDING.surface_reference, GIVING_AIA_SURFACE_REFERENCE);
assert.equal(GIVING_AIA_SURFACE_BINDING.host_station, 'Dome-World');
assert.equal(GIVING_AIA_SURFACE_BINDING.governance_context, 'TD613');
assert.deepEqual(GIVING_AIA_SURFACE_BINDING.routes, ['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']);
assert.equal(GIVING_AIA_SURFACE_BINDING.route_inference_forbidden, true);
assert.equal(GIVING_AIA_SURFACE_BINDING.authority.authority_may_cross, false);
assert.equal(GIVING_AIA_SURFACE_BINDING.authority.human_closure_required, true);

const family = compileGivingAiaProjectionFamily({
  governed_reference: 'test-cycle-1',
  source_instance_count: 4,
  source_receipt_count: 4,
  held_route_count: 1,
  aperture_context_observed: true,
  source_status: 'OBSERVED',
  observation_status: 'UNRESOLVED',
  missingness: ['HELD_SOURCE_ROUTE_PRESENT'],
  contradictions: [],
  authorized_actions: ['RESEARCH_REVIEW', 'DOSSIER_CUSTODY']
});
assert.equal(family.report.all_invariants_preserved, true);
assert.equal(family.report.all_surfaces_non_equivalent, true);
assert.equal(family.report.authority_transferred, false);
assert.equal(family.report.route_inference_forbidden, true);
assert.equal(family.projections.length, 4);
assert.deepEqual(new Set(family.projections.map((projection) => projection.route)).size, 4);
assert.ok(family.projections.every((projection) => projection.user_level_score === null));
assert.ok(family.projections.every((projection) => projection.authority.authority_may_cross === false));
assert.ok(family.projections.every((projection) => projection.invariants.provenance.source_instance_count === 4));

const runtime = new FakeRuntime();
const updates = [];
runtime.addEventListener('td613:giving:aia-updated', (event) => updates.push(event.detail));
const api = installGivingAiaSurface(runtime);
assert.equal(api.revision, 0);
assert.equal(api.receipt.raw_records_included, false);
assert.equal(api.receipt.donor_identity_included, false);
assert.equal(runtime.document.documentElement.dataset.givingAiaSurface, 'bound');

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
    ]
  }
}));

assert.equal(api.revision, 1, 'settled Giving runs must mechanically advance the AIA runtime');
assert.equal(api.receipt.governed_reference, 'giving-run-7');
assert.equal(api.receipt.source_instance_count, 3);
assert.equal(api.receipt.source_receipt_count, 3);
assert.equal(api.receipt.held_route_count, 1);
assert.equal(api.receipt.observation_status, 'UNRESOLVED');
assert.equal(api.receipt.route_count, 4);
assert.equal(api.receipt.all_invariants_preserved, true);
assert.equal(api.receipt.all_surfaces_non_equivalent, true);
assert.equal(api.receipt.authority_transferred, false);
assert.equal(api.receipt.raw_records_included, false);
assert.equal(api.receipt.donor_identity_included, false);
assert.equal(runtime.document.documentElement.dataset.givingAiaRevision, '1');
assert.equal(runtime.document.documentElement.dataset.givingAiaObservation, 'unresolved');
assert.equal(updates.length, 1);
assert.equal(updates[0].reason, 'giving-run-settled');
assert.equal(updates[0].receipt.held_route_count, 1);

const audit = api.project('AUDIT');
assert.equal(audit.route, 'AUDIT');
assert.equal(audit.surface.receipts.held_route_count, 1);
assert.deepEqual(audit.surface.missingness, ['HELD_SOURCE_ROUTE_PRESENT']);
assert.equal(audit.surface.abstention, 'Unresolved or withheld source state remains unresolved or withheld.');
assert.equal(audit.authority.automatic_release, false);
assert.equal(audit.authority.human_closure_required, true);

console.log('giving-aia-surface.test.mjs passed');
