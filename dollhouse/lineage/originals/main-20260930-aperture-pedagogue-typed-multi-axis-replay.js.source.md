import { freeze } from '../../../engine/flowcore-pedagogue-utils.js';
import { runAperturePedagogueReplaySensitivityGateGauntlet } from './aperture-pedagogue-replay-sensitivity-gate.js';
import { buildMossLanternTemporalRoutes } from './moss-lantern-temporal-order-assay.js';

export const APERTURE_PEDAGOGUE_TYPED_MULTI_AXIS_REPLAY_SCHEMA =
  'td613.ash.a15-r0.aperture-pedagogue-typed-multi-axis-replay/v0.1';

const fingerprint = value => JSON.stringify(value);

function coordinate(values, side) {
  if (!Array.isArray(values) || values.length < 2) throw new Error('Declared replay coordinate requires at least two values.');
  if (side === 'LOWER') return values[0];
  if (side === 'UPPER') return values[values.length - 1];
  throw new Error('Replay coordinate side must be LOWER or UPPER.');
}

export function composeTypedMultiAxisReplayReceipt({ measurement_side='LOWER', decision_side='LOWER', route_index=0 }={}) {
  const replay = runAperturePedagogueReplaySensitivityGateGauntlet();
  const measurement = replay.fixtures.F2;
  const decision = replay.fixtures.F3;
  const route = buildMossLanternTemporalRoutes()[route_index];
  if (!route) throw new Error('Declared Moss Lantern route index is unavailable.');

  return freeze({
    schema: APERTURE_PEDAGOGUE_TYPED_MULTI_AXIS_REPLAY_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    manifestly_fictional: true,
    axes: freeze({
      measurement_model: freeze({
        axis_type: 'MEASUREMENT_MODEL',
        source_fixture_id: measurement.fixture_id,
        replay_policy_disposition: measurement.replay_policy_disposition,
        measurement_admissibility: measurement.measurement_admissibility,
        sensitivity_status: measurement.selection_stability,
        coordinate_name: 'rho',
        coordinate_value: coordinate(measurement.measurement_model_coordinate.rho_values, measurement_side),
        coordinate_side: measurement_side
      }),
      decision_specification: freeze({
        axis_type: 'DECISION_SPECIFICATION',
        source_fixture_id: decision.fixture_id,
        replay_policy_disposition: decision.replay_policy_disposition,
        measurement_admissibility: decision.measurement_admissibility,
        sensitivity_status: decision.selection_stability,
        coordinate_name: 's',
        coordinate_value: coordinate(decision.decision_specification_coordinate.s_values, decision_side),
        coordinate_side: decision_side
      }),
      route_provenance: freeze({
        axis_type: 'ROUTE_PROVENANCE',
        source_fixture_id: 'MOSS_LANTERN_ML3_DECLARED_ROUTE_FAMILY',
        route_id: route.route_id,
        operation_order: freeze([...route.operation_order]),
        endpoint: route.endpoint,
        open_boundary: route.open_boundary,
        terminal_action: route.terminal_action,
        route_history_status: 'DECLARED_SYNTHETIC_PROVENANCE'
      })
    }),
    axis_aggregation: 'FORBIDDEN',
    no_scalar_crown: true,
    automatic_execution: false,
    production_mutated: false,
    promotion_authority: false,
    human_closure_required: true
  });
}

export function refuseScalarReplayCollapse(packet, requested_object='confidence') {
  if (!packet || packet.schema !== APERTURE_PEDAGOGUE_TYPED_MULTI_AXIS_REPLAY_SCHEMA) {
    throw new Error('Scalar-collapse refusal requires the governed typed multi-axis replay packet.');
  }
  return freeze({
    status: 'REFUSE_MULTI_AXIS_REPLAY_SCALAR_COLLAPSE',
    requested_object,
    scalar_value: null,
    reason: 'MEASUREMENT_DECISION_AND_ROUTE_AXES_ARE_TYPED_AND_NONAGGREGATED',
    automatic_execution: false
  });
}

