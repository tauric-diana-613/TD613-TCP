import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('packages/dome_world_exact/fixtures/a15-r0/WENDBINE');
const profile=JSON.parse(fs.readFileSync(path.join(root,'ATELIER_PROFILE.json'),'utf8'));
const atlas=JSON.parse(fs.readFileSync(path.join(root,'99-ADMIN/REENTRY_ATLAS.json'),'utf8'));

assert.equal(profile.schema,'td613.atelier-profile/v0.2');
assert.equal(profile.profile_state,'MERGED_PUBLIC_SURFACE_ATELIER_WITH_ACTIVE_RESEARCH_FRONTIER');
assert.equal(profile.reentry_surface,'99-ADMIN/REENTRY_ATLAS.json');
assert.ok(profile.active_stages.includes('S7_EXTERNAL_SCIENTIFIC_CONFRONTATION'),'S7 must no longer remain stale-held after nomenclature/literature assays.');
assert.equal(profile.held_or_conditional_stages.S5_CONVERGENCE_DIVERGENCE_LINEAGE,'HELD_UNTIL_SOURCE_BOUND_LINEAGE_QUESTION_REQUIRES_IT');
assert.equal(atlas.schema,'td613.atelier-reentry-atlas/v0.1');
assert.equal(atlas.frontier_state,'NOVELTY_DEFLATION_AND_OPERATOR_FIDELITY_ASSAY_ACTIVE');

for (const law of [
  '30K_VIEW != FRONTIER_DETAIL',
  'GRAPH_ADJACENCY != EDGE_SEMANTICS',
  'EDGE_EXISTENCE != EDGE_TYPE',
  'SAME_TOKEN != SAME_OPERATOR',
  'TEMPORAL_ADJACENCY != CAUSAL_EDGE',
  'DIRECT_RAW_GRAPH_UNION = FORBIDDEN',
  'HELD != NOVEL'
]) assert.ok(atlas.invariants.includes(law),`Reentry atlas must retain ${law}`);

assert.ok(atlas.entry_order[0]==='ATELIER_PROFILE.json','Reentry must begin at the profile, not a random deep artifact.');
assert.ok(atlas.entry_order.includes('latest frontier operation'));
assert.ok(atlas.entry_order.includes('paired machine receipt'));
assert.ok(atlas.entry_order.indexOf('latest frontier operation') < atlas.entry_order.indexOf('source registry or external corpus'),'Future agents should descend through adjudicated frontier before reopening raw source.');

assert.ok(atlas.frontier_stack.length>=5,'Atlas must expose a bounded recent frontier stack.');
for (const item of atlas.frontier_stack) {
  assert.ok(item.id && item.status && item.question && item.result && item.next_test,`Frontier item ${item.id||'<unknown>'} must be self-describing.`);
  for (const rel of [item.operation_path,item.receipt_path]) {
    assert.equal(typeof rel,'string');
    assert.ok(fs.existsSync(path.join(root,rel)),`Frontier pointer must resolve: ${rel}`);
  }
}

// The atlas is explicitly newest-frontier-first, but NEWEST != CONTROLLING.
// The v0.7 primitive-typing assay supersedes v0.6 only as the active frontier;
// it does not erase the prior redundancy counterexample or parent-paper sieve.
assert.equal(atlas.frontier_stack[0].id,'EO_PRIMITIVE_TYPING_STAGE_COLLAPSE_V07','Current primitive-typing/stage-collapse assay must be the first reentry frontier.');
assert.equal(atlas.frontier_stack[0].status,'CURRENT_BRANCH_FRONTIER_PENDING_EXACT_HEAD_VALIDATION');
assert.equal(atlas.frontier_stack[1].id,'EO_REDUNDANCY_V06','Prior GREEN redundancy control must remain immediately retrievable behind the active frontier.');
assert.equal(atlas.frontier_stack[2].id,'EO_FOUNDATIONAL_SIEVE_V05');

assert.deepEqual(
  Object.keys(atlas.graph_descent).sort(),
  [...profile.graph_families].sort(),
  '30K reentry graph descent must cover exactly the declared Atelier graph families without inventing or dropping a family.'
);

assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('does not uniquely identify its internal stage order')),'Negative PRCS-A identification result must be high-salience on reentry.');
assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('does not universally force semantic redundancy upward')),'Redundancy counterexample must survive thread boundaries.');
assert.ok(atlas.negative_results_to_notice_first.some(x=>x.includes('shared arrow glyph') || x.includes('Shared arrow glyph')),'Primitive-glyph/operator-type separation must survive thread boundaries.');
assert.ok(atlas.held_questions.some(x=>x.includes('stage-collapse')),'Source-bound PRCS-A stage-collapse continuation must remain retrievable.');
assert.equal(atlas.cross_atelier_rule.interchange.includes('do not raw-union'),true,'Cross-Atelier reentry may not launder graph families together.');
assert.equal(atlas.user_supplied_public_post_continuity_note.status,'USER_SUPPLIED_TEXT_NOT_INDEPENDENTLY_VERIFIED_AS_TO_PROVENANCE');
assert.equal(atlas.scientific_promotion_authority,false);
assert.equal(atlas.human_closure_required,true);

console.log('Wendbine Atelier reentry atlas v0.1 passed.');
