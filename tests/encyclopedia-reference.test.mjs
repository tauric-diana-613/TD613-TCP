import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {test} from 'node:test';
import vm from 'node:vm';
const root=new URL('../app/encyclopedia/',import.meta.url),html=await readFile(new URL('index.html',root),'utf8');
const data=id=>html.match(new RegExp('<script id="'+id+'"[^>]*>([\\s\\S]*?)<\\/script>'))[1];
const directory=data('td613-reference-directory').trim().split('\n').map(JSON.parse),records=data('td613-reference-records').trim().split('\n').map(JSON.parse),audit=JSON.parse(data('canonical-audit-data'));
const sha=s=>createHash('sha256').update(s).digest('hex');
const context={document:{getElementById:id=>({textContent:data(id)}),addEventListener(){}},window:{},crypto:globalThis.crypto,TextEncoder,Blob,URL,setTimeout};
vm.runInNewContext(await readFile(new URL('../scripts/encyclopedia-intake.cjs',import.meta.url),'utf8')+'\n'+await readFile(new URL('../scripts/encyclopedia-reference-runtime.js',import.meta.url),'utf8'),context);
const api=context.window.TD613Reference;
test('every bot record binds exact original content, a finite source line, and an identical small-file mirror',async()=>{
 assert.equal(records.length,1141);assert.equal(new Set(records.map(r=>r.id)).size,records.length);
 const historical=records.slice(0,843),accessions=records.slice(843);
 assert.equal(historical.length,843);assert.equal(accessions.length,298);
 assert(accessions.every(r=>r.origin.json_pointer===null),'new accessions must not pretend to be canonical Edition 1.4 entries');
 const sourceLines=html.split('\n');
 for(const [i,r] of records.entries()){
  if(i<843){
   const original=r.origin.json_pointer.split('/').slice(1).reduce((value,key)=>value[key.replace(/~1/g,'/').replace(/~0/g,'~')],audit);
   assert.equal(JSON.stringify(r.kind==='lineage_note'?r.record.text:r.record),JSON.stringify(original),r.id);
  }
  assert.equal(sourceLines[directory[i].html_line-1],JSON.stringify(r).replace(/</g,'\\u003c'),r.id+' line');
  assert.equal(sha(JSON.stringify(r).replace(/</g,'\\u003c')),directory[i].record_sha256,r.id+' hash');
  assert.equal((await readFile(new URL(directory[i].record_path,root),'utf8')).trim(),sourceLines[directory[i].html_line-1]);
 }
 const manifest=JSON.parse(await readFile(new URL('reference/manifest.json',root),'utf8'));
 assert.equal(manifest.artifact_html_sha256,sha(html));
 assert.equal(manifest.canonical_payload_sha256,'ff0c98f564c9157f22b8603a20ddefa3ca13d843b17bdfb7e2a495408a49b4c9');
 assert.equal(manifest.edition_version,'1.4');
});
test('research retrieval supports precise IDs, phrases, filters, negatives, pagination and missing evidence',()=>{
 assert.equal(api.search('G-101').hits[0].id,'G-101');
 assert(api.search({q:'"Golden Egg"',limit:100}).total>1);
 const sources=api.search({filter:{kind:'source'},limit:100});assert.equal(sources.total,92);
 assert.equal(api.search({filter:{kind:'source'},limit:20,offset:80}).hits.length,12);
 assert(api.search({q:'holonomy',filter:{source:'ATLAS'},limit:100}).hits.every(r=>api.get(r.id).source_keys.includes('ATLAS')));
 assert.equal(api.search({q:'"zz-no-such-record"'}).total,0);
 assert.equal(api.get('nonexistent'),null);assert.equal(api.cite('nonexistent'),null);
 assert.equal(api.cite('G-101').artifact_source_commit,null);
 assert.equal(api.get('H-01').claim_ceiling,null);
 assert(api.search({q:'Golden',exclude:'egg',limit:100}).hits.every(r=>!JSON.stringify(api.get(r.id)).toLowerCase().includes('egg')));
});
test('reverse citations and bounded paths retain typed links without manufacturing derivation',()=>{
 const r=api.get('G-101');for(const edge of r.links)assert(records.some(t=>t.id===edge.target));
 const source=r.links.find(e=>e.type==='cites_source');assert(source);
 assert(api.citedBy(source.target).some(e=>e.source==='G-101'&&e.type==='cites_source'));
 assert.equal(api.route('G-101',source.target).found,true);
 assert.equal(api.route('nonexistent',source.target).reason,'unknown_record');
 assert.equal(api.route('G-101',source.target,{maxDepth:0}).found,false);
 const packet=api.context('G-101',{maxRecords:1});assert.equal(packet.records.length,1);assert(packet.truncated);
 assert(packet.records[0].citation.record_sha256);
});
test('all integrity checks execute and caller mutation cannot rewrite the reference store',async()=>{
 const report=await api.verify();assert.equal(report.verified,1141);assert.equal(report.mismatches.length,0);
 const r=api.get('G-101');r.record.term='overwritten';assert.notEqual(api.get('G-101').record.term,'overwritten');
});
test('standalone bot intake prepares exact bytes for human review without changing the index',async()=>{
 const input={schema:'td613.research-intake/v1',record_id:'R-REFERENCE-TEST',kind:'concept',title:'Fictional concept intake fixture',recorded_at:'2026-10-22T22:00:00Z',author:'Software test',human_request_ref:'synthetic-fixture-only',visibility:'private',body:'A software fixture, carrying zero research credit.',sources:[{source_id:'fixture',kind:'artifact',locator:'test:fixture',capture_status:'OPERATOR_SUPPLIED'}],evidence:{disposition:'CONCEPTUAL',earned_claim:'Input staging works.',claim_ceiling:'Fictional software test only.',missing_evidence:['No external event acquired.']}};
 const text=JSON.stringify(input,null,3)+'\n',proposal=await api.prepareImport(text);
 assert.equal(proposal.disposition,'PROPOSED');assert.equal(proposal.original_json,text);assert.equal(proposal.input_sha256,sha(text));assert.equal(proposal.publication_eligible,false);
 assert.equal(api.get(input.record_id),null);assert.equal(api.manifest().record_count,1141);
 assert.equal((await api.prepareImport('null')).valid,false);
});
test('current edition carries direct theory sources and distinct contribution evidence',()=>{
 for(const [key,id]of [['EPI_CUSTODIAL_PDF','G-373'],['EPI_DIAGNOSTICS_PDF','G-374'],['EPI_POSTWEB_PDF','G-375']]){
  const source=api.get('SRC-'+key).record;
  assert(source.page_text.length>=2);assert(source.page_text.every(p=>p.page>=1&&p.text.length>100));
  assert.equal(source.evidence_class,'DIRECT_PRIMARY_DOCUMENT_INSPECTION');
  assert.equal(source.author_byline,null);
  assert.equal(source.contributions[0].name,'Tawanna C. Miller');
  assert.equal(source.contributions[0].evidence_class,'CONTEMPORANEOUS_OPERATOR_ACCOUNT');
  assert(api.get(id).source_keys.includes(key));
  assert(api.citedBy('SRC-'+key).some(r=>r.source===id));
 }
 assert.match(api.get('G-144').label,/Anisotropic Information Architecture/);
 assert.match(api.get('H-25').record.description,/Writ.*Appendix A.*Exhibit B-1/);
 assert.match(api.get('M-05').record.qualification,/confounded/);
});
test('equations retain scoped assumptions and public exports carry current material',()=>{
 const calls=records.filter(r=>r.supplement?.math_callout);
 assert.equal(calls.length,67);
 const bridges=calls.filter(r=>r.supplement.math_callout.bridged);assert.equal(bridges.length,21);
 for(const r of calls)assert(r.supplement.math_callout.review.claim_ceiling);
 for(const r of bridges)assert.equal(r.supplement.math_callout.synthesis_provenance.status,'PROPOSED_SYNTHESIS');
 const equation=id=>api.get(id).supplement.math_callout;
 assert.match(equation('G-010').latex,/linear/);
 assert.match(equation('G-015').latex,/Delta/);
 assert.match(equation('G-020').review.assessment,/phenomenological/);
 assert.match(equation('G-035').latex,/ge/);
 assert.match(equation('G-450').latex,/F\(W\)/);
 assert.equal(equation('G-164').formulaRef,null);
 assert(!JSON.stringify(api.export()).includes('correction_history'));
 assert(!JSON.stringify(api.export()).includes('original_callout'));
});


