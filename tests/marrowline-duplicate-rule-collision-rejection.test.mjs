import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  MARROWLINE_DUPLICATE_RULE_COLLISION_REJECTION_ASSAY_SCHEMA,
  MARROWLINE_DUPLICATE_RULE_COLLISIONS,
  runMarrowlineDuplicateRuleCollisionRejectionAssay
} from '../scripts/marrowline-duplicate-rule-collision-rejection-assay.mjs';

const report = runMarrowlineDuplicateRuleCollisionRejectionAssay();

assert.equal(report.schema, MARROWLINE_DUPLICATE_RULE_COLLISION_REJECTION_ASSAY_SCHEMA);
assert.equal(report.status, 'PASS');
assert.equal(report.assay_local_only, true);
assert.deepEqual(MARROWLINE_DUPLICATE_RULE_COLLISIONS.map(item => item.id), ['D_AA', 'D_BB']);

assert.equal(report.collisions.D_AA.rejected, true);
assert.equal(report.collisions.D_AA.carry_case_returned, false);
assert.equal(report.collisions.D_AA.rule_id, 'EMAIL_IDENTIFIER');
assert.equal(report.collisions.D_AA.error, 'duplicate portable finding: EMAIL_IDENTIFIER');
assert.equal(report.collisions.D_BB.rejected, true);
assert.equal(report.collisions.D_BB.carry_case_returned, false);
assert.equal(report.collisions.D_BB.rule_id, 'USER_DECLARED_PROTECTED_TERM');
assert.equal(report.collisions.D_BB.error, 'duplicate portable finding: USER_DECLARED_PROTECTED_TERM');
assert.notEqual(report.collisions.D_AA.source_packet.sha256, report.collisions.D_BB.source_packet.sha256);

for (const id of [
  'P_A_AFTER_D_AA_1',
  'P_AB_AFTER_D_AA',
  'P_A_AFTER_D_AA_2',
  'P_B_AFTER_D_BB_1',
  'P_AB_AFTER_D_BB',
  'P_B_AFTER_D_BB_2'
]) {
  const recovery = report.recoveries[id];
  assert.deepEqual(recovery.forbidden_transport_paths, []);
  assert.equal(recovery.release_authority, false);
  assert.equal(recovery.human_closure_required, true);
  assert.equal(recovery.local_binding_carried, false);
}

assert.deepEqual(report.recoveries.P_A_AFTER_D_AA_1.matching_statuses, { A: 'PRESENT_TO_HUMAN' });
assert.deepEqual(report.recoveries.P_A_AFTER_D_AA_1.mismatch_statuses, { A: 'HOLD' });
assert.deepEqual(report.recoveries.P_A_AFTER_D_AA_2.matching_statuses, { A: 'PRESENT_TO_HUMAN' });
assert.deepEqual(report.recoveries.P_A_AFTER_D_AA_2.mismatch_statuses, { A: 'HOLD' });
assert.deepEqual(report.recoveries.P_B_AFTER_D_BB_1.matching_statuses, { B: 'PRESENT_TO_HUMAN' });
assert.deepEqual(report.recoveries.P_B_AFTER_D_BB_1.mismatch_statuses, { B: 'HOLD' });
assert.deepEqual(report.recoveries.P_B_AFTER_D_BB_2.matching_statuses, { B: 'PRESENT_TO_HUMAN' });
assert.deepEqual(report.recoveries.P_B_AFTER_D_BB_2.mismatch_statuses, { B: 'HOLD' });
assert.deepEqual(report.recoveries.P_AB_AFTER_D_AA.matching_statuses, { A: 'PRESENT_TO_HUMAN', B: 'PRESENT_TO_HUMAN' });
assert.deepEqual(report.recoveries.P_AB_AFTER_D_AA.mismatch_statuses, { A: 'HOLD', B: 'HOLD' });
assert.deepEqual(report.recoveries.P_AB_AFTER_D_BB.matching_statuses, { A: 'PRESENT_TO_HUMAN', B: 'PRESENT_TO_HUMAN' });
assert.deepEqual(report.recoveries.P_AB_AFTER_D_BB.mismatch_statuses, { A: 'HOLD', B: 'HOLD' });

assert.deepEqual(report.recoveries.P_A_AFTER_D_AA_1.source_packet, report.recoveries.P_A_AFTER_D_AA_2.source_packet);
assert.deepEqual(report.recoveries.P_A_AFTER_D_AA_1.carry_case, report.recoveries.P_A_AFTER_D_AA_2.carry_case);
assert.deepEqual(report.recoveries.P_B_AFTER_D_BB_1.source_packet, report.recoveries.P_B_AFTER_D_BB_2.source_packet);
assert.deepEqual(report.recoveries.P_B_AFTER_D_BB_1.carry_case, report.recoveries.P_B_AFTER_D_BB_2.carry_case);
assert.deepEqual(report.recoveries.P_AB_AFTER_D_AA.source_packet, report.recoveries.P_AB_AFTER_D_BB.source_packet);
assert.deepEqual(report.recoveries.P_AB_AFTER_D_AA.carry_case, report.recoveries.P_AB_AFTER_D_BB.carry_case);

assert.equal(report.duplicate_a_rejected, true);
assert.equal(report.duplicate_b_rejected, true);
assert.equal(report.collisions_fail_before_carry_case, true);
assert.equal(report.lawful_surfaces_match_parent, true);
assert.equal(report.repeated_collision_nonpoisoning, true);
assert.equal(report.collision_identity_does_not_change_pair_recovery, true);
assert.equal(report.matching_decision_invariant, true);
assert.equal(report.mismatch_decision_invariant, true);
assert.equal(report.hidden_collision_state_carried, false);
assert.equal(report.browser_persistence_required, false);
assert.equal(report.authority.release_authority, false);
assert.equal(report.authority.human_closure_required, true);
assert.equal(report.authority.provider_call_performed, false);
assert.equal(report.authority.production_mutation, false);
assert.equal(report.claim_ceiling, 'bounded-two-rule-duplicate-collision-rejection-nonpoisoning-only');

const assaySource = fs.readFileSync('scripts/marrowline-duplicate-rule-collision-rejection-assay.mjs', 'utf8');
const compilerSource = fs.readFileSync('app/dome-world/marrowline-pocket-hosted-carry-case.js', 'utf8');
assert.match(assaySource, /duplicate-rule collision was accepted into Carry Case construction/);
assert.match(assaySource, /Repeated D_AA rejection poisoned P_A replay/);
assert.match(assaySource, /Repeated D_BB rejection poisoned P_B replay/);
assert.match(assaySource, /bounded-two-rule-duplicate-collision-rejection-nonpoisoning-only/);
assert.match(compilerSource, /if \(seen\.has\(ruleId\)\) throw new TypeError\(`duplicate portable finding: \$\{ruleId\}`\);/);
assert.doesNotMatch(assaySource, /new Set\([^\n]*portable_findings|portable_findings[^\n]*\.filter\(/,
  'Collision assay may not deduplicate the hostile packet before compiler admission.');
assert.doesNotMatch(assaySource, /buildMarrowlinePocketHostedCarryCase\([^\n]*(collision|duplicate|history|occurrence|alias|schedule)/i,
  'Collision/history state may not enter Carry Case compiler input.');

console.log('Marrowline duplicate-rule collision rejection hostile contract: PASS');
