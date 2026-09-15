import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('packages/dome_world_exact/fixtures/a15-r0/WENDBINE');
const profile=JSON.parse(fs.readFileSync(path.join(root,'ATELIER_PROFILE.json'),'utf8'));
const atlas=JSON.parse(fs.readFileSync(path.join(root,'99-ADMIN/REENTRY_ATLAS.json'),'utf8'));

assert.equal(profile.schema,'td613.atelier-profile/v0.2');
assert.equal(profile.profile_state,'MERGED_PUBLIC_SURFACE_ATELIER_WITH_ACTIVE_RESEARCH_FRONTIER');
assert.equal(profile.reentry_surface,'99-ADMIN/REENTRY_ATLAS.json');
assert.ok(profile.active_stages.includes('S7_EXTERNAL_SCIENTIFIC_CONFRONTATION'),'S7 must remain active after nomenclature/literature confrontation.');
assert.equal(profile.held_or_conditional_stages.S5_CONVERGENCE_DIVERGENCE_LINEAGE,'HELD_UNTIL_SOURCE_BOUND_LINEAGE_QUESTION_REQUIRES_IT');
assert.equal(atlas.schema,'td613.atelier-reentry-atlas/v0.1');
assert.equal(atlas.frontier_state,'HELD_OUT_DEFECT_LOCALIZATION_ASSAY_ACTIVE');

for (const law of [
  '30K_VIEW != FRONTIER_DETAIL',
  'GRAPH_ADJACENCY != EDGE_SEMANTICS',
  'EDGE_EXISTENCE != EDGE_TYPE',
  'SAME_TOKEN != SAME_OPERATOR',
  'TEMPORAL_ADJACENCY != CAUSAL_EDGE',
  'DIRECT_RAW_GRAPH_UNION = FORBIDDEN',
  'HELD != NOVEL',
  'BOUNDARY_RETENTION != SCIENTIFIC_OPERATOR_PROMOTION',
  'BOUNDARY_VALUE_MUST_BE_ROLE_TYPED',
  'DECISION_EQUIVALENCE != ADJUDICATION_EQUIVALENCE',
  'REFERENCE_CONSISTENCY != TRUTH',
  'ACCEPT_REJECT_ACCURACY != DEFECT_LOCALIZATION_ACCURACY',
  'HELD_OUT_AUTHORED_MATRIX != EXTERNAL_EMPIRICAL_VALIDATION'
]) assert.ok(atlas.invariants.includes(law),`Reentry atlas must retain ${law}`);

assert.equal(atlas.entry_order[0],'ATELIER_PROFILE.json');
assert.ok(atlas.entry_order.includes('latest frontier operation'));
assert.ok(atlas.entry_order.includes('paired machine receipt'));
assert.ok(atlas.entry_order.indexOf('latest frontier operation') < atlas.entry_order.indexOf('source registry or external corpus'));

assert.ok(atlas.frontier_stack.length>=8,'Atlas must retain a bounded recent frontier stack.');
for (const item of atlas.frontier_stack) {
  assert.ok(item.id && item.status && item.question && item.result && item.next_test,`Frontier item ${item.id||'<unknown>'} must be self-describing.`);
  for (const rel of [item.operation_path,item.receipt_path]) {
    assert.equal(typeof rel,'string');
    assert.ok(fs.existsSync(path.join(root,rel)),`Frontier pointer must resolve: ${rel}`);
  }
}

assert.equal(atlas.frontier_stack[0].id,'HELD_OUT_DEFECT_LOCALIZATION_V011','v0.11 must be the first reentry frontier after exact-head validation.');
assert.equal(atlas.frontier_stack[0].status,'GREEN_EXACT_HEAD_433D484D0133789A58963DF9248CB75399B687C3_RUN_3323');
assert.match(atlas.frontier_stack[0].result,/1\.0 accept\/reject accuracy/i);
assert.match(atlas.frontier_stack[0].result,/terminal-only 0\.0 versus role-typed 1\.0/i);
assert.match(atlas.frontier_stack[0].result,/actual post-digest round-trip receipt tamper/i);
assert.match(atlas.frontier_stack[0].result,/native Phase-5 execution/i);
assert.match(atlas.frontier_stack[0].result,/independent A15 execution/i);
assert.equal(atlas.frontier_stack[1].id,'CROSS_FAMILY_HANDOFF_ADJUDICATION_V010');
assert.equal(atlas.frontier_stack[1].status,'GREEN_EXACT_HEAD_DB849E3F82D3AD7634BEFEE9F7941385FBC60C0E_RUN_3317');
assert.equal(atlas.frontier_stack[2].id,'FLOWCORE_BOUNDARY_ROLE_STRATIFICATION_V09');
assert.equal(atlas.frontier_stack[3].id,'EO_SOURCE_BOUND_STAGE_COLLAPSE_V08');
assert.equal(atlas.frontier_stack[4].id,'EO_PRIMITIVE_TYPING_STAGE_COLLAPSE_V07');
assert.equal(atlas.frontier_stack[5].id,'EO_REDUNDANCY_V06');
assert.equal(atlas.frontier_stack[6].id,'EO_FOUNDATIONAL_SIEVE_V05');

assert.deepEqual(
  Object.keys(atlas.graph_descent).sort(),
  [...profile.graph_families].sort(),
  '30K reentry graph descent must cover exactly the declared Atelier graph families without inventing or dropping a family.'
);

assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('Perfect binary reject accuracy')&&x.includes('zero defect-localization accuracy')),'Binary/localization separation must survive thread boundaries.');
assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('authored')&&x.includes('external empirical validation')),'Held-out authored/external validation separation must survive thread boundaries.');
assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('Localization gain')&&x.includes('truth gain')),'Localization/truth separation must survive thread boundaries.');
assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('generic cross-family HOLD')),'Cross-family terminal non-localization result must survive thread boundaries.');
assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('reference consistency')),'Cross-family consistency/truth separation must survive thread boundaries.');
assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('Multi-receipt provenance')),'Provenance/empirical-confirmation separation must survive thread boundaries.');
assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('Boundary retention does not imply scientific epistemic-operator promotion')),'Role-typed boundary-credit result must survive thread boundaries.');
assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('same PARTIAL aggregate status')),'Flow-Core same-aggregate/different-history result must survive thread boundaries.');
assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('Digest verification witnesses integrity')),'Integrity/truth separation must survive thread boundaries.');
assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('audit receipt wrapper')),'Receipt-wrapper demotion must survive thread boundaries.');
assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('does not universally force semantic redundancy upward')),'Redundancy counterexample must survive thread boundaries.');
assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('shared arrow glyph') || x.includes('Shared arrow glyph')),'Primitive/operator-type separation must survive thread boundaries.');

assert.ok(atlas.held_questions.some(x=>/blinded/i.test(x)&&/preregistered/i.test(x)&&/mutation/i.test(x)),'v0.11 blinded preregistered continuation must remain retrievable.');
assert.ok(atlas.held_questions.some(x=>x.includes('stage-collapse')),'Source-bound stage-collapse continuation must remain retrievable.');
assert.equal(atlas.cross_atelier_rule.interchange.includes('do not raw-union'),true);
assert.equal(atlas.user_supplied_public_post_continuity_note.status,'USER_SUPPLIED_TEXT_NOT_INDEPENDENTLY_VERIFIED_AS_TO_PROVENANCE');
assert.equal(atlas.scientific_promotion_authority,false);
assert.equal(atlas.human_closure_required,true);

console.log('Wendbine Atelier reentry atlas v0.1 passed at held-out defect localization v0.11.');
