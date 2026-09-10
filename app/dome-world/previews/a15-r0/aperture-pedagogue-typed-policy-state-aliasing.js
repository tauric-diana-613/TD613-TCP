import {
  auditTypedEpistemicDeficit
} from '../../../engine/aperture-v32-typed-epistemic-deficit.js';
import {
  operatorGeometry
} from './aperture-pedagogue-endogenous-observation-reaudit.js';
import {
  Q_A_MATRIX,
  Q_B_MATRIX,
  multiplyMatrixVector
} from './aperture-pedagogue-adaptive-sequence-order.js';

export const TYPED_POLICY_STATE_ALIASING_SCHEMA =
  'td613.a15-r0.aperture-pedagogue-typed-policy-state-aliasing/v0.1';

const EPSILON = 0.001;
const TOLERANCE = 1e-10;
const SIGNATURE_TOLERANCES = Object.freeze({ sigma_min:1e-12, sigma_max:1e-12, condition_number:1e-9 });
const ANCHOR = Object.freeze([1,0]);
const INITIAL = Object.freeze([1,0]);
const LOCAL_THRESHOLDS = Object.freeze({
  sigma_min_floor:0.25,
  condition_number_ceiling:10,
  uncertainty_status:'VALID_DECLARED',
  threshold_authority:'A15_R0_SYNTHETIC_LOCAL'
});

export const Q_PLUS_REPAIR = Object.freeze([
  Object.freeze([0.5,-1/(2*EPSILON)]),
  Object.freeze([0.5, 1/(2*EPSILON)])
]);
export const Q_MINUS_REPAIR = Object.freeze([
  Object.freeze([0.5, 1/(2*EPSILON)]),
  Object.freeze([0.5,-1/(2*EPSILON)])
]);

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
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

function routeState(routeId) {
  if (routeId === 'Q_A') {
    const row = multiplyMatrixVector(Q_A_MATRIX,INITIAL);
    return freeze({ route_id:'Q_A', row, audit:auditRow(row) });
  }
  if (routeId === 'Q_B') {
    const row = multiplyMatrixVector(Q_B_MATRIX,INITIAL);
    return freeze({ route_id:'Q_B', row, audit:auditRow(row) });
  }
  throw new Error(`Unknown route ${routeId}`);
}

function repairMatrix(action) {
  if (action === 'Q_PLUS_REPAIR') return Q_PLUS_REPAIR;
  if (action === 'Q_MINUS_REPAIR') return Q_MINUS_REPAIR;
  return null;
}

function terminalConsequence(aperture) {
  if (aperture.disposition === 'ASK_NOTHING') return freeze({recommended_action:'STOP',stop_loss:0,continue_loss:1});
  if (aperture.disposition === 'PROPOSE') return freeze({recommended_action:'CONTINUE_ONE_DECLARED_QUESTION',stop_loss:5,continue_loss:1});
  return freeze({recommended_action:'ABSTAIN',stop_loss:null,continue_loss:null});
}

export function applyRepairToRoute(routeId, action) {
  const state = routeState(routeId);
  const matrix = repairMatrix(action);
  if (!matrix) {
    return freeze({
      ...state,
      class_only_action:action,
      repair_applied:false,
      question_count:1,
      terminal_audit:state.audit,
      closure:false,
      consequence:terminalConsequence(state.audit.aperture)
    });
  }
  const terminalRow = multiplyMatrixVector(matrix,state.row);
  const terminalAudit = auditRow(terminalRow);
  return freeze({
    ...state,
    class_only_action:action,
    repair_applied:true,
    question_count:2,
    terminal_row:terminalRow,
    terminal_audit:terminalAudit,
    closure:terminalAudit.aperture.disposition === 'ASK_NOTHING',
    consequence:terminalConsequence(terminalAudit.aperture)
  });
}

function scalarSignature(state) {
  return freeze({
    deficit_class:state.audit.aperture.deficit_class,
    disposition:state.audit.aperture.disposition,
    rank:state.audit.geometry.rank,
    sigma_min:state.audit.geometry.sigma_min,
    sigma_max:state.audit.geometry.sigma_max,
    condition_number:state.audit.geometry.condition_number
  });
}

function near(left,right,tolerance) {
  return Math.abs(left-right) <= tolerance;
}

export function verifyAliasedScalarPolicyState() {
  const a = routeState('Q_A');
  const b = routeState('Q_B');
  const sa = scalarSignature(a);
  const sb = scalarSignature(b);
  const matched =
    sa.deficit_class === sb.deficit_class &&
    sa.disposition === sb.disposition &&
    sa.rank === sb.rank &&
    near(sa.sigma_min,sb.sigma_min,SIGNATURE_TOLERANCES.sigma_min) &&
    near(sa.sigma_max,sb.sigma_max,SIGNATURE_TOLERANCES.sigma_max) &&
    near(sa.condition_number,sb.condition_number,SIGNATURE_TOLERANCES.condition_number);
  return freeze({
    route_a:a,
    route_b:b,
    signature_a:sa,
    signature_b:sb,
    scalar_signature_matched:matched,
    signed_rows_differ:Math.hypot(a.row[0]-b.row[0],a.row[1]-b.row[1]) > TOLERANCE,
    signed_orientation_in_scalar_signature:false
  });
}

