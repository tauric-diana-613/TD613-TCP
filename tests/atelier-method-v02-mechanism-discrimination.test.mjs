import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {bindExactSourceSpan,discriminateMechanisms,executeBoundedOperator,stageFragmentaryTheory}
 from '../packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/atelier-mechanism-discrimination-v02.mjs';

const sha=s=>createHash('sha256').update(s).digest('hex');
const text='A conventional control error equals the setpoint minus the measured value. This sentence alone is not experimental validation.';
const anchor=bindExactSourceSpan({snapshot_id:'SYNTH_EPOCH',source_file_id:'source:A',
 source_locator:'fixture:a',full_text:text,start_char:0,end_char:73,
 derivative_sha256:sha(text),source_parent_sha256:sha(text)});
assert.equal(anchor.verification,'DERIVATIVE_BYTES_AND_EXACT_SPAN_VERIFIED');
assert.equal(anchor.source_text_in_packet,false);
assert.equal(anchor.source_claim_truth,'NOT_ADJUDICATED');
assert.throws(()=>bindExactSourceSpan({snapshot_id:'SYNTH_EPOCH',source_file_id:'source:A',
 source_locator:'fixture:a',full_text:text,start_char:0,end_char:73,
 derivative_sha256:'0'.repeat(64),source_parent_sha256:sha(text)}),/SOURCE_TEXT_DIGEST_MISMATCH/);
const ref=anchor.source_file_id+':'+anchor.start_char+':'+anchor.end_char;
const h=(id,kind,source_relation,extra={})=>({
 id,label:id,source_relation,operator:{kind},input_fields:['setpoint','measured'],
 source_anchor_ids:source_relation==='SOURCE_FORMULATION_PROPOSED'?[ref]:[],
 prediction_scope:'FINITE_SYNTHETIC',falsifier:'Discriminating finite-case counterexample',
 prior_art_state:'UNASSESSED',prior_art_refs:[],...extra
});
const diff=h('diff','DIFFERENCE','SOURCE_FORMULATION_PROPOSED',{
 prior_art_state:'SOURCE_ATTRIBUTES_CONVENTIONAL_FAMILY',prior_art_refs:['fixture:a']});
const sum=h('sum','SUM','ANALYST_FORMALIZATION');
const abs=h('abs','ABS_DIFFERENCE','ANALYST_FORMALIZATION');
const nullModel=h('null','UNSPECIFIED','NULL_ALTERNATIVE');
const cases=[
 {case_id:'a',inputs:{setpoint:9,measured:3},observed:6,observation_basis:'SYNTHETIC_FORMULA'},
 {case_id:'b',inputs:{setpoint:3,measured:9},observed:-6,observation_basis:'SYNTHETIC_FORMULA'},
 {case_id:'c',inputs:{setpoint:4,measured:4},observed:0,observation_basis:'SYNTHETIC_FORMULA'}];
const t=discriminateMechanisms({snapshot_id:'SYNTH_EPOCH',anchors:[anchor],
 hypotheses:[diff,sum,abs,nullModel],cases,observation_origin:'SYNTHETIC_FORMULA_CONSISTENCY'});
assert.equal(t.case_count,3);
assert.deepEqual(t.compatible_model_ids,['diff']);
assert.deepEqual(t.falsified_on_supplied_cases,['sum','abs']);
assert.equal(t.models_distinguishable_on_cases,true);
assert.equal(t.result_classification,'ONE_FINITE_CASE_COMPATIBLE_MODEL_NO_GENERAL_PROOF');
assert.equal(t.hypotheses.find(x=>x.id==='null').classification,'ABSTAINING_UNSPECIFIED_MODEL');
assert.equal(t.prior_art_evaluation,'NO_INDEPENDENT_PRIOR_ART_SEARCH_WITNESSED');
assert.equal(t.universal_theory_validated,false);
assert.equal(t.novelty_validated,false);
assert.equal(t.independent_empirical_validation,false);
assert.equal(executeBoundedOperator(diff,{setpoint:-1,measured:2}),-3);
assert.throws(()=>discriminateMechanisms({snapshot_id:'SYNTH_EPOCH',anchors:[anchor],
 hypotheses:[{...diff,source_anchor_ids:['forged']},nullModel],cases,
 observation_origin:'SYNTHETIC_FORMULA_CONSISTENCY'}),/HYPOTHESIS_UNBOUND_SOURCE_REF/);
