import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  FLOWCORE_OBSERVATION_APERTURE_SCHEMA,
  FLOWCORE_NEGATIVE_OBSERVATION_SCHEMA,
  compileObservationAperture,
  qualifyNegativeObservation,
  compareObservationApertures
} from '../app/engine/flowcore-observation-aperture.js';
import { comparePedagogueRouteMemory } from '../app/engine/flowcore-pedagogue-route-memory.js';

const giving = compileObservationAperture({
  source_ids: ['fec-schedule-a', 'fl-soe', 'voterfocus-jax', 'easyvote-duval'],
  source_count: 4,
  date_from: '2020-01-01',
  date_to: '2026-08-17',
  matching_posture: 'NORMALIZED_EXACT',
  filter_flags: { amount_min_present: false, amount_max_present: true },
  context_labels: ['Giving', 'individual-contributor'],
  practice_mode: false,
  identity_redacted: true
});

assert.equal(giving.schema, FLOWCORE_OBSERVATION_APERTURE_SCHEMA);
assert.equal(giving.source_scope.count, 4);
assert.equal(giving.temporal_window.from, '2020-01-01');
assert.equal(giving.temporal_window.to, '2026-08-17');
assert.equal(giving.matching_posture, 'NORMALIZED_EXACT');
assert.equal(giving.raw_content_included, false);
assert.equal(giving.identity_redacted, true);
assert.equal(giving.scope_grants_authority, false);
assert.equal(giving.universal_absence_claim_authorized, false);
assert.equal(giving.absence_outside_aperture_unresolved, true);

const givingNegative = qualifyNegativeObservation({
  observation: 'No matching record was observed in the selected Giving sources.',
  aperture: giving,
  alternatives: ['other source instances were not selected', 'a broader matching posture may surface additional records']
});
assert.equal(givingNegative.schema, FLOWCORE_NEGATIVE_OBSERVATION_SCHEMA);
assert.equal(givingNegative.absence_inside_aperture_observed, true);
assert.equal(givingNegative.absence_outside_aperture_unresolved, true);
assert.equal(givingNegative.universal_absence_claim_authorized, false);
assert.equal(givingNegative.causal_claim_authorized, false);
assert.equal(givingNegative.identity_claim_authorized, false);
assert.equal(givingNegative.authority_effect, 'NONE');
assert.equal(givingNegative.human_closure_required, true);

const ashFixture = JSON.parse(await readFile(new URL('./fixtures/pedagogue/ash-tomography-calibration-phantom-v01.json', import.meta.url), 'utf8'));
const ash = compileObservationAperture({
  source_ids: ['moss-lantern-practice-capsule'],
  source_count: 1,
  instrument_scope: ['pedagogue-route-memory-observer'],
  condition_scope: ['declared-route-ground-truth', 'controlled-projection-step-perturbation'],
  matching_posture: 'DECLARED_ROUTE_STEP_EXACT',
  filter_flags: { live_ash_runtime: false, raw_source_transport: false },
  context_labels: ['Ash Keep', 'Holonomy Loom', 'tomography-research-only'],
  practice_mode: true,
  identity_redacted: true
});
assert.equal(ash.schema, FLOWCORE_OBSERVATION_APERTURE_SCHEMA);
assert.equal(ash.instrument_scope[0], 'pedagogue-route-memory-observer');
assert.equal(ash.practice_mode, true);
assert.equal(ash.authority_effect, 'NONE');

const observedRoute = [...ashFixture.expected_route_steps];
observedRoute[2] = 'projection-bypass';
const routeComparison = comparePedagogueRouteMemory(ashFixture.expected_route_steps, observedRoute, {
  expectedEndpoint: ashFixture.expected_endpoint,
  observedEndpoint: ashFixture.expected_endpoint
});
assert.equal(routeComparison.endpoint_equivalent, true);
assert.equal(routeComparison.same_endpoint_not_same_history, true);
assert.ok(routeComparison.route_divergence_millipoints > 0);
assert.equal(routeComparison.math.geometric_holonomy_claim, false);
assert.equal(routeComparison.math.comparative_structural_measure_only, true);

const ashNegative = qualifyNegativeObservation({
  observation: 'The declared projection-observe step was not observed in the controlled route; projection-bypass occupied that step.',
  aperture: ash,
  alternatives: ['observer instrumentation error', 'fixture route perturbation', 'unrecorded route drift'],
  detection_limit: 'Only the declared five-step practice route and one controlled step substitution were observed.'
});
assert.equal(ashNegative.universal_absence_claim_authorized, false);
assert.equal(ashNegative.authority_effect, 'NONE');
assert.match(ashNegative.child_legible.exact, /may not become a universal absence/i);

const apertureComparison = compareObservationApertures(giving, ash);
assert.equal(apertureComparison.exact_scope_match, false);
assert.equal(apertureComparison.source_scope_changed, true);
assert.equal(apertureComparison.matching_posture_changed, true);
assert.equal(apertureComparison.same_result_does_not_imply_same_aperture, true);
assert.equal(apertureComparison.authority_effect, 'NONE');
assert.equal(apertureComparison.human_closure_required, true);

console.log('flowcore-observation-aperture.test.mjs passed: Giving and Ash/Loom preserve bounded observation scope, qualified absence, route history, and zero authority transfer.');