export function replayClassOnlyAction(action) {
  const allowed = ['Q_PLUS_REPAIR','Q_MINUS_REPAIR','ASK_NOTHING','ABSTAIN_POLICY_STATE_UNDECLARED'];
  if (!allowed.includes(action)) throw new Error('class-only action must come from the preregistered action family');
  const routes = freeze([applyRepairToRoute('Q_A',action),applyRepairToRoute('Q_B',action)]);
  return freeze({
    selector_input:'NUMERICAL_STABILITY_DEFICIT',
    action,
    same_action_applied_to_both:true,
    branch_identity_consulted:false,
    signed_orientation_consulted:false,
    future_outcomes_consulted:false,
    consequence_losses_consulted:false,
    routes,
    closure_count:routes.filter(route => route.closure).length,
    automatic_execution:false
  });
}

export function replayRouteCustodyComparator(routeId) {
  if (routeId === 'Q_A') {
    const result = applyRepairToRoute(routeId,'Q_PLUS_REPAIR');
    return freeze({...result,selector_mode:'ROUTE_CUSTODY_COMPARATOR',future_outcomes_consulted:false,consequence_losses_consulted:false});
  }
  if (routeId === 'Q_B') {
    const result = applyRepairToRoute(routeId,'Q_MINUS_REPAIR');
    return freeze({...result,selector_mode:'ROUTE_CUSTODY_COMPARATOR',future_outcomes_consulted:false,consequence_losses_consulted:false});
  }
  return freeze({
    route_id:String(routeId),
    selector_mode:'ROUTE_CUSTODY_COMPARATOR',
    policy_status:'ABSTAIN_ROUTE_STATE_UNDECLARED',
    repair_applied:false,
    question_count:0,
    closure:false,
    future_outcomes_consulted:false,
    consequence_losses_consulted:false,
    automatic_execution:false
  });
}

export function runTypedPolicyStateAliasingGauntlet() {
  const alias = verifyAliasedScalarPolicyState();
  const plus = replayClassOnlyAction('Q_PLUS_REPAIR');
  const minus = replayClassOnlyAction('Q_MINUS_REPAIR');
  const askNothing = replayClassOnlyAction('ASK_NOTHING');
  const abstain = replayClassOnlyAction('ABSTAIN_POLICY_STATE_UNDECLARED');
  const exhaustive = freeze([plus,minus,askNothing,abstain]);
  const maxClassOnlyClosure = Math.max(...exhaustive.map(item => item.closure_count));
  const routeAware = freeze([
    replayRouteCustodyComparator('Q_A'),
    replayRouteCustodyComparator('Q_B')
  ]);
  const routeAwareClosure = routeAware.filter(route => route.closure).length;
  const unknownRoute = replayRouteCustodyComparator('Q_UNKNOWN_ROUTE');

  const passed =
    alias.scalar_signature_matched === true &&
    alias.signed_rows_differ === true &&
    alias.signature_a.deficit_class === 'NUMERICAL_STABILITY_DEFICIT' &&
    alias.signature_a.disposition === 'PROPOSE' &&
    plus.closure_count === 1 &&
    minus.closure_count === 1 &&
    askNothing.closure_count === 0 &&
    abstain.closure_count === 0 &&
    maxClassOnlyClosure === 1 &&
    routeAwareClosure === 2 &&
    routeAware.every(route => route.question_count === 2) &&
    routeAware.every(route => route.future_outcomes_consulted === false) &&
    unknownRoute.policy_status === 'ABSTAIN_ROUTE_STATE_UNDECLARED' &&
    unknownRoute.repair_applied === false;

  if (!passed) throw new Error('Typed policy-state aliasing gauntlet violated an authored expectation.');

  return freeze({
    schema:TYPED_POLICY_STATE_ALIASING_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    alias_witness:alias,
    exhaustive_class_only_actions:exhaustive,
    class_only_max_closure_count:maxClassOnlyClosure,
    route_custody_comparator:freeze({routes:routeAware,closure_count:routeAwareClosure}),
    unknown_route_control:unknownRoute,
    matched_max_question_budget:2,
    consequence_ledger_post_terminal_reaudit:true,
    gauntlet_status:'DEFICIT_CLASS_POLICY_STATE_ALIASING_WITNESSED_IN_BOUNDED_SYNTHETIC_TWO_BRANCH_FIXTURE',
    bounded_refinement_candidate:'in this finite fixture, two states with matched typed deficit and scalar conditioning geometry require incompatible exact repairs; adding one non-class coordinate separates them, while route provenance is not claimed uniquely necessary',
    anti_equivalences:freeze([
      'same deficit class != same future-repair requirement',
      'same singular spectrum != same oriented observation state',
      'conditioning scalar != sufficient policy state',
      'route provenance useful here != route provenance uniquely necessary',
      'route-custody comparator != active learning',
      '2/2 route-aware closure != optimal policy',
      'signed orientation != curvature',
      'repair incompatibility != holonomy'
    ]),
    next_learning_action:'TEST_MINIMAL_DISAMBIGUATING_POLICY_STATE_ACROSS_DEFICIT_CLASS_SCALAR_GEOMETRY_SIGNED_ORIENTATION_AND_ROUTE_PROVENANCE_UNDER_SMALL_PERTURBATIONS_WITHOUT_OPTIMALITY_ACTIVE_LEARNING_OR_HOLONOMY_PROMOTION',
    claims:freeze({
      markov_theorem:false,
      non_markov_theorem:false,
      pomdp_claim:false,
      active_learning_policy:false,
      reinforcement_learning_policy:false,
      optimal_experimental_design:false,
      sufficient_policy_state:false,
      route_provenance_optimality:false,
      connection:false,
      curvature:false,
      berry_structure:false,
      holonomy:false,
      physical_sensor_feedback:false,
      physical_tomography:false,
      quantum_measurement_disturbance:false,
      td613_general_aia_theorem:false,
      proto_loom:false,
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
