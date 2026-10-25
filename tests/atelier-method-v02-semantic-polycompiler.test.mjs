import assert from 'node:assert/strict';
import path from 'node:path';
import { readRegisteredRows } from '../packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/atelier-parity-operators-v02.mjs';
import { assemblePolycompiler,traceTypedCompilations,roleAblation,
  inspectContextualAlternatives } from '../packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/atelier-semantic-polycompiler-v02.mjs';

const src=path.resolve('packages/dome_world_exact/fixtures/a15-r0/SRC');
const epoch={snapshot_id:'src-20260824-p2-001',seal_id:'SEALED_EPOCH_QUERY_BOUND'};
const passes=readRegisteredRows(src,'05-OPERATIONS/phase2/compilation-passes.jsonl');
const roles=readRegisteredRows(src,'05-OPERATIONS/phase2/contextual-role-assertions.jsonl');
const modeled=assemblePolycompiler({
 snapshot_id:epoch.snapshot_id,seal_id:epoch.seal_id,
 compilation_passes:passes,role_assertions:roles
});
assert.equal(modeled.pass_count,27);
assert.equal(modeled.role_count,107);
assert.equal(modeled.passes.reduce((n,x)=>n+x.roles.length,0),roles.length);
const expected=new Map(roles.map(x=>[x.contextual_role_assertion_id,x]));
for(const p of modeled.passes)for(const r of p.roles){
 const native=expected.get(r.role_assertion_id);
 assert.ok(native);
 assert.equal(r.architecture_id,native.architecture_id);
 assert.equal(r.subject_id,native.subject_id);
 assert.equal(r.relation_type,native.role_normalized);
 assert.equal(r.source_status,native.source_status);
 assert.equal(r.adjudication_status,native.adjudication_status);
 assert.deepEqual(r.context_scope,native.scope);
 assert.deepEqual(r.evidence_ids,native.evidence_ids);
 if(native.adjudication_status!=='WITNESSED' || native.source_status!=='EXPLICIT_SOURCE')
  assert.notEqual(r.ceiling,'EXPLICIT_SOURCE_WITNESSED_CONTEXTUAL_ROLE');
}
const stateCount=k=>modeled.passes.flatMap(x=>x.roles).filter(x=>x.adjudication_status===k).length;
assert.equal(stateCount('WITNESSED'),65);
assert.equal(stateCount('UNRESOLVED'),10);
assert.equal(stateCount('MULTIPLE_TITLE_ALIGNED_CANDIDATES'),6);
assert.equal(stateCount('CANDIDATE'),11);
const exemplar=modeled.passes.flatMap(x=>x.roles).find(x=>
 x.ceiling==='EXPLICIT_SOURCE_WITNESSED_CONTEXTUAL_ROLE');
assert.ok(exemplar);
const direct=traceTypedCompilations(modeled,{from:exemplar.subject_id,to:exemplar.architecture_id});
assert.ok(direct.routes.some(x=>x.hop_count===1 && x.assertion_ids.includes(exemplar.role_assertion_id)));
assert.ok(direct.routes.every(x=>x.scientific_causality_admitted===false&&
 x.independent_source_families_established===false));
const suppressed=traceTypedCompilations(modeled,{from:exemplar.subject_id,to:exemplar.architecture_id,
 max_hops:1,blocked_assertions:[exemplar.role_assertion_id]});
assert.equal(suppressed.routes.some(x=>x.assertion_ids.includes(exemplar.role_assertion_id)),false);
const ablated=roleAblation(modeled,{target_id:exemplar.architecture_id,
 withdraw_assertion_ids:[exemplar.role_assertion_id]});
assert.ok(ablated.withdrawn_roles.includes(exemplar.role_assertion_id));
assert.equal(ablated.original_roles-ablated.retained_roles,1);
assert.ok(ablated.remaining_relation_types.every(x=>typeof x==='string'));
const alternatives=inspectContextualAlternatives(modeled);
assert.ok(Array.isArray(alternatives.multi_strength_cells));
assert.match(alternatives.claim_ceiling,/DESCRIPTIVE/);

