import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import { PHASONIC_CUPOLA_CUSTODY_WITNESS } from './phasonic-supermoire-dromological-tomography.js';
import { finiteDistinguishabilityTrajectoryCalculusCertificate } from './finite-distinguishability-trajectory-calculus.js';
import {
  TRAJECTORY_CUSTODY_FUNCTIONAL_CLOSURE_SCHEMA,
  TRAJECTORY_CUSTODY_FUNCTIONAL_CLOSURE_PARENT_RECEIPT,
  trajectoryCustodyFunctionalClosureCertificate as initialClosureCertificate,
  rejectTrajectoryCustodyFunctionalClosureOverreach,
} from './trajectory-custody-functional-closure.js';

const EXPECTED_858 = Object.freeze({
  '2':82,'3':36,'5':298,'6':48,'10':90,'15':36,'25':88,'30':64,
  '50':88,'75':16,'125':18,'150':32,'250':18,'375':36,'750':72,
});
const EXPECTED_862 = Object.freeze({
  '5':4,'10':4,'15':8,'25':4,'30':16,'50':4,'75':8,'125':18,
  '150':16,'250':18,'375':36,'750':72,
});
const EXPECTED_SCALAR = Object.freeze({
  '5->5': Object.freeze({ count:24, m0:Object.freeze({'5':4,'10':4,'15':8,'25':2,'50':2,'75':4}) }),
  '5->10': Object.freeze({ count:24, m0:Object.freeze({'30':16,'150':8}) }),
  '5->25': Object.freeze({ count:80, m0:Object.freeze({'25':2,'50':2,'75':4,'125':18,'250':18,'375':36}) }),
  '5->50': Object.freeze({ count:80, m0:Object.freeze({'150':8,'750':72}) }),
});
const EXPECTED_MARGINAL = Object.freeze({
  '25x5|5x5': Object.freeze({ count:16, m0:Object.freeze({'5':2,'10':2,'15':4,'25':2,'50':2,'75':4}) }),
  '25x5|5x10': Object.freeze({ count:16, m0:Object.freeze({'30':8,'150':8}) }),
  '25x5|5x25': Object.freeze({ count:80, m0:Object.freeze({'25':2,'50':2,'75':4,'125':18,'250':18,'375':36}) }),
  '25x5|5x50': Object.freeze({ count:80, m0:Object.freeze({'150':8,'750':72}) }),
  '9x5|9x5': Object.freeze({ count:8, m0:Object.freeze({'5':2,'10':2,'15':4}) }),
  '9x5|9x10': Object.freeze({ count:8, m0:Object.freeze({'30':8}) }),
});
const AUTHORITY_KEYS = Object.freeze([
  'inverse','encoder','custody_mutation','source_state_transform','new_sensor_measurement',
  'release','production','physical_claim','continuum_claim','cryptographic_key',
  'authentication_credential','retrocausal_channel','retention_policy',
]);

let cachedCertificate = null;

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
const canonical=value=>JSON.stringify(value);
const normalizeRecord=record=>Object.fromEntries(Object.entries(record).sort(([a],[b])=>a.localeCompare(b)));
const sameRecord=(left,right)=>canonical(normalizeRecord(left))===canonical(normalizeRecord(right));
const zeroAuthority=()=>freeze(Object.fromEntries(AUTHORITY_KEYS.map(key=>[key,false])));

function named860Exact(replay) {
  return replay.same_endpoint_witnesses?.length===2
    && replay.same_endpoint_witnesses.every(w=>['P-H-I','P-I-H'].includes(w.schedule_id)
      && w.bundle_id==='X2+X3'
      && w.paths?.[0]?.intermediate===1&&w.paths[0].md===25&&w.paths[0].mc===25&&w.paths[0].transportable===true
      && w.paths?.[1]?.intermediate===2&&w.paths[1].md===5&&w.paths[1].mc===25&&w.paths[1].transportable===false);
}

function named864Exact(replay) {
  const left=replay.named_alias?.left,right=replay.named_alias?.right;
  return left?.bundle_size===2&&right?.bundle_size===2
    && left.q2_profile===right.q2_profile&&left.q1_profile===right.q1_profile
    && left.m0===375&&right.m0===25&&replay.named_alias?.ratio===15;
}

