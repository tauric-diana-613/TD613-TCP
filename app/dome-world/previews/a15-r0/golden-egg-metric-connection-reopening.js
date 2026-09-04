import { runBidirectionalDiscreteConnectionCandidateAssay } from './bidirectional-discrete-connection-candidate.js';
import { runHolonomyActionOnObservabilityPartitionsHoldout } from './holonomy-action-on-observability-partitions.js';

export const GOLDEN_EGG_METRIC_CONNECTION_REOPENING_SCHEMA='td613.dome-world.golden-egg-metric-connection-reopening/v0.1';
export const GOLDEN_EGG_METRIC_CONNECTION_REOPENING_PARENT='c0ef84c5c48af37a8f79d89c80d2e055da707836';
const MODULUS=31;
const REST_LEDGER=Object.freeze({formal_combinations:320,threshold_feasible:24,pareto_minimal:18,empirical_joint_realized:0,golden_egg_earned:false,remaining_frontier:'H_INFORMATION_CURVATURE_GEOMETRIC'});
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const mod=v=>((Number(v)%MODULUS)+MODULUS)%MODULUS;
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const intersectionSize=(a,b)=>{const s=new Set(b);return a.reduce((n,x)=>n+(s.has(x)?1:0),0);};

function permutations(n){
  const out=[];
  const used=Array(n).fill(false), cur=[];
  const rec=()=>{if(cur.length===n){out.push([...cur]);return;}for(let i=0;i<n;i++)if(!used[i]){used[i]=true;cur.push(i);rec();cur.pop();used[i]=false;}};
  rec();return out;
}

function normalizePartition(partition){
  const raw=Array.isArray(partition)?partition:(partition&&Array.isArray(partition.buckets)?partition.buckets.map(b=>b.members):null);
  if(!raw)throw new Error('partition must be a block array or receipt with buckets');
  const blocks=raw.map(block=>{
    if(!Array.isArray(block))throw new Error('partition block must be an array');
    return [...block].map(String).sort();
  }).filter(block=>block.length>0);
  const seen=new Set();
  for(const block of blocks)for(const member of block){if(seen.has(member))throw new Error('partition repeats a named member');seen.add(member);}
  blocks.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return freeze({blocks:freeze(blocks.map(block=>freeze(block))),universe:freeze([...seen].sort())});
}

export function partitionTransferDistance(left,right){
  const L=normalizePartition(left),R=normalizePartition(right);
  if(!equal(L.universe,R.universe))throw new Error('partition universes differ');
  const n=L.universe.length;
  const width=Math.max(L.blocks.length,R.blocks.length);
  const A=[...L.blocks,...Array.from({length:width-L.blocks.length},()=>[])];
  const B=[...R.blocks,...Array.from({length:width-R.blocks.length},()=>[])];
  let retained=0;
  for(const p of permutations(width)){
    let score=0;
    for(let i=0;i<width;i++)score+=intersectionSize(A[i],B[p[i]]);
    if(score>retained)retained=score;
  }
  return n-retained;
}

export function enumerateNamedSetPartitions(items){
  const names=[...items].map(String);
  const out=[];
  const rec=(index,blocks)=>{
    if(index===names.length){out.push(freeze(blocks.map(block=>freeze([...block]))));return;}
    const name=names[index];
    for(let i=0;i<blocks.length;i++){
      const next=blocks.map(block=>[...block]);next[i].push(name);rec(index+1,next);
    }
    rec(index+1,[...blocks,[name]]);
  };
  if(names.length===0)return freeze([freeze([])]);
  rec(0,[]);
  return freeze(out);
}

export function auditFinitePartitionMetric(items,distance=partitionTransferDistance){
  const partitions=enumerateNamedSetPartitions(items);
  let identityFailures=0,symmetryFailures=0,triangleFailures=0,pairChecks=0,tripleChecks=0;
  for(let i=0;i<partitions.length;i++)for(let j=0;j<partitions.length;j++){
    pairChecks++;
    const dij=distance(partitions[i],partitions[j]);
    const dji=distance(partitions[j],partitions[i]);
    if((i===j&&dij!==0)||(i!==j&&dij===0)||dij<0)identityFailures++;
    if(dij!==dji)symmetryFailures++;
  }
  for(let i=0;i<partitions.length;i++)for(let j=0;j<partitions.length;j++)for(let k=0;k<partitions.length;k++){
    tripleChecks++;
    if(distance(partitions[i],partitions[k])>distance(partitions[i],partitions[j])+distance(partitions[j],partitions[k]))triangleFailures++;
  }
  return freeze({partition_count:partitions.length,pair_checks:pairChecks,triple_checks:tripleChecks,identity_failures:identityFailures,symmetry_failures:symmetryFailures,triangle_failures:triangleFailures,passed:identityFailures===0&&symmetryFailures===0&&triangleFailures===0});
}

