import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {digest} from '../scripts/experiment-b-resumable/journal.mjs';
import {conservativeInputMeasurement,normalizeInputMeasurement,validateEffectiveLimits,compareInputUsage,quotaWindowCommitment} from '../scripts/experiment-b-operational/input-accounting.mjs';
import {exactArithmetic,correlateKernelEvents,mathServerSource,nativeKernelResult} from '../scripts/experiment-b-operational/typed-math.mjs';
import {createOperationalRuntime,PINNED_IMAGE,CLI_SHA256} from '../scripts/experiment-b-operational/docker-capture-runtime.mjs';
import {restrictModelCatalog,verifyRestrictedCatalog,enforceNoCompactionGuard} from '../scripts/experiment-b-operational/restricted-model-catalog.mjs';
const H='a'.repeat(64);
const policy={model:'gpt-6.1-sol',algorithm:'UTF8_BYTES_PLUS_ENVELOPE_BOUND_V1',
  tokenizer:{property:'NONEMPTY_BYTE_TOKENS_WITH_NO_TEXT_EXPANSION',implementation:'SYNTHETIC_BYTE_MAPPING',version:'TEST_ONLY',modelMapping:'SYNTHETIC_NOT_LIVE_SOL',mappingEvidenceDigest:H},
  envelopeUpperBoundTokens:100,envelopeEvidenceDigest:H,acceptanceDigest:H,
  envelopeScopes:['native_instructions','tool_definitions','bounded_tool_exchanges','structural_tokens','provider_transforms'],
  overheadAssumptions:['SYNTHETIC full envelope bounded; NOT actual provider evidence']};
