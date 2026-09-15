import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  classifyTypedEpistemicDeficit,
  auditTypedEpistemicDeficit
} from '../app/engine/aperture-v32-typed-epistemic-deficit.js';
import {
  singularValuePosture2
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-conditioning-widening.js';
import {
  classifyCovariance2,
  selectCorrelatedNoiseWidening
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-correlated-noise-geometry.js';
import {
  runAperturePedagogueReplayEnvelopeConsequenceAssay
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-replay-envelope-consequence.js';

const receiptPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/04-RECEIPTS/assays/2026-09-14-eclipse-omega-source-bound-stage-collapse-v08.json';
const operationPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/05-OPERATIONS/2026-09-14-ECLIPSE-OMEGA-SOURCE-BOUND-STAGE-COLLAPSE-V0_8.md';
const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
const operation = fs.readFileSync(operationPath, 'utf8');

assert.equal(receipt.schema, 'td613.eclipse-omega-source-bound-stage-collapse/v0.8');
assert.equal(receipt.authority.scientific_promotion, false);
assert.equal(receipt.authority.field_novelty, false);
assert.equal(receipt.authority.deployed_llm_architecture_inferred, false);
assert.equal(receipt.authority.external_monitoring_or_causal_link_inferred, false);
assert.equal(receipt.authority.copying_or_plagiarism_adjudication, false);
assert.equal(receipt.authority.deployment, false);
assert.equal(receipt.authority.vercel, false);

// Boundary A hostile control: the receipt wrapper may remain operationally useful,
// but across the declared fixture family it does not create a second scientific
// classification state. Class and disposition are preserved exactly.
const classifierFixtures = [
  { latent_dimension:2, current_rank:1, sigma_min:0, condition_number:2000, uncertainty_status:'VALID_DECLARED', sigma_min_floor:0.25, condition_number_ceiling:10 },
  { latent_dimension:2, current_rank:2, sigma_min:0.0007071065, condition_number:2000.0005, uncertainty_status:'VALID_DECLARED', sigma_min_floor:0.25, condition_number_ceiling:10 },
  { latent_dimension:2, current_rank:2, sigma_min:1, condition_number:1, uncertainty_status:'VALID_DECLARED', sigma_min_floor:0.25, condition_number_ceiling:10 },
  { latent_dimension:2, current_rank:1, sigma_min:0, condition_number:2000, uncertainty_status:'INCOMPLETE', sigma_min_floor:0.25, condition_number_ceiling:10 },
  { latent_dimension:2, current_rank:1, sigma_min:0, condition_number:2000, uncertainty_status:'INVALID', sigma_min_floor:0.25, condition_number_ceiling:10 }
];
for (const input of classifierFixtures) {
  const classification = classifyTypedEpistemicDeficit(input);
  const audit = auditTypedEpistemicDeficit({ ...input, threshold_authority:'V08_SOURCE_BOUND_CONTROL' });
  assert.equal(audit.deficit_class, classification.deficit_class, 'Audit wrapper may not manufacture a new deficit class.');
  assert.equal(audit.disposition, classification.disposition, 'Audit wrapper may not manufacture a new disposition.');
}
const wrapperBoundary = receipt.boundary_scores.find(item => item.id === 'TYPED_DEFICIT_CLASSIFIER_TO_AUDIT_RECEIPT');
assert.equal(wrapperBoundary.earned_scientific_boundary_score, 0);
assert.equal(wrapperBoundary.status, 'COLLAPSE_AS_INDEPENDENT_SCIENTIFIC_OPERATOR_RETAIN_AS_AUDIT_RECEIPT_BOUNDARY');

// Boundary B intervention: hold the measured operator posture fixed while changing
// only the declared threshold policy. The downstream classification must change,
// proving that measurement geometry and audit policy are separable surfaces.
const fixedPosture = singularValuePosture2([[1,0],[0,1]]);
assert.equal(fixedPosture.sigma_min, 1);
assert.equal(fixedPosture.condition_number_2, 1);
const permissiveAudit = auditTypedEpistemicDeficit({
  latent_dimension:2,
  current_rank:2,
  sigma_min:fixedPosture.sigma_min,
  condition_number:fixedPosture.condition_number_2,
  uncertainty_status:'VALID_DECLARED',
  sigma_min_floor:0.25,
  condition_number_ceiling:10,
  threshold_authority:'V08_PERMISSIVE_CONTROL'
});
const strictAudit = auditTypedEpistemicDeficit({
  latent_dimension:2,
  current_rank:2,
  sigma_min:fixedPosture.sigma_min,
  condition_number:fixedPosture.condition_number_2,
  uncertainty_status:'VALID_DECLARED',
  sigma_min_floor:1.01,
  condition_number_ceiling:10,
  threshold_authority:'V08_STRICT_CONTROL'
});
assert.equal(permissiveAudit.deficit_class, 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT');
assert.equal(permissiveAudit.disposition, 'ASK_NOTHING');
assert.equal(strictAudit.deficit_class, 'NUMERICAL_STABILITY_DEFICIT');
assert.equal(strictAudit.disposition, 'PROPOSE');
const postureBoundary = receipt.boundary_scores.find(item => item.id === 'SINGULAR_VALUE_POSTURE_TO_TYPED_DEFICIT_AUDIT');
assert.equal(postureBoundary.earned_scientific_boundary_score, 3);
assert.equal(postureBoundary.status, 'RETAIN_BOUNDED_STAGE_BOUNDARY');

// Boundary C terminal-equivalence control: invalid covariance and unresolved
// covariance both produce null selection, but stage-local typed diagnostics must
// retain distinct causes.
const validProbe = {
  probe_id:'P_ORTH',
  definition:'orthogonal y',
  gradient:[0,1],
  covariance:[[1,0.9],[0.9,1]],
  covariance_source_status:'DECLARED_SYNTHETIC_FULL_COVARIANCE'
};
const invalidProbe = {
  probe_id:'P_BAD',
  definition:'invalid covariance hostile control',
  gradient:[1,1],
  covariance:[[1,1.05],[1.05,1]],
  covariance_source_status:'DECLARED_SYNTHETIC_INVALID_CONTROL'
};
const missingProbe = {
  probe_id:'P_MISSING',
  definition:'unresolved covariance hostile control',
  gradient:[1,1],
  covariance:null,
  covariance_source_status:'UNRESOLVED'
};
const invalidClass = classifyCovariance2(invalidProbe.covariance);
assert.equal(invalidClass.positive_definite, false);
assert.equal(invalidClass.status, 'INVALID_NOISE_GEOMETRY_NOT_POSITIVE_DEFINITE');
const invalidSelection = selectCorrelatedNoiseWidening([validProbe, invalidProbe]);
const missingSelection = selectCorrelatedNoiseWidening([validProbe, missingProbe]);
assert.equal(invalidSelection.selected_probe_id, null);
assert.equal(missingSelection.selected_probe_id, null);
assert.equal(invalidSelection.selection_status, 'INVALID_NOISE_GEOMETRY_PRESENT_NO_SELECTION');
assert.equal(missingSelection.selection_status, 'NO_GLOBAL_WIDENING_SELECTION_MISSING_JOINT_NOISE_GEOMETRY');
assert.deepEqual(invalidSelection.invalid_probe_ids, ['P_BAD']);
assert.deepEqual(missingSelection.missing_joint_noise_probe_ids, ['P_MISSING']);
const geometryBoundary = receipt.boundary_scores.find(item => item.id === 'NOISE_GEOMETRY_VALIDITY_TO_WIDENING_SELECTION');
assert.equal(geometryBoundary.earned_scientific_boundary_score, 3);
assert.equal(geometryBoundary.status, 'RETAIN_BOUNDED_STAGE_BOUNDARY');

// Boundary D uses the repository's already-authored held-out consequence assay.
// Selection flips while candidate consequence surfaces stay locally smooth, and
// different held-out functionals prefer different candidates. Selection therefore
// may not be collapsed into validation or universal downstream quality.
const consequenceAssay = runAperturePedagogueReplayEnvelopeConsequenceAssay();
assert.equal(consequenceAssay.held_out_consequence.selected_question_flips, true);
assert.equal(consequenceAssay.held_out_consequence.functional_winners_stable_across_neighborhood, true);
assert.equal(consequenceAssay.held_out_consequence.mixed_functional_winners, true);
assert.equal(consequenceAssay.held_out_consequence.held_out_used_for_selection, false);
const consequenceBoundary = receipt.boundary_scores.find(item => item.id === 'QUESTION_SELECTION_TO_HELD_OUT_CONSEQUENCE_AUDIT');
assert.equal(consequenceBoundary.earned_scientific_boundary_score, 3);
assert.equal(consequenceBoundary.status, 'RETAIN_BOUNDED_STAGE_BOUNDARY');

assert.deepEqual(receipt.counts, {
  boundaries_examined:4,
  retained_bounded_stage_boundaries:3,
  collapsed_independent_scientific_operators:1,
  audit_or_receipt_boundaries_retained_without_operator_promotion:1
});
assert.equal(receipt.verdict, 'SOURCE_BOUND_REPOSITORY_EPISODES_SUPPORT_SELECTIVE_STAGE_RETENTION_NOT_NAMED_STAGE_PRESUMPTION');
for (const law of [
  'AUDIT_WRAPPER != INDEPENDENT_EPISTEMIC_OPERATOR',
  'RECEIPT_BOUNDARY != SCIENTIFIC_STAGE_BOUNDARY',
  'FIXED_OPERATOR_POSTURE + THRESHOLD_INTERVENTION_CAN_CHANGE_DISPOSITION',
  'NULL_SELECTION != UNIQUE_FAILURE_CAUSE',
  'INVALID_GEOMETRY != MISSING_GEOMETRY',
  'QUESTION_SELECTION != HELD_OUT_VALIDATION',
  'POLICY_BOUNDARY != PERFORMANCE_CLIFF',
  'SOURCE_BOUND_STAGE_VALUE != FIELD_NOVELTY'
]) assert.ok(receipt.laws.includes(law), `Receipt must preserve law: ${law}`);

assert.match(operation, /AUDIT_WRAPPER != INDEPENDENT_EPISTEMIC_OPERATOR/);
assert.match(operation, /NULL_SELECTION != UNIQUE_FAILURE_CAUSE/);
assert.match(operation, /QUESTION_SELECTION != HELD_OUT_VALIDATION/);
assert.match(operation, /3 retain bounded scientific stage value/);
assert.match(operation, /1 loses independent scientific-operator status/);

console.log('TD613 Eclipse–Omega source-bound stage-collapse assay v0.8 passed.');
