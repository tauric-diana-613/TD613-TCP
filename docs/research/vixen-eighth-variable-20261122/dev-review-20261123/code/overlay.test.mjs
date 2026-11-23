import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {loadOverlay,defaultBaseline,defaultExtracts,KIND,REFERENCE_KIND} from './seven-source-overlay.mjs';
const file=path.resolve('vixen-seven-source-dev/seven-source-index.json');
const out=path.resolve('vixen-seven-source-dev/evidence');
const H=x=>createHash('sha256').update(x).digest('hex');
const {SemanticSemioticSearchEngine}=await import(pathToFileURL(path.join(defaultBaseline,'app/encyclopedia/vixen-estate/semantic-semiotic-search.mjs')));
const baselineBytes=await fs.readFile(path.join(defaultBaseline,'app/encyclopedia/vixen-estate/semantic-semiotic-index.v1.json'));
const baselineIndex=JSON.parse(baselineBytes);
const baseline=new SemanticSemioticSearchEngine(baselineIndex);
const canonicalBefore=baseline.search('semantic drift',{deployment_env:'PREVIEW',limit:5});
const overlay=await loadOverlay(file);
const pageCache={};
for(const s of overlay.packet.sourceIdentities)
 pageCache[s.source_id]=JSON.parse(await fs.readFile(path.join(defaultExtracts,s.source_id,'pages.json')));