export function runAperturePedagogueTypedMultiAxisReplayGauntlet() {
  const baseline = composeTypedMultiAxisReplayReceipt();
  const measurementShift = composeTypedMultiAxisReplayReceipt({ measurement_side:'UPPER' });
  const decisionShift = composeTypedMultiAxisReplayReceipt({ decision_side:'UPPER' });
  const routeShift = composeTypedMultiAxisReplayReceipt({ route_index:1 });
  const scalarRefusal = refuseScalarReplayCollapse(baseline);
  const keys = ['measurement_model','decision_specification','route_provenance'];
  const diff = (left,right) => keys.filter(key => fingerprint(left.axes[key]) !== fingerprint(right.axes[key]));
  const measurementDiff = diff(baseline,measurementShift);
  const decisionDiff = diff(baseline,decisionShift);
  const routeDiff = diff(baseline,routeShift);
  const sameEndpointDifferentRoute = baseline.axes.route_provenance.endpoint === routeShift.axes.route_provenance.endpoint
    && baseline.axes.route_provenance.route_id !== routeShift.axes.route_provenance.route_id
    && fingerprint(baseline.axes.route_provenance.operation_order) !== fingerprint(routeShift.axes.route_provenance.operation_order);

  const passed = keys.every(key => baseline.axes[key]?.axis_type)
    && measurementDiff.length === 1 && measurementDiff[0] === 'measurement_model'
    && decisionDiff.length === 1 && decisionDiff[0] === 'decision_specification'
    && routeDiff.length === 1 && routeDiff[0] === 'route_provenance'
    && sameEndpointDifferentRoute === true
    && baseline.axis_aggregation === 'FORBIDDEN'
    && baseline.no_scalar_crown === true
    && !Object.hasOwn(baseline,'confidence')
    && !Object.hasOwn(baseline,'combined_confidence')
    && scalarRefusal.status === 'REFUSE_MULTI_AXIS_REPLAY_SCALAR_COLLAPSE'
    && scalarRefusal.scalar_value === null;
  if (!passed) throw new Error('Typed multi-axis replay composition gauntlet violated an authored expectation.');

  return freeze({
    schema: APERTURE_PEDAGOGUE_TYPED_MULTI_AXIS_REPLAY_SCHEMA,
    source_status: 'SIMULATED', authority_class: 'A2_DERIVATIONAL', manifestly_fictional: true,
    baseline,
    isolation_controls: freeze({
      measurement_only: freeze({ changed_axes:freeze(measurementDiff), packet:measurementShift }),
      decision_only: freeze({ changed_axes:freeze(decisionDiff), packet:decisionShift }),
      route_only: freeze({ changed_axes:freeze(routeDiff), packet:routeShift, same_endpoint_different_route:sameEndpointDifferentRoute })
    }),
    scalar_collapse_control: scalarRefusal,
    bounded_results: freeze([
      'MEASUREMENT_DECISION_AND_ROUTE_REPLAY_AXES_COMPOSE_WITHOUT_SCALAR_AGGREGATION_IN_BOUNDED_SYNTHETIC_FIXTURE',
      'EACH_DECLARED_AXIS_CAN_BE_PERTURBED_WITHOUT_MUTATING_THE_OTHER_TWO_IN_THIS_FIXTURE',
      'SAME_ENDPOINT_DOES_NOT_ERASE_ROUTE_PROVENANCE',
      'TYPED_MULTI_AXIS_RECEIPT_REFUSES_GENERIC_CONFIDENCE_COLLAPSE'
    ]),
    anti_equivalences: freeze([
      'measurement-model sensitivity != decision-specification sensitivity',
      'decision contingency != epistemic deficit',
      'route difference != endpoint difference',
      'route provenance != confidence',
      'annotation composition != scalar aggregation',
      'multi-axis receipt != universal robustness',
      '#686 evidence != #677 hypothesis promotion'
    ]),
    related_unresolved_pr_evidence: freeze({ pr_number:677, relationship:'NEXT_HOSTILE_PHASE_INPUT_ONLY', hypothesis_id:'H1_CONSEQUENCE_CONSERVATION', hypothesis_status_mutated:false }),
    sibling_pr_684_posture: freeze({ pr_number:684, mutated:false, relationship:'STALE_INGRESS_HISTORY_ONLY' }),
    next_learning_action: 'STAGE_PR_677_AS_NEXT_HOSTILE_PHASE_USING_TYPED_MULTI_AXIS_RECEIPTS_TO_ATTACK_HELD_CONSEQUENCE_CONSERVATION_WITHOUT_PROMOTION',
    no_scalar_crown:true, promotion_authority:false, automatic_execution:false, production_mutated:false,
    standalone_aperture_ui_mutated:false, sibling_pr_677_mutated:false, sibling_pr_684_mutated:false, human_closure_required:true,
    claims: freeze({
      universal_confidence:false, universal_robustness:false, universal_best_question:false, preference_learning:false,
      optimal_experimental_design:false, information_geometry:false, physical_sensor_design:false, physical_tomography:false,
      blind_tomography:false, operator_tomography:false, autonomous_experiment_execution:false, connection:false,
      curvature:false, holonomy:false, berry_structure:false, quantum_behavior:false, proto_loom:false,
      production_authority:false, release_authority:false
    })
  });
}
