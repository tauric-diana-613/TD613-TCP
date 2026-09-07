import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  MARROWLINE_VALIDATION_LAYER_HOSTILE_CASE_IDS,
  MARROWLINE_VALIDATION_LAYER_PRECEDENCE_ASSAY_SCHEMA,
  MARROWLINE_VALIDATION_LAYER_REPLAY_ORDER,
  MARROWLINE_VALIDATION_LAYER_SUFFIX_CLASSES,
  runMarrowlineValidationLayerPrecedenceAssay
} from '../scripts/marrowline-validation-layer-precedence-assay.mjs';

const report = runMarrowlineValidationLayerPrecedenceAssay();

assert.equal(report.schema, MARROWLINE_VALIDATION_LAYER_PRECEDENCE_ASSAY_SCHEMA);
assert.equal(report.status, 'PASS');
assert.equal(report.assay_local_only, true);
assert.deepEqual(MARROWLINE_VALIDATION_LAYER_HOSTILE_CASE_IDS, [
  'EARLY_S0', 'EARLY_S1', 'EARLY_S2', 'EARLY_S3', 'EARLY_S4',
  'LATE_S0', 'LATE_S1', 'LATE_S2', 'LATE_S3', 'LATE_S4'
]);
assert.deepEqual(MARROWLINE_VALIDATION_LAYER_SUFFIX_CLASSES, [
  'S0_CLEAN_CANONICAL',
  'S1_GLOBAL_FORBIDDEN_KEY',
  'S2_GLOBAL_DIGEST_STRING',
  'S3_SEQUENTIAL_UNSUPPORTED_RULE',
  'S4_SEQUENTIAL_SAFE_SHAPE_DRIFT'
]);
assert.deepEqual(MARROWLINE_VALIDATION_LAYER_REPLAY_ORDER, [
  'LATE_S4', 'LATE_S3', 'LATE_S2', 'LATE_S1', 'LATE_S0',
  'EARLY_S4', 'EARLY_S3', 'EARLY_S2', 'EARLY_S1', 'EARLY_S0'
]);
assert.deepEqual(report.primary_order, MARROWLINE_VALIDATION_LAYER_HOSTILE_CASE_IDS);
assert.deepEqual(report.replay_order, MARROWLINE_VALIDATION_LAYER_REPLAY_ORDER);

const primary = Object.fromEntries(report.primary_cases.map(item => [item.case_id, item]));
const replay = Object.fromEntries(report.replay_cases.map(item => [item.case_id, item]));

for (const id of MARROWLINE_VALIDATION_LAYER_HOSTILE_CASE_IDS) {
  assert.ok(primary[id], `missing primary hostile case ${id}`);
  assert.ok(replay[id], `missing replay hostile case ${id}`);
  assert.deepEqual(primary[id], replay[id], `${id} changed under replay`);
  assert.equal(primary[id].rejection.rejected, true);
  assert.equal(primary[id].rejection.carry_case_returned, false);
  assert.equal(primary[id].rejection.transport_receipt_returned, false);
  assert.equal(primary[id].rejection.hosted_findings_returned, false);
  assert.equal(primary[id].partial_transport_returned, false);
  assert.equal(primary[id].pair_recovery_stable, true);
  assert.equal(primary[id].c_recovery_stable, true);
}

for (const prefix of ['EARLY', 'LATE']) {
  const suffixIndex = prefix === 'EARLY' ? 2 : 3;
  assert.equal(primary[`${prefix}_S0`].expected_validation_layer, 'SEQUENTIAL_DUPLICATE');
  assert.equal(primary[`${prefix}_S0`].rejection.error, 'duplicate portable finding: EMAIL_IDENTIFIER');

  assert.equal(primary[`${prefix}_S1`].expected_validation_layer, 'PACKET_WIDE_FORBIDDEN_KEY');
  assert.equal(
    primary[`${prefix}_S1`].rejection.error,
    `Pocket packet.portable_findings[${suffixIndex}].raw_message is forbidden on the carry-case route`
  );

  assert.equal(primary[`${prefix}_S2`].expected_validation_layer, 'PACKET_WIDE_DIGEST_STRING');
  assert.equal(
    primary[`${prefix}_S2`].rejection.error,
    `Pocket packet.portable_findings[${suffixIndex}].note contains a digest-like transport carrier`
  );

  for (const suffix of ['S3', 'S4']) {
    assert.equal(primary[`${prefix}_${suffix}`].expected_validation_layer, 'SEQUENTIAL_DUPLICATE');
    assert.equal(primary[`${prefix}_${suffix}`].rejection.error, 'duplicate portable finding: EMAIL_IDENTIFIER');
  }
}