function correctedExact(initial) {
  const r858=initial.replay_858,r860=initial.replay_860,r862=initial.replay_862,r864=initial.replay_864;
  return initial.execution_ledger?.stage_maximum_recoveries===3048
    && initial.execution_ledger?.cross_theorem_row_comparisons===2380
    && r858?.total===1180&&r858.unsafe===1022&&r858.safe===158&&sameRecord(r858.unsafe_distribution,EXPECTED_858)&&r858.maximum===750&&r858.safe_failures===0
    && r860?.paths===784&&r860.plateau===42&&r860.rupture===742&&r860.decrease===0&&r860.endpoint_two_path_groups===208&&r860.mixed_transport_endpoint_groups===2&&r860.maximum_expansion===745&&named860Exact(r860)
    && r862?.contexts===208&&r862.all_m2===5&&sameRecord(r862.robust_distribution,EXPECTED_862)&&r862.local_to_robust_plateau===4&&r862.anticipatory_expansion===204&&r862.five_to_750===72
    && r862.signatures?.['FLAT->FLAT']===4&&r862.signatures?.['FLAT->EXPAND']===20&&r862.signatures?.['EXPAND->FLAT']===2&&r862.signatures?.['EXPAND->EXPAND']===182
    && r864?.contexts===208&&sameRecord(r864.scalar_classes,EXPECTED_SCALAR)&&sameRecord(r864.marginal_classes,EXPECTED_MARGINAL)
    && r864.scalar_class_count===4&&r864.scalar_ambiguous_class_count===4&&r864.marginal_class_count===6&&r864.marginal_ambiguous_class_count===5&&r864.marginal_identifying_class_count===1
    && r864.ambiguous_contexts===200&&r864.identifying_contexts===8&&named864Exact(r864)
    && Object.values(initial.parent_matches??{}).every(Boolean);
}

export function trajectoryCustodyFunctionalClosureCanonicalCertificate() {
  if(cachedCertificate) return cachedCertificate;
  const parent=finiteDistinguishabilityTrajectoryCalculusCertificate();
  const initial=initialClosureCertificate();
  const exact=correctedExact(initial);
  const passed=parent.passed
    && TRAJECTORY_CUSTODY_FUNCTIONAL_CLOSURE_PARENT_RECEIPT==='a5a073bdf18cd1b7155422b4bd562de9c80aa3f5'
    && initial.parent_receipt===TRAJECTORY_CUSTODY_FUNCTIONAL_CLOSURE_PARENT_RECEIPT
    && exact;

  cachedCertificate=freeze({
    schema:TRAJECTORY_CUSTODY_FUNCTIONAL_CLOSURE_SCHEMA,
    parent_receipt:TRAJECTORY_CUSTODY_FUNCTIONAL_CLOSURE_PARENT_RECEIPT,
    initial_implementation_passed:initial.passed,
    prehostile_repair:freeze({
      kind:'OBJECT_KEY_INSERTION_ORDER_COMPARISON_ONLY',
      scientific_counts_changed:false,
      theorem_changed:false,
      initial_specimen_preserved:true,
      corrected_comparison:'NORMALIZED_TOP_LEVEL_KEY_VALUE_IDENTITY',
    }),
    hierarchy:initial.hierarchy,
    replay_858:initial.replay_858,
    replay_860:initial.replay_860,
    replay_862:initial.replay_862,
    replay_864:initial.replay_864,
    parent_matches:initial.parent_matches,
    execution_ledger:initial.execution_ledger,
    exact,passed,
    classifications:freeze(passed?[
      'IN_THE_FIXED_S3_REGISTERED_STAGE_DOMAIN_THE_SUPPORT_LABELLED_AMBIENT_DISTINGUISHABILITY_TRAJECTORY_TOGETHER_WITH_THE_INHERITED_AUTHORITY_BIRTH_INDEX_EXACTLY_REPLAYS_THE_EARNED_POST_RECOMPRESSION_RESTORATION_PATH_TRANSPORT_ANTICIPATORY_HORIZON_AND_TWO_SURFACE_ALIASING_CENSUSES',
      'THE_STAGE_MAXIMUM_VECTOR_CONDITIONAL_ON_THE_INHERITED_BIRTH_INDEX_IS_SUFFICIENT_FOR_THE_DECLARED_SCALAR_CARDINALITY_CUSTODY_FUNCTIONALS_OF_858_860_AND_862_IN_THE_FIXED_DOMAIN',
      'THE_864_TWO_SURFACE_MARGINAL_ALIASING_CENSUS_REQUIRES_PER_FIBRE_CARDINALITY_PROFILES_BEYOND_STAGE_MAXIMA_WHILE_866_SUPPORT_UNION_SEMANTICS_REQUIRE_SUPPORT_IDENTITY_ON_THE_AMBIENT_MERGE_TRAJECTORY',
      'THE_FIXED_WESTERN_CUSTODY_FRONTIER_FOR_858_860_862_864_FACTORS_THROUGH_EXPLICIT_LOSSY_PROJECTIONS_OF_THE_866_TRAJECTORY_WITHOUT_COLLAPSING_THE_TRAJECTORY_TO_ANY_ONE_OF_THOSE_PROJECTIONS',
    ]:[]),
    scars:freeze([
      ...initial.scars,
      'OBJECT_KEY_INSERTION_ORDER != FINITE_CENSUS_IDENTITY',
      'PRE_HOSTILE_BOOKKEEPING_REPAIR != SCIENTIFIC_RED',
      'PRE_HOSTILE_BOOKKEEPING_REPAIR != THEOREM_WEAKENING',
      'INITIAL_IMPLEMENTATION_SPECIMEN != CANONICAL_CLOSURE_CERTIFICATE',
    ]),
  });
  return cachedCertificate;
}

