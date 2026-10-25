import assert from 'node:assert/strict';
import { compileSourceBoundTopology, makeHeldoutView, scoreHeldoutPlacement,
  resolveSourceEntity, polycompilationConservation, independentEvidenceSupport,
  readRegisteredRows } from '../packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/atelier-parity-operators-v02.mjs';

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
console.log('Atelier parity operators synthetic suite: SRC exact-epoch resolver, role conservation, Wendbine-type compiler, withheld target leakage controls, independence deflation passed.');