function auditTriangleBaseMetric(){
  const vertices=['A','B','C'];
  const d=(u,v)=>u===v?0:1;
  let pairChecks=0,tripleChecks=0,identityFailures=0,symmetryFailures=0,triangleFailures=0;
  for(const u of vertices)for(const v of vertices){pairChecks++;const uv=d(u,v),vu=d(v,u);if((u===v&&uv!==0)||(u!==v&&uv===0)||uv<0)identityFailures++;if(uv!==vu)symmetryFailures++;}
  for(const u of vertices)for(const v of vertices)for(const w of vertices){tripleChecks++;if(d(u,w)>d(u,v)+d(v,w))triangleFailures++;}
  return freeze({vertices:freeze(vertices),unit_edges:freeze(['AB','BC','CA']),filled_face:'F_ABC',declared_face_area:1,pair_checks:pairChecks,triple_checks:tripleChecks,identity_failures:identityFailures,symmetry_failures:symmetryFailures,triangle_failures:triangleFailures,passed:identityFailures===0&&symmetryFailures===0&&triangleFailures===0});
}

const det2=m=>mod(m[0][0]*m[1][1]-m[0][1]*m[1][0]);
const trace2=m=>mod(m[0][0]+m[1][1]);

function malformedDistanceAudit(items){
  const parts=enumerateNamedSetPartitions(items);
  const canonical=p=>JSON.stringify(normalizePartition(p).blocks);
  const first=canonical(parts[0]),second=canonical(parts[1]),third=canonical(parts[2]);
  const bad=(p,q)=>{
    const a=canonical(p),b=canonical(q);
    if(a===b)return 0;
    if((a===first&&b===third)||(a===third&&b===first))return 3;
    if((a===first&&b===second)||(a===second&&b===first)||(a===second&&b===third)||(a===third&&b===second))return 1;
    return 2;
  };
  const audit=auditFinitePartitionMetric(items,bad);
  return freeze({triangle_failures_detected:audit.triangle_failures,malformed_metric_rejected:audit.passed===false});
}

