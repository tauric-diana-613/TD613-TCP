/** TD613 Experiment B: source-free Codex CLI transport. NOT a protected-flight grant. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
export const BRIDGE_SCHEMA='td613.experiment-b.codex-source-free/v1';
export const SYNTHETIC='SOURCE_FREE_SYNTHETIC';
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
function fail(s){throw new Error(s);}
export function codexArgs({model,workspace}={}){
  if(!/^[A-Za-z0-9_.-]{2,96}$/.test(model||''))fail('CODEX_MODEL_PIN_REQUIRED');
  if(typeof workspace!=='string'||!path.isAbsolute(workspace))fail('ABSOLUTE_WORKSPACE_REQUIRED');
  return ['exec','--json','--ephemeral','--ignore-user-config','--sandbox','read-only','--skip-git-repo-check','--cd',workspace,'--model',model,'-'];
}
export function parseCodexEvents(stdout){
  if(typeof stdout!=='string'||!stdout.trim()||Buffer.byteLength(stdout)>16*1024*1024)fail('CODEX_JSONL_MISSING_OR_OVERSIZED');
  const events=stdout.trim().split(/\r?\n/).map((line,i)=>{
    try{const v=JSON.parse(line);if(typeof v.type!=='string')throw Error();return v;}
    catch{fail('CODEX_JSONL_INVALID_EVENT_'+i);}
  });
  const allowed=['thread.started','turn.started','item.started','item.updated','item.completed','turn.completed','error','turn.failed'];
  if(events.some(e=>!allowed.includes(e.type)))fail('NATIVE_UNKNOWN_EVENT_REFUSED');
  const starts=events.filter(e=>e.type==='thread.started'&&typeof e.thread_id==='string'&&e.thread_id);
  const finishes=events.filter(e=>e.type==='turn.completed');
  if(starts.length!==1 || events[0]!==starts[0])fail('NATIVE_THREAD_ID_MISSING_OR_DUPLICATED');
  if(events.some(e=>['error','turn.failed'].includes(e.type)))fail('NATIVE_TURN_FAILED');
  if(finishes.length!==1)fail('NATIVE_TURN_COMPLETION_UNVERIFIED');
  // The verified terminal event must close the returned JSONL. Later agent
  // messages must never be silently accepted as a completed answer.
  const terminalIndex=events.indexOf(finishes[0]);
  if(terminalIndex!==events.length-1)fail('NATIVE_POST_TERMINAL_EVENT_REFUSED');
  // All item lifecycle events are evidence of activity. The prior completed-only
  // filter missed started/updated tool calls, including tools that never completed.
  const itemEvents=events.filter(e=>['item.started','item.updated','item.completed'].includes(e.type));
  const prohibited=itemEvents.filter(e=>!['agent_message','reasoning'].includes(e.item?.type));
  if(prohibited.length)fail('NATIVE_TOOL_ACTIVITY_REFUSED');
  const messages=events.slice(1,terminalIndex).filter(e=>e.type==='item.completed'&&e.item?.type==='agent_message'&&typeof e.item.text==='string'&&e.item.text.trim());
  if(!messages.length)fail('NATIVE_AGENT_MESSAGE_UNOBSERVED');
  // Multiple completed agent messages may include intermediate commentary.
  // Preserve the last completed message verbatim as the terminal answer; retain
  // the entire original JSONL separately in the durable transport evidence.
  const output=messages[messages.length-1].item.text;
  return {thread_id:starts[0].thread_id,output,output_sha256:hash(output),
    usage_reported:finishes[0].usage||null,
    model_served_independently_attested:false,
    command_event_count:0};
}
function safeEnv(){
  const keys=['PATH','HOME','USERPROFILE','CODEX_HOME','TMPDIR','TMP','TEMP','LANG','LC_ALL','SystemRoot','SYSTEMROOT','HTTPS_PROXY','HTTP_PROXY','NO_PROXY','SSL_CERT_FILE'];
  return Object.fromEntries(keys.filter(k=>typeof process.env[k]==='string').map(k=>[k,process.env[k]]));
}
export function runSourceFreeCodexTurn({arm,model,fixture,prompt,authorized=false,spawnImpl=spawnSync}={}){
  if(!authorized)fail('SOURCE_FREE_INFERENCE_AUTHORIZATION_REQUIRED');
  if(!['ARM_2A_MODULAR','ARM_2B_MATCHED_UNION'].includes(arm))fail('INVALID_REASONING_ARM');
  if(fixture?.evidence_class!==SYNTHETIC||typeof fixture.content!=='string'||!fixture.content.trim()||
     fixture.filePath||fixture.archivePath||fixture.operatorGrant||fixture.archive_intake_verified)fail('PROTECTED_OR_UNCLASSIFIED_INGESTION_REFUSED');
  if(typeof prompt!=='string'||!prompt.trim()||Buffer.byteLength(prompt)>128000||Buffer.byteLength(fixture.content)>128000)fail('SOURCE_FREE_PAYLOAD_INVALID');
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'td613-b-codex-cal-'));
  try{
    fs.chmodSync(dir,0o700);
    const input=['SOURCE-FREE SYNTHETIC TEST. NO PROTECTED TD613/EM SOURCES.',
      'Do not inspect other files, call tools, or mutate the workspace.',
      'SYNTHETIC DOCUMENT:',fixture.content,'TASK:',prompt].join('\n\n');
    const run=spawnImpl('codex',codexArgs({model,workspace:dir}),{
      cwd:dir,input,encoding:'utf8',timeout:600000,maxBuffer:16*1024*1024,env:safeEnv()
    });
    if(run.error||run.status!==0)fail('CODEX_CLI_UNAVAILABLE_OR_FAILED');
    const r=parseCodexEvents(run.stdout);
    return {schema:BRIDGE_SCHEMA,arm,evidence_class:spawnImpl===spawnSync?'CODEX_CLI_EVENTS_LOCALLY_OBSERVED':'TEST_STUB_ONLY',
      model_requested:model,model_served_independently_attested:false,
      temperature_zero_attested:false,provider_session_isolation_attested:false,
      workspace_process_isolation_intended:true,sandbox_requested:'read-only',
      input_sha256:hash(input),fixture_sha256:hash(fixture.content),
      thread_id:r.thread_id,output:r.output,output_sha256:r.output_sha256,
      usage_reported:r.usage_reported,command_event_count:r.command_event_count,
      protected_archive_bytes_read:0,google_rest_calls:0,empirical_replication_credit:0,
      gate_f:'HELD_INDEPENDENT_MODEL_AND_EVALUATOR_ATTESTATION'};
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
}
export function codexCliReadiness(spawnImpl=spawnSync){
  const r=spawnImpl('codex',['--version'],{encoding:'utf8',timeout:5000,maxBuffer:65536,env:safeEnv()});
  return {cli_found:!r.error&&r.status===0,version:!r.error&&r.status===0?String(r.stdout).trim():null,
    account_access_verified:false,model_served_verified:false};
}
if(process.argv[1]?.endsWith('experiment-b-codex-exec-adapter.mjs'))
 console.log(JSON.stringify({schema:BRIDGE_SCHEMA,readiness:codexCliReadiness(),status:'PROBE_ONLY_ZERO_MODEL_CALLS',protected_flight:'HELD'},null,2));
