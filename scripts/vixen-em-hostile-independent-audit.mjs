#!/usr/bin/env node
/** Separate-code re-execution and hostile receipt audit for the bounded Em
 * Hostile-Method Expedition. This is NOT external human or exogenous review.
 */
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {prepareVixenEmNativeInput,executeVixenEmOriginalControlPacket}
 from './vixen-em-native-work-transfer.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const sha=x=>createHash('sha256').update(x).digest('hex');
const hashed=x=>sha(JSON.stringify(x));
const requireClaim=(yes,code)=>{if(!yes)throw Error(code)};
const wordPattern=/\b[a-z][a-z0-9]{3,22}\b/gi;
const excluded=new Set(('about after again also been being both could each from have into just '+
 'like more most other over same some such than that their them then there these those '+
 'through under used using were what when where which while with would your this '+
 'here also even once upon does only very will shall into onto does has have').split(/\s+/));
const history=Object.freeze(['SOURCE_CUSTODY_AND_NATIVE_METHOD','BOUNDED_MOTIF_FROM_VERIFIED_BYTES',
 'ADVERSARIAL_MOTIF_WITHDRAWAL','EVIDENCE_RESPONSIVE_MAESTRO_CHOICE','HUMAN_GATE_AND_SCIENTIFIC_REST']);
