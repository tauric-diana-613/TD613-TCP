import { finiteTransportSeparationHypergraphRobustMulticoverCertificate } from './finite-transport-separation-hypergraph-robust-multicover.js';
import { finiteBlockerDualityMinimalObstructionReconstructionCertificate } from './finite-blocker-duality-minimal-obstruction-reconstruction.js';

export const FINITE_PRIME_DUAL_WITNESS_LOGIC_DECLARED_APERTURE_CLOSURE_SCHEMA='td613.dome-world.finite-prime-dual-witness-logic-declared-aperture-closure/v0.1';
export const FINITE_PRIME_DUAL_WITNESS_LOGIC_DECLARED_APERTURE_CLOSURE_PARENT_RECEIPT='5e1c459bccd58ba89e6a218198e69d8d1518424e';

const CLASS_ORDER=['specialization_comparability','principal_open_identity','principal_open_size','cut_orientation'];
let cached=null;

const freeze=v=>{ if(v&&typeof v==='object'&&!Object.isFrozen(v)){ Object.values(v).forEach(freeze); Object.freeze(v); } return v; };
const uniq=values=>[...new Set(values)];
function popcount32(value){ value=value-((value>>>1)&0x55555555); value=(value&0x33333333)+((value>>>2)&0x33333333); return (((value+(value>>>4))&0x0F0F0F0F)*0x01010101)>>>24; }
function familyIds(mask,ids){ const out=[]; for(let i=0;i<ids.length;i++) if(mask&(1<<i)) out.push(ids[i]); return out; }
function edgeMask(edge,index){ return edge.reduce((mask,id)=>mask|(1<<index[id]),0)>>>0; }
function hits(mask,edge){ return (mask&edge)!==0; }
function contains(mask,term){ return (mask&term)===term; }

function upwardTruth(total,n,seedMasks){
  const truth=new Uint8Array(total);
  for(const mask of seedMasks) truth[mask]=1;
  let propagationUpdates=0;
  for(let bitIndex=0;bitIndex<n;bitIndex++){
    const bit=1<<bitIndex;
    for(let mask=0;mask<total;mask++) if(mask&bit){
      propagationUpdates++;
      if(truth[mask^bit]) truth[mask]=1;
    }
  }
  return {truth,propagationUpdates};
}

