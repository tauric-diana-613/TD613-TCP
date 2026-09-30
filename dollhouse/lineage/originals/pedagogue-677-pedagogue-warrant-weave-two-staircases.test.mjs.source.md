import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_WARRANT_WEAVE_PARTIAL_ORDER_SCHEMA,
  evaluateWarrantWeave,
  runPedagogueWarrantWeaveTwoStaircasesGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-warrant-weave-two-staircases.js';
import {
  canonicalRuleSignature,
  makeSyntheticReplayWitness
} from '../app/dome-world/previews/a15-r0/pedagogue-warrant-genealogy-ghost-house.js';

function rule(rule_id, requires, produces) {
  const base = { rule_id, requires, produces, predeclared:true, admissible:true, replayable:true };
  return { ...base, replay_witness:makeSyntheticReplayWitness(base, `TEST:${canonicalRuleSignature(base)}`) };
}

const baseRules = [
  rule('AB', ['MEASUREMENT:A','MEASUREMENT:B'], 'IDENTIFIABILITY:W'),
  rule('CD', ['MEASUREMENT:C','MEASUREMENT:D'], 'IDENTIFIABILITY:W')
];
const baseEvidence = [
  { evidence_id:'A', warrants:['MEASUREMENT:A'] },
  { evidence_id:'B', warrants:['MEASUREMENT:B'] }
];
const centralEvents = [
  { event_id:'PINK', kind:'REMOVE_EVIDENCE', remove_evidence_ids:['A'] },
  { event_id:'BLUE', kind:'ADD_EVIDENCE', add_evidence:[
    { evidence_id:'C', warrants:['MEASUREMENT:C'] },
    { evidence_id:'D', warrants:['MEASUREMENT:D'] }
  ]}
];

const central = evaluateWarrantWeave({
  case_id:'DIRECT_TWO_STAIRCASES_CONTROL',
  baseline_evidence:baseEvidence,
  rules:baseRules,
  requested_warrant:'IDENTIFIABILITY:W',
  events:centralEvents,
  precedence_edges:[]
});
assert.equal(central.candidate, 'C4_WARRANT_WEAVE');
assert.equal(central.status, 'PARTIAL_ORDER_REPLAY_COMPLETE');
assert.equal(central.admissible_serialization_count, 2);
assert.deepEqual(new Set(central.serializations.map(item => item.join('>'))), new Set(['PINK>BLUE','BLUE>PINK']));
assert.equal(central.final_presence, 'IDENTIFIED_PRESENT');
assert.equal(central.final_snapshot_identified, true);
assert.equal(central.final_snapshot_fingerprints.length, 1);
assert.equal(central.transient_support_continuity, 'ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER');
assert.deepEqual(new Set(central.profiles.map(item => item.continuously_supported)), new Set([false,true]));
assert.equal(central.selected_serialization, null);
assert.equal(central.lexical_tiebreak_used, false);
assert.equal(central.deterministic_serialization_display_sort_only, true);
assert.equal(central.partial_order_preserved, true);
assert.equal(central.historical_authority_from_unidentified_precedence, false);
assert.equal(central.promotion_authority, false);
assert.equal(central.scalar_aggregation_used, false);

const withdrawFirst = evaluateWarrantWeave({
  case_id:'DIRECT_WITHDRAW_FIRST',
  baseline_evidence:baseEvidence,
  rules:baseRules,
  requested_warrant:'IDENTIFIABILITY:W',
  events:centralEvents,
  precedence_edges:[['PINK','BLUE']]
});
assert.equal(withdrawFirst.admissible_serialization_count, 1);
assert.deepEqual(withdrawFirst.serializations[0], ['PINK','BLUE']);
assert.equal(withdrawFirst.transient_support_continuity, 'IDENTIFIED_SUPPORT_INTERRUPTION');

const addFirst = evaluateWarrantWeave({
  case_id:'DIRECT_ADD_FIRST',
  baseline_evidence:baseEvidence,
  rules:baseRules,
  requested_warrant:'IDENTIFIABILITY:W',
  events:centralEvents,
  precedence_edges:[['BLUE','PINK']]
});
assert.equal(addFirst.admissible_serialization_count, 1);
assert.deepEqual(addFirst.serializations[0], ['BLUE','PINK']);
assert.equal(addFirst.transient_support_continuity, 'IDENTIFIED_CONTINUOUS_SUPPORT');

