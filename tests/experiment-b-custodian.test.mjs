import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createHmac} from 'node:crypto';
import {Journal,digest,canonical} from '../scripts/experiment-b-resumable/journal.mjs';
import {CustodyStore} from '../scripts/experiment-b-operational/custodian/store.mjs';
import {createCustodianClient} from '../scripts/experiment-b-operational/custodian/client.mjs';
import {handleCustodyRequest} from '../scripts/experiment-b-operational/custodian/worker.mjs';
import {custodySourceClosure} from '../scripts/experiment-b-operational/custodian/bundle-source.mjs';
import {prepareMandate} from '../scripts/experiment-b-operational/custodian/prepare-mandate.mjs';
import {fixture,open,key,checkpointKey,issuer,audience,binding,mandate,context} from './experiment-b-custodian-fixture.mjs';
function resign(e,patch){
  const p={...JSON.parse(e.payload),...patch},header=e.detachedJws.split('.')[0],text=canonical(p);
  return {...e,payload:text,detachedJws:header+'..'+createHmac('sha256',key).update(header+'.'+Buffer.from(text).toString('base64url')).digest('base64url')};
}
test('SYNTHETIC finite human mandate required; permit accepted once; replay and fresh dispatch for same attempt denied',async t=>{
  const f=fixture(t);try{
    const result=await f.store.authorizeAndConsume(mandate().id,binding());assert.equal(result.status,'ACCEPTED');
    assert.equal(f.store.lookup(binding().attempt).state,'CONSUMED_UNCERTAIN');
    await assert.rejects(f.store.authorizeAndConsume(mandate().id,binding()));
    await assert.rejects(f.store.authorizeAndConsume(mandate().id,{...binding(),dispatchId:'OTHER'}));
    assert.throws(()=>f.store.issue('NO_MANDATE',binding('2')),/MANDATE/);
    assert.throws(()=>f.store.issue(mandate().id,binding('UNAPPROVED')),/OUTSIDE/);
  }finally{f.store.close();}
});
test('SYNTHETIC wrong SHI SAC namespace audience context episode and operation cannot consume',async t=>{
  const f=fixture(t);try{
    const e=f.store.issue(mandate().id,binding()),p=JSON.parse(e.payload);
    for(const patch of [{context:{...context,shi:'TD613-SH-9B07D8B-FFFFFFFF'}},{namespace:{...p.namespace,sac:'OTHER'}},
      {namespace:{...p.namespace,principal:'OTHER'}},{context:{...context,audience:'OTHER_CONTROLLER'}},{application:'OTHER_APPLICATION'},
      {context:{...context,episode:'OTHER'}},{operation:'OTHER'}]){
      await assert.rejects(f.store.consumeEnvelope(mandate().id,binding(),resign(e,patch)));
      assert.equal(f.store.lookup(binding().attempt).state,'ISSUED');
    }
    assert.equal((await f.store.consumeEnvelope(mandate().id,binding(),e)).status,'ACCEPTED');
    await assert.rejects(f.store.consumeEnvelope(mandate().id,binding(),e),/REPLAY/);
  }finally{f.store.close();}
});
test('SYNTHETIC expiry and revocation are rechecked transactionally',async t=>{
  const f=fixture(t);try{
    const e=f.store.issue(mandate().id,binding());f.store.now=()=>12000;
    await assert.rejects(f.store.consumeEnvelope(mandate().id,binding(),e));
    f.store.now=()=>1000;f.store.revoke(mandate().id);
    await assert.rejects(f.store.consumeEnvelope(mandate().id,binding(),e),/REVOKED/);
    await assert.rejects(f.store.authorizeAndConsume(mandate().id,binding('2')),/REVOKED/);
  }finally{f.store.close();}
});
test('SYNTHETIC restart retains consumed uncertain state; no automatic redispatch or reset',async t=>{
  const f=fixture(t);await f.store.authorizeAndConsume(mandate().id,binding());f.store.close();
  const again=open(f.paths);try{
    assert.equal(again.lookup(binding().attempt).state,'CONSUMED_UNCERTAIN');
    await assert.rejects(again.authorizeAndConsume(mandate().id,binding()));
    await assert.rejects(again.authorizeAndConsume(mandate().id,binding('2')),/UNRESOLVED/);
  }finally{again.close();}
});
test('SYNTHETIC simultaneous separate OS processes consume a duplicated dispatch at most once',async t=>{
  const f=fixture(t);f.store.close();
  const script=fileURLToPath(new URL('./experiment-b-custodian-process-fixture.mjs',import.meta.url));
  const run=()=>new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,[script],{windowsHide:true,stdio:['pipe','pipe','pipe']});let output='';
    child.stdout.on('data',b=>output+=b);child.stderr.resume();child.on('error',reject);
    child.on('exit',code=>{try{assert.equal(code,0);resolve(JSON.parse(output));}catch(e){reject(e);}});
    child.stdin.end(JSON.stringify(f.paths));
  });
  const results=await Promise.all([run(),run()]);assert.equal(results.filter(r=>r.status==='ACCEPTED').length,1);
  const check=open(f.paths);assert.equal(check.lookup(binding().attempt).state,'CONSUMED_UNCERTAIN');check.close();
});
test('SYNTHETIC independently retained anchor denies rolled-back journal; acknowledged appends survive reopen',t=>{
  const f=fixture(t),file=path.join(f.dir,'journal.sqlite'),episode=context.episode;
  const authority={minimumAnchor:()=>f.store.anchor(episode),publish:event=>f.store.publishAnchor(episode,event)};
  let j=new Journal(file,checkpointKey,{anchorAuthority:authority});
  const a=j.append('SYNTHETIC_FIRST',{});j.close();
  const backup=fs.readFileSync(file);
  j=new Journal(file,checkpointKey,{anchorAuthority:authority});j.append('SYNTHETIC_SECOND',{});j.close();
  fs.writeFileSync(file,backup);
  assert.throws(()=>new Journal(file,checkpointKey,{anchorAuthority:authority}),/ANCHOR/);
  assert.equal(f.store.anchor(episode).seq,2);
  assert.throws(()=>f.store.publishAnchor(episode,a),/ROLLBACK/);f.store.close();
});
test('SYNTHETIC exact terminal bookkeeping is idempotent, conflicting finals cannot overwrite, next attempt stays held until recorded',async t=>{
  const f=fixture(t);try{
    await f.store.authorizeAndConsume(mandate().id,binding());
    await assert.rejects(f.store.authorizeAndConsume(mandate().id,binding('2')),/UNRESOLVED/);
    const evidence={journalHash:digest('SYNTHETIC_JOURNAL'),finalSHA256:digest('SYNTHETIC_FINAL'),jsonlSHA256:digest('SYNTHETIC_EVENTS')};
    f.store.recordTerminal(binding().attempt,evidence);f.store.recordTerminal(binding().attempt,evidence);
    assert.throws(()=>f.store.recordTerminal(binding().attempt,{...evidence,finalSHA256:digest('CONFLICT')}),/SCOPE/);
    assert.equal((await f.store.authorizeAndConsume(mandate().id,binding('2'))).status,'ACCEPTED');
  }finally{f.store.close();}
});
test('SYNTHETIC lost anchor acknowledgement holds after durable local commit and prevents further appends',t=>{
  const f=fixture(t),file=path.join(f.dir,'ack.sqlite');let calls=0;
  const j=new Journal(file,checkpointKey,{anchorAuthority:{minimumAnchor:()=>null,publish(){calls++;throw Error('SYNTHETIC_LOST_ACK');}}});
  assert.throws(()=>j.append('DISPATCH_INTENT',{attempt:'SYNTHETIC'}),/UNCERTAIN/);
  assert.throws(()=>j.append('MUST_NOT_CONTINUE',{}),/UNCERTAIN/);assert.equal(calls,1);assert.equal(j.events().length,1);j.close();
  assert.throws(()=>new Journal(file,checkpointKey,{anchorAuthority:{minimumAnchor:()=>null,publish(){throw Error();}}}),/RECONCILIATION/);f.store.close();
});
test('SYNTHETIC reopen reconciles only retained accepted-final metadata, without repeating a model turn',async t=>{
  const f=fixture(t),file=path.join(f.dir,'accepted.sqlite');await f.store.authorizeAndConsume(mandate().id,binding());
  let drop=true,metadataReplays=0;
  const authority={minimumAnchor:()=>f.store.anchor(context.episode),publish:event=>{
    const anchor=f.store.publishAnchor(context.episode,event);
    if(event.type==='TURN_ACCEPTED'){
      if(drop){drop=false;throw Error('SYNTHETIC_TERMINAL_METADATA_ACK_LOSS');}
      metadataReplays++;f.store.recordTerminal(event.payload.attempt,{journalHash:event.hash,
        finalSHA256:event.payload.complete_evidence.terminalFinal.finalSHA256,jsonlSHA256:event.payload.complete_evidence.terminalFinal.jsonlSHA256});
    }
    return anchor;
  }};
  authority.reconcile=authority.publish;
  let j=new Journal(file,checkpointKey,{anchorAuthority:authority});
  assert.throws(()=>j.append('TURN_ACCEPTED',{attempt:binding().attempt,response:'SYNTHETIC_EXACT_FINAL',
    complete_evidence:{terminalFinal:{finalSHA256:digest('SYNTHETIC_EXACT_FINAL'),jsonlSHA256:digest('SYNTHETIC_JSONL')}}}),/UNCERTAIN/);
  j.close();assert.equal(f.store.lookup(binding().attempt).state,'CONSUMED_UNCERTAIN');
  j=new Journal(file,checkpointKey,{anchorAuthority:authority});assert.equal(j.events().length,1);assert.equal(j.events()[0].payload.response,'SYNTHETIC_EXACT_FINAL');
  assert.equal(metadataReplays,1);assert.equal(f.store.lookup(binding().attempt).state,'TERMINAL_RECORDED');
  j.close();f.store.close();
});
test('SYNTHETIC independent service audit log detects database rollback and partial log writes',t=>{
  const f=fixture(t);f.store.close();const backup=fs.readFileSync(f.paths.database);
  const again=open(f.paths);again.revoke(mandate().id);again.close();fs.writeFileSync(f.paths.database,backup);
  assert.throws(()=>open(f.paths),/DIVERGENCE/);
  fs.appendFileSync(f.paths.anchorLog,'PARTIAL');assert.throws(()=>open(f.paths),/INCOMPLETE/);
});
test('SYNTHETIC separately controlled system floor detects coordinated custody DB and file-log rollback',t=>{
  const f=fixture(t);f.store.close();
  const backupDB=fs.readFileSync(f.paths.database),backupLog=fs.readFileSync(f.paths.anchorLog);
  const initial=open(f.paths);const h=initial.db.prepare('SELECT seq,hash,tag FROM audit ORDER BY seq DESC LIMIT 1').get();initial.close();
  let floor={issuer,...h};
  const externalAudit={minimum:()=>floor,publish:record=>{floor=record;}};
  const live=new CustodyStore({...f.paths,key,checkpointKey,issuer,audience,now:()=>1000,externalAudit});live.revoke(mandate().id);live.close();
  fs.writeFileSync(f.paths.database,backupDB);fs.writeFileSync(f.paths.anchorLog,backupLog);
  assert.throws(()=>new CustodyStore({...f.paths,key,checkpointKey,issuer,audience,now:()=>1000,externalAudit}),/SYSTEM_ANCHOR/);
});
test('SYNTHETIC missing roots, unavailable service, and unauthenticated response fail closed',t=>{
  const f=fixture(t);f.store.close();
  assert.throws(()=>new CustodyStore({...f.paths,issuer,key:null,checkpointKey}),/ROOT/);
  const settings={mandateId:mandate().id,episode:context.episode,evidenceClass:'SYNTHETIC_TRANSPORT_ONLY'},spec={settings,settingsDigest:digest(settings)};
  const client=createCustodianClient({...spec,invoke(){throw Error('SYNTHETIC_OFFLINE');}});
  return assert.rejects(client.authorizeAndConsume(binding()),/UNAVAILABLE/);
});
test('SYNTHETIC IPC handler rejects issuer administration and unknown episode; retains refusal receipt',async t=>{
  const f=fixture(t);try{
    const r=await handleCustodyRequest(f.store,{requestId:'SYNTHETIC',operation:'approve',mandateId:mandate().id,episode:context.episode,payload:{}});
    assert.equal(r.status,'HOLD');assert(r.receipt);
    assert.equal((await handleCustodyRequest(f.store,{requestId:'SYNTHETIC',operation:'dispatch.authorize',mandateId:mandate().id,episode:'OTHER',payload:binding()})).status,'HOLD');
  }finally{f.store.close();}
});
test('SYNTHETIC client requires exact request correlation; source-bearing extra binding fields refuse',async t=>{
  const f=fixture(t);try{
    const settings={mandateId:mandate().id,episode:context.episode,evidenceClass:'SYNTHETIC_TRANSPORT_ONLY'},settingsDigest=digest(settings);
    const good=createCustodianClient({settings,settingsDigest,invoke:r=>({requestId:r.requestId,status:'OK',result:{status:'ACCEPTED'}})});
    assert.equal(await good.authorizeAndConsume(binding()),true);
    const stale=createCustodianClient({settings,settingsDigest,invoke:()=>({requestId:'STALE',status:'OK',result:{status:'ACCEPTED'}})});
    await assert.rejects(stale.authorizeAndConsume(binding()),/UNCERTAIN/);
    assert.throws(()=>f.store.issue(mandate().id,{...binding(),sourceText:'SYNTHETIC_NOT_A_REAL_SOURCE'}),/METADATA_ONLY/);
  }finally{f.store.close();}
});
test('installed source inventory closes every static JS dependency including the private-plan helper',()=>{
  const root=fileURLToPath(new URL('../',import.meta.url)),files=custodySourceClosure(root);
  assert(files.includes('scripts/experiment-b-resumable/engine.mjs'));
  assert(files.includes('scripts/experiment-b-operational/d04-evidence-policy.mjs'));
  assert(files.includes('scripts/experiment-b-resumable/journal.mjs'));
  assert(files.every(f=>!f.includes('..')&&!path.isAbsolute(f)));
});
test('finite permit schedule is derived from every frozen lane and both reasoning arms without invented corpus size',()=>{
  const plan={experiment:context.experiment,episode:context.episode,model:{requested:'SYNTHETIC',effort:'SYNTHETIC'},
    context:{inputLimit:100,outputLimit:10,tokenizerBinding:'SYNTHETIC'},runtimeBinding:'SYNTHETIC',
    ...Object.fromEntries(['analysisBinding','protocolBinding','kernelBinding','toolPolicyBinding','stage2Binding','baselineBinding'].map(k=>[k,'SYNTHETIC'])),
    lanes:[1,2].map(n=>({id:'SYNTHETIC_LANE_'+n,sourceOrder:Array.from({length:n},(_,i)=>'SYNTHETIC_'+i),custodyLineage:'SYNTHETIC',
      templates:Object.fromEntries(['modular1','modular2','union1','union2','baseline','synthesis'].map(k=>[k,'SYNTHETIC']))}))};
  const m=prepareMandate({plan,context:{...context,planDigest:digest(plan)},...Object.fromEntries(['id','expires','permitLifetimeMs','bindingPolicy','operatorAuthorizationEvidenceDigest'].map(k=>[k,mandate()[k]]))});
  assert.equal(m.maxPermits,2*((2*1+2)+(2*2+2)));
  assert.equal(m.allowedAttempts.filter(x=>x.includes('ARM_2A_MODULAR')).length,10);
  assert.equal(m.allowedAttempts.filter(x=>x.includes('ARM_2B_MATCHED_UNION')).length,10);
  assert(m.allowedAttempts.every(x=>x.endsWith('/attempt-1')));
});
test('SYNTHETIC loss of system-audit acknowledgement refuses further transactions until reconciliation',t=>{
  const f=fixture(t);f.store.close();
  const base=open(f.paths),row=base.db.prepare('SELECT seq,hash,tag FROM audit ORDER BY seq DESC LIMIT 1').get();base.close();
  let floor={issuer,...row};const externalAudit={minimum:()=>floor,publish:r=>{floor=r;throw Error('SYNTHETIC_LOST_SYSTEM_ACK');}};
  const keeper=new CustodyStore({...f.paths,key,checkpointKey,issuer,audience,now:()=>1000,externalAudit});
  assert.throws(()=>keeper.revoke(mandate().id));keeper.close();
  assert.throws(()=>open(f.paths),/DIVERGENCE/);
});
test('actual Windows named-pipe peer authentication with synthetic metadata only',{skip:process.platform!=='win32'?'WINDOWS_ONLY_TRANSPORT_WITNESS':false},t=>{
  const script=fileURLToPath(new URL('../scripts/experiment-b-operational/custodian/Test-WindowsPipe.ps1',import.meta.url));
  const r=spawnSync('pwsh',['-NoLogo','-NoProfile','-File',script],{encoding:'utf8',windowsHide:true,timeout:60000});
  assert.equal(r.status,0,'WINDOWS_TRANSPORT_TEST_FAILED');
  const receipt=JSON.parse(r.stdout.trim());
  if(receipt.status==='PENDING_REAL_INSTALLATION'){t.skip(receipt.reason);return;}
  assert.equal(receipt.status,'PASS');assert.equal(receipt.checks.length,3);
  assert.equal(receipt.distinctAccountKeyIsolation,'PENDING_REAL_INSTALLATION');
});
test('Production key storage denied to distinct engineering/controller/child identities', {skip:'PENDING_REAL_INSTALLATION: no accounts, production key or privileged installation created in source-free tests'},()=>{});
test('Production Windows event-log write/no-clear rights and no-overwrite retention', {skip:'PENDING_REAL_INSTALLATION: no privileged event-log setup executed'},()=>{});
test('Engineering Docker access cannot read custodian canary through host bind mounts', {skip:'PENDING_REAL_INSTALLATION: requires actual separate custodian account and protected canary'},()=>{});
