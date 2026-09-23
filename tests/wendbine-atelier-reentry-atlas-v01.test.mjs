import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('packages/dome_world_exact/fixtures/a15-r0/WENDBINE');
const profile=JSON.parse(fs.readFileSync(path.join(root,'ATELIER_PROFILE.json'),'utf8'));
const atlas=JSON.parse(fs.readFileSync(path.join(root,'99-ADMIN/REENTRY_ATLAS.json'),'utf8'));
const findings=JSON.parse(fs.readFileSync(path.join(root,atlas.findings_index_path),'utf8'));

assert.equal(profile.schema,'td613.atelier-profile/v0.2');
assert.equal(profile.profile_state,'MERGED_PUBLIC_SURFACE_ATELIER_WITH_ACTIVE_RESEARCH_FRONTIER');
assert.equal(profile.reentry_surface,'99-ADMIN/REENTRY_ATLAS.json');
assert.ok(profile.active_stages.includes('S7_EXTERNAL_SCIENTIFIC_CONFRONTATION'));
assert.equal(profile.held_or_conditional_stages.S5_CONVERGENCE_DIVERGENCE_LINEAGE,'HELD_UNTIL_SOURCE_BOUND_LINEAGE_QUESTION_REQUIRES_IT');

assert.equal(atlas.schema,'td613.atelier-reentry-atlas/v0.1');
assert.equal(atlas.frontier_state,'BLINDED_PREREGISTERED_LOCALIZATION_ASSAY_ACTIVE');
assert.equal(atlas.findings_index_path,'99-ADMIN/RESEARCH_FINDINGS_INDEX_V0_12.json');
assert.ok(fs.existsSync(path.join(root,atlas.findings_index_path)),'Single-shot findings index must resolve.');
assert.equal(findings.schema,'td613.wendbine-research-findings-index/v0.12');
assert.equal(findings.current_frontier,'BLINDED_PREREGISTERED_LOCALIZATION_V012');
assert.match(findings.canonical_main_finding,/DEFECT_LOCALIZATION_RESOLUTION/);
assert.match(findings.main_finding_plain_language,/same accept\/reject decisions/i);
assert.match(findings.main_finding_plain_language,/localize which boundary failed/i);

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
  'HELD_OUT_AUTHORED_MATRIX != EXTERNAL_EMPIRICAL_VALIDATION',
  'PREREGISTRATION_PRECEDES_EVALUATOR != EXTERNAL_VALIDATION',
  'REPEATED_MUTATION_ROWS != INDEPENDENT_POPULATION_DRAWS',
  'ROW_LEVEL_WILSON_INTERVAL != POPULATION_CONFIDENCE_WITH_CLUSTERED_AUTHORED_RECIPES',
  'BINARY_ACCURACY_PARITY_CAN_COEXIST_WITH_LOCALIZATION_SEPARATION',
  'LOCALIZATION_ADVANTAGE != TRUTH_GAIN',
  'FROZEN_CLASSIFIER != INDEPENDENT_EXTERNAL_CLASSIFIER'
]) assert.ok(atlas.invariants.includes(law),`Reentry atlas must retain ${law}`);

assert.equal(atlas.entry_order[0],'ATELIER_PROFILE.json');
assert.equal(atlas.entry_order[1],'99-ADMIN/RESEARCH_FINDINGS_INDEX_V0_12.json');
assert.ok(atlas.entry_order.includes('latest frontier operation'));
assert.ok(atlas.entry_order.includes('paired machine receipt'));
assert.ok(atlas.entry_order.includes('preregistration when applicable'));
assert.ok(atlas.entry_order.indexOf('latest frontier operation') < atlas.entry_order.indexOf('source registry or external corpus'));

assert.ok(atlas.frontier_stack.length>=9,'Atlas must retain the research lineage behind the active frontier.');
for (const item of atlas.frontier_stack) {
  assert.ok(item.id && item.status && item.question && item.result && item.next_test,`Frontier item ${item.id||'<unknown>'} must be self-describing.`);
  for (const rel of [item.operation_path,item.receipt_path]) {
    assert.equal(typeof rel,'string');
    assert.ok(fs.existsSync(path.join(root,rel)),`Frontier pointer must resolve: ${rel}`);
  }
  if (item.preregistration_path) assert.ok(fs.existsSync(path.join(root,item.preregistration_path)),`Preregistration pointer must resolve: ${item.preregistration_path}`);
  if (item.findings_index_path) assert.ok(fs.existsSync(path.join(root,item.findings_index_path)),`Findings-index pointer must resolve: ${item.findings_index_path}`);
}