function classCertificate(name,transportRow,blockerRow){
  const witnessUniverse=uniq([
    ...transportRow.transport_labelled_edges.flatMap(row=>row.witnesses),
    ...transportRow.blocker_families.flat(),
    ...(transportRow.never_minimal_witness_vertices||[]),
    ...(transportRow.essential_witness_vertices||[]),
  ]).sort();
  const n=witnessUniverse.length,total=2**n;
  const index=Object.fromEntries(witnessUniverse.map((id,i)=>[id,i]));
  const originalMasks=transportRow.transport_labelled_edges.map(row=>edgeMask(row.witnesses,index));
  const successMasks=transportRow.blocker_families.map(term=>edgeMask(term,index));
  const obstructionMasks=blockerRow.clutter_edges.map(edge=>edgeMask(edge,index));
  const {truth:successDnfTruth,propagationUpdates}=upwardTruth(total,n,successMasks);

  let originTruthVsSuccessDnfMismatches=0;
  let originTruthVsObstructionCnfMismatches=0;
  let successDnfVsObstructionCnfMismatches=0;
  let successCount=0,failureCount=0;
  let parentTransportIntersectionChecks=0,obstructionClauseIntersectionChecks=0;

  for(let mask=0;mask<total;mask++){
    const parentTruth=originalMasks.every(edge=>{ parentTransportIntersectionChecks++; return hits(mask,edge); });
    const dnfTruth=successDnfTruth[mask]===1;
    const cnfTruth=obstructionMasks.every(edge=>{ obstructionClauseIntersectionChecks++; return hits(mask,edge); });
    if(parentTruth) successCount++; else failureCount++;
    if(parentTruth!==dnfTruth) originTruthVsSuccessDnfMismatches++;
    if(parentTruth!==cnfTruth) originTruthVsObstructionCnfMismatches++;
    if(dnfTruth!==cnfTruth) successDnfVsObstructionCnfMismatches++;
  }

  const allMask=n===32?0xFFFFFFFF:((1<<n)-1);
  const dnfIrredundancyWitnesses=[];
  let dnfIrredundancyFailures=0;
  for(let i=0;i<successMasks.length;i++){
    const witnessMask=successMasks[i];
    const parentTruth=originalMasks.every(edge=>hits(witnessMask,edge));
    const truthWithoutTerm=successMasks.some((term,j)=>j!==i&&contains(witnessMask,term));
    const changesTruth=parentTruth===true&&truthWithoutTerm===false;
    if(!changesTruth) dnfIrredundancyFailures++;
    dnfIrredundancyWitnesses.push(freeze({
      deleted_term_index:i,
      witness_family:freeze(familyIds(witnessMask,witnessUniverse)),
      parent_truth:parentTruth,
      truth_without_deleted_term:truthWithoutTerm,
      changes_truth:changesTruth,
    }));
  }

  const cnfIrredundancyWitnesses=[];
  let cnfIrredundancyFailures=0;
  for(let i=0;i<obstructionMasks.length;i++){
    const witnessMask=(allMask&~obstructionMasks[i])>>>0;
    const parentTruth=originalMasks.every(edge=>hits(witnessMask,edge));
    const truthWithoutClause=obstructionMasks.every((edge,j)=>j===i||hits(witnessMask,edge));
    const fullCnfTruth=obstructionMasks.every(edge=>hits(witnessMask,edge));
    const changesTruth=parentTruth===false&&fullCnfTruth===false&&truthWithoutClause===true;
    if(!changesTruth) cnfIrredundancyFailures++;
    cnfIrredundancyWitnesses.push(freeze({
      deleted_clause_index:i,
      witness_family:freeze(familyIds(witnessMask,witnessUniverse)),
      parent_truth:parentTruth,
      full_cnf_truth:fullCnfTruth,
      truth_without_deleted_clause:truthWithoutClause,
      changes_truth:changesTruth,
    }));
  }

  const successCountVsParentDepth1Mismatch=successCount===transportRow.multicover_family_counts_depth_1_to_5[0]?0:1;
  const witnessUniverseExact=n===transportRow.witness_count&&n===blockerRow.witness_count;
  const passed=witnessUniverseExact&&
    originTruthVsSuccessDnfMismatches===0&&
    originTruthVsObstructionCnfMismatches===0&&
    successDnfVsObstructionCnfMismatches===0&&
    dnfIrredundancyFailures===0&&
    cnfIrredundancyFailures===0&&
    successCountVsParentDepth1Mismatch===0;

  return freeze({
    witness_count:n,
    family_count:total,
    success_count:successCount,
    failure_count:failureCount,
    minimal_success_dnf_term_count:successMasks.length,
    minimal_obstruction_cnf_clause_count:obstructionMasks.length,
    subset_zeta_propagation_updates:propagationUpdates,
    parent_transport_intersection_checks:parentTransportIntersectionChecks,
    obstruction_clause_intersection_checks:obstructionClauseIntersectionChecks,
    origin_truth_vs_success_dnf_mismatches:originTruthVsSuccessDnfMismatches,
    origin_truth_vs_obstruction_cnf_mismatches:originTruthVsObstructionCnfMismatches,
    success_dnf_vs_obstruction_cnf_mismatches:successDnfVsObstructionCnfMismatches,
    success_count_vs_parent_depth1_mismatch:successCountVsParentDepth1Mismatch,
    dnf_irredundancy_witness_count:dnfIrredundancyWitnesses.length,
    dnf_irredundancy_failures:dnfIrredundancyFailures,
    dnf_irredundancy_witnesses:freeze(dnfIrredundancyWitnesses),
    cnf_irredundancy_witness_count:cnfIrredundancyWitnesses.length,
    cnf_irredundancy_failures:cnfIrredundancyFailures,
    cnf_irredundancy_witnesses:freeze(cnfIrredundancyWitnesses),
    complete_declared_origin_truth_surface_determined_by_either_prime_antichain:passed,
    passed,
  });
}

