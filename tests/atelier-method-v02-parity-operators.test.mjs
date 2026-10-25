import assert from 'node:assert/strict';
import { compileSourceBoundTopology, makeHeldoutView, scoreHeldoutPlacement,
  resolveSourceEntity, polycompilationConservation, independentEvidenceSupport,
  readRegisteredRows,resolveWorkManifestations,motifCandidateSieve,reconstructionControlBattery,nomenclatureOperatorCrosswalk } from '../packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/atelier-parity-operators-v02.mjs';

const epoch={snapshot_id:'fixed-20261025',seal_id:'synthetic-seal'};
const resolver=[
 {entity_id:'work:alpha',entity_type:'work',path:'01-MANIFESTS/registry.jsonl'},
 {entity_id:'capture:a',entity_type:'capture',capture_id:'a',path:'01-MANIFESTS/captures.jsonl'},
 {entity_id:'work:beta',entity_type:'work',path:'01-MANIFESTS/registry.jsonl'}
];
const captures=[{capture_id:'a',target_id:'capture:a'}];
const derivatives=[{derivative_id:'d1',capture_id:'a'}];
const resolved=resolveSourceEntity({entity_id:'capture:a',epoch,expected_epoch:epoch,resolver_rows:resolver,captures,derivatives});
assert.equal(resolved.status,'RESOLVED');
assert.equal(resolved.captures.length,1);
assert.equal(resolved.derivatives.length,1);
assert.equal(resolved.matches.length,1);
assert.equal(resolved.authority,'QUERY_ONLY_NO_PROMOTION');
const bounded=resolveSourceEntity({entity_id:'work:alpha',epoch,expected_epoch:epoch,resolver_rows:resolver,captures,derivatives});
assert.deepEqual(bounded.missing_hops,['CAPTURE','DERIVATIVE']);
assert.equal(resolveSourceEntity({entity_id:'absent',epoch,expected_epoch:epoch,resolver_rows:resolver}).status,'UNRESOLVED_TARGET');
assert.throws(()=>resolveSourceEntity({entity_id:'capture:a',epoch,expected_epoch:{...epoch,seal_id:'tampered'},resolver_rows:resolver}),/SEAL_MISMATCH/);
assert.throws(()=>resolveSourceEntity({entity_id:'capture:a',epoch,expected_epoch:{...epoch,snapshot_id:'other'},resolver_rows:resolver}),/SNAPSHOT_MISMATCH/);

const family=polycompilationConservation({
 epoch:'research-epoch-1',source_rows:[{source_id:'lexicon'},{source_id:'handbook'},{source_id:'manual'}],
 roles:['DEFINITION','TRANSLATION','EXECUTION'],shared_claim_ids:['constraint:A','constraint:missing'],
 role_claims:{
   DEFINITION:[{claim_id:'constraint:A',source_ids:['lexicon'],evidence_class:'SOURCE_DECLARATION'}],
   TRANSLATION:[{claim_id:'constraint:A',source_ids:['handbook'],evidence_class:'SOURCE_DECLARATION'}],
   EXECUTION:[{claim_id:'constraint:A',source_ids:['manual'],evidence_class:'SOURCE_DECLARATION'}]
 }
});
assert.equal(family.invariants['constraint:A'].all_roles_supported,true);
assert.equal(family.invariants['constraint:missing'].all_roles_supported,false);
assert.match(family.claim_ceiling,/NOT_AUTOMATICALLY_PROVED/);
assert.throws(()=>polycompilationConservation({
 epoch:'x',source_rows:[{source_id:'a'},{source_id:'b'}],roles:['R1','R2'],shared_claim_ids:[],
 role_claims:{R1:[{claim_id:'x',source_ids:['fake'],evidence_class:'SOURCE_DECLARATION'}],R2:[]}
}),/UNKNOWN_POLYCOMPILATION_SOURCE/);

const source_rows=[
 {snapshot_id:'fixed-20261025',source_id:'s1',declared_concepts:['operator','provenance','state']},
 {snapshot_id:'fixed-20261025',source_id:'s2',declared_concepts:['operator','state']},
 {snapshot_id:'fixed-20261025',source_id:'s3',declared_concepts:['provenance','epoch']}
];
const relation_rows=[
 {source_id:'s1',graph:'G_A',from:'a',to:'b',relation:'MAY',evidence_class:'SOURCE_EXPLICIT'},
 {source_id:'s2',graph:'G_O',from:'b',to:'c',relation:'SHOWS',evidence_class:'SOURCE_EXPLICIT'},
 {source_id:'s3',graph:'G_D',from:'c',to:'d',relation:'DEPENDS',evidence_class:'SOURCE_EXPLICIT'}
];
const result=compileSourceBoundTopology({snapshot_id:'fixed-20261025',source_rows,relation_rows});
assert.equal(result.source_count,3);
assert.equal(result.concept_count,4);
assert.equal(result.typed_relation_count,3);
assert.equal(result.cooccurrence_count,1); // Only operator/state occurs in two distinct source rows.
assert.equal(result.recurrent_concepts.length,3);
assert.equal(result.typed_graph_counts.G_O,1);
const withheld=makeHeldoutView({source_rows,relation_rows,target_id:'s2',snapshot_id:'fixed-20261025'});
assert.equal(withheld.target_hidden,true);
assert.equal(withheld.topology.source_count,2);
assert.equal(withheld.topology.typed_relation_count,2);
assert.equal(withheld.topology.sorted_edges.some(x=>x.source_id==='s2'),false);
const scored=scoreHeldoutPlacement({view:withheld,
 frozen_prediction:{locked_before_target_reveal:true,target_id:'s2',graph_families:['G_O','G_D']},
 target_facts:{source_id:'s2',graph_families:['G_O']}});