const v12=atlas.frontier_stack[0];
assert.equal(v12.id,'BLINDED_PREREGISTERED_LOCALIZATION_V012','v0.12 must be the first reentry frontier.');
assert.equal(v12.status,'GREEN_EXACT_HEAD_9CE545EAB66B9EEE0D5C0EC3BC1742D708B5A2FA_RUN_3329');
assert.match(v12.result,/72 preregistered authored instances/i);
assert.match(v12.result,/72\/72 binary correctness/i);
assert.match(v12.result,/0\/60/i);
assert.match(v12.result,/60\/60/i);
assert.match(v12.result,/recipe family, not row count/i);
assert.match(v12.result,/(?:not|rather than) external empirical validation/i);
assert.equal(v12.preregistration_path,'01-MANIFESTS/2026-09-15-held-out-defect-localization-v012-preregistration.json');
assert.equal(v12.operation_path,'05-OPERATIONS/2026-09-15-BLINDED-PREREGISTERED-LOCALIZATION-V0_12.md');
assert.equal(v12.receipt_path,'04-RECEIPTS/assays/2026-09-15-blinded-preregistered-localization-v012.json');

assert.equal(atlas.frontier_stack[1].id,'HELD_OUT_DEFECT_LOCALIZATION_V011');
assert.equal(atlas.frontier_stack[2].id,'CROSS_FAMILY_HANDOFF_ADJUDICATION_V010');
assert.equal(atlas.frontier_stack[3].id,'FLOWCORE_BOUNDARY_ROLE_STRATIFICATION_V09');
assert.equal(atlas.frontier_stack[4].id,'EO_SOURCE_BOUND_STAGE_COLLAPSE_V08');
assert.equal(atlas.frontier_stack[5].id,'EO_PRIMITIVE_TYPING_STAGE_COLLAPSE_V07');
assert.equal(atlas.frontier_stack[6].id,'EO_REDUNDANCY_V06');
assert.equal(atlas.frontier_stack[7].id,'EO_FOUNDATIONAL_SIEVE_V05');

const finding12=findings.findings.find(row=>row.id==='BLINDED_PREREGISTERED_LOCALIZATION_V012');
assert.ok(finding12,'Single-shot findings index must contain v0.12.');
assert.equal(finding12.green_head,'9ce545eab66b9eee0d5c0ec3bc1742d708b5a2fa');
assert.equal(finding12.green_run,3329);
assert.equal(finding12.schedule.instances,72);
assert.equal(finding12.schedule.defect_instances,60);
assert.equal(finding12.scores.terminal_binary_accuracy,1);
assert.equal(finding12.scores.role_typed_binary_accuracy,1);
assert.equal(finding12.scores.terminal_localization_accuracy,0);
assert.equal(finding12.scores.role_typed_localization_accuracy,1);
assert.ok(finding12.scores.role_typed_localization_wilson_95_lower > finding12.scores.terminal_localization_wilson_95_upper);
assert.match(finding12.critical_caveat,/deterministic variations/i);
assert.match(finding12.critical_caveat,/recipe family/i);
assert.match(finding12.next_test,/leave-one-recipe-family-out/i);

assert.deepEqual(
  Object.keys(atlas.graph_descent).sort(),
  [...profile.graph_families].sort(),
  '30K reentry graph descent must cover exactly the declared Atelier graph families without inventing or dropping a family.'
);

assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('0/60')&&x.includes('60/60')),'v0.12 localization separation must survive thread boundaries.');
assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('deterministic variations')&&x.includes('recipe families')),'Clustered-recipe caveat must survive thread boundaries.');
assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('Preregistration')&&x.includes('not external validation')),'Preregistration/external-validation separation must survive thread boundaries.');
assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('frozen classifier')||x.includes('Frozen classifier')),'Frozen/internal classifier caveat must survive thread boundaries.');
assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('generic cross-family HOLD')),'Cross-family terminal non-localization result must survive thread boundaries.');
assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('Boundary retention does not imply scientific epistemic-operator promotion')),'Role-typed boundary-credit result must survive thread boundaries.');
assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('does not universally force semantic redundancy upward')||x.includes('does not by itself force downstream semantic redundancy upward')),'Redundancy counterexample must survive thread boundaries.');
assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('shared arrow glyph') || x.includes('Shared arrow glyph')),'Primitive/operator-type separation must survive thread boundaries.');

assert.ok(atlas.held_questions.some(x=>/leave-one-recipe-family-out/i.test(x)),'v0.12 next hostile test must remain retrievable.');
assert.ok(atlas.held_questions.some(x=>/multi-defect collisions/i.test(x)),'Multi-defect collision continuation must remain retrievable.');
assert.ok(atlas.held_questions.some(x=>x.includes('stage-collapse')),'Source-bound stage-collapse continuation must remain retrievable.');

assert.equal(atlas.cross_atelier_rule.interchange.includes('do not raw-union'),true);
assert.equal(atlas.user_supplied_public_post_continuity_note.status,'USER_SUPPLIED_TEXT_NOT_INDEPENDENTLY_VERIFIED_AS_TO_PROVENANCE');
assert.equal(atlas.scientific_promotion_authority,false);
assert.equal(atlas.human_closure_required,true);
assert.equal(findings.scientific_promotion_authority,false);
assert.equal(findings.human_closure_required,true);

console.log('Wendbine Atelier reentry atlas v0.1 passed at blinded preregistered localization v0.12.');
