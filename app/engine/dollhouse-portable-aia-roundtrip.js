import { LOOM_SEMANTIC_FIELD_SCHEMA } from '../dome-world/holonomy-loom/semantic-field.js';
import {
  PORTABLE_FLOWCORE_CONTROL_SCHEMA,
  createPortableFlowcoreControl,
  runFadtAgent
} from './dollhouse-atlas-fadt.js';

export const DOLLHOUSE_PORTABLE_PROJECTION_SCHEMA = 'td613.dollhouse.portable-aia-projection/v0.1';
export const DOLLHOUSE_PORTABLE_RETURN_SCHEMA = 'td613.dollhouse.portable-aia-return/v0.1';
export const DOLLHOUSE_PORTABLE_REVALIDATION_SCHEMA = 'td613.dollhouse.portable-aia-revalidation/v0.1';

export const DOLLHOUSE_PORTABLE_RECEIVERS = Object.freeze(['child', 'auditor', 'companion']);
export const DOLLHOUSE_PORTABLE_OPERATIONS = Object.freeze([
  'EXPLAIN_STATE',
  'TRACE_FLOWCORE',
  'PROPOSE_ACTION',
  'REPORT_MISSINGNESS'
]);

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function sameControlValue(origin, returned) {
  if (origin === returned) return true;
  if (!origin || !returned || typeof origin !== 'object' || typeof returned !== 'object') return false;
  if (Array.isArray(origin) !== Array.isArray(returned)) return false;
  if (Array.isArray(origin) && origin.length !== returned.length) return false;
  const prototype = Object.getPrototypeOf(returned);
  if (!Array.isArray(returned) && prototype !== Object.prototype && prototype !== null) return false;
  const originKeys = Object.keys(origin);
  const returnedKeys = Object.keys(returned);
  return originKeys.length === returnedKeys.length && originKeys.every(key =>
    Object.hasOwn(returned, key) && sameControlValue(origin[key], returned[key])
  );
}

function requireSemanticField(packet) {
  if (!packet || typeof packet !== 'object' || packet.schema !== LOOM_SEMANTIC_FIELD_SCHEMA) {
    throw new TypeError(`Portable AIA roundtrip requires ${LOOM_SEMANTIC_FIELD_SCHEMA}.`);
  }
  return packet;
}

function requireReceiver(receiver) {
  const value = String(receiver || '').toLowerCase();
  if (!DOLLHOUSE_PORTABLE_RECEIVERS.includes(value)) throw new TypeError(`Unsupported Portable AIA receiver: ${receiver}`);
  return value;
}

function actionSupport(control) {
  const actions = ['EXIT', 'REST', 'RETURN', 'SHOW_PATH'];
  if (control?.governance?.safer_copy_available === true) actions.push('MAKE_SAFER_COPY');
  if (control?.governance?.raw_release_allowed === true) actions.push('COPY_CHECKED_MESSAGE');
  return actions.sort();
}

function presentationFor(packet, control, receiver) {
  if (receiver === 'child') {
    return freeze({
      mode: 'CHILD_LEGIBLE',
      consequence: String(packet.scene?.consequence || ''),
      next: String(packet.scene?.next || ''),
      flow_core_trace: control.flow_core.glyph_trace,
      instruction: 'Use the legend to explain the relation; do not widen authority.'
    });
  }
  if (receiver === 'auditor') {
    return freeze({
      mode: 'AUDITOR',
      source_revision: control.source_revision,
      scene_id: control.scene_id,
      governance: control.governance,
      evidentiary_coordinates: control.evidentiary_coordinates,
      route_state: control.route_state,
      flow_core: control.flow_core,
      claim_ceiling: control.claim_ceiling
    });
  }
  return freeze({
    mode: 'FLOWCORE_GUIDED_COMPANION',
    host_posture: 'post-ingress-onward-bounded-companion',
    instruction_order: [
      'READ_CONTROL_GRAMMAR',
      'PRESERVE_CLAIM_CEILING',
      'OPERATE_ONLY_WITH_DECLARED_OPERATION',
      'KEEP_HOST_OBSERVATION_SEPARATE_FROM_ORIGIN_CONTROL',
      'RETURN_STRUCTURED_CANDIDATE_FOR_REVALIDATION'
    ],
    flow_core_trace: control.flow_core.glyph_trace,
    flow_core_legend: control.flow_core.legend,
    allowed_operations: DOLLHOUSE_PORTABLE_OPERATIONS,
    admissible_actions: actionSupport(control),
    return_rule: 'structured-candidate-only-then-loom-revalidation'
  });
}

