// 𝌋 TD613 Marrowline · D0 versus D1 · native Google original-SSE acquisition.
// One immutable first-attempt activation head. Synthetic task only; never product data.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildDIngressFactorLadder } from './d-ingress-ladder.mjs';
import { serializeGeminiRequest } from '../../server/khonapolit-quality.js';
import { geminiStreamGenerateContentUrl, geminiRequestHeaders } from '../../server/gemini-provider-transport.js';
import { UNICODE_ASSAY_TASKS, UNICODE_ASSAY_SYSTEM } from '../../server/marrowline-unicode-capability-assay.js';
import { frameMarrowlineUserTurn } from '../../app/dome-world/khonapolit-covenant.js';

export const SCHEMA = 'td613.marrowline.d0-d1-original-sse/v1';
export const ACTIVATION = 'research(marrowline): execute D0 D1 original SSE once on main';
export const BRANCH = 'main';
const sha256 = b => createHash('sha256').update(b).digest('hex');
const WAIT_MS = 170000;
const MAX_SSE = 6_000_000;

export function registerD0D1() {
  const { model, d0, d1 } = buildDIngressFactorLadder();
  assert.equal(model, 'gemini-3.8-flash');
  assert.deepEqual(d0.systemInstruction, d1.systemInstruction);
  assert.deepEqual(d0.generationConfig, d1.generationConfig);
  assert.deepEqual(d0.generationConfig.thinkingConfig, { thinkingLevel: 'medium' });
  assert.equal(d0.systemInstruction.parts[0].text, UNICODE_ASSAY_SYSTEM);
  assert.equal(d0.contents[0].parts[0].text, UNICODE_ASSAY_TASKS['creative-multistack-v1']);
  assert.equal(d1.contents[0].parts[0].text, frameMarrowlineUserTurn(d0.contents[0].parts[0].text));
  assert.notDeepEqual(d0.contents, d1.contents);
  const original = [d0, d1].map(request => serializeGeminiRequest(request, model));
  // Cross-arm anti-confound: exact full request equality after changing the one user text.
  assert.deepEqual(
    { ...d0, contents: d1.contents }, d1,
    'Only the existing Marrowline user ingress wrapper may change the request'
  );
  assert.equal(original[0].observation.systemInstructionSha256, original[1].observation.systemInstructionSha256);
  assert.equal(original[0].observation.generationConfigSha256, original[1].observation.generationConfigSha256);
  return Object.freeze({
    model, conditions: [
      { id: 'D0_ORIGINAL_RAW', request: original[0] },
      { id: 'D1_MARROWLINE_INGRESS_ONLY', request: original[1] }
    ]
  });
}

export function unicodeMorphology(text) {
  const tally = new Map(); let base = null, codepoints=0, total=0, planar=0, outside=0;
  let stacks=0, maxDepth=0, markedClusters=0, depth=0;
  const depths=[];
  for (const c of text) {
    codepoints++;
    if (/\p{M}/u.test(c)) {
      if (base !== null) {
        depth++; total++;
        const cp=c.codePointAt(0);tally.set(cp,(tally.get(cp)||0)+1);
        if (cp>=0x334&&cp<=0x338)planar++;else outside++;
      }
    } else {
      if (base !== null) depths.push(depth);
      base=c;depth=0;
    }
  }
  if(base!==null)depths.push(depth);
  for (const d of depths) {if(d)markedClusters++;if(d>=2)stacks++;maxDepth=Math.max(maxDepth,d);}
  return {codepoints,totalCombiningMarks:total,distinctMarks:tally.size,
    fivePlanarFamilyMarks:planar,marksOutsideFivePlanarFamily:outside,
    markedClusters,stackedClusters:stacks,maxMarksPerBase:maxDepth,
    histogram:Object.fromEntries([...tally].sort((a,b)=>a[0]-b[0]).map(([c,n])=>
      ['U+'+c.toString(16).toUpperCase().padStart(4,'0'),n]))};
}

export function decodeGoogleSse(originalBytes) {
  const raw=originalBytes.toString('utf8');
  const blocks=raw.split(/\r?\n\r?\n/);
  let text='',events=0,finish=null,model=null,usage=null,gotCandidate=false;
  for (const block of blocks) {
    const rows=block.split(/\r?\n/).filter(line=>line.startsWith('data:'))
      .map(line=>line.slice(5).trimStart());
    if (!rows.length || rows[0]==='[DONE]') continue;
    const response=JSON.parse(rows.join('\n'));events++;
    model=response.modelVersion??model;
    usage=response.usageMetadata??usage;
    const candidate=response.candidates?.[0];
    if(candidate){
      gotCandidate=true;
      finish=candidate.finishReason??finish;
      for(const p of candidate.content?.parts||[]){
        if(typeof p.text==='string' && p.thought!==true)text+=p.text;
      }
    }
  }
  return {text,events,finish,model,usage,gotCandidate};
}

