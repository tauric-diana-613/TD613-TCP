/**
 * TD613 Experiment B · prospective SCIENTIFIC schedule conformance, source-free.
 *
 * Strict PRE-ADMISSION guard for the complete blinded Em design. This is a
 * structural requirement distinct from the resumable engine's three-document
 * synthetic regression. It does NOT attest original corpus bytes, source
 * rights, evidence masks, provider model, spending or external acceptance.
 *
 * One factorial cell per (evidence authenticity × representation), two
 * counterbalanced forward/reversed orders; the runner applies 2A and 2B
 * inside each lane, so this is eight schedule lanes / sixteen reasoner cells,
 * NOT sixteen independent source episodes.
 */
import { validatePlan, ARMS, rounds } from './engine.mjs';
const need=(v,msg)=>{if(!v)throw Object.assign(Error(msg),{code:msg})};
const arms=Object.freeze(['ARM_0_TRANSPORT','ARM_1_ARCHIVAL',
 'ARM_2A_MODULAR','ARM_2B_MATCHED_UNION']);
const cells=Object.freeze({
 A:{evidence:'AUTHENTIC',representation:'NEUTRAL'},
 B:{evidence:'AUTHENTIC',representation:'DOLLHOUSE'},
 C:{evidence:'NEGATIVE_CONTROL',representation:'NEUTRAL'},
 D:{evidence:'NEGATIVE_CONTROL',representation:'DOLLHOUSE'}
});
const orders=Object.freeze(['FORWARD','REVERSED']);
const dimensions=Object.freeze([
 'INTELLECTUAL_RELATIONSHIPS',
 'CONTRADICTIONS_CHRONOLOGY_REVISION_PRESERVATION',
 'ALTERNATIVE_MATHEMATICS_FALSIFICATION',
 'NEW_METHODS_RECONSTRUCTION_QUESTIONS',
 'ORDER_HOLDOUT_WITHDRAWAL_FALSE_TWINS',
 'AUTHORSHIP_PROVENANCE_THREE_LINEAGES',
 'SURPLUS_OVER_STRONG_MATCHED_UNION'
]);
const recordKeys=Object.freeze(['evidence','presentation','adjudication']);
const id=(cell,order)=>cell+'_'+order;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function preparedLineage(lineage){
 return lineage&&recordKeys.every(k=>typeof lineage[k]==='string'&&lineage[k].trim().length>3)&&
  new Set(recordKeys.map(k=>lineage[k])).size===3;
}
function ensureNoRealSourcePayloads(c){
 need(c&&typeof c==='object'&&!('rawSource' in c)&&!('privateBytes' in c)&&
  !('privateKey' in c)&&!('sourceBodies' in c),'FREEZE_MUST_NOT_CONTAIN_PROTECTED_SOURCE_PAYLOAD');
}
export function inspectSourceFreeScientificFreeze(plan,scientific){
 validatePlan(plan);
 need(scientific&&scientific.schema==='td613.experiment-b.scientific-freeze-candidate/v1'&&
  scientific.sourceClass==='BLINDED_CHALLENGE_ARCHIVE_EM'&&
  Number.isInteger(scientific.sourceCount)&&scientific.sourceCount>=20&&scientific.sourceCount<=24,
  'FULL_EM_BLINDED_CORPUS_SCOPE_REQUIRED');
 ensureNoRealSourcePayloads(scientific);
 need(same(scientific.arms,arms),'ALL_FOUR_DISTINCT_ARMS_REQUIRED');
 need(same(scientific.dimensions,dimensions),'SEVEN_PROSPECTIVE_DIMENSIONS_REQUIRED');
 need(scientific.RCA01?.factorial==='AUTHENTIC_VS_NEGATIVE_BY_NEUTRAL_VS_DOLLHOUSE'&&
  scientific.RCA01?.discoveryClaim !== 'PREDETERMINED_POSITIVE'&&
  scientific.unknownDiscoveryBothReasoners===true&&
  scientific.threeLineagesSeparate===true,
  'RCA01_UNANTICIPATED_AND_THREE_LINEAGES_REQUIRED');
 need(scientific.comparator?.rawUnionAccess==='FULL_AUTHORIZED_SOURCE_PREFIX'&&
  scientific.comparator?.modularSecondStageRawAccess==='DENIED'&&
  scientific.comparator?.sameRequestedModelEffort===true&&
  scientific.comparator?.equalDeterministicTools===true&&
  scientific.comparator?.equalMeaningfulCallsPerDocument===2&&
  scientific.comparator?.baselinePerReasoner===1&&
  scientific.comparator?.synthesisPerReasoner===1,
  'STRONG_UNWEAKENED_UNION_AND_MATCHED_OPPORTUNITY_REQUIRED');
 need(plan.lanes.length===8&&new Set(plan.lanes.map(l=>l.id)).size===8,
  'EIGHT_FACTORIAL_ORDER_LANES_REQUIRED');
 need(typeof scientific.analysis?.estimand==='string'&&scientific.analysis.estimand.length>15&&
  typeof scientific.analysis?.missingnessRule==='string'&&scientific.analysis.missingnessRule.length>10&&
  typeof scientific.analysis?.multipleTestingRule==='string'&&scientific.analysis.multipleTestingRule.length>10&&
  typeof scientific.analysis?.stoppingRule==='string'&&scientific.analysis.stoppingRule.length>10&&
  scientific.analysis?.scoringBeforeUnblinding===true,
  'FROZEN_ANALYSIS_CANDIDATE_REQUIRED');
 const byId=new Map(plan.lanes.map(l=>[l.id,l]));
 const seenByEvidence={AUTHENTIC:new Set(),NEGATIVE_CONTROL:new Set()};
 for(const [cell,meaning] of Object.entries(cells)){
  for(const order of orders){
   const l=byId.get(id(cell,order));
   need(l&&l.factors?.evidence===meaning.evidence&&
    l.factors?.representation===meaning.representation&&l.factors?.order===order,
    'RCA01_CELL_OR_ORDER_BINDING_MISSING');
   need(preparedLineage(l.custodyLineage),'EVIDENCE_PRESENTATION_ADJUDICATION_LINEAGES_REQUIRED');
   need(l.sourceOrder.length===scientific.sourceCount &&
    l.sourceOrder.every(x=>typeof x==='string'&&/^FIXTURE-[A-Z0-9_-]{3,60}$/.test(x)),
    'SOURCE_FREE_OPAQUE_EXACT_CORPUS_COUNT_REQUIRED');
   need(rounds(l).length===2*scientific.sourceCount+2,
    'TWO_MEANINGFUL_CALL_ROUNDS_PER_SOURCE_REQUIRED');
  }
  const forward=byId.get(id(cell,'FORWARD')).sourceOrder;
  const reverse=byId.get(id(cell,'REVERSED')).sourceOrder;
  need(same([...forward].reverse(),reverse),'PROSPECTIVE_REVERSE_ORDER_MISMATCH');
  if(meaning.representation==='NEUTRAL')for(const x of forward)seenByEvidence[meaning.evidence].add(x);
 }
 for(const order of orders){
  need(same(byId.get(id('A',order)).sourceOrder,byId.get(id('B',order)).sourceOrder),
   'AUTHENTIC_NEUTRAL_DOLLHOUSE_SOURCE_MISMATCH');
  need(same(byId.get(id('C',order)).sourceOrder,byId.get(id('D',order)).sourceOrder),
   'NEGATIVE_NEUTRAL_DOLLHOUSE_SOURCE_MISMATCH');
 }
 need([...seenByEvidence.AUTHENTIC].every(x=>!seenByEvidence.NEGATIVE_CONTROL.has(x)),
  'AUTHENTIC_NEGATIVE_CONTROL_SOURCE_ALIAS_COLLISION');
 need(typeof scientific.researchEpisode==='string'&&scientific.researchEpisode.startsWith('SYNTHETIC-')&&
  scientific.realArchiveOpened===false&&scientific.sourceAdmissionGranted===false&&
  scientific.externalEvaluatorAccepted===false&&scientific.d20Granted===false,
  'SOURCE_FREE_BOUNDED_AUTHORITY_ONLY');
 need(scientific.unblinding==='AFTER_INDEPENDENT_FROZEN_SCORE'&&
  scientific.baselineOriginalCompilerRequired===true&&
  scientific.strongUnionCandidateParityRequired===true,
  'CONTROL_AND_UNBLINDING_CONTRACT_REQUIRED');
 return Object.freeze({
  schema:'td613.experiment-b.sourcefree-scientific-conformance/v1',
  outcome:'FULL_DESIGN_STRUCTURALLY_PREPARED_SOURCE_FREE_ONLY',
  numbered_arm_count:arms.length,paired_reasoning_architectures:[...ARMS],
  four_factorial_cells:['A','B','C','D'],
  scheduled_source_order_lanes:8,reasoner_condition_cells:8*ARMS.length,
  source_count_declared:scientific.sourceCount,
  per_reasoner_turns_per_lane:2*scientific.sourceCount+2,
  source_free_fixture_only:true,real_corpus_bytes_read:0,
  external_source_identity_attested:false,served_model_attested:false,
  external_evaluator_accepted:false,scientific_power_earned:false,
  inference_calls_executed:0,model_spending_authorized:false,
  human_d01_d19_acceptance:'HELD',
  d20_protected_flight:'HELD',
  note:'This guard checks a prospective SCIENTIFIC schedule; native engine conformance, actual source admission, privacy, power and independent acceptance remain separate.'
 });
}
export const fullDesignConstants=Object.freeze({
 arms,dimensions,cells,orders,expectedScheduleLanes:8});
