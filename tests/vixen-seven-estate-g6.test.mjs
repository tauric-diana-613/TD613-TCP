/**
 * G6 source-only BRAID tests: canonical census / noncanonical cart / scoped
 * native host return. This suite performs zero external acquisition or
 * provider synchronization, human permission, publication or Experiment B.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {
 deriveSynthesisHeadline,scoreUnifiedSynthesisCandidates,
 normalizeSupplementalResearchCandidates
} from '../app/encyclopedia/vixen-estate/synthesis-salon-engine.mjs';
import {
 G6_PROVIDER_BOUNDARIES,G6_RETURN_SCHEMA,G6_CART_SCHEMA,
 createG6HostReadReturn,createG6ResearchCart
} from '../scripts/vixen-g6-research-return.mjs';

const html=readFileSync(fileURLToPath(new URL('../app/encyclopedia/vix-cyb.html',import.meta.url)),'utf8');
const match=html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
if(!match)throw Error('HELD_CANONICAL_VIXEN_CORPUS_NOT_PRESENT');
const corpus=JSON.parse(match[1]);
const workIds=corpus.works.map(w=>w.work_id);

test('G6-FADT02 duplicate supplementary labels cannot inflate canonical 32 Works',()=>{
 const repeated=[{id:'SUP-A',title:'Same Unverified Lead',fadt_exact:true,w_plane_grounded:true},
  {id:'SUP-B',title:'Same Unverified Lead',fadt_exact:true,w_plane_grounded:true}];
 const rows=normalizeSupplementalResearchCandidates(repeated);
 assert.equal(rows.length,1);
 assert.equal(rows[0].canonical_work_admission,false);
 assert.equal(rows[0].fadt_exact,false);
 assert.equal(rows[0].w_plane_grounded,false);
 const baseline=deriveSynthesisHeadline({corpus});
 const output=deriveSynthesisHeadline({corpus,supplementalSources:repeated});
 assert.equal(baseline.provenance.work_census,32);
 assert.equal(output.provenance.work_census,32);
 assert.equal(output.provenance.supplemental_sources,1);
 assert.equal(output.provenance.supplemental_count_class,'NONCANONICAL_RESEARCH_LEADS');
 assert.doesNotMatch(JSON.stringify(output),/34 (?:canonical )?Works/);
 assert.equal(corpus.works.length,32);
 const ranked=scoreUnifiedSynthesisCandidates(corpus,{supplementalSources:repeated,candidateLimit:20});
 const candidate=ranked.candidates.find(x=>x.id==='cand-widened-corpus');
 assert.ok(candidate);
 assert.equal(candidate.fadtExact,false);
 assert.equal(candidate.wPlaneGrounded,false);
 assert.equal(candidate.breakdown.fadt_exact,false);
 assert.equal(candidate.breakdown.w_plane_grounded,false);
 assert.equal(candidate.breakdown.synergy_fadt,0);
 assert.equal(candidate.breakdown.cluster_bridge,0);
 assert.equal(candidate.breakdown.supplemental_claim_support,'HELD_NO_FADT_OR_W_PLANE');
 assert.equal(output.provenance.empirical_replication_credit,0);
});
test('G6-B witnessed canonical candidate data remain untouched, duplicate leads normalize only inside research scope',()=>{
 const before=scoreUnifiedSynthesisCandidates(corpus,{candidateLimit:20});
 const after=scoreUnifiedSynthesisCandidates(corpus,{supplementalSources:[
  {id:'a',title:'Self-same provisional label'},
  {id:'b',title:'Self-same provisional label'},
  {id:'c',title:'Another provisional label'}
 ],candidateLimit:20});
 assert.equal(before.fadt_profile.work_count,32);
 assert.equal(after.fadt_profile.work_count,32);
 assert.deepEqual(after.fadt_profile,before.fadt_profile);
 assert.equal(after.candidates.find(c=>c.id==='cand-quotient-holonomy').breakdown.fadt_exact,
  before.candidates.find(c=>c.id==='cand-quotient-holonomy').breakdown.fadt_exact);
 assert.equal(normalizeSupplementalResearchCandidates([{id:'x',title:'Distinct One'},
  {id:'y',title:'Distinct Two'}]).length,2);
 assert.equal(normalizeSupplementalResearchCandidates([null,{},'untrusted']).length,0);
});
test('G6-C separate research candidate cart deduplicates source coordinates, not canonical Works',()=>{
 const cart=createG6ResearchCart({canonicalWorkIds:workIds,
  verifyHumanSelection:({proof})=>proof==='verified-gesture'});
 assert.equal(cart.inspect().schema,G6_CART_SCHEMA);
 assert.equal(cart.inspect().canonical_work_count,32);
 assert.equal(cart.add({provider:'REDDIT',source_id:'reddit:t3_abcdef',original_title:'test'}).status,'HELD');
 assert.equal(cart.add({provider:'REDDIT',source_id:'reddit:t3_abcdef',
  original_title:'test',selectedByHuman:true}).status,'HELD',
  'Caller-declared selection is never sufficient to add a candidate');
 const added=cart.add({provider:'REDDIT',source_id:'reddit:t3_abcdef',
  original_title:'Observed public label',selectionProof:'verified-gesture'});
 assert.equal(added.status,'ADDED_RESEARCH_CANDIDATE');
 assert.equal(added.candidate.canonical_work_id,null);
 assert.equal(added.candidate.body_rights_state,'HELD_RIGHTS_AND_SOURCE_READBACK');
 assert.equal(cart.add({provider:'REDDIT',source_id:'reddit:t3_abcdef',
  selectionProof:'verified-gesture'}).status,'EXISTING_RESEARCH_CANDIDATE');
 assert.equal(cart.add({provider:'REDDIT',source_id:workIds[0],
  selectionProof:'verified-gesture'}).status,'HELD');
 const second=cart.add({provider:'DOI',source_id:'10.1000/example',
  selectionProof:'verified-gesture'});
 assert.equal(second.status,'ADDED_RESEARCH_CANDIDATE');
 assert.equal(cart.inspect().candidate_count,2);
 assert.equal(cart.inspect().canonical_work_count,32);
 assert.equal(cart.inspect().works_modified,0);
 assert.equal(cart.remove(added.candidate.candidate_id),true);
 assert.equal(cart.inspect().candidate_count,1);
});
test('G6-D provider rights matrix holds unknown providers, private content and unsupported bodies',()=>{
 const cart=createG6ResearchCart({canonicalWorkIds:workIds,
  verifyHumanSelection:({proof})=>proof==='verified-gesture'});
 assert.equal(cart.add({provider:'FAKE_PROVIDER',source_id:'ref/1',
  selectionProof:'verified-gesture'}).status,'HELD');
 const local=cart.add({provider:'OPERATOR_LOCAL',source_id:'local/test-01',
  selectionProof:'verified-gesture'});
 assert.equal(local.candidate.body_rights_state,'PRIVATE_ONLY_NO_BROWSER_EGRESS');
 for(const provider of ['ZENODO','DOI','ACADEMIA','MEDIUM','SUBSTACK','REDDIT']){
  assert.ok(G6_PROVIDER_BOUNDARIES[provider].full_body.startsWith('HELD'));
 }
 assert.throws(()=>createG6ResearchCart({canonicalWorkIds:workIds.slice(1)}),
  /HELD_G6_PINNED_32_WORK_CENSUS_REQUIRED/);
});
test('G6-E bounded source-typed native return exposes only IDs, never original text or private paths',async()=>{
 const permission={session_id:'s1',generation:1,permission_epoch:3,
  role:'MAESTRO',read_only:true,authorized:true};
 const bridge=createG6HostReadReturn({
  sourceRevision:'a'.repeat(40),hostPermission:()=>({...permission}),
  hostAdapter:async()=>({
   estate:'SRC',kind:'ORIGINAL_NATIVE_EXECUTABLE',read_only:true,
   scientific_credit:0,data:{schema:'src.original.local/v1',status:'SUPPORTED',
    ranked:[{source_id:'src:first',body:'SECRET_BODY_MUST_NOT_LEAK',
     private_path:'/home/private/local-papers/one.pdf'}]}
  })
 });
 const done=await bridge.read({estate:'SRC_ATELIER',operation:'src_native_text',
  payload:{query:'test',action:'search'}});
 assert.equal(done.schema,G6_RETURN_SCHEMA);
 assert.equal(done.status,'SOURCE_BOUND_HOST_RETURN_PROSPECTIVE');
 assert.equal(done.projection.visible_reference_ids[0],'src:first');
 assert.equal(done.projection.source_bodies_included,false);
 assert.equal(done.method.original_method_kind,'ORIGINAL_NATIVE_EXECUTABLE');
 assert.equal(done.visitor_return_is_original_text,false);
 assert.equal(done.scientific_credit,0);
 assert.equal(done.canonical_mutations,0);
 assert.doesNotMatch(JSON.stringify(done),/SECRET_BODY_MUST_NOT_LEAK|local-papers/);
});
test('G6-F host permission, epoch changes and caller-injected actions are refused without result',async()=>{
 let epoch=0,resolve;
 const wait=new Promise(r=>resolve=r);
 const permission=()=>({session_id:'s2',generation:1,permission_epoch:epoch,
  role:'COMPOSER',read_only:true,authorized:true});
 let calls=0;
 const bridge=createG6HostReadReturn({sourceRevision:'b'.repeat(40),
  hostPermission:permission,hostAdapter:async()=>{
   calls++;await wait;return {kind:'ORIGINAL_NATIVE_EXECUTABLE',
    estate:'WENDBINE',read_only:true,scientific_credit:0,data:{count:1}};
  }});
 const held=await bridge.read({estate:'WENDBINE_ATELIER',operation:'wendbine_public_query',
  payload:{write:true}});
 assert.equal(held.status,'HELD');
 assert.equal(calls,0);
 const pending=bridge.read({estate:'WENDBINE_ATELIER',operation:'wendbine_public_query',
  payload:{query:'source'}});
 epoch++;resolve();
 const done=await pending;
 assert.equal(done.status,'HELD');
 assert.equal(done.reason,'HELD_G6_STALE_OR_REVOKED_HOST_SESSION');
 const disconnected=createG6HostReadReturn({sourceRevision:'c'.repeat(40)});
 assert.equal((await disconnected.read({estate:'SRC_ATELIER',operation:'src_native_text',
  payload:{query:'no host'}})).status,'HELD');
 assert.equal((await bridge.read({estate:'SRC_ATELIER',operation:'src_native_text',
  payload:{private_path:'/tmp/foo'}})).status,'HELD');
});
test('G6-G fake original authority, wrong estate and rights promotions fail closed',async()=>{
 const ok=()=>({session_id:'s3',generation:1,permission_epoch:0,
  role:'MAESTRO',read_only:true,authorized:true});
 const bridge=createG6HostReadReturn({sourceRevision:'d'.repeat(40),
  hostPermission:ok,hostAdapter:async()=>({
   kind:'FAKE_ORIGINAL_SOURCE',estate:'EMSTD613',read_only:true,scientific_credit:1,
   data:{schema:'faux/v1',body:'forgery'}
  })});
 const r=await bridge.read({estate:'EM_ATELIER',operation:'em_native_work_route',
  payload:{work_id:workIds[0]}});
 assert.equal(r.status,'HELD');
 assert.equal(r.reason,'HELD_G6_NATIVE_RECEIPT_TYPE_UNVERIFIED');
 assert.equal(r.original_authorship_inferred,false);
 assert.throws(()=>createG6HostReadReturn({sourceRevision:'invalid'}),
  /HELD_G6_EXACT_SOURCE_SHA_REQUIRED/);
});
