import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  MOSS_LANTERN_INDEPENDENT_PROBE_OFFSETS,
  MOSS_LANTERN_OBSERVATION_BUDGET,
  MOSS_LANTERN_REDUNDANT_PROBE_OFFSETS,
  MOSS_LANTERN_REFERENCE_IDENTIFIABILITY_SCHEMA,
  MOSS_LANTERN_REFERENCE_LENGTH,
  MOSS_LANTERN_REFERENCE_ONES,
  buildMossLanternReferenceFamily,
  runMossLanternReferenceIdentifiabilityAssay
} from '../app/dome-world/previews/a15-r0/moss-lantern-reference-identifiability.js';

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/pedagogue/ash-tomography-calibration-phantom-v01.json', 'utf8'));
const source = fs.readFileSync('app/dome-world/previews/a15-r0/moss-lantern-reference-identifiability.js', 'utf8');
const spec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/ASH_KEEP_A15_R0_MOSS_LANTERN_ML1_ML2_SPEC_V0_1.md', 'utf8');

assert.equal(MOSS_LANTERN_REFERENCE_IDENTIFIABILITY_SCHEMA, 'td613.ash.a15-r0.moss-lantern-reference-identifiability/v0.1');
assert.equal(MOSS_LANTERN_REFERENCE_LENGTH, 30);
assert.equal(MOSS_LANTERN_REFERENCE_ONES, 12);
assert.equal(MOSS_LANTERN_OBSERVATION_BUDGET, 18);
assert.deepEqual([...MOSS_LANTERN_INDEPENDENT_PROBE_OFFSETS], [0, 1, 2, 4, 7, 11, 16, 23, 27]);
assert.deepEqual([...MOSS_LANTERN_REDUNDANT_PROBE_OFFSETS], [0, 0, 1, 1, 2, 2, 4, 4, 7]);
assert.equal(new Set(MOSS_LANTERN_INDEPENDENT_PROBE_OFFSETS).size, 9);
assert.equal(new Set(MOSS_LANTERN_REDUNDANT_PROBE_OFFSETS).size, 5);

const references = buildMossLanternReferenceFamily();
assert.deepEqual(Object.keys(references), [
  'PERIODIC',
  'PHI_IRRATIONAL_ROTATION',
  'DETERMINISTIC_APERIODIC_CONTROL',
  'PERIODIC_QUASIPERIODIC_CROSSOVER'
]);
for (const reference of Object.values(references)) {
  assert.equal(reference.sequence.length, 30);
  assert.equal(reference.one_count, 12);
  assert.equal(reference.density_millipoints, 400);
  assert.ok(reference.sequence.every(value => value === 0 || value === 1));
}
assert.equal(references.PERIODIC.minimum_finite_period, 5);
assert.ok(references.PHI_IRRATIONAL_ROTATION.minimum_finite_period > 5);
assert.ok(references.DETERMINISTIC_APERIODIC_CONTROL.minimum_finite_period > 5);
assert.ok(references.PERIODIC_QUASIPERIODIC_CROSSOVER.minimum_finite_period > 5);
assert.equal(references.PHI_IRRATIONAL_ROTATION.phi_specific, true);
assert.equal(references.DETERMINISTIC_APERIODIC_CONTROL.generic_aperiodic_control, true);
assert.equal(references.PERIODIC_QUASIPERIODIC_CROSSOVER.crossover_control, true);

assert.throws(() => runMossLanternReferenceIdentifiabilityAssay({}), /canonical Moss Lantern/i);
assert.throws(() => runMossLanternReferenceIdentifiabilityAssay(fixture, { noise_rate: 1 }), /\[0, 1\)/);
assert.throws(() => runMossLanternReferenceIdentifiabilityAssay(fixture, { trials_per_state: 0 }), /positive integer/);
assert.throws(() => runMossLanternReferenceIdentifiabilityAssay(fixture, { repeats_per_probe: 0 }), /positive integer/);