assert.equal(scored.score,2/3);
assert.equal(scored.exact_family_set_match,false);
assert.throws(()=>scoreHeldoutPlacement({view:withheld,
 frozen_prediction:{locked_before_target_reveal:false,target_id:'s2',graph_families:[]},
 target_facts:{source_id:'s2',graph_families:[]}}),/PREDICTION_NOT_FROZEN/);
assert.throws(()=>compileSourceBoundTopology({snapshot_id:'fixed-20261025',source_rows,
 relation_rows:[{...relation_rows[0],source_id:'unseen'}]}),/RELATION_SOURCE_NOT_ADMITTED/);
assert.throws(()=>compileSourceBoundTopology({snapshot_id:'fixed-20261025',source_rows:[{...source_rows[0],snapshot_id:'future'}],relation_rows:[]}),/SOURCE_ID_OR_SNAPSHOT_INVALID/);
const grouped=independentEvidenceSupport([
 {evidence_id:'e1',source_id:'s1',ancestor_id:'work:A'},
 {evidence_id:'e2',source_id:'s2',ancestor_id:'work:A'},
 {evidence_id:'e3',source_id:'s3',ancestor_id:'work:B'},
 {evidence_id:'e4',source_id:'s3',ancestor_id:null}
]);
assert.equal(grouped.distinct_known_ancestors,2);
assert.equal(grouped.verdict,'INDEPENDENCE_UNRESOLVED');
assert.deepEqual(grouped.independence_unresolved_evidence_ids,['e4']);
assert.equal(grouped.independently_counted_families.find(x=>x.ancestor_id==='work:A').evidence_ids.length,2);
assert.equal(readRegisteredRows instanceof Function,true);

const work=resolveWorkManifestations({
 work_id:'emwork_test',epoch:'EM_FIXED',works:[{
  work_id:'emwork_test',identity_status:'SAME_WORK_SUPPORTED',human_gate_required:true,
  minimum_independent_work_contribution:1,maximum_independent_work_contribution:2,
  manifestation_source_file_ids:['emsrc1','emsrc2'],authorship:'UNRESOLVED'
 }],
 manifestations:[
  {source_file_id:'emsrc1',work_id:'emwork_test',identity_status:'SAME_WORK_SUPPORTED',human_gate_required:true},
  {source_file_id:'emsrc2',work_id:'emwork_test',identity_status:'SAME_WORK_SUPPORTED',human_gate_required:true}
 ],
 source_rows:[
  {source_file_id:'emsrc1',sha256:'a'.repeat(64),media_type:'application/pdf',original_filename:'x.pdf'},
  {source_file_id:'emsrc2',sha256:'b'.repeat(64),media_type:'text/markdown',original_filename:'x.md'}
 ]
});
assert.equal(work.status,'RESOLVED_OPERATIONAL_WORK');
assert.deepEqual(work.independent_work_contribution_interval,[1,2]);
assert.equal(work.claim_equivalence_across_manifestations,false);
assert.equal(work.human_gate_required,true);
assert.equal(work.manifestations.length,2);
assert.equal(resolveWorkManifestations({
 work_id:'missing',epoch:'T',works:[],manifestations:[],source_rows:[]}).status,'UNRESOLVED_WORK');
const motifs=motifCandidateSieve({snapshot_id:'EM_FIXED',terms:['Vibephysics','holonomy'],
 source_spans:[
  {source_id:'emsrc1',source_locator:'synthetic:paragraph1',work_id:'workX',work_identity_status:'SAME_WORK_SUPPORTED',text:'Vibephysics and holonomy. VIBEPHYSICS!'},
  {source_id:'emsrc2',source_locator:'synthetic:paragraph2',work_id:'workX',work_identity_status:'SAME_WORK_SUPPORTED',text:'holonomy'}
 ]});
