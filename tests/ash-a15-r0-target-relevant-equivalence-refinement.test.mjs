import assert from 'node:assert/strict';
import {
  TARGET_REFINEMENT_FIXTURE,
  TARGET_RELEVANT_EQUIVALENCE_REFINEMENT_CERTIFICATE as C,
  targetPartition,
  unresolvedTargetPairs,
  evaluateTargetRelevantAcquisition
} from '../app/dome-world/previews/a15-r0/target-relevant-equivalence-refinement.js';

const base=targetPartition(TARGET_REFINEMENT_FIXTURE.hypotheses,TARGET_REFINEMENT_FIXTURE.frozen_regime);
assert.deepEqual(base,[['THETA_A','THETA_B','THETA_C'],['THETA_D']]);
assert.equal(unresolvedTargetPairs(base),3);

const useless=evaluateTargetRelevantAcquisition({candidate:TARGET_REFINEMENT_FIXTURE.candidates.NOVEL_BUT_USELESS});
assert.equal(useless.new_evidentiary_object,true);
assert.equal(useless.informationally_reducible_to_frozen_A,false);
assert.equal(useless.status,'NO_TARGET_REFINEMENT');
assert.equal(useless.base_unresolved_target_pairs,3);
assert.equal(useless.augmented_unresolved_target_pairs,3);
assert.equal(useless.target_relevant_pairs_resolved,0);
assert.equal(useless.strict_target_relevant_refinement,false);

const alreadySeparated=evaluateTargetRelevantAcquisition({candidate:TARGET_REFINEMENT_FIXTURE.candidates.ALREADY_SEPARATED_ONLY});
assert.equal(alreadySeparated.status,'NO_TARGET_REFINEMENT');
assert.equal(alreadySeparated.augmented_unresolved_target_pairs,3);
assert.equal(alreadySeparated.target_relevant_pairs_resolved,0);

const partial=evaluateTargetRelevantAcquisition({candidate:TARGET_REFINEMENT_FIXTURE.candidates.PARTIAL_SPLITTER});
assert.equal(partial.status,'TARGET_RELEVANT_EQUIVALENCE_REFINEMENT_EARNED');
assert.deepEqual(partial.augmented_partition,[['THETA_A'],['THETA_B','THETA_C'],['THETA_D']]);
assert.equal(partial.base_unresolved_target_pairs,3);
assert.equal(partial.augmented_unresolved_target_pairs,1);
assert.equal(partial.target_relevant_pairs_resolved,2);
assert.equal(partial.partial_identification,true);
assert.equal(partial.complete_identification,false);

const full=evaluateTargetRelevantAcquisition({candidate:TARGET_REFINEMENT_FIXTURE.candidates.FULL_SPLITTER});
assert.equal(full.status,'TARGET_RELEVANT_EQUIVALENCE_REFINEMENT_EARNED');
assert.equal(full.augmented_unresolved_target_pairs,0);
assert.equal(full.target_relevant_pairs_resolved,3);
assert.equal(full.partial_identification,false);
assert.equal(full.complete_identification,true);

assert.equal(C.status,'TARGET_RELEVANT_EQUIVALENCE_REFINEMENT_CRITERION_EARNED');
assert.equal(C.rest_symbol,'𝄐');
assert.equal(C.results.NOVEL_BUT_USELESS.status,'NO_TARGET_REFINEMENT');
assert.equal(C.results.ALREADY_SEPARATED_ONLY.status,'NO_TARGET_REFINEMENT');
assert.equal(C.results.PARTIAL_SPLITTER.partial_identification,true);
assert.equal(C.results.FULL_SPLITTER.complete_identification,true);
assert.deepEqual(C.exact_golden_egg_surfaces_added,[]);
assert.equal(C.empirical_credit_to_golden_egg,0);
assert.equal(C.golden_egg_earned,false);
assert.equal(C.sequence_authority,false);
assert.equal(C.merge_authority,false);
assert.equal(C.production_authority,false);
assert.equal(C.deployment_authority,false);
assert.equal(C.publication_authority,false);

const malformed=structuredClone(TARGET_REFINEMENT_FIXTURE.candidates.PARTIAL_SPLITTER);
malformed.likelihoods.THETA_A=[0.8,0.3];
assert.throws(()=>evaluateTargetRelevantAcquisition({candidate:malformed}),/VALID_LIKELIHOOD_REQUIRED/);

assert.throws(()=>evaluateTargetRelevantAcquisition({target_id:'',candidate:TARGET_REFINEMENT_FIXTURE.candidates.PARTIAL_SPLITTER}),/DECLARED_TARGET_REQUIRED/);

console.log('Target-relevant equivalence refinement tests passed.');
