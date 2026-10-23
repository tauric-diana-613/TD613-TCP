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
