import { compilePedagogicalScene, compilePedagogicalTransition } from '../../engine/flowcore-pedagogue-core.js';
import { AIA_ROUTE_IDS, compileAIAView, verifyAIAInvariants } from '../../engine/flowcore-pedagogue-aia.js';
import { compileRouteGraph } from '../../engine/flowcore-route-burden.js';
import { renderPedagogueScene } from '../flowcore-pedagogue-visual.js';
import { FLOWCORE_GLYPH_REGISTRY } from '../data/flowcore-glyph-semantics-v01.js';

/** A projection of client request observations, not a second request engine.
 * #1017 supplies the canonical scene/phase → graph boundary; its Ash theorem
 * is not inherited here. #1045 supplies compiler-backed presentation, not its
 * fictional scenes. No operator NOTICE/ACT trace is manufactured from a fetch.
 */
export const LOOM_INSTRUMENT_STATE_VIEW_SCHEMA = 'td613.loom.instrument-state-view/v0.1';
const PHASES = new Set(['prepared', 'checking', 'pending', 'received', 'completed', 'held']);
// These are supplied observations of client route actions. They neither imply
// a model request nor give this display a custody capability.
const ROUTE_EVENTS = new Set(['HANDOFF_DISPATCHED', 'RETURN_CHECKED', 'RETURN_ADMITTED', 'RETURN_HELD']);
const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const PROJECTION_EPOCH = '1970-01-01T00:00:00Z';
const AUTHORITY = Object.freeze({
  flowcore_commands_station: false, automatic_release: false, automatic_redesign: false,
  station_mutation_authorized: false, authority_may_cross: false,
  provider_call_authorized: false, custody_admission_authorized: false,
  deployment_authorized: false, human_closure_required: true
});
const CEILING = Object.freeze({
  allowed_claims: Object.freeze([
    'The display projects the supplied client request events and explicitly labeled model reports.',
    'The canonical compiler preserves four distinct AIA inspection routes over these bounded observations.'
  ]),
  forbidden_claims: Object.freeze([
    'Client submission proves provider execution or hidden provider activity.',
    'Local task binding verifies a returned response.',
    'A completed request or local FADT check creates new custody admission.',
    'A model source reference proves source use, foreign origin, or downstream enforcement.',
    'A declared source revision authenticates source bytes.',
    'This display records an operator notice or gesture that the request event did not capture.',
    'Compiler or browser success measures human comprehension.',
    'A display projection is identical to external state.'
  ])
});
const LABELS = Object.freeze({
  gathering: 'Selected inputs gather', recurrence: 'Recorded selection recurs',
  release: 'Packet submitted', created_potential: 'Local task binding ready',
  released_tendency: 'Response reached the tab', protected_continuity: 'Local files excluded',
  bounded_emergence: 'Returned work available for review', structural_rest: 'Demand stops; history remains'
});

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}
function plain(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw new TypeError(`${label} must be a plain object.`);
  return value;
}
// Inspect only admitted fields. Payloads, local names, credentials and unknown
// fields are neither read nor retained; accessors cannot supply admitted facts.
function field(value, key) {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (!descriptor) return undefined;
  if (!('value' in descriptor)) throw new TypeError(`${key} must be a data field.`);
  return descriptor.value;
}
function text(value, label, limit = 1000) {
  if (typeof value !== 'string' || !value.trim() || value.length > limit) throw new TypeError(`Invalid ${label}.`);
  return value;
}
function count(value, label, limit = 4096) {
  if (!Number.isSafeInteger(value) || value < 0 || value > limit) throw new TypeError(`Invalid ${label}.`);
  return value;
}
function strings(value, label, limit, unique = false) {
  if (!Array.isArray(value) || value.length > limit || Object.keys(value).length !== value.length) throw new TypeError(`Invalid ${label}.`);
  const result = Array.from({ length: value.length }, (_, index) => text(field(value, String(index)), label));
  if (unique && new Set(result).size !== result.length) throw new TypeError(`Duplicate ${label}.`);
  return result;
}
function bool(value, label) {
  if (value !== undefined && typeof value !== 'boolean') throw new TypeError(`${label} must be boolean.`);
  return value ?? null;
}
function revision(value) {
  if (typeof value !== 'string' || !/^(working-tree|browser-unpinned|[a-f0-9]{40})$/.test(value)) throw new TypeError('sourceRevision must be working-tree, browser-unpinned, or a lowercase 40-character commit SHA.');
  return value;
}
function observedEvent(input) {
  const packet = plain(input, 'Request event');
  const phase = field(packet, 'phase');
  if (!PHASES.has(phase)) throw new TypeError('Unknown request event phase.');
  const at = field(packet, 'at') ?? null;
  if (at !== null && (typeof at !== 'string' || !RFC3339.test(at) || !Number.isFinite(Date.parse(at))
    || new Date(at).toISOString().replace(/\.000Z$/, 'Z') !== at.replace(/\.000Z$/, 'Z'))) throw new TypeError('Event at must be UTC RFC3339.');
  const requestId = field(packet, 'request_id') ?? null;
  if (requestId !== null) text(requestId, 'request identity', 120);
  const shared = count(field(packet, 'shared') ?? 0, 'selected count');
  const local = count(field(packet, 'local') ?? 0, 'local count');
  const selectedValue = field(packet, 'selected_document_ids');
  const selected = selectedValue === undefined ? null : strings(selectedValue, 'selected document identities', 8, true);
  if (selected && selected.length !== shared) throw new TypeError('Selected identities must match the declared count.');
  const usedValue = field(packet, 'used_document_ids');
  const used = usedValue === undefined ? null : strings(usedValue, 'model source references', 8, true);
  if (used && (!selected || used.some(id => !selected.includes(id)))) throw new TypeError('Model source references must belong to the selected identities.');
  const missingValue = field(packet, 'missing_information');
  const missing = missingValue === undefined ? null : strings(missingValue, 'model missingness', 32);
  const sceneValue = field(packet, 'scene');
  const scene = sceneValue === undefined ? null : plain(sceneValue, 'scene');
  const rules = count((scene && field(scene, 'rules_count')) ?? field(packet, 'rules_count') ?? 0, 'rule count', 1024);
  const failureValue = field(packet, 'provider_failure');
  const failure = failureValue === undefined ? null : plain(failureValue, 'provider_failure');
  const diagnosticValue = failure && field(failure, 'diagnostic');
  const diagnostic = diagnosticValue == null ? null : plain(diagnosticValue, 'failure diagnostic');
  const stage = diagnostic && field(diagnostic, 'stage');
  const failureStage = stage == null ? null : text(stage, 'failure stage', 120);
  const aiaValue = field(packet, 'aia');
  const aia = aiaValue === undefined ? null : plain(aiaValue, 'aia');
  const projectionValue = aia && field(aia, 'projection_family_verified');
  const projectionVerified = projectionValue == null ? null : typeof projectionValue === 'boolean'
    ? projectionValue : bool(field(plain(projectionValue, 'AIA verification'), 'all_invariants_preserved'), 'AIA verification');
  const sourceValue = field(packet, 'source');
  const source = sourceValue === undefined ? null : plain(sourceValue, 'source');
  const declaredRevision = source && field(source, 'revision');
  const geometryValue = field(packet, 'geometry');
  const geometry = geometryValue === undefined ? null : plain(geometryValue, 'geometry');
  const routeEvent = field(packet, 'route_event') ?? null;
  if (routeEvent !== null && !ROUTE_EVENTS.has(routeEvent)) throw new TypeError('Unknown client route event.');
  return freeze({
    phase, at, request_id: requestId, shared, local, rules_count: rules,
    task_present: bool(field(packet, 'task_present'), 'task_present'), route_event: routeEvent,
    selected_document_ids: selected, used_document_ids: used, missing_information: missing,
    outbound_submitted: bool(field(packet, 'outbound_submitted'), 'outbound_submitted'),
    response_received: bool(field(packet, 'response_received'), 'response_received'),
    binding_verified: bool(field(packet, 'binding_verified'), 'binding_verified'),
    provider_failure: failure !== null, failure_stage: failureStage,
    fadt_task_authorization: aia ? bool(field(aia, 'fadt_admission'), 'FADT task authorization') : null,
    aia_projection_family_verified: projectionVerified,
    declared_source_revision: declaredRevision == null ? null : revision(declaredRevision),
    display_rest: geometry ? bool(field(geometry, 'rest'), 'display rest') : null
  });
}
function facts(event) {
  const submissionPhase = ['pending', 'received', 'completed'].includes(event.phase);
  const bodyPhase = ['received', 'completed'].includes(event.phase);
  // A transfer/check event cannot borrow model submission from its legacy
  // phase. Explicit conflicting flags remain visible as contradictions below.
  const submitted = event.route_event ? false : event.outbound_submitted ?? submissionPhase;
  const bodyReceived = event.route_event ? false : event.response_received ?? bodyPhase;
  const transportFailure = event.provider_failure && ['provider-plan', 'provider-transport'].includes(event.failure_stage);
  const answerObserved = bodyReceived && !event.provider_failure;
  return {
    submitted, response_body_received: bodyReceived, answer_observed: answerObserved,
    transport_failure: transportFailure, local_task_binding_verified: event.binding_verified === true,
    local_return_review_completed: event.phase === 'completed' && !event.provider_failure && submitted && answerObserved,
    request_stopped: ['completed', 'held'].includes(event.phase) || ['RETURN_CHECKED', 'RETURN_ADMITTED', 'RETURN_HELD'].includes(event.route_event),
    handoff_dispatched: event.route_event === 'HANDOFF_DISPATCHED',
    returned_work_checked: event.route_event === 'RETURN_CHECKED',
    local_admission_observed: event.route_event === 'RETURN_ADMITTED',
    returned_work_held: event.route_event === 'RETURN_HELD',
    custody_admitted: false, provider_internal_activity: 'UNOBSERVED'
  };
}
function copyFor(event, state) {
  const retained = `${event.local} local ${event.local === 1 ? 'file is' : 'files are'} excluded from this outgoing packet.`;
  if (event.route_event) {
    const routeCopy = {
      HANDOFF_DISPATCHED: ['Marrowline navigation was opened.', 'This client dispatched the prepared transfer. Receiver arrival, model execution and downstream behavior remain unobserved.'],
      RETURN_CHECKED: ['Returned work was checked locally.', 'Check leaves the local admitted head unchanged. Inspect the candidate before choosing Admit.'],
      RETURN_ADMITTED: ['Your explicit local admission completed.', 'The client recorded its reviewed Admit callback. This display supplies no independent custody verification or external execution evidence.'],
      RETURN_HELD: ['Returned work remains held.', 'Local review stopped this return. The admitted head remains unchanged; the held material stays inspectable.']
    }[event.route_event];
    return { now: routeCopy[0], why: `${routeCopy[1]} ${retained}`, next: 'Inspect the route record or return to your work. This display sends nothing.' };
  }
  if (event.phase === 'prepared' && event.task_present === false && event.shared === 0) {
    return { now: 'Start with your task.', why: `No task or selected document has been recorded. ${retained}`, next: 'Write the task, then choose which material travels.' };
  }
  const copy = {
    prepared: ['The selected work is still here.', `${event.shared} selected documents and ${event.rules_count} portable rules are being prepared. ${retained}`],
    checking: ['Loom is checking the outgoing packet.', `Task binding is a local readiness check before submission. ${retained}`],
    pending: ['The packet was submitted to the model route.', `Submission is observed; provider execution and internal activity remain unobserved. ${retained}`],
    received: ['A response reached the tab; return checks are pending.', `Arrival does not validate the answer or create custody admission. ${retained}`],
    completed: ['Returned work is available for human review.', `This client event records completed local return review. Model source-use and missingness remain reported claims. ${retained}`],
    held: [state.transport_failure ? 'The provider route failed after submission.' : 'This attempt stopped.',
      state.transport_failure ? `A failure receipt reached the tab; no model answer is established by that receipt. ${retained}`
        : state.answer_observed ? `A response arrived, but this attempt remains held. ${retained}`
          : state.submitted ? `The wait stopped after submission; submitted material cannot be recalled. ${retained}`
            : `No submission is established for this attempt. ${retained}`]
  }[event.phase];
  return { now: copy[0], why: copy[1], next: 'Inspect the recorded state, replay, rest, return, or exit. This display sends nothing.' };
}
function relationRecords(event, state, history) {
  const sameSelection = history.filter(item => item.request_id === event.request_id
    && item.selected_document_ids?.length && JSON.stringify(item.selected_document_ids) === JSON.stringify(event.selected_document_ids));
  const evidence = {
    gathering: event.shared > 0 || event.task_present === true || (event.rules_count > 0 && event.task_present !== false) ? ['CLIENT_SELECTION_COUNTS'] : [],
    recurrence: sameSelection.length > 1 ? ['SAME_SELECTION_IN_MULTIPLE_RECORDED_EVENTS'] : [],
    release: state.handoff_dispatched ? ['CLIENT_HANDOFF_NAVIGATION_DISPATCHED_NOT_RECEIVER_ARRIVAL'] : state.submitted ? ['CLIENT_SUBMISSION_EVENT'] : [],
    created_potential: state.local_task_binding_verified ? ['LOCAL_TASK_BINDING_BEFORE_RETURN'] : [],
    released_tendency: state.answer_observed ? ['RESPONSE_BODY_OBSERVED_NOT_RETURN_VALIDATION'] : [],
    protected_continuity: event.local > 0 ? ['LOCAL_FILES_EXCLUDED_FROM_OUTGOING_PACKET'] : [],
    bounded_emergence: state.returned_work_checked ? ['CLIENT_RETURN_CHECK_COMPLETED_NOT_ADMISSION']
      : state.local_admission_observed ? ['CLIENT_EXPLICIT_LOCAL_ADMIT_CALLBACK_NOT_INDEPENDENT_CUSTODY_VERIFICATION']
        : state.local_return_review_completed ? ['CLIENT_LOCAL_RETURN_REVIEW_EVENT'] : [],
    structural_rest: state.returned_work_held ? ['CLIENT_RETURN_HELD_ADMITTED_HEAD_UNCHANGED']
      : state.request_stopped || event.display_rest === true ? ['TERMINAL_REQUEST_OR_EXPLICIT_DISPLAY_REST'] : []
  };
  return Object.fromEntries(Object.entries(FLOWCORE_GLYPH_REGISTRY.entries).map(([key, semantic]) => [key, {
    key, ...semantic, label: LABELS[key], evidenced: evidence[key].length > 0,
    evidence_basis: evidence[key], authority_ceiling: FLOWCORE_GLYPH_REGISTRY.authority_ceiling
  }]));
}
function currentRelation(event, records, replay) {
  if (event.route_event) {
    if (event.outbound_submitted === true || event.response_received === true) return null;
    return { HANDOFF_DISPATCHED: 'release', RETURN_CHECKED: 'bounded_emergence', RETURN_ADMITTED: 'bounded_emergence', RETURN_HELD: 'structural_rest' }[event.route_event];
  }
  if (event.phase === 'prepared' && event.task_present === false && event.shared === 0) return null;
  if (replay && records.recurrence.evidenced) return 'recurrence';
  const preferred = {
    prepared: 'gathering', checking: event.binding_verified ? 'created_potential' : 'gathering',
    pending: 'release', received: 'released_tendency', completed: 'bounded_emergence', held: 'structural_rest'
  }[event.phase];
  return records[preferred].evidenced ? preferred : null;
}
function eventIdentity(event) {
  // Scene decoration and cue rest are renderer state, not additional client
  // observations. Raw events and their decorated packets share this identity.
  return JSON.stringify([
    event.phase, event.at, event.request_id, event.shared, event.local, event.task_present, event.route_event,
    event.selected_document_ids, event.used_document_ids, event.missing_information,
    event.outbound_submitted, event.response_received, event.binding_verified,
    event.provider_failure, event.failure_stage, event.fadt_task_authorization,
    event.aia_projection_family_verified
  ]);
}