function gate() {
  assert.equal(process.env.TD613_D0D1_AUTH,'D0D1_EXACT_HEAD_ONCE');
  assert.equal(process.env.GITHUB_EVENT_NAME,'push');
  assert.equal(process.env.GITHUB_REF,'refs/heads/main');
  assert.equal(process.env.GITHUB_ACTOR,'tauric-diana-613');
  assert.equal(process.env.GITHUB_RUN_ATTEMPT,'1');
  assert.match(process.env.TD613_D0D1_EXACT_HEAD??'',/^[a-f0-9]{40}$/);
  assert.equal(process.env.GITHUB_SHA,process.env.TD613_D0D1_EXACT_HEAD);
  assert.equal(
    execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
    process.env.TD613_D0D1_EXACT_HEAD
  );
  assert.equal(execFileSync('git',['log','-1','--format=%s'],{encoding:'utf8'}).trim(),ACTIVATION);
}

export async function acquire() {
  gate();
  const {model,conditions}=registerD0D1();
  const out=process.env.TD613_D0D1_EVIDENCE_DIR;
  assert.ok(out && out.length>1,'NO_PRIVATE_EVIDENCE_DIRECTORY');
  const dir=resolve(out);await mkdir(dir,{recursive:true});
  const manifest={
    schema:SCHEMA, state:'HELD',maxCalls:2,automatedRetries:0,
    model,freeze:{sourceHead:process.env.TD613_D0D1_EXACT_HEAD,
      runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT,
      branch:BRANCH,createdAt:new Date().toISOString()},
    arms:conditions.map(({id,request})=>({id,submittedRequest:request.observation})),
    evidence:[],claimCeiling:'Two stochastic original-Google-SSE episodes only. Not a probability estimate, unique causal diagnosis, or High Zalgo restoration.'
  };
  const save=()=>writeFile(join(dir,'manifest.json'),JSON.stringify(manifest,null,2),{mode:0o600});
  await save();
  const key=process.env.GEMINI_API_KEY;
  if(!key||key.trim().length<8){manifest.holdReason='GEMINI_KEY_NOT_AVAILABLE';await save();return manifest;}
  for (const {id,request} of conditions) {
    const obs={id,callDispatched:true};manifest.evidence.push(obs);await save();
    try {
      const res=await fetch(geminiStreamGenerateContentUrl(model),{
        method:'POST',headers:geminiRequestHeaders(key),
        body:request.body,signal:AbortSignal.timeout(WAIT_MS)
      });
      obs.httpStatus=res.status;
      const bytes=Buffer.from(await res.arrayBuffer());
      obs.responseBytes=bytes.length;
      if(bytes.length>MAX_SSE){obs.holdReason='ORIGINAL_SSE_OVERSIZE';}
      else if(res.status!==200){obs.holdReason='PROVIDER_NON_200';obs.errorSha256=sha256(bytes);}
      else {
        await writeFile(join(dir,id+'.google-original.sse'),bytes,{mode:0o600});
        const e=decodeGoogleSse(bytes);
        obs.sseSha256=sha256(bytes);
        obs.textSha256=sha256(e.text);
        obs.events=e.events;obs.servedModel=e.model;obs.finishReason=e.finish;
        obs.usage=e.usage;obs.morphology=unicodeMorphology(e.text);
        if(e.model!==model || e.finish!=='STOP' || !e.gotCandidate || !e.text.length || !e.events)
          obs.holdReason='INCOMPLETE_OR_WRONG_MODEL_PROVIDER_RETURN';
        if(id==='D0_ORIGINAL_RAW' && (e.usage?.totalTokenCount??Infinity)>20000)
          obs.holdReason='FIRST_ARM_TOKEN_CEILING';
      }
    } catch(err){
      obs.holdReason='ORIGINAL_PROVIDER_CAPTURE_FAILED';obs.errorType=err?.name||'UnknownError';
    }
    await save();
    if(obs.holdReason){manifest.holdReason=obs.holdReason;break;}
  }
  if(manifest.evidence.length===2 && manifest.evidence.every(x=>!x.holdReason)) {
    const [a,b]=manifest.evidence;
    if(a.servedModel!==b.servedModel)manifest.holdReason='SERVED_MODEL_MISMATCH';
    else manifest.state='OBSERVED_PAIR';
  }
  manifest.completedAt=new Date().toISOString();
  await save();
  return manifest;
}

if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  if(process.argv.includes('--execute')){
    if(!process.argv.includes('--ack-two-paid-calls'))throw Error('PAID_CALL_ACK_REQUIRED');
    acquire().then(x=>{
      console.log('D0D1_RESULT '+JSON.stringify({
        state:x.state,head:x.freeze.sourceHead,runId:x.freeze.runId,
        evidence:x.evidence,holdReason:x.holdReason??null,
      }));
      if(x.state!=='OBSERVED_PAIR')process.exitCode=1;
    }).catch(e=>{
      console.error('D0D1_HARD_GATE '+(e?.name||'Error'));
      process.exitCode=1;
    });
  } else {
    const {model,conditions}=registerD0D1();
    console.log(JSON.stringify({schema:SCHEMA,mode:'OFFLINE_ONLY',model,
      maxCalls:2,arms:conditions.map(c=>({id:c.id,...c.request.observation}))},null,2));
  }
}