const assay = runMossLanternReferenceIdentifiabilityAssay(fixture);
const replay = runMossLanternReferenceIdentifiabilityAssay(fixture);
assert.deepEqual(replay, assay, 'Moss Lantern ML1+ML2 assay must be exactly replayable under its declared seed.');
assert.equal(assay.schema, MOSS_LANTERN_REFERENCE_IDENTIFIABILITY_SCHEMA);
assert.equal(assay.source_status, 'SIMULATED');
assert.equal(assay.authority_class, 'A2_DERIVATIONAL');
assert.equal(assay.fixture_id, 'ash-loom.moss-lantern-calibration/v0.1');
assert.equal(assay.manifestly_fictional, true);
assert.equal(assay.route_content_fixed, true);
assert.deepEqual([...assay.expected_route_steps], fixture.expected_route_steps);
assert.equal(assay.expected_endpoint, fixture.expected_endpoint);
assert.equal(assay.latent_variable, 'REFERENCE_REGISTRY_OFFSET_ONLY');
assert.equal(assay.latent_state_count, 30);
assert.equal(assay.reference_one_count, 12);
assert.equal(assay.observation_budget, 18);
assert.equal(assay.noise_model.kind, 'SEEDED_BINARY_SUBSTITUTION');
assert.equal(assay.noise_model.substitution_probability, 0.10);
assert.equal(assay.noise_model.trials_per_state, 48);
assert.equal(assay.noise_model.repeats_per_probe, 2);
assert.equal(assay.noise_model.seed, 613);

const p = assay.results.PERIODIC.independent_probes;
const q = assay.results.PHI_IRRATIONAL_ROTATION.independent_probes;
const a = assay.results.DETERMINISTIC_APERIODIC_CONTROL.independent_probes;
const c = assay.results.PERIODIC_QUASIPERIODIC_CROSSOVER.independent_probes;
const qRedundant = assay.results.PHI_IRRATIONAL_ROTATION.redundant_probe_control;
const aRedundant = assay.results.DETERMINISTIC_APERIODIC_CONTROL.redundant_probe_control;

assert.equal(p.unique_registry_recovery_rate, 0);
assert.equal(p.mean_candidate_set_size, 6);
assert.equal(q.unique_registry_recovery_rate, 0.866667);
assert.equal(q.mean_candidate_set_size, 1.133333);
assert.equal(a.unique_registry_recovery_rate, 1);
assert.equal(a.mean_candidate_set_size, 1);
assert.equal(c.unique_registry_recovery_rate, 0.933333);
assert.equal(c.mean_candidate_set_size, 1.066667);
assert.equal(p.noisy_exact_registry_recovery_rate, 0);
assert.equal(q.noisy_exact_registry_recovery_rate, 0.638194);
assert.equal(a.noisy_exact_registry_recovery_rate, 0.81875);
assert.equal(c.noisy_exact_registry_recovery_rate, 0.716667);
assert.equal(qRedundant.noisy_exact_registry_recovery_rate, 0.163194);
assert.equal(aRedundant.noisy_exact_registry_recovery_rate, 0.4);
assert.equal(q.observation_budget, qRedundant.observation_budget);
assert.equal(a.observation_budget, aRedundant.observation_budget);
assert.equal(q.unique_probe_position_count, 9);
assert.equal(qRedundant.unique_probe_position_count, 5);

assert.equal(assay.controls.density_matched, true);
assert.equal(assay.controls.periodic_minimum_finite_period, 5);
assert.equal(assay.controls.independent_unique_probe_positions, 9);
assert.equal(assay.controls.redundant_unique_probe_positions, 5);
assert.equal(assay.findings.structured_nonclosure_beats_periodic, true);
assert.equal(assay.findings.generic_aperiodic_beats_periodic, true);
assert.equal(assay.findings.phi_specific_advantage_over_generic_aperiodic, false);
assert.equal(assay.findings.probe_diversity_matters_under_matched_budget, true);
assert.equal(assay.findings.crossover_is_intermediate, true);
assert.equal(assay.findings.assay_mechanism_validated, true);
assert.equal(assay.hypothesis_status.H_NONREPETITION_REDUCES_REFERENCE_ALIASING, 'SUPPORTED_IN_BOUNDED_SYNTHETIC_REFERENCE_FIXTURE');
assert.equal(assay.hypothesis_status.H_PHI_SPECIFIC_ANTI_ALIASING_ADVANTAGE, 'NOT_SUPPORTED_IN_BOUNDED_SYNTHETIC_REFERENCE_FIXTURE');
assert.equal(assay.hypothesis_status.H_TD613_PHI_ANTI_ALIASING, 'OPEN_UNMEASURED');
assert.equal(assay.hypothesis_status.H_TD613_TRIPLE_IDENTIFIABILITY_SYNERGY, 'OPEN_UNMEASURED');

