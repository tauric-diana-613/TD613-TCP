import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_WARRANT_GENEALOGY_GHOST_HOUSE_SCHEMA,
  canonicalRuleSignature,
  evaluateWarrantGenealogy,
  makeSyntheticReplayWitness,
  runPedagogueWarrantGenealogyGhostHouseGauntlet,
  traceWarrantGenealogy,
  warrantGenealogyClosure
} from '../app/dome-world/previews/a15-r0/pedagogue-warrant-genealogy-ghost-house.js';

const sampleRule = {
  rule_id:'SAMPLE_R',
  requires:['MEASUREMENT:B', 'MEASUREMENT:A'],
  produces:'IDENTIFIABILITY:C',
  predeclared:true,
  admissible:true,
  replayable:true
};
const sampleWitness = makeSyntheticReplayWitness(sampleRule, 'SAMPLE_WITNESS');
assert.equal(sampleWitness.status, 'WITNESSED_SYNTHETIC');
assert.equal(sampleWitness.semantic_signature, 'MEASUREMENT:A&MEASUREMENT:B=>IDENTIFIABILITY:C');
assert.equal(canonicalRuleSignature(sampleRule), sampleWitness.semantic_signature);

const sampleClosure = warrantGenealogyClosure({
  evidence:[
    { evidence_id:'A', warrants:['MEASUREMENT:A'] },
    { evidence_id:'B', warrants:['MEASUREMENT:B'] }
  ],
  rules:[{ ...sampleRule, replay_witness:sampleWitness }]
});
assert.deepEqual(sampleClosure.primitive_warrants, ['MEASUREMENT:A', 'MEASUREMENT:B']);
assert.deepEqual(sampleClosure.closure_warrants, ['IDENTIFIABILITY:C', 'MEASUREMENT:A', 'MEASUREMENT:B']);
assert.deepEqual(sampleClosure.semantic_lineage_fingerprints['IDENTIFIABILITY:C'], [sampleWitness.semantic_signature]);
assert.equal(sampleClosure.rejected_rules.length, 0);
assert.equal(sampleClosure.scalar_aggregation_used, false);

const sampleTrace = traceWarrantGenealogy(sampleClosure, 'IDENTIFIABILITY:C');
assert.equal(sampleTrace.kind, 'DERIVED');
assert.equal(sampleTrace.lineages.length, 1);
assert.equal(sampleTrace.lineages[0].semantic_signature, sampleWitness.semantic_signature);
assert.deepEqual(sampleTrace.lineages[0].prerequisites.map(item => item.warrant), ['MEASUREMENT:A', 'MEASUREMENT:B']);

const sampleEvaluation = evaluateWarrantGenealogy({
  evidence:[
    { evidence_id:'A', warrants:['MEASUREMENT:A'] },
    { evidence_id:'B', warrants:['MEASUREMENT:B'] }
  ],
  rules:[{ ...sampleRule, replay_witness:sampleWitness }],
  requested_warrant:'IDENTIFIABILITY:C'
});
assert.equal(sampleEvaluation.status, 'PERMIT_WITNESSED_DERIVATIONAL_AUTHORITY');
assert.equal(sampleEvaluation.scalar_aggregation_used, false);
assert.equal(sampleEvaluation.promotion_authority, false);

const badReplay = evaluateWarrantGenealogy({
  evidence:[
    { evidence_id:'A', warrants:['MEASUREMENT:A'] },
    { evidence_id:'B', warrants:['MEASUREMENT:B'] }
  ],
  rules:[{
    ...sampleRule,
    rule_id:'BAD_REPLAY',
    replay_witness:{
      witness_id:'BAD',
      status:'WITNESSED_SYNTHETIC',
      semantic_signature:'MEASUREMENT:A=>IDENTIFIABILITY:C'
    }
  }],
  requested_warrant:'IDENTIFIABILITY:C'
});
assert.equal(badReplay.status, 'REFUSE_UNWITNESSED_DERIVATION');
assert.equal(badReplay.rejected_rules[0].reason, 'REPLAY_WITNESS_SIGNATURE_MISMATCH');

const receipt = runPedagogueWarrantGenealogyGhostHouseGauntlet();
assert.equal(receipt.schema, PEDAGOGUE_WARRANT_GENEALOGY_GHOST_HOUSE_SCHEMA);
assert.equal(receipt.source_status, 'SIMULATED');
assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional, true);
assert.equal(receipt.play_surface, 'DOLLHOUSE_MNEMONIC_ONLY_NOT_ONTOLOGY_AUTHORITY');