/** Async only because the existing canonical compilers digest their inputs.
 * All clocks/revisions are supplied or explicitly missing; no I/O, scheduler,
 * provider action, custody write, scoring, or fictional practice scene is used.
 * The caller must discard a resolved view if its current packet has changed.
 */
export async function compileLoomInstrumentStateView(packet, {
  sourceRevision = 'working-tree', eventHistory = [], route = null, replay = false,
  cryptoImpl = globalThis.crypto, TextEncoderImpl = globalThis.TextEncoder
} = {}) {
  const sourceRevisionValue = revision(sourceRevision);
  if (route !== null && !AIA_ROUTE_IDS.includes(route)) throw new TypeError('route must be null or an explicitly selected canonical AIA route.');
  if (typeof replay !== 'boolean') throw new TypeError('replay must be boolean.');
  if (!Array.isArray(eventHistory) || eventHistory.length > 30 || Object.keys(eventHistory).length !== eventHistory.length) throw new TypeError('eventHistory must contain at most 30 observed events.');
  const current = observedEvent(packet);
  let history = Array.from({ length: eventHistory.length }, (_, index) => observedEvent(field(eventHistory, String(index))));
  const signature = eventIdentity(current);
  const currentIndex = history.findLastIndex(item => eventIdentity(item) === signature);
  // A recorded replay cannot borrow a later response or later verification.
  if (currentIndex >= 0) { history = history.slice(0, currentIndex + 1); history[history.length - 1] = current; }
  else history.push(current);
  const state = facts(current);
  const copy = copyFor(current, state);
  const records = relationRecords(current, state, history);
  const activeRelation = currentRelation(current, records, replay);
  const missingness = [
    'Provider internal activity and downstream enforcement are unobserved.',
    'The request packet does not capture a prior operator notice and gesture trace.',
    'This projection supplies no custody admission witness.'
  ];
  if (current.at === null) missingness.push('Observation time was not supplied; the fixed digest epoch is not an observation timestamp.');
  if (sourceRevisionValue === 'working-tree') missingness.push('The current source is an uncommitted working-tree declaration.');
  if (sourceRevisionValue === 'browser-unpinned') missingness.push('The browser session source has no exact commit pin; successful local preparation does not authenticate source bytes.');
  if (current.declared_source_revision && current.declared_source_revision !== sourceRevisionValue) missingness.push('The packet source revision differs from the supplied display source revision.');
  if (current.selected_document_ids === null && current.shared) missingness.push('Selected document identities were not supplied.');
  const contradictions = [];
  if (current.route_event && (current.outbound_submitted === true || current.response_received === true)) contradictions.push('A client transfer/review event also claims a model submission or response; these evidence classes must remain separate.');
  if (!current.route_event && ['pending', 'received', 'completed'].includes(current.phase) && current.outbound_submitted === false) contradictions.push('The client phase implies submission while its explicit submission flag denies it.');
  if (!current.route_event && ['received', 'completed'].includes(current.phase) && current.response_received === false) contradictions.push('The client phase implies a response while its explicit response flag denies it.');
  if (current.phase === 'completed' && current.provider_failure) contradictions.push('The completed client phase also carries a provider failure.');
  if (contradictions.length) {
    copy.now = 'The request records disagree; inspect this state before using it.';
    copy.why = contradictions.join(' ');
  }
  const reportStatus = !state.answer_observed || current.provider_failure ? 'NOT_ADMITTED_FROM_THIS_EVENT'
    : state.local_return_review_completed ? 'LOCALLY_REVIEWED_MODEL_REPORT' : 'UNVALIDATED_MODEL_REPORT';
  const reports = {
    status: reportStatus,
    source_references: reportStatus === 'NOT_ADMITTED_FROM_THIS_EVENT' ? null : current.used_document_ids,
    missing_information: reportStatus === 'NOT_ADMITTED_FROM_THIS_EVENT' ? null : current.missing_information,
    establishes_actual_source_use: false, establishes_complete_missingness: false
  };
  const options = {
    frozenClock: current.at ?? PROJECTION_EPOCH,
    idSeed: `${LOOM_INSTRUMENT_STATE_VIEW_SCHEMA}:${sourceRevisionValue}:${current.request_id ?? 'unassigned'}:${current.phase}`,
    idScope: 'Dome-World/Holonomy-Loom/Instrument-State', cryptoImpl, TextEncoderImpl
  };
  const scene = await compilePedagogicalScene({
    scene_kind: 'GENERIC', source_status: 'E0', observation_status: contradictions.length ? 'CONTRADICTORY' : 'OBSERVED',
    world_state_reference: current.request_id,
    provenance: {
      source_references: ['app/dome-world/holonomy-loom/ai-workspace.js', `declared-source:${sourceRevisionValue}`],
      evidence_basis: ['SUPPLIED_CLIENT_REQUEST_EVENTS', 'MODEL_FIELDS_ARE_REPORTED_CLAIMS'],
      transformations: ['bounded metadata projection into the canonical Pedagogue compiler; no payloads or local file names retained'],
      station_owners: ['Dome-World']
    },
    visible_condition: { plain_language: copy.now, why: copy.why, client_phase: current.phase },
    available_affordances: [{ action_id: 'inspect_recorded_state', purpose: 'Inspect this bounded local projection without sending work or admitting custody.', authorized_by_station: 'Human', reversible: true }],
    route_topology: {
      event_history: history, same_endpoint_not_same_history: true, missing_inputs: missingness,
      steps: history.map((event, index) => ({
        step_id: `request-event-${index}`, label: copyFor(event, facts(event)).now, phase: event.phase,
        required_fields: ['client phase', 'request identity', 'observation time', 'selected identities', 'evidence scope'],
        dependencies: index ? [`request-event-${index - 1}`] : [], operator_action_required: false
      }))
    },
    causal_structure: {
      input: 'bounded client event metadata', operator: 'canonical Pedagogue scene/transition/AIA/route compilers',
      observable: state, client_phase: current.phase, model_reports: reports,
      local_checks: { task_binding: current.binding_verified, fadt_task_authorization: current.fadt_task_authorization, aia_projection_family: current.aia_projection_family_verified },
      request_history_is_operator_gesture_trace: false, new_custody_admission: false
    },
    research_frame: {
      question: 'Which supplied request relations can this current display support?',
      hypothesis: 'Each visible relation has a named client-event basis and preserves its evidence limit.',
      observable_behavior: ['one consequential relation is foregrounded while the event history remains inspectable'],
      alternative_explanations: ['a supplied event can be stale, contradictory, or unauthenticated', 'a failure receipt can arrive without a model answer'],
      expected_failure_modes: ['task binding is mistaken for return validation', 'request completion is mistaken for custody admission'],
      falsifier: ['a glyph activates without its declared relation evidence', 'replay incorporates a later event', 'the display initiates another request or clock'],
      abstention_conditions: ['the supplied request event has invalid or unsupported metadata']
    },
    missingness, contradictions, claim_ceiling: CEILING,
    technical_terms_withheld: ['route graph', 'canonical compiler', 'Flow-Core relation grammar']
  }, options);
  // These NOTICE records are present inspection of observed consequences.
  // They are not claims that the original request had an operator notice/ACT.
  const transitions = [];
  for (const event of history) {
    const eventState = facts(event), eventCopy = copyFor(event, eventState);
    const eventRecords = relationRecords(event, eventState, history.slice(0, transitions.length + 1));
    const key = currentRelation(event, eventRecords, event === history.at(-1) && replay);
    transitions.push(await compilePedagogicalTransition(scene, null, {
      causal_trace: [{ step: `Recorded client phase ${event.phase}; request ${event.request_id ?? 'unassigned'}; at ${event.at ?? 'unreported'}.` }],
      unresolved_relations: ['Client route observations do not establish provider internal activity or custody admission.'],
      glyph_candidates: key ? [eventRecords[key].semantic_relation] : [],
      contradictions: event === history.at(-1) ? contradictions : []
    }, {
      ...options, phase: 'NOTICE', priorTransitions: transitions,
      staticEquivalent: { summary: eventCopy.now, steps: [eventCopy.now, eventCopy.why, 'Evidence limit: client observation and labeled reports only.', 'Rest, return, replay, and exit remain available.'] }
    }));
  }
  const transition = transitions.at(-1);
  const aiaViews = {};
  for (const routeId of AIA_ROUTE_IDS) aiaViews[routeId] = await compileAIAView(scene, transition, routeId, options);
  const aiaReport = verifyAIAInvariants(scene, Object.values(aiaViews));
  const graph = await compileRouteGraph(scene, transitions, options);
  const eventRelationHistory = history.map((item, index) => {
    const prefix = history.slice(0, index + 1);
    const itemState = facts(item);
    const itemRecords = relationRecords(item, itemState, prefix);
    const relationKey = currentRelation(item, itemRecords, false);
    return freeze({
      phase: item.phase,
      at: item.at,
      relation_key: relationKey,
      glyph: relationKey ? itemRecords[relationKey].glyph : null
    });
  });
  return freeze({
    schema: LOOM_INSTRUMENT_STATE_VIEW_SCHEMA,
    source_revision: sourceRevisionValue, source_revision_authenticated: false,
    source_revision_status: sourceRevisionValue === 'browser-unpinned' ? 'UNPINNED_BROWSER_SOURCE'
      : sourceRevisionValue === 'working-tree' ? 'WORKING_TREE_CANDIDATE' : 'DECLARED_COMMIT_NOT_AUTHENTICATED',
    observation_class: 'SUPPLIED_CLIENT_REQUEST_EVENTS_AND_LABELED_MODEL_REPORTS',
    clock_basis: current.at === null ? 'FIXED_DIGEST_EPOCH_NOT_OBSERVATION_TIME' : 'SUPPLIED_EVENT_TIMESTAMP',
    phase: current.phase, event: current, event_history: history, state, copy, model_reports: reports,
    selected_route: route, route_inference_performed: false, replay,
    scene, phase_sequence: transitions, transition, aia_views: aiaViews, aia_invariant_report: aiaReport,
    selected_aia_view: route === null ? null : aiaViews[route], route_graph: graph,
    glyph_registry_schema: FLOWCORE_GLYPH_REGISTRY.schema, relations: records, active_relation: activeRelation,
    event_relation_history: eventRelationHistory,
    claim_ceiling: scene.claim_ceiling, authority: AUTHORITY,
    operator_gesture_trace_captured: false, custody_admission_credit: 0, empirical_credit: 0,
    scheduler: { requires_existing_coordinator: true, owns_animation_loop: false },
    closure: { status: 'OPEN', closed_by: null }
  });
}

