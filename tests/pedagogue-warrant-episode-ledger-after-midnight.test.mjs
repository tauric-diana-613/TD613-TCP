import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_WARRANT_EPISODE_LEDGER_AFTER_MIDNIGHT_SCHEMA,
  attemptPosthocContradictionMutation,
  buildWarrantEpisodeLedger,
  compareWarrantEpisodes,
  replaySealedWarrantEpisode,
  runPedagogueGhostHouseAfterMidnightGauntlet,
  sealWarrantEpisode
} from '../app/dome-world/previews/a15-r0/pedagogue-warrant-episode-ledger-after-midnight.js';
import {
  canonicalRuleSignature,
  makeSyntheticReplayWitness
} from '../app/dome-world/previews/a15-r0/pedagogue-warrant-genealogy-ghost-house.js';

function rule(rule_id, requires, produces) {
  const base = { rule_id, requires, produces, predeclared:true, admissible:true, replayable:true };
  return { ...base, replay_witness:makeSyntheticReplayWitness(base) };
}

const basicRule = rule('BASIC', ['MEASUREMENT:A','MEASUREMENT:B'], 'IDENTIFIABILITY:W');
const basicEpisode = sealWarrantEpisode({
  episode_id:'BASIC_T0',
  evidence:[
    { evidence_id:'A', warrants:['MEASUREMENT:A'] },
    { evidence_id:'B', warrants:['MEASUREMENT:B'] }
  ],
  rules:[basicRule],
  requested_warrant:'IDENTIFIABILITY:W'
});
assert.equal(basicEpisode.sealed, true);
assert.equal(basicEpisode.historical_mutation_authority, false);
assert.equal(basicEpisode.disposition.status, 'PERMIT_WITNESSED_DERIVATIONAL_AUTHORITY');
assert.equal(typeof basicEpisode.current_snapshot_fingerprint, 'string');
assert.equal(typeof basicEpisode.episode_custody_fingerprint, 'string');
assert.equal(basicEpisode.rule_index.by_id.BASIC, canonicalRuleSignature(basicRule));

const sameEpisode = sealWarrantEpisode({
  episode_id:'BASIC_T1',
  evidence:[
    { evidence_id:'A', warrants:['MEASUREMENT:A'] },
    { evidence_id:'B', warrants:['MEASUREMENT:B'] }
  ],
  rules:[basicRule],
  requested_warrant:'IDENTIFIABILITY:W'
});
const basicTransition = compareWarrantEpisodes(basicEpisode, sameEpisode);
assert.deepEqual(basicTransition.events, ['NO_MATERIAL_WARRANT_STATE_CHANGE']);
assert.equal(basicTransition.current_snapshot_equal, true);

const basicLedger = buildWarrantEpisodeLedger([
  {
    episode_id:'LEDGER_T0',
    evidence:[{ evidence_id:'A', warrants:['MEASUREMENT:A'] },{ evidence_id:'B', warrants:['MEASUREMENT:B'] }],
    rules:[basicRule],
    requested_warrant:'IDENTIFIABILITY:W'
  },
  {
    episode_id:'LEDGER_T1',
    evidence:[{ evidence_id:'A', warrants:['MEASUREMENT:A'] },{ evidence_id:'B', warrants:['MEASUREMENT:B'] }],
    rules:[basicRule],
    requested_warrant:'IDENTIFIABILITY:W'
  }
]);
assert.equal(basicLedger.candidate, 'C3_WARRANT_EPISODE_LEDGER');
assert.equal(basicLedger.current_authority_from_latest_episode_only, true);
assert.equal(basicLedger.historical_episodes_mutable, false);
assert.equal(basicLedger.scalar_aggregation_used, false);
assert.equal(basicLedger.promotion_authority, false);

const replay = replaySealedWarrantEpisode(basicEpisode);
assert.equal(replay.status, 'EXACT_SYNTHETIC_PROVENANCE_REPLAY_MATCH');
assert.equal(replay.match, true);
assert.equal(replay.external_world_reproducibility_claim, false);

const mutation = attemptPosthocContradictionMutation(basicEpisode, [['IDENTIFIABILITY:W','IDENTIFIABILITY:NOT_W']]);
assert.equal(mutation.status, 'POSTHOC_CONTRADICTION_DECLARATION_MUTATION_REFUSED');
assert.equal(mutation.mutation_applied, false);
assert.equal(mutation.original_episode_custody_fingerprint, basicEpisode.episode_custody_fingerprint);