assert.equal(receipt.inherited_c1.status_before_execution, 'ATTACK_ONLY_NOT_PROMOTED');
assert.equal(receipt.inherited_c1.verdict, 'DECLARED_DERIVATIONAL_CLOSURE_C1_FALSIFIED_AS_PROVENANCE_SUFFICIENT_FORM');
assert.equal(receipt.inherited_c1.falsification_scope, 'BOUNDED_SYNTHETIC_PROVENANCE_SUFFICIENCY_FORM');
assert.equal(receipt.inherited_c1.fixed_point_closure_declared_false, false);
assert.equal(receipt.inherited_c1.promoted, false);
assert.equal(receipt.c1_provenance_form_falsified, true);
assert.ok(receipt.inherited_c1.falsifiers.includes('ALTERNATIVE_LAWFUL_LINEAGE_ERASED'));
assert.ok(receipt.inherited_c1.falsifiers.includes('PROVENANCE_SELECTED_BY_RULE_NAME_OR_SERIALIZATION'));
assert.ok(receipt.inherited_c1.falsifiers.includes('DECLARED_REPLAYABILITY_LAUNDERING'));
assert.ok(receipt.inherited_c1.falsifiers.includes('CONTRADICTION_MEMBERSHIP_OVERCLAIM'));
assert.ok(receipt.inherited_c1.falsifiers.includes('INVALID_ROUTE_SELECTED_BY_LEXICAL_ORDER'));

const rooms = receipt.hostile_rooms;
const nursery = rooms.GH01_nursery_seedless_cycle;
assert.equal(nursery.c1_bootstrapped, false);
assert.equal(nursery.c2_bootstrapped, false);

const staircase = rooms.GH02_staircase_multi_step_ancestry;
assert.equal(staircase.c1.status, 'PERMIT_DECLARED_DERIVATIONAL_AUTHORITY');
assert.equal(staircase.c2.status, 'PERMIT_WITNESSED_DERIVATIONAL_AUTHORITY');
assert.equal(staircase.ancestry_reconstructable, true);
assert.equal(staircase.c2.requested_genealogy.kind, 'DERIVED');
assert.equal(staircase.c2.requested_genealogy.warrant, 'DECISION:E');

const twins = rooms.GH03_twin_bedroom_multiple_valid_lineages;
assert.equal(twins.c1_erased_alternative_lineage, true);
assert.equal(twins.c1_recorded_semantic_lineages.length, 1);
assert.equal(twins.c2_preserved_both, true);
assert.equal(twins.c2_recorded_semantic_lineages.length, 2);
assert.deepEqual(twins.c2_recorded_semantic_lineages, twins.expected_semantic_lineages);

const mirror = rooms.GH04_mirror_room_rule_rename_order;
assert.equal(mirror.c1_closure_invariant, true);
assert.equal(mirror.c1_provenance_name_sensitive, true);
assert.notDeepEqual(mirror.c1_recorded_semantics_before, mirror.c1_recorded_semantics_after);
assert.equal(mirror.c2_semantic_lineages_invariant, true);
assert.equal(mirror.c2_disposition_invariant, true);
assert.deepEqual(mirror.c2_semantic_lineages_before, mirror.c2_semantic_lineages_after);

const costume = rooms.GH05_costume_closet_fake_replay;
assert.equal(costume.c1_boolean_replay_label_admitted, true);
assert.equal(costume.c1.status, 'PERMIT_DECLARED_DERIVATIONAL_AUTHORITY');
assert.equal(costume.c2_rejected_fake_replay, true);
assert.equal(costume.c2.status, 'REFUSE_UNWITNESSED_DERIVATION');

const attic = rooms.GH06_attic_contradictory_heirs;
assert.equal(attic.c1_membership_overclaim, true);
assert.equal(attic.c1_allow.status, 'PERMIT_DECLARED_DERIVATIONAL_AUTHORITY');
assert.equal(attic.c1_deny.status, 'PERMIT_DECLARED_DERIVATIONAL_AUTHORITY');
assert.equal(attic.c2_abstains_on_conflict, true);
assert.equal(attic.c2_allow.status, 'ABSTAIN_CONTRADICTORY_DERIVATIONAL_SUPPORT');
assert.equal(attic.c2_deny.status, 'ABSTAIN_CONTRADICTORY_DERIVATIONAL_SUPPORT');
assert.deepEqual(attic.c2_allow.conflicting_warrants, ['DECISION:ALLOW', 'DECISION:DENY']);

const basement = rooms.GH07_basement_retraction_ghost_warrant;
assert.equal(basement.before.closure_warrants.includes('IDENTIFIABILITY:C'), true);
assert.equal(basement.before.closure_warrants.includes('DECISION:E'), true);
assert.equal(basement.after.closure_warrants.includes('IDENTIFIABILITY:C'), false);
assert.equal(basement.after.closure_warrants.includes('DECISION:E'), false);
assert.equal(basement.ghost_warrant_survived, false);
assert.ok(basement.invalidated_warrants.includes('IDENTIFIABILITY:C'));
assert.ok(basement.invalidated_warrants.includes('DECISION:E'));

