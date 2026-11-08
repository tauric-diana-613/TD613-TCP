/**
 * 𝌋 Operator Disclosure — read-only, full-known-information rendering.
 * Produces a complete machine report and Light/Medium/Heavy views of the same
 * packet+review. No packet field is silently removed and no authority granted.
 */
import {createHash} from 'node:crypto';
const sha=value=>createHash('sha256').update(value).digest('hex');
const scalar=x=>typeof x==='string'?x:JSON.stringify(x);
const pack=x=>JSON.stringify(x,null,2);
const escapeCell=x=>scalar(x??'UNKNOWN').replaceAll('|','\\|').replace(/\r?\n/g,' ⏎ ');
function fence(text){const runs=text.match(/~+/g)||[];const max=Math.max(3,...runs.map(x=>x.length));return '~'.repeat(max+1);}
const block=(tag,object)=>{const value=pack(object),f=fence(value);return f+tag+'\n'+value+'\n'+f;};
const universe={
 status:'NO_CANONICAL_SOURCE_MUTATION',
 exact_integration_diff:'NO_EXACT_INTEGRATION_DIFF_AVAILABLE',
 known_targets:'Existing rule, crossing, and queue anchors listed per proposal only; no actual future patch presently specified.',
 unspecified_future_targets:'UNRESOLVED_PENDING_CANDIDATE_IMPLEMENTATION',
 adoption_authority:false,
 staged_synthesis_requires_contemporaneous_human_decision:true,
 authorization_to_stage_is_not_authorization_to_adopt:true,
 release_or_experiment_b_authority:false,
 human_identity_authenticated_by_this_report:false
};
export function buildOperatorDisclosure(packet,review){
 if(!packet||!review||packet.packet_id!==review.packet_id)throw Object.assign(new Error('Packet-review mismatch'),{code:'DISCLOSURE_PACKET_REVIEW_MISMATCH'});
 const rawPacketFingerprint=sha(JSON.stringify(packet));
 if(rawPacketFingerprint!==review.packet_sha256)throw Object.assign(new Error('Packet fingerprint differs from review'),{code:'DISCLOSURE_PACKET_DIGEST_MISMATCH'});
 const originalIds=packet.proposals.map(p=>p.id);
 const staged=review.as_source_free?.proposals||[];
 const stagedIds=staged.map(p=>p.branch_id.split(':').slice(-1)[0]);
 if(originalIds.length!==stagedIds.length||originalIds.some((id,i)=>id!==stagedIds[i]))
  throw Object.assign(new Error('Proposal enumeration mismatch'),{code:'DISCLOSURE_PROPOSAL_ENUMERATION_MISMATCH'});
 const proposals=packet.proposals.map((p,i)=>{
  const r=staged[i];
  const execution=r.declared_finite_experiment||{status:'UNEXECUTED'};
  return {
   index:i+1,id:p.id,kind:p.kind,label:p.label||p.id,
   request:hypothesis(p),anchors:p.anchors||{},
   source_class:p.evidence?.source_class??'NOT_DECLARED',source_refs:p.evidence?.source_refs??[],
   observation_status:p.evidence?.observation_status??'NOT_DECLARED',
   independent_replication:p.evidence?.independent_replication===true,
   stated_current_evidence_ceiling:p.uncertainty?.claim_ceiling??'UNSPECIFIED',
   predicted_consequence:p.consequence??'UNSPECIFIED',prediction:p.prediction??'UNSPECIFIED',
   proposed_relation:p.relation??null,proposed_projection:p.projection??null,
   proposed_geometry:p.geometry??null,proposed_rewrite:p.nks??null,
   falsifier:p.controls?.falsifier??'UNSPECIFIED',
   competent_null:p.controls?.competent_null??'UNSPECIFIED',
   negative_control:p.controls?.negative_control??'UNSPECIFIED',
   source_free_experiment:execution,
   counterfactual_branches:r.counterfactual_branches??[],
   unresolved_refs:r.diagnostic?.unresolved_references??[],
   deficiencies:r.diagnostic?.deficiencies??[],
   duplicate_gate:r.diagnostic?.duplicates??{status:'NOT_SCANNED',matches:[]},
   unknown_effects:['EXACT_PATCH_UNAVAILABLE','EXTERNAL_SOURCE_ORIGIN_UNVERIFIED','FUTURE_INTEGRATION_TESTS_UNEXECUTED'],
   affected_files_known:[],
   committed_change_proposed:false,
   human_permission_received:false
  };
 });
 const missing=review.as_source_free?.issues||[];
 const stateCounts=proposals.reduce((a,p)=>{const key=p.source_free_experiment?.scope||'NOT_RUN';a[key]=(a[key]||0)+1;return a;},{});
 const body={
  schema:'td613.rulefield.operator-pre-synthesis-disclosure/v1',
  packet_id:packet.packet_id,
  packet_sha256:rawPacketFingerprint,
  baseline_registry_sha256:review.baseline_registry_sha256,
  receiver_disposition:review.disposition,
  review_schema:review.schema,
  human_review_requested:true,
  human_authorization_received:false,
  final_scientific_closure:'RESERVED',
  scope:'PROSPECTIVE_SOURCE_FREE_STAGING_ONLY',
  proposal_count:proposals.length,
  proposal_ids:originalIds,
  completeness:{all_packet_proposals_enumerated:true,all_packet_proposals_unique:new Set(originalIds).size===originalIds.length,all_packet_json_embedded:true,all_review_json_embedded:true,unknown_extension_fields_retained:true,information_not_currently_observable:'EXPLICIT_UNKNOWN_NOT_DISGUISED_AS_COMPLETE'},
  executive_summary:{what:'Review bounded source-free Rulefield research candidates and decide whether to request separate staged synthesis.',proposal_count:proposals.length,issue_count:missing.length,
   exact_execution_class_counts:stateCounts,protected_experiment_b:'HELD',canonical_registry_mutated:false,exact_merge_patch_available:false},
  effect_and_authority_boundary:universe,
  known_consequences:proposals,
  review_issues:missing,
  duplicate_admission_gate:review.as_source_free?.duplicate_gate??{status:'NOT_SCANNED'},
  global_unknowns:['No future canonical Git diff exists in this report.','Unknown side effects of an unimplemented candidate cannot be guaranteed absent.','Source-independent exterior origin and observer effects require independent evidence.','Machine-written text cannot authenticate operator approval.'],
  complete_input_packet:packet,
  complete_receiver_review:review
 };
 return {...body,disclosure_sha256:sha(JSON.stringify(body))};
}
function hypothesis(p){return p.hypothesis||'UNSPECIFIED';}
export function renderOperatorDisclosure(dossier){
 const p=dossier,lines=[];
 lines.push('# 𝌋 PRE-SYNTHESIS DISCLOSURE & OPERATOR AUTHORIZATION REQUEST','');
 lines.push('**Decision posture:** PENDING HUMAN REVIEW · **All proposals disclosed:** '+p.proposal_count+' · **Human scientific closure:** RESERVED.');
 lines.push('**Content-bound disclosure SHA-256:** '+p.disclosure_sha256);
 lines.push('**Packet SHA-256:** '+p.packet_sha256);
 lines.push('**Baseline registry SHA-256:** '+p.baseline_registry_sha256);
 lines.push('');
 lines.push('## LIGHT · Decision briefing (full record available below)','');
 lines.push('| Question | Answer |','|---|---|');
 const fields=[
  ['What is being proposed?',p.proposal_count+' source-free research proposal(s): '+p.proposal_ids.join(', ')],
  ['What did the receiver conclude?',p.receiver_disposition],
  ['What actually ran?',JSON.stringify(p.executive_summary.exact_execution_class_counts)],
  ['What is still unresolved?',p.review_issues.length+' issue group(s); see Medium and Heavy below'],
  ['Prior-entry duplicate gate?',p.duplicate_admission_gate.status+'; see matched IDs and text in Medium'],
  ['What code would change on approval?', 'NONE. Candidate implementation requires a separately authorized future action.'],
  ['Is an exact merge patch shown?',p.effect_and_authority_boundary.exact_integration_diff],
  ['Does this authorize canonical adoption?', 'NO · CURRENT RECEIVER HAS ZERO ADOPTION AUTHORITY'],
  ['Protected Experiment B?', 'HELD'],
  ['Human request?','Choose proposal IDs and whether to request ONLY staged candidate synthesis after complete review']
 ];
 for(const [a,b] of fields)lines.push('| '+escapeCell(a)+' | '+escapeCell(b)+' |');
 lines.push('','### Disclosed limitations and non-assumptions','');
 for(const u of p.global_unknowns)lines.push('- '+u);
 lines.push('','## MEDIUM · All candidate consequences, independent of prettiness','');
 for(const a of p.known_consequences){
  lines.push('### '+a.index+'. '+a.id+' — '+a.kind,'',a.request,'');
  const rows=[
   ['Anchored rules/crossings/queue',a.anchors],
   ['Original source references',a.source_refs],
   ['Source class / observation',a.source_class+' / '+a.observation_status],
   ['Proposed relation',a.proposed_relation],
   ['Proposed projection',a.proposed_projection],
   ['Proposed geometry',a.proposed_geometry],
   ['Proposed local rewrite',a.proposed_rewrite],
   ['Predicted result',a.prediction],
   ['Consequence if accepted',a.predicted_consequence],
   ['Falsifier',a.falsifier],
   ['Competent information-matched null',a.competent_null],
   ['Negative control',a.negative_control],
   ['Exact finite experimental execution',a.source_free_experiment],
   ['Counterfactual branches retained',a.counterfactual_branches],
   ['Reference ambiguities',a.unresolved_refs],
   ['Existing-entry duplicates and lexical overlaps',a.duplicate_gate],
   ['Specification deficiencies',a.deficiencies],
   ['Scientific claim ceiling',a.stated_current_evidence_ceiling],
   ['Potentially affected repository files',a.affected_files_known],
   ['Known limits of prospective effects',a.unknown_effects]
  ];
  for(const [k,v] of rows){lines.push('**'+k+':** '+JSON.stringify(v));}
  lines.push('');
 }
 lines.push('### All receiver issue groups','',block('json',p.review_issues),'');
 lines.push('## HEAVY · Forensic record: zero intentional information omission','');
 lines.push('### Complete source packet — every recognized and unrecognized field','',block('json',p.complete_input_packet),'');
 lines.push('### Complete independent receiver review — all branches and exact model witnesses','',block('json',p.complete_receiver_review),'');
 lines.push('### Full typed dossier — status, consequences, constraints, risks and binding','',block('json',p),'');
 lines.push('## Operator request: select; do not silently approve','');
 lines.push('Please read the full record or choose a reviewer depth; then personally complete the human decision form or give an explicit current-channel decision identifying this dossier digest and selected proposal IDs.');
 lines.push('**REQUEST_STAGED_SYNTHESIS** requests a future unmerged candidate only; it does not execute code, approve unknown file patches, alter historic I/P/X, modify the 70-rank queue, merge, deploy, or open protected Flight.');
 lines.push('This file records no verified human signature, independent observer evidence, empirical theorem or release permission. The source-bearing authorization event must occur later in a human-controlled channel.');
 lines.push('','𝄐 Khona‌lit-po · Full-known disclosure, explicit unknowns, human closure RESERVED ⟐');
 return lines.join('\n')+'\n';
}
export function validateDisclosure(d){
 if(!d||d.schema!=='td613.rulefield.operator-pre-synthesis-disclosure/v1')return false;
 const {disclosure_sha256,...body}=d;
 return sha(JSON.stringify(body))===disclosure_sha256&&
  d.proposal_ids.length===d.proposal_count&&
  d.complete_input_packet.proposals.length===d.proposal_count&&
  d.complete_receiver_review.packet_sha256===d.packet_sha256&&
  d.effect_and_authority_boundary.adoption_authority===false;
}