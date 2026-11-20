#!/usr/bin/env node
/** Run unchanged TD613-derived EM source controls over Vixen's own SHAs.
 * No Em source archive checkout or Em author's scientific executor is claimed.
 * Full manuscript bytes are sent to the bounded local Python process only;
 * they do not enter the returned Podium receipt or any public website bundle.
 */
import {readFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadExperimentABodyBySourceId,shardForWorkIndex}
 from '../app/encyclopedia/vixen-estate/corpus-experiment-a.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const sha=b=>createHash('sha256').update(b).digest('hex');
const need=(test,error)=>{if(!test)throw Error(error)};
const WORK=/^emwork_[0-9a-f]{24}$/;
const SOURCE=/^emsrc_[0-9a-f]{24}$/;
const DIGEST=/^[0-9a-f]{64}$/;
const DEFAULT_PAIR=Object.freeze(['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28']);
function vixenCorpus(repoRoot){
 const html=readFileSync(resolve(repoRoot,'app/encyclopedia/vix-cyb.html'),'utf8');
 const match=html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
 need(match,'HELD_EM_VIXEN_REGISTER_MISSING');
 const corpus=JSON.parse(match[1]);
 need(corpus.works?.length===32&&
  corpus.works.reduce((n,w)=>n+(w.linked_sources||[]).length,0)===53&&
  corpus.works.filter(w=>w.human_gate_required===true).length===8,
  'HELD_EM_ORIGINAL_VIXEN_CENSUS_DRIFT');
 return corpus;
}
export async function prepareVixenEmNativeInput({repoRoot=ROOT,work_ids=DEFAULT_PAIR}={}){
 need(resolve(repoRoot)===ROOT,'HELD_EM_HOST_REPOSITORY_IDENTITY');
 need(Array.isArray(work_ids)&&work_ids.length===2&&new Set(work_ids).size===2&&
  work_ids.every(id=>typeof id==='string'&&WORK.test(id)),
  'HELD_EM_TWO_DISTINCT_REGISTERED_WORKS_REQUIRED');
 const corpus=vixenCorpus(repoRoot);
 const catalogue=corpus.works.map(w=>{
  const interval=w.contribution_interval;
  need(Array.isArray(interval)&&interval.length===2&&
   interval.every(x=>Number.isInteger(x)),'HELD_EM_IDENTITY_INTERVAL_MISSING');
  need((w.linked_sources||[]).every(s=>SOURCE.test(s.source_file_id)&&DIGEST.test(s.sha256)),
   'HELD_EM_MANIFESTATION_SOURCE_PROOF');
  return {
   work_id:w.work_id,identity_status:w.identity_status,
   human_gate_required:w.human_gate_required,
   manifestation_source_file_ids:w.linked_sources.map(x=>x.source_file_id),
   minimum_independent_work_contribution:interval[0],
   maximum_independent_work_contribution:interval[1],
   original_sources:Object.fromEntries(w.linked_sources.map(x=>[x.source_file_id,x.sha256]))
  };
 });
 const selected=[];
 for(const id of work_ids){
  const index=corpus.works.findIndex(w=>w.work_id===id);
  need(index>=0,'HELD_EM_FOREIGN_WORK');
  const work=corpus.works[index];
  let qualified=null;
  for(const source of work.linked_sources){
   const body=await loadExperimentABodyBySourceId(source.source_file_id,{hintShard:shardForWorkIndex(index)});
   if(!body||body.readable===false)continue;
   need(body.body_sha256_verified===true&&body.source_file_id===source.source_file_id&&
    (!body.work_id||body.work_id===work.work_id)&&typeof body.text_body==='string'&&
    sha(Buffer.from(body.text_body,'utf8'))===(body.derivative_sha256||body.body_sha256),
    'HELD_EM_DERIVATIVE_BYTES_OR_IDENTITY');
   qualified={work_id:id,source_file_id:source.source_file_id,
    declared_original_source_sha256:source.sha256,
    verified_derivative_sha256:body.derivative_sha256||body.body_sha256,
    body:body.text_body};
   break;
  }
  need(qualified,'HELD_EM_SELECTED_WORK_NO_VERIFIED_DERIVATIVE');
  selected.push(qualified);
 }
 return {schema:'td613.vixen.em-original-host-input/v1',catalogue,selected};
}
export function executeVixenEmOriginalControlPacket(packet,{repoRoot=ROOT}={}){
 need(resolve(repoRoot)===ROOT,'HELD_EM_HOST_REPOSITORY_IDENTITY');
 const script=resolve(repoRoot,'scripts/vixen-em-original-host.py');
 need(existsSync(script),'HELD_EM_ORIGINAL_HOST_UNAVAILABLE');
 const python=process.env.TD613_NATIVE_PYTHON||(process.platform==='win32'?'python':'python3');
 let result;
 try{
  result=JSON.parse(execFileSync(python,[script],{
   cwd:repoRoot,input:JSON.stringify(packet),encoding:'utf8',timeout:25000,
   maxBuffer:2*1024*1024,
   env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PYTHONUTF8:'1'}
  }));
 }catch(e){
  // Do not leak source snippets in exception messages from an untrusted child.
  throw Error('HELD_EM_ORIGINAL_NATIVE_CONTROL_EXECUTION');
 }
 need(result?.schema==='td613.vixen.em-original-controls-execution/v1'&&
  result.original_control_python_executed===true&&
  result.vixen_work_count===32&&result.vixen_manifestation_count===53&&
  result.human_gated_work_count===8&&result.source_span_witnesses?.length===2&&
  result.identity_sensitivity.partition_count===256&&
  result.identity_sensitivity.work_count_lower===32&&
  result.identity_sensitivity.work_count_upper===40&&
  result.identity_sensitivity.threshold_classification==='IDENTITY_SENSITIVE_OR_EVIDENCE_UNRESOLVED'&&
  result.foreign_source_bodies_imported===0&&
  result.original_em_author_intent_inferred===false&&
  result.scientific_credit===0&&result.full_native_method_equivalence==='HELD_UNPROVEN',
  'HELD_EM_ORIGINAL_COMPUTATIONAL_CLAIM_DRIFT');
 return {...result,read_only:true,source_estate:'VIXEN_EXPERIMENT_A_ONLY',
  authority:'UNVERIFIED_ENGINE_ADAPTER_RETURN',scientific_credit:0,
  public_operator_browser_native_python_executed:false};
}
export async function runVixenEmNativeWorkQualification({repoRoot=ROOT,work_ids=DEFAULT_PAIR}={}){
 const packet=await prepareVixenEmNativeInput({repoRoot,work_ids});
 return executeVixenEmOriginalControlPacket(packet,{repoRoot});
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  if(process.argv.length!==2)throw Error('HELD_EM_HOST_NO_CLI_UNTRUSTED_PATHS');
  process.stdout.write(JSON.stringify(await runVixenEmNativeWorkQualification())+'\n');
 }catch(error){
  process.stderr.write(JSON.stringify({state:'HELD',reason:String(error?.message||error)})+'\n');
  process.exitCode=2;
 }
}