export function finitePrimeDualWitnessLogicDeclaredApertureClosureCertificate(){
  if(cached) return cached;
  const transportParent=finiteTransportSeparationHypergraphRobustMulticoverCertificate();
  const blockerParent=finiteBlockerDualityMinimalObstructionReconstructionCertificate();
  const parentExact=transportParent.passed===true&&blockerParent.passed===true&&blockerParent.ledger?.selected_family_count===1049664&&blockerParent.ledger?.first_blocker_vs_parent_mismatches===0&&blockerParent.ledger?.double_blocker_vs_clutter_mismatches===0;

  const classes={};
  for(const name of CLASS_ORDER) classes[name]=classCertificate(name,transportParent.classes[name],blockerParent.classes[name]);

  const ledger={
    selected_family_count:Object.values(classes).reduce((sum,row)=>sum+row.family_count,0),
    success_family_count:Object.values(classes).reduce((sum,row)=>sum+row.success_count,0),
    failure_family_count:Object.values(classes).reduce((sum,row)=>sum+row.failure_count,0),
    minimal_success_dnf_term_count:Object.values(classes).reduce((sum,row)=>sum+row.minimal_success_dnf_term_count,0),
    minimal_obstruction_cnf_clause_count:Object.values(classes).reduce((sum,row)=>sum+row.minimal_obstruction_cnf_clause_count,0),
    subset_zeta_propagation_updates:Object.values(classes).reduce((sum,row)=>sum+row.subset_zeta_propagation_updates,0),
    parent_transport_intersection_checks:Object.values(classes).reduce((sum,row)=>sum+row.parent_transport_intersection_checks,0),
    obstruction_clause_intersection_checks:Object.values(classes).reduce((sum,row)=>sum+row.obstruction_clause_intersection_checks,0),
    origin_truth_vs_success_dnf_mismatches:Object.values(classes).reduce((sum,row)=>sum+row.origin_truth_vs_success_dnf_mismatches,0),
    origin_truth_vs_obstruction_cnf_mismatches:Object.values(classes).reduce((sum,row)=>sum+row.origin_truth_vs_obstruction_cnf_mismatches,0),
    success_dnf_vs_obstruction_cnf_mismatches:Object.values(classes).reduce((sum,row)=>sum+row.success_dnf_vs_obstruction_cnf_mismatches,0),
    success_count_vs_parent_depth1_mismatches:Object.values(classes).reduce((sum,row)=>sum+row.success_count_vs_parent_depth1_mismatch,0),
    dnf_irredundancy_witness_count:Object.values(classes).reduce((sum,row)=>sum+row.dnf_irredundancy_witness_count,0),
    dnf_irredundancy_failures:Object.values(classes).reduce((sum,row)=>sum+row.dnf_irredundancy_failures,0),
    cnf_irredundancy_witness_count:Object.values(classes).reduce((sum,row)=>sum+row.cnf_irredundancy_witness_count,0),
    cnf_irredundancy_failures:Object.values(classes).reduce((sum,row)=>sum+row.cnf_irredundancy_failures,0),
  };

  const declaredApertureClosed=parentExact&&Object.values(classes).every(row=>row.passed)&&
    ledger.selected_family_count===1049664&&
    ledger.subset_zeta_propagation_updates===10491040&&
    ledger.origin_truth_vs_success_dnf_mismatches===0&&
    ledger.origin_truth_vs_obstruction_cnf_mismatches===0&&
    ledger.success_dnf_vs_obstruction_cnf_mismatches===0&&
    ledger.success_count_vs_parent_depth1_mismatches===0&&
    ledger.dnf_irredundancy_failures===0&&
    ledger.cnf_irredundancy_failures===0;

  cached=freeze({
    schema:FINITE_PRIME_DUAL_WITNESS_LOGIC_DECLARED_APERTURE_CLOSURE_SCHEMA,
    parent_receipt:FINITE_PRIME_DUAL_WITNESS_LOGIC_DECLARED_APERTURE_CLOSURE_PARENT_RECEIPT,
    parent_exact:parentExact,
    inherited:transportParent.inherited,
    group:transportParent.group,
    classes:freeze(classes),
    ledger:freeze(ledger),
    declared_aperture_origin_identification_truth_closed:declaredApertureClosed,
    rest_certificate:freeze({
      fixed_tuple:freeze(['orientation_fibre','metric_isometry_action','inherited_custody_point','declared_witness_universe','origin_identification_predicate']),
      closed_question:'origin-identification truth values for every subfamily of the same declared finite witness universe',
      reopening_conditions:freeze(['change_witness_universe_or_aperture','change_fibre_or_action','change_custody_point','change_target_predicate','change_empirical_regime','change_semantic_question']),
      further_same_aperture_subfamily_enumeration_can_add_new_origin_identification_truth_values:!declaredApertureClosed,
    }),
    laws:freeze([
      'DECLARED_ORIGIN_IDENTIFICATION_TRUTH_EQUALS_MINIMAL_SUCCESS_DNF',
      'DECLARED_ORIGIN_IDENTIFICATION_TRUTH_EQUALS_MINIMAL_OBSTRUCTION_CNF',
      'MINIMAL_SUCCESS_DNF_AND_MINIMAL_OBSTRUCTION_CNF_ARE_BLOCKER_DUAL',
      'PRIME_DUAL_FORMS_ARE_IRREDUNDANT_ON_THE_DECLARED_FINITE_WITNESS_UNIVERSE',
      'EITHER_PRIME_ANTICHAIN_DETERMINES_THE_COMPLETE_DECLARED_ORIGIN_IDENTIFICATION_TRUTH_SURFACE',
      'FURTHER_SUBFAMILY_ENUMERATION_OF_THE_SAME_DECLARED_APERTURE_CANNOT_ADD_NEW_ORIGIN_IDENTIFICATION_TRUTH_VALUES',
    ]),
    membranes:freeze([
      'FINITE_DECLARED_APERTURE_CLOSURE != UNIVERSAL_SCIENTIFIC_COMPLETENESS',
      'PRIME_DUAL_IDENTIFICATION_LOGIC != COMPLETE_WITNESS_SEMANTICS',
      'BLOCKER_DUAL_RECOVERY != TRANSPORT_LABEL_RECOVERY',
      'BLOCKER_RECONSTRUCTION_OF_OBSTRUCTIONS != CANONICAL_RECONSTRUCTION_OF_ORIGIN',
      'UNPOINTED_EQUIVARIANT_SECTION_OBSTRUCTION != POINTED_WITNESS_SEPARATION_OBSTRUCTION',
      'STRUCTURAL_IDENTIFICATION != CUSTODIAL_DESIGNATION',
      'IDENTIFIABILITY != INHERITANCE',
      'REFINED_IDENTIFIABILITY != ANTERIOR_IDENTIFIABILITY',
      'MONOTONE_BOOLEAN_NORMAL_FORM != SHANNON_INFORMATION_THEORY',
      'PRIME_TERM_COUNT != MINIMUM_BIT_LENGTH',
      'OBSTRUCTION_CLAUSE != PHYSICAL_BARRIER',
      'HYPERGRAPH_EDGE != CAUSAL_RELATION',
      'METRIC_ISOMETRY_ACTION != PHYSICAL_DYNAMICS',
      'FREE_TRANSITIVE_FINITE_ACTION != GAUGE_THEORY',
      'ORIENTATION_FIBRE != HIDDEN_STATE_SPACE',
      'WITNESS_ROUTING != SCIENTIFIC_ANCESTRY',
    ]),
    passed:declaredApertureClosed,
  });
  return cached;
}
