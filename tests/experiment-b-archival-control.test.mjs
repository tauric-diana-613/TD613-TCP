import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { runArm1Archival } from '../docs/research/experiment-b-preflight/02_four_arm_harness/run-arm1-archival.mjs';
import { archivalBinding, assertArchivalReceipt, recordArchivalBaselines } from '../scripts/experiment-b-resumable/archival-control-v2.mjs';
import { executeArm1Archival } from '../scripts/run-experiment-b-flight.mjs';
import { Journal, digest } from '../scripts/experiment-b-resumable/journal.mjs';
import { ControlledArchiveIntake, createSyntheticZipArchive, createOperatorFlightGrant } from '../docs/research/experiment-b-preflight/02_four_arm_harness/controlled-archive-intake.mjs';
const root = path.resolve('.');
const require = createRequire(import.meta.url);
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'e3-arm1-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return { dir, sourceFree: true, proposalDirectory: path.join(dir, 'proposals') };
}
function member(value, id='M1') {
  const content = typeof value === 'string' ? value : JSON.stringify(value);
  return { id, filename: id+'.json', content, raw_bytes: Buffer.from(content), sha256: digest(content) };
}
const record = () => ({schema:'td613.research-intake/v1',record_id:'R-E3TEST',kind:'source_note',title:'Synthetic λ',recorded_at:'2026-11-02T12:00:00Z',author:'fixture',human_request_ref:'source-free',visibility:'private',body:'nonce Ω',sources:[{source_id:'S1',kind:'artifact',locator:'fixture:1',capture_status:'OPERATOR_SUPPLIED'}],evidence:{disposition:'SPECIFIED',earned_claim:'fixture',claim_ceiling:'synthetic',missing_evidence:[]}});
function graph(relations=true) {
  const posts=['a','b'].map(x=>({source_id:'reddit:t3_'+x,snapshot_id:'SYN',community:'r/Wendbine',source_text_stored:false,real_person_identity_adjudicated:false,canonical_url:'https://www.reddit.com/r/Wendbine/comments/'+x,declared_concepts:['a','b'],public_date:'2026-09-10',time_precision:'DAY',technical_header:'synthetic',source_flags:[]}));
  return {meta:{authority:{},schema:'wendbine-public-corpus-snapshot/v0.1',snapshot_id:'SYN',coverage:{admitted_source_count:2},scope:{surface:'fixture',community:'r/Wendbine',private_google_group_admitted:false},rights:{full_post_bodies_copied:false}},posts,relations:relations?[{source_id:posts[0].source_id,graph:'G_D',from:'a',relation:'DEPENDS_ON',to:'b',evidence_class:'SOURCE_EXPLICIT_PROGRAM'}]:[]};
}
test('E3 before: original runner labels an inspection indexed and misses a native graph', async t => {
  const f=fixture(t);
  const original=execFileSync('git',['show','10a4ad1c698ac0eab6a4451004d77ffbb2c0e1fa:docs/research/experiment-b-preflight/02_four_arm_harness/run-arm1-archival.mjs'],{encoding:'utf8'});
  const filename=path.join(f.dir,'before.mjs');fs.writeFileSync(filename,original);
  const { runArm1Archival: before }=await import('file://'+filename);
  const r=await before(root,[member(record()),member(graph(),'M2')]);
  assert.equal(r.total_indexed,1);assert.equal(r.relations_compiled,0);
  assert.equal(r.per_document_operations[0].indexed,true);
});
test('E3 native graph positive, genuine zero, incompatible, unadmitted and unknown labels', async t => {
  const f=fixture(t),bad=graph();bad.relations[0].source_id='reddit:t3_c';
  const unknown=graph();unknown.relations[0].graph='G_FAKE';
  const docs=[graph(),graph(false),'plain prose',bad,unknown].map((x,i)=>member(x,'M'+i));
  const r=await executeArm1Archival(root,docs,f),rows=r.per_document_operations;
  assert.deepEqual(rows.map(r=>r.compiler_status),['EXECUTED_POSITIVE','EXECUTED_ZERO','INCOMPATIBLE_INPUT','NATIVE_REFUSAL','EXECUTED_POSITIVE']);
  assert.equal(rows[0].relations_compiled,1);assert.equal(rows[0].semantic_credit,true);
  assert.equal(rows[1].relations_compiled,0);assert.match(rows[3].compiler_refusal,/unadmitted/);
  assert.equal(rows[4].semantic_credit,false);
  const unavailable=path.join(f.dir,'repo');fs.mkdirSync(path.join(unavailable,'scripts'),{recursive:true});
  for(const file of ['encyclopedia-intake.cjs','encyclopedia-intake-schema.json'])fs.copyFileSync(path.join(root,'scripts',file),path.join(unavailable,'scripts',file));
  const absent=await runArm1Archival(unavailable,[docs[0]],f);
  assert.equal(absent.per_document_operations[0].compiler_status,'UNAVAILABLE');
  assert.throws(()=>assertArchivalReceipt(absent,[docs[0]],f),/INCOMPLETE/);
});
test('E3 native proposal staging, restart, conflicts and no index credit', async t => {
  const f=fixture(t),doc=member(record());
  const r=await runArm1Archival(root,[doc],f);assertArchivalReceipt(r,[doc],f);
  assert.equal(r.per_document_operations[0].proposal_status,'STAGED_PROPOSED');
  assert.equal(r.per_document_operations[0].proposal.readback_verified,true);assert.equal(r.total_indexed,0);
  assert.deepEqual(await runArm1Archival(root,[doc],f),r);
  const invalid=await runArm1Archival(root,[member({schema:'bad'})],f);
  assert.equal(invalid.per_document_operations[0].schema_status,'NATIVE_REFUSAL');
  const conflict=await runArm1Archival(root,[member({...record(),body:'different'})],f);
  assert.equal(conflict.per_document_operations[0].error,'PROPOSAL_CONFLICT');
  const duplicate=await runArm1Archival(root,[doc,member(record(),'M2')],f);
  assert.equal(duplicate.per_document_operations[1].error,'DUPLICATE_RECORD_ID');
  const target=path.join(f.proposalDirectory,fs.readdirSync(f.proposalDirectory).find(x=>x.endsWith('.json')));
  fs.writeFileSync(target,'partial');assert.equal((await runArm1Archival(root,[doc],f)).status,'INCOMPLETE');
});
test('E3 custody rejects missing, mismatched and duplicate members; external store earns no raw custody', async t => {
  const f=fixture(t),doc=member('plain');
  for(const bad of [{...doc,raw_bytes:undefined},{...doc,sha256:'0'.repeat(64)}]) {
    const r=await runArm1Archival(root,[bad],f);assert.equal(r.status,'INCOMPLETE');
    assert.throws(()=>assertArchivalReceipt(r,[bad],f));
  }
  assert.equal((await runArm1Archival(root,[doc,doc],f)).status,'INCOMPLETE');
  const one=await runArm1Archival(root,[doc],f);fs.writeFileSync(path.join(f.dir,'external'),doc.raw_bytes);
  const two=await runArm1Archival(root,[doc],f);assert.deepEqual(one,two);
  assert.equal(one.raw_bytes_preserved,0);assert.equal(one.per_document_operations[0].durable_byte_custody,false);
  const untrusted=await runArm1Archival(root,[doc]);assert.equal(untrusted.status,'INCOMPLETE');
});
test('E3 original authenticated broker member reused; a descriptor clone cannot borrow authority', async t => {
  const f=fixture(t),zip=path.join(f.dir,'own-fixture.zip'),bytes=createSyntheticZipArchive([{name:'own.txt',data:'fixture only'}]);
  fs.writeFileSync(zip,bytes);
  const names=['TD613_OPERATOR_ARCHIVE_ADMISSION_GRANTED','TD613_FLIGHT_EXECUTION_AUTHORIZED'],previous=names.map(n=>process.env[n]);
  try {
    for(const n of names)process.env[n]='true';
    const key='E3_SYNTHETIC_ONLY',issuerId='E3_FIXTURE';
    const grant=createOperatorFlightGrant({archivePath:zip,archiveSha256:digest(bytes),permittedOperation:'EXPERIMENT_B_FLIGHT_ARCHIVE_ADMISSION',episodeId:'E3_SYNTHETIC_ONLY',issuerId},key);
    const intake=new ControlledArchiveIntake({syntheticMode:false,allowProtectedAdmission:true,trustedOperatorKeys:{[issuerId]:key}});
    const doc=intake.admitArchive(zip,{operatorFlightGrant:grant}).documents[0];
    const r=await executeArm1Archival(root,[doc],{proposalDirectory:f.proposalDirectory});
    assert.equal(r.per_document_operations[0].custody,'AUTHENTICATED_UPSTREAM_MEMBER');
    await assert.rejects(executeArm1Archival(root,[{...doc}],{proposalDirectory:f.proposalDirectory}),/INCOMPLETE/);
  } finally { names.forEach((n,i)=>previous[i]===undefined?delete process.env[n]:process.env[n]=previous[i]); }
});
test('E3 checkpoint replay after interruption, restart, legacy and wrong binding', async t => {
  const f=fixture(t),filename=path.join(f.dir,'journal.sqlite'),key='E3_TEST_ONLY_0000000000000000000000000',documents=[member(record())];
  const args={repoRoot:root,documents,binding:archivalBinding(root),...f};
  let journal=new Journal(filename,key),append=journal.append.bind(journal);
  journal.append=()=>{throw Error('SYNTHETIC_INTERRUPT_AFTER_STAGE');};
  await assert.rejects(recordArchivalBaselines({...args,journal}),/INTERRUPT/);journal.append=append;journal.close();
  journal=new Journal(filename,key);await recordArchivalBaselines({...args,journal});journal.close();
  journal=new Journal(filename,key);await recordArchivalBaselines({...args,journal});
  assert.equal(journal.events().length,1);
  await assert.rejects(recordArchivalBaselines({...args,journal,binding:'old'}),/NEW_BASELINE_BINDING/);
  const prior=journal.events()[0];prior.payload.results.schema='v999';
  const fake={events:()=>[prior]};await assert.rejects(recordArchivalBaselines({...args,journal:fake}),/INCOMPATIBLE/);
  const legacy={events:()=>[{type:'BASELINES_ACCEPTED'}]};
  await assert.rejects(recordArchivalBaselines({...args,journal:legacy}),/LEGACY/);journal.close();
});