/**
 * Projects one admitted Loom state to a declared receiver without transferring authority.
 */
export function compileDollhousePortableProjection(packet, { receiver = 'companion' } = {}) {
  const field = requireSemanticField(packet);
  const target = requireReceiver(receiver);
  const control = createPortableFlowcoreControl(field);
  return freeze({
    schema: DOLLHOUSE_PORTABLE_PROJECTION_SCHEMA,
    receiver: target,
    control,
    presentation: presentationFor(field, control, target),
    admissible_actions: actionSupport(control),
    authority: {
      host_release: false,
      provider_release: false,
      source_mutation: false,
      deployment: false,
      td613_release_transferred: false,
      human_closure_required: true
    },
    raw_source_included: false,
    operational_portability_claim: 'bounded-control-grammar-remains-usable-under-declared-receiver-change',
    packetization_claim: 'carrier-only'
  });
}

function boundedMissingness(values) {
  if (values === undefined) return [];
  if (!Array.isArray(values)) throw new TypeError('reportedMissingness must be an array.');
  if (values.length > 16) throw new TypeError('reportedMissingness exceeds bounded return capacity.');
  return values.map((value, index) => {
    const text = String(value || '').trim();
    if (!text || text.length > 240) throw new TypeError(`reportedMissingness[${index}] must be 1..240 characters.`);
    return text;
  });
}

/**
 * Synthetic host-side operation used by the Dollhouse battery. It never calls a provider.
 */
export function operateDollhousePortableProjection(projection, input = {}) {
  if (!projection || projection.schema !== DOLLHOUSE_PORTABLE_PROJECTION_SCHEMA) {
    throw new TypeError('Portable AIA projection required.');
  }
  const allowedKeys = ['operation', 'proposedAction', 'reportedMissingness'];
  for (const key of Object.keys(input || {})) {
    if (!allowedKeys.includes(key)) throw new TypeError(`Unsupported companion operation field: ${key}`);
  }
  const operation = String(input.operation || 'EXPLAIN_STATE').toUpperCase();
  if (!DOLLHOUSE_PORTABLE_OPERATIONS.includes(operation)) throw new TypeError(`Unsupported companion operation: ${operation}`);
  const proposedAction = input.proposedAction == null ? null : String(input.proposedAction).toUpperCase();
  if (operation === 'PROPOSE_ACTION' && !proposedAction) throw new TypeError('PROPOSE_ACTION requires proposedAction.');
  if (operation !== 'PROPOSE_ACTION' && proposedAction) throw new TypeError(`${operation} cannot carry proposedAction.`);
  const reportedMissingness = boundedMissingness(input.reportedMissingness);
  if (operation !== 'REPORT_MISSINGNESS' && reportedMissingness.length) {
    throw new TypeError(`${operation} cannot carry reportedMissingness.`);
  }

  return freeze({
    schema: DOLLHOUSE_PORTABLE_RETURN_SCHEMA,
    source_receiver: projection.receiver,
    operation,
    returned_control: projection.control,
    flow_core_trace: projection.control.flow_core.glyph_trace,
    proposed_action: proposedAction,
    reported_missingness: reportedMissingness,
    host_observation_is_advisory: true,
    candidate_trusted: false,
    release_authority: false,
    must_revalidate: true
  });
}