const goodTwin = rooms.GH08_good_twin_valid_plus_invalid_route;
assert.equal(goodTwin.c1.status, 'PERMIT_DECLARED_DERIVATIONAL_AUTHORITY');
assert.equal(goodTwin.c1_fake_route_recorded, true);
assert.equal(goodTwin.c1_valid_route_suppressed, true);
assert.equal(goodTwin.c2.status, 'PERMIT_WITNESSED_DERIVATIONAL_AUTHORITY');
assert.equal(goodTwin.c2_valid_route_preserved, true);
assert.equal(goodTwin.c2_fake_route_excluded, true);
assert.equal(goodTwin.c2_fake_route_rejected, true);

const blank = rooms.GH09_blank_room_unsupported_warrant;
assert.equal(blank.disposition.status, 'REFUSE_AUTHORITY_OUTSIDE_WARRANT_GENEALOGY');

const constitutional = rooms.inherited_constitutional_controls;
assert.equal(constitutional.prior_closure_verdict, 'DECLARED_DERIVATIONAL_CLOSURE_CANDIDATE_SURVIVES_BOUNDED_HOSTILE_FAMILY');
assert.equal(constitutional.strict_non_amplification_verdict, 'STRICT_TYPED_NON_AMPLIFICATION_FALSIFIED_BY_LAWFUL_DERIVATIONAL_GAIN');
assert.equal(constitutional.exact_tie_status, 'NO_UNIQUE_SELECTION_DECISION_LOSS_TIE');
assert.equal(constitutional.lexicographic_probe_id_tie_break_used, false);
assert.equal(constitutional.undeclared_loss_status, 'NO_SELECTION_UNDECLARED_DECISION_LOSS');
assert.equal(constitutional.conflicting_loss_status, 'NO_SELECTION_CONFLICTING_LOSSES_WITHOUT_AGGREGATION_RULE');
assert.equal(constitutional.missing_aggregation_status, 'REFUSE_UNSUPPORTED_OR_MISSING_AGGREGATION_RULE');
assert.equal(constitutional.unsupported_aggregation_status, 'REFUSE_UNSUPPORTED_OR_MISSING_AGGREGATION_RULE');
assert.equal(constitutional.posthoc_status, 'POSTHOC_DECISION_LOSS_MUTATION_NOT_CONFIRMATORY');
assert.equal(constitutional.incomplete_uncertainty_status, 'ABSTAIN_NOISE_GEOMETRY_INCOMPLETE');
assert.equal(constitutional.invalid_uncertainty_status, 'REJECT_INVALID_NOISE_GEOMETRY');
assert.equal(constitutional.scalar_refusals_preserved, true);

assert.ok([
  'WARRANT_GENEALOGY_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_GHOST_HOUSE',
  'WARRANT_GENEALOGY_CUSTODY_CANDIDATE_FALSIFIED'
].includes(receipt.warrant_genealogy_candidate.verdict));
assert.equal(receipt.primary_verdict, receipt.warrant_genealogy_candidate.verdict);
assert.equal(receipt.warrant_genealogy_candidate.status_before_execution, 'ATTACK_ONLY_NOT_PROMOTED');
assert.equal(receipt.warrant_genealogy_candidate.display_name, 'Warrant Genealogy');
assert.equal(receipt.warrant_genealogy_candidate.presumption_of_survival, false);
assert.equal(receipt.warrant_genealogy_candidate.promoted, false);
assert.equal(receipt.candidate_formalism_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.equal(receipt.scalar_aggregation_used, false);
assert.equal(receipt.intersection_program_status, 'HELD_NOT_OPENED_HERE');
assert.equal(receipt.H2_status, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.H3_status, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.aperture_v32_replay_stability, 'HELD_NOT_YET_WITNESSED');
assert.equal(receipt.pedagogue_engine_mutation, false);
assert.equal(receipt.product_mutation, false);
assert.equal(receipt.workflow_mutation, false);
assert.equal(receipt.browser_execution, false);
assert.equal(receipt.deployment_authority, false);
assert.equal(receipt.release_authority, false);
assert.equal(receipt.vercel_release_requires_issue_405_and_new_explicit_operator_gesture, true);
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.research_decision_authority_for_next_bounded_chamber, true);