test('E3 comparator uses actual renderer with complete raw prefix, matched turns and declared handoff topology', async t => {
  const { renderTurn, rounds, ARMS } = await import('../scripts/experiment-b-resumable/engine.mjs');
  // Reuse the repository's frozen SOURCE-FREE plan, never a protected operator plan.
  const frozen = JSON.parse(fs.readFileSync('docs/research/experiment-b-resumable-flight/2026-11-01/synthetic-recovery-receipts.json','utf8'));
  function findPlan(value) {
    if (value?.lanes?.[0]?.templates && value?.kernelBinding) return value;
    if (!value || typeof value !== 'object') return null;
    for (const child of Object.values(value)) { const plan=findPlan(child);if(plan)return plan; }
    return null;
  }
  const plan=findPlan(frozen);assert.ok(plan,'authentic repository synthetic plan');
  const lane=plan.lanes[0];
  const broker={prefix:ids=>({sources:ids.map(id=>({id,content:'SYNTHETIC:'+id})),commitment:digest(ids)})};
  assert.equal(rounds(lane).length,2*lane.sourceOrder.length+2);
  const seen=[];
  for(const arm of ARMS) {
    for(let i=0;i<rounds(lane).length;i++) {
      const r=renderTurn(plan,lane,i,arm,[],broker),payload=JSON.parse(r.prompt);
      assert.equal(payload.kernel,plan.kernelBinding);assert.equal(payload.tool_policy,plan.toolPolicyBinding);
      const phase=rounds(lane)[i].phase;
      const key=phase==='BASELINE'?'baseline':phase==='SYNTHESIS'?'synthesis':arm===ARMS[0]?(phase==='STAGE1'?'modular1':'modular2'):(phase==='STAGE1'?'union1':'union2');
      assert.equal(payload.instruction,lane.templates[key]);
      const hidden=arm===ARMS[0]&&['STAGE2','SYNTHESIS'].includes(phase);
      assert.equal(payload.sources.length,hidden?0:rounds(lane)[i].prefix);
      seen.push({arm,phase,visibility:r.source_visibility});
    }
  }
  assert.equal(seen.filter(x=>x.arm===ARMS[0]).length,seen.filter(x=>x.arm===ARMS[1]).length);
  assert.throws(()=>renderTurn(plan,lane,1,ARMS[1],[],{prefix:()=>({sources:[],commitment:'wrong'})}),/COMPLETE_SOURCE/);
});
