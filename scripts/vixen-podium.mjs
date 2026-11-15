#!/usr/bin/env node
/**
 * 𝌋 Vixen Podium · machine-only operator collaboration CLI.
 * Reads public Vixen catalogue and Universal Edition 1.4 assets on disk;
 * deliberately performs no external network requests or file mutations.
 *
 * node scripts/vixen-podium.mjs --manifest
 * node scripts/vixen-podium.mjs --input path/to/task-batch.json
 * cat task-batch.json | node scripts/vixen-podium.mjs --stdin
 * TD613_PODIUM_OPERATOR_DIRECT=1 node scripts/vixen-podium.mjs --native-read-tools --input native-commands.json
 *
 * Native read tools require both the host's direct-operator attestation and
 * an explicit CLI switch. This is an execution-lane declaration, not a
 * cryptographic proof of the human's presence or consent. The JSON task
 * itself can never authorize native tools or turn read-only into mutation.
 */
import {readFile,stat,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,resolve,join,sep,relative} from 'node:path';
// Native module imports are resolved below from the verified public asset root.
// This supports both the repository layout and the exact-head preview ZIP.

const defaultRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const options=process.argv.slice(2);
const getFlag=name=>options.indexOf(name)>=0?options[options.indexOf(name)+1]:null;
const shaHex=obj=>createHash('sha256').update(JSON.stringify(obj)).digest('hex');
function extractSnapshotFields(state){
 return {
  schema:state.schema||'emstd613.vixen.podium-synthesis-state/v1',
  status:state.status||'BASELINE_ESTATE_SYNTHESIS',
  operator_question:state.operator_question??null,
  operator_method:state.operator_method??null,
  custom_headline:state.custom_headline??null,
  custom_subtitle:state.custom_subtitle??null,
  custom_hero_statement:state.custom_hero_statement??null,
  custom_left_spine:state.custom_left_spine??null,
  active_plan:state.active_plan??null,
  refraction:state.refraction??null,
  inquiry_conjectures:Array.isArray(state.inquiry_conjectures)?state.inquiry_conjectures:[],
  supplemental_sources:Array.isArray(state.supplemental_sources)?state.supplemental_sources:[],
  podium_events:Array.isArray(state.podium_events)?state.podium_events:[],
  synthesis_headline:state.synthesis_headline||null,
  empirical_replication_credit:0,
  scientific_promotion_authority:false,
  human_closure_required:true,
  release_authority:false
 };
}
const input=getFlag('--input');
const directory=getFlag('--root')||defaultRoot;
const appRoot=(await stat(join(directory,'app','encyclopedia','vix-cyb.html')).then(()=>join(directory,'app')).catch(()=>directory));
const sourceRoot=resolve(appRoot,'encyclopedia');
const {createVixenPodium,PODIUM_SCHEMA}=await import(pathToFileURL(join(sourceRoot,'reference','vixen-podium.mjs')).href);
const {createVixenReferenceMembrane}=await import(pathToFileURL(join(sourceRoot,'reference','vixen-read-gateway.mjs')).href);
const base='http://127.0.0.1:6130/encyclopedia/reference/';
const OUTPUT_CEILING=200000;
const fileTransport=async(uri,req)=>{
 const u=new URL(uri);
 if(u.origin!=='http://127.0.0.1:6130'||req?.method!=='GET')
  return new Response('FORBIDDEN',{status:403});
 const key=u.pathname.slice('/encyclopedia/'.length);
 if(!u.pathname.startsWith('/encyclopedia/reference/')||!/^reference\/(?:manifest|directory|graph)\.json$|^reference\/records\/[A-Z][A-Z0-9_-]{1,95}\.json$/.test(key))
  return new Response('FORBIDDEN',{status:403});
 const path=resolve(sourceRoot,key);
 if(!path.startsWith(sourceRoot+sep)||relative(sourceRoot,path).startsWith('..'))
  return new Response('FORBIDDEN',{status:403});
 try{
  const entry=await stat(path);
  if(!entry.isFile()||entry.size>2000000)return new Response('TOO_LARGE',{status:413});
  const bytes=await readFile(path);
  return new Response(bytes,{status:200,headers:{'content-length':String(bytes.length),'content-type':'application/json; charset=utf-8'}});
 }catch(_){return new Response('NOT_FOUND',{status:404})}
};
function parsePageCorpus(html){
 const match=html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
 if(!match)throw Error('PODIUM_VIXEN_CORPUS_NOT_FOUND');
 return JSON.parse(match[1]);
}
const manifestPath=join(sourceRoot,'reference','podium','manifest.json');
const estateDir=resolve(sourceRoot,'vixen-estate');
const synthesisFile=resolve(estateDir,'podium-synthesis.json');
if(!synthesisFile.startsWith(estateDir+sep)||relative(estateDir,synthesisFile).startsWith('..'))
 throw Error('PODIUM_SYNTHESIS_PATH_ESCAPE_REFUSED');

