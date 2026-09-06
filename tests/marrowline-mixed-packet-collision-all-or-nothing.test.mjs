import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  MARROWLINE_MIXED_PACKET_COLLISION_ALL_OR_NOTHING_ASSAY_SCHEMA,
  MARROWLINE_MIXED_PACKET_COLLISIONS,
  runMarrowlineMixedPacketCollisionAllOrNothingAssay
} from '../scripts/marrowline-mixed-packet-collision-all-or-nothing-assay.mjs';

const report=runMarrowlineMixedPacketCollisionAllOrNothingAssay();
assert.equal(report.schema,MARROWLINE_MIXED_PACKET_COLLISION_ALL_OR_NOTHING_ASSAY_SCHEMA);
assert.equal(report.status,'PASS');
assert.equal(report.assay_local_only,true);
assert.deepEqual(MARROWLINE_MIXED_PACKET_COLLISIONS.map(x=>x.id),['D_ABA','D_BAB']);
assert.deepEqual(report.collisions.D_ABA.valid_prefix_rule_ids,['EMAIL_IDENTIFIER','USER_DECLARED_PROTECTED_TERM']);
assert.deepEqual(report.collisions.D_BAB.valid_prefix_rule_ids,['USER_DECLARED_PROTECTED_TERM','EMAIL_IDENTIFIER']);
for (const id of ['D_ABA','D_BAB']) {
  const c=report.collisions[id];
  assert.equal(c.rejected,true);
  assert.equal(c.carry_case_returned,false);
  assert.equal(c.transport_receipt_returned,false);
  assert.equal(c.hosted_findings_returned,false);
}
assert.equal(report.collisions.D_ABA.error,'duplicate portable finding: EMAIL_IDENTIFIER');
assert.equal(report.collisions.D_BAB.error,'duplicate portable finding: USER_DECLARED_PROTECTED_TERM');
for (const id of ['P_AB_AFTER_D_ABA_1','P_AB_AFTER_D_BAB','P_AB_AFTER_D_ABA_2']) {
  const p=report.recoveries[id];
  assert.deepEqual(p.finding_rule_ids,['EMAIL_IDENTIFIER','USER_DECLARED_PROTECTED_TERM']);
  assert.equal(p.finding_count,2);
  assert.deepEqual(p.matching_statuses,{A:'PRESENT_TO_HUMAN',B:'PRESENT_TO_HUMAN'});
  assert.deepEqual(p.mismatch_statuses,{A:'HOLD',B:'HOLD'});
  assert.deepEqual(p.forbidden_transport_paths,[]);
  assert.equal(p.release_authority,false);
  assert.equal(p.human_closure_required,true);
  assert.equal(p.local_binding_carried,false);
}
assert.deepEqual(report.recoveries.P_AB_AFTER_D_ABA_1.source_packet,report.recoveries.P_AB_AFTER_D_BAB.source_packet);
assert.deepEqual(report.recoveries.P_AB_AFTER_D_ABA_1.carry_case,report.recoveries.P_AB_AFTER_D_ABA_2.carry_case);
for (const key of ['late_duplicate_a_rejected','late_duplicate_b_rejected','valid_prefix_never_returns_partial_carry_case','no_transport_receipt_from_rejected_packet','no_hosted_findings_from_rejected_packet','lawful_pair_matches_parent','repeated_mixed_collision_nonpoisoning','collision_identity_does_not_change_pair_recovery']) assert.equal(report[key],true);
assert.equal(report.hidden_prefix_state_carried,false);
assert.equal(report.browser_persistence_required,false);
assert.equal(report.authority.release_authority,false);
assert.equal(report.authority.human_closure_required,true);
assert.equal(report.authority.provider_call_performed,false);
assert.equal(report.authority.production_mutation,false);
assert.equal(report.claim_ceiling,'bounded-two-rule-late-duplicate-mixed-packet-construction-all-or-nothing-only');

const assaySource=fs.readFileSync('scripts/marrowline-mixed-packet-collision-all-or-nothing-assay.mjs','utf8');
const compilerSource=fs.readFileSync('app/dome-world/marrowline-pocket-hosted-carry-case.js','utf8');
assert.match(assaySource,/late mixed collision returned a partial or complete Carry Case/);
assert.match(assaySource,/Late mixed collision poisoned subsequent lawful P_AB recovery/);
assert.match(assaySource,/bounded-two-rule-late-duplicate-mixed-packet-construction-all-or-nothing-only/);
assert.match(compilerSource,/const validated = \[\];/);
assert.match(compilerSource,/if \(seen\.has\(ruleId\)\) throw new TypeError\(`duplicate portable finding: \$\{ruleId\}`\);/);
assert.match(compilerSource,/const validated = validatePocketPacket\(packet\);\n  const receipt = buildTransportReceipt\(validated\);/);
assert.doesNotMatch(assaySource,/\.filter\([^\n]*portable_findings|new Set\([^\n]*portable_findings/,'Hostile mixed packet may not be deduplicated before admission.');
console.log('Marrowline mixed-packet collision all-or-nothing hostile contract: PASS');

// Successor hostile contract: duplicate-rule rejection must remain construction-stage
// all-or-nothing at every position in the exact three-finding A/B permutation family.
// Every rejected permutation must leave the next lawful pair byte-stable.
await import('./marrowline-duplicate-position-permutation-closure.test.mjs');