test('D04 bound preserves full UTF8 text identity and never claims exact tokens',()=>{
  const prompt='𝌋\nKhona‌lit-po  é 末';const m=conservativeInputMeasurement(prompt,policy);
  assert.equal(m.payloadBytes,Buffer.byteLength(prompt));assert.equal(m.upperBound,m.payloadBytes+100);
  assert.equal(m.measuredTokens,null);assert.equal(m.providerReportedTokens,null);
  assert.equal(normalizeInputMeasurement(m,prompt).guardTokens,m.upperBound);
  assert.throws(()=>normalizeInputMeasurement(m,prompt+' '),/COMPLETE_MEASUREMENT/);
});
test('D04 context prediction is not silently compared with aggregate provider accounting',()=>{
  const m=conservativeInputMeasurement('invented',policy);
  assert.equal(compareInputUsage(m,99999).comparison,'UNAVAILABLE_OR_NONCOMPARABLE');
  assert.equal(compareInputUsage(m,99999,'ONE_SERIALIZATION_INCLUSIVE_CONTEXT').comparison,'PREDICTION_EXCEEDED');
  assert.equal(compareInputUsage(m,5,'ONE_SERIALIZATION_INCLUSIVE_CONTEXT').comparison,'WITHIN_PREDICTION');
});
test('D04 unknown tokenizer/envelope and unsupported text refuse before dispatch',()=>{
  assert.throws(()=>conservativeInputMeasurement('invented',null),/COMPLETE_ENVELOPE/);
  for(const field of ['tokenizer','envelopeEvidenceDigest','acceptanceDigest','envelopeUpperBoundTokens']){
    const p={...policy};delete p[field];assert.throws(()=>conservativeInputMeasurement('invented',p));
  }
  assert.throws(()=>conservativeInputMeasurement('\uD800',policy),/WELL_FORMED/);
  assert.throws(()=>conservativeInputMeasurement({image:'unsupported'},policy),/TEXT_ONLY/);
  assert.throws(()=>normalizeInputMeasurement({kind:'CONSERVATIVE_UPPER_BOUND',unknownOverhead:true},'invented'));
});
test('D04 reference ceiling and planning headroom do not satisfy native acceptance',()=>{
  assert.throws(()=>validateEffectiveLimits({contextTokens:1050000,outputAndReasoningTokens:128000}),/NATIVE_LIMIT/);
  assert.throws(()=>validateEffectiveLimits({contextTokens:1050000,outputAndReasoningTokens:25000}),/NATIVE_LIMIT/);
  const legacy=normalizeInputMeasurement(12,'invented');assert.equal(legacy.kind,'LEGACY_CALLER_COUNTER');
  assert.equal(legacy.measuredTokens,null);assert.equal(legacy.unknownOverhead,true);
});
test('quota-window identifiers bind actual reset metadata and never a caller label or quota percentage',()=>{
  const q={primary:{resetsAt:100,windowDurationMins:5,usedPercent:10}};
  const id=quotaWindowCommitment(q);assert.equal(id,quotaWindowCommitment({primary:{...q.primary,usedPercent:80}}));
  assert.notEqual(id,quotaWindowCommitment({primary:{...q.primary,resetsAt:200}}));
  assert.throws(()=>quotaWindowCommitment({primary:{resetsAt:null,windowDurationMins:5}}),/OBSERVED_PROVIDER/);
});
test('D13 finite exact arithmetic supports signed boundary and rejects expression execution',()=>{
  const request={operations:[{op:'add',a:'-7',b:'2'},{op:'subtract',a:'-7',b:'2'},
    {op:'multiply',a:'9'.repeat(512),b:'1'},{op:'gcd',a:'-84',b:'30'}]};
  assert.deepEqual(exactArithmetic(request),['-5','-9','9'.repeat(512),'6']);
  for(const bad of [{operations:[{op:'evaluate',a:'1',b:'2'}]},
    {operations:[{op:'add',a:'1+2',b:'3'}]}, {operations:[{op:'add',a:'1',b:'2',command:'x'}]},
    {operations:Array(9).fill({op:'add',a:'1',b:'1'})}])assert.throws(()=>exactArithmetic(bad));
});
test('D13 fixed stdio program is valid source and carries no arbitrary execution interface',()=>{
  assert.equal(spawnSync(process.execPath,['--input-type=module','--check'],{input:mathServerSource,stdio:['pipe','ignore','ignore']}).status,0);
  assert(!/child_process|eval\(|new Function|fetch\(|https?:/.test(mathServerSource));
});
test('native capability restriction preserves all instructions, efforts and numeric limits',()=>{
  const original={slug:'gpt-6.1-sol',model_messages:{instructions_template:'SYNTHETIC_FULL_INSTRUCTIONS'},
    context_window:500000,max_context_window:872000,effective_context_window_percent:95,
    supported_reasoning_levels:['SYNTHETIC'],shell_type:'unified_exec',apply_patch_tool_type:'freeform',
    experimental_supported_tools:['clock'],tool_mode:'code_mode_only',supports_search_tool:true};
  const catalog=restrictModelCatalog(original);assert.equal(catalog.models[0].apply_patch_tool_type,null);
  assert.equal(catalog.models[0].tool_mode,'direct');assert.deepEqual(catalog.models[0].model_messages,original.model_messages);
  assert.equal(verifyRestrictedCatalog(original,catalog).providerAttestation,false);
  const changed=structuredClone(catalog);changed.models[0].context_window=1050000;
  assert.throws(()=>verifyRestrictedCatalog(original,changed),/POLICY_DRIFT/);
  assert.equal(enforceNoCompactionGuard(original,{upperBound:100},{outputAndReasoningTokens:25000}).clientGuardTokens,450000);
  assert.throws(()=>enforceNoCompactionGuard(original,{upperBound:440000},{outputAndReasoningTokens:25000}),/COMPACTION/);
});
test('D13 native lifecycle needs matching complete physical kernel receipt',()=>{
  const input={operations:[{op:'add',a:'1',b:'2'}]};
  const result={content:[{type:'text',text:JSON.stringify({schema:'TD613_EXACT_INTEGER_V1',values:['3'],tolerance:0})}],isError:false};
  const i={id:'SYNTHETIC',type:'mcp_tool_call',server:'td613_math',tool:'exact_integer',arguments:input};
  const start={type:'item.started',item:i},done={type:'item.completed',item:{...i,status:'completed',result:nativeKernelResult(result)}};
  const receipts=[{sequence:1,input,result}];
  assert.equal(correlateKernelEvents([start,done],receipts).receipts.length,1);
  for(const [events,r] of [[[start],[]],[[done],receipts],[[start,done],[]],[[start,done,done],receipts],
    [[start,{...done,item:{...done.item,server:'other'}}],receipts],
    [[start,{...done,item:{...done.item,result}}],receipts]])assert.throws(()=>correlateKernelEvents(events,r));
});
test('runtime ABI import has no provider side effects and Stage2 retrieves without adjudicating',async t=>{
  const abi=await import('../scripts/experiment-b-operational/native-runtime.mjs');
  for(const name of ['observeRuntime','confirmQuotaWindow','measureInput','spawnNative','freezeStage2Packets','collectIndependentStage2'])assert.equal(typeof abi[name],'function');
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'td613-runtime-synthetic-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const contract={binding:'SYNTHETIC_STAGE2',model:'SYNTHETIC_NOT_ASTRA',effort:'SYNTHETIC',independentPrincipalBinding:H,
    credentialClassBinding:H,witnessRootsBinding:H,semanticReviewPolicyDigest:H,proofReviewPolicyDigest:H,
    completeCandidatePolicyDigest:H,finiteResourcePolicyDigest:H};
  const packets={binding:contract.binding,contractDigest:digest(contract),acceptedTurnHashes:['SYNTHETIC_HASH'],
    semanticMaskingReview:{evidenceClass:'SYNTHETIC_ONLY'},negativeControls:['SYNTHETIC'],frozenCandidates:['SYNTHETIC']};
  const packetFile=path.join(dir,'synthetic-packets.json');fs.writeFileSync(packetFile,JSON.stringify(packets),{mode:0o600});
  const config={image:PINNED_IMAGE,captureStorageBytes:32*1024*1024,timeoutMs:10000,privateCaptureDirectory:dir,
    stage2:{contract,packetFile,packetDigest:digest(packets),resultFile:path.join(dir,'absent-result.json')}};
  const runtime=createOperationalRuntime(config);
  assert.throws(()=>runtime.measureInput('invented'),/NATIVE_LIMIT/);
  assert.deepEqual(await runtime.freezeStage2Packets({events:[{type:'TURN_ACCEPTED',hash:'SYNTHETIC_HASH'}],binding:contract.binding}),packets);
  await assert.rejects(runtime.freezeStage2Packets({events:[],binding:contract.binding}),/COMPLETE_PACKET/);
  assert.equal(await runtime.collectIndependentStage2({packets,packetDigest:digest(packets)}),null);
  const fake={packetDigest:digest(packets),binding:contract.binding};fs.writeFileSync(config.stage2.resultFile,JSON.stringify(fake));
  await assert.rejects(runtime.collectIndependentStage2({packets,packetDigest:digest(packets)}),/RECEIPT_BINDING/);
  assert.equal(CLI_SHA256.length,64);
});