const receipt = runPedagogueGhostHouseAfterMidnightGauntlet();
assert.equal(receipt.schema, PEDAGOGUE_WARRANT_EPISODE_LEDGER_AFTER_MIDNIGHT_SCHEMA);
assert.equal(receipt.source_status, 'SIMULATED');
assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional, true);
assert.equal(receipt.play_surface, 'GHOST_HOUSE_AFTER_MIDNIGHT_MNEMONIC_ONLY_NOT_ONTOLOGY_AUTHORITY');

assert.equal(receipt.inherited_c2.snapshot_verdict, 'WARRANT_GENEALOGY_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_GHOST_HOUSE');
assert.equal(receipt.inherited_c2.snapshot_scope_preserved, true);
assert.equal(receipt.inherited_c2.temporal_overclaim_verdict, 'WARRANT_GENEALOGY_C2_FALSIFIED_AS_TEMPORAL_CUSTODY_SUFFICIENT_FORM');
assert.equal(receipt.inherited_c2.temporal_aliasing_observed, true);
assert.equal(receipt.inherited_c2.promoted, false);

const rooms = receipt.after_midnight_rooms;

const am01 = rooms.AM01;
assert.equal(am01.case_id, 'AM01_ONE_LINEAGE_WITHDRAWN');
assert.equal(am01.ledger.episodes[0].disposition.semantic_lineage_fingerprints['IDENTIFIABILITY:W'].length, 2);
assert.equal(am01.ledger.current_episode.disposition.semantic_lineage_fingerprints['IDENTIFIABILITY:W'].length, 1);
assert.ok(am01.ledger.transitions[0].events.includes('WARRANT_PERSISTS_LINEAGE_SET_CHANGED'));
assert.equal(am01.ledger.transitions[0].lost_lineages.length, 1);
assert.equal(am01.ledger.current_episode.disposition.status, 'PERMIT_WITNESSED_DERIVATIONAL_AUTHORITY');

const am02 = rooms.AM02;
assert.equal(am02.case_id, 'AM02_ALL_LINEAGES_WITHDRAWN');
assert.ok(am02.ledger.transitions[0].events.includes('WARRANT_INVALIDATED_ALL_SUPPORT_WITHDRAWN'));
assert.equal(am02.ledger.current_episode.disposition.closure_warrants.includes('IDENTIFIABILITY:W'), false);
assert.equal(am02.ledger.current_episode.disposition.status, 'REFUSE_AUTHORITY_OUTSIDE_WARRANT_GENEALOGY');
assert.equal(am02.ledger.episodes[0].disposition.closure_warrants.includes('IDENTIFIABILITY:W'), true);

const am03 = rooms.AM03;
assert.equal(am03.case_id, 'AM03_CONFLICT_ENTER_RESOLVE');
assert.equal(am03.ledger.episodes[0].disposition.status, 'PERMIT_WITNESSED_DERIVATIONAL_AUTHORITY');
assert.equal(am03.ledger.episodes[1].disposition.status, 'ABSTAIN_CONTRADICTORY_DERIVATIONAL_SUPPORT');
assert.equal(am03.ledger.episodes[2].disposition.status, 'PERMIT_WITNESSED_DERIVATIONAL_AUTHORITY');
assert.ok(am03.ledger.transitions[0].events.includes('CONTRADICTION_ENTERED'));
assert.ok(am03.ledger.transitions[1].events.includes('CONTRADICTION_RESOLVED'));

const am04 = rooms.AM04;
assert.equal(am04.case_id, 'AM04_REPLAY_WITNESS_REVOKED');
assert.ok(am04.ledger.transitions[0].events.includes('REPLAY_WITNESS_SUPPORT_REVOKED'));
assert.equal(am04.ledger.current_episode.disposition.status, 'REFUSE_UNWITNESSED_DERIVATION');
assert.equal(am04.ledger.current_episode.disposition.rejected_rules[0].reason, 'REPLAY_WITNESS_SIGNATURE_MISMATCH');

const am05 = rooms.AM05;
assert.equal(am05.case_id, 'AM05_SAME_SEMANTICS_NEW_RULE_ID');
assert.ok(am05.ledger.transitions[0].events.includes('SEMANTIC_RULE_CONTINUITY_WITH_IDENTIFIER_CHANGE'));
assert.equal(am05.ledger.transitions[0].events.includes('RULE_IDENTIFIER_REUSED_WITH_SEMANTIC_DISCONTINUITY'), false);
assert.deepEqual(
  am05.ledger.episodes[0].disposition.semantic_lineage_fingerprints['IDENTIFIABILITY:W'],
  am05.ledger.episodes[1].disposition.semantic_lineage_fingerprints['IDENTIFIABILITY:W']
);