function enumerate(source){
 const map=new Map();
 for(const match of source.matchAll(wordPattern)){
  const word=match[0].toLowerCase();
  if(!excluded.has(word))map.set(word,(map.get(word)||0)+1);
 }
 return map;
}
function select(a,b){
 const ma=enumerate(a),mb=enumerate(b);
 const common=[...ma.keys()].filter(t=>mb.has(t)&&!/[0-9]/.test(t));
 common.sort((a,b)=>{
  const score=t=>10*Math.min(ma.get(t),mb.get(t))+Math.log(1+ma.get(t)+mb.get(t));
  return score(b)-score(a)||a.localeCompare(b);
 });
 return {token:common[0]||null,
  vocabA:ma.size,vocabB:mb.size,shared:common.length,
  freqA:common.length?ma.get(common[0]):0,
  freqB:common.length?mb.get(common[0]):0};
}
function verifyTrace(stages,probe){
 requireClaim(Array.isArray(stages)&&stages.length===5,'HELD_EM_AUDIT_STAGES_MISSING');
 let previous=null;
 for(let i=0;i<stages.length;i++){
  const step=stages[i],{stage_sha256,...payload}=step;
  requireClaim(step.kind===history[i]&&step.previous_sha256===previous&&
   step.scientific_credit===0&&step.human_closure_required===true,
   'HELD_EM_AUDIT_TRACE_ORDER_OR_AUTHORITY');
  requireClaim(stage_sha256===hashed(payload),'HELD_EM_AUDIT_TRACE_DIGEST');
  previous=stage_sha256;
 }
 requireClaim(stages[0].identity_partition_count===256&&
  JSON.stringify(stages[0].source_refs)===JSON.stringify(probe.source_refs)&&
  stages[0].eight_human_gates_unresolved===true,
  'HELD_EM_AUDIT_SOURCE_INTRODUCTION');
 requireClaim(stages[1].elected_motif===probe.elected_motif&&
  stages[1].native_method_sha256===probe.native_motif_firewall_sha256&&
  stages[1].initial_hypothesis===probe.decision.initial&&
  JSON.stringify(stages[1].source_span_locators)===
   JSON.stringify(probe.native_firewall?.exact_source_locators||[]),
  'HELD_EM_AUDIT_MOTIF_INFERENCE_DRIFT');
 requireClaim(JSON.stringify(stages[2].control)===
  JSON.stringify(probe.adversarial_control)&&
  stages[2].revised_hypothesis===probe.decision.after_adverse_control&&
  stages[2].hypothetical_structural_form_not_source_inferred===true,
  'HELD_EM_AUDIT_HOSTILE_CONTROL_REWRITTEN');
 requireClaim(stages[3].selected_next_task===probe.decision.resulting_action&&
  stages[3].source_annotation_task_status==='PROPOSED_NOT_EXECUTED'&&
  stages[3].actual_human_report_witnessed===false&&
  stages[3].simulated_visit_count===5,
  'HELD_EM_AUDIT_FAKE_HUMAN_FIELD_WORK');
 requireClaim(stages[4].conclusion==='MECHANISM_LINEAGE_OR_EMERGENCE_UNEARNED'&&
  stages[4].independent_exogenous_empirical_witness===false&&
  stages[4].original_human_identity_gates_resolved===false,
  'HELD_EM_AUDIT_FALSE_SCIENTIFIC_CLOSURE');
 return previous;
}
function verifyMaestro(m,workIDs){
 requireClaim(m?.role==='MAESTRO'&&m.simulation_stage_count===6&&
  m.stages?.length===6&&m.human_source_reports===0&&
  m.participant_interview_or_human_clicks_witnessed===false&&
  m.program_notes_approvals===0&&m.cart_mutations===0&&
  m.original_archive_modifications===0&&
  m.operator_input_kind==='DECLARED_SCRIPTED_SIMULATION_RESPONSIVE_TO_ACTUAL_MOTIF_RESULT',
  'HELD_EM_AUDIT_MAESTRO_HUMAN_PRETENSE');
 const labels=['MAESTRO_OPENING','MAESTRO_OPERATOR_SIMULATION_1','MAESTRO_OPERATOR_SIMULATION_2',
  'MAESTRO_OPERATOR_SIMULATION_3','MAESTRO_OPERATOR_SIMULATION_4',
  'MAESTRO_OPERATOR_SIMULATION_5'];
 requireClaim(m.stages.map(x=>x.kind).join('|')===labels.join('|')&&
  m.stages.slice(1).map(x=>x.choice).join('|')==='source|compare|countertest|question|source'&&
  m.stages.slice(1).every((x,i)=>x.selected_work_id===workIDs[[0,1,0,1,0][i]]&&
   x.human_tasks_unperformed===true&&/^[0-9a-f]{64}$/.test(x.question_sha256)),
  'HELD_EM_AUDIT_MAESTRO_FABRICATED_SCRIPT');
 return 5;
}
function originalMethodHash(){
 return sha(readFileSync(resolve(ROOT,
  'packages/dome_world_exact/fixtures/a15-r0/EMSTD613/99-ADMIN/em-motif-mechanism-control-v1.py')));
}
function rerunOriginalPython(input,token,locators){
 const python=process.env.TD613_NATIVE_PYTHON||(process.platform==='win32'?'python':'python3');
 const script=resolve(ROOT,'scripts/vixen-em-hostile-native-firewall.py');
 try{
  return JSON.parse(execFileSync(python,[script],{cwd:ROOT,
   input:JSON.stringify({schema:'td613.vixen.em-hostile-python-input/v1',
    packet:input,candidate:{token,locators}}),encoding:'utf8',
   timeout:25000,maxBuffer:1024*1024,
   env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PYTHONUTF8:'1'}}));
 }catch(e){throw Error('HELD_EM_AUDIT_SOURCE_OR_NATIVE_REFUSAL');}
}
export async function auditEmHostileMaestroReceipt(receipt,{repoRoot=ROOT}={}){
 requireClaim(resolve(repoRoot)===ROOT,'HELD_EM_AUDIT_ONLY_REGISTERED_REPO');
 requireClaim(receipt?.schema==='td613.vixen.em-hostile-maestro-qualification/v1',
  'HELD_EM_AUDIT_RECEIPT_SCHEMA');
 const {receipt_sha256,...envelope}=receipt;
 requireClaim(receipt_sha256===hashed(envelope),'HELD_EM_AUDIT_ENVELOPE_DIGEST');
 requireClaim(receipt.science===0&&receipt.independent_empirical_credit===0&&
  receipt.external_historical_replication===false&&receipt.human_reports===0&&
  receipt.full_native_method_parity==='HELD_UNPROVEN'&&
  receipt.human_closure_required===true&&receipt.production_released===false,
  'HELD_EM_AUDIT_CLAIM_OR_AUTHORITY_ESCALATED');
 const p=receipt.probe;
 requireClaim(p?.schema==='td613.vixen.em-hostile-host-probe/v1'&&
  p.scientific_credit===0&&p.external_scientific_credit===0&&
  p.source_excerpts_or_full_manuscript_copied_to_receipt===false&&
  p.documentary_protocols_automatically_executed===0&&
  p.human_identity_gates_resolved===false&&
  p.full_original_method_parity==='HELD_UNPROVEN',
  'HELD_EM_AUDIT_PROBE_CLAIM_PROMOTED');
 const {receipt_sha256:pd,...bare}=p;
 requireClaim(pd===hashed(bare)&&receipt.source_probe_sha256===pd,
  'HELD_EM_AUDIT_RE_SIGNED_PROBE_DIGEST');
 const input=await prepareVixenEmNativeInput({repoRoot,work_ids:p.work_ids});
 const original=executeVixenEmOriginalControlPacket(input,{repoRoot});
 requireClaim(original.identity_sensitivity.partition_count===256&&
  original.identity_sensitivity.work_count_lower===32&&
  original.identity_sensitivity.work_count_upper===40&&
  original.identity_sensitivity.threshold_classification==='IDENTITY_SENSITIVE_OR_EVIDENCE_UNRESOLVED'&&
  original.human_gated_work_count===8&&
  p.source_identity_partition_count===256&&
  p.source_identity_human_gates_unresolved===8,
  'HELD_EM_AUDIT_IDENTITY_SENSITIVITY');
 requireClaim(input.selected.length===2&&
  JSON.stringify(input.selected.map(x=>({
   work_id:x.work_id,source_file_id:x.source_file_id,
   declared_original_source_sha256:x.declared_original_source_sha256,
   derivative_sha256:x.verified_derivative_sha256,
   source_text_body_in_public_receipt:false})))===JSON.stringify(p.source_refs),
  'HELD_EM_AUDIT_SOURCE_GENEALOGY_OR_DERIVATIVE_SHA');
 const observed=select(input.selected[0].body,input.selected[1].body);
 requireClaim(p.elected_motif===observed.token&&
  p.candidate_stats.shared_lexical_terms===observed.shared&&
  p.candidate_stats.vocabularyA===observed.vocabA&&
  p.candidate_stats.vocabularyB===observed.vocabB&&
  p.candidate_stats.sourceA_occurrences===observed.freqA&&
  p.candidate_stats.sourceB_occurrences===observed.freqB,
  'HELD_EM_AUDIT_COMPUTATIONAL_CANDIDATE_REWRITTEN');
 requireClaim(p.native_motif_firewall_sha256===originalMethodHash(),
  'HELD_EM_AUDIT_ORIGINAL_NATIVE_CODE_CHANGED');
 if(observed.token){
  const locators=p.native_firewall?.exact_source_locators;
  requireClaim(Array.isArray(locators)&&locators.length===2,
   'HELD_EM_AUDIT_SOURCE_SPANS_MISSING');
  for(let i=0;i<2;i++){
   const source=input.selected[i], locator=locators[i];
   const raw=Buffer.from(source.body,'utf8'),start=locator.byte_offset,
    len=locator.length_utf8;
   requireClaim(locator.source_id===source.source_file_id&&
    locator.sha256===source.verified_derivative_sha256&&
    sha(raw.subarray(start,start+len))===locator.span_sha256&&
    raw.subarray(start,start+len).toString('utf8').toLowerCase()===observed.token,
    'HELD_EM_AUDIT_SOURCE_SPAN_BYTE_MISMATCH');
  }
  const native=rerunOriginalPython(input,observed.token,locators);
  requireClaim(JSON.stringify(native)===JSON.stringify(p.native_firewall)&&
   native.original_method_mechanism_supported===false&&
   native.synthetic_structural_form_classification==='STRUCTURAL_ANALOGY_CANDIDATE'&&
   native.synthetic_structural_fields_not_validated_against_text===true,
   'HELD_EM_AUDIT_FABRICATED_NATIVE_MECHANISM');
  const m=new RegExp('\\b'+observed.token+'\\b','gi');
  const altered=input.selected[1].body.replace(m,' ');
  requireClaim(p.adversarial_control.sourceB_ephemeral_ablation_digest===sha(altered)&&
   p.adversarial_control.ablated_sourceB_term_count===0&&
   p.adversarial_control.sourceB_token_withdrawal_actual_count===observed.freqB&&
   p.adversarial_control.changed_original_or_corpus_bytes===false&&
   p.adversarial_control.field_generic_null_excluded===false,
   'HELD_EM_AUDIT_ADVERSARIAL_ABLATION_FORGERY');
  requireClaim(p.decision.initial==='MOTIF_MATCH_SOURCE_LOCALIZED_NOT_MECHANISM'&&
   p.decision.after_adverse_control==='FRAGILE_LEXICAL_PAIR_WITH_HELD_MECHANISM'&&
   p.decision.resulting_action==='REQUEST_TWO_VERIFIED_SOURCE_MAPPINGS_FOR_OPERATORS_BOUNDARIES_AND_PREDICTIONS_PLUS_FIELD_GENERIC_COMPARATOR',
   'HELD_EM_AUDIT_HYPOTHESIS_NOT_REVISED_FROM_SOURCE');
 }else{
  requireClaim(p.native_firewall===null&&
   p.decision.after_adverse_control==='NO_RELATION_EARNED'&&
   p.adversarial_control.shared_candidate_found===false,
   'HELD_EM_AUDIT_UNEARNED_SHARED_MOTIF');
 }
 const traceLast=verifyTrace(receipt.stages,p);
 const decisions=verifyMaestro(receipt.maestro,p.work_ids);
 return {schema:'td613.vixen.em-hostile-method-independent-audit/v1',
  state:'REEXECUTED_SOURCE_CUSTODY_AND_NATIVE_CONTROL_HUMAN_EVIDENCE_HELD',
  target_receipt_sha256:receipt_sha256,
  original_method_sha256:originalMethodHash(),
  original_reviewer_mechanism_claim:'HELD',
  source_pair_sha256:p.source_refs.map(x=>x.derivative_sha256),
  original_td613_native_firewall_reexecuted:true,
  two_real_derivative_bytes_rehashed:true,
  source_motif_locators_reverified:observed.token?2:0,
  adversarial_term_withdrawal_recomputed:!!observed.token,
  exact_prefix_receipts_qualified:5,
  terminal_stage_sha256:traceLast,
  simulated_maestro_turns:decisions,actual_human_interactions:0,
  independent_audit_scope:'SEPARATE_CODE_AND_NATIVE_REEXECUTION_ON_SHARED_LOCAL_ARCHIVE_NOT_EXOGENOUS_WITNESS',
  external_witness_observed:false,scientific_credit:0,
  original_method_parity:'HELD_UNPROVEN',
  operator_publication_authority:false,
  human_closure_required:true};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  if(process.argv.length!==2)throw Error('HELD_EM_AUDIT_NO_UNTRUSTED_ARGS');
  const {runEmHostileMaestroQualification}=await import('./vixen-em-hostile-method-expedition.mjs');
  const receipt=await runEmHostileMaestroQualification();
  process.stdout.write(JSON.stringify(await auditEmHostileMaestroReceipt(receipt))+'\n');
 }catch(error){
  process.stderr.write(JSON.stringify({status:'HELD',reason:String(error?.stack||error).slice(0,950)})+'\n');
  process.exitCode=2;
 }
}
