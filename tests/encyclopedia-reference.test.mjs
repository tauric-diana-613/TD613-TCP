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




test('Vixen Folios enforce source-bound stage copy and a non-colliding compact masthead',async()=>{
  const page=await readFile(new URL('vix-cyb.html',root),'utf8');
  assert(page.includes('VIX-UX-04 · HEADER FIT CONTRACT'));
  assert(page.includes('@media (max-width:1580px)'));
  assert(page.includes('.site-header .main-nav{display:none}'));
  assert(page.includes('.site-header .menu-toggle{display:inline-flex}'));
  assert(page.includes('aria-label="Vixen Work and manifestation comparison"'));
  assert(page.includes('VIXEN FOLIOS / INITIALIZING'));
  assert(!page.includes('Eclipse–Omega')&&!page.includes('Eclipse-Omega')&&!page.includes('G-001'),
    'Vixen page must not embed unrelated Opera records');
  assert(!page.includes('Cross-estate research encounter'));
  assert(page.includes("window.scrollTo({ top: 0, behavior: 'instant' });"),
    'Changing departments should not leave a transitional screenshot beneath the fixed masthead');
});

test('Vixen Encyclopedia preserves sovereign Opera, named Performers, and separate backstage transport',async()=>{
 const page=await readFile(new URL('vix-cyb.html',root),'utf8');
 const manifestMatch=page.match(/<script type="application\/json" id="vixen-estate-manifest">([\s\S]*?)<\/script>/);
 assert(manifestMatch,'Current Vixen manifest must exist');
 const m=JSON.parse(manifestMatch[1]);
 assert.equal(m.route,'/encyclopedia/vix-cyb.html');
 assert.equal(m.source_vixen.works,32);
 assert.equal(m.source_vixen.manifestations,53);
 assert.equal(m.source_vixen.unadjudicated_gates,8);
 assert.equal(m.source_vixen.instruments,21);
 assert.equal(m.source_vixen.role,'OPERA');
 assert.equal(m.source_vixen.performer_type,'EMSTD613_HISTORICAL_WORK_OR_MANIFESTATION');
 assert.equal(m.source_universal.role,'OPERAHOUSE_REFERENCE_SERVICE_NOT_VIXEN_OPERA');
 assert.equal(m.bridge.cross_opera_warrant_status,'HELD_NO_HUMAN_RATIFIED_MAPPING');
 assert.equal(m.bridge.owner,'OPERAHOUSE_SHARED_INFRASTRUCTURE');
 assert.equal(m.bridge.module,'/encyclopedia/reference/vixen-read-gateway.mjs');
 assert.equal(m.bridge.record_routing_into_vixen,'DENIED_BY_DEFAULT');
 assert.equal(m.release_authority,false);
 assert.equal(m.experiment_b_flight,'HELD');
 assert.match(page,/data-view="reference"/);
 assert.match(page,/07<\/small> Folios/);
 assert.match(page,/07<\/small> Vixen Folios/);
 assert.match(page,/vixen-estate\/research-chamber.mjs/);
 assert.match(page,/const VALID_VIEWS = \[[^\]]*'reference'\]/);
 assert.match(page,/vixenParticleField/);
 assert.match(page,/UNADJUDICATED_PAIR/);
 assert(!page.includes('renderCart('),'No commercial storefront in Vixen Opera');
 assert.equal((page.match(/id="vixen-corpus-bundle"/g)||[]).length,1);
});