export function runGoldenEggMetricConnectionReopeningAssay(){
  const connection=runBidirectionalDiscreteConnectionCandidateAssay();
  const action=runHolonomyActionOnObservabilityPartitionsHoldout();
  const namedUniverse=action.candidate_family.map(c=>c.candidate_id);
  const partitionMetric=auditFinitePartitionMetric(namedUniverse);
  const baseMetric=auditTriangleBaseMetric();

  const HConnection=connection.positive.triangle_loops.forward_loop_ABC;
  const HAction=action.earned_loop.H;
  const HGauge=connection.gauge_clone.triangle_loops.forward_loop_ABC;
  const loopBound=equal(HConnection,HAction);
  const faceSignature=freeze({
    face_id:'F_ABC',
    loop:HConnection,
    determinant_mod31:det2(HConnection),
    trace_mod31:trace2(HConnection),
    nonidentity:!equal(HConnection,[[1,0],[0,1]]),
    gauge_loop:HGauge,
    gauge_determinant_mod31:det2(HGauge),
    gauge_trace_mod31:trace2(HGauge),
    gauge_signature_preserved:det2(HGauge)===det2(HConnection)&&trace2(HGauge)===trace2(HConnection)&&connection.gauge_clone.triangle_loops.reverse_equals_forward_inverse===true
  });

  const displacement=freeze({
    positive:partitionTransferDistance(action.positive.pre_partition,action.positive.post_partition),
    flat:partitionTransferDistance(action.positive.pre_partition,action.flat_control.post_partition),
    reverse_restored:partitionTransferDistance(action.positive.pre_partition,action.reverse_control.restored_partition),
    gauge:partitionTransferDistance(action.gauge_control.pre_partition,action.gauge_control.post_partition),
    invariant_readout:partitionTransferDistance(action.invariant_readout_control.partition_before,action.invariant_readout_control.partition_after)
  });
  const bucketProfileHostile=freeze({
    pre:action.positive.pre_partition.bucket_sizes,
    post:action.positive.post_partition.bucket_sizes,
    profiles_equal:equal(action.positive.pre_partition.bucket_sizes,action.positive.post_partition.bucket_sizes),
    partitions_equal:partitionTransferDistance(action.positive.pre_partition,action.positive.post_partition)===0,
    metric_displacement:displacement.positive,
    bucket_profile_insufficient:equal(action.positive.pre_partition.bucket_sizes,action.positive.post_partition.bucket_sizes)&&displacement.positive>0
  });
  let crossUniverseRejected=false;
  try{partitionTransferDistance([['a'],['b']],[['a'],['c']]);}catch{crossUniverseRejected=true;}
  const malformedMetric=malformedDistanceAudit(namedUniverse);
  const orientationHostileRejected=connection.hostile_orientation_control.pair_receipt.orientation_consistent===false&&connection.hostile_orientation_control.classification==='ORIENTATION_INCONSISTENT_EDGE_ASSIGNMENT_REJECTS_CONNECTION_CANDIDATE';

  const geometryPass=baseMetric.passed&&partitionMetric.passed&&partitionMetric.partition_count===15&&partitionMetric.pair_checks===225&&partitionMetric.triple_checks===3375;
  const connectionPass=connection.findings.assay_mechanism_validated===true&&connection.claims.graph_connection_candidate===true&&loopBound&&faceSignature.determinant_mod31===1&&faceSignature.trace_mod31===5&&faceSignature.nonidentity&&faceSignature.gauge_signature_preserved;
  const displacementPass=displacement.positive===2&&displacement.flat===0&&displacement.reverse_restored===0&&displacement.gauge===2&&displacement.invariant_readout===0;
  const hostilePass=orientationHostileRejected&&bucketProfileHostile.bucket_profile_insufficient&&crossUniverseRejected&&malformedMetric.malformed_metric_rejected;
  const parentActionPass=action.findings.assay_mechanism_validated===true;
  const reopeningConditionMet=geometryPass&&connectionPass&&displacementPass&&hostilePass&&parentActionPass;
  const passed=reopeningConditionMet&&REST_LEDGER.empirical_joint_realized===0&&REST_LEDGER.golden_egg_earned===false;

  return freeze({
    schema:GOLDEN_EGG_METRIC_CONNECTION_REOPENING_SCHEMA,
    exact_earned_parent:GOLDEN_EGG_METRIC_CONNECTION_REOPENING_PARENT,
    source_status:'SYNTHETIC_FINITE_REOPENING_ASSAY',
    historical_rest_ledger:REST_LEDGER,
    candidate_geometry:freeze({base_metric:baseMetric,observability_partition_metric:partitionMetric,connection_kind:'INDEPENDENTLY_RECONSTRUCTED_GL2_F31_GRAPH_CONNECTION_CANDIDATE',face_signature:faceSignature}),
    connection_action_binding:freeze({connection_loop:HConnection,observability_loop:HAction,exact_same_loop:loopBound,partition_displacements:displacement}),
    hostiles:freeze({orientation_inconsistent_reverse_rejected:orientationHostileRejected,bucket_profile:bucketProfileHostile,cross_universe_partition_rejected:crossUniverseRejected,malformed_metric:malformedMetric,old_component_ci_witness_retroactively_promoted:false}),
    golden_egg:freeze({
      reopening_condition_met:reopeningConditionMet,
      reopening_trigger:reopeningConditionMet?'NEWLY_DECLARED_CANDIDATE_GEOMETRY_WITH_METRIC_AND_CONNECTION':'NOT_MET',
      information_curvature_frontier:reopeningConditionMet?'REOPENED_FOR_EXPERIMENT_NOT_SOLVED':'REST_BOUND',
      empirical_joint_realization:false,
      empirical_joint_realized_count:0,
      golden_egg_earned:false
    }),
    membranes:freeze({
      geometric_reopening_not_golden_egg_completion:true,
      reopened_frontier_not_empirical_joint_realization:true,
      finite_partition_metric_not_continuum_information_geometry:true,
      graph_connection_not_differential_connection:true,
      face_holonomy_not_physical_holonomy:true,
      partition_displacement_not_curvature_scalar:true,
      nontrivial_holonomy_not_universal_displacement:displacement.positive>0&&displacement.invariant_readout===0,
      bucket_profile_equality_not_partition_identity:bucketProfileHostile.bucket_profile_insufficient,
      current_witness_not_retroactive_old_ci:true
    }),
    claim_ceiling:freeze({physical_geometry:false,continuum_information_geometry:false,differential_connection:false,physical_holonomy:false,physical_curvature:false,berry:false,quantum:false,proto_loom:false,production_authority:false,vercel_authority:false,merge_authority:false}),
    candidate_theorem:reopeningConditionMet?'THE_GOLDEN_EGG_REST_FRONTIER_IS_LAWFULLY_REOPENED_BY_AN_EXACT_FINITE_METRIC_CONNECTION_INFORMATION_GEOMETRY_CANDIDATE_IN_WHICH_AN_INDEPENDENTLY_RECONSTRUCTED_GL2_F31_GRAPH_CONNECTION_HAS_NONTRIVIAL_FACE_HOLONOMY_AND_INDUCES_NONZERO_OBSERVABILITY_PARTITION_METRIC_DISPLACEMENT_FOR_ONE_FIXED_READOUT_WHILE_FLAT_REVERSE_GAUGE_AND_INVARIANT_READOUT_CONTROLS_PRESERVE_THE_REQUIRED_ANISOTROPY_AND_THE_HISTORICAL_EMPIRICAL_JOINT_REALIZATION_COUNT_REMAINS_ZERO':'NOT_EARNED',
    passed
  });
}

export const GOLDEN_EGG_METRIC_CONNECTION_REOPENING_CERTIFICATE=runGoldenEggMetricConnectionReopeningAssay();
