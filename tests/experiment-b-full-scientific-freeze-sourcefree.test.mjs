import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectSourceFreeScientificFreeze,fullDesignConstants } from '../scripts/experiment-b-resumable/scientific-freeze-v01.mjs';
import { validatePlan } from '../scripts/experiment-b-resumable/engine.mjs';

const sourceIds=(prefix,n=20)=>Array.from({length:n},(_,i)=>'FIXTURE-'+prefix+'-'+String(i+1).padStart(3,'0'));
const templates=()=>({
 baseline:'Freeze hypothesis before source release.',
 modular1:'Use first chamber only; preserve actual source provenance.',
 modular2:'Evaluate actual first chamber handoffs with no new raw exposure.',
 union1:'Use FULL permitted original source prefix and all permitted checks.',
 union2:'Use FULL permitted source prefix, falsification, revisions and counterfactuals.',
 synthesis:'Record all candidate findings and failures without promotion.'
});
const asLineage=n=>({evidence:'FIXTURE_EVIDENCE_'+n,
 presentation:'FIXTURE_PRESENTATION_'+n,adjudication:'FIXTURE_ADJUDICATION_'+n});
const lane=(cell,order)=>{
 const evidence=['A','B'].includes(cell)?'AUTHENTIC':'NEGATIVE_CONTROL';
 const representation=['A','C'].includes(cell)?'NEUTRAL':'DOLLHOUSE';
 const ids=sourceIds(evidence==='AUTHENTIC'?'AUTH':'CTRL');
 return {id:cell+'_'+order,sourceOrder:order==='REVERSED'?[...ids].reverse():ids,
  factors:{evidence,representation,order},custodyLineage:asLineage(cell+'_'+order),templates:templates()};
};
const plan=()=>({
 experiment:'SYNTHETIC_EM_FULL_DESIGN_CONFORMANCE',episode:'SYNTHETIC_ONLY',
 model:{requested:'SYNTHETIC_MATCHED_MODEL',effort:'SYNTHETIC_MATCHED_EFFORT'},
 runtimeBinding:'SYNTHETIC_RUNTIME_NOT_PROVIDER_ATTESTED',
 context:{inputLimit:500000,outputLimit:4096,tokenizerBinding:'SYNTHETIC_NOT_ACTUAL_PROVIDER_TOKENIZER'},
 protocolBinding:'SYNTHETIC_FROZEN_PROTOCOL_CANDIDATE',
 analysisBinding:'SYNTHETIC_FROZEN_ANALYSIS_CANDIDATE',
 kernelBinding:'SYNTHETIC_SAME_KERNEL_BINDING',
 toolPolicyBinding:'NO_TOOLS',stage2Binding:'UNEXECUTED_INDEPENDENT_EVALUATOR',
 baselineBinding:'ACTUAL_NATIVE_ARCHIVAL_BASELINE_REQUIRED',
 lanes:Object.keys(fullDesignConstants.cells).flatMap(cell=>fullDesignConstants.orders.map(order=>lane(cell,order)))
});
const scientific=()=>({
 schema:'td613.experiment-b.scientific-freeze-candidate/v1',
 sourceClass:'BLINDED_CHALLENGE_ARCHIVE_EM',sourceCount:20,
 arms:[...fullDesignConstants.arms],dimensions:[...fullDesignConstants.dimensions],
 RCA01:{factorial:'AUTHENTIC_VS_NEGATIVE_BY_NEUTRAL_VS_DOLLHOUSE',discoveryClaim:'NOT_PREDETERMINED'},
 unknownDiscoveryBothReasoners:true,threeLineagesSeparate:true,
 comparator:{rawUnionAccess:'FULL_AUTHORIZED_SOURCE_PREFIX',
  modularSecondStageRawAccess:'DENIED',sameRequestedModelEffort:true,
  equalDeterministicTools:true,equalMeaningfulCallsPerDocument:2,
  baselinePerReasoner:1,synthesisPerReasoner:1},
 analysis:{estimand:'paired modular vs matched full-union outcomes',
  missingnessRule:'incomplete pairs and unavailable observations stay unscored',
  multipleTestingRule:'multiplicity correction preselected before source exposure',
  stoppingRule:'freeze finite resource and independent stop conditions before exposure',
  scoringBeforeUnblinding:true},
 researchEpisode:'SYNTHETIC-FULL-PLAN-NOT-AN-AUTHORIZED-EPISODE',
 realArchiveOpened:false,sourceAdmissionGranted:false,
 externalEvaluatorAccepted:false,d20Granted:false,
 unblinding:'AFTER_INDEPENDENT_FROZEN_SCORE',
 baselineOriginalCompilerRequired:true,strongUnionCandidateParityRequired:true
});
test('Full source-free Em design: 4 arms, 8 RCA01 order lanes, 20 invented docs and 2 paired reasoners per lane',()=>{
 const p=plan(),s=scientific();
 const receipt=inspectSourceFreeScientificFreeze(p,s);
 assert.equal(receipt.outcome,'FULL_DESIGN_STRUCTURALLY_PREPARED_SOURCE_FREE_ONLY');
 assert.equal(receipt.numbered_arm_count,4);assert.equal(receipt.scheduled_source_order_lanes,8);
 assert.equal(receipt.reasoner_condition_cells,16);
 assert.equal(receipt.per_reasoner_turns_per_lane,42);
 assert.equal(receipt.real_corpus_bytes_read,0);
 assert.equal(receipt.d20_protected_flight,'HELD');
 assert.equal(receipt.scientific_power_earned,false);
});
test('The existing resumable engine accepts a three-document synthetic plan; the full science guard correctly rejects it',()=>{
 const p=plan();p.lanes=[{...p.lanes[0],sourceOrder:p.lanes[0].sourceOrder.slice(0,3)}];
 assert.doesNotThrow(()=>validatePlan(p));
 assert.throws(()=>inspectSourceFreeScientificFreeze(p,scientific()),/EIGHT_FACTORIAL_ORDER_LANES_REQUIRED/);
});
test('Unweakened union, both unanticipated channels and 7 axes required',()=>{
 const p=plan(),s=scientific();s.comparator.rawUnionAccess='SUMMARIES_ONLY';
 assert.throws(()=>inspectSourceFreeScientificFreeze(p,s),/STRONG_UNWEAKENED_UNION/);
 const missing=scientific();missing.unknownDiscoveryBothReasoners=false;
 assert.throws(()=>inspectSourceFreeScientificFreeze(p,missing),/RCA01_UNANTICIPATED/);
 const truncated=scientific();truncated.dimensions.pop();
 assert.throws(()=>inspectSourceFreeScientificFreeze(p,truncated),/SEVEN_PROSPECTIVE/);
});
test('RCA01 four cells and paired source orders must be exact with distinct negative controls',()=>{
 const p=plan();p.lanes.find(x=>x.id==='B_REVERSED').sourceOrder.reverse();
 assert.throws(()=>inspectSourceFreeScientificFreeze(p,scientific()),/PROSPECTIVE_REVERSE_ORDER_MISMATCH/);
 const q=plan();q.lanes.find(x=>x.id==='C_FORWARD').sourceOrder=sourceIds('AUTH');
 assert.throws(()=>inspectSourceFreeScientificFreeze(q,scientific()),/NEGATIVE_NEUTRAL_DOLLHOUSE_SOURCE_MISMATCH|AUTHENTIC_NEGATIVE_CONTROL_SOURCE_ALIAS_COLLISION/);
 const r=plan();r.lanes.find(x=>x.id==='B_FORWARD').sourceOrder=[...sourceIds('AUTH')].reverse();
 assert.throws(()=>inspectSourceFreeScientificFreeze(r,scientific()),/PROSPECTIVE_REVERSE_ORDER_MISMATCH|AUTHENTIC_NEUTRAL_DOLLHOUSE_SOURCE_MISMATCH/);
});
test('three lineage distinctions and non-promotional private-source boundary',()=>{
 const p=plan();p.lanes[0].custodyLineage.presentation=p.lanes[0].custodyLineage.evidence;
 assert.throws(()=>inspectSourceFreeScientificFreeze(p,scientific()),/EVIDENCE_PRESENTATION_ADJUDICATION_LINEAGES_REQUIRED/);
 const s=scientific();s.realArchiveOpened=true;
 assert.throws(()=>inspectSourceFreeScientificFreeze(plan(),s),/SOURCE_FREE_BOUNDED_AUTHORITY_ONLY/);
 const t=scientific();t.privateKey='never include this';
 assert.throws(()=>inspectSourceFreeScientificFreeze(plan(),t),/FREEZE_MUST_NOT_CONTAIN_PROTECTED_SOURCE_PAYLOAD/);
});
test('Every apparent complete design still requires independent power, served provider identity, rights and D01–D20',()=>{
 const r=inspectSourceFreeScientificFreeze(plan(),scientific());
 assert.equal(r.external_source_identity_attested,false);
 assert.equal(r.served_model_attested,false);
 assert.equal(r.external_evaluator_accepted,false);
 assert.equal(r.model_spending_authorized,false);
 assert.equal(r.human_d01_d19_acceptance,'HELD');
});
