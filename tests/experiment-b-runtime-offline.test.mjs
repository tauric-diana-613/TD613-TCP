import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createOfflineCaptureFixture,createOperationalRuntime,PINNED_IMAGE,CLI_SHA256} from '../scripts/experiment-b-operational/docker-capture-runtime.mjs';
import {capturedNativeCall} from '../scripts/experiment-b-resumable/terminal-capture.mjs';
import {codexArgs} from '../scripts/experiment-b-codex-exec-adapter.mjs';
import {nativeTransport} from '../scripts/experiment-b-resumable/boundaries.mjs';
const enabled=process.env.TD613_RUN_OFFLINE_BOUNDARY_TESTS==='1';
function setup(t,scenario){
  const parent=process.env.TD613_SYNTHETIC_CAPTURE_PARENT??os.tmpdir();
  const dir=fs.mkdtempSync(path.join(parent,'td613-capture-synthetic-'));fs.chmodSync(dir,0o700);
  const config={image:PINNED_IMAGE,captureStorageBytes:32*1024*1024,timeoutMs:30000,
    workspace:path.resolve(dir),privateCaptureDirectory:dir};
  const r=createOfflineCaptureFixture(config,scenario);
  t.after(()=>{r.disposeSynthetic();fs.rmSync(dir,{recursive:true,force:true});});return {r,dir,config};
}
const call=async(r,workspace)=>{
  const args=codexArgs({model:'gpt-6.1-sol',workspace});args.splice(args.length-1,0,'-c','model_reasoning_effort="xhigh"');
  const chunks=[];const result=await capturedNativeCall({service:r.captureService,spawnNative:r.spawnNative,args,
    executableSHA256:CLI_SHA256,request:{attempt:'SYNTHETIC-ONLY',rendered:{prompt:'INVENTED_INPUT_ONLY'},capture:(channel,bytes)=>chunks.push({channel,bytes:Buffer.from(bytes)})}});
  return {...result,chunks};
};
test('ACTUAL OFFLINE Docker capture retains exact bytes, immutable final evidence and one-time proof',{skip:!enabled},async t=>{
  const {r,dir}=setup(t,'equal');const out=await call(r,dir);
  assert.equal(out.parsed.output,'SYNTHETIC_FINAL');assert.equal(out.finalEvidence.finalBase64,Buffer.from('SYNTHETIC_FINAL').toString('base64'));
  assert.equal(out.finalEvidence.proof.evidenceClass,'ACTUAL_OFFLINE_CAPTURE_SYNTHETIC_OUTPUT');
  assert.equal(out.chunks.find(c=>c.channel==='final').bytes.toString(),'SYNTHETIC_FINAL');
  assert.equal(await r.captureService.verify(out.finalEvidence,out.finalEvidence.proof),false);
  assert(fs.readdirSync(dir).some(n=>n.endsWith('.stdout')));
});
for(const scenario of ['mismatch','absent','stale','replaced','post-terminal','unexpected-tool','incomplete-tool','oversized']){
  test('ACTUAL OFFLINE capture refuses '+scenario+' and retains evidence',{skip:!enabled},async t=>{
    const {r,dir}=setup(t,scenario);await assert.rejects(call(r,dir));
    const file=fs.readdirSync(dir).find(n=>n.endsWith('.stdout'));assert(file);
    if(scenario==='oversized')assert(fs.statSync(path.join(dir,file)).size>16*1024*1024);
  });
}
for(const arm of ['ARM_2A','ARM_2B'])test('ACTUAL OFFLINE '+arm+' typed MCP correlates all four operations to physical receipts',{skip:!enabled},async t=>{
  const {r,dir}=setup(t,'math');
  const identity={cliExecutableSHA256:CLI_SHA256,evidenceClass:'SYNTHETIC_IDENTITY_NOT_PROVIDER_WITNESS'};
  const transport=nativeTransport({workspace:dir,model:'gpt-6.1-sol',effort:'xhigh',observeRuntime:async()=>identity,
    spawnNative:r.spawnNative,captureService:r.captureService});
  const out=await transport({attempt:'SYNTHETIC_'+arm,rendered:{prompt:'INVENTED_INPUT_ONLY'},runtime:identity,capture(){}});
  assert.equal(out.status,'COMPLETED');assert.equal(out.response,'SYNTHETIC_FINAL');assert.equal(out.isolationViolation,false);
  assert.equal(out.kernelActivity.length,1);assert.deepEqual(JSON.parse(out.kernelActivity[0].result.content[0].text).values,['15','-1','56','1']);
});
test('ACTUAL OFFLINE capture refuses wrong dispatch, reused attempt and invented proof',{skip:!enabled},async t=>{
  const {r}=setup(t,'equal');const binding={dispatchId:'SYNTHETIC_DISPATCH',attempt:'SYNTHETIC_REUSE',executableSHA256:CLI_SHA256};
  const ticket=await r.captureService.prepare(binding);
  await assert.rejects(r.captureService.collect({...binding,dispatchId:'WRONG_DISPATCH',ticket}));
  await assert.rejects(r.captureService.prepare(binding));
  await assert.rejects(r.captureService.prepare({...binding,dispatchId:'OTHER_DISPATCH'}));
  assert.equal(await r.captureService.verify({...binding,captureId:ticket.captureId},{valid:true}),false);
});
test('ACTUAL OFFLINE missing external dispatch authority refuses native launch',{skip:!enabled},async t=>{
  const {dir,config}=setup(t,'equal');
  const runtime=createOperationalRuntime({...config,effectiveLimits:{contextTokens:100000,outputAndReasoningTokens:25000,
    includesHiddenReasoningAndFormatting:true,nativeRouteEvidenceDigest:'a'.repeat(64),operatorPolicyDigest:'b'.repeat(64)},
    inputPolicy:{model:'gpt-6.1-sol',algorithm:'UTF8_BYTES_PLUS_ENVELOPE_BOUND_V1',tokenizer:{property:'NONEMPTY_BYTE_TOKENS_WITH_NO_TEXT_EXPANSION',implementation:'SYNTHETIC',version:'TEST',modelMapping:'SYNTHETIC',mappingEvidenceDigest:'a'.repeat(64)},
      envelopeScopes:['native_instructions','tool_definitions','bounded_tool_exchanges','structural_tokens','provider_transforms'],
      envelopeUpperBoundTokens:10,envelopeEvidenceDigest:'a'.repeat(64),acceptanceDigest:'a'.repeat(64),overheadAssumptions:['SYNTHETIC_NOT_ACCEPTANCE']}});
  const cleanUndispatchedSynthetic=()=>{
    if(!fs.existsSync(dir))return;
    for(const file of fs.readdirSync(dir).filter(n=>n.endsWith('.jsonl'))){
      for(const line of fs.readFileSync(path.join(dir,file),'utf8').trim().split('\n')){
        const record=JSON.parse(line);if(record.type==='PREPARED'&&/^td613-capture-[a-f0-9]{32}$/.test(record.volume))
          execFileSync('docker',['volume','rm',record.volume],{windowsHide:true,stdio:'ignore'});
      }
    }
  };
  try {await assert.rejects(call(runtime,dir),/EXTERNAL_DISPATCH_AUTHORITY_UNPROVISIONED/);}
  finally{cleanUndispatchedSynthetic();}
  // No native child was created; only fresh empty capture storage was prepared.
  const logs=fs.readdirSync(dir).filter(n=>n.endsWith('.jsonl')).map(n=>fs.readFileSync(path.join(dir,n),'utf8'));
  assert(logs.every(text=>!text.includes('"type":"DISPATCHED"')));
  // Real capture volumes are deliberately retained by production runtime policy;
  // test cleanup may remove only the explicitly synthetic PREPARED test volume.
});
