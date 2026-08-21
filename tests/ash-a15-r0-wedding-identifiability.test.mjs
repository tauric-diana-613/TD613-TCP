import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildIdentifiabilityFrontierRegistry, IDENTIFIABILITY_FRONTIER_REGISTRY_SCHEMA } from '../app/dome-world/previews/a15-r0/identifiability-frontier-registry.js';
import {
  WEDDING_ALPHABET,
  WEDDING_IDENTIFIABILITY_ASSAY_SCHEMA,
  WEDDING_OBSERVATION_BUDGET,
  WEDDING_PROBES,
  buildWeddingLatentStates,
  runWeddingIdentifiabilityAssay,
  weddingForwardObservation
} from '../app/dome-world/previews/a15-r0/wedding-identifiability-assay.js';

const schema = JSON.parse(fs.readFileSync('app/dome-world/schemas/a15-r0/wedding-identifiability-assay-v01.schema.json', 'utf8'));
const source = fs.readFileSync('app/dome-world/previews/a15-r0/wedding-identifiability-assay.js', 'utf8');
const spec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/ASH_KEEP_A15_R0_WEDDING_IDENTIFIABILITY_ASSAY_SPEC_V0_1.md', 'utf8');

assert.equal(WEDDING_IDENTIFIABILITY_ASSAY_SCHEMA, 'td613.ash.a15-r0.wedding-identifiability-assay/v0.1');
assert.equal(schema.$id, WEDDING_IDENTIFIABILITY_ASSAY_SCHEMA);
assert.equal(schema.additionalProperties, false);
assert.deepEqual([...WEDDING_PROBES], ['D', 'Q', 'M']);
assert.deepEqual([...WEDDING_ALPHABET], [0, 1, 2]);
assert.equal(WEDDING_OBSERVATION_BUDGET, 12);

const states = buildWeddingLatentStates();
assert.equal(states.length, 27);
assert.equal(new Set(states.map(state => state.state_id)).size, 27);
assert.ok(states.every(state => Object.isFrozen(state)));

for (const state of states) {
  const observation = weddingForwardObservation(state, 'RELATIONAL_POSITIVE_CONTROL');
  assert.equal((observation.D + observation.Q + observation.M) % 3, state.t);
  const redundant = weddingForwardObservation(state, 'REDUNDANT_NEGATIVE_CONTROL');
  assert.equal(redundant.D, redundant.M);
}

assert.throws(() => weddingForwardObservation(states[0], 'UNKNOWN_FIXTURE'), /Unknown Wedding fixture/);
assert.throws(() => runWeddingIdentifiabilityAssay({ observation_budget: 10 }), /divisible by 6/);
assert.throws(() => runWeddingIdentifiabilityAssay({ noise_rate: 1 }), /\[0, 1\)/);
assert.throws(() => runWeddingIdentifiabilityAssay({ trials_per_state: 0 }), /positive integer/);

const assay = runWeddingIdentifiabilityAssay();
const replay = runWeddingIdentifiabilityAssay();
assert.deepEqual(replay, assay, 'seeded assay must be exactly reproducible');
assert.equal(assay.schema, WEDDING_IDENTIFIABILITY_ASSAY_SCHEMA);
assert.equal(assay.source_status, 'SIMULATED');
assert.equal(assay.fixture_class, 'DECLARED_SYNTHETIC_POSITIVE_AND_NEGATIVE_CONTROLS');
assert.equal(assay.authority_class, 'A2_DERIVATIONAL');
assert.equal(assay.state_count, 27);
assert.equal(assay.observation_budget, 12);
assert.equal(assay.noise_model.kind, 'SEEDED_CATEGORICAL_SUBSTITUTION_Z3');
assert.equal(assay.noise_model.substitution_probability, 0.12);
assert.equal(assay.noise_model.trials_per_state, 24);
assert.equal(assay.noise_model.seed, 613);
assert.equal(assay.conditions.length, 8);
assert.equal(assay.relationship_shuffle_marginals_preserved, true);
assert.deepEqual(assay.positive_probe_marginals, assay.shuffled_probe_marginals);

const positive = Object.fromEntries(assay.positive_control.conditions.map(condition => [condition.condition_id, condition]));
for (const id of ['D', 'Q', 'M']) {
  assert.equal(positive[id].exact_unique_recovery_rate, 0);
  assert.equal(positive[id].mean_candidate_set_size, 9);
  assert.equal(positive[id].maximum_candidate_set_size, 9);
  assert.equal(positive[id].repetitions_per_probe, 12);
}
for (const id of ['D+Q', 'D+M', 'Q+M']) {
  assert.equal(positive[id].exact_unique_recovery_rate, 0);
  assert.equal(positive[id].mean_candidate_set_size, 3);
  assert.equal(positive[id].maximum_candidate_set_size, 3);
  assert.equal(positive[id].repetitions_per_probe, 6);
}
assert.equal(positive['D+Q+M'].exact_unique_recovery_rate, 1);
assert.equal(positive['D+Q+M'].mean_candidate_set_size, 1);
assert.equal(positive['D+Q+M'].maximum_candidate_set_size, 1);
assert.equal(positive['D+Q+M'].repetitions_per_probe, 4);
assert.equal(positive['SHUFFLED(D+Q+M)'].repetitions_per_probe, 4);
assert.equal(assay.positive_control.best_pair_exact_recovery_rate, 0);
assert.equal(assay.positive_control.exact_gain_over_best_pair, 1);
assert.ok(assay.positive_control.intact_triple_noisy_recovery_rate > 0.5);
assert.ok(assay.positive_control.intact_triple_noisy_recovery_rate > assay.positive_control.best_pair_noisy_recovery_rate);
assert.ok(assay.positive_control.intact_triple_noisy_recovery_rate > assay.positive_control.shuffled_triple_noisy_recovery_rate);

