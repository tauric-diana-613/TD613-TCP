import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHumanComposeHostSession} from '../scripts/vixen-compose-host-session.mjs';
test('Composer host requires exact PR head and independent host credential enrollment',async()=>{
 assert.throws(()=>createHumanComposeHostSession(),/EXACT_SOURCE/);
 const dir=await mkdtemp(join(tmpdir(),'td613-host-test-'));
 try{
  assert.throws(()=>createHumanComposeHostSession({
   sourceRevision:'a'.repeat(40),ledgerDirectory:dir
  }),/HELD_TRUSTED_HOST_ENROLLMENT_OR_LEDGER_MISSING/);
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('Unknown source or unscored materials cannot reach an authorized composition',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'td613-host-test-'));
 try{
  // An empty registry can be supplied for inspection; it cannot approve.
  const host=createHumanComposeHostSession({
   sourceRevision:'a'.repeat(40),ledgerDirectory:dir,
   rpId:'vixen.example.org',allowedOrigins:['https://vixen.example.org'],
   registeredCredentials:[]
  });
  const staged=await host.stage({question:'unverified'});
  assert.equal(staged.status,'HELD');
  const request=await host.requestCompose();
  assert.equal(request.status,'HELD');
  assert.equal((await host.custodyInspect()).entries,0);
  assert.equal(host.productionRelease,false);
  assert.equal(host.canonicalCorpusWriter,null);
 }finally{await rm(dir,{recursive:true,force:true})}
});
