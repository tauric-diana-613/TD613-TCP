import fs from 'node:fs';
import crypto, { webcrypto } from 'node:crypto';
import { compileAshCustodyPedagogueScene } from '../../../engine/ash-pedagogue-adapter.js';
import {
  ROUTE_BURDEN_MODEL_IDS,
  compileRouteGraph,
  compareBurdenModels,
  compileBurdenReceipt
} from '../../../engine/flowcore-route-burden.js';
import {
  LOOM_ADAPTIVE_ROUTE_HOLONOMY_CERTIFICATE as LOOM_PARENT,
  LIVE_LOOM_SOURCE_BLOB
} from './loom-adaptive-route-holonomy-receipt.js';

export const LOOM_CROWN_ELIGIBILITY_CONCORDANCE_SCHEMA='td613.dome-world.loom-crown-eligibility-concordance/v0.1';
export const LOOM_CROWN_ELIGIBILITY_CONCORDANCE_PARENT='b472513a244b0389d23eec496f980f787f9546d1';

const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const digest=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const scenarioData=()=>JSON.parse(fs.readFileSync('app/dome-world/fixtures/pedagogue/ash-custody-pedagogue-scenarios.json','utf8'));

function scenarioSnapshot(data,name){
  const source=structuredClone(data.scenarios[name].snapshot);
  if(source.readinessReceipt==='$shared.readinessReceipt') source.readinessReceipt=structuredClone(data.shared.readinessReceipt);
  if(source.custodyReceipt==='$shared.custodyReceipt') source.custodyReceipt=structuredClone(data.shared.custodyReceipt);
  if(source.caseMap==='$scenarios.case_bound.snapshot.caseMap') source.caseMap=structuredClone(data.scenarios.case_bound.snapshot.caseMap);
  return source;
}