const reach = report.reachability_controls;
assert.equal(reach.S0.admitted, true);
assert.deepEqual(reach.S0.finding_rule_ids, ['EMAIL_IDENTIFIER', 'PRIVATE_KEY_BLOCK']);
assert.equal(reach.S1.rejected, true);
assert.equal(reach.S1.error, 'Pocket packet.portable_findings[1].raw_message is forbidden on the carry-case route');
assert.equal(reach.S2.rejected, true);
assert.equal(reach.S2.error, 'Pocket packet.portable_findings[1].note contains a digest-like transport carrier');
assert.equal(reach.S3.rejected, true);
assert.equal(reach.S3.error, 'portable_findings[1] has unsupported rule_id');
assert.equal(reach.S4.rejected, true);
assert.equal(reach.S4.error, 'portable_findings[1] differs from canonical Local Pocket projection');

assert.deepEqual(report.lawful_baselines.P_AB.finding_rule_ids, ['EMAIL_IDENTIFIER', 'USER_DECLARED_PROTECTED_TERM']);
assert.equal(report.lawful_baselines.P_AB.finding_count, 2);
assert.equal(report.lawful_baselines.P_AB.A.matching_status, 'PRESENT_TO_HUMAN');
assert.equal(report.lawful_baselines.P_AB.A.mismatch_status, 'HOLD');
assert.equal(report.lawful_baselines.P_AB.B.matching_status, 'PRESENT_TO_HUMAN');
assert.equal(report.lawful_baselines.P_AB.B.mismatch_status, 'HOLD');
assert.deepEqual(report.lawful_baselines.P_C.finding_rule_ids, ['PRIVATE_KEY_BLOCK']);
assert.equal(report.lawful_baselines.P_C.finding_count, 1);
assert.equal(report.lawful_baselines.P_C.C.matching_status, 'PRESENT_TO_HUMAN');
assert.equal(report.lawful_baselines.P_C.C.mismatch_status, 'HOLD');

for (const key of [
  'packet_wide_preaudit_preempts_lexically_earlier_duplicate',
  'sequential_suffix_violations_masked_by_earlier_duplicate',
  'clean_suffix_preserves_duplicate_class',
  'reachability_controls_confirm_suffix_classes',
  'no_partial_transport_from_hostile_matrix',
  'lawful_pair_matches_1064_parent',
  'lawful_c_recovery_stable',
  'primary_replay_invariant'
]) assert.equal(report[key], true, `${key} must close`);

assert.equal(report.portable_validation_history_carried, false);
assert.equal(report.browser_persistence_required, false);
assert.equal(report.authority.release_authority, false);
assert.equal(report.authority.human_closure_required, true);
assert.equal(report.authority.provider_call_performed, false);
assert.equal(report.authority.production_mutation, false);
assert.equal(report.claim_ceiling, 'bounded-two-prefix-five-suffix-validation-layer-precedence-only');

const compilerSource = fs.readFileSync('app/dome-world/marrowline-pocket-hosted-carry-case.js', 'utf8');
const policySource = fs.readFileSync('app/dome-world/holonomy-loom-local-pocket-policy.js', 'utf8');
const assaySource = fs.readFileSync('scripts/marrowline-validation-layer-precedence-assay.mjs', 'utf8');

const preauditIndex = compilerSource.indexOf("assertNoForbiddenTransportCarrier(packet, 'Pocket packet');");
const seenIndex = compilerSource.indexOf('const seen = new Set();');
const duplicateIndex = compilerSource.indexOf('if (seen.has(ruleId)) throw new TypeError(`duplicate portable finding: ${ruleId}`);');
assert.ok(preauditIndex >= 0, 'packet-wide preaudit marker missing');
assert.ok(seenIndex > preauditIndex, 'seen-set must remain after packet-wide preaudit');
assert.ok(duplicateIndex > seenIndex, 'duplicate check must remain inside later sequential scan');
assert.match(compilerSource, /assertNoForbiddenTransportCarrier\(packet, 'Pocket packet'\)/);
assert.match(compilerSource, /if \(!HOLONOMY_LOOM_ADVISORY_RULES\[ruleId\]\) throw new TypeError/);
assert.match(compilerSource, /if \(!sameCanonicalValue\(finding, sourceProjection\.portable_payload\)\)/);
assert.match(policySource, /'rawMessage', 'raw_message'/);
assert.match(assaySource, /GLOBAL_FORBIDDEN_KEY/);
assert.match(assaySource, /GLOBAL_DIGEST_STRING/);
assert.match(assaySource, /SEQUENTIAL_UNSUPPORTED_RULE/);
assert.match(assaySource, /SEQUENTIAL_SAFE_SHAPE_DRIFT/);
assert.doesNotMatch(
  assaySource,
  /writeFileSync|writeFile\(|localStorage\.setItem|sessionStorage\.setItem|fetch\(|XMLHttpRequest|WebSocket/,
  'Validation-layer assay may not persist or perform network activity.'
);

console.log('Marrowline validation-layer precedence hostile contract: PASS');

// #1066 changes mechanism rather than extending Marrowline combinatorics. Its Static
// contract freezes the one-replacement/two-attempt A2–A5 native reacquisition falsifier.
await import('./ash-a2-a5-replacement-triggered-native-reacquisition.test.mjs');