const am06 = rooms.AM06;
assert.equal(am06.case_id, 'AM06_SAME_RULE_ID_CHANGED_SEMANTICS');
assert.ok(am06.ledger.transitions[0].events.includes('RULE_IDENTIFIER_REUSED_WITH_SEMANTIC_DISCONTINUITY'));
assert.ok(am06.ledger.transitions[0].events.includes('WARRANT_PERSISTS_LINEAGE_SET_CHANGED'));
assert.notDeepEqual(
  am06.ledger.episodes[0].disposition.semantic_lineage_fingerprints['IDENTIFIABILITY:W'],
  am06.ledger.episodes[1].disposition.semantic_lineage_fingerprints['IDENTIFIABILITY:W']
);

const am07 = rooms.AM07;
assert.equal(am07.case_id, 'AM07_EXECUTABLE_PROVENANCE_REPLAY');
assert.equal(am07.exact.status, 'EXACT_SYNTHETIC_PROVENANCE_REPLAY_MATCH');
assert.equal(am07.exact.match, true);
assert.equal(am07.negative.status, 'PROVENANCE_REPLAY_MISMATCH');
assert.equal(am07.negative.match, false);

const am08 = rooms.AM08;
assert.equal(am08.case_id, 'AM08_POSTHOC_CONFLICT_DEFINITION_MUTATION');
assert.equal(am08.episode.disposition.status, 'ABSTAIN_CONTRADICTORY_DERIVATIONAL_SUPPORT');
assert.equal(am08.mutation.status, 'POSTHOC_CONTRADICTION_DECLARATION_MUTATION_REFUSED');
assert.equal(am08.mutation.mutation_applied, false);
assert.equal(am08.historical_fingerprint_unchanged, true);

const am09 = rooms.AM09;
assert.equal(am09.case_id, 'AM09_WITHDRAWN_THEN_RESTORED_SUPPORT');
assert.equal(am09.interrupted.episodes[0].disposition.status, 'PERMIT_WITNESSED_DERIVATIONAL_AUTHORITY');
assert.equal(am09.interrupted.episodes[1].disposition.status, 'REFUSE_AUTHORITY_OUTSIDE_WARRANT_GENEALOGY');
assert.equal(am09.interrupted.episodes[2].disposition.status, 'PERMIT_WITNESSED_DERIVATIONAL_AUTHORITY');
assert.ok(am09.interrupted.transitions[1].events.includes('WARRANT_RESTORED_NEW_SUPPORT_EPISODE'));
assert.equal(am09.latest_snapshot_equal, true);
assert.equal(am09.interrupted_support_continuity, false);
assert.equal(am09.continuous_support_continuity, true);

const am10 = rooms.AM10;
assert.equal(am10.case_id, 'AM10_NO_CHANGE_CONTROL');
assert.deepEqual(am10.ledger.transitions[0].events, ['NO_MATERIAL_WARRANT_STATE_CHANGE']);
assert.equal(am10.ledger.transitions[0].current_snapshot_equal, true);

