import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { nativeTransport, protectedBroker, verifyExecutionAuthorization } from '../scripts/experiment-b-resumable/boundaries.mjs';
import { syntheticCapture } from './experiment-b-capture-fixture.mjs';
import { Journal, digest } from '../scripts/experiment-b-resumable/journal.mjs';
import { admitOnly } from '../scripts/experiment-b-resumable/admission-only.mjs';
import { admissionPolicyDigest } from '../docs/research/experiment-b-preflight/02_four_arm_harness/admission-policy.mjs';
import { ControlledArchiveIntake, createSyntheticZipArchive, verifyAuthenticatedPhysicalArchiveMember } from '../docs/research/experiment-b-preflight/02_four_arm_harness/controlled-archive-intake.mjs';
const identity={evidence:'SYNTHETIC_ONLY',cliExecutableSHA256:'0'.repeat(64)};
const request=()=>({attempt:'SYNTHETIC',rendered:{prompt:'SYNTHETIC'},runtime:identity,capture(){}});
function transport(t,options={}) {
  const fake=syntheticCapture(t,options);
  return nativeTransport({workspace:os.tmpdir(),model:'SYNTHETIC',effort:'xhigh',observeRuntime:async()=>identity,spawnNative:fake.spawnNative,captureService:fake.service});
}
test('SYNTHETIC terminal exact bytes and evidence survive authenticated journal reopen',async t=>{
  const chunks=[];const r=await transport(t)({...request(),capture:(channel,bytes)=>chunks.push({channel,base64:Buffer.from(bytes).toString('base64')})});
  assert.equal(r.response,'SYNTHETIC_FINAL');assert(chunks.some(c=>c.channel==='final'));
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'td613-final-journal-'));
  t.after(()=>{assert.equal(path.dirname(dir),os.tmpdir());assert(path.basename(dir).startsWith('td613-final-journal-'));fs.rmSync(dir,{recursive:true,force:true});});
  const file=path.join(dir,'test.sqlite');const key='SYNTHETIC_INTEGRITY_ONLY_NOT_AN_OPERATOR_KEY';
  let j=new Journal(file,key);const event=j.append('RESULT_CAPTURED',{result:r});j.close();
  j=new Journal(file,key,{anchor:{seq:event.seq,hash:event.hash}});
  assert.equal(j.events()[0].payload.result.completeEvidence.terminalFinal.finalBase64,Buffer.from(r.response).toString('base64'));j.close();
});
for(const [name,options] of Object.entries({mismatch:{fileOutput:'WRONG'},absent:{absent:true},stale:{stale:true},reused:{reused:true},wrongDispatch:{wrongDispatch:true},uncaptured:{skipCapture:true},postTerminal:{late:[{type:'turn.started'}]},toolStart:{events:[{type:'item.started',item:{type:'command_execution'}}]},toolUpdate:{events:[{type:'item.updated',item:{type:'mcp_tool_call'}}]},unknown:{events:[{type:'undeclared.delegation'}]}})) {
  test('SYNTHETIC final capture refuses '+name,async t=>assert.rejects(transport(t,options)(request())));
}
test('SYNTHETIC missing capture authority refuses before spawn',async()=>{
  let called=false;const f=nativeTransport({workspace:os.tmpdir(),model:'SYNTHETIC',effort:'xhigh',observeRuntime:async()=>identity,spawnNative:async()=>{called=true;}});
  await assert.rejects(f(request()),/CAPTURE_AUTHORITY/);assert.equal(called,false);
});
test('SYNTHETIC admission purpose, digest, policy, expiry, single use, physical re-admission and legacy guard',t=>{
  // Only this test supplies a fake custodian. No human signatures are created.
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'td613-bootstrap-synthetic-'));
  t.after(()=>{assert.equal(path.dirname(dir),os.tmpdir());assert(path.basename(dir).startsWith('td613-bootstrap-synthetic-'));fs.rmSync(dir,{recursive:true,force:true});});
  const target=path.join(dir,'invented.zip');const zip=createSyntheticZipArchive([{name:'invented.txt',data:'SYNTHETIC ONLY'}]);fs.writeFileSync(target,zip);
  const policy={authorizedDerivativesMap:{},prospectiveMetadataMap:{},maxMembers:50,maxPerMemberBytes:2*1024*1024,maxTotalExpandedBytes:10*1024*1024,maxDecompressionRatio:100};
  const used=new Set();const authority={assertOfflineBoundary:()=>true,authorizeAndConsume(g){if(used.has(g.authorizationId))return false;used.add(g.authorizationId);return true;}};
  const grant={operation:'EXPERIMENT_B_ADMISSION_ONLY',archivePath:target,archiveSha256:digest(zip),metadataPolicyDigest:admissionPolicyDigest(policy),issuer:'SYNTHETIC',episode:'SYNTHETIC',authorizationId:'SYNTHETIC-1',expires:Date.now()+60000};
  const previous=process.env.TD613_ADMISSION_ONLY_AUTHORIZED;process.env.TD613_ADMISSION_ONLY_AUTHORIZED='true';
  try {
    const run=(g=grant,a=authority)=>admitOnly({target,grant:g,authority:a,policy});
    assert.throws(()=>run({...grant,operation:'EXPERIMENT_B_RESUMABLE_FLIGHT'}),/SCOPE/);
    assert.throws(()=>run({...grant,expires:0}),/SCOPE/);
    assert.throws(()=>run({...grant,metadataPolicyDigest:'1'.repeat(64)}),/POLICY/);
    assert.throws(()=>run(grant,{}),/OFFLINE/);
    const admitted=run();assert.equal(admitted.escrow.inferenceAuthorized,false);
    assert(verifyAuthenticatedPhysicalArchiveMember(admitted.admission.documents[0]));
    assert.throws(()=>run(),/AUTHORITY/);
    const readmitted=run({...grant,authorizationId:'SYNTHETIC-2'});
    assert.equal(admitted.escrow.sourceManifestDigest,readmitted.escrow.sourceManifestDigest);
    assert.notEqual(admitted.admission.documents[0],readmitted.admission.documents[0]);
    assert.throws(()=>run({...grant,authorizationId:'SYNTHETIC-WRONG',archiveSha256:'1'.repeat(64)}),/HASH_MISMATCH/);
    assert.throws(()=>verifyExecutionAuthorization(grant,{},{}),/AUTHORIZATION/);
    assert.throws(()=>new ControlledArchiveIntake({allowProtectedAdmission:true}).admitArchive(target,{operatorFlightGrant:grant}),/UNAUTHORIZED/);
    assert.throws(()=>protectedBroker([JSON.parse(JSON.stringify(admitted.admission.documents[0]))]),/AUTHENTICATED/);
    const synthetic=new ControlledArchiveIntake().admitArchive({zipBuffer:zip},{trustedSyntheticFixture:true});
    assert.equal(verifyAuthenticatedPhysicalArchiveMember(synthetic.documents[0]),false);
  } finally {if(previous===undefined)delete process.env.TD613_ADMISSION_ONLY_AUTHORIZED;else process.env.TD613_ADMISSION_ONLY_AUTHORIZED=previous;}
});
