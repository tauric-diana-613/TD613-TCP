import { finiteTransportSeparationHypergraphRobustMulticoverCertificate } from './finite-transport-separation-hypergraph-robust-multicover.js';
import { finiteBlockerDualityMinimalObstructionReconstructionCertificate } from './finite-blocker-duality-minimal-obstruction-reconstruction.js';
import { finitePrimeDualWitnessLogicDeclaredApertureClosureCertificate } from './finite-prime-dual-witness-logic-declared-aperture-closure.js';

export const FINITE_PRIME_DUAL_FIXED_POINT_REST_NORMALIZER_SCHEMA='td613.dome-world.finite-prime-dual-fixed-point-rest-normalizer/v0.1';
export const FINITE_PRIME_DUAL_FIXED_POINT_REST_NORMALIZER_PARENT_RECEIPT='961d6eae8491ca1c72da23c5f23c2b573dc8e8ce';

const CLASS_ORDER=['specialization_comparability','principal_open_identity','principal_open_size','cut_orientation'];
let cached=null;

const freeze=v=>{ if(v&&typeof v==='object'&&!Object.isFrozen(v)){ Object.values(v).forEach(freeze); Object.freeze(v); } return v; };
const uniq=values=>[...new Set(values)];
function familyIds(mask,ids){ const out=[]; for(let i=0;i<ids.length;i++) if(mask&(1<<i)) out.push(ids[i]); return out; }
function familyMask(family,index){ return family.reduce((mask,id)=>mask|(1<<index[id]),0)>>>0; }
function hits(mask,edge){ return (mask&edge)!==0; }
function sortedUniqueMasks(values){ return [...new Set(values.map(v=>v>>>0))].sort((a,b)=>a-b); }
function sameMasks(a,b){ const aa=sortedUniqueMasks(a),bb=sortedUniqueMasks(b); return aa.length===bb.length&&aa.every((v,i)=>v===bb[i]); }

function directTransportTruth(total,edgeMasks){
  const truth=new Uint8Array(total);
  let checks=0;
  for(let mask=0;mask<total;mask++){
    let ok=true;
    for(const edge of edgeMasks){
      checks++;
      if(!hits(mask,edge)) ok=false;
    }
    truth[mask]=ok?1:0;
  }
  return {truth,checks};
}

function normalizeTruth(truth,n){
  const total=truth.length;
  const allMask=(1<<n)-1;
  const hasTruePredecessor=new Uint8Array(total);
  const hasFalseSuccessor=new Uint8Array(total);
  let hasseEdgeChecks=0;

  for(let lower=0;lower<total;lower++){
    for(let bitIndex=0;bitIndex<n;bitIndex++){
      const bit=1<<bitIndex;
      if(lower&bit) continue;
      const upper=lower|bit;
      hasseEdgeChecks++;
      if(truth[lower]===1&&truth[upper]===1) hasTruePredecessor[upper]=1;
      if(truth[lower]===0&&truth[upper]===0) hasFalseSuccessor[lower]=1;
    }
  }

  const minimalTrue=[];
  const maximalFalse=[];
  for(let mask=0;mask<total;mask++){
    if(truth[mask]===1&&hasTruePredecessor[mask]===0) minimalTrue.push(mask>>>0);
    if(truth[mask]===0&&hasFalseSuccessor[mask]===0) maximalFalse.push(mask>>>0);
  }
  const minimalObstruction=maximalFalse.map(mask=>(allMask^mask)>>>0);
  return {
    minimalTrue:sortedUniqueMasks(minimalTrue),
    maximalFalse:sortedUniqueMasks(maximalFalse),
    minimalObstruction:sortedUniqueMasks(minimalObstruction),
    hasseEdgeChecks,
  };
}

function upwardTruth(total,n,seedMasks){
  const truth=new Uint8Array(total);
  for(const mask of seedMasks) truth[mask]=1;
  let updates=0;
  for(let bitIndex=0;bitIndex<n;bitIndex++){
    const bit=1<<bitIndex;
    for(let mask=0;mask<total;mask++) if(mask&bit){
      updates++;
      if(truth[mask^bit]) truth[mask]=1;
    }
  }
  return {truth,updates};
}