// Synthetic two-hop with mixed native evidence strength: path discovery must not
// construct a new direct SOURCE_WITNESSED relation from two contextual assertions.
const synth=[
 {contextual_role_assertion_id:'r1',subject_id:'A',architecture_id:'B',role_normalized:'DEFINES',
  source_status:'EXPLICIT_SOURCE',adjudication_status:'WITNESSED',evidence_ids:['w1'],
  interpretive_limit:'Only A->B has a direct source witness',atelier_snapshot_id:'SYNTH_EPOCH',
  seal_epoch_binding:'RESOLVE_MATCHED_CURRENT_SEAL'},
 {contextual_role_assertion_id:'r2',subject_id:'B',architecture_id:'C',role_normalized:'TRANSLATES',
  source_status:'ARCHIVE_INFERRED',adjudication_status:'CANDIDATE',evidence_ids:['w2'],
  interpretive_limit:'Translation proposed from archive',atelier_snapshot_id:'SYNTH_EPOCH',
  seal_epoch_binding:'RESOLVE_MATCHED_CURRENT_SEAL'}
];
const cpasses=synth.map((r,i)=>({
 compilation_pass_id:'p'+i,build_target_id:r.architecture_id,
 atelier_snapshot_id:'SYNTH_EPOCH',seal_epoch_binding:'RESOLVE_MATCHED_CURRENT_SEAL',
 input_role_assertion_ids:[r.contextual_role_assertion_id],contextual_role_count:1,input_ids:[r.subject_id]
}));
const graph=assemblePolycompiler({snapshot_id:'SYNTH_EPOCH',seal_id:'SYNTH_SEAL',
 compilation_passes:cpasses,role_assertions:synth});
const path2=traceTypedCompilations(graph,{from:'A',to:'C',max_hops:3});
assert.equal(path2.routes.length,1);
assert.equal(path2.routes[0].hop_count,2);
assert.equal(path2.routes[0].direct_relation_admitted,false);
assert.match(path2.routes[0].path_ceiling,/CANDIDATE/);
assert.deepEqual(path2.routes[0].assertion_ids,['r1','r2']);
assert.equal(traceTypedCompilations(graph,{from:'A',to:'C',max_hops:1}).routes.length,0);
assert.equal(traceTypedCompilations(graph,{from:'A',to:'C',
 blocked_assertions:['r2']}).routes.length,0);
const forged=structuredClone(synth);
forged[1].architecture_id='OTHER';
assert.throws(()=>assemblePolycompiler({snapshot_id:'SYNTH_EPOCH',seal_id:'SYNTH_SEAL',
 compilation_passes:cpasses,role_assertions:forged}),/COMPILATION_ROLE_TARGET_MISMATCH/);
assert.throws(()=>assemblePolycompiler({snapshot_id:'SYNTH_EPOCH',seal_id:'SYNTH_SEAL',
 compilation_passes:cpasses,role_assertions:[...synth,synth[0]]}),/ROLE_DUPLICATE_OR_MISSING_ID/);
const stale=structuredClone(synth);stale[0].atelier_snapshot_id='OTHER';
assert.throws(()=>assemblePolycompiler({snapshot_id:'SYNTH_EPOCH',seal_id:'SYNTH_SEAL',
 compilation_passes:cpasses,role_assertions:stale}),/ROLE_EPOCH_OR_SEAL_CONTRACT/);
const missing=structuredClone(cpasses);missing[0].input_role_assertion_ids=['missing'];
assert.throws(()=>assemblePolycompiler({snapshot_id:'SYNTH_EPOCH',seal_id:'SYNTH_SEAL',
 compilation_passes:missing,role_assertions:synth}),/COMPILATION_UNBOUND_ROLE_ID/);
console.log('SRC semantic polycompiler native pass/role replay 27/107 plus synthetic two-hop non-lift, role withdrawal, epoch and identity poisoning: passed; no autonomous semantic truth/novelty proof.');
