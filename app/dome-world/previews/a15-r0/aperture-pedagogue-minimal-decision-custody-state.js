import {
  auditTypedEpistemicDeficit
} from '../../../engine/aperture-v32-typed-epistemic-deficit.js';
import {
  operatorGeometry
} from './aperture-pedagogue-endogenous-observation-reaudit.js';
import {
  Q_PLUS_REPAIR,
  Q_MINUS_REPAIR
} from './aperture-pedagogue-typed-policy-state-aliasing.js';

export const MINIMAL_DECISION_CUSTODY_STATE_SCHEMA =
  'td613.a15-r0.aperture-pedagogue-minimal-decision-custody-state/v0.1';

const ANCHOR = Object.freeze([1,0]);
const OUTER_MAGNITUDES = Object.freeze([0.0008,0.001,0.0012]);
const CENTRAL_MAGNITUDES = Object.freeze([0,0.0001,0.0002]);
const LOCAL_THRESHOLDS = Object.freeze({
  sigma_min_floor:0.25,
  condition_number_ceiling:10,
  uncertainty_status:'VALID_DECLARED',
  threshold_authority:'A15_R0_SYNTHETIC_LOCAL'
});

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function multiply(matrix,vector) {
  return [
    matrix[0][0]*vector[0] + matrix[0][1]*vector[1],
    matrix[1][0]*vector[0] + matrix[1][1]*vector[1]
  ];
}

function auditRow(row) {
  const geometry = operatorGeometry([ANCHOR,row]);
  const aperture = auditTypedEpistemicDeficit({
    latent_dimension:geometry.latent_dimension,
    current_rank:geometry.rank,
    sigma_min:geometry.sigma_min,
    condition_number:geometry.condition_number,
    ...LOCAL_THRESHOLDS
  });
  return freeze({geometry,aperture});
}

function repairMatrix(action) {
  if (action === 'Q_PLUS_REPAIR') return Q_PLUS_REPAIR;
  if (action === 'Q_MINUS_REPAIR') return Q_MINUS_REPAIR;
  return null;
}

function actionReplay(row,action) {
  const matrix = repairMatrix(action);
  if (!matrix) throw new Error(`Unknown repair ${action}`);
  const terminalRow = multiply(matrix,row);
  const terminalAudit = auditRow(terminalRow);
  return freeze({
    action,
    terminal_row:freeze(terminalRow),
    terminal_audit:terminalAudit,
    closure:terminalAudit.aperture.disposition === 'ASK_NOTHING',
    counterfactual_only:true,
    observation_executed:false
  });
}

function makeState(sign,magnitude,{corruptRoute=false}={}) {
  const signed = sign === 0 ? 0 : sign*magnitude;
  const row = freeze([1,signed]);
  const trueRoute = sign >= 0 ? 'Q_A' : 'Q_B';
  const route = corruptRoute ? (trueRoute === 'Q_A' ? 'Q_B' : 'Q_A') : trueRoute;
  const audit = auditRow(row);
  const outcomes = freeze({
    Q_PLUS_REPAIR:actionReplay(row,'Q_PLUS_REPAIR'),
    Q_MINUS_REPAIR:actionReplay(row,'Q_MINUS_REPAIR')
  });
  return freeze({
    state_id:`${sign < 0 ? 'NEG' : sign > 0 ? 'POS' : 'ZERO'}_${magnitude.toFixed(4)}${corruptRoute ? '_ROUTE_SWAP' : ''}`,
    sign,
    magnitude,
    responsive_row:row,
    true_route:trueRoute,
    route_provenance:route,
    provenance_corrupted:corruptRoute,
    scalar_geometry:audit.geometry,
    aperture:audit.aperture,
    candidate_family:freeze(['Q_PLUS_REPAIR','Q_MINUS_REPAIR']),
    post_action_replay:outcomes
  });
}

export function buildOuterStates({corruptRoute=false}={}) {
  const states=[];
  for (const magnitude of OUTER_MAGNITUDES) {
    states.push(makeState(1,magnitude,{corruptRoute}));
    states.push(makeState(-1,magnitude,{corruptRoute}));
  }
  return freeze(states);
}