test('Operahouse ≠ Opera ≠ Performer, with no authority inherited by a Vixen Work',async()=>{
 const {STAGE_ROLES,assertStageRoleSeparation,castVixenPerformer,stageVixenOperaEvent,readOperahouseStatus}=await import('../app/encyclopedia/vixen-estate/role-boundary.mjs');
 assert.equal(assertStageRoleSeparation(),true);
 assert.deepEqual(Object.keys(STAGE_ROLES).sort(),['OPERA','OPERAHOUSE','PERFORMER']);
 const source=castVixenPerformer({work_id:'emwork_fixture',display_title:'A Vixen work',identity_status:'UNRESOLVED'});
 assert.equal(source.estate,'EMSTD613');assert.equal(source.role,'PERFORMER');assert.equal(source.identity_status,'UNRESOLVED');
 const event=stageVixenOperaEvent('VIXEN_WORK_SELECTED',source,{work_id:source.work_id});
 assert.equal(event.role,'OPERA');assert.equal(event.performer.role,'PERFORMER');
 assert.throws(()=>stageVixenOperaEvent('ADMIT',source,{admitRecord:true}),/OPERAHOUSE_AUTHORITY_LEAK/);
 assert.throws(()=>stageVixenOperaEvent('RELEASE',source,{release_authority:true}),/OPERAHOUSE_AUTHORITY_LEAK/);
 assert.throws(()=>stageVixenOperaEvent('PROMOTE',source,{cross_estate_authorship:true}),/OPERAHOUSE_AUTHORITY_LEAK/);
 const infra=readOperahouseStatus({state:'CENSUS_MATCHED'});
 assert.equal(infra.role,'OPERAHOUSE');assert.equal(infra.release_authority,false);
 assert.equal(infra.experiment_b_flight,'HELD');
});

test('Cross-Opera reference registry starts empty and refuses unrelated or counterfeit warrants',async()=>{
 const {inspectVixenCrossOperaWarrant,ADMITTED_VIXEN_CROSSWALKS}=await import('../app/encyclopedia/vixen-estate/cross-opera-warrant.mjs');
 const {createVixenReferenceMembrane}=await import('../app/encyclopedia/reference/vixen-read-gateway.mjs');
 assert.equal(ADMITTED_VIXEN_CROSSWALKS.length,0,'No cross-Opera mapping earned yet');
 const work={work_id:'emwork_fixture',linked_sources:[{source_file_id:'emsrc_fixture',sha256:'0'.repeat(64)}]};
 const result=inspectVixenCrossOperaWarrant({work,source:work.linked_sources[0]});
 assert.equal(result.eligible,false);
 assert.equal(result.reason,'NO_HUMAN_RATIFIED_CROSS_OPERA_WARRANT');
 const fabricated=[{opera:'VIXEN_CYBERNETICS',estate:'EMSTD613',work_id:work.work_id,
  source_file_id:work.linked_sources[0].source_file_id,source_sha256:work.linked_sources[0].sha256,
  warrant_sha256:'f'.repeat(64),human_ratification_ref:'fabricated',status:'HUMAN_RATIFIED',
  universal_record_id:'SYNTHETIC-TEST-ONLY'}];
 assert.equal(inspectVixenCrossOperaWarrant({work,source:work.linked_sources[0],registry:fabricated}).eligible,false,
  'Caller supplied registry cannot activate an unratified passage');
 assert.equal(inspectVixenCrossOperaWarrant({work,source:{source_file_id:'another',sha256:'a'.repeat(64)}}).reason,'SOURCE_NOT_IN_VIXEN_WORK');
 assert.equal(typeof createVixenReferenceMembrane,'function','Independent backend interface remains available to Operahouse');
 const scene=await readFile(new URL('vixen-estate/research-chamber.mjs',root),'utf8');
 assert(!scene.includes('membrane.search('),'No Universal lexical results can appear as Vixen performers');
 assert(!scene.includes('membrane.getRecord('),'No foreign source body can enter without an approved warrant');
 assert(!scene.includes('from \'./reference-bridge.mjs\''),'Vixen Opera does not fetch foreign references directly');
});