const cases=[
 ['topology','informational density Fisher Wasserstein','c56744fae0f7'],
 ['audio','phase vocoder formant','7c568aaf6e78'],
 ['quantum-framework','density matrix Hamiltonian hysteresis','6c888365fa73'],
 ['algedonic','algedonic escalation System 5','fe1c355b4e7a'],
 ['swarm','Hermes structured inference Mahalanobis','87ee5e995742'],
 ['cognitive-time','fold bifurcations observer averaging','c90233bf09f6'],
 ['semantic-control','semantic error derivative PID','811766eb1387']
];
const tests=[],results={};
async function test(name,fn){try{await fn();tests.push({name,status:'PASS'});}catch(e){tests.push({name,status:'FAIL',error:String(e),stack:e.stack});}}
for(const [name,query,suffix] of cases)await test('source coverage '+name,()=>{
 const r=overlay.search(query);results[name]=r;
 assert.equal(r.status,'SEARCH_OK');
 const expected=r.hits.find(h=>h.source_file_id.endsWith(suffix));
 assert.ok(expected,'Expected source missing');assert.ok(expected.s_lex>0,'Expected source needs real lexical support');
 assert.equal(expected.score_total,r.hits[0].score_total,'Expected source must share the highest score; stable ID ordering may resolve a tie');
});
await test('cross-source retrieval',()=>{
 const r=overlay.search('algedonic feedback semantic drift');results.cross_source=r;
 assert.ok(new Set(r.hits.filter(h=>h.s_lex>0).map(h=>h.source_file_id)).size>=3);
});
for(const profile of ['LEXICAL_ONLY','SEMANTIC_ONLY','SEMIOTIC_ONLY'])await test('native channel '+profile,()=>{
 const r=overlay.search('algedonic feedback semantic drift',{fusion:{profile,weight_policy:'RENORMALIZE_ACTIVE'}});
 results[profile]=r;
 assert.equal(r.status,'SEARCH_OK');
 const key={LEXICAL_ONLY:'lexical',SEMANTIC_ONLY:'semantic',SEMIOTIC_ONLY:'semiotic'}[profile];
 assert.ok(r.hits.some(h=>h.fusion_contributions[key]>0));
 for(const h of r.hits)for(const [k,v]of Object.entries(h.fusion_contributions))if(k!==key)assert.equal(v,0);
});
await test('out-of-vocabulary unsupported query',()=>{
 const r=overlay.search('qxzvblorpf quazznorpz');results.negative_oov=r;
 assert.equal(r.status,'OOV_ALPHABETIC_CANARY_ABSTENTION');assert.equal(r.hits.length,0);
});
await test('combined semantic–semiotic channels without lexical or contextual contribution',()=>{
 const r=overlay.search('algedonic feedback semantic drift',{fusion:{
  profile:'FULL_FUSION',channels:{lexical:false,semantic:true,semiotic:true,src:false},
  weight_policy:'RENORMALIZE_ACTIVE'}});
 results.SEMANTIC_SEMIOTIC=r;
 assert.equal(r.status,'SEARCH_OK');
 assert.ok(r.hits.some(h=>h.fusion_contributions.semantic>0&&h.fusion_contributions.semiotic>0));
 for(const h of r.hits){assert.equal(h.fusion_contributions.lexical,0);assert.equal(h.fusion_contributions.src_proj,0);assert.equal(h.fusion_contributions.src_sig,0);}
});
await test('known words but absent exact claim',()=>{
 const r=overlay.search('"semantic wombat teleports Hamiltonian"',{mode:'phrase'});results.negative_phrase=r;
 assert.equal(r.hits.length,0);assert.notEqual(r.status,'SEARCH_OK');
});
await test('page coordinates and noncanonical identities',()=>{
 for(const r of Object.values(results))for(const h of r.hits){
  assert.equal(h.work_id,null);assert.equal(h.canonical_work,false);
  assert.equal(h.unit_kind,KIND);assert.equal(h.relationship_status,'UNRATIFIED');
  const l=h.text_locator;
  assert.equal(H(h.text),l.raw_chunk_sha256);
  const pg=pageCache[h.source_file_id].find(p=>p.page===h.page_number);
  assert.equal(pg.sha256,l.page_sha256);
  assert.equal(pg.text.slice(l.page_offset_utf16,l.page_offset_utf16+l.page_length_utf16),h.text);
 }
});
await test('reference text retained with explicit section filter',()=>{
 const r=overlay.search('phase vocoder',{section:'references'});results.references=r;
 assert.equal(r.status,'SEARCH_OK');
 assert.ok(r.hits.every(h=>h.unit_kind===REFERENCE_KIND&&h.text_locator.section==='references'));
});
await test('A0 admission guard still rejects prospective injection',()=>{
 const bad=structuredClone(baselineIndex);
 bad.corpus_custody.batch_b_pending_count=7;
 assert.throws(()=>new SemanticSemioticSearchEngine(bad),/VIXEN_A0_PROSPECTIVE_CORPUS_NOT_ADMITTED/);
});
await test('tampered supplemental body refused',async()=>{
 const packet=structuredClone(overlay.packet);
 packet.bodies[packet.sourceIdentities[0].source_id]+=' altered';
 const tmp=file+'.tampered';
 await fs.writeFile(tmp,JSON.stringify(packet));
 try{await assert.rejects(loadOverlay(tmp),/BODY_CHANGED/);}finally{await fs.unlink(tmp);}
});
await test('temporary supplement withdrawal preserves A0',async()=>{
 overlay.disable();
 assert.equal(overlay.search('semantic drift').hits.length,0);
 assert.equal(overlay.engine.shardTexts.size,0);
 const hidden=file+'.withdrawn';
 await fs.rename(file,hidden);
 try{
  await assert.rejects(loadOverlay(file),/ENOENT/);
  const after=new SemanticSemioticSearchEngine(JSON.parse(baselineBytes)).search('semantic drift',{deployment_env:'PREVIEW',limit:5});
  assert.deepEqual(after,canonicalBefore);
  const bytesAfter=await fs.readFile(path.join(defaultBaseline,'app/encyclopedia/vixen-estate/semantic-semiotic-index.v1.json'));
  assert.equal(H(bytesAfter),H(baselineBytes));
  results.withdrawal={status:'PASS',overlay_unavailable:true,overlay_attached_text_cache_size:0,
    canonical_result_identical:true,canonical_index_sha256:H(baselineBytes)};
 }finally{await fs.rename(hidden,file);}
});
await fs.writeFile(path.join(out,'retrieval-results.json'),JSON.stringify(results,null,2));
const report={schema:'td613.vixen.dev-overlay-smoke/v1',source:'exploratory developer harness',
  node:process.version,primary_answer_model_trials:0,tests,passed:tests.filter(x=>x.status==='PASS').length,
  failed:tests.filter(x=>x.status==='FAIL').length,source_count:7,pages:82,
  chunks:overlay.packet.index.docs.length,methods:overlay.packet.context.methods};
await fs.writeFile(path.join(out,'test-results.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(report.failed)process.exitCode=1;
