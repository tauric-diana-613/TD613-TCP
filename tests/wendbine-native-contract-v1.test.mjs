import assert from 'node:assert/strict';
import test from 'node:test';
import {validateNativeInputs,compileQualified,CONTRACT} from '../scripts/wendbine-native-method-adapter-v1.mjs';
import path from 'node:path';
import {compilePublicCorpus} from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-compile.mjs';

function fixture(){
 const meta={schema:'wendbine-public-corpus-snapshot/v0.1',snapshot_id:'FICTIONAL_ONLY',coverage:{admitted_source_count:1},rights:{full_post_bodies_copied:false},scope:{private_google_group_admitted:false},authority:{human_closure_required:true,td613_scientific_promotion:false,merge:false,deployment:false}};
 const posts=[{source_id:'reddit:t3_abcde1',snapshot_id:meta.snapshot_id,community:'r/Wendbine',source_text_stored:false,real_person_identity_adjudicated:false,canonical_url:'https://www.reddit.com/r/Wendbine/comments/abcde1/',declared_concepts:['a','b'],source_flags:[],public_date:'2026-09-10',time_precision:'DAY'}];
 const registry={schema:'wendbine-typed-relation-registry/v0.1',snapshot_id:meta.snapshot_id,fields:['source_id','graph','from','relation','to','evidence_class'],relations:[['reddit:t3_abcde1','G_D','a','DIFFERS_FROM','b','SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE']]};
 return {meta,posts,registry};
}
function original(x){const relations=x.registry.relations.map(row=>Object.fromEntries(x.registry.fields.map((k,i)=>[k,row[i]])));return compilePublicCorpus(x.meta,x.posts,relations);}

test('fictional positive preserves distinct graph and evidence class',()=>{
 const x=fixture();assert.equal(validateNativeInputs(x.meta,x.posts,x.registry).length,1);assert.equal(original(x).typed_relation_edges[0].graph,'G_D');
});
for(const [name,change] of [
 ['unknown graph',x=>{x.registry.relations[0][1]='G_NONSENSE';}],
 ['unknown relation',x=>{x.registry.relations[0][3]='PROVES_HIDDEN_CAUSE';}],
 ['promoted evidence',x=>{x.registry.relations[0][5]='EMPIRICALLY_PROVEN';}],
 ['URL identity substitution',x=>{x.posts[0].canonical_url='https://www.reddit.com/r/Wendbine/comments/abcde2/';}],
 ['copied body masked by false flag',x=>{x.posts[0].selftext='fictional full body';}],
 ['private scope',x=>{x.meta.scope.private_google_group_admitted=true;}],
 ['forged scientific promotion',x=>{x.meta.authority.td613_scientific_promotion=true;}],
 ['duplicate relation witness',x=>{x.registry.relations.push([...x.registry.relations[0]]);}]
])test(`preserved predecessor accepts ${name}; strict successor refuses`,()=>{
 const x=fixture();change(x);assert.doesNotThrow(()=>original(x));assert.throws(()=>validateNativeInputs(x.meta,x.posts,x.registry));
});
test('unadmitted source and malformed tuple refused independently',()=>{
 const x=fixture();x.registry.relations[0][0]='reddit:t3_absent';assert.throws(()=>validateNativeInputs(x.meta,x.posts,x.registry));
 const y=fixture();y.registry.relations[0].pop();assert.throws(()=>validateNativeInputs(y.meta,y.posts,y.registry));
});
test('original duplicate sources and copied-body flags remain refused',()=>{
 const x=fixture();x.meta.coverage.admitted_source_count=2;x.posts.push({...x.posts[0]});assert.throws(()=>original(x));
 const y=fixture();y.posts[0].source_text_stored=true;assert.throws(()=>original(y));
});
test('successor snapshots input across native import and pins immutable contract',async()=>{
 const x=fixture();const result=compileQualified({...x,compilerPath:path.resolve('packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-compile.mjs')});
 x.posts[0].source_flags.push('EXPLICIT_CORRECTION');x.meta.coverage.admitted_source_count=99;
 const bound=await result;assert.equal(bound.native_output.coverage.admitted_source_count,1);assert.deepEqual(bound.native_output.correction_sources,[]);
 assert.throws(()=>CONTRACT.evidence_classes.push('FORGED'));
});