export function compileTrajectoryCustodyFunctionalClosureCanonicalProjection(receiver) {
  const certificate=trajectoryCustodyFunctionalClosureCanonicalCertificate();
  if(!certificate.passed) throw new Error('cannot project uncertified canonical trajectory custody-functional closure');
  let payload;
  if(receiver===AIA_RECEIVERS.ASH) payload=freeze({
    payload_schema:'td613.dome-world.trajectory-custody-functional-closure-child-legible/v0.1',
    truths:freeze([
      'THE_FULL_MERGE_TRAJECTORY_CAN_BE_COMPRESSED_TO_SMALLER_SUMMARIES_FOR_SOME_CUSTODY_QUESTIONS_BUT_NOT_FOR_ALL_OF_THE_SEMANTIC_TESTS_WE_ALREADY_EARNED',
      'THE_AUTHORITY_BIRTH_LEDGER_STAYS_SEPARATE_FROM_THE_SUPPORT_TRAJECTORY',
      'REPLAYING_ALL_PRIOR_CUSTODY_CENSUSES_SHOWS_THE_TRAJECTORY_IS_A_COMMON_FINITE_CARRIER_WITHOUT_MAKING_IT_A_UNIVERSAL_ANSWER_OBJECT',
    ]),
    stage_maximum_recoveries:certificate.execution_ledger.stage_maximum_recoveries,
    cross_theorem_row_comparisons:certificate.execution_ledger.cross_theorem_row_comparisons,
    full_support_tables_exposed:false,full_birth_table_exposed:false,full_replay_rows_exposed:false,
  });
  else if(receiver===AIA_RECEIVERS.LOOM) payload=freeze({
    payload_schema:'td613.dome-world.trajectory-custody-functional-closure-loom-technical/v0.1',
    stage_maximum_recoveries:certificate.execution_ledger.stage_maximum_recoveries,
    replay_rows:freeze({r858:1180,r860:784,r862:208,r864:208,total:2380}),
    parent_matches:certificate.parent_matches,
    full_support_tables_exposed:false,full_birth_table_exposed:false,full_replay_rows_exposed:false,
  });
  else throw new Error(`undeclared canonical closure receiver ${receiver}`);
  return freeze({
    schema:TRAJECTORY_CUSTODY_FUNCTIONAL_CLOSURE_SCHEMA,receiver,
    custody_witness:PHASONIC_CUPOLA_CUSTODY_WITNESS,payload,authority:zeroAuthority(),research_only:true,runtime_binding:false,
    claim_ceiling:freeze({
      universal_sufficient_statistic:false,universal_encoding_minimality:false,shannon_capacity:false,entropy:false,mutual_information:false,
      physical_holonomy:false,operational_path_groupoid:false,source_state_mutation:false,retrocausality:false,
      merge:false,deploy:false,publish:false,release:false,vercel:false,
    }),
  });
}

export { rejectTrajectoryCustodyFunctionalClosureOverreach };