export function buildCentralStates() {
  const states=[makeState(0,0)];
  for (const magnitude of CENTRAL_MAGNITUDES.slice(1)) {
    states.push(makeState(1,magnitude));
    states.push(makeState(-1,magnitude));
  }
  return freeze(states);
}

function scalarKey(state) {
  const g=state.scalar_geometry;
  return [state.aperture.deficit_class,g.rank,g.sigma_min.toPrecision(12),g.sigma_max.toPrecision(12),g.condition_number.toPrecision(12)].join('|');
}

export function selectByRepresentation(state,representation) {
  if (representation === 'D0_DEFICIT_CLASS_ONLY') {
    return freeze({action:'Q_PLUS_REPAIR',representation,route_consulted:false,orientation_consulted:false,scalar_geometry_consulted:false});
  }
  if (representation === 'D1_DEFICIT_PLUS_SCALAR_GEOMETRY') {
    return freeze({action:'Q_PLUS_REPAIR',representation,route_consulted:false,orientation_consulted:false,scalar_geometry_consulted:true,scalar_key:scalarKey(state)});
  }
  if (representation === 'D2_DEFICIT_PLUS_SIGNED_ORIENTATION') {
    const y=state.responsive_row[1];
    const action=y > 0 ? 'Q_PLUS_REPAIR' : y < 0 ? 'Q_MINUS_REPAIR' : 'DECISION_EQUIVALENT_NO_PREFERENCE';
    return freeze({action,representation,route_consulted:false,orientation_consulted:true,scalar_geometry_consulted:false});
  }
  if (representation === 'D3_DEFICIT_PLUS_ROUTE_PROVENANCE') {
    const action=state.route_provenance === 'Q_A' ? 'Q_PLUS_REPAIR' : state.route_provenance === 'Q_B' ? 'Q_MINUS_REPAIR' : 'ABSTAIN_ROUTE_STATE_UNDECLARED';
    return freeze({action,representation,route_consulted:true,orientation_consulted:false,scalar_geometry_consulted:false});
  }
  throw new Error(`Unknown decision representation ${representation}`);
}

function replaySelector(states,representation) {
  const routes=states.map(state => {
    const selection=selectByRepresentation(state,representation);
    if (selection.action === 'DECISION_EQUIVALENT_NO_PREFERENCE') {
      return freeze({state,selection,closure:state.post_action_replay.Q_PLUS_REPAIR.closure && state.post_action_replay.Q_MINUS_REPAIR.closure,selected_replay:null});
    }
    if (!repairMatrix(selection.action)) return freeze({state,selection,closure:false,selected_replay:null});
    return freeze({state,selection,closure:state.post_action_replay[selection.action].closure,selected_replay:state.post_action_replay[selection.action]});
  });
  return freeze({representation,routes:freeze(routes),closure_count:routes.filter(route=>route.closure).length,total:routes.length});
}

function verifyOuterScalarPairs(states) {
  const pairs=[];
  for (const magnitude of OUTER_MAGNITUDES) {
    const positive=states.find(state => state.sign===1 && state.magnitude===magnitude);
    const negative=states.find(state => state.sign===-1 && state.magnitude===magnitude);
    pairs.push(freeze({
      magnitude,
      scalar_key_positive:scalarKey(positive),
      scalar_key_negative:scalarKey(negative),
      scalar_matched:scalarKey(positive)===scalarKey(negative),
      opposite_orientation:positive.responsive_row[1]===-negative.responsive_row[1]
    }));
  }
  return freeze(pairs);
}