export async function runLoomCrownEligibilityConcordance(){
  if(LOOM_PARENT.status!=='LOOM_ADAPTIVE_ROUTE_HOLONOMY_COMPATIBILITY_EARNED'){
    return freeze({status:'INADMISSIBLE',errors:['LOOM_ROUTE_HOLONOMY_PARENT_REQUIRED']});
  }

  const data=scenarioData();
  const options={
    ...data.determinism,
    idSeed:`${data.determinism.idSeed}:loom-crown-eligibility`,
    cryptoImpl:webcrypto,
    beforeSnapshot:scenarioSnapshot(data,'verified')
  };
  const snapshot=scenarioSnapshot(data,'case_bound');
  const packageView=await compileAshCustodyPedagogueScene(snapshot,options);
  const graph=await compileRouteGraph(packageView.scene,packageView.phase_sequence,options);
  const comparison=compareBurdenModels(graph,ROUTE_BURDEN_MODEL_IDS);
  const burdenReceipt=await compileBurdenReceipt(comparison,options);

  const totals=comparison.model_results.map(result=>result.total_millipoints);
  const allModelsEvaluated=comparison.model_results.length===ROUTE_BURDEN_MODEL_IDS.length;
  const disagreementPreserved=new Set(totals).size>1&&comparison.model_disagreements.length>0;
  const modelsUncrowned=comparison.crowned_model===null&&comparison.crowned_score===null;
  const interactionEvidenceStillRequired=comparison.model_results.every(result=>result.route_design_hypothesis_requires_interaction_evidence===true);
  const canonicalJourneyCompiled=packageView.receipt_verification.valid===true&&graph.schema==='td613.flowcore.route-graph/v0.1';
  const loomRouteMemoryBound=Boolean(
    LOOM_PARENT.route_memories?.A_SEPARATED?.route_memory_digest&&
    LOOM_PARENT.route_memories?.C_SEPARATED?.route_memory_digest
  );

  const concordanceSubject={
    ash_package_digest:packageView.package_digest,
    ash_pedagogue_receipt_digest:packageView.pedagogue_receipt.receipt_digest,
    route_graph_digest:graph.graph_digest,
    burden_receipt_digest:burdenReceipt.receipt_digest,
    burden_model_ids:[...ROUTE_BURDEN_MODEL_IDS],
    burden_totals_millipoints:totals,
    loom_route_memory_digests:[
      LOOM_PARENT.route_memories.A_SEPARATED.route_memory_digest,
      LOOM_PARENT.route_memories.C_SEPARATED.route_memory_digest
    ],
    live_loom_source_blob:LIVE_LOOM_SOURCE_BLOB
  };
  const concordanceDigest=digest(concordanceSubject);
  const passed=canonicalJourneyCompiled&&allModelsEvaluated&&disagreementPreserved&&modelsUncrowned&&interactionEvidenceStillRequired&&loomRouteMemoryBound;

  return freeze({
    schema:LOOM_CROWN_ELIGIBILITY_CONCORDANCE_SCHEMA,
    exact_parent:LOOM_CROWN_ELIGIBILITY_CONCORDANCE_PARENT,
    status:passed?'LOOM_CUSTODIAL_CROWN_ELIGIBILITY_CONCORDANCE_EARNED':'INADMISSIBLE',
    errors:passed?[]:['CROWN_ELIGIBILITY_CONCORDANCE_FAILED'],
    rest_symbol:passed?'𝄐':null,
    concordance_digest:concordanceDigest,
    source_fixture_class:'CANONICAL_ASH_DERIVED_SYNTHETIC_LIFECYCLE_FIXTURE',
    lifecycle_state:packageView.lifecycle.state,
    canonical_ash_derived_scene_compiled:canonicalJourneyCompiled,
    canonical_flowcore_route_graph_compiled:canonicalJourneyCompiled,
    route_graph_digest:graph.graph_digest,
    route_graph_step_count:graph.totals.step_count,
    all_declared_burden_models_evaluated:allModelsEvaluated,
    burden_model_ids:[...ROUTE_BURDEN_MODEL_IDS],
    burden_model_totals_millipoints:totals,
    burden_model_disagreement_preserved:disagreementPreserved,
    burden_models_remain_uncrowned:modelsUncrowned,
    crowned_model:comparison.crowned_model,
    crowned_score:comparison.crowned_score,
    burden_interaction_evidence_still_required:interactionEvidenceStillRequired,
    burden_receipt_digest:burdenReceipt.receipt_digest,
    loom_route_memory_reference_bound:loomRouteMemoryBound,
    loom_route_memory_digests:{
      A_SEPARATED:LOOM_PARENT.route_memories.A_SEPARATED.route_memory_digest,
      C_SEPARATED:LOOM_PARENT.route_memories.C_SEPARATED.route_memory_digest
    },
    live_loom_source_blob:LIVE_LOOM_SOURCE_BLOB,
    research_custodial_crown_eligibility:passed,
    crown_scope:'ROUTE_MEMORY_CUSTODY_COMPATIBILITY_ONLY',
    crown_authority:false,
    live_loom_crowned:false,
    loom_became_flowcore_burden_engine:false,
    loom_context_is_measurement:false,
    empirical_interaction_evidence_acquired:false,
    a16_live_principal_journey_observed:false,
    a16_live_route_burden_compilation_earned:false,
    a16_readmission_earned:false,
    a16_implementation_authority:false,
    a19_whole_program_closure_earned:false,
    a19_mutation_authority:false,
    live_loom_mutated:false,
    loom_rename_authority:false,
    flowcore_public_promotion_authority:false,
    empirical_supplemental_probe_repair_earned:false,
    external_empirical_exteriority_witness_acquired:false,
    empirical_exteriority_information_gain_measured:false,
    exact_golden_egg_surfaces_added:freeze([]),
    empirical_credit_to_golden_egg:0,
    golden_egg_earned:false,
    sequence_authority:false,
    merge_authority:false,
    production_authority:false,
    deployment_authority:false,
    publication_authority:false,
    laws:freeze({
      crown_eligibility_not_crown_authority:true,
      custodial_route_memory_not_burden_engine:true,
      burden_model_disagreement_not_model_crown:true,
      canonical_fixture_compilation_not_live_principal_journey:true,
      route_burden_compilation_not_interaction_evidence:true,
      loom_compatibility_not_a16_readmission:true,
      loom_compatibility_not_a19_closure:true,
      loom_route_memory_not_empirical_measurement:true,
      golden_egg_credit_forbidden:true
    }),
    theorem:'A_CANONICAL_ASH_DERIVED_PEDAGOGUE_JOURNEY_CAN_COMPILE_THROUGH_ALL_DECLARED_FLOWCORE_ROUTE_BURDEN_MODELS_WHILE_MODEL_DISAGREEMENT_REMAINS_UNCROWNED_AND_A_LOOM_ROUTE_MEMORY_REFERENCE_IS_CUSTODIALLY_BOUND_WITHOUT_CONVERTING_LOOM_INTO_A_BURDEN_ENGINE_OR_SATISFYING_A16_LIVE_JOURNEY_REQUIREMENTS',
    child_message:'THE DIADEM MAY FIT THE ROUTE MEMORY. THE BURDEN MODELS KEEP THEIR OWN VOICES.'
  });
}

export const LOOM_CROWN_ELIGIBILITY_CONCORDANCE_CERTIFICATE=await runLoomCrownEligibilityConcordance();