const cycle = evaluateWarrantWeave({
  case_id:'DIRECT_CYCLE',
  baseline_evidence:baseEvidence,
  rules:baseRules,
  requested_warrant:'IDENTIFIABILITY:W',
  events:centralEvents,
  precedence_edges:[['PINK','BLUE'],['BLUE','PINK']]
});
assert.equal(cycle.status, 'REJECT_CYCLIC_OR_INCONSISTENT_PRECEDENCE');
assert.deepEqual(cycle.serializations, []);
assert.equal(cycle.selected_serialization, null);
assert.equal(cycle.lexical_tiebreak_used, false);
assert.equal(cycle.promotion_authority, false);
assert.equal(cycle.scalar_aggregation_used, false);

assert.throws(() => evaluateWarrantWeave({
  case_id:'EVENT_CEILING',
  baseline_evidence:baseEvidence,
  rules:baseRules,
  requested_warrant:'IDENTIFIABILITY:W',
  events:Array.from({ length:9 }, (_, index) => ({ event_id:`E${index}`, kind:'NOOP' })),
  precedence_edges:[]
}), /event ceiling exceeded/);

const receipt = runPedagogueWarrantWeaveTwoStaircasesGauntlet();
assert.equal(receipt.schema, PEDAGOGUE_WARRANT_WEAVE_PARTIAL_ORDER_SCHEMA);
assert.equal(receipt.inherited_c3_serial_result_preserved, true);
assert.ok([
  'WARRANT_EPISODE_LEDGER_C3_FALSIFIED_AS_PARTIAL_ORDER_CUSTODY_SUFFICIENT_FORM',
  'C3_PARTIAL_ORDER_OVERCLAIM_NOT_ESTABLISHED_IN_THIS_RUN'
].includes(receipt.c3_partial_order_verdict));
assert.equal(receipt.candidate, 'C4_WARRANT_WEAVE');
assert.equal(receipt.candidate_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.ok([
  'WARRANT_WEAVE_CANDIDATE_SURVIVES_BOUNDED_TWO_STAIRCASES',
  'WARRANT_WEAVE_CANDIDATE_FALSIFIED_IN_BOUNDED_TWO_STAIRCASES'
].includes(receipt.candidate_verdict));

const { ts01, ts02, ts03, ts04, ts05, ts06, ts07, ts08, ts09, ts10 } = receipt.rooms;
assert.equal(ts01.case_id, 'TS01_TWO_STAIRCASES');
assert.equal(ts01.receipt.admissible_serialization_count, 2);
assert.equal(ts01.receipt.final_presence, 'IDENTIFIED_PRESENT');
assert.equal(ts01.receipt.final_snapshot_identified, true);
assert.equal(ts01.receipt.transient_support_continuity, 'ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER');
assert.equal(ts01.receipt.selected_serialization, null);
assert.equal(ts01.receipt.lexical_tiebreak_used, false);

assert.equal(ts02.case_id, 'TS02_IDENTIFIER_RENAMING_INVARIANCE');
assert.equal(ts02.semantic_summary_invariant, true);
assert.equal(ts02.original.transient_support_continuity, ts02.renamed.transient_support_continuity);
assert.equal(ts02.original.final_presence, ts02.renamed.final_presence);

assert.equal(ts03.case_id, 'TS03_PRECEDENCE_WITHDRAW_THEN_ADD');
assert.equal(ts03.receipt.admissible_serialization_count, 1);
assert.equal(ts03.receipt.transient_support_continuity, 'IDENTIFIED_SUPPORT_INTERRUPTION');

assert.equal(ts04.case_id, 'TS04_PRECEDENCE_ADD_THEN_WITHDRAW');
assert.equal(ts04.receipt.admissible_serialization_count, 1);
assert.equal(ts04.receipt.transient_support_continuity, 'IDENTIFIED_CONTINUOUS_SUPPORT');

assert.equal(ts05.case_id, 'TS05_CYCLIC_PRECEDENCE');
assert.equal(ts05.receipt.status, 'REJECT_CYCLIC_OR_INCONSISTENT_PRECEDENCE');

assert.equal(ts06.case_id, 'TS06_UNRELATED_CONCURRENT_EVENT');
assert.equal(ts06.receipt.admissible_serialization_count, 2);
assert.equal(ts06.receipt.transient_support_continuity, 'IDENTIFIED_CONTINUOUS_SUPPORT');

assert.equal(ts07.case_id, 'TS07_CONTRADICTION_HISTORY_AMBIGUITY');
assert.equal(ts07.receipt.final_presence, 'IDENTIFIED_ABSENT');
assert.equal(ts07.receipt.contradiction_history, 'ABSTAIN_CONTRADICTION_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER');
assert.deepEqual(new Set(ts07.receipt.profiles.map(item => item.ever_contradiction)), new Set([false,true]));

assert.equal(ts08.case_id, 'TS08_REPLAY_SUPPORT_HANDOFF');
assert.equal(ts08.receipt.transient_support_continuity, 'ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER');

assert.equal(ts09.case_id, 'TS09_SEMANTIC_NOOP');
assert.equal(ts09.receipt.transient_support_continuity, 'IDENTIFIED_CONTINUOUS_SUPPORT');
assert.equal(ts09.receipt.final_presence, 'IDENTIFIED_PRESENT');

assert.equal(ts10.case_id, 'TS10_FINAL_STATE_COMPACTION_ATTACK');
assert.equal(ts10.final_state_equal, true);
assert.equal(ts10.compacted_transient_history_authority, false);
assert.equal(ts10.final_state_equivalence_implies_transient_history_equivalence, false);

assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.shared_pedagogue_engine_mutation, false);
assert.equal(receipt.browser_execution, false);
assert.equal(receipt.workflow_mutation, false);
assert.equal(receipt.merge_performed, false);
assert.equal(receipt.deployment_performed, false);
assert.equal(receipt.release_authority, false);
assert.equal(receipt.vercel_release_requires_issue_405_and_new_explicit_operator_gesture, true);
assert.equal(receipt.scalar_aggregation_used, false);

