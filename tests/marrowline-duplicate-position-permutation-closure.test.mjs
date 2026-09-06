import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  MARROWLINE_DUPLICATE_POSITION_PERMUTATION_CLOSURE_ASSAY_SCHEMA,
  MARROWLINE_DUPLICATE_POSITION_PERMUTATIONS,
  runMarrowlineDuplicatePositionPermutationClosureAssay
} from '../scripts/marrowline-duplicate-position-permutation-closure-assay.mjs';

const report=runMarrowlineDuplicatePositionPermutationClosureAssay();

assert.equal(report.schema,MARROWLINE_DUPLICATE_POSITION_PERMUTATION_CLOSURE_ASSAY_SCHEMA);
assert.equal(report.status,'PASS');
assert.equal(report.assay_local_only,true);
assert.deepEqual(MARROWLINE_DUPLICATE_POSITION_PERMUTATIONS.map(x=>x.id),[
  'D_AAB','D_ABA','D_BAA','D_BBA','D_BAB','D_ABB'
]);
assert.deepEqual(MARROWLINE_DUPLICATE_POSITION_PERMUTATIONS.map(x=>x.duplicate_index),[1,2,2,1,2,2]);

for (const spec of MARROWLINE_DUPLICATE_POSITION_PERMUTATIONS) {
  const expectedError=`duplicate portable finding: ${spec.repeated_rule_id}`;
  for (const phase of ['forward','reverse']) {
    const collision=report[phase].collisions[spec.id];
    const recovery=report[phase].recoveries[spec.id];
    assert.equal(collision.rejected,true);
    assert.equal(collision.error,expectedError);
    assert.equal(collision.carry_case_returned,false);
    assert.equal(collision.transport_receipt_returned,false);
    assert.equal(collision.hosted_findings_returned,false);
    assert.equal(collision.duplicate_index,spec.duplicate_index);
    assert.deepEqual(recovery.finding_rule_ids,['EMAIL_IDENTIFIER','USER_DECLARED_PROTECTED_TERM']);
    assert.equal(recovery.finding_count,2);
    assert.deepEqual(recovery.matching_statuses,{A:'PRESENT_TO_HUMAN',B:'PRESENT_TO_HUMAN'});
    assert.deepEqual(recovery.mismatch_statuses,{A:'HOLD',B:'HOLD'});
    assert.deepEqual(recovery.forbidden_transport_paths,[]);
    assert.equal(recovery.release_authority,false);
    assert.equal(recovery.human_closure_required,true);
    assert.equal(recovery.local_binding_carried,false);
  }
  assert.deepEqual(report.forward.collisions[spec.id],report.reverse.collisions[spec.id]);
  assert.deepEqual(report.forward.recoveries[spec.id].source_packet,report.reverse.recoveries[spec.id].source_packet);
  assert.deepEqual(report.forward.recoveries[spec.id].carry_case,report.reverse.recoveries[spec.id].carry_case);
}

assert.equal(new Set(Object.values(report.forward.collisions).map(x=>x.source_packet.sha256)).size,6);

for (const key of [
  'all_six_position_permutations_rejected',
  'duplicate_position_does_not_change_rejection_class',
  'no_partial_transport_from_any_position',
  'lawful_pair_matches_parent',
  'forward_reverse_replay_invariant',
  'repeated_position_collision_nonpoisoning',
  'hostile_source_packets_distinguishable'
]) assert.equal(report[key],true);

assert.equal(report.hidden_duplicate_position_state_carried,false);
assert.equal(report.browser_persistence_required,false);
assert.equal(report.authority.release_authority,false);
assert.equal(report.authority.human_closure_required,true);
assert.equal(report.authority.provider_call_performed,false);
assert.equal(report.authority.production_mutation,false);
assert.equal(report.claim_ceiling,'bounded-two-rule-three-finding-all-six-duplicate-position-permutation-rejection-only');

const assaySource=fs.readFileSync('scripts/marrowline-duplicate-position-permutation-closure-assay.mjs','utf8');
const compilerSource=fs.readFileSync('app/dome-world/marrowline-pocket-hosted-carry-case.js','utf8');
assert.match(assaySource,/duplicate-position permutation returned a partial or complete Carry Case/);
assert.match(assaySource,/duplicate-position rejection poisoned later lawful P_AB/);
assert.match(assaySource,/bounded-two-rule-three-finding-all-six-duplicate-position-permutation-rejection-only/);
assert.match(compilerSource,/const validated = \[\];/);
assert.match(compilerSource,/if \(seen\.has\(ruleId\)\) throw new TypeError\(`duplicate portable finding: \$\{ruleId\}`\);/);
assert.match(compilerSource,/const validated = validatePocketPacket\(packet\);\n  const receipt = buildTransportReceipt\(validated\);/);
assert.doesNotMatch(assaySource,/\.filter\([^\n]*portable_findings|new Set\([^\n]*portable_findings/,
  'Hostile permutation may not be deduplicated before compiler admission.');

console.log('Marrowline duplicate-position permutation closure hostile contract: PASS');

// Successor hostile contract: once the construction-position family is closed, change
// scientific coordinates to the exact finite return schedules. Return order, omission,
// repetition, and local HOLD may not transfer sibling authority or create portable memory.
await import('./marrowline-finite-return-schedule-closure.test.mjs');
