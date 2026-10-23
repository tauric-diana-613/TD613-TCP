import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,mkdir,copyFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const here=dirname(fileURLToPath(import.meta.url)),scripts=join(here,'../scripts'),intake=createRequire(import.meta.url)('../scripts/encyclopedia-intake.cjs'),schema=JSON.parse(await readFile(join(scripts,'encyclopedia-intake-schema.json')));
const fixture={schema:'td613.research-intake/v1',record_id:'R-TEST-EXPERIMENT-001',kind:'experiment',title:'Fictional intake transport fixture',recorded_at:'2026-10-22T22:00:00Z',author:'Automated test fixture',human_request_ref:'synthetic-test-only',visibility:'public',body:'A fictional failed attempt, retained for a software test. Not a provider acquisition.',sources:[{source_id:'fixture',kind:'artifact',locator:'test:fixture',capture_status:'OPERATOR_SUPPLIED'}],evidence:{disposition:'FAILED',earned_claim:'The software can retain a failure record.',claim_ceiling:'Synthetic software fixture only; zero empirical acquisition credit.',missing_evidence:['No external provider was called.']},experiment:{episode_id:'fictional-001',execution_status:'FAILED'},relations:[{type:'tests',target:'G-101'}]};
test('intake requires source, claim ceiling, human request and bounded episode metadata',()=>{
 assert.equal(intake.inspect(JSON.stringify(fixture),schema).valid,true);
 for(const key of ['sources','evidence','human_request_ref','experiment']){const bad=structuredClone(fixture);delete bad[key];assert.equal(intake.inspect(JSON.stringify(bad),schema).valid,false,key)}
 const bad=structuredClone(fixture);bad.sources[0].capture_status='ORIGINAL_CAPTURE';assert.equal(intake.inspect(JSON.stringify(bad),schema).valid,false);
 const injected=JSON.parse(JSON.stringify(fixture));Object.defineProperty(injected,'__proto__',{value:{polluted:true},enumerable:true});assert.equal(intake.inspect(JSON.stringify(injected),schema).valid,false);
 assert.equal(intake.inspect('{malformed',schema).valid,false);
});
test('staging preserves exact bytes; admission holds private/tampered input and never overwrites; reviewed revisions reach both indexes',async()=>{
 const temp=await mkdtemp(join(tmpdir(),'td613-intake-'));
 const run=(name,args,env={})=>spawnSync(process.execPath,[join(scripts,name),...args],{encoding:'utf8',env:{...process.env,...env}});
 try{
  const input=join(temp,'input.json'),proposal=join(temp,'proposal.json'),admitted=join(temp,'app/encyclopedia/intake/admitted');
  const original=JSON.stringify(fixture,null,3)+'\n';await writeFile(input,original);
  assert.equal(run('stage-encyclopedia-record.cjs',[input,proposal]).status,0);
  const p=JSON.parse(await readFile(proposal,'utf8'));assert.equal(p.original_json,original);assert.equal(p.disposition,'PROPOSED');
  assert.notEqual(run('admit-encyclopedia-record.cjs',[proposal]).status,0);
  const args=[proposal,'--human-review-ref','synthetic-review-fixture'];
  assert.equal(run('admit-encyclopedia-record.cjs',args,{TD613_INTAKE_OUTPUT_DIR:admitted}).status,0);
  assert.notEqual(run('admit-encyclopedia-record.cjs',args,{TD613_INTAKE_OUTPUT_DIR:admitted}).status,0,'overwrite must refuse');
  const tampered={...p,original_json:p.original_json+' '};await writeFile(join(temp,'tampered.json'),JSON.stringify(tampered));assert.notEqual(run('admit-encyclopedia-record.cjs',[join(temp,'tampered.json'),'--human-review-ref','synthetic-review-fixture'],{TD613_INTAKE_OUTPUT_DIR:admitted}).status,0);
  const privateRecord={...fixture,record_id:'R-PRIVATE-TEST',visibility:'private'};await writeFile(join(temp,'private.json'),JSON.stringify(privateRecord));assert.equal(run('stage-encyclopedia-record.cjs',[join(temp,'private.json'),join(temp,'private-proposal.json')]).status,0);assert.notEqual(run('admit-encyclopedia-record.cjs',[join(temp,'private-proposal.json'),'--human-review-ref','synthetic-review-fixture'],{TD613_INTAKE_OUTPUT_DIR:admitted}).status,0);
  const revision={...fixture,record_id:'R-TEST-EXPERIMENT-002',supersedes:fixture.record_id,title:'Fictional revision; prior failure retained'};await writeFile(join(temp,'revision.json'),JSON.stringify(revision));assert.equal(run('stage-encyclopedia-record.cjs',[join(temp,'revision.json'),join(temp,'revision-proposal.json')]).status,0);assert.equal(run('admit-encyclopedia-record.cjs',[join(temp,'revision-proposal.json'),'--human-review-ref','synthetic-review-fixture'],{TD613_INTAKE_OUTPUT_DIR:admitted}).status,0);
  await mkdir(join(temp,'scripts'));for(const name of ['build-encyclopedia-reference.mjs','encyclopedia-reference-runtime.js','encyclopedia-intake.cjs','encyclopedia-intake-schema.json'])await copyFile(join(scripts,name),join(temp,'scripts',name));
  await copyFile(join(here,'../app/encyclopedia/index.html'),join(temp,'app/encyclopedia/index.html'));
  const build=spawnSync(process.execPath,[join(temp,'scripts/build-encyclopedia-reference.mjs')],{encoding:'utf8'});assert.equal(build.status,0,build.stderr);
  const manifest=JSON.parse(await readFile(join(temp,'app/encyclopedia/reference/manifest.json')));assert.equal(manifest.record_count,845);
  const indexed=JSON.parse(await readFile(join(temp,'app/encyclopedia/reference/records/R-TEST-EXPERIMENT-002.json')));assert(indexed.links.some(e=>e.type==='supersedes'&&e.target===fixture.record_id));assert.equal(indexed.status,'FAILED');assert(indexed.claim_ceiling.includes('zero empirical'));
  const exported=await readFile(join(temp,'app/encyclopedia/index.html'),'utf8');assert(exported.includes('Fictional revision; prior failure retained'));assert(exported.includes('Fictional intake transport fixture'));
 }finally{await rm(temp,{recursive:true,force:true})}
});