assert.ok([
  'WARRANT_EPISODE_LEDGER_CANDIDATE_SURVIVES_BOUNDED_AFTER_MIDNIGHT',
  'WARRANT_EPISODE_LEDGER_CANDIDATE_FALSIFIED'
].includes(receipt.warrant_episode_ledger_candidate.verdict));
assert.equal(receipt.primary_verdict, receipt.warrant_episode_ledger_candidate.verdict);
assert.equal(receipt.warrant_episode_ledger_candidate.id, 'C3_WARRANT_EPISODE_LEDGER');
assert.equal(receipt.warrant_episode_ledger_candidate.display_name, 'Warrant Episode Ledger');
assert.equal(receipt.warrant_episode_ledger_candidate.status_before_execution, 'ATTACK_ONLY_NOT_PROMOTED');
assert.equal(receipt.warrant_episode_ledger_candidate.presumption_of_survival, false);
assert.equal(receipt.warrant_episode_ledger_candidate.promoted, false);
assert.equal(receipt.candidate_formalism_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.equal(receipt.scalar_aggregation_used, false);
assert.equal(receipt.H2_status, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.H3_status, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.intersection_program_status, 'HELD_NOT_OPENED_HERE');
assert.equal(receipt.aperture_v32_replay_stability, 'HELD_NOT_YET_WITNESSED');
assert.equal(receipt.pedagogue_engine_mutation, false);
assert.equal(receipt.product_mutation, false);
assert.equal(receipt.workflow_mutation, false);
assert.equal(receipt.browser_execution, false);
assert.equal(receipt.merge_performed, false);
assert.equal(receipt.deployment_authority, false);
assert.equal(receipt.release_authority, false);
assert.equal(receipt.vercel_release_requires_issue_405_and_new_explicit_operator_gesture, true);
assert.equal(receipt.promotion_authority, false);

if (receipt.primary_verdict === 'WARRANT_EPISODE_LEDGER_CANDIDATE_SURVIVES_BOUNDED_AFTER_MIDNIGHT') {
  assert.equal(receipt.c3_strong_falsifier_passed, true);
  assert.deepEqual(receipt.warrant_episode_ledger_candidate.defeat_conditions, []);
  assert.equal(receipt.next_learning_action, 'ATTACK_EPISODE_LEDGER_PARTIAL_ORDER_CONCURRENT_SUPPORT_AND_CUSTODY_COMPACTION_BEFORE_ANY_SHARED_FORMALISM_PROMOTION');
} else {
  assert.equal(receipt.c3_strong_falsifier_passed, false);
  assert.ok(receipt.warrant_episode_ledger_candidate.defeat_conditions.length > 0);
  assert.equal(receipt.next_learning_action, 'INTERPRET_EPISODE_LEDGER_CORPSE_AND_AUTHOR_DESCENDANT_WITHOUT_PROMOTION');
}

const spec = fs.readFileSync('docs/pedagogue/PEDAGOGUE_GHOST_HOUSE_AFTER_MIDNIGHT_TEMPORAL_WARRANT_CUSTODY_HOSTILE_ASSAY_V0_1.md','utf8');
assert.match(spec, /Candidate readings frozen before execution/i);
assert.match(spec, /snapshot correctness does not automatically imply historical custody/i);
assert.match(spec, /same semantic rule under a new identifier/i);
assert.match(spec, /same identifier reused for a new semantic rule/i);
assert.match(spec, /executable provenance replay/i);
assert.match(spec, /post-hoc conflict-definition mutation/i);
assert.match(spec, /withdrawn then restored support/i);
assert.match(spec, /latest C2 snapshots are identical while the histories differ/i);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync('docs/pedagogue/pedagogue-ghost-house-after-midnight-temporal-warrant-custody-hostile-assay-v0.1.json','utf8'));
assert.equal(fixture.inherited_candidate.id, 'C2_WARRANT_GENEALOGY_CUSTODY');
assert.equal(fixture.new_candidate.id, 'C3_WARRANT_EPISODE_LEDGER');
assert.equal(fixture.new_candidate.display_name, 'Warrant Episode Ledger');
assert.equal(fixture.formal_contract.latest_snapshot_is_complete_history, false);
assert.equal(fixture.formal_contract.restored_support_is_unbroken_continuity, false);
assert.equal(fixture.formal_contract.scalar_aggregation_authorized, false);
assert.equal(fixture.rooms.length, 10);
assert.equal(fixture.authority_membrane.deployment_authority, false);
assert.equal(fixture.authority_membrane.release_authority, false);
assert.equal(fixture.authority_membrane.vercel_release_requires_issue_405_and_new_explicit_operator_gesture, true);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  inherited_c2_snapshot_verdict:receipt.inherited_c2.snapshot_verdict,
  inherited_c2_temporal_overclaim_verdict:receipt.inherited_c2.temporal_overclaim_verdict,
  c3_verdict:receipt.warrant_episode_ledger_candidate.verdict,
  c3_defeat_conditions:receipt.warrant_episode_ledger_candidate.defeat_conditions,
  AM01_events:am01.ledger.transitions[0].events,
  AM03_events:am03.ledger.transitions.map(item => item.events),
  AM04_events:am04.ledger.transitions[0].events,
  AM05_events:am05.ledger.transitions[0].events,
  AM06_events:am06.ledger.transitions[0].events,
  AM07_replay:[am07.exact.status,am07.negative.status],
  AM08_mutation:am08.mutation.status,
  AM09_latest_snapshot_equal:am09.latest_snapshot_equal,
  AM09_interrupted_events:am09.interrupted.transitions.map(item => item.events),
  AM10_events:am10.ledger.transitions[0].events,
  deployment_authority:receipt.deployment_authority,
  release_authority:receipt.release_authority,
  next_learning_action:receipt.next_learning_action
}, null, 2));