function cnfTruth(total,obstructionMasks){
  const truth=new Uint8Array(total);
  let checks=0;
  for(let mask=0;mask<total;mask++){
    let ok=true;
    for(const edge of obstructionMasks){
      checks++;
      if(!hits(mask,edge)) ok=false;
    }
    truth[mask]=ok?1:0;
  }
  return {truth,checks};
}

function truthMismatches(a,b){
  let count=0;
  for(let i=0;i<a.length;i++) if(a[i]!==b[i]) count++;
  return count;
}

function classCertificate(name,transportRow,blockerRow,closureRow){
  const witnessUniverse=uniq([
    ...transportRow.transport_labelled_edges.flatMap(row=>row.witnesses),
    ...transportRow.blocker_families.flat(),
    ...(transportRow.never_minimal_witness_vertices||[]),
    ...(transportRow.essential_witness_vertices||[]),
  ]).sort();
  const n=witnessUniverse.length,total=2**n;
  const index=Object.fromEntries(witnessUniverse.map((id,i)=>[id,i]));
  const transportMasks=transportRow.transport_labelled_edges.map(row=>familyMask(row.witnesses,index));
  const parentBlockerMasks=transportRow.blocker_families.map(family=>familyMask(family,index));
  const parentClutterMasks=blockerRow.clutter_edges.map(family=>familyMask(family,index));

  const direct=directTransportTruth(total,transportMasks);
  const first=normalizeTruth(direct.truth,n);
  const dnf=upwardTruth(total,n,first.minimalTrue);
  const cnf=cnfTruth(total,first.minimalObstruction);
  const second=normalizeTruth(dnf.truth,n);

  const firstMinimalTrueVsParentBlocker= sameMasks(first.minimalTrue,parentBlockerMasks)?0:1;
  const firstMinimalObstructionVsParentClutter= sameMasks(first.minimalObstruction,parentClutterMasks)?0:1;
  const dnfVsTransport=truthMismatches(dnf.truth,direct.truth);
  const cnfVsTransport=truthMismatches(cnf.truth,direct.truth);
  const dnfVsCnf=truthMismatches(dnf.truth,cnf.truth);
  const secondMinimalTrueVsFirst=sameMasks(second.minimalTrue,first.minimalTrue)?0:1;
  const secondMinimalObstructionVsFirst=sameMasks(second.minimalObstruction,first.minimalObstruction)?0:1;

  const closureParentConsistent=
    closureRow.passed===true&&
    closureRow.family_count===total&&
    closureRow.minimal_success_dnf_term_count===first.minimalTrue.length&&
    closureRow.minimal_obstruction_cnf_clause_count===first.minimalObstruction.length;

  const passed=
    n===transportRow.witness_count&&
    blockerRow.passed===true&&
    closureParentConsistent&&
    firstMinimalTrueVsParentBlocker===0&&
    firstMinimalObstructionVsParentClutter===0&&
    dnfVsTransport===0&&
    cnfVsTransport===0&&
    dnfVsCnf===0&&
    secondMinimalTrueVsFirst===0&&
    secondMinimalObstructionVsFirst===0;

  return freeze({
    witness_count:n,
    family_count:total,
    transport_truth_intersection_checks:direct.checks,
    first_hasse_edge_checks:first.hasseEdgeChecks,
    success_dnf_subset_zeta_updates:dnf.updates,
    obstruction_cnf_intersection_checks:cnf.checks,
    second_hasse_edge_checks:second.hasseEdgeChecks,
    first_minimal_true_count:first.minimalTrue.length,
    first_minimal_obstruction_count:first.minimalObstruction.length,
    first_minimal_true_families:freeze(first.minimalTrue.map(mask=>freeze(familyIds(mask,witnessUniverse)))),
    first_minimal_obstruction_families:freeze(first.minimalObstruction.map(mask=>freeze(familyIds(mask,witnessUniverse)))),
    first_minimal_true_vs_parent_blocker_mismatches:firstMinimalTrueVsParentBlocker,
    first_minimal_obstruction_vs_parent_clutter_mismatches:firstMinimalObstructionVsParentClutter,
    dnf_reconstruction_vs_transport_truth_mismatches:dnfVsTransport,
    cnf_reconstruction_vs_transport_truth_mismatches:cnfVsTransport,
    dnf_vs_cnf_truth_mismatches:dnfVsCnf,
    second_minimal_true_count:second.minimalTrue.length,
    second_minimal_obstruction_count:second.minimalObstruction.length,
    second_minimal_true_vs_first_mismatches:secondMinimalTrueVsFirst,
    second_minimal_obstruction_vs_first_mismatches:secondMinimalObstructionVsFirst,
    prime_dual_normalization_fixed_point:passed,
    closure_parent_consistent:closureParentConsistent,
    passed,
  });
}

