import assert from 'node:assert/strict';

import {
  INVERTIBILITY_ADMISSIBILITY_OBSTRUCTION_SCHEMA,
  endpointMass,
  runInvertibilityAdmissibilityObstructionAssay,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-invertibility-admissibility-obstruction.js';

const result = runInvertibilityAdmissibilityObstructionAssay();

assert.equal(result.schema, INVERTIBILITY_ADMISSIBILITY_OBSTRUCTION_SCHEMA);
assert.equal(result.passed, true, 'The preregistered invertibility admissibility / monotone-obstruction assay must pass before classification.');
assert.equal(result.status, 'INVERTIBILITY_ADMISSIBILITY_OBSTRUCTION_ROUND_CLOSED');
assert.equal(
  result.canonical_classification,
  'STRICT_ENDPOINT_MASS_MONOTONICITY_OBSTRUCTS_NONIDENTITY_INVERSES_UNDER_DECLARED_TQ_GRAMMAR_ON_ANCHOR_REACHABLE_DOMAIN',
);

assert.equal(result.anchor_id, 'R_AB_S0');
assert.equal(result.control_representatives.all_reachable_and_typed, true);
assert.equal(result.control_representatives.rows.length, 8);
assert.deepEqual(result.control_representatives.failures, []);
assert.deepEqual(
  result.control_representatives.rows.map((row) => [row.actual_last_action, row.actual_forcing_season]),
  [
    ['B', 'S0'],
    ['B', 'S1'],
    ['B', 'S2'],
    ['B', 'S3'],
    ['Q_PHASE_PULSE', 'S0'],
    ['Q_PHASE_PULSE', 'S1'],
    ['Q_PHASE_PULSE', 'S2'],
    ['Q_PHASE_PULSE', 'S3'],
  ],
);
for (const row of result.control_representatives.rows) {
  assert.equal(row.typed, true);
  assert.equal(row.endpoint_mass, endpointMass(row.history));
}

assert.equal(result.local_transition_audit.exact_local_check_count, 16);
assert.equal(result.local_transition_audit.domain_closed, true);
assert.equal(result.local_transition_audit.strict_monotonicity, true);
assert.deepEqual(result.local_transition_audit.failures, []);
assert.ok(result.local_transition_audit.minimum_delta_mass > 0);
assert.ok(result.local_transition_audit.maximum_delta_mass >= result.local_transition_audit.minimum_delta_mass);
for (const row of result.local_transition_audit.rows) {
  assert.equal(row.domain_closed, true, `${row.source_control_key} --${row.generator}--> must remain in the authored control domain.`);
  assert.equal(row.strictly_increasing, true, `${row.source_control_key} --${row.generator}--> must strictly increase endpoint mass.`);
  assert.ok(row.delta_mass > 0);
  assert.equal(row.mass_after - row.mass_before, row.delta_mass);
}

assert.equal(result.strict_ranking_certificate.candidate, 'ENDPOINT_MASS');
assert.equal(result.strict_ranking_certificate.reachable_control_case_count, 8);
assert.equal(result.strict_ranking_certificate.local_transition_check_count, 16);
assert.equal(result.strict_ranking_certificate.control_domain_closed, true);
assert.equal(result.strict_ranking_certificate.every_nonidentity_generator_strictly_increases_mass, true);
assert.equal(result.strict_ranking_certificate.finite_word_induction_earned, true);
assert.equal(
  result.strict_ranking_certificate.consequence,
  'EVERY_NONEMPTY_FINITE_TQ_WORD_STRICTLY_INCREASES_ENDPOINT_MASS_ON_THE_AUTHORED_ANCHOR_REACHABLE_CONTROL_DOMAIN',
);

assert.equal(result.bounded_reverse_search.search_depth, 4);
assert.equal(result.bounded_reverse_search.no_reverse_word_found, true);
assert.deepEqual(result.bounded_reverse_search.reverse_hits, []);
assert.ok(result.bounded_reverse_search.search_rows.length > 0);
assert.equal(
  result.bounded_reverse_search.role,
  'CORROBORATION_ONLY_NOT_BASIS_OF_ALL_FINITE_WORD_OBSTRUCTION',
);

const stringReverse = result.counterfeit_reverse_controls.reversed_generator_string;
assert.equal(stringReverse.passed, true);
assert.equal(stringReverse.classification, 'REVERSED_GENERATOR_STRING_IS_NOT_AN_INVERSE_PATH');
assert.equal(stringReverse.returned_to_source, false);
assert.ok(stringReverse.forward_target_mass > stringReverse.source_mass);
assert.ok(stringReverse.reversed_from_target_mass > stringReverse.forward_target_mass);

assert.equal(result.counterfeit_reverse_controls.undeclared_T_INV.status, 'UNDECLARED_PATH_GENERATOR_ABSTAINS');
assert.equal(result.counterfeit_reverse_controls.undeclared_Q_INV.status, 'UNDECLARED_PATH_GENERATOR_ABSTAINS');

const custodyReplay = result.counterfeit_reverse_controls.custody_replay;
assert.equal(custodyReplay.retained_in_custody, true);
assert.equal(custodyReplay.operational_inverse_admitted, false);
assert.equal(custodyReplay.mutation_performed, false);
assert.equal(custodyReplay.classification, 'CUSTODY_REPLAY_IS_NOT_OPERATIONAL_INVERSE');

const temporal = result.counterfeit_reverse_controls.temporal_label_recurrence;
assert.equal(temporal.labels_recur, true);
assert.equal(temporal.inverse_evolution, false);
assert.ok(temporal.delta_mass > 0);
assert.equal(temporal.classification, 'TEMPORAL_LABEL_RECURRENCE_IS_NOT_INVERSE_EVOLUTION');

const erasure = result.counterfeit_reverse_controls.endpoint_erasure;
assert.equal(erasure.passed, true);
assert.equal(erasure.hostile_projection_looks_closed, true);
assert.equal(erasure.complete_operational_object_closes, false);
assert.ok(erasure.delta_mass > 0);
assert.equal(erasure.classification, 'ENDPOINT_ERASURE_MANUFACTURES_FALSE_PATH_CLOSURE');

assert.ok(result.inverse_equation_audit.nonidentity_parent_arrow_count > 0);
assert.equal(result.inverse_equation_audit.operational_inverse_candidates_found, 0);
assert.equal(result.inverse_equation_audit.both_sided_inverse_equations_testable, false);
assert.match(result.inverse_equation_audit.reason, /STRICT_RANKING_CERTIFICATE/);
assert.deepEqual(result.inverse_equation_audit.inverse_equations_required, ['r∘f=id_source', 'f∘r=id_target']);

assert.equal(result.parent_custody_unchanged, true);
assert.match(result.bounded_claim, /^IN_THE_AUTHORED_ANCHOR_REACHABLE_TQ_DOMAIN_/);
assert.equal(result.claim_ceiling.generic_irreversibility_theorem, false);
assert.equal(result.claim_ceiling.physical_entropy_interpretation, false);
assert.equal(result.claim_ceiling.energy_interpretation, false);
assert.equal(result.claim_ceiling.ambient_td613_no_groupoid_theorem, false);
assert.equal(result.claim_ceiling.new_reverse_generator, false);
assert.equal(result.claim_ceiling.inverse_morphism, false);
assert.equal(result.claim_ceiling.groupoid, false);
assert.equal(result.claim_ceiling.transport_or_connection, false);
assert.equal(result.claim_ceiling.loop_endomorphism_or_holonomy, false);
assert.equal(result.claim_ceiling.curvature, false);
assert.equal(result.claim_ceiling.proto_loom, false);
assert.equal(result.claim_ceiling.a16, false);
assert.equal(result.claim_ceiling.merge, false);
assert.equal(result.claim_ceiling.production, false);
assert.equal(result.claim_ceiling.vercel, false);
assert.equal(
  result.stop,
  'HUMAN_𝄐_REQUIRED_BEFORE_INTRODUCING_ANY_NEW_REVERSIBLE_GENERATOR_OR_COARSENING_THE_OPERATIONAL_OBJECT',
);

console.log('Ash A15-R0 Aperture × Pedagogue invertibility admissibility / monotone-obstruction tests passed.');