assert.equal(assay.observation_aperture.source_scope.count, 1);
assert.equal(assay.observation_aperture.practice_mode, true);
assert.equal(assay.observation_aperture.authority_effect, 'NONE');
assert.equal(assay.observation_aperture.scope_grants_authority, false);
assert.equal(assay.observation_aperture.human_closure_required, true);
assert.equal(assay.promotion_authority, false);
assert.equal(assay.production_mutated, false);
assert.equal(assay.live_ash_binding, false);
assert.equal(assay.proto_loom_implementation, false);
assert.equal(assay.transport_law_declared, false);
assert.equal(assay.geometric_holonomy_claim, false);
assert.equal(assay.physical_realization_claim, false);
assert.equal(assay.human_closure_required, true);
assert.match(assay.claim_ceiling, /does not establish phi optimality/i);
assert.doesNotMatch(source, /Math\.random/);
assert.match(spec, /generic aperiodic control/i);
assert.match(spec, /phi-specific advantage NOT SUPPORTED/i);
assert.match(spec, /Moss Lantern dedicated UI = NOT REQUIRED/i);

console.log(JSON.stringify({
  ok: true,
  schema: assay.schema,
  reference_length: assay.latent_state_count,
  reference_one_count: assay.reference_one_count,
  observation_budget: assay.observation_budget,
  periodic_mean_candidate_set_size: p.mean_candidate_set_size,
  phi_mean_candidate_set_size: q.mean_candidate_set_size,
  aperiodic_mean_candidate_set_size: a.mean_candidate_set_size,
  crossover_mean_candidate_set_size: c.mean_candidate_set_size,
  periodic_noisy_exact_registry_recovery_rate: p.noisy_exact_registry_recovery_rate,
  phi_noisy_exact_registry_recovery_rate: q.noisy_exact_registry_recovery_rate,
  aperiodic_noisy_exact_registry_recovery_rate: a.noisy_exact_registry_recovery_rate,
  crossover_noisy_exact_registry_recovery_rate: c.noisy_exact_registry_recovery_rate,
  phi_redundant_noisy_exact_registry_recovery_rate: qRedundant.noisy_exact_registry_recovery_rate,
  aperiodic_redundant_noisy_exact_registry_recovery_rate: aRedundant.noisy_exact_registry_recovery_rate,
  structured_nonclosure_beats_periodic: assay.findings.structured_nonclosure_beats_periodic,
  generic_aperiodic_beats_periodic: assay.findings.generic_aperiodic_beats_periodic,
  phi_specific_advantage_over_generic_aperiodic: assay.findings.phi_specific_advantage_over_generic_aperiodic,
  probe_diversity_matters_under_matched_budget: assay.findings.probe_diversity_matters_under_matched_budget,
  assay_mechanism_validated: assay.findings.assay_mechanism_validated,
  nonrepetition_status: assay.hypothesis_status.H_NONREPETITION_REDUCES_REFERENCE_ALIASING,
  phi_specific_status: assay.hypothesis_status.H_PHI_SPECIFIC_ANTI_ALIASING_ADVANTAGE,
  td613_phi_status: assay.hypothesis_status.H_TD613_PHI_ANTI_ALIASING,
  td613_triple_status: assay.hypothesis_status.H_TD613_TRIPLE_IDENTIFIABILITY_SYNERGY,
  promotion_authority: assay.promotion_authority
}, null, 2));
