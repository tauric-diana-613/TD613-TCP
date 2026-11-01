import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { verifyTerminalCapture } from './terminal-capture.candidate.mjs';
import { ControlledArchiveIntake, createSyntheticZipArchive, verifyAuthenticatedPhysicalArchiveMember } from './admission-only-intake.candidate.mjs';
const events = [{type:'thread.started',thread_id:'SYNTHETIC'},
  {type:'item.completed',item:{type:'agent_message',text:'invented final'}},{type:'turn.completed'}];
const capture = () => ({stdout:events.map(JSON.stringify).join('\n'),finalBytes:Buffer.from('invented final'),stderrBytes:Buffer.alloc(0),exitCode:0,dispatchId:'SYNTHETIC'});
test('synthetic capture correlation requires external witness',()=>assert.throws(()=>verifyTerminalCapture(capture()),/WITNESS_REQUIRED/));
test('synthetic exact bytes accepted only by explicit fake authority',()=>assert.equal(verifyTerminalCapture(capture(),{verifyCapture:()=>true}).response,'invented final'));
test('synthetic file mismatch and failed exit hold',()=>{
  assert.throws(()=>verifyTerminalCapture({...capture(),finalBytes:Buffer.from('different')}),/CONFLICT/);
  assert.throws(()=>verifyTerminalCapture({...capture(),exitCode:1}),/INCOMPLETE/);
});
test('synthetic late events and incomplete tools hold',()=>{
  assert.throws(()=>verifyTerminalCapture({...capture(),stdout:capture().stdout+'\n'+JSON.stringify(events[1])}),/POST_TERMINAL/);
  const tool={type:'item.started',item:{type:'command_execution'}};
  assert.throws(()=>verifyTerminalCapture({...capture(),stdout:[events[0],tool,...events.slice(1)].map(JSON.stringify).join('\n')}),/TOOL_ACTIVITY/);
});
const target=path.resolve('SYNTHETIC-NONEXISTENT.zip');
const grant=()=>({operation:'EXPERIMENT_B_ADMISSION_ONLY',archivePath:target,archiveSha256:'0'.repeat(64),metadataPolicyDigest:'0'.repeat(64),issuer:'SYNTHETIC',episode:'SYNTHETIC',authorizationId:'SYNTHETIC',expires:Date.now()+10000});
test('admission-only denies absent authority, Flight-purpose grant and expiry before I/O',()=>{
  const previous=process.env.TD613_ADMISSION_ONLY_AUTHORIZED;
  process.env.TD613_ADMISSION_ONLY_AUTHORIZED='true';
  try {
    const intake=new ControlledArchiveIntake({syntheticMode:false,allowProtectedAdmission:true});
    assert.throws(()=>intake.admitArchive(target,{admissionOnlyGrant:grant()}),/EXTERNAL_ADMISSION_AUTHORITY/);
    assert.throws(()=>intake.admitArchive(target,{admissionOnlyGrant:{...grant(),operation:'EXPERIMENT_B_RESUMABLE_FLIGHT'}}),/SCOPE_REJECTED/);
    assert.throws(()=>intake.admitArchive(target,{admissionOnlyGrant:{...grant(),expires:0}}),/SCOPE_REJECTED/);
  } finally { if(previous===undefined)delete process.env.TD613_ADMISSION_ONLY_AUTHORIZED;else process.env.TD613_ADMISSION_ONLY_AUTHORIZED=previous; }
});
test('legacy physical guard and synthetic WeakMap nonauthority preserved',()=>{
  const intake=new ControlledArchiveIntake();
  assert.throws(()=>intake.admitArchive(target),/PHYSICAL_PATH_BLOCKED/);
  const r=intake.admitArchive({zipBuffer:createSyntheticZipArchive([{name:'invented.txt',data:'invented'}])},{trustedSyntheticFixture:true});
  assert.equal(r.physical_io_executed,false);
  assert.equal(verifyAuthenticatedPhysicalArchiveMember(r.documents[0]),false);
});