test('The Vixen Opera compares source manifestations within ONE Work and refuses synthetic second witnesses',async()=>{
 const {compareVixenManifestations}=await import('../app/encyclopedia/vixen-estate/research-chamber.mjs');
 const a={source_file_id:'a',media_type:'text/markdown',byte_length:4100,sha256:'a'.repeat(64)};
 const b={source_file_id:'b',media_type:'application/pdf',byte_length:8500,sha256:'b'.repeat(64)};
 const observed=compareVixenManifestations(a,b);
 assert.equal(observed.state,'METADATA_COMPARISON_ONLY');
 assert.equal(observed.observations.length,3);
 assert.match(observed.meaning,/cannot establish conceptual equivalence/);
 assert.equal(compareVixenManifestations(a,a).state,'HELD_SAME_MANIFESTATION');
 assert.equal(compareVixenManifestations(a,null).state,'HELD_SINGLE_MANIFESTATION');
});

test('Vixen native jsdom journey: NOTICE→ACT→documentary observation→NAME→REST; unrelated Opera never appears',async()=>{
 const {JSDOM}=await import('jsdom');
 const {mountVixenResearchChamber}=await import('../app/encyclopedia/vixen-estate/research-chamber.mjs');
 const candidate=await readFile(new URL('vix-cyb.html',root),'utf8');
 const match=candidate.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);assert(match);
 const corpus=JSON.parse(match[1]);
 const dom=new JSDOM('<!doctype html><html><body><div id="vixenReferenceChamber"></div><script type="application/json" id="vixen-corpus-bundle">'+match[1]+'</script></body></html>',{url:'https://vixen.example/encyclopedia/vix-cyb.html'});
 const previousDocument=globalThis.document,previousWindow=globalThis.window;
 try{
  globalThis.document=dom.window.document;globalThis.window=dom.window;
  const rootEl=dom.window.document.getElementById('vixenReferenceChamber');
  const app=mountVixenResearchChamber({container:rootEl});
  const click=label=>{const b=Array.from(rootEl.querySelectorAll('button')).find(x=>x.textContent.includes(label));assert(b,'Missing '+label);assert.equal(b.disabled,false);b.click()};
  assert.equal(app.mounted,true);
  assert.equal(app.phase(),'NOTICE');
  assert.equal(app.crossOperaWarrants(),0);
 assert(!rootEl.textContent.includes('The Research Membrane'),'The unrelated generic crossing UI must not survive');
  assert.equal(rootEl.querySelectorAll('.vxe-work-selector option').length,32);
  assert.equal(rootEl.querySelectorAll('.vxe-estate').length,2);
  assert(rootEl.textContent.includes(corpus.works[0].linked_sources[0].original_filename));
 assert(rootEl.textContent.includes('Authorship: UNRESOLVED'),'same-Work relationship must never imply author identity closure');
 assert(!rootEl.textContent.includes('The Documentary Score'),'superseded generic display title excluded');
  assert(rootEl.textContent.includes(corpus.works[0].linked_sources[1].original_filename));
  assert(!rootEl.querySelector('.vxe-hit'));
  assert(!rootEl.querySelector('.vxe-query-input'));
  assert.equal(rootEl.querySelector('.vxe-estate-vixen').getAttribute('data-stage-role'),'PERFORMER');
  assert.equal(rootEl.getAttribute('data-stage-role'),'OPERA');
  click('Begin this Work');
  assert.equal(app.phase(),'ACT');
  click('Observe the recorded differences');
  assert.equal(app.phase(),'WORLD_ANSWERS');
  assert.equal(app.status(),'METADATA_COMPARISON_ONLY');
  assert(rootEl.textContent.includes('Different declared media types'));
  click('Name an unresolved question');
  assert.equal(app.phase(),'NAME');
  const note=rootEl.querySelector('.vxe-name');note.value='Unresolved comparison';note.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
  click('Rest without penalty');assert.equal(app.phase(),'REST');
  click('Return to the Opera');assert.equal(app.phase(),'NAME');
  assert.equal(rootEl.querySelector('.vxe-name').value,'Unresolved comparison');
  assert.equal(rootEl.querySelector('a.vxe-exit').href,new URL('../app/encyclopedia/',import.meta.url).href);
  assert(app.history().some(x=>x.action==='VIXEN_METADATA_OBSERVED'));
  const single=corpus.works.findIndex(w=>w.linked_sources.length===1);
  assert(single>=0,'Historical single-manifestation Work required for negative control');
  const sel=rootEl.querySelector('.vxe-work-selector select');sel.value=String(single);sel.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
  assert.equal(app.phase(),'NOTICE');click('Begin this Work');click('Observe the recorded differences');
  assert.equal(app.status(),'HELD_SINGLE_MANIFESTATION');
 }finally{
  if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;
  if(previousWindow===undefined)delete globalThis.window;else globalThis.window=previousWindow;
  dom.window.close();
 }
});