if (receipt.candidate_verdict === 'WARRANT_WEAVE_CANDIDATE_SURVIVES_BOUNDED_TWO_STAIRCASES') {
  assert.equal(receipt.c3_partial_order_verdict, 'WARRANT_EPISODE_LEDGER_C3_FALSIFIED_AS_PARTIAL_ORDER_CUSTODY_SUFFICIENT_FORM');
  assert.deepEqual(receipt.defeat_conditions, []);
} else {
  assert.ok(receipt.defeat_conditions.length > 0);
}

const spec = fs.readFileSync('docs/pedagogue/PEDAGOGUE_TWO_STAIRCASES_WARRANT_WEAVE_PARTIAL_ORDER_HOSTILE_ASSAY_V0_1.md','utf8');
assert.match(spec, /Warrant Weave/i);
assert.match(spec, /all admitted serializations/i);
assert.match(spec, /Two Staircases/i);
assert.match(spec, /ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER/);
assert.match(spec, /REJECT_CYCLIC_OR_INCONSISTENT_PRECEDENCE/);
assert.match(spec, /event identifier, input order, lexical order, or hidden implementation order/i);
assert.match(spec, /final-state equivalence != transient-history equivalence/i);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync('docs/pedagogue/pedagogue-two-staircases-warrant-weave-partial-order-hostile-assay-v0.1.json','utf8'));
assert.equal(fixture.candidate.id, 'C4_WARRANT_WEAVE');
assert.equal(fixture.candidate.display_name, 'Warrant Weave');
assert.equal(fixture.candidate.promotion_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.equal(fixture.candidate.presumption_of_survival, false);
assert.equal(fixture.inherited_candidate.id, 'C3_WARRANT_EPISODE_LEDGER');
assert.equal(fixture.inherited_candidate.serial_history_scope_preserved, true);
assert.equal(fixture.enumeration.max_events, 8);
assert.equal(fixture.enumeration.sampling_allowed, false);
assert.equal(fixture.enumeration.lexical_tiebreak_allowed, false);
assert.equal(fixture.central_fixture.required_final_presence, 'IDENTIFIED_PRESENT');
assert.equal(fixture.central_fixture.required_transient_support_disposition, 'ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER');
assert.equal(fixture.hostile_rooms.length, 10);
assert.equal(fixture.authority.deployment_authority, false);
assert.equal(fixture.authority.release_authority, false);
assert.equal(fixture.authority.vercel_release_requires_issue_405_and_new_explicit_operator_gesture, true);
assert.equal(fixture.authority.promotion_authority, false);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  c3_partial_order_verdict:receipt.c3_partial_order_verdict,
  c4_verdict:receipt.candidate_verdict,
  c4_defeat_conditions:receipt.defeat_conditions,
  TS01_serializations:ts01.receipt.serializations,
  TS01_support_profiles:ts01.receipt.profiles.map(item => ({ order:item.serialization, continuously_supported:item.continuously_supported })),
  TS02_rename_invariant:ts02.semantic_summary_invariant,
  TS03_support:ts03.receipt.transient_support_continuity,
  TS04_support:ts04.receipt.transient_support_continuity,
  TS05_status:ts05.receipt.status,
  TS07_conflict_history:ts07.receipt.contradiction_history,
  TS10_final_state_equal:ts10.final_state_equal,
  selected_serialization:ts01.receipt.selected_serialization,
  lexical_tiebreak_used:ts01.receipt.lexical_tiebreak_used,
  deployment_performed:receipt.deployment_performed,
  release_authority:receipt.release_authority
}, null, 2));