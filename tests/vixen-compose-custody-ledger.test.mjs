import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createComposeCustodyLedger} from '../scripts/vixen-compose-custody-ledger.mjs';
const rev='a'.repeat(40),score='b'.repeat(64);
const inTemp=async fn=>{
 const dir=await mkdtemp(join(tmpdir(),'td613-compose-ledger-test-'));
 try{return await fn(createComposeCustodyLedger({directory:dir}),dir)}
 finally{await rm(dir,{recursive:true,force:true})}
};
test('Host custody fails closed without provisioned persistent path',()=>{
 assert.throws(()=>createComposeCustodyLedger(),/PERSISTENT_CUSTODY/);
});
test('Append verifies exact-prefix hash chain, fails closed on tampering',()=>inTemp(async(ledger,dir)=>{
 const r=await ledger.append('SCORE_STAGED',rev,score,{source_set_revision:'test'});
 assert.equal(r.record.sequence,1);
 assert.equal((await ledger.inspect()).entries,1);
 const path=join(dir,'entries','0000000001.json');
 const record=JSON.parse(await readFile(path,'utf8'));
 record.event.details.source_set_revision='silently altered';
 await writeFile(path,JSON.stringify(record));
 await assert.rejects(()=>ledger.inspect(),/TAMPER_OR_DISCONTINUITY/);
 await assert.rejects(()=>ledger.append('COMPOSE_REQUESTED',rev,score,{}),/TAMPER_OR_DISCONTINUITY/);
}));
test('Exact-credential assertion nonce and monotonic counter are atomic within one ledger',()=>inTemp(async ledger=>{
 const info={credential_id:'credential-1',human_principal:'registered',nonce:'a'.repeat(48),
  score_digest:score,source_revision:rev,receipt_id:'sha',sign_count:2};
 assert.equal(await ledger.consumeHumanAssertion(info),true);
 assert.equal(await ledger.consumeHumanAssertion(info),false);
 assert.equal(await ledger.consumeHumanAssertion({...info,nonce:'b'.repeat(48),sign_count:1}),false);
 assert.equal(await ledger.consumeHumanAssertion({...info,nonce:'b'.repeat(48),sign_count:3}),true);
 assert.equal((await ledger.inspect()).entries,2);
}));
test('Rollback only proposes a recovery and requires exact independently stored baseline',()=>inTemp(async ledger=>{
 const snapshot=await ledger.registerBaseline({source_revision:rev,score_digest:score,
  manifest_sha256:'c'.repeat(64),index_sha256:'d'.repeat(64),
  restore_ref:'git:exact-preref',source_count:53,index_units:1086});
 assert.equal(snapshot.record.event.details.actual_archive_bytes_attested,false);
 const rollback=await ledger.rollbackPlan({source_revision:rev,score_digest:score,
 baseline_digest:snapshot.digest,reason:'operator review'});
 assert.equal(rollback.record.event.details.executable,false);
 await assert.rejects(()=>ledger.proposeTransaction({
  source_revision:rev,score_digest:score,before:{},after:{},consequences:[{}]}),/RESTORATION/);
}));
