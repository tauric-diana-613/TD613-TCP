#!/usr/bin/env node
/**
 * Host-side Em Hostile-Method Expedition.
 *
 * Actual source input: two SHA-verified current Vixen manuscript derivatives.
 * Original original-method input: unchanged TD613 Em motif firewall and finite
 * identity sensitivity. Em author's historical documentary method is a
 * HUMAN RESEARCH PROTOCOL, not an author-written executable.
 *
 * A simulated Maestro journey becomes evidence-responsive: native source
 * observations select a candidate, an intentionally destructive control
 * withdraws one lexical edge, and the inquiry revises/stops. This is NOT
 * a performed human experiment, proof of lineage, or empirical exteriority.
 */
import {readFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {prepareVixenEmNativeInput,executeVixenEmOriginalControlPacket}
 from './vixen-em-native-work-transfer.mjs';
import {createVixenAiSession} from '../app/encyclopedia/vixen-estate/vixen-ai-session.mjs';
import {createVixenPodium,PODIUM_SCHEMA} from '../app/encyclopedia/reference/vixen-podium.mjs';
import {createPodiumNativeReadAdapters} from './vixen-podium-native-adapters.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const sha=x=>createHash('sha256').update(x).digest('hex');
const hash=x=>sha(JSON.stringify(x));
const need=(x,s)=>{if(!x)throw Error(s)};
const DEFAULT_PAIR=Object.freeze(['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28']);
const SOURCE=/^emsrc_[a-f0-9]{24}$/, WORK=/^emwork_[a-f0-9]{24}$/;
const stop=new Set(('about after again also been being both could each from have into just '+
 'like more most other over same some such than that their them then there these those '+
 'through under used using were what when where which while with would your this '+
 'here also even once upon does only very will shall into onto does has have').split(/\s+/));
function census(corpus){
 need(corpus?.works?.length===32&&
  corpus.works.reduce((n,w)=>n+(w.linked_sources||[]).length,0)===53&&
  corpus.works.filter(w=>w.human_gate_required).length===8,'HELD_EM_HOSTILE_VIXEN_CENSUS');
 return corpus;
}
function actualCorpus(){
 const s=readFileSync(resolve(ROOT,'app/encyclopedia/vix-cyb.html'),'utf8');
 const m=s.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
 need(m,'HELD_EM_HOSTILE_CORPUS_MISSING');
 return census(JSON.parse(m[1]));
}
function counts(body){
 const counts=new Map();
 for(const m of body.matchAll(/\b[a-z][a-z0-9]{3,22}\b/gi)){
  const term=m[0].toLowerCase();
  if(!stop.has(term))counts.set(term,(counts.get(term)||0)+1);
 }
 return counts;
}
function candidates(textA,textB){
 const a=counts(textA),b=counts(textB);
 const shared=[...a.keys()].filter(x=>b.has(x)&&!/[0-9]/.test(x));
 shared.sort((x,y)=>{
  // Deliberately choose source-specific repeatable candidates, not user-specified
  // preordained results. COMMON VOCABULARY STILL REMAINS AN ALTERNATIVE.
  const score=t=>Math.min(a.get(t),b.get(t))*10+Math.log(1+a.get(t)+b.get(t));
  return score(y)-score(x)||x.localeCompare(y);
 });
 return {vocabularyA:a.size,vocabularyB:b.size,candidate:shared[0]||null,
  shared_lexical_terms:shared.length,
  sourceA_occurrences:shared.length?a.get(shared[0]):0,
  sourceB_occurrences:shared.length?b.get(shared[0]):0,
  candidate_choice:'DETERMINISTIC_SHARED_NONSTOPWORD_HEURISTIC_NOT_SCHOLARLY_ANNOTATION'};
}
function location(body,term,source){
 const pattern=new RegExp('\\b'+term+'\\b','i'),m=pattern.exec(body);
 need(m,'HELD_EM_HOSTILE_CANDIDATE_SPAN_ABSENT');
 const raw=Buffer.from(body,'utf8');
 const at=Buffer.byteLength(body.slice(0,m.index),'utf8');
 const bytes=Buffer.from(m[0],'utf8');
 const slice=raw.subarray(at,at+bytes.length);
 need(slice.equals(bytes),'HELD_EM_HOSTILE_UTF8_OFFSET');
 return {source_id:source.source_file_id,
  sha256:source.verified_derivative_sha256,byte_offset:at,
  length_utf8:slice.length,span_sha256:sha(slice)};
}
function callPython(packet,candidate){
 const binary=process.env.TD613_NATIVE_PYTHON||(process.platform==='win32'?'python':'python3');
 const script=resolve(ROOT,'scripts/vixen-em-hostile-native-firewall.py');
 need(existsSync(script),'HELD_EM_HOSTILE_ORIGINAL_FIREWALL_SCRIPT_MISSING');
 try{
  const output=execFileSync(binary,[script],{cwd:ROOT,
   input:JSON.stringify({schema:'td613.vixen.em-hostile-python-input/v1',packet,candidate}),
   encoding:'utf8',timeout:25000,maxBuffer:1024*1024,
   env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PYTHONUTF8:'1'}});
  const result=JSON.parse(output);
  need(result.schema==='td613.vixen.em-hostile-native-firewall/v1'&&
   result.native_python_executed===true&&result.scientific_credit===0&&
   result.original_method_mechanism_supported===false&&
   result.source_digest_tamper_rejected===true&&
   result.swapped_source_key_rejected===true,
  'HELD_EM_HOSTILE_NATIVE_RECEIPT_PROMOTION');
  return result;
 }catch(e){throw Error('HELD_EM_HOSTILE_NATIVE_SOURCE_CONTROL_EXECUTION');}
}
export async function runEmHostileHostProbe({repoRoot=ROOT,work_ids=DEFAULT_PAIR}={}){
 need(resolve(repoRoot)===ROOT,'HELD_EM_HOSTILE_REPO_CUSTODY');
 need(Array.isArray(work_ids)&&work_ids.length===2&&
  work_ids.every(x=>typeof x==='string'&&WORK.test(x))&&work_ids[0]!==work_ids[1],
  'HELD_EM_HOSTILE_TWO_DISTINCT_WORKS');
 const packet=await prepareVixenEmNativeInput({repoRoot,work_ids});
 const original=executeVixenEmOriginalControlPacket(packet,{repoRoot});
 const [a,b]=packet.selected;
 need(SOURCE.test(a.source_file_id)&&SOURCE.test(b.source_file_id),'HELD_EM_SOURCE_CUSTODY');
 const election=candidates(a.body,b.body);
 const originalMethod=resolve(ROOT,'packages/dome_world_exact/fixtures/a15-r0/EMSTD613/99-ADMIN/em-motif-mechanism-control-v1.py');
 const sourceRefs=packet.selected.map(x=>({work_id:x.work_id,source_file_id:x.source_file_id,
  declared_original_source_sha256:x.declared_original_source_sha256,
  derivative_sha256:x.verified_derivative_sha256,source_text_body_in_public_receipt:false}));
 let native=null,nulls,branch;
 if(!election.candidate){
  nulls={candidate_token_withheld:true,
   shared_candidate_found:false,sourceA_term_count:0,sourceB_term_count:0,
   ablated_sourceB_term_count:0,field_generic_null_excluded:false};
  branch={initial:'NO_BOUNDED_SHARED_LEXICAL_CANDIDATE',
   after_adverse_control:'NO_RELATION_EARNED',
   resulting_action:'TRY_ANOTHER_VERIFIED_WORK_PAIR_OR_ASK_HUMAN_TO_SUPPLY_SOURCE_LOCATABLE_FORMAL_OBJECT',
   requires_human_source_annotation:true,scientific_credit:0};
 }else{
  const token=election.candidate;
  const locators=[location(a.body,token,a),location(b.body,token,b)];
  native=callPython(packet,{token,locators});
  need(native.native_method_sha256===sha(readFileSync(originalMethod))&&
   native.token===token&&native.exact_source_locators.length===2&&
   native.synthetic_structural_form_classification==='STRUCTURAL_ANALOGY_CANDIDATE'&&
   native.baseline_source_verified_classification==='MOTIF_MATCH',
   'HELD_EM_NATIVE_FIREWALL_PROGRAM_OR_CLASSIFICATION');
  // The exact candidate term is withdrawn from the SECOND real source's
  // ephemeral comparison text (never from the corpus or its original files).
  const pattern=new RegExp('\\b'+token+'\\b','gi');
  const count=counts(b.body).get(token)||0;
  const mutated=b.body.replace(pattern,' ');
  const after=counts(mutated).get(token)||0;
  need(count>0&&after===0,'HELD_EM_HOSTILE_MOTIF_WITHDRAWAL_NO_EFFECT');
  nulls={
   candidate_token_withheld:false,
   exact_verified_token_in_both:true,
   sourceA_term_count:election.sourceA_occurrences,
   sourceB_term_count:election.sourceB_occurrences,
   ablated_sourceB_term_count:after,
   sourceB_token_withdrawal_actual_count:count,
   sourceB_ephemeral_ablation_digest:sha(mutated),
   changed_original_or_corpus_bytes:false,
   field_generic_null_excluded:false,
   title_leakage_not_controlled:true,
   structural_form_is_hypothetical:true,
   original_motif_firewall_remains_unpromoted:true
  };
  branch={
   initial:'MOTIF_MATCH_SOURCE_LOCALIZED_NOT_MECHANISM',
   after_adverse_control:'FRAGILE_LEXICAL_PAIR_WITH_HELD_MECHANISM',
   resulting_action:'REQUEST_TWO_VERIFIED_SOURCE_MAPPINGS_FOR_OPERATORS_BOUNDARIES_AND_PREDICTIONS_PLUS_FIELD_GENERIC_COMPARATOR',
   requires_human_source_annotation:true,scientific_credit:0
  };
 }
 need(original.identity_sensitivity.partition_count===256&&
  original.identity_sensitivity.threshold_classification==='IDENTITY_SENSITIVE_OR_EVIDENCE_UNRESOLVED'&&
  original.human_gated_work_count===8,'HELD_EM_IDENTITY_BOUNDARY_PROMOTED');
 const receipt={
  schema:'td613.vixen.em-hostile-host-probe/v1',
  state:'COMPUTATIONAL_SOURCE_CHECK_QUEUED_HUMAN_MECHANISM_INTERPRETATION',
  work_ids,source_refs:sourceRefs,
  elected_motif:election.candidate,
  candidate_stats:election,native_firewall:native,
  native_motif_firewall_sha256:sha(readFileSync(originalMethod)),
  source_identity_partition_count:original.identity_sensitivity.partition_count,
  source_identity_ambiguous_work_interval:[original.identity_sensitivity.work_count_lower,
   original.identity_sensitivity.work_count_upper],
  source_identity_human_gates_unresolved:8,
  source_identity_threshold_state:original.identity_sensitivity.threshold_classification,
  adversarial_control:nulls,decision:branch,
  protocols_original_historical_head:'70b5a0f9e94626cba6068f41c6117e7978800bbd',
  historical_dossier_archival_bytes_reverified_by_this_probe:false,
  independent_original_historical_source_witness:false,
  native_method_class:'UNCHANGED_TD613_DERIVED_SOURCE_CONTROL_NOT_EM_AUTHOR_EXECUTABLE',
  controlled_comparison_experiment:'EPHEMERAL_TOKEN_WITHDRAWAL_NOT_INDEPENDENT_EMPIRICAL_NEGATIVE',
  public_browser_executed_original_python:false,
  source_excerpts_or_full_manuscript_copied_to_receipt:false,
  documentary_protocols_automatically_executed:0,
  full_original_method_parity:'HELD_UNPROVEN',
  mechanism_claim_support:'HELD_NO_INDEPENDENT_MAPPING',
  emergence_claim_support:'HELD',
  external_scientific_credit:0,scientific_credit:0,
  human_identity_gates_resolved:false,
  human_closure_required:true
 };
 return {...receipt,receipt_sha256:hash(receipt)};
}
function makeStage(prev,kind,body){
 const data={kind,previous_sha256:prev?.stage_sha256||null,
  evidence_class:'ACTUAL_HOST_COMPUTATION_AND_SIMULATED_OPERATOR_PATH',
  ...body,scientific_credit:0,human_closure_required:true};
 return {...data,stage_sha256:hash(data)};
}
async function runMaestroNarrative(probe){
 const corpus=actualCorpus();
 const adapters=await createPodiumNativeReadAdapters({repoRoot:ROOT});
 const podium=createVixenPodium({corpus,operatorAuthorized:true,engineAdapters:adapters});
 const hostRead=({intent,params})=>podium.dispatch({schema:PODIUM_SCHEMA,intent,params});
 const session=createVixenAiSession({corpus,hostRead,readCart:()=>[]});
 const start=await session.start({role:'MAESTRO',goal:
  'Discriminate a source-local motif from a mechanism without resolving human identities'});
 need(start.status==='SUPPORTED'&&start.result?.opening_turn?.role==='MAESTRO',
  'HELD_EM_HOSTILE_MAESTRO_OPENING');
 const stages=[];
 const proposed=[
  {choice_id:'source',source_work_id:probe.work_ids[0],
   question:'Inspect the first registered source and the SHA-bound manifestation before any motif theory'},
  {choice_id:'compare',source_work_id:probe.work_ids[1],
   question:'Find independent features of the second Work without treating an overlapping word as mechanism'},
  {choice_id:'countertest',source_work_id:probe.work_ids[0],
   question:probe.elected_motif?
    'Ablating the actual selected common term dissolves that token relation. Which original formal operators and boundary conditions could distinguish mechanism from generic shared language?':
    'No registered shared candidate survived the lexical screen. What different documented Work pair or human source span could test this hypothesis?'},
  {choice_id:'question',source_work_id:probe.work_ids[1],
   question:'Which field-generic null, held-out independent witness, identity split and chronology control must be registered before interpreting this?' },
  {choice_id:'source',source_work_id:probe.work_ids[0],
   question:'Reinspect the original source and preserve the unresolved evidentiary and human identity boundaries'}
 ];
 const first=start.result.opening_turn;
 stages.push({kind:'MAESTRO_OPENING',read_receipts:(first.observed_reads||[]).filter(x=>x.status==='OBSERVED_READ_ONLY').length});
 for(const [i,p]of proposed.entries()){
  const actual=await session.choose(p);
  need(actual.status==='SUPPORTED'&&actual.result?.narrative?.role==='MAESTRO'&&
   actual.result.narrative.selection_execution_boundary.selection_is_not_read_receipt===true,
   'HELD_EM_HOSTILE_MAESTRO_SOURCE_SELECTION');
  stages.push({kind:'MAESTRO_OPERATOR_SIMULATION_'+(i+1),
   choice:p.choice_id,selected_work_id:p.source_work_id,
   question_sha256:hash(p.question),
   observed_read_only_catalogue_receipts:(actual.result.narrative.observed_reads||[])
    .filter(x=>x.status==='OBSERVED_READ_ONLY'&&x.intent==='vixen.work.inspect').length,
   question_changed_by_computation:i===2||i===3,
   human_tasks_unperformed:true});
 }
 const status=session.status();
 need(status.status==='SUPPORTED'&&status.result.history_length===5&&
  status.result.quest_reports.length===0&&
  status.result.program_notes_permission==='NOT_REQUESTED',
  'HELD_EM_HOSTILE_MAESTRO_HUMAN_ACTION_FORGERY');
 const result=session.finish();need(result.status==='SUPPORTED','HELD_EM_HOSTILE_MAESTRO_FINISH');
 return {role:'MAESTRO',simulation_stage_count:stages.length,stages,
  operator_input_kind:'DECLARED_SCRIPTED_SIMULATION_RESPONSIVE_TO_ACTUAL_MOTIF_RESULT',
  participant_interview_or_human_clicks_witnessed:false,
  human_source_reports:0,program_notes_approvals:0,
  cart_mutations:0,original_archive_modifications:0};
}
export async function runEmHostileMaestroQualification({repoRoot=ROOT,work_ids=DEFAULT_PAIR}={}){
 need(resolve(repoRoot)===ROOT,'HELD_EM_HOSTILE_REPO_ROOT');
 const corpus=actualCorpus();
 const adapters=await createPodiumNativeReadAdapters({repoRoot:ROOT});
 const podium=createVixenPodium({corpus,operatorAuthorized:true,engineAdapters:adapters});
 const response=await podium.dispatch({schema:PODIUM_SCHEMA,intent:'engine.invoke',
  params:{engine:'EM_ATELIER',operation:'em_hostile_method_expedition',payload:{work_ids}}});
 need(response.status==='HELD'&&response.result?.state==='UNVERIFIED_ENGINE_ADAPTER_RETURN',
  'HELD_EM_HOSTILE_PODIUM_OPERATOR_AUTHORITY');
 const probe=response.result.output;
 need(probe?.schema==='td613.vixen.em-hostile-host-probe/v1'&&probe.scientific_credit===0,
  'HELD_EM_HOSTILE_PROBE_NOT_EXECUTED');
 const narrative=await runMaestroNarrative(probe);
 let stages=[];
 stages.push(makeStage(null,'SOURCE_CUSTODY_AND_NATIVE_METHOD',{
  work_ids,source_refs:probe.source_refs,identity_partition_count:probe.source_identity_partition_count,
  identity_interval:probe.source_identity_ambiguous_work_interval,
  eight_human_gates_unresolved:true,maestro_opened:true}));
 stages.push(makeStage(stages.at(-1),'BOUNDED_MOTIF_FROM_VERIFIED_BYTES',{
  elected_motif:probe.elected_motif,source_span_locators:probe.native_firewall?.exact_source_locators||[],
  baseline_classification:probe.native_firewall?.baseline_source_verified_classification||'NO_MOTIF',
  native_method_sha256:probe.native_motif_firewall_sha256,
  initial_hypothesis:probe.decision.initial,
  field_generic_alternative:'SHARED_LEXICON_WITHOUT_STRUCTURAL_OR_CAUSAL_TRANSMISSION'}));
 stages.push(makeStage(stages.at(-1),'ADVERSARIAL_MOTIF_WITHDRAWAL',{
  control:probe.adversarial_control,
  source_digest_tamper_rejected:probe.native_firewall?.source_digest_tamper_rejected||null,
  swapped_source_key_rejected:probe.native_firewall?.swapped_source_key_rejected||null,
  hypothetical_structural_form_not_source_inferred:true,
  revised_hypothesis:probe.decision.after_adverse_control}));
 stages.push(makeStage(stages.at(-1),'EVIDENCE_RESPONSIVE_MAESTRO_CHOICE',{
  selected_next_task:probe.decision.resulting_action,
  source_annotation_task_status:'PROPOSED_NOT_EXECUTED',
  negative_control_human_visit_status:'UNPERFORMED',
  actual_human_report_witnessed:false,
  trace_only_programmed_path_source:narrative.operator_input_kind,
  simulated_visit_count:5}));
 stages.push(makeStage(stages.at(-1),'HUMAN_GATE_AND_SCIENTIFIC_REST',{
  conclusion:'MECHANISM_LINEAGE_OR_EMERGENCE_UNEARNED',
  original_native_scientific_classification:'HELD_UNPROVEN',
  missing_independent_causal_mechanism_witness:true,
  original_human_identity_gates_resolved:false,
  independent_exogenous_empirical_witness:false}));
 const receipt={schema:'td613.vixen.em-hostile-maestro-qualification/v1',
  classification:'READONLY_HOST_SIMULATED_MAESTRO_CONDITIONAL_ON_REAL_SOURCE_EVIDENCE',
  source_probe_sha256:probe.receipt_sha256,probe,maestro:narrative,stages,
  archival_source_checkout_scope:'UNMODIFIED_PREVIOUS_PINNED_SOURCE_WITNESS',
  em_original_author_executable_authenticated:false,
  science:0,independent_empirical_credit:0,
  external_historical_replication:false,
  full_native_method_parity:'HELD_UNPROVEN',
  human_reports:0,production_released:false,
  original_td613_operahouse_equals_performer:false,
  human_closure_required:true};
 return {...receipt,receipt_sha256:hash(receipt)};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  if(process.argv.length!==2)throw Error('HELD_EM_HOSTILE_NO_UNTRUSTED_CLI_ARGUMENTS');
  const r=await runEmHostileMaestroQualification();
  process.stdout.write(JSON.stringify(r)+'\n');
 }catch(error){process.stderr.write(JSON.stringify({state:'HELD',reason:String(error?.stack||error).slice(0,950)})+'\n');process.exitCode=2}
}