const negative = Object.fromEntries(assay.negative_control.conditions.map(condition => [condition.condition_id, condition]));
assert.equal(negative['D+Q+M'].exact_unique_recovery_rate, 0);
assert.equal(negative['D+Q+M'].mean_candidate_set_size, 3);
assert.equal(assay.negative_control.intact_triple_noisy_recovery_rate, 0);
assert.equal(assay.negative_control.best_pair_noisy_recovery_rate, 0);
assert.equal(assay.negative_control.noisy_gain_over_best_pair, 0);

assert.equal(assay.assay_mechanism_validated, true);
assert.equal(assay.hypothesis_id, 'H_TRIPLE_IDENTIFIABILITY_SYNERGY');
assert.equal(assay.hypothesis_status, 'OPEN_UNMEASURED');
assert.equal(assay.promotion_authority, false);
assert.equal(assay.production_mutated, false);
assert.equal(assay.external_transmission, false);
assert.equal(assay.partial_information_decomposition_claim, false);
assert.equal(assay.emergence_claim, false);
assert.equal(assay.physical_geometry_claim, false);
assert.match(assay.claim_ceiling, /does not establish TD613 triple synergy/i);
assert.match(assay.finding, /live TD613 triple hypothesis remains OPEN_UNMEASURED/i);

const frontier = buildIdentifiabilityFrontierRegistry({ wedding: assay });
const extension = Object.fromEntries(frontier.extension_hypotheses.map(item => [item.hypothesis_id, item]));
assert.equal(frontier.schema, IDENTIFIABILITY_FRONTIER_REGISTRY_SCHEMA);
assert.equal(frontier.base_hypothesis_count, 9);
assert.equal(frontier.extension_hypotheses.length, 2);
assert.deepEqual(frontier.bounded_support, ['H_WEDDING_ASSAY_MECHANISM_VALID']);
assert.deepEqual(frontier.closed_by_counterexample, []);
assert.deepEqual(frontier.research_frontier, ['H_TRIPLE_IDENTIFIABILITY_SYNERGY']);
assert.equal(frontier.sequence_authority, false);
assert.equal(frontier.next_stage, null);
assert.deepEqual(frontier.stage_unlocks, []);
assert.equal(frontier.promotion_authority, false);
assert.equal(frontier.production_mutated, false);
assert.equal(frontier.external_transmission, false);
assert.equal(frontier.human_closure_required, true);
assert.equal(extension.H_WEDDING_ASSAY_MECHANISM_VALID.status, 'SUPPORTED_IN_BOUNDED_SYNTHETIC_FAMILY');
assert.equal(extension.H_WEDDING_ASSAY_MECHANISM_VALID.evidence.assay_mechanism_validated, true);
assert.equal(extension.H_WEDDING_ASSAY_MECHANISM_VALID.evidence.positive_exact_gain_over_best_pair, 1);
assert.equal(extension.H_TRIPLE_IDENTIFIABILITY_SYNERGY.status, 'OPEN_UNMEASURED');
assert.equal(extension.H_TRIPLE_IDENTIFIABILITY_SYNERGY.evidence.td613_d3_phi_m_forward_model, 'UNDECLARED');
assert.equal(extension.H_TRIPLE_IDENTIFIABILITY_SYNERGY.evidence.td613_d3_phi_m_measurement, 'UNMEASURED');
assert.match(frontier.finding, /remains OPEN_UNMEASURED/i);

assert.doesNotMatch(source, /Math\.random/);
assert.match(spec, /positive synthetic fixture passes[\s\S]*!= TD613 triple synergy established/i);
assert.match(spec, /relationship-shuffled\(D\+Q\+M\)/);
assert.match(spec, /redundant negative control/i);
assert.match(spec, /This assay is deliberately small enough to fail cheaply/i);

console.log(JSON.stringify({
  ok: true,
  schema: WEDDING_IDENTIFIABILITY_ASSAY_SCHEMA,
  state_count: assay.state_count,
  observation_budget: assay.observation_budget,
  positive_exact_gain_over_best_pair: assay.positive_control.exact_gain_over_best_pair,
  positive_noisy_gain_over_best_pair_positive: assay.positive_control.noisy_gain_over_best_pair > 0,
  positive_noisy_gain_over_shuffled_positive: assay.positive_control.noisy_gain_over_shuffled_triple > 0,
  relationship_shuffle_marginals_preserved: assay.relationship_shuffle_marginals_preserved,
  negative_noisy_gain_over_best_pair: assay.negative_control.noisy_gain_over_best_pair,
  assay_mechanism_validated: assay.assay_mechanism_validated,
  synthetic_mechanism_status: extension.H_WEDDING_ASSAY_MECHANISM_VALID.status,
  td613_triple_hypothesis_status: extension.H_TRIPLE_IDENTIFIABILITY_SYNERGY.status,
  promotion_authority: frontier.promotion_authority
}, null, 2));