test('Vixen dual-estate Encyclopedia retains its own Work lineage and routes to a distinct reference scene',async()=>{
 const candidate=await readFile(new URL('vix-cyb.html',root),'utf8');
 assert(candidate.includes('id="td613-sitewide-reset-preflight"'));
 assert(candidate.includes('id="view-reference"'));
 assert(candidate.includes('data-view="reference"'));
 assert(candidate.includes('vixen-estate/reference-bridge.mjs'));
 assert(candidate.includes('vixen-estate/research-chamber.mjs'));
 const m=candidate.match(/<script type="application\/json" id="vixen-estate-manifest">([\s\S]*?)<\/script>/);
 assert(m,'distinct present-tense estate manifest required');
 const live=JSON.parse(m[1]);
 assert.equal(live.route,'/encyclopedia/vix-cyb.html');
 assert.equal(live.source_vixen.works,32);assert.equal(live.source_vixen.manifestations,53);
 assert.equal(live.source_vixen.unadjudicated_gates,8);assert.equal(live.source_vixen.instruments,21);
 assert.equal(live.source_universal.records,1141);assert.equal(live.source_universal.edges,2131);
 assert.equal(live.release_authority,false);
 assert.equal(live.experiment_b_flight,'HELD');
 assert.match(candidate,/const VALID_VIEWS = \[[^\]]*'reference'\]/);
 assert.match(candidate,/function scheduleObservatoryFrame\(/);
 assert.match(candidate,/function stopObservatoryFrame\(/);
 assert.match(candidate,/vixenParticleField/);
 assert(!candidate.includes('renderCart('),'No commercial cart may inhabit Vixen');
 assert.equal((candidate.match(/id="vixen-corpus-bundle"/g)||[]).length,1);
 assert(candidate.includes('UNADJUDICATED_PAIR'),'all eight historic human-gate contracts remain on the source');
});

test('Vixen reference membrane serves actual source-bound search, exact bytes, graph relations and honest refusal',async()=>{
 const {createVixenReferenceMembrane,BridgeHold}=await import('../app/encyclopedia/vixen-estate/reference-bridge.mjs');
 const {webcrypto}=await import('node:crypto');
 const base='https://vixen.example/encyclopedia/reference/';
 let fetched=[];
 const fetcher=async(input,opts)=>{
  const u=new URL(input);fetched.push({pathname:u.pathname,method:opts?.method,credentials:opts?.credentials});
  assert.equal(u.origin,'https://vixen.example');assert(u.pathname.startsWith('/encyclopedia/reference/'));
  assert.equal(opts.method,'GET');assert.equal(opts.credentials,'omit');
  const raw=await readFile(new URL('.'+u.pathname,new URL('../app/',import.meta.url)),'utf8');
  return {ok:true,status:200,url:u.href,headers:{get:()=>null},text:async()=>raw};
 };
 const bridge=createVixenReferenceMembrane({baseURL:base,fetcher,cryptoProvider:webcrypto});
 assert.equal(bridge.status().state,'UNOPENED');
 await assert.rejects(()=>bridge.getRecord('G-001'),e=>e instanceof BridgeHold&&e.code==='REFERENCE_NOT_LOADED');
 const open=await bridge.open();assert.equal(open.state,'CENSUS_MATCHED');
 assert.equal(open.records,1141);assert.equal(open.edges,2131);
 assert.equal(open.cryptographic_index_authentication,'NOT_CLAIMED');
 const hits=bridge.search('Eclipse');assert(hits.some(x=>x.id==='G-001'));
 assert(hits.every(x=>x.claim_role==='SEARCH_MATCH_ONLY_NOT_ENTAILMENT'));
 const item=await bridge.getRecord('G-001');
 assert.equal(item.estate,'UNIVERSAL_REFERENCE');
 assert.equal(item.warrant,'CANONICAL_JSON_PAYLOAD_SHA256_VERIFIED_NOT_CLAIM_ENTAILMENT');
 assert.equal(item.record.id,'G-001');assert.match(item.record.record.description,/boundary/);
 const edges=bridge.related('G-001');assert(edges.length>0);
 assert(edges.every(e=>e.relation_warrant==='RECORDED_GRAPH_EDGE_NOT_CAUSAL_PROOF'));
 assert(fetched.some(f=>f.pathname.endsWith('/records/G-001.json')));
 assert(fetched.every(f=>f.method==='GET'&&f.credentials==='omit'));
 assert(bridge.history().some(e=>e.action==='SOURCE_WITNESSED'));
 assert.deepEqual(bridge.search('term-unknown-does-not-exist'),[]);
});

test('Vixen reference membrane refuses missing and tampered source bodies without claim promotion',async()=>{
 const {createVixenReferenceMembrane,BridgeHold}=await import('../app/encyclopedia/vixen-estate/reference-bridge.mjs');
 const {webcrypto}=await import('node:crypto');
 const base='https://vixen.example/encyclopedia/reference/';
 const asset=async u=>await readFile(new URL('.'+new URL(u).pathname,new URL('../app/',import.meta.url)),'utf8');
 const tampered=async(input)=>{const u=new URL(input);let raw=await asset(u);if(u.pathname.endsWith('/records/G-001.json'))raw=raw.replace('Eclipse','Allegedly Eclipse');
  return {ok:true,status:200,url:u.href,headers:{get:()=>null},text:async()=>raw}};
 const bridge=createVixenReferenceMembrane({baseURL:base,fetcher:tampered,cryptoProvider:webcrypto});
 await bridge.open();
 await assert.rejects(()=>bridge.getRecord('G-001'),e=>e instanceof BridgeHold&&e.code==='RECORD_DIGEST_MISMATCH');
 assert(bridge.history().some(e=>e.action==='SOURCE_DIGEST_REFUSED'));
 await assert.rejects(()=>bridge.getRecord('G-9999'),e=>e instanceof BridgeHold&&e.code==='RECORD_NOT_IN_EDITION');
 const missing=async(input)=>{const u=new URL(input);let raw=await asset(u);if(u.pathname.endsWith('/directory.json'))raw='[]';return {ok:true,url:u.href,status:200,headers:{get:()=>null},text:async()=>raw}};
 const absent=createVixenReferenceMembrane({baseURL:base,fetcher:missing,cryptoProvider:webcrypto});
 await assert.rejects(()=>absent.open(),e=>e instanceof BridgeHold&&e.code==='REFERENCE_CENSUS_MISMATCH');
 assert.equal(absent.status().state,'HELD');
 const offline=createVixenReferenceMembrane({baseURL:'file:///tmp/vix/reference/'});
 await assert.rejects(()=>offline.open(),e=>e instanceof BridgeHold&&e.code==='FILE_SCHEME_NOT_BACKEND_BOUND');
 assert.equal(offline.rest().state,'HELD');
});


test('Vixen dual-estate jsdom encounter passes NOTICE→ACT→verified source→NAME→REST with untouched public estates',async()=>{
 const {JSDOM}=await import('jsdom');
 const {webcrypto}=await import('node:crypto');
 const {mountVixenResearchChamber}=await import('../app/encyclopedia/vixen-estate/research-chamber.mjs');
 const candidate=await readFile(new URL('vix-cyb.html',root),'utf8');
 const match=candidate.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
 assert(match);
 const dom=new JSDOM('<!doctype html><html><body><div id="vixenReferenceChamber"></div><script type="application/json" id="vixen-corpus-bundle">'+match[1]+'</script></body></html>',{url:'https://vixen.example/encyclopedia/vix-cyb.html'});
 const priorDocument=globalThis.document,priorWindow=globalThis.window;
 const fetcher=async(input,opts)=>{
  const u=new URL(input);assert.equal(u.origin,'https://vixen.example');assert.equal(opts.method,'GET');
  const raw=await readFile(new URL('.'+u.pathname,new URL('../app/',import.meta.url)),'utf8');
  return {ok:true,status:200,url:u.href,headers:{get:()=>null},text:async()=>raw};
 };
 try{
  globalThis.document=dom.window.document;globalThis.window=dom.window;
  const rootEl=dom.window.document.getElementById('vixenReferenceChamber');
  const chamber=mountVixenResearchChamber({container:rootEl,baseURL:'https://vixen.example/encyclopedia/reference/',fetcher,cryptoProvider:webcrypto});
  assert.equal(chamber.mounted,true);
  assert.equal(chamber.phase(),'NOTICE');
  assert.equal(rootEl.querySelectorAll('.vxe-work-select option').length,32);
  assert.equal(rootEl.querySelectorAll('.vxe-estate').length,2);
  const click=text=>{const b=Array.from(rootEl.querySelectorAll('button')).find(x=>x.textContent.includes(text));assert(b,'Missing button '+text);b.click()};
  click('Begin an inquiry');
  assert.equal(chamber.phase(),'ACT');
  const input=rootEl.querySelector('input.vxe-query-input');assert(input);
  input.value='Eclipse';input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
  click('Query the independent reference');
  for(let i=0;i<90&&chamber.status()==='CHECKING';i++)await new Promise(res=>setTimeout(res,10));
  assert.equal(chamber.status(),'INDEX_MATCHES_UNVERIFIED');
  const hit=Array.from(rootEl.querySelectorAll('button.vxe-hit')).find(x=>x.textContent.startsWith('G-001'));
  assert(hit,'Original G-001 source must be selectable');
  hit.click();
  for(let i=0;i<90&&chamber.status()==='VERIFYING_SOURCE';i++)await new Promise(res=>setTimeout(res,10));
  assert.equal(chamber.status(),'CANONICAL_PAYLOAD_VERIFIED');
  assert.equal(chamber.phase(),'WORLD_ANSWERS');
  assert.match(rootEl.textContent,/Eclipse–Omega/);
  assert.match(rootEl.textContent,/CANONICAL PAYLOAD VERIFIED ≠ CLAIM ENTAILMENT/);
  click('Name the question');assert.equal(chamber.phase(),'NAME');
  const annotation=rootEl.querySelector('.vxe-name');assert(annotation);
  annotation.value='Potential question only';annotation.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
  click('Rest without penalty');assert.equal(chamber.phase(),'REST');
  assert(rootEl.querySelector('a.vxe-exit').getAttribute('href')==='/encyclopedia/');
  click('Return to inquiry');assert.equal(chamber.phase(),'WORLD_ANSWERS');
  assert(chamber.history().some(x=>x.action==='RECORD_SOURCE_VERIFIED'));
  assert(chamber.history().some(x=>x.action==='UNPENALIZED_REST'));
  assert.equal(chamber.membraneStatus().authority,'READ_ONLY');
 }finally{
  if(priorDocument===undefined)delete globalThis.document;else globalThis.document=priorDocument;
  if(priorWindow===undefined)delete globalThis.window;else globalThis.window=priorWindow;
  dom.window.close();
 }
});