if (receipt.primary_verdict === 'WARRANT_GENEALOGY_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_GHOST_HOUSE') {
  assert.equal(receipt.c2_strong_falsifier_passed, true);
  assert.deepEqual(receipt.warrant_genealogy_candidate.defeat_conditions, []);
  assert.equal(
    receipt.next_learning_action,
    'ATTACK_WARRANT_GENEALOGY_TEMPORAL_RULE_WITHDRAWAL_CONFLICT_RESOLUTION_AND_PROVENANCE_REPLAY_BEFORE_FORMALISM_PROMOTION'
  );
} else {
  assert.equal(receipt.c2_strong_falsifier_passed, false);
  assert.ok(receipt.warrant_genealogy_candidate.defeat_conditions.length > 0);
  assert.equal(receipt.next_learning_action, 'INTERPRET_WARRANT_GENEALOGY_CORPSE_AND_AUTHOR_DESCENDANT_WITHOUT_PROMOTION');
}

const spec = fs.readFileSync('docs/pedagogue/PEDAGOGUE_GHOST_HOUSE_WARRANT_GENEALOGY_HOSTILE_ASSAY_V0_1.md', 'utf8');
assert.match(spec, /Two candidate readings frozen before execution/i);
assert.match(spec, /Twin Bedroom/i);
assert.match(spec, /rule rename\/order invariance/i);
assert.match(spec, /declared replayability != witnessed replayability/i);
assert.match(spec, /contradictory heirs/i);
assert.match(spec, /ghost warrant/i);
assert.match(spec, /No definition repair is allowed after observing the result/i);
assert.match(spec, /Issue #405 remains the sole Vercel release membrane/i);

const fixture = JSON.parse(fs.readFileSync('docs/pedagogue/pedagogue-ghost-house-warrant-genealogy-hostile-assay-v0.1.json', 'utf8'));
assert.equal(fixture.status, 'AUTHORED_PRE_EXECUTION_BOUNDED_SYNTHETIC_HOSTILE_RESEARCH_OPERATOR_ADMITTED_NOT_PROMOTED');
assert.equal(fixture.inherited_candidate.id, 'C1_DECLARED_DERIVATIONAL_CLOSURE');
assert.equal(fixture.new_candidate.id, 'C2_WARRANT_GENEALOGY_CUSTODY');
assert.equal(fixture.new_candidate.display_name, 'Warrant Genealogy');
assert.equal(fixture.formal_contract.scalar_aggregation_authorized, false);
assert.equal(fixture.formal_contract.rule_id_is_authority, false);
assert.equal(fixture.formal_contract.replayable_boolean_is_replay_witness, false);
assert.equal(fixture.ghost_house_rooms.length, 9);
assert.equal(fixture.authority_membrane.deployment_authority, false);
assert.equal(fixture.authority_membrane.release_authority, false);
assert.equal(fixture.authority_membrane.vercel_release_requires_issue_405_and_new_explicit_operator_gesture, true);
assert.equal(fixture.held_programs.H2_APERTURE_BEFORE_ABSENCE, 'HELD_NOT_TESTED_HERE');
assert.equal(fixture.held_programs.H3_ROLE_BEFORE_REPETITION, 'HELD_NOT_TESTED_HERE');

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  inherited_c1_verdict:receipt.inherited_c1.verdict,
  inherited_c1_falsifiers:receipt.inherited_c1.falsifiers,
  warrant_genealogy_verdict:receipt.warrant_genealogy_candidate.verdict,
  warrant_genealogy_defeat_conditions:receipt.warrant_genealogy_candidate.defeat_conditions,
  mirror_room:{
    c1_closure_invariant:mirror.c1_closure_invariant,
    c1_provenance_name_sensitive:mirror.c1_provenance_name_sensitive,
    c1_before:mirror.c1_recorded_semantics_before,
    c1_after:mirror.c1_recorded_semantics_after,
    c2_semantic_lineages_invariant:mirror.c2_semantic_lineages_invariant
  },
  costume_closet:{
    c1_boolean_replay_label_admitted:costume.c1_boolean_replay_label_admitted,
    c2_status:costume.c2.status
  },
  attic:{
    c1_membership_overclaim:attic.c1_membership_overclaim,
    c2_status:attic.c2_allow.status,
    conflict:attic.c2_allow.conflicting_warrants
  },
  basement:{
    invalidated_warrants:basement.invalidated_warrants,
    ghost_warrant_survived:basement.ghost_warrant_survived
  },
  good_twin:{
    c1_fake_route_recorded:goodTwin.c1_fake_route_recorded,
    c1_valid_route_suppressed:goodTwin.c1_valid_route_suppressed,
    c2_valid_route_preserved:goodTwin.c2_valid_route_preserved,
    c2_fake_route_rejected:goodTwin.c2_fake_route_rejected
  },
  scalar_aggregation_used:receipt.scalar_aggregation_used,
  intersections:receipt.intersection_program_status,
  H2:receipt.H2_status,
  H3:receipt.H3_status,
  deployment_authority:receipt.deployment_authority,
  release_authority:receipt.release_authority,
  next_learning_action:receipt.next_learning_action
}, null, 2));