const ROUTES = Object.freeze({
  gathering: ['Selected inputs', 'Draft packet'], recurrence: ['Earlier recorded selection', 'Current recorded selection'],
  release: ['Selected packet', 'Client model route'], created_potential: ['Selected packet', 'Local task binding checked'],
  released_tendency: ['Response body', 'Local return checks'], protected_continuity: ['Excluded local files', 'This tab'],
  bounded_emergence: ['Locally reviewed return', 'Human inspection'], structural_rest: ['Observed attempt', 'Inspectable history']
});
function unit(value, fallback) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
}
/** Pure frame projection, driven only by the host coordinator snapshot. */
export function projectLoomInstrumentStateFrame(view, snapshot = {}) {
  if (view?.schema !== LOOM_INSTRUMENT_STATE_VIEW_SCHEMA) throw new TypeError('A compiled Loom instrument view is required.');
  const reduced = snapshot.reducedMotion === true || snapshot.rest === true;
  const progress = reduced ? 1 : unit(snapshot.progress, 1);
  // Rest/reduced motion changes demand, never the underlying request relation.
  const relationKey = view.active_relation;
  const descriptor = relationKey ? view.relations[relationKey] : null;
  const routeEndpoints = {
    HANDOFF_DISPATCHED: ['Prepared Loom transfer', 'Marrowline navigation'],
    RETURN_CHECKED: ['Returned work', 'Local Check result'],
    RETURN_ADMITTED: ['Explicit local Admit', 'Current local custody head'],
    RETURN_HELD: ['Returned work', 'Held for inspection']
  }[view.event.route_event];
  const endpoints = relationKey ? routeEndpoints ?? ROUTES[relationKey] : ['Current draft', 'Awaiting selection'];
  const routeLabel = {
    HANDOFF_DISPATCHED: 'Prepared transfer navigation dispatched',
    RETURN_CHECKED: 'Return checked; admission remains separate',
    RETURN_ADMITTED: 'Explicit local admission observed',
    RETURN_HELD: 'Returned work held; local head unchanged'
  }[view.event.route_event];
  const viewport = snapshot.viewport ?? { width: 640, height: 300, dpr: 1 };
  const canonicalFrame = renderPedagogueScene('loom-instrument-state', view.scene, view.transition,
    { width: viewport.width ?? 640, height: viewport.height ?? 300, devicePixelRatio: viewport.dpr ?? 1 },
    typeof snapshot.timeMs === 'number' && Number.isFinite(snapshot.timeMs) ? snapshot.timeMs : 0,
    { activeViewId: 'loom-instrument-state', reducedMotion: reduced });
  const remaining = 1 - progress;
  const shift = reduced ? { x: 0, y: 0, scale: 1 } : {
    x: relationKey === 'gathering' ? -12 * remaining : relationKey === 'release' ? 18 * progress : 0,
    y: relationKey === 'created_potential' ? -10 * progress : relationKey === 'released_tendency' ? 12 * progress : 0,
    scale: relationKey === 'bounded_emergence' ? .94 + .06 * progress : relationKey === 'recurrence' ? 1 + Math.sin(Math.PI * progress) * .025 : 1
  };
  return freeze({
    canonical_frame: canonicalFrame, relation_key: relationKey,
    descriptor: descriptor && routeLabel ? { ...descriptor, label: routeLabel } : descriptor,
    endpoints, progress, reduced_motion: reduced, glyph_transform: shift,
    display_rest_only: snapshot.rest === true && !view.state.request_stopped,
    phase: view.phase, custody_admitted: false, owns_animation_loop: false
  });
}