export function finitePrimeDualFixedPointRestNormalizerCertificate(){
  if(cached) return cached;
  const transportParent=finiteTransportSeparationHypergraphRobustMulticoverCertificate();
  const blockerParent=finiteBlockerDualityMinimalObstructionReconstructionCertificate();
  const closureParent=finitePrimeDualWitnessLogicDeclaredApertureClosureCertificate();

  const parentExact=
    transportParent.passed===true&&
    blockerParent.passed===true&&
    closureParent.passed===true&&
    closureParent.declared_aperture_origin_identification_truth_closed===true&&
    closureParent.ledger?.selected_family_count===1049664&&
    closureParent.ledger?.minimal_success_dnf_term_count===46&&
    closureParent.ledger?.minimal_obstruction_cnf_clause_count===9;

  const classes={};
  for(const name of CLASS_ORDER){
    classes[name]=classCertificate(name,transportParent.classes[name],blockerParent.classes[name],closureParent.classes[name]);
  }

  const sum=key=>Object.values(classes).reduce((acc,row)=>acc+row[key],0);
  const ledger={
    selected_family_count:sum('family_count'),
    transport_truth_intersection_checks:sum('transport_truth_intersection_checks'),
    first_hasse_edge_checks:sum('first_hasse_edge_checks'),
    success_dnf_subset_zeta_updates:sum('success_dnf_subset_zeta_updates'),
    obstruction_cnf_intersection_checks:sum('obstruction_cnf_intersection_checks'),
    second_hasse_edge_checks:sum('second_hasse_edge_checks'),
    fixed_work_units:sum('transport_truth_intersection_checks')+sum('first_hasse_edge_checks')+sum('success_dnf_subset_zeta_updates')+sum('obstruction_cnf_intersection_checks')+sum('second_hasse_edge_checks'),
    minimal_true_count:sum('first_minimal_true_count'),
    minimal_obstruction_count:sum('first_minimal_obstruction_count'),
    first_minimal_true_vs_parent_blocker_mismatches:sum('first_minimal_true_vs_parent_blocker_mismatches'),
    first_minimal_obstruction_vs_parent_clutter_mismatches:sum('first_minimal_obstruction_vs_parent_clutter_mismatches'),
    dnf_reconstruction_vs_transport_truth_mismatches:sum('dnf_reconstruction_vs_transport_truth_mismatches'),
    cnf_reconstruction_vs_transport_truth_mismatches:sum('cnf_reconstruction_vs_transport_truth_mismatches'),
    dnf_vs_cnf_truth_mismatches:sum('dnf_vs_cnf_truth_mismatches'),
    second_minimal_true_vs_first_mismatches:sum('second_minimal_true_vs_first_mismatches'),
    second_minimal_obstruction_vs_first_mismatches:sum('second_minimal_obstruction_vs_first_mismatches'),
  };

  const passed=parentExact&&Object.values(classes).every(row=>row.passed)&&
    ledger.selected_family_count===1049664&&
    ledger.transport_truth_intersection_checks===3148992&&
    ledger.first_hasse_edge_checks===10491040&&
    ledger.success_dnf_subset_zeta_updates===10491040&&
    ledger.obstruction_cnf_intersection_checks===3147904&&
    ledger.second_hasse_edge_checks===10491040&&
    ledger.fixed_work_units===37770016&&
    ledger.minimal_true_count===46&&
    ledger.minimal_obstruction_count===9&&
    ledger.first_minimal_true_vs_parent_blocker_mismatches===0&&
    ledger.first_minimal_obstruction_vs_parent_clutter_mismatches===0&&
    ledger.dnf_reconstruction_vs_transport_truth_mismatches===0&&
    ledger.cnf_reconstruction_vs_transport_truth_mismatches===0&&
    ledger.dnf_vs_cnf_truth_mismatches===0&&
    ledger.second_minimal_true_vs_first_mismatches===0&&
    ledger.second_minimal_obstruction_vs_first_mismatches===0;

  cached=freeze({
    schema:FINITE_PRIME_DUAL_FIXED_POINT_REST_NORMALIZER_SCHEMA,
    parent_receipt:FINITE_PRIME_DUAL_FIXED_POINT_REST_NORMALIZER_PARENT_RECEIPT,
    parent_exact:parentExact,
    inherited:transportParent.inherited,
    classes:freeze(classes),
    ledger:freeze(ledger),
    fixed_point_certificate:freeze({
      reconstruction_after_normalization_equals_original_truth:passed,
      normalization_after_reconstruction_equals_original_prime_pair:passed,
      repeated_same_tuple_normalization_can_create_new_prime_terms_or_clauses:!passed,
      fixed_tuple:closureParent.rest_certificate.fixed_tuple,
      reopening_conditions:closureParent.rest_certificate.reopening_conditions,
    }),
    laws:freeze([
      'PRIME_DUAL_NORMALIZER_RECOVERS_UNIQUE_MINIMAL_TRUE_AND_MAXIMAL_FALSE_COMPLEMENT_ANTICHAINS',
      'PRIME_DUAL_RECONSTRUCTION_IS_EXACT_ON_THE_DECLARED_FINITE_TRUTH_SURFACE',
      'PRIME_DUAL_NORMALIZATION_IS_IDEMPOTENT_ON_THE_DECLARED_FINITE_TRUTH_SURFACE',
      'R_COMPOSE_N_EQUALS_ID_ON_THE_DECLARED_FINITE_ORIGIN_IDENTIFICATION_TRUTH_SURFACE',
      'N_COMPOSE_R_COMPOSE_N_EQUALS_N_ON_THE_DECLARED_FINITE_PRIME_DUAL_CERTIFICATE',
      'REPEATED_SAME_TUPLE_NORMALIZATION_CANNOT_CREATE_NEW_PRIME_SUCCESS_TERMS_OR_OBSTRUCTION_CLAUSES',
      'THE_PRIME_DUAL_PAIR_IS_CANONICALLY_DETERMINED_BY_THE_DECLARED_TRUTH_SURFACE',
    ]),
    membranes:freeze([
      'CANONICAL_PRIME_DUAL_FIXED_POINT != UNIVERSAL_SCIENTIFIC_COMPLETENESS',
      'NORMAL_FORM_CANONICALITY != COMPLETE_WITNESS_SEMANTICS',
      'IDEMPOTENT_NORMALIZATION != PHYSICAL_EQUILIBRIUM',
      'FIXED_POINT_OF_DESCRIPTION != FIXED_POINT_OF_DYNAMICS',
      'MONOTONE_BOOLEAN_PRIME != SHANNON_INFORMATION_UNIT',
      'PRIME_ANTICHAIN_UNIQUENESS != MINIMUM_BIT_LENGTH',
      'BLOCKER_DUALITY != TRANSPORT_LABEL_RECOVERY',
      'STRUCTURAL_IDENTIFICATION != CUSTODIAL_DESIGNATION',
      'IDENTIFIABILITY != INHERITANCE',
      'REFINED_IDENTIFIABILITY != ANTERIOR_IDENTIFIABILITY',
      'WITNESS_ROUTING != SCIENTIFIC_ANCESTRY',
    ]),
    passed,
  });
  return cached;
}
