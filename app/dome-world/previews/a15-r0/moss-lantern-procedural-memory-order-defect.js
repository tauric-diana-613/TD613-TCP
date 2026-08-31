import {
  ONE_SIDED_CONTINUATION_TWO_SIDED_SYNTACTIC_RECOVERY_SCHEMA,
  oneSidedContinuationTwoSidedSyntacticRecoveryCertificate,
} from './one-sided-continuation-two-sided-syntactic-recovery.js';

export const MOSS_LANTERN_PROCEDURAL_MEMORY_ORDER_DEFECT_SCHEMA='td613.dome-world.moss-lantern-procedural-memory-order-defect/v0.1';
export const MOSS_LANTERN_PROCEDURAL_MEMORY_ORDER_DEFECT_PARENT_RECEIPT='c0bdb1b0f19d94f987837a6cb2465e5933b623c2';

const FIXTURE_ID='ash-loom.moss-lantern-calibration/v0.1';
const OPERATOR_LABEL='Moss Lantern practice capsule';
const ENDPOINT='returned-practice-capsule';
const CANONICAL_ROUTE=Object.freeze(['open-practice-case','custody-hold','projection-observe','rest','return']);
const SWAPPED_ROUTE=Object.freeze(['open-practice-case','projection-observe','custody-hold','rest','return']);
const STARTS=Object.freeze([[0,0],[0,1],[1,0],[1,1]].map(row=>Object.freeze(row)));
let cached=null;

