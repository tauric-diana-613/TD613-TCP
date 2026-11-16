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
// Human Compose authorization is not connected to this CLI. Historical
// write flags would bypass the Score; refuse regardless of bot JSON/env.
if(options.some(flag=>['--write-synthesis','--sync-html','--rollback'].includes(flag))){
 console.error(JSON.stringify({schema:'td613.vixen.podium.cli-custody-hold/v1',
  status:'HELD',reason:'HELD_INDEPENDENT_HUMAN_COMPOSE_APPROVAL_NOT_CONNECTED',
  available:'SCORE_STAGE_AND_REQUEST_ONLY',canonical_writes:0,release_authority:false}));
 process.exit(2);
}
// These flags persist USER SYNTHESIS into active presentation/corpus slots.
// Developer Git source edits remain on their usual PR/CI path. A bot-supplied
// CLI flag or task JSON is never independently authenticated human closure.
if(['--write-synthesis','--sync-html','--rollback'].some(x=>options.includes(x))){
 console.error(JSON.stringify({
  schema:'td613.vixen.podium.compose-hitl/v1',status:'HELD_HUMAN_COMPOSER_REQUIRED',
  reason:'Read-only Score and Compose first; no trusted human Score-digest approver is installed for these user-synthesis writers.',
  request:'Use podium.compose, disclose all source exclusions and visual changes, obtain independent Composer approval for a specific score_sha256.',
  developer_code_edits_exempt:true,source_mutation:false,canonical_write:false,deploy:false
 }));
 process.exit(2);
}
const getFlag=name=>{
 const idx=options.indexOf(name);
 return idx>=0&&idx+1<options.length?options[idx+1]:null;
};
const shaHex=obj=>createHash('sha256').update(JSON.stringify(obj)).digest('hex');
const sha256Text=txt=>createHash('sha256').update(String(txt),'utf8').digest('hex');
const escHtmlText=txt=>String(txt??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
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
  selected_candidate_id:state.selected_candidate_id??state.synthesis_headline?.provenance?.selected_candidate_id??null,
  lag_ticks:Number.isFinite(Number(state.lag_ticks))?Number(state.lag_ticks):36,
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
async function syncSynthesisHtmlSlots(doc){
 const htmlPath=join(sourceRoot,'vix-cyb.html');
 const before=await readFile(htmlPath,'utf8');
 const corpusMatch=before.match(/(<script[^>]*id="vixen-corpus-bundle"[^>]*>)([\s\S]*?)(<\/script>)/);
 if(!corpusMatch)throw Error('PODIUM_VIXEN_CORPUS_NOT_FOUND');
 const corpusShaBefore=sha256Text(corpusMatch[2]);
 const h=doc?.synthesis_headline;
 if(!h)throw Error('PODIUM_SYNTHESIS_HEADLINE_MISSING');
 let next=before;
 const replaceEl=(re,replacement,label)=>{
  if(!re.test(next))throw Error(`PODIUM_HTML_SLOT_NOT_FOUND:${label}`);
  next=next.replace(re,(_,open,_inner,close)=>`${open}${replacement}${close}`);
 };
 if(h.headerTagline)replaceEl(/(<span[^>]*\bid="synthHeaderTagline"[^>]*>)([\s\S]*?)(<\/span>)/,escHtmlText(h.headerTagline),'synthHeaderTagline');
 if(h.leftSpine)replaceEl(/(<div[^>]*\bid="synthLeftSpine"[^>]*>)([\s\S]*?)(<\/div>)/,escHtmlText(h.leftSpine),'synthLeftSpine');
 if(h.patternSubtitle)replaceEl(/(<span[^>]*\bid="synthPatternSubtitle"[^>]*>)([\s\S]*?)(<\/span>)/,escHtmlText(h.patternSubtitle),'synthPatternSubtitle');
 if(Array.isArray(h.axiomMarginalia)){
  const spans=h.axiomMarginalia.map(line=>`\n        <span>${escHtmlText(line)}</span>`).join('')+'\n      ';
  replaceEl(/(<aside[^>]*\bid="synthAxiomMarginalia"[^>]*>)([\s\S]*?)(<\/aside>)/,spans,'synthAxiomMarginalia');
 }
 if(typeof h.heroStatement==='string'){
  const heroHtml=h.heroStatement.split('\n').map(line=>escHtmlText(line)).join(' <br>');
  replaceEl(/(<p[^>]*\bid="synthHeroStatement"[^>]*>)([\s\S]*?)(<\/p>)/,heroHtml,'synthHeroStatement');
 }
 if(doc.active_entry_id)replaceEl(/(<span[^>]*\bid="ciActiveEntryBadge"[^>]*>)([\s\S]*?)(<\/span>)/,escHtmlText(`ACTIVE: ${doc.active_entry_id}`),'ciActiveEntryBadge');
 if(h.researchQuestionMeta)replaceEl(/(<span[^>]*\bid="synthResearchQuestionMeta"[^>]*>)([\s\S]*?)(<\/span>)/,escHtmlText(h.researchQuestionMeta),'synthResearchQuestionMeta');
 if(h.researchQuestion)replaceEl(/(<span[^>]*\bid="synthResearchQuestion"[^>]*>)([\s\S]*?)(<\/span>)/,escHtmlText(h.researchQuestion),'synthResearchQuestion');
 const corpusMatchAfter=next.match(/(<script[^>]*id="vixen-corpus-bundle"[^>]*>)([\s\S]*?)(<\/script>)/);
 if(!corpusMatchAfter||sha256Text(corpusMatchAfter[2])!==corpusShaBefore)throw Error('PODIUM_HTML_SYNC_CORPUS_MUTATION_ABORT');
 if(next!==before)await writeFile(htmlPath,next,'utf8');
 return {synced_html:true,changed:next!==before,corpus_bundle_sha256:corpusShaBefore};
}

if(options.includes('--manifest')){
 console.log(await readFile(manifestPath,'utf8'));process.exit(0);
}
if(options.includes('--score-candidates')){
 try{
  const rawLag=getFlag('--lag');
  const lagTicks=rawLag!==null&&Number.isFinite(Number(rawLag))?Number(rawLag):36;
  const question=getFlag('--question')||'';
  const corpus=parsePageCorpus(await readFile(join(sourceRoot,'vix-cyb.html'),'utf8'));
  const wantsNative=options.includes('--native-read-tools');
  const hostDirect=process.env.TD613_PODIUM_OPERATOR_DIRECT==='1';
  if(wantsNative&&!hostDirect)throw Error('HELD_OPERATOR_DIRECT_NATIVE_LANE_NOT_ATTESTED');
  let scored=null;
  if(wantsNative&&hostDirect){
   const adapterModule=await import(pathToFileURL(resolve(directory,'scripts','vixen-podium-native-adapters.mjs')).href);
   const adapters=await adapterModule.createPodiumNativeReadAdapters({repoRoot:directory,sourceRoot});
   scored=await adapters.RULEFIELD({operation:'score_unified_candidates',payload:{corpus,lag_ticks:lagTicks,...(question?{operator_question:question}:{})}});
  }else{
   const salon=await import(pathToFileURL(join(sourceRoot,'vixen-estate','synthesis-salon-engine.mjs')).href);
   scored=salon.scoreUnifiedSynthesisCandidates(corpus,{lagTicks,operatorQuestion:question});
  }
  console.log(JSON.stringify({
   schema:'td613.vixen.podium.candidate-scores/v1',
   native_host_lane:wantsNative&&hostDirect?'OPERATOR_DIRECT_ATTESTED_NOT_IDENTITY_PROOF':'DISCONNECTED',
   ...scored,
   empirical_replication_credit:0,
   scientific_promotion_authority:false,
   human_closure_required:true
  },null,2));
  process.exit(0);
 }catch(e){
  console.error(JSON.stringify({schema:'td613.vixen.podium.cli-error/v1',
   status:'HELD',error:String(e?.message||'PODIUM_SCORING_ERROR').slice(0,300),
   release_authority:false}));
  process.exit(2);
 }
}
if(options.includes('--search')||options.includes('--src-audit')||options.includes('--conduct')){
 try{
  const wantsNative=options.includes('--native-read-tools');
  const hostDirect=process.env.TD613_PODIUM_OPERATOR_DIRECT==='1';
  if(!wantsNative||!hostDirect)throw Error('HELD_OPERATOR_DIRECT_NATIVE_LANE_NOT_ATTESTED');
  const corpus=parsePageCorpus(await readFile(join(sourceRoot,'vix-cyb.html'),'utf8'));
  const membrane=createVixenReferenceMembrane({
   baseURL:base,fetcher:fileTransport,cryptoProvider:globalThis.crypto
  });
  const adapterModule=await import(pathToFileURL(resolve(directory,'scripts','vixen-podium-native-adapters.mjs')).href);
  const engineAdapters=await adapterModule.createPodiumNativeReadAdapters({repoRoot:directory,sourceRoot});
  const searchMod=await import(pathToFileURL(join(sourceRoot,'vixen-estate','semantic-semiotic-search.mjs')).href);
  const semanticSearch=searchMod?.loadSemanticSemioticEngine?await searchMod.loadSemanticSemioticEngine():null;
  const podium=createVixenPodium({
   corpus,membrane,sourceRevision:'LOCAL_CHECKOUT_UNVERIFIED',
   operatorAuthorized:true,engineAdapters,semanticSearch
  });
  if(options.includes('--search')){
   const q=getFlag('--search');
   if(!q||!q.trim())throw Error('HELD_EMPTY_QUERY');
   const mode=getFlag('--mode')||'hybrid';
   const rawLimit=getFlag('--limit');
   const limit=rawLimit!==null&&Number.isFinite(Number(rawLimit))?Number(rawLimit):12;
   const res=await podium.search(q,{
    mode,limit,
    include_universal:options.includes('--include-universal'),
    auto_open:true,
    operator_directive:true
   });
   console.log(JSON.stringify({
    schema:'td613.vixen.podium.cli-search/v1',
    native_host_lane:'OPERATOR_DIRECT_ATTESTED_NOT_IDENTITY_PROOF',
    receipt:res,
    empirical_replication_credit:0,
    scientific_promotion_authority:false,
    human_closure_required:true
   },null,2));
   process.exit(0);
  }
  if(options.includes('--src-audit')){
   const q=getFlag('--question')||'';
   const res=await podium.heterostratigraphicAudit({operatorQuestion:q,prefer_adapter:true});
   console.log(JSON.stringify({
    schema:'td613.vixen.podium.cli-src-audit/v1',
    native_host_lane:'OPERATOR_DIRECT_ATTESTED_NOT_IDENTITY_PROOF',
    receipt:res,
    empirical_replication_credit:0,
    scientific_promotion_authority:false,
    human_closure_required:true
   },null,2));
   process.exit(0);
  }
  if(options.includes('--conduct')){
   const rawConduct=getFlag('--conduct');
   if(!rawConduct||!rawConduct.trim())throw Error('HELD_CONDUCT_INPUT_REQUIRED');
   const trimmed=rawConduct.trim();
   const jsonText=(trimmed.startsWith('{')||trimmed.startsWith('['))?trimmed:await readFile(resolve(directory,trimmed),'utf8');
   const payload=JSON.parse(jsonText);
   const res=await podium.conduct(payload);
   console.log(JSON.stringify({
    schema:'td613.vixen.podium.cli-conduct/v1',
    native_host_lane:'OPERATOR_DIRECT_ATTESTED_NOT_IDENTITY_PROOF',
    result:res,
    empirical_replication_credit:0,
    scientific_promotion_authority:false,
    human_closure_required:true
   },null,2));
   process.exit(0);
  }
 }catch(e){
  console.error(JSON.stringify({
   schema:'td613.vixen.podium.cli-error/v1',
   status:'HELD',
   error:String(e?.message||'PODIUM_AIX_CONDUCTOR_ERROR').slice(0,300),
   release_authority:false
  }));
  process.exit(2);
 }
}
if(options.includes('--sync-html')&&!options.includes('--write-synthesis')&&!options.includes('--rollback')&&!input&&!options.includes('--stdin')){
 try{
  const existing=await readExistingSynthesisDoc();
  if(!existing)throw Error('PODIUM_SYNTHESIS_FILE_NOT_FOUND');
  const syncRes=await syncSynthesisHtmlSlots(existing);
  console.log(JSON.stringify({
   schema:'td613.vixen.podium.html-sync/v1',
   active_entry_id:existing.active_entry_id||null,
   pattern_subtitle:existing.synthesis_headline?.patternSubtitle||null,
   ...syncRes,
   release_authority:false
  },null,2));
  process.exit(0);
 }catch(e){
  console.error(JSON.stringify({schema:'td613.vixen.podium.cli-error/v1',
   status:'HELD',error:String(e?.message||'PODIUM_HTML_SYNC_ERROR').slice(0,300),
   release_authority:false}));
  process.exit(2);
 }
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
  const prevLastId=existing.last_log_entry_id||prevLog[prevLog.length-1]?.entry_id||existing.active_entry_id||null;
  const prevEntry=prevLog.find(e=>e.entry_id===prevLastId)||prevLog[prevLog.length-1]||null;
  const snapSha=shaHex(snap);
  const rollbackEventId=`syn-${String(nextSeq).padStart(4,'0')}-rollback-${snapSha.slice(0,8)}`;
  const newEntry={
   seq:nextSeq,
   entry_id:rollbackEventId,
   kind:'ROLLBACK',
   restored_entry_id:rollbackTarget,
   predecessor_entry_id:prevLastId,
   predecessor_seq:prevEntry?Number(prevEntry.seq):null,
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
  const htmlSync=options.includes('--sync-html')?await syncSynthesisHtmlSlots(nextDoc):null;
  console.log(JSON.stringify({
   schema:'td613.vixen.podium.rollback-receipt/v1',
   status:'ROLLED_BACK',
   restored_entry_id:rollbackTarget,
   log_entry_id:rollbackEventId,
   predecessor_entry_id:prevLastId,
   synthesis_seq:nextSeq,
   persisted_synthesis_path:'vixen-estate/podium-synthesis.json',
   ...(htmlSync?{synced_html:htmlSync.synced_html,corpus_bundle_sha256:htmlSync.corpus_bundle_sha256}:{}),
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
 const selectCandidateId=getFlag('--select-candidate');
 const lagFlag=getFlag('--lag');
 if(!input&&!options.includes('--stdin')&&selectCandidateId){
  tasks=[{
   schema:PODIUM_SCHEMA,
   intent:'podium.describe',
   params:{
    selected_candidate_id:selectCandidateId,
    ...(lagFlag!==null&&Number.isFinite(Number(lagFlag))?{lag_ticks:Number(lagFlag)}:{})
   }
  }];
 }else{
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
 }
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
 let semanticSearch=null;
 if(wantsNative&&hostDirect){
  const adapterModule=await import(pathToFileURL(resolve(directory,'scripts','vixen-podium-native-adapters.mjs')).href);
  engineAdapters=await adapterModule.createPodiumNativeReadAdapters({repoRoot:directory,sourceRoot});
  try{
   const searchMod=await import(pathToFileURL(join(sourceRoot,'vixen-estate','semantic-semiotic-search.mjs')).href);
   if(searchMod?.loadSemanticSemioticEngine)semanticSearch=await searchMod.loadSemanticSemioticEngine();
  }catch(_){semanticSearch=null;}
 }
 const podium=createVixenPodium({corpus,membrane,sourceRevision:'LOCAL_CHECKOUT_UNVERIFIED',
  operatorAuthorized:wantsNative&&hostDirect,engineAdapters,semanticSearch});
 const results=[];
 for(const task of tasks)results.push(await podium.dispatch(task));
 if(selectCandidateId&&(input||options.includes('--stdin'))){
  results.push(await podium.dispatch({
   schema:PODIUM_SCHEMA,
   intent:'podium.describe',
   params:{
    selected_candidate_id:selectCandidateId,
    ...(lagFlag!==null&&Number.isFinite(Number(lagFlag))?{lag_ticks:Number(lagFlag)}:{})
   }
  }));
 }
 let persistedSynthesisPath=null;
 let persistedEntryId=null;
 let persistedHtmlSync=null;
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
  const prevLastId=existing?.last_log_entry_id||prevLog[prevLog.length-1]?.entry_id||existing?.active_entry_id||null;
  const prevEntry=prevLog.find(e=>e.entry_id===prevLastId)||prevLog[prevLog.length-1]||null;
  const snapSha=shaHex(synState);
  const newEntryId=nextSeq===0&&!existing?'syn-0000-baseline':`syn-${String(nextSeq).padStart(4,'0')}-${snapSha.slice(0,8)}`;
  const newEntry={
   seq:nextSeq,
   entry_id:newEntryId,
   kind:nextSeq===0&&!existing?'BASELINE':'SYNTHESIS_PROPOSAL',
   predecessor_entry_id:prevLastId,
   predecessor_seq:prevEntry?Number(prevEntry.seq):null,
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
  if(options.includes('--sync-html')){
   persistedHtmlSync=await syncSynthesisHtmlSlots(nextDoc);
  }
 }else if(options.includes('--sync-html')){
  const existing=await readExistingSynthesisDoc();
  if(existing)persistedHtmlSync=await syncSynthesisHtmlSlots(existing);
 }
 const output={schema:'td613.vixen.podium.cli-batch/v1',task_schema:PODIUM_SCHEMA,
  source_custody:'EXPERIMENT_A_PREVIEW_AUTHORIZED',remote_custody:'NOT_CLAIMED',results,
  route_history:podium.history(),
  persisted_synthesis_path:persistedSynthesisPath,
  persisted_entry_id:persistedEntryId,
  ...(persistedHtmlSync?{synced_html:persistedHtmlSync.synced_html,corpus_bundle_sha256:persistedHtmlSync.corpus_bundle_sha256}:{}),
  native_host_lane:wantsNative&&hostDirect?'OPERATOR_DIRECT_ATTESTED_NOT_IDENTITY_PROOF':'DISCONNECTED',
  authority:'READ_ONLY_HUMAN_CLOSURE_RESERVED'};
 console.log(JSON.stringify(output,null,2));
}catch(e){
 console.error(JSON.stringify({schema:'td613.vixen.podium.cli-error/v1',
  status:'HELD',error:String(e?.message||'PODIUM_EXECUTION_ERROR').slice(0,300),
  release_authority:false}));
 process.exitCode=2;
}
