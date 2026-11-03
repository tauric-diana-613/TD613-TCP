import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {differential,copyCase,verifyFixtures,project,exploreKeys,signatureKeys,loadInput,fixtureRoot} from './native-routing-differential.mjs';
import {execFileSync} from 'node:child_process';
import os from 'node:os';
import {pathToFileURL} from 'node:url';
import {explore} from '../src/src-compositional-v01.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const evidence=[];
function check(dir){const r=differential(dir);assert.deepEqual(project(r.recipient.observations,exploreKeys),project(r.native.explore,exploreKeys));assert.deepEqual(project(r.recipient.signatures,signatureKeys),project(r.native.signatures,signatureKeys));evidence.push(r);return r;}
function fixture(t,name='native_plain_later'){const dir=copyCase(name);t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return dir;}
function target(dir,id,title,created='2026-02-01T00:00:00+00:00',body='SR - Keep the trace. Abstract.'){
 const p=path.join(dir,'03-DERIVATIVES/text/zenodo/zenodo-'+id);
 fs.writeFileSync(p+'-file-0.md',body);fs.writeFileSync(p+'-metadata.md',JSON.stringify({created,metadata:{title}}));
}
for(const name of ['native_plain_later','native_plain_preexisting','colon_variant_negative','spanish_exact'])test('native Python differential '+name,t=>{
 verifyFixtures();const r=check(fixture(t,name));
 const expected=JSON.parse(fs.readFileSync(path.join(fixtureRoot,'EXPECTATIONS.json'))).cases[name].expected;
 assert.deepEqual(Object.fromEntries(r.recipient.observations.map(x=>[x.normalized_token,x.observation_status])),expected);
 if(name==='spanish_exact'){assert.match(r.fixture_sources[0].raw_body,/Tú puedes clonarme, pero no tienes mis genes\./);assert.equal(r.recipient.signatures.flatMap(g=>g.members).find(m=>m.source_id==='zenodo:1').raw_phrase,'Tú puedes clonarme, pero no tienes mis genes');}
 assert.equal(r.recipient.evidence_class,'SYNTHETIC_REPLAY_ONLY');assert.equal(r.real_src_admission,false);
 for(const row of r.recipient.observations)assert.ok(row.witnesses.every(w=>w.body_sha256&&w.metadata_sha256&&w.source_id));
});
test('native rankings retain exact twins, near-title lexical candidates and chronological ambiguity',t=>{
 const dir=fixture(t);target(dir,3,'Collapse Governance: A Field','2026-03-01T00:00:00Z');target(dir,4,'A Governance Intervention');
 let r=check(dir);const row=r.recipient.observations.find(x=>x.normalized_token==='collapse governance');assert.equal(row.machine_candidates.length,2);assert.deepEqual(row.machine_candidates.map(x=>x.target_id),['zenodo:2','zenodo:3']);
 target(dir,2,'Collapse Governance: A Field','invalid');target(dir,3,'Collapse Governance: A Field','invalid');
 r=check(dir);assert.equal(r.recipient.observations[0].observation_status,'UNRESOLVED_MACHINE');assert.equal(r.recipient.observations[0].machine_candidates.length,2);
});
test('lexical near-title and earlier lexical candidate remain human-review states',t=>{
 const dir=fixture(t);const p=path.join(dir,'03-DERIVATIVES/text/zenodo/zenodo-1-file-0.md');fs.writeFileSync(p,'SR - Keep the trace. Preface. Explore collapse governance method.');
 let r=check(dir);assert.equal(r.recipient.observations[0].machine_candidates[0].match_kind,'LEXICAL_OVERLAP_ONLY');assert.equal(r.recipient.observations[0].observation_status,'LATER_LEXICAL_CANDIDATE_HUMAN_REVIEW_REQUIRED');
 target(dir,2,'Collapse Governance: A Field','2025-01-01');r=check(dir);assert.equal(r.recipient.observations[0].observation_status,'PREEXISTING_LEXICAL_CANDIDATE_HUMAN_REVIEW_REQUIRED');
});
test('Spanish accentless false twin remains lexical, never exact or host identity',t=>{
 const dir=fixture(t,'spanish_exact');target(dir,2,'La cartografia del umbral');
 const r=check(dir);assert.equal(r.recipient.observations[0].machine_candidates[0].match_kind,'LEXICAL_OVERLAP_ONLY');
 assert.equal(r.recipient.observations[0].observation_status,'LATER_LEXICAL_CANDIDATE_HUMAN_REVIEW_REQUIRED');
 assert.equal(r.recipient.scientific_identity,false);
});
test('source withdrawal produces an executed unresolved result and host scope is preserved',t=>{
 const dir=fixture(t);let r=check(dir);assert.equal(r.recipient.signatures[0].manifestation_count,2);
 for(const suffix of ['file-0.md','metadata.md'])fs.unlinkSync(path.join(dir,'03-DERIVATIVES/text/zenodo/zenodo-2-'+suffix));
 r=check(dir);assert.equal(r.recipient.observations[0].observation_status,'UNRESOLVED_MACHINE');assert.equal(r.recipient.signatures[0].manifestation_count,1);assert.equal(r.recipient.signatures[0].coordinate_inference_permitted,false);
});
test('normalization, title tie order, truncation and source self-exclusion match native',t=>{
 const dir=fixture(t);fs.writeFileSync(path.join(dir,'03-DERIVATIVES/text/zenodo/zenodo-1-file-0.md'),'Author: SR — Straße Ω. Preface. Explore\n collapse   governance IV.');
 for(let id=3;id<=12;id++)target(dir,id,'Collapse Governance: A Field');
 const r=check(dir);assert.equal(r.recipient.observations[0].machine_candidates.length,8);assert.ok(!r.recipient.observations[0].machine_candidates.some(c=>c.target_id==='zenodo:1'));
});
test('integrity, rights, coordinate and G_GHOST negatives refuse before routing',t=>{
 const dir=fixture(t),input=loadInput(dir);const mutate=fn=>{const copy={...input,documents:input.documents.map(d=>({...d}))};fn(copy);assert.throws(()=>explore(copy));};
 mutate(i=>{i.documents[0].body_bytes=Buffer.from('tampered')});mutate(i=>{i.documents[0].metadata_sha256='0'.repeat(64)});mutate(i=>{delete i.documents[0].rights});mutate(i=>{i.documents[0].body_path='../source'});mutate(i=>{i.documents[0].graph='G_GHOST'});mutate(i=>{i.documents.push(i.documents[0])});mutate(i=>{i.evidence_class='ARCHIVE_BODY_OBSERVATION'});mutate(i=>{i.documents[0].entity_id='unbound'});
 const r=explore(input);assert.equal(r.graph_promotion,false);assert.equal(r.source_rights_granted,false);
 assert.throws(()=>differential(fixtureRoot),/ISOLATED_SYNTHETIC_ROOT/);
});
test('Python casefold and submillisecond chronology survive the recipient',t=>{
 const dir=fixture(t);fs.writeFileSync(path.join(dir,'03-DERIVATIVES/text/zenodo/zenodo-1-file-0.md'),'SR - Signature. Preface. Explore ǰ method.');
 const m=path.join(dir,'03-DERIVATIVES/text/zenodo/zenodo-1-metadata.md');const meta=JSON.parse(fs.readFileSync(m));meta.created='2026-02-01T00:00:00.000400+00:00';fs.writeFileSync(m,JSON.stringify(meta));
 target(dir,2,'J Method','2026-02-01T00:00:00.000500+00:00');const r=check(dir);
 assert.equal(r.recipient.observations[0].normalized_token,'j method');assert.equal(r.recipient.observations[0].observation_status,'LATER_EXACT_RESOLUTION_CANDIDATE');
});
test('archived B4 recipient reproduces the original source-body compatibility failure',async t=>{
 const dir=fixture(t),input=loadInput(dir),base=fs.mkdtempSync(path.join(os.tmpdir(),'e3b41-before-'));t.after(()=>fs.rmSync(base,{recursive:true,force:true}));
 fs.mkdirSync(path.join(base,'src'));const prefix='packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/E3B4/';
 fs.cpSync(prefix+'seed',path.join(base,'seed'),{recursive:true});
 const original=execFileSync('git',['show','d7319f9d1c600a47cb1467ccb071971ca33a3444:'+prefix+'src/src-compositional-v01.mjs']);
 const f=path.join(base,'src/before.mjs');fs.writeFileSync(f,original);const old=await import(pathToFileURL(f).href);
 const before=old.explore({...input,routes:[]},{destination:'collapse governance'});assert.equal(before.status,'UNRESOLVED_READER_ROUTE');
 assert.equal(explore(input).observations[0].observation_status,'LATER_EXACT_RESOLUTION_CANDIDATE');
});
test('colon route table remains explicitly an extension',()=>{
 const r=explore({routes:[{explore_address:'Explore: X',route_id:'r',source_id:'fake',coordinate:'reader:1'}]},{destination:'X'});
 assert.equal(r.grammar_class,'RECIPIENT_EXTENSION_NOT_ORIGINAL_SRC');assert.equal(r.scientific_identity,false);
});
test.after(()=>{
 if(process.env.TD613_E3B41_EVIDENCE_OUTPUT)fs.writeFileSync(process.env.TD613_E3B41_EVIDENCE_OUTPUT,JSON.stringify({evidence_class:'SYNTHETIC_REPLAY_ONLY',fixtures_manifest_sha256:hash(fs.readFileSync(path.join(fixtureRoot,'MANIFEST.json'))),runs:evidence},null,2)+'\n');
});