test('2026-10-23 public research addendum: all candidate IDs retained, intake staging bounded, no automatic admission',async()=>{
 const root=join(here,'../app/encyclopedia'),names=['R-DOME-AMBIANCE-20261023','R-ENCYCLOPEDIA-LAB-279-20261023','R-DOLLHOUSE-REST-EXIT-20261023'];
 const temp=await mkdtemp(join(tmpdir(),'td613-research-staging-'));
 try{
  const annex=JSON.parse(await readFile(join(root,'research/2026-10-23-proposal-and-rest-addendum.json'),'utf8'));
  const candidateIds=annex.coverage.all_candidate_ids_csv.split(',');
  assert.equal(candidateIds.length,279);assert.equal(new Set(candidateIds).size,279);
  assert.equal(annex.adoption.explicit_bridge_ids.length,21);
  assert.equal(annex.programs.length,16);
  assert.equal(annex.aia.verified_status,'ALREADY_CORRECTED_IN_RESEARCH_EDITION_1.4');
  for(const id of names){
   const src=join(root,'intake/staged',id+'.json'),raw=await readFile(src,'utf8'),r=intake.inspect(raw,schema);
   assert.equal(r.valid,true,JSON.stringify(r.errors));assert.equal(r.record.record_id,id);
   const proposed=join(temp,id+'.proposal.json'),run=spawnSync(process.execPath,[join(scripts,'stage-encyclopedia-record.cjs'),src,proposed],{encoding:'utf8'});
   assert.equal(run.status,0,run.stderr);
   const packet=JSON.parse(await readFile(proposed,'utf8'));
   assert.equal(packet.disposition,'PROPOSED');
   assert.equal(packet.original_json,raw);
   assert.match(packet.authority,/human review.*separate/i);
  }
 }finally{await rm(temp,{recursive:true,force:true})}
});