test('Vixen source-first visual contract establishes two legible Vixen folios and reduced motion',async()=>{
 const css=await readFile(new URL('vixen-estate/research-chamber.css',root),'utf8');
 assert.match(css,/RGI-03 \/ OPERATIC RECONSTRUCTION/);
 assert.match(css,/RGI-04 \/ VISIBLE CONTROL/);
 assert.match(css,/select\.vxe-work-select\{[\s\S]*?min-width:0;[\s\S]*?max-width:100%;/);
 assert.match(css,/\.vxe-vixen-pair \.vxe-source-folio/);
 assert.match(css,/\.vxe-work-selector/);
 assert.match(css,/color:#302731/);
 assert.match(css,/@media\(max-width:780px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});


test('Wendbine-compatible exact response-byte custody rejects malformed UTF-8 and tampered records',async()=>{
 const {webcrypto}=await import('node:crypto');
 const {createVixenReferenceMembrane}=await import('../app/encyclopedia/reference/vixen-read-gateway.mjs');
 let mode='authentic';
 const fetcher=async url=>{
  const u=new URL(url);
  assert.equal(u.origin,'https://independent.example');
  const relative=u.pathname.replace(/^\/encyclopedia\//,'');
  let bytes=await readFile(new URL(relative,root));
  if(relative==='reference/records/G-101.json'){
   if(mode==='invalid')bytes=Buffer.from([0xff,0xfe,0x0a]);
   if(mode==='tampered')bytes=Buffer.from(bytes.toString('utf8').replace('FADT','ALTERED'), 'utf8');
   if(mode==='oversizedStream')return {
    ok:true,status:200,url:u.href,headers:{get:()=>null},
    body:new ReadableStream({start(c){c.enqueue(new Uint8Array(250001));c.close()}})
   };
  }
  return {ok:true,status:200,url:u.href,headers:{get:k=>k==='content-length'?String(bytes.byteLength):null},
   arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)};
 };
 const make=()=>createVixenReferenceMembrane({
  baseURL:'https://independent.example/encyclopedia/reference/',fetcher,cryptoProvider:webcrypto
 });
 const genuine=make();assert.equal((await genuine.open()).state,'CENSUS_MATCHED');
 const observed=await genuine.getRecord('G-101');
 assert.equal(observed.verified_at_interaction,true);
 assert.equal(observed.record_sha256,sha(JSON.stringify(observed.record).replace(/</g,'\\u003c')));
 assert.equal(observed.authorization,'READ_ONLY');
 assert.equal(genuine.related('G-101').length>0,true);
 mode='invalid';const invalid=make();await invalid.open();
 await assert.rejects(invalid.getRecord('G-101'),e=>e.code==='REFERENCE_UNDECODABLE_UTF8');
 mode='tampered';const tampered=make();await tampered.open();
 await assert.rejects(tampered.getRecord('G-101'),e=>e.code==='RECORD_DIGEST_MISMATCH');
 mode='oversizedStream';const oversized=make();await oversized.open();
 await assert.rejects(oversized.getRecord('G-101'),e=>e.code==='BOUNDARY_REFUSAL',
  'Missing Content-Length cannot bypass the streamed byte budget');
});

test('Operahouse reader has a distinct sibling stage and never grants Vixen source status to a reference',async()=>{
 const page=await readFile(new URL('vix-cyb.html',root),'utf8');
 const module=await readFile(new URL('reference/vixen-operator-encounter.mjs',root),'utf8');
 const gateway=await readFile(new URL('reference/vixen-read-gateway.mjs',root),'utf8');
 assert.match(page,/id="operahouseEncounter"[^>]*data-stage-role="OPERAHOUSE"/);
 assert.match(page,/reference\/vixen-operator-encounter.mjs/);
 assert.match(page,/reference\/vixen-operator-encounter.css/);
 assert.match(module,/WITNESSED_UNLINKED_PAIR/);
 assert.match(module,/SOURCE_LOCUS/);
 assert.match(module,/INDEPENDENT_REFERENCE/);
 assert.match(module,/NO_HUMAN_RATIFIED_CROSS_OPERA_WARRANT/);
 assert(!module.includes('admitRecord('));
 assert(!module.includes('prepareImport('));
 assert.match(gateway,/new TextDecoder\('utf-8',\{fatal:true\}\)/);
 assert.match(gateway,/response.arrayBuffer\(\)/);
 assert(!gateway.includes('new TextEncoder().encode(raw)'), 'No decode/re-encode masquerading as served byte proof');
});

test('Operator-led two-estate encounter verifies independently and leaves relationship unestablished',async()=>{
 const {JSDOM}=await import('jsdom');
 const {mountVixenOperahouseEncounter,classifyIndependentEncounter,constructCrossAtelierWitness,
  CROSS_ATELIER_WITNESS_CONTRACT}=await import('../app/encyclopedia/reference/vixen-operator-encounter.mjs');
 const html=await readFile(new URL('vix-cyb.html',root),'utf8');
 const corpus=JSON.parse(html.match(/id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/)[1]);
 const ref=JSON.parse(await readFile(new URL('reference/records/G-101.json',root),'utf8'));
 const raw=(await readFile(new URL('reference/records/G-101.json',root))).toString('utf8').trimEnd();
 const witness={id:'G-101',record:ref,verified_at_interaction:true,authorization:'READ_ONLY',
  record_sha256:sha(raw),served_file_sha256:sha(raw+'\n')};
 const mock={
  open:async()=>({state:'CENSUS_MATCHED',edition:'1.4',records:1141,edges:2131}),
  search:()=>[{id:'G-101',label:ref.label,kind:ref.kind}],
  getRecord:async()=>witness,related:()=>[{source:'G-101',target:'M-07',type:'mentions_record'}]
 };
 const dom=new JSDOM('<!doctype html><div id="operahouseEncounter"></div>',{url:'https://independent.example/'});
 const prev=globalThis.document;
 try{
  globalThis.document=dom.window.document;
  const host=dom.window.document.getElementById('operahouseEncounter');
  const app=mountVixenOperahouseEncounter({host,corpus,membrane:mock});
  const click=(label)=>{
   const b=[...host.querySelectorAll('button')].find(x=>x.textContent.includes(label));
   assert(b,'Button missing: '+label);b.click();
  };
  const settle=async()=>{for(let i=0;i<3;i++)await new Promise(resolve=>setImmediate(resolve))};
  assert.equal(host.dataset.stageRole,'OPERAHOUSE');
  assert.equal(host.querySelectorAll('[data-stage-role="SOURCE_LOCUS"]').length,1);
  assert.equal(host.querySelectorAll('[data-stage-role="INDEPENDENT_REFERENCE"]').length,1);
  assert(!host.textContent.includes('G-101'),'Universal record must not preload');
  click('Open independent');await settle();assert.equal(app.service(),'CENSUS_MATCHED');
  const query=host.querySelector('input.oh-input');query.value='FADT';
  query.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
  click('Search Universal separately');click('G-101');await settle();
  assert(host.textContent.includes('VERIFIED INDEPENDENT REFERENCE'));
  assert.equal(app.disposition(),null,'Source verification must not create a crosswalk');
  const question=host.querySelector('.oh-question');
  question.value='Which external relation, if any, could be independently warranted?';
  question.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
  click('Observe separately');assert.equal(app.disposition().state,'WITNESSED_UNLINKED_PAIR');
  assert.equal(app.disposition().relation,'UNESTABLISHED');
  assert.equal(app.disposition().publication_eligible,false);
  assert(host.textContent.includes('UNESTABLISHED'));
  const receiptText=host.querySelector('.oh-disposition .oh-payload pre').textContent;
  const receipt=JSON.parse(receiptText);
  assert.equal(receipt.schema,CROSS_ATELIER_WITNESS_CONTRACT);
  assert.equal(receipt.operator_proposal.evidence_class,'UNRATIFIED_QUESTION_NOT_SOURCE_DATA');
  assert.match(receipt.operator_proposal.text,/Which external relation/);
  assert.equal(receipt.universal.record_id,'G-101');
  assert.equal(receipt.vixen.estate,'EMSTD613');
  assert.equal(receipt.admissibility.human_ratified_crosswalk,false);
  assert.equal(receipt.admissibility.publication_eligible,false);
  assert.equal(receipt.custody.empirical_replication_credit,0);
  const missing=constructCrossAtelierWitness({
   work:corpus.works[0],source:corpus.works[0].linked_sources[0],
   witness:null,warrant:{eligible:true,record_id:undefined}
  });
  assert.equal(missing.disposition,'HELD_INDEPENDENT_REFERENCE_WITNESS');
  assert.equal(missing.admissibility.human_ratified_crosswalk,false);
  click('Rest without penalty');assert.equal(app.phase(),'REST');
  click('Resume without penalty');assert.equal(app.phase(),'OBSERVED');
  assert(app.history().some(e=>e.action==='INDEPENDENT_RECORD_BYTES_VERIFIED'));
  assert.equal(classifyIndependentEncounter({work:corpus.works[0],source:corpus.works[0].linked_sources[0],witness:null}).state,
   'HELD_INDEPENDENT_REFERENCE_WITNESS');
 }finally{if(prev===undefined)delete globalThis.document;else globalThis.document=prev;dom.window.close()}
});


test('Palace temporal guard: Rest during in-flight reference census rejects stale completion',async()=>{
 const {JSDOM}=await import('jsdom');
 const {mountVixenOperahouseEncounter}=await import('../app/encyclopedia/reference/vixen-operator-encounter.mjs');
 const page=await readFile(new URL('vix-cyb.html',root),'utf8');
 const corpus=JSON.parse(page.match(/id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/)[1]);
 let resolveOpen;
 const pending=new Promise(resolve=>{resolveOpen=resolve});
 const mock={open:()=>pending,search:()=>[],getRecord:async()=>{throw Error('unexpected')},related:()=>[]};
 const dom=new JSDOM('<!doctype html><div id="operahouseEncounter"></div>',{url:'https://independent.example/'});
 const prior=globalThis.document;
 try{
  globalThis.document=dom.window.document;
  const host=dom.window.document.getElementById('operahouseEncounter');
  const room=mountVixenOperahouseEncounter({host,corpus,membrane:mock});
  const click=name=>{
   const b=[...host.querySelectorAll('button')].find(x=>x.textContent.includes(name));
   assert(b,'Missing action: '+name);b.click();
  };
  click('Open independent');
  assert.equal(room.phase(),'CHECKING');
  click('Rest without penalty');assert.equal(room.phase(),'REST');
  resolveOpen({state:'CENSUS_MATCHED',edition:'1.4',records:1141,edges:2131});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(room.phase(),'REST');
  assert.equal(room.service(),'UNOPENED','A stale completion cannot silently become an admitted index');
  click('Resume without penalty');assert.equal(room.phase(),'NOTICE');
  assert(!room.history().some(e=>e.action==='INDEPENDENT_REFERENCE_CENSUS_OBSERVED'));
 }finally{if(prior===undefined)delete globalThis.document;else globalThis.document=prior;dom.window.close()}
});