/** DOM-only renderer. The host owns Rest/Replay/Exit and all animation timing.
 * Nodes persist across ticks, so focus and an opened inspection drawer survive.
 */
export function mountLoomInstrumentStateView(root) {
  if (!root?.ownerDocument) throw new TypeError('An instrument state root is required.');
  const doc = root.ownerDocument;
  const el = (tag, className, textValue) => {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (textValue !== undefined) node.textContent = textValue;
    return node;
  };
  // Clock ticks update trajectories. Static labels change only with their
  // content, avoiding repeated text-node replacement and layout invalidation.
  const setText = (node, value) => { if (node.textContent !== value) node.textContent = value; };
  const svgEl = (tag, attributes = {}) => {
    const node = doc.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, String(value));
    return node;
  };
  const section = el('section', 'loom-instrument-state');
  section.setAttribute('aria-label', 'Current Loom request state');
  const mode = el('p', 'loom-instrument-state-mode', 'Current route observation');
  const now = el('h3', 'loom-instrument-state-now', 'Your current request state will appear here.');
  now.setAttribute('aria-live', 'polite');
  const why = el('p', 'loom-instrument-state-why');
  const uid = `loom-field-${doc.querySelectorAll('.loom-instrument-state').length}-${root.id.replace(/[^a-zA-Z0-9_-]/g,'') || 'view'}`;
  const svg = svgEl('svg', { viewBox: '0 0 1000 520', preserveAspectRatio:'xMidYMid slice', width: '100%', role: 'img', 'aria-label': 'A single evidenced request relation', class:'loom-glyph-field' });
  const title = svgEl('title');
  const defs = svgEl('defs');
  const spectrum = svgEl('linearGradient', {id:`${uid}-spectrum`,x1:'0%',y1:'100%',x2:'100%',y2:'0%'});
  for(const [offset,color] of [['0%','#767ed4'],['34%','#a9eff0'],['58%','#f4f1d6'],['78%','#f3b985'],['100%','#b098e8']]) spectrum.append(svgEl('stop',{offset,'stop-color':color}));
  const core = svgEl('radialGradient',{id:`${uid}-core`});
  core.append(svgEl('stop',{offset:'0%','stop-color':'#adf3ed','stop-opacity':'.16'}),svgEl('stop',{offset:'70%','stop-color':'#6e79e1','stop-opacity':'.025'}),svgEl('stop',{offset:'100%','stop-color':'#080b12','stop-opacity':'0'}));
  const glow = svgEl('filter',{id:`${uid}-glow`,x:'-70%',y:'-70%',width:'240%',height:'240%','color-interpolation-filters':'sRGB'});
  glow.append(svgEl('feGaussianBlur',{stdDeviation:'3.6'}));
  const metal = svgEl('linearGradient',{id:`${uid}-metal`,x1:'0%',y1:'0%',x2:'100%',y2:'100%'});
  for(const [offset,color] of [['0%','#eff4ee'],['24%','#a7dcdf'],['42%','#f2edc8'],['52%','#7296b8'],['57%','#e4e8df'],['77%','#e4b48c'],['100%','#8785c4']])metal.append(svgEl('stop',{offset,'stop-color':color}));
  const lensGlow = svgEl('filter',{id:`${uid}-lens`,x:'-100%',y:'-300%',width:'300%',height:'700%','color-interpolation-filters':'sRGB'});
  lensGlow.append(svgEl('feGaussianBlur',{stdDeviation:'8'}));
  defs.append(spectrum,core,glow,metal,lensGlow);svg.append(title,defs,svgEl('rect',{width:1000,height:520,fill:'#080b12'}),svgEl('ellipse',{cx:500,cy:262,rx:430,ry:250,fill:`url(#${uid}-core)`}));
  const seam = svgEl('path',{d:'M140 260 Q500 240 860 260',fill:'none',stroke:`url(#${uid}-spectrum)`,'stroke-width':4,opacity:.27,filter:`url(#${uid}-lens)`});svg.append(seam);
  const horizon = svgEl('g',{class:'loom-field-horizon',stroke:`url(#${uid}-spectrum)`,fill:'none','stroke-width':'.65'});
  for(let i=0;i<5;i++)horizon.append(svgEl('ellipse',{cx:500,cy:266,rx:170+i*50,ry:50+i*16,opacity:.05+i*.013}));
  svg.append(horizon);
  const filamentLayer = svgEl('g',{fill:'none',stroke:`url(#${uid}-spectrum)`,'stroke-linecap':'round'});
  const filaments = Array.from({length:28},(_,i)=>{const node=svgEl('path',{'stroke-width':i%7===0?1.5:.55,opacity:i%7===0?.6:.13});filamentLayer.append(node);return node;});
  svg.append(filamentLayer);
  const orbitLayer = svgEl('g',{fill:'none',stroke:`url(#${uid}-spectrum)`});
  const orbits = Array.from({length:3},(_,i)=>{const node=svgEl('ellipse',{cx:500,cy:260,rx:170+i*14,ry:170-i*24,'stroke-width':i===0?1.25:.6,opacity:i===0?.42:.2,'stroke-dasharray':i===0?'650 390':'16 34 140 30'});orbitLayer.append(node);return node;});
  svg.append(orbitLayer);
  const particles = Array.from({length:36},(_,i)=>{const node=svgEl('circle',{r:i%7===0?2.2:.85,fill:i%7===0?'#f6edcf':'#abefea',opacity:.7});svg.append(node);return node;});
  // Cinematic strata are repeated projections of relations already evidenced
  // in event_relation_history. They share the host coordinator clock and add
  // no event, authority, provider claim, or second animation loop.
  const flightLayer = svgEl('g',{class:'loom-field-flight','aria-hidden':'true'});
  const flightGlyphs = Array.from({length:39},(_,i)=>{
    const near=i%13===0||i%11===0, mid=!near&&(i%4===0||i%7===0);
    const node=svgEl('text',{
      x:0,y:0,'font-size':near?(i%13===0?184:132):mid?56:26,
      fill:i%9===0?'#f3bd86':i%5===0?'#9ce7e4':'#b69be9',
      class:near?'flight-near':mid?'flight-mid':'flight-far'
    });
    flightLayer.append(node);return node;
  });
  svg.append(flightLayer);
  const glyphGroup = svgEl('g', {class:'loom-field-glyph'});
  const type = {x:500,y:280,'text-anchor':'middle','dominant-baseline':'middle','font-size':172};
  const depthLayer = svgEl('g',{'aria-hidden':'true'});
  const depth = Array.from({length:12},(_,i)=>{const node=svgEl('text',{...type,fill:i%3===0?'#617e97':'#182f43',stroke:i%3===0?'#88b3c5':'#213e52','stroke-width':'.35'});depthLayer.append(node);return node;});
  const ghost = svgEl('text', {...type,fill:`url(#${uid}-spectrum)`,filter:`url(#${uid}-glow)`,opacity:.32,'aria-hidden':'true'});
  const glyph = svgEl('text', {...type,fill:`url(#${uid}-metal)`,stroke:'#eaf6ef','stroke-width':'.35','paint-order':'stroke fill'});
  glyph.setAttribute('data-instrument-active-glyph','');
  const restGlyph = svgEl('g',{fill:'none',stroke:`url(#${uid}-spectrum)`,'stroke-width':4,visibility:'hidden'});
  restGlyph.append(svgEl('path',{d:'M437 279 A63 63 0 0 1 563 279'}),svgEl('circle',{cx:500,cy:280,r:6,fill:'#e3eee7',stroke:'none'}));
  glyphGroup.append(depthLayer,ghost,glyph,restGlyph);svg.append(glyphGroup);
  const origin = svgEl('text',{class:'loom-field-route-label',x:150,y:472,'text-anchor':'middle','font-size':12,fill:'#a7b6c6'});
  const destination = svgEl('text',{class:'loom-field-route-label',x:850,y:472,'text-anchor':'middle','font-size':12,fill:'#a7b6c6'});
  const axis = svgEl('path',{class:'loom-field-route-label',d:'M80 437H440M560 437H920',stroke:'#9ae8e4','stroke-width':.6,opacity:.2});
  svg.append(axis,origin,destination);
  // Practice labels are a projection of this same canonical frame, never a
  // competing CSS route. Actual source controls stay at the scene edge.
  const sourceLayer=svgEl('g',{class:'loom-field-sources','aria-hidden':'true'});
  const sourceMarkers=Array.from({length:8},()=>{
    const group=svgEl('g');
    const point=svgEl('circle',{r:5,fill:'#c9f5ef'});
    const label=svgEl('text',{'text-anchor':'middle',y:30,'font-size':22,fill:'#c8dbdf'});
    const guard=svgEl('ellipse',{rx:54,ry:26,fill:'none',stroke:'#b69be9','stroke-width':1,opacity:.5});
    const continuity=svgEl('text',{x:0,y:-40,'text-anchor':'middle','font-size':25,fill:'#b69be9'});
    group.append(guard,point,label,continuity);sourceLayer.append(group);
    return {group,point,label,guard,continuity};
  });
  svg.append(sourceLayer);
  const relation = el('p', 'loom-instrument-state-relation');
  const endpoints = el('p', 'loom-instrument-state-endpoints');
  // The scaled SVG labels are supplementary. This DOM equivalent remains
  // legible at small widths and does not depend on motion or glyph literacy.
  endpoints.style.fontSize = '13px';
  const boundary = el('p', 'loom-instrument-state-boundary', 'Client observations and model reports only. This display creates no custody admission.');
  const next = el('p', 'loom-instrument-state-next');
  const details = el('details', 'loom-instrument-state-inspection');
  const summary = el('summary', null, 'Inspect the relation and event history');
  const exact = el('p', 'loom-instrument-state-exact');
  const projection = el('section', 'loom-instrument-state-projection');
  const projectionTitle = el('h4');
  const projectionPurpose = el('p');
  const projectionFields = el('dl');
  projection.append(projectionTitle, projectionPurpose, projectionFields);
  projection.hidden = true;
  const trail = el('ol', 'loom-instrument-state-history');
  const receipt = el('pre', 'loom-instrument-state-receipt');
  details.append(summary, why, exact, projection, trail, receipt);
  const caption = el('div','loom-field-caption');caption.append(now,endpoints,next);
  boundary.textContent='Client observations · provider internals unknown · no custody admission';
  section.append(mode, svg, caption, relation, boundary, details);
  root.replaceChildren(section);
  let current = null, lastFrame = null, destroyed = false, compactMotion = null;
  return Object.freeze({
    update(view, snapshot = {}) {
      if (destroyed) throw new Error('Loom instrument state renderer is destroyed.');
      const frame = projectLoomInstrumentStateFrame(view, snapshot);
      // Mobile keeps the same evidenced relation grammar and the same host
      // clock, but projects fewer decorative carriers per tick. This lowers
      // DOM/SVG mutation pressure without inventing a second animation path.
      const compact = Number(snapshot.viewport?.width ?? 1000) <= 760;
      if (compact !== compactMotion) {
        compactMotion = compact;
        filaments.forEach((node,index)=>{node.style.display=compact&&index>=10?'none':'';});
        particles.forEach((node,index)=>{node.style.display=compact&&index>=12?'none':'';});
        // All 39 carriers retain the depth strata; mobile reduces auxiliary lines.
        svg.setAttribute('viewBox',compact?'200 -220 600 1120':'0 0 1000 520');
        depth.forEach((node,index)=>{node.style.display=compact&&index>=4?'none':'';});
      }
      const filamentCount = compact ? 10 : filaments.length;
      const particleCount = compact ? 12 : particles.length;
      const flightCount = flightGlyphs.length;
      const depthCount = compact ? 4 : depth.length;
      root.dataset.clientPhase = view.phase;
      root.dataset.activeRelation = frame.relation_key ?? 'unobserved';
      root.dataset.reducedMotion = String(frame.reduced_motion);
      doc.documentElement.dataset.loomRelation = frame.relation_key ?? 'unobserved';
      setText(mode, view.replay ? 'Replay · recorded route observation; nothing is being sent' : 'Current route observation');
      setText(now, view.copy.now);
      setText(why, view.copy.why);
      setText(glyph, frame.descriptor?.glyph ?? '');
      glyphGroup.setAttribute('visibility', frame.descriptor ? 'visible' : 'hidden');
      setText(ghost, glyph.textContent);
      for(const layer of depth)setText(layer,glyph.textContent);
      glyph.setAttribute('opacity',glyph.textContent==='𝄐'?'0':'1');
      ghost.setAttribute('opacity',glyph.textContent==='𝄐'?'0':'.32');
      depthLayer.setAttribute('visibility',glyph.textContent==='𝄐'?'hidden':'visible');
      restGlyph.setAttribute('visibility',glyph.textContent==='𝄐'?'visible':'hidden');
      // All motion is a projection of the shared client clock and observed
      // relation. No particle, light or cadence claims provider activity.
      const seconds = frame.reduced_motion ? 0 : Number(snapshot.motionTimeMs ?? snapshot.timeMs ?? 0)/1000;
      const choreography=snapshot.packet?.presentation?.flowcore_choreography;
      const choreographyRelations=Array.isArray(choreography?.relations)?choreography.relations.filter(key=>view.relations?.[key]):[];
      const ambientChoreography=frame.relation_key===null&&choreographyRelations.length>0;
      root.dataset.flowcoreChoreography=ambientChoreography?String(choreography.id??'ambient'):'evidenced';
      root.dataset.flowcoreMotionFamily=ambientChoreography?String(choreography.family??'heterostratigraphic'):'canonical-relation';
      const breath = frame.reduced_motion ? 0 : Math.sin(seconds*.72);
      const transform = frame.glyph_transform;
      glyphGroup.setAttribute('transform', `translate(${transform.x} ${transform.y+breath*2}) translate(500 260) scale(${transform.scale}) translate(-500 -260)`);
      spectrum.setAttribute('gradientTransform',`rotate(${breath*14} .5 .5)`);
      metal.setAttribute('gradientTransform',`rotate(${breath*8} .5 .5)`);
      for(let i=0;i<depthCount;i++){
        const z=(depth.length-i)/depth.length;
        depth[i].setAttribute('transform',`translate(${z*(9+breath*3)} ${z*(10-breath*2)})`);
      }
      const relationKey=frame.relation_key ?? (ambientChoreography?choreographyRelations[Math.floor(seconds/1.65)%choreographyRelations.length]:null);
      for(let i=0;i<filamentCount;i++){
        const centered=i-(filaments.length-1)/2;
        const pulse=frame.reduced_motion?0:Math.sin(seconds*.7+i*.22)*24;
        const y=260+centered*8.2;
        let path='';

        // The field changes topology with the evidenced relation. These curves
        // are visual grammar only; they do not assert a physical/provider path.
        if(relationKey==='gathering'){
          const outer=260+centered*13.5;
          const throat=260+centered*.72;
          path=`M-40 ${outer+pulse*.45} C190 ${outer-pulse} 330 ${throat+18} 500 ${throat} C670 ${throat-18} 810 ${260-centered*13.5+pulse} 1040 ${260-centered*13.5-pulse*.45}`;
        }else if(relationKey==='recurrence'){
          const amp=58+(i%5)*11;
          path=`M-30 ${y} C145 ${y-amp+pulse} 280 ${y+amp} 430 ${y} C580 ${y-amp} 720 ${y+amp-pulse} 1030 ${y}`;
        }else if(relationKey==='release'){
          const edge=260+centered*15.5;
          const throat=260+centered*.85;
          path=`M-40 ${edge} C190 ${edge-pulse*.4} 365 ${throat+12} 500 ${throat} C635 ${throat-12} 810 ${260-centered*15.5+pulse*.4} 1040 ${260-centered*15.5}`;
        }else if(relationKey==='created_potential'){
          const x=500+centered*14.8;
          const lean=centered*2.7;
          path=`M${x+lean} 590 C${x-26} 470 ${x+18+pulse*.35} 350 ${x} 260 C${x-18-pulse*.25} 170 ${x+22} 65 ${x-lean} -70`;
        }else if(relationKey==='released_tendency'){
          const x=500+centered*14.8;
          const lean=centered*2.7;
          path=`M${x-lean} -70 C${x+22} 65 ${x-18-pulse*.25} 170 ${x} 260 C${x+18+pulse*.35} 350 ${x-26} 470 ${x+lean} 590`;
        }else if(relationKey==='protected_continuity'){
          const rx=170+(i%7)*18,ry=56+(i%5)*9;
          const tilt=centered*.7;
          path=`M${500-rx} ${260+tilt} C${500-rx} ${260-ry} ${500+rx} ${260-ry} ${500+rx} ${260+tilt} C${500+rx} ${260+ry} ${500-rx} ${260+ry} ${500-rx} ${260+tilt}`;
        }else if(relationKey==='bounded_emergence'){
          const angle=(i/filaments.length)*Math.PI*2;
          const ex=500+Math.cos(angle)*660;
          const ey=260+Math.sin(angle)*330;
          const bend=(i%2?1:-1)*(24+pulse*.35);
          path=`M500 260 C${500+Math.cos(angle+.42)*150} ${260+Math.sin(angle+.42)*90+bend} ${500+Math.cos(angle-.18)*360} ${260+Math.sin(angle-.18)*185-bend} ${ex} ${ey}`;
        }else if(relationKey==='structural_rest'){
          path=`M-30 ${y} C260 ${y+pulse*.05} 740 ${y-pulse*.05} 1030 ${y}`;
        }else{
          path=`M-30 ${y} C270 ${y-18} 730 ${y+18} 1030 ${y}`;
        }
        filaments[i].setAttribute('d',path);
        filaments[i].setAttribute('opacity',relationKey==='structural_rest'?(i%7===0?.22:.055):(i%7===0?.58:.12));
      }

      for(let i=0;i<orbits.length;i++){
        const rest=relationKey==='structural_rest';
        const recurrence=relationKey==='recurrence';
        const continuity=relationKey==='protected_continuity';
        const rate=rest?0:recurrence?(i%2?-9:9):continuity?(i%2?-1.2:1.2):(i%2?-3:3);
        const squash=continuity?.46:relationKey==='bounded_emergence'?.72:.58;
        const breathe=rest||frame.reduced_motion?0:Math.sin(i+seconds*.18)*.06;
        orbits[i].setAttribute('opacity',rest?.09:continuity?.32:recurrence?.34:(i===0?.42:.2));
        orbits[i].setAttribute('transform',`rotate(${i*58+seconds*rate} 500 260) translate(500 260) scale(1 ${squash+breathe}) translate(-500 -260)`);
      }
      const particleDirection =
        relationKey==='protected_continuity' ? -1 :
        relationKey==='structural_rest' ? 0 :
        relationKey==='released_tendency' ? -1 : 1;
      for(let i=0;i<particleCount;i++){
        const particleTime=particleDirection===0 ? 0 : seconds*particleDirection;
        const t=((i/particles.length+particleTime*.016)%1+1)%1;
        const angle=t*Math.PI*2, radius=185+(i%5)*31;
        particles[i].setAttribute('cx',(500+Math.cos(angle)*radius*1.3).toFixed(2));
        particles[i].setAttribute('cy',(260+Math.sin(angle)*radius*.48).toFixed(2));
        particles[i].setAttribute('opacity',(frame.reduced_motion?.3:.23+Math.sin(i+seconds*.4)**2*.52).toFixed(3));
      }
      const evidencedTrail=frame.descriptor ? (view.event_relation_history??[]).filter(item=>item?.glyph&&item?.relation_key) : [];
      for(let i=0;i<flightCount;i++){
        const node=flightGlyphs[i];
        // First-paint ingress may carry a presentation-only choreography score.
        // It uses the same 39 carriers and host clock but is explicitly not
        // appended to event_relation_history and cannot become evidence.
        const ambientRelation=ambientChoreography?choreographyRelations[(i+Math.floor(seconds/1.35))%choreographyRelations.length]:null;
        const observed=evidencedTrail.findLast(item=>item.relation_key===frame.relation_key);
        const visible=Boolean(observed||ambientRelation);
        if(!visible){setText(node,'');node.setAttribute('visibility','hidden');continue;}
        const relationKey=observed?.relation_key??ambientRelation;
        const depthClass=node.getAttribute('class');
        const nearPlane=depthClass==='flight-near';
        const midPlane=depthClass==='flight-mid';
        setText(node,observed?.glyph??view.relations?.[relationKey]?.glyph??'');
        node.setAttribute('data-flight-relation',relationKey);
        node.setAttribute('data-flight-evidence',observed?'observed':'presentation-only');
        node.setAttribute('visibility','visible');

        // Each path follows the canonical relation's graphic/motion grammar.
        // This is presentation of an already-recorded relation, never a claim
        // that the provider or external world followed the drawn trajectory.
        const seed=(i+.5)/flightGlyphs.length;
        if(frame.reduced_motion){
          const col=i%7,row=Math.floor(i/7),x=110+col*130,y=92+row*112;
          node.setAttribute('x',String(x));node.setAttribute('y',String(y));
          node.setAttribute('transform',`rotate(${(col-3)*3} ${x} ${y})`);
          continue;
        }

        const speed=.014+(i%7)*.0033;
        const finiteTraversal=['gathering','release','created_potential','released_tendency','bounded_emergence'].includes(relationKey);
        const phase=ambientChoreography ? ((seed+seconds*(speed*3.4))%1+1)%1 : finiteTraversal ? Math.min(1,seed*.18+frame.progress*.82) : ((seed+seconds*speed)%1+1)%1;
        const lane=(i%9)-4;
        let x=500,y=260,roll=0,scale=.48+(i%9)*.085,opacity=1;

        if(relationKey==='gathering'){
          const radius=(1-phase)*650+36;
          const angle=(i*2.3999632297)+seconds*.07;
          x=500+Math.cos(angle)*radius;
          y=260+Math.sin(angle)*radius*.42;
          roll=(1-phase)*22*(i%2?1:-1);
          scale=.42+phase*.58;
        }else if(relationKey==='recurrence'){
          const orbit=155+(i%7)*38;
          const angle=phase*Math.PI*2+i*.61;
          x=500+Math.cos(angle)*orbit*1.45;
          y=260+Math.sin(angle)*orbit*.58;
          roll=Math.sin(angle)*14;
          scale=.48+(Math.sin(angle*2)*.5+.5)*.42;
        }else if(relationKey==='release'){
          x=500+(phase-.08)*760*(i%2?1:-1);
          y=260+lane*42+Math.sin(phase*Math.PI+i)*34;
          roll=(i%2?1:-1)*(12+phase*24);
          scale=.54+phase*.42;
        }else if(relationKey==='created_potential'){
          x=500+lane*55+Math.sin(i*.73+seconds*.18)*26;
          y=560-phase*650;
          roll=Math.sin(i+phase*Math.PI)*9;
          scale=.44+phase*.56;
        }else if(relationKey==='released_tendency'){
          x=500+lane*58+Math.sin(i*.53+seconds*.16)*30;
          y=-60+phase*700;
          roll=Math.sin(i+phase*Math.PI)*11;
          scale=1-phase*.36;
        }else if(relationKey==='protected_continuity'){
          const angle=phase*Math.PI*2+i*.47;
          const radius=185+(i%5)*26;
          x=500+Math.cos(angle)*radius;
          y=260+Math.sin(angle)*radius*.46;
          roll=Math.sin(angle)*5;
          scale=.52+(i%4)*.07;
          opacity=.64;
        }else if(relationKey==='bounded_emergence'){
          const angle=i*2.3999632297+seconds*.045;
          const radius=28+phase*(360+(i%6)*42);
          x=500+Math.cos(angle)*radius*1.45;
          y=260+Math.sin(angle)*radius*.58;
          roll=phase*18*(i%2?1:-1);
          scale=.46+phase*.8;
        }else if(relationKey==='structural_rest'){
          const angle=i*2.3999632297;
          const radius=110+(i%7)*23;
          x=500+Math.cos(angle)*radius*1.2;
          y=260+Math.sin(angle)*radius*.46;
          roll=0;
          scale=.44+(i%5)*.06;
          opacity=.34;
        }else{
          x=-180+phase*1360;
          y=260+lane*46;
        }

        // Depth is presentation only: it changes apparent distance, never the
        // relation identity or event order. Near carriers may partially leave
        // the frame so the field reads as space rather than a glyph inventory.
        if(nearPlane){
          scale*=1.55;
          x+=(i%2?1:-1)*34;
          y+=(i%3-1)*26;
          opacity=Math.min(1,opacity*.9);
        }else if(midPlane){
          scale*=1.08;
          opacity=Math.min(.52,opacity*.72);
        }else{
          opacity=Math.min(.12,opacity*.22);
        }
        if(!ambientChoreography && finiteTraversal && frame.progress>.65)opacity*=1-(frame.progress-.65)/.35*.65;
        node.setAttribute('opacity',opacity.toFixed(3));
        node.setAttribute('x',x.toFixed(2));node.setAttribute('y',y.toFixed(2));
        node.setAttribute('transform',`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${roll.toFixed(2)}) scale(${scale.toFixed(2)}) translate(${-x.toFixed(2)} ${-y.toFixed(2)})`);
      }
      const practice=snapshot.packet?.scene?.id?.startsWith('first-crossing-')===true;
      const sources=practice ? snapshot.packet.scene.documents??[] : [];
      sourceLayer.setAttribute('visibility',practice?'visible':'hidden');
      sourceMarkers.forEach((marker,index)=>{
        const source=sources[index];
        if(!source){marker.group.setAttribute('visibility','hidden');return;}
        marker.group.setAttribute('visibility','visible');
        const selected=view.event.selected_document_ids?.includes(source.id)===true;
        const selectedIndex=view.event.selected_document_ids?.indexOf(source.id)??0;
        const gathering=frame.relation_key==='gathering';
        const ready=frame.relation_key==='created_potential';
        const p=frame.progress;
        let x=source.id==='private'?680:source.id==='brief'?320:680,y=260;
        if(source.id==='private'){x=compact?680:820;y=compact?480:340;}
        else if(selected){
          const target=selectedIndex===0?435:565;
          x=gathering?x+(target-x)*p:target;
          y=ready?300-p*170:260;
        }
        marker.group.setAttribute('transform',`translate(${x.toFixed(2)} ${y.toFixed(2)})`);
        marker.group.setAttribute('data-source-id',source.id);
        marker.group.setAttribute('data-source-local',String(!selected));
        marker.point.setAttribute('opacity',selected?'1':'.35');
        const combined=selected && (ready || p>.7);
        setText(marker.label,combined?(selectedIndex===0?`${view.event.shared} selected sources`:''):source.name);
        marker.label.setAttribute('font-size',compact?'20':'14');
        marker.label.setAttribute('x',combined&&selectedIndex===0?'65':'0');
        // Keep the settled count below the primary glyph, while the actual
        // selected points retain their canonical gathering/readiness positions.
        marker.label.setAttribute('y',combined?(390-y).toFixed(2):'30');
        marker.label.setAttribute('opacity',combined?'.75':'.85');
        const protectedLocal=source.id==='private' && view.relations.protected_continuity.evidenced;
        marker.guard.setAttribute('visibility',protectedLocal?'visible':'hidden');
        marker.guard.setAttribute('transform',`rotate(${frame.reduced_motion?0:seconds*9})`);
        setText(marker.continuity,protectedLocal?view.relations.protected_continuity.glyph:'');
      });
      setText(title, frame.descriptor ? `${frame.descriptor.label}. ${frame.endpoints.join(' to ')}.` : 'No request relation is established yet.');
      svg.setAttribute('aria-label', title.textContent);
      setText(origin, frame.endpoints[0]); setText(destination, frame.endpoints[1]);
      setText(endpoints, frame.endpoints.join(' → '));
      setText(relation, frame.descriptor ? `${frame.descriptor.glyph} · ${frame.descriptor.label}${frame.display_rest_only ? ' · display paused; the request state is unchanged' : ''}` : 'Choose material to establish the next relation.');
      setText(next, view.copy.next);
      if (current !== view) {
        exact.textContent = `${view.selected_route ?? 'No inspection route selected'} · source ${view.source_revision} (declared, unauthenticated) · ${view.model_reports.status}.`;
        const selected = view.selected_aia_view;
        projection.hidden = selected === null;
        projectionTitle.textContent = selected ? `${selected.route} inspection` : '';
        projectionPurpose.textContent = selected?.purpose ?? '';
        projectionFields.replaceChildren(...(selected?.surface.order ?? []).flatMap(key => {
          if (!(key in selected.surface)) return [];
          const item = el('div');
          item.append(el('dt', null, key.replaceAll('_', ' ')),
            el('dd', null, typeof selected.surface[key] === 'string' ? selected.surface[key] : JSON.stringify(selected.surface[key])));
          return [item];
        }));
        trail.replaceChildren(...view.event_history.map(event => el('li', null,
          `${event.phase} · request ${event.request_id ?? 'unassigned'} · observed at ${event.at ?? 'unreported'} · ${event.shared} selected / ${event.local} excluded local files`)));
        receipt.textContent = JSON.stringify({
          schema: view.schema, observation_class: view.observation_class, source_revision: view.source_revision,
          source_revision_authenticated: false, source_revision_status: view.source_revision_status, request_id: view.event.request_id,
          state: view.state, route_event: view.event.route_event, local_checks: view.scene.causal_structure.local_checks,
          selected_document_ids: view.event.selected_document_ids, model_reports: view.model_reports,
          selected_route: view.selected_route, aia_invariant_report: view.aia_invariant_report,
          active_relation: view.active_relation, relation_evidence: Object.fromEntries(Object.entries(view.relations).map(([key, item]) => [key, item.evidence_basis])),
          missingness: view.scene.missingness, contradictions: view.scene.contradictions,
          claim_ceiling: view.claim_ceiling, authority: view.authority,
          operator_gesture_trace_captured: false, custody_admission_credit: 0
        }, null, 2);
        current = view;
      }
      lastFrame = frame;
      return frame;
    },
    inspect: () => Object.freeze({ view: current, frame: lastFrame, owns_animation_loop: false, destroyed }),
    destroy() {
      if (destroyed) return;
      destroyed = true; current = null; lastFrame = null;
      // Composition may relocate these nodes into the Session workspace.
      // Ownership follows the references, rather than their original parents.
      relation.remove(); endpoints.remove(); next.remove(); details.remove(); section.remove();
      delete root.dataset.clientPhase; delete root.dataset.activeRelation; delete root.dataset.reducedMotion;
      delete doc.documentElement.dataset.loomRelation;
    }
  });
}