function requireReturnCandidate(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate) || candidate.schema !== DOLLHOUSE_PORTABLE_RETURN_SCHEMA) {
    throw new TypeError('Structured Portable AIA return candidate required; glyph-only or prose-only return is insufficient.');
  }
  if (!candidate.returned_control || candidate.returned_control.schema !== PORTABLE_FLOWCORE_CONTROL_SCHEMA) {
    throw new TypeError('Return candidate requires the versioned Flow-Core control envelope, not a bare glyph trace.');
  }
  const requiredKeys = [
    'schema', 'source_receiver', 'operation', 'returned_control', 'flow_core_trace',
    'proposed_action', 'reported_missingness', 'host_observation_is_advisory',
    'candidate_trusted', 'release_authority', 'must_revalidate'
  ];
  if (Object.keys(candidate).length !== requiredKeys.length || requiredKeys.some(key => !Object.hasOwn(candidate, key))) {
    throw new TypeError('Return candidate must contain exactly the declared structured return fields.');
  }
  if (!DOLLHOUSE_PORTABLE_RECEIVERS.includes(candidate.source_receiver)) {
    throw new TypeError('Return candidate requires a declared Portable AIA receiver.');
  }
  if (!DOLLHOUSE_PORTABLE_OPERATIONS.includes(candidate.operation)) {
    throw new TypeError('Return candidate requires a declared Portable AIA operation.');
  }
  if (candidate.candidate_trusted !== false || candidate.release_authority !== false ||
      candidate.must_revalidate !== true || candidate.host_observation_is_advisory !== true) {
    throw new TypeError('Return candidate must preserve untrusted, advisory, no-release, revalidation-required authority boundaries.');
  }
  if (typeof candidate.flow_core_trace !== 'string') {
    throw new TypeError('Return candidate flow_core_trace must be a string.');
  }
  if (candidate.operation === 'PROPOSE_ACTION') {
    if (typeof candidate.proposed_action !== 'string' || !candidate.proposed_action.trim()) {
      throw new TypeError('PROPOSE_ACTION return requires a proposed_action string.');
    }
  } else if (candidate.proposed_action !== null) {
    throw new TypeError(`${candidate.operation} return cannot carry proposed_action.`);
  }
  const missingness = candidate.reported_missingness;
  if (!Array.isArray(missingness) || missingness.length > 16 ||
      Array.from(missingness).some(value => typeof value !== 'string' || !value.trim() || value.length > 240)) {
    throw new TypeError('Return candidate reported_missingness must contain at most 16 strings of 1..240 characters.');
  }
  if (candidate.operation !== 'REPORT_MISSINGNESS' && missingness.length) {
    throw new TypeError(`${candidate.operation} return cannot carry reported_missingness.`);
  }
  return candidate;
}

/**
 * Revalidates a returned candidate against origin state. Atlas-style control equality and
 * FADT action-support constancy must both survive before anything may be shown to a human.
 */
export function revalidateDollhousePortableReturn(packet, candidate) {
  const field = requireSemanticField(packet);
  const returned = requireReturnCandidate(candidate);
  const originControl = createPortableFlowcoreControl(field);
  const returnedControl = returned.returned_control;
  const controlMatch = sameControlValue(originControl, returnedControl);
  const traceMatch = String(returned.flow_core_trace || '') === originControl.flow_core.glyph_trace;
  const originSupport = actionSupport(originControl);
  const returnedSupport = actionSupport(returnedControl);
  const fadt = runFadtAgent({
    fibres: [{
      id: `roundtrip:${originControl.scene_id}:action-support`,
      antecedents: [
        { id: 'origin', support: originSupport },
        { id: 'returned', support: returnedSupport }
      ]
    }]
  });
  const proposedActionAllowed = returned.proposed_action == null || originSupport.includes(returned.proposed_action);
  const pass = controlMatch && traceMatch && fadt.all_fibres_exact && proposedActionAllowed;
  const reasons = [];
  if (!controlMatch) reasons.push('CONTROL_PLANE_DRIFT');
  if (!traceMatch) reasons.push('FLOWCORE_TRACE_DRIFT');
  if (!fadt.all_fibres_exact) reasons.push('FADT_ADMISSIBILITY_GAP');
  if (!proposedActionAllowed) reasons.push('PROPOSED_ACTION_OUTSIDE_ORIGIN_SUPPORT');

  return freeze({
    schema: DOLLHOUSE_PORTABLE_REVALIDATION_SCHEMA,
    status: pass ? 'PRESENT_TO_HUMAN' : 'HOLD',
    candidate_trusted: false,
    release_authority: false,
    human_closure_required: true,
    atlas: {
      control_plane_equal: controlMatch,
      flow_core_trace_equal: traceMatch
    },
    fadt,
    action: {
      origin_support: originSupport,
      returned_support: returnedSupport,
      proposed_action: returned.proposed_action,
      proposed_action_admissible: proposedActionAllowed
    },
    host_reported_missingness: [...returned.reported_missingness],
    host_reported_missingness_promoted_to_origin_fact: false,
    reason_codes: reasons,
    projection_comparison: {
      receiver: returned.source_receiver,
      control_changed: !controlMatch,
      admissibility_changed: !fadt.all_fibres_exact,
      presentation_may_change: true,
      research_bridge: 'eligible-for-later-phasonic-supermoire-projection-comparison-no-physical-or-empirical-geometry-credit'
    },
    authority: {
      source_mutation: false,
      provider_release: false,
      deployment: false,
      merge: false,
      vercel: false
    }
  });
}