function freeze(value){
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){ Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
function samePair(a,b){ return a[0]===b[0]&&a[1]===b[1]; }
function pairId(pair){ return `${pair[0]}${pair[1]}`; }
function hamming(a,b){ return Number(a[0]!==b[0])+Number(a[1]!==b[1]); }
const A=([x,y])=>Object.freeze([x^1,y]);
const B=([x,y])=>Object.freeze([x,y^x]);
const C=([x,y])=>Object.freeze([x^1,y]);
const D=([x,y])=>Object.freeze([x,y^1]);
const RESET=()=>Object.freeze([0,0]);
const MARKER=([,y])=>y;
function applyOrder(start,operators){
  let state=Object.freeze([...start]);
  for(const operator of operators) state=operator(state);
  return state;
}

export function mossLanternProceduralMemoryOrderDefectCertificate(){
  if(cached) return cached;

  const parent=oneSidedContinuationTwoSidedSyntacticRecoveryCertificate();
  const parentExact=parent.passed===true&&
    ONE_SIDED_CONTINUATION_TWO_SIDED_SYNTACTIC_RECOVERY_SCHEMA==='td613.dome-world.one-sided-continuation-two-sided-syntactic-recovery/v0.1'&&
    parent.laws?.memoryless_same_endpoint_same_future_state_readouts===true&&
    parent.laws?.right_context_endpoint_kernel===true&&
    parent.two_sided_context?.right_context_classes_at_A===5&&
    parent.two_sided_context?.syntactic_action_classes===128;

  const targetRows=[];
  let targetExecutions=0;
  let targetComparisons=0;
  let visibleEndpointMatches=0;
  let visibleEndpointMismatches=0;
  let apparatusDivergences=0;
  let apparatusMatches=0;
  let unitHammingDefects=0;
  let delayedMarkerDivergences=0;
  let delayedMarkerMatches=0;
  let memorylessProjectionDivergences=0;
  let memorylessProjectionMatches=0;
  let resetDelayedDivergences=0;
  let resetDelayedMatches=0;

  for(const start of STARTS){
    const ab=applyOrder(start,[A,B]); targetExecutions+=1;
    const ba=applyOrder(start,[B,A]); targetExecutions+=1;
    targetComparisons+=1;

    const qAB=ENDPOINT,qBA=ENDPOINT;
    if(qAB===qBA) visibleEndpointMatches+=1; else visibleEndpointMismatches+=1;
    if(!samePair(ab,ba)) apparatusDivergences+=1; else apparatusMatches+=1;
    const defect=hamming(ab,ba);
    if(defect===1) unitHammingDefects+=1;

    const markerAB=MARKER(ab),markerBA=MARKER(ba);
    if(markerAB!==markerBA) delayedMarkerDivergences+=1; else delayedMarkerMatches+=1;

    const memorylessAB=qAB,memorylessBA=qBA;
    if(memorylessAB!==memorylessBA) memorylessProjectionDivergences+=1; else memorylessProjectionMatches+=1;

    const resetAB=RESET(ab),resetBA=RESET(ba);
    const resetMarkerAB=MARKER(resetAB),resetMarkerBA=MARKER(resetBA);
    if(resetMarkerAB!==resetMarkerBA) resetDelayedDivergences+=1; else resetDelayedMatches+=1;

    targetRows.push(freeze({
      start:pairId(start),
      AB:freeze([...ab]),
      BA:freeze([...ba]),
      visible_endpoint_AB:qAB,
      visible_endpoint_BA:qBA,
      hamming_Xi:defect,
      marker_AB:markerAB,
      marker_BA:markerBA,
      memoryless_projection_equal:memorylessAB===memorylessBA,
      reset_marker_equal:resetMarkerAB===resetMarkerBA,
    }));
  }

  const controlRows=[];
  let controlExecutions=0;
  let controlComparisons=0;
  let controlApparatusDivergences=0;
  let controlApparatusMatches=0;
  let controlMarkerDivergences=0;
  let controlMarkerMatches=0;
  for(const start of STARTS){
    const cd=applyOrder(start,[C,D]); controlExecutions+=1;
    const dc=applyOrder(start,[D,C]); controlExecutions+=1;
    controlComparisons+=1;
    if(!samePair(cd,dc)) controlApparatusDivergences+=1; else controlApparatusMatches+=1;
    if(MARKER(cd)!==MARKER(dc)) controlMarkerDivergences+=1; else controlMarkerMatches+=1;
    controlRows.push(freeze({start:pairId(start),CD:freeze([...cd]),DC:freeze([...dc]),hamming_Xi:hamming(cd,dc),marker_equal:MARKER(cd)===MARKER(dc)}));
  }

  const expectedTarget=Object.freeze({
    '00':Object.freeze({AB:Object.freeze([1,1]),BA:Object.freeze([1,0])}),
    '01':Object.freeze({AB:Object.freeze([1,0]),BA:Object.freeze([1,1])}),
    '10':Object.freeze({AB:Object.freeze([0,0]),BA:Object.freeze([0,1])}),
    '11':Object.freeze({AB:Object.freeze([0,1]),BA:Object.freeze([0,0])}),
  });
  const targetRowsExact=targetRows.every(row=>samePair(row.AB,expectedTarget[row.start].AB)&&samePair(row.BA,expectedTarget[row.start].BA));

  const exact=parentExact&&
    STARTS.length===4&&targetExecutions===8&&targetComparisons===4&&
    visibleEndpointMatches===4&&visibleEndpointMismatches===0&&
    apparatusDivergences===4&&apparatusMatches===0&&unitHammingDefects===4&&
    delayedMarkerDivergences===4&&delayedMarkerMatches===0&&
    memorylessProjectionDivergences===0&&memorylessProjectionMatches===4&&
    resetDelayedDivergences===0&&resetDelayedMatches===4&&
    controlExecutions===8&&controlComparisons===4&&controlApparatusDivergences===0&&controlApparatusMatches===4&&
    controlMarkerDivergences===0&&controlMarkerMatches===4&&targetRowsExact;

  cached=freeze({
    schema:MOSS_LANTERN_PROCEDURAL_MEMORY_ORDER_DEFECT_SCHEMA,
    parent_receipt:MOSS_LANTERN_PROCEDURAL_MEMORY_ORDER_DEFECT_PARENT_RECEIPT,
    parent_exact:parentExact,
    fixture:freeze({
      fixture_id:FIXTURE_ID,operator_label:OPERATOR_LABEL,expected_endpoint:ENDPOINT,
      canonical_route:freeze([...CANONICAL_ROUTE]),swapped_route:freeze([...SWAPPED_ROUTE]),manifestly_fictional:true,runtime_binding:false,
    }),
    experimental_state:freeze({carrier:'Omega=(q,Xi)',visible_coordinate:'q',apparatus_coordinate:'Xi in F2^2',initial_states:freeze(STARTS.map(row=>freeze([...row])))}),
    target:freeze({
      update_A:'custody-hold: A(x,y)=(x xor 1,y)',
      update_B:'projection-observe: B(x,y)=(x,y xor x)',
      orders:freeze(['AB','BA']),rows:freeze(targetRows),executions:targetExecutions,comparisons:targetComparisons,
      visible_endpoint_matches:visibleEndpointMatches,visible_endpoint_mismatches:visibleEndpointMismatches,
      apparatus_endpoint_divergences:apparatusDivergences,apparatus_endpoint_matches:apparatusMatches,unit_hamming_apparatus_defects:unitHammingDefects,
      delayed_marker_divergences:delayedMarkerDivergences,delayed_marker_matches:delayedMarkerMatches,
    }),
    controls:freeze({
      memoryless_projection:freeze({divergences:memorylessProjectionDivergences,matches:memorylessProjectionMatches,projects_to:'q only'}),
      apparatus_reset:freeze({divergences:resetDelayedDivergences,matches:resetDelayedMatches,resets_to:freeze([0,0])}),
      commutative_pair:freeze({
        update_C:'C(x,y)=(x xor 1,y)',update_D:'D(x,y)=(x,y xor 1)',rows:freeze(controlRows),executions:controlExecutions,comparisons:controlComparisons,
        apparatus_divergences:controlApparatusDivergences,apparatus_matches:controlApparatusMatches,marker_divergences:controlMarkerDivergences,marker_matches:controlMarkerMatches,
      }),
    }),
    defect_profile:freeze({H_q:0,H_Xi_all_starts:freeze(targetRows.map(row=>row.hamming_Xi)),future_marker_split_all_starts:delayedMarkerDivergences===4}),
    laws:freeze({
      same_visible_endpoint_all_target_starts:visibleEndpointMatches===4&&visibleEndpointMismatches===0,
      order_dependent_declared_apparatus_endpoint_all_target_starts:apparatusDivergences===4&&unitHammingDefects===4,
      future_apparatus_probe_separates_all_target_orders:delayedMarkerDivergences===4,
      memoryless_projection_remains_collapsed:memorylessProjectionDivergences===0,
      reset_extinguishes_delayed_difference:resetDelayedDivergences===0,
      commutative_control_has_zero_order_defect:controlApparatusDivergences===0&&controlMarkerDivergences===0,
      procedural_memory_witness_bounded_fixture:visibleEndpointMatches===4&&apparatusDivergences===4&&delayedMarkerDivergences===4,
    }),
    execution_ledger:freeze({
      inherited_parent_null_checks:4,apparatus_states:STARTS.length,target_state_order_executions:targetExecutions,target_order_pair_comparisons:targetComparisons,
      immediate_endpoint_comparisons:targetComparisons,apparatus_hamming_computations:targetComparisons,delayed_probe_comparisons:targetComparisons,
      memoryless_projection_comparisons:targetComparisons,reset_control_comparisons:targetComparisons,
      commutative_state_order_executions:controlExecutions,commutative_order_pair_comparisons:controlComparisons,
    }),
    membranes:freeze([
      'DECLARED_APPARATUS_MEMORY != INFERRED_HIDDEN_MODEL_STATE',
      'SAME_VISIBLE_ENDPOINT != SAME_FULL_EXPERIMENTAL_STATE',
      'PROCEDURAL_ORDER_DEFECT != GEOMETRIC_HOLONOMY',
      'PROCEDURAL_ORDER_DEFECT != PHYSICAL_HOLONOMY',
      'NONCOMMUTING_AFFINE_UPDATES != IDENTIFIED_PHYSICAL_MECHANISM',
      'DELAYED_APPARATUS_READOUT != STATE_ONLY_CONTINUATION',
      'APPARATUS_RESET_IN_FIXTURE != HISTORICAL_ERASURE',
      'MOSS_LANTERN_CALIBRATION != LIVE_ASH_RUNTIME',
      'MOSS_LANTERN_CALIBRATION != LIVE_HOLONOMY_LOOM_RUNTIME',
    ]),
    passed:exact,
  });
  return cached;
}

export const MOSS_LANTERN_PROCEDURAL_MEMORY_ORDER_DEFECT_CERTIFICATE=mossLanternProceduralMemoryOrderDefectCertificate();