assert.throws(()=>discriminateMechanisms({snapshot_id:'OTHER_EPOCH',anchors:[anchor],
 hypotheses:[diff,nullModel],cases,observation_origin:'SYNTHETIC_FORMULA_CONSISTENCY'}),/UNVERIFIED_SOURCE_ANCHOR/);
const impossible=[{...diff,operator:{kind:'CONSTANT',value:500}},nullModel];
const noFit=discriminateMechanisms({snapshot_id:'SYNTH_EPOCH',anchors:[anchor],hypotheses:impossible,cases,
 observation_origin:'SYNTHETIC_FORMULA_CONSISTENCY'});
assert.equal(noFit.result_classification,'NO_FINITE_CASE_COMPATIBLE_SPECIFIED_MODEL');
// Different formulas can be observationally indistinguishable on poorly chosen inputs.
const weakCases=[
 {case_id:'weak1',inputs:{setpoint:0,measured:0},observed:0,observation_basis:'SYNTHETIC_FORMULA'},
 {case_id:'weak2',inputs:{setpoint:2,measured:0},observed:2,observation_basis:'SYNTHETIC_FORMULA'}];
const nonunique=discriminateMechanisms({snapshot_id:'SYNTH_EPOCH',anchors:[anchor],
 hypotheses:[diff,sum,nullModel],cases:weakCases,observation_origin:'SYNTHETIC_FORMULA_CONSISTENCY'});
assert.deepEqual(nonunique.compatible_model_ids,['diff','sum']);
assert.equal(nonunique.models_distinguishable_on_cases,false);
assert.equal(nonunique.result_classification,'OBSERVATIONALLY_NONUNIQUE_COMPATIBLE_MODELS');
assert.throws(()=>discriminateMechanisms({snapshot_id:'SYNTH_EPOCH',anchors:[anchor],
 hypotheses:[diff,{...sum,prior_art_state:'SOURCE_ATTRIBUTES_CONVENTIONAL_FAMILY'},nullModel],
 cases,observation_origin:'SYNTHETIC_FORMULA_CONSISTENCY'}),/CONVENTIONAL_PRIOR_ART_UNSOURCED/);

const creative=stageFragmentaryTheory({snapshot_id:'SYNTH_EPOCH',anchor,
 proposed_question:'Does the narrated boundary have an operational meaning?',
 objects:['occupants','room'],variables:[],known_reference_terms:[]});
assert.equal(creative.status,'HELD_EXCERPT_INSUFFICIENT');
assert.ok(creative.missing_requirements.includes('TYPED_EXECUTABLE_OPERATOR_NOT_IN_ADMITTED_EXCERPT'));
assert.equal(creative.conceptual_value_not_denied,true);
assert.equal(creative.full_source_conclusion,false);
assert.equal(creative.novelty_validated,false);
const specified=stageFragmentaryTheory({snapshot_id:'SYNTH_EPOCH',anchor,
 proposed_question:'Does the declared finite operator predict outcomes?',
 objects:['x','y'],variables:['x','y'],operator_specification:'SUBTRACT',
 prediction_specification:'x-y',falsifier_specification:'A counterexample to x-y',
 operator_identity_witness:'SYNTHETIC_SYMBOLIC_CANDIDATE'});
assert.equal(specified.status,'CANDIDATE_SPECIFIED_AWAITING_EXTERNAL_ADJUDICATION');
assert.equal(specified.theory_unification_validated,false);

console.log('Universal source-anchored mechanism discrimination: typed difference/add/absolute/null, real hash checks, observational nonuniqueness, false twins, prior-art abstention and no empirical promotion: PASS.');