export function runMinimalDecisionCustodyStateGauntlet() {
  const outer=buildOuterStates();
  const corrupt=buildOuterStates({corruptRoute:true});
  const central=buildCentralStates();
  const pairs=verifyOuterScalarPairs(outer);
  const d0=replaySelector(outer,'D0_DEFICIT_CLASS_ONLY');
  const d1=replaySelector(outer,'D1_DEFICIT_PLUS_SCALAR_GEOMETRY');
  const d2=replaySelector(outer,'D2_DEFICIT_PLUS_SIGNED_ORIENTATION');
  const d3=replaySelector(outer,'D3_DEFICIT_PLUS_ROUTE_PROVENANCE');
  const d2Corrupt=replaySelector(corrupt,'D2_DEFICIT_PLUS_SIGNED_ORIENTATION');
  const d3Corrupt=replaySelector(corrupt,'D3_DEFICIT_PLUS_ROUTE_PROVENANCE');
  const centralBothClose=central.every(state => state.post_action_replay.Q_PLUS_REPAIR.closure && state.post_action_replay.Q_MINUS_REPAIR.closure);
  const custodyRetained=[...outer,...corrupt,...central].every(state => typeof state.route_provenance==='string' && Array.isArray(state.responsive_row) && state.scalar_geometry && state.aperture && state.post_action_replay);

  const passed=
    pairs.every(pair=>pair.scalar_matched && pair.opposite_orientation) &&
    d0.closure_count===3 &&
    d1.closure_count===3 &&
    d2.closure_count===6 &&
    d3.closure_count===6 &&
    d2Corrupt.closure_count===6 &&
    d3Corrupt.closure_count===0 &&
    central.length===5 &&
    centralBothClose &&
    custodyRetained &&
    d2.routes.every(route=>route.selection.route_consulted===false) &&
    d3.routes.every(route=>route.selection.orientation_consulted===false);

  if (!passed) throw new Error('Minimal decision/custody state gauntlet violated an authored expectation.');

  return freeze({
    schema:MINIMAL_DECISION_CUSTODY_STATE_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    outer_scalar_pair_witness:pairs,
    decision_representations:freeze({d0,d1,d2,d3}),
    route_corruption_control:freeze({signed_orientation:d2Corrupt,route_provenance:d3Corrupt}),
    central_decision_equivalence_band:freeze({states:central,both_repairs_close:centralBothClose}),
    custody_packet_retained:custodyRetained,
    decision_state_is_projection_of_custody:true,
    gauntlet_status:'LOCAL_DECISION_STATE_CUSTODY_STATE_SEPARATION_WITNESSED_IN_BOUNDED_SYNTHETIC_FIXTURE',
    bounded_refinement_candidate:'in this finite repair task, signed current orientation preserves the outer exact-repair distinction under declared perturbations while scalar typed state remains aliased; route provenance is equally discriminating when clean but brittle under deliberate label corruption; fuller provenance remains retained in custody even where it is unnecessary for the local action choice',
    anti_equivalences:freeze([
      'decision state != custody state',
      'minimal local action state != sufficient statistic theorem',
      'provenance not needed by selector != provenance not needed by system',
      'same action consequence != same latent state',
      'decision-equivalent band != state equivalence',
      'signed orientation != curvature'
    ]),
    next_learning_action:'TEST_DECISION_STATE_CUSTODY_STATE_SEPARATION_UNDER_NOISY_ORIENTATION_ESTIMATION_AND_PROVENANCE_INDEPENDENCE_CHECKS_BEFORE_ANY_PEDAGOGUE_POLICY_PROMOTION_ACTIVE_LEARNING_CLAIM_OR_HOLONOMY_PROMOTION',
    claims:freeze({
      sufficient_statistic_theorem:false,
      markov_state_theorem:false,
      active_learning:false,
      reinforcement_learning:false,
      optimal_experimental_design:false,
      provenance_unnecessary:false,
      connection:false,
      curvature:false,
      holonomy:false,
      physical_tomography:false,
      proto_loom:false,
      autonomous_experiment_execution:false,
      production_authority:false,
      vercel_authority:false
    }),
    installed_aperture_mutated:false,
    pedagogue_law_promoted:false,
    automatic_execution:false,
    production_mutated:false,
    promotion_authority:false,
    human_closure_required:true
  });
}