assert.deepEqual(motifs.summary.find(x=>x.term==='vibephysics').occurrences,2);
assert.equal(motifs.summary.find(x=>x.term==='holonomy').source_span_count,2);
assert.equal(motifs.observations.every(x=>x.status==='LITERAL_STRING_OBSERVATION_ONLY'),true);
assert.match(motifs.claim_ceiling,/NO_MECHANISM_IDENTITY/);


const viewWithDayPrecision=makeHeldoutView({source_rows:source_rows.map(s=>({...s,time_precision:'DAY'})),
 relation_rows,target_id:'s2',snapshot_id:'fixed-20261025'});
const controlPlan={state:'PREREGISTERED_NOT_EXECUTED',target_ids:['s2'],controls:['C0','C1','C2','C3','C4']};
const battery=reconstructionControlBattery({view:viewWithDayPrecision,preregistration:controlPlan,seed:613});
assert.equal(battery.C0.compiled.source_count,2);
assert.equal(battery.C1.publication_time_precision,'DAY_ONLY');
assert.equal(battery.C1.serial_order_credit,'NOT_IDENTIFIABLE_FROM_DAY_BUCKETS');
assert.equal(battery.C2.compiled.concept_count,battery.C0.compiled.concept_count);
assert.equal(battery.C2.semantic_label_credit,'WITHHELD');
assert.equal(battery.C3.compiled.typed_relation_count,0);
assert.equal(battery.C4.state,'HELD_DECOY_NOT_PREREGISTERED');
assert.equal(battery.source_target_leakage,false);
assert.throws(()=>reconstructionControlBattery({view:viewWithDayPrecision,
 preregistration:{state:'AFTER_SCORING',target_ids:['s2']}}),/TARGET_NOT_PREREGISTERED/);
assert.throws(()=>reconstructionControlBattery({view:viewWithDayPrecision,
 preregistration:controlPlan,decoy:{preregistered:false,source:{source_id:'decoy',snapshot_id:'fixed-20261025'}}}),/DECOY_NOT_BOUND/);
const activated=reconstructionControlBattery({view:viewWithDayPrecision,preregistration:controlPlan,
 decoy:{preregistered:true,independent_source_witness:'DECLARED_PREREG_EXTERNAL_REF',
  source:{source_id:'decoy',snapshot_id:'fixed-20261025',declared_concepts:['unrelated_concept'],time_precision:'DAY'}}});
assert.equal(activated.C4.state,'EXECUTED_PREREGISTERED_UNRELATED_DECOY');
assert.equal(activated.C4.compiled.source_count,3);


const crosswalk=nomenclatureOperatorCrosswalk({
 source_snapshot:'SOURCE_FROZEN',receiver_snapshot:'RECEIVER_PRE_DONOR',
 rows:[
  {id:'n',subject:'observation',source_locator:'source:n',receiver_baseline_locator:'base:n',
   proposed_term:'observability',proposes_better_name:true,proposes_better_operator:false,
   conventional_prior_refs:['textbook:n'],operator_delta_refs:[],alternative_explanation:'Known term, receiver benefit only',
   claim_ceiling:'BETTER_NAME_ONLY'},
  {id:'o',subject:'return',source_locator:'source:o',receiver_baseline_locator:'base:o',
   proposed_term:'recovery',proposes_better_name:false,proposes_better_operator:true,
   conventional_prior_refs:[],operator_delta_refs:['source:o','base:o'],
   operator_before:'indiscriminate rollback',operator_after:'selective rollback',alternative_explanation:'ordinary engineering',
   claim_ceiling:'BETTER_OPERATOR_RELATIVE_TO_RECEIVER_ONLY'},
  {id:'r',subject:'unbound',source_locator:'source:r',receiver_baseline_locator:'base:r',
   proposed_term:'private term',proposes_better_name:false,proposes_better_operator:false,
   conventional_prior_refs:[],operator_delta_refs:[],alternative_explanation:'no operator witness',
   rejection_reason:'No lawful nomenclature import',claim_ceiling:'REJECT_NAMING'}
 ]});
assert.deepEqual(crosswalk.counts,{BETTER_NAME:1,BETTER_OPERATOR:1,BOTH:0,NEITHER:0,REJECTED:1});
assert.equal(crosswalk.external_prior_art_verified_by_runner,false);
assert.equal(crosswalk.scientific_promotion,false);
assert.throws(()=>nomenclatureOperatorCrosswalk({source_snapshot:'S',receiver_snapshot:'R',rows:[{
  id:'unwitnessed',subject:'x',source_locator:'s',receiver_baseline_locator:'r',proposed_term:'a',
  proposes_better_name:true,proposes_better_operator:false,conventional_prior_refs:[],operator_delta_refs:[],
  alternative_explanation:'existing',claim_ceiling:'low'}]}),/ORDINARY_TERM_UNGROUNDED/);

console.log('Atelier parity operators synthetic suite: SRC exact-epoch resolver, role conservation, Wendbine-type compiler, withheld target leakage controls, independence deflation passed.');