async function readExistingSynthesisDoc(){
 try{
  const raw=await readFile(synthesisFile,'utf8');
  return JSON.parse(raw);
 }catch(_){return null;}
}

if(options.includes('--manifest')){
 console.log(await readFile(manifestPath,'utf8'));process.exit(0);
}
if(options.includes('--list-syntheses')){
 const existing=await readExistingSynthesisDoc();
 const log=Array.isArray(existing?.synthesis_log)?existing.synthesis_log:[];
 console.log(JSON.stringify({
  schema:'td613.vixen.podium.synthesis-log/v1',
  active_entry_id:existing?.active_entry_id||null,
  synthesis_seq:Number.isInteger(existing?.synthesis_seq)?existing.synthesis_seq:0,
  count:log.length,
  synthesis_log:log,
  authority:'READ_ONLY_HUMAN_CLOSURE_RESERVED'
 },null,2));
 process.exit(0);
}
const rollbackTarget=getFlag('--rollback');
if(options.includes('--rollback')){
 try{
  if(!rollbackTarget)throw Error('PODIUM_ROLLBACK_ENTRY_ID_REQUIRED');
  const existing=await readExistingSynthesisDoc();
  if(!existing||!existing.rollback_snapshots||!existing.rollback_snapshots[rollbackTarget]){
   throw Error('PODIUM_ROLLBACK_ENTRY_NOT_FOUND');
  }
  const snap=extractSnapshotFields(existing.rollback_snapshots[rollbackTarget]);
  const prevLog=Array.isArray(existing.synthesis_log)?existing.synthesis_log:[];
  const prevMaxSeq=prevLog.reduce((mx,e)=>Math.max(mx,Number(e?.seq)||0),0);
  const nextSeq=prevMaxSeq+1;
  const prevActiveId=existing.active_entry_id||prevLog[prevLog.length-1]?.entry_id||null;
  const prevEntry=prevLog.find(e=>e.entry_id===prevActiveId)||prevLog[prevLog.length-1]||null;
  const snapSha=shaHex(snap);
  const rollbackEventId=`syn-${String(nextSeq).padStart(4,'0')}-rollback-${snapSha.slice(0,8)}`;
  const newEntry={
   seq:nextSeq,
   entry_id:rollbackEventId,
   kind:'ROLLBACK',
   restored_entry_id:rollbackTarget,
   predecessor_entry_id:prevActiveId,
   predecessor_sha256:prevEntry?.state_sha256||null,
   recorded_at:new Date().toISOString(),
   summary:`Rolled back presentation synthesis to ${rollbackTarget}`,
   status:snap.status,
   patternSubtitle:snap.synthesis_headline?.patternSubtitle||null,
   researchQuestionMeta:snap.synthesis_headline?.researchQuestionMeta||null,
   researchQuestion:snap.synthesis_headline?.researchQuestion||null,
   state_sha256:snapSha
  };
  const nextDoc={
   ...snap,
   active_entry_id:rollbackTarget,
   last_log_entry_id:rollbackEventId,
   synthesis_seq:nextSeq,
   synthesis_log:[...prevLog,newEntry],
   rollback_snapshots:{
    ...existing.rollback_snapshots,
    [rollbackEventId]:snap
   }
  };
  await writeFile(synthesisFile,JSON.stringify(nextDoc,null,2)+'\n','utf8');
  console.log(JSON.stringify({
   schema:'td613.vixen.podium.rollback-receipt/v1',
   status:'ROLLED_BACK',
   restored_entry_id:rollbackTarget,
   log_entry_id:rollbackEventId,
   predecessor_entry_id:prevActiveId,
   synthesis_seq:nextSeq,
   persisted_synthesis_path:'vixen-estate/podium-synthesis.json',
   authority:'READ_ONLY_HUMAN_CLOSURE_RESERVED'
  },null,2));
  process.exit(0);
 }catch(e){
  console.error(JSON.stringify({schema:'td613.vixen.podium.cli-error/v1',
   status:'HELD',error:String(e?.message||'PODIUM_ROLLBACK_ERROR').slice(0,300),
   release_authority:false}));
  process.exit(2);
 }
}
let tasks;
try{
 let raw;
 if(input)raw=await readFile(resolve(input),'utf8');
 else if(options.includes('--stdin')||!process.stdin.isTTY){
  raw=await new Promise((yes,no)=>{let s='';process.stdin.setEncoding('utf8');
   process.stdin.on('data',c=>{s+=c;if(s.length>OUTPUT_CEILING)no(Error('PODIUM_INPUT_SIZE_LIMIT'))});
   process.stdin.on('end',()=>yes(s));process.stdin.on('error',no)});
 }else throw Error('PODIUM_TASK_INPUT_REQUIRED');
 if(!raw||raw.length>OUTPUT_CEILING)throw Error('PODIUM_INPUT_EMPTY_OR_OVERSIZE');
 const parsed=JSON.parse(raw);
 tasks=Array.isArray(parsed)?parsed:[parsed];
 if(tasks.length>24)throw Error('PODIUM_BATCH_LIMIT_24');
 const corpus=parsePageCorpus(await readFile(join(sourceRoot,'vix-cyb.html'),'utf8'));
 const membrane=createVixenReferenceMembrane({
  baseURL:base,fetcher:fileTransport,cryptoProvider:globalThis.crypto
 });
 // The host supplies execution authority outside the untrusted task JSON.
 // In portable ZIPs the native engines are intentionally absent; no manifest
 // or human-facing source can silently import them.
 const wantsNative=options.includes('--native-read-tools');
 const hostDirect=process.env.TD613_PODIUM_OPERATOR_DIRECT==='1';
 if(wantsNative&&!hostDirect)throw Error('HELD_OPERATOR_DIRECT_NATIVE_LANE_NOT_ATTESTED');
 let engineAdapters={};
 if(wantsNative&&hostDirect){
  const adapterModule=await import(pathToFileURL(resolve(directory,'scripts','vixen-podium-native-adapters.mjs')).href);
  engineAdapters=await adapterModule.createPodiumNativeReadAdapters({repoRoot:directory,sourceRoot});
 }
 const podium=createVixenPodium({corpus,membrane,sourceRevision:'LOCAL_CHECKOUT_UNVERIFIED',
  operatorAuthorized:wantsNative&&hostDirect,engineAdapters});
 const results=[];
 for(const task of tasks)results.push(await podium.dispatch(task));
 let persistedSynthesisPath=null;
 let persistedEntryId=null;
 if(options.includes('--write-synthesis')){
  const synState=extractSnapshotFields(podium.synthesisState());
  const existing=await readExistingSynthesisDoc();
  const prevLog=Array.isArray(existing?.synthesis_log)?[...existing.synthesis_log]:[];
  if(prevLog.length===0&&existing&&existing.schema){
   const baseSnap=extractSnapshotFields(existing);
   const baseSha=shaHex(baseSnap);
   prevLog.push({
    seq:0,
    entry_id:existing.active_entry_id||'syn-0000-baseline',
    kind:'BASELINE',
    predecessor_entry_id:null,
    predecessor_sha256:null,
    recorded_at:'2026-11-14T00:00:00Z',
    summary:'Initial canonical Vixen Cybernetics 32-work constitutive inquiry baseline.',
    status:baseSnap.status,
    patternSubtitle:baseSnap.synthesis_headline?.patternSubtitle||null,
    researchQuestionMeta:baseSnap.synthesis_headline?.researchQuestionMeta||null,
    researchQuestion:baseSnap.synthesis_headline?.researchQuestion||null,
    state_sha256:baseSha
   });
  }
  const prevSnapshots=(existing?.rollback_snapshots&&typeof existing.rollback_snapshots==='object')
   ?{...existing.rollback_snapshots}
   :{};
  if(existing&&existing.active_entry_id&&!prevSnapshots[existing.active_entry_id]){
   prevSnapshots[existing.active_entry_id]=extractSnapshotFields(existing);
  }
  const prevMaxSeq=prevLog.reduce((mx,e)=>Math.max(mx,Number(e?.seq)||0),0);
  const nextSeq=prevLog.length===0?0:prevMaxSeq+1;
  const prevActiveId=existing?.active_entry_id||prevLog[prevLog.length-1]?.entry_id||null;
  const prevEntry=prevLog.find(e=>e.entry_id===prevActiveId)||prevLog[prevLog.length-1]||null;
  const snapSha=shaHex(synState);
  const newEntryId=nextSeq===0&&!existing?'syn-0000-baseline':`syn-${String(nextSeq).padStart(4,'0')}-${snapSha.slice(0,8)}`;
  const newEntry={
   seq:nextSeq,
   entry_id:newEntryId,
   kind:nextSeq===0&&!existing?'BASELINE':'SYNTHESIS_PROPOSAL',
   predecessor_entry_id:prevActiveId,
   predecessor_sha256:prevEntry?.state_sha256||null,
   recorded_at:new Date().toISOString(),
   summary:synState.operator_question||synState.custom_subtitle||synState.synthesis_headline?.patternSubtitle||'Podium synthesis update',
   status:synState.status,
   patternSubtitle:synState.synthesis_headline?.patternSubtitle||null,
   researchQuestionMeta:synState.synthesis_headline?.researchQuestionMeta||null,
   researchQuestion:synState.synthesis_headline?.researchQuestion||null,
   state_sha256:snapSha
  };
  prevSnapshots[newEntryId]=synState;
  const nextDoc={
   ...synState,
   active_entry_id:newEntryId,
   last_log_entry_id:newEntryId,
   synthesis_seq:nextSeq,
   synthesis_log:[...prevLog,newEntry],
   rollback_snapshots:prevSnapshots
  };
  await writeFile(synthesisFile,JSON.stringify(nextDoc,null,2)+'\n','utf8');
  persistedSynthesisPath='vixen-estate/podium-synthesis.json';
  persistedEntryId=newEntryId;
 }
 const output={schema:'td613.vixen.podium.cli-batch/v1',task_schema:PODIUM_SCHEMA,
  source_custody:'LOCAL_PUBLIC_ASSETS_ONLY',remote_custody:'NOT_CLAIMED',results,
  route_history:podium.history(),
  persisted_synthesis_path:persistedSynthesisPath,
  persisted_entry_id:persistedEntryId,
  native_host_lane:wantsNative&&hostDirect?'OPERATOR_DIRECT_ATTESTED_NOT_IDENTITY_PROOF':'DISCONNECTED',
  authority:'READ_ONLY_HUMAN_CLOSURE_RESERVED'};
 console.log(JSON.stringify(output,null,2));
}catch(e){
 console.error(JSON.stringify({schema:'td613.vixen.podium.cli-error/v1',
  status:'HELD',error:String(e?.message||'PODIUM_EXECUTION_ERROR').slice(0,300),
  release_authority:false}));
 process.exitCode=2;
}
