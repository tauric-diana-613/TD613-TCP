import {
  AIA_SURFACE_BINDING_SCHEMA,
  compileAiaSurfaceBinding,
  compileAiaSurfaceProjection,
  verifyAiaSurfaceProjectionFamily
} from '../../engine/flowcore-aia-surface-binding.js';
import { FLOWCORE_AIA_ROUTE_IDS } from '../../dome-world/data/flowcore-aia-route-registry-v01.js';

export const GIVING_AIA_SURFACE_REFERENCE = 'td613.giving.history';
export const GIVING_AIA_RUNTIME_SCHEMA = 'td613.giving.aia-runtime/v0.3';
export const GIVING_AIA_RUNTIME_RECEIPT_SCHEMA = 'td613.giving.aia-runtime-receipt/v0.2';
export const GIVING_OBSERVATION_APERTURE_SCHEMA = 'td613.giving.observation-aperture/v0.1';

export const GIVING_AIA_SURFACE_BINDING = compileAiaSurfaceBinding({
  surface_reference: GIVING_AIA_SURFACE_REFERENCE,
  host_station: 'Dome-World',
  governance_context: 'TD613',
  nested_surface: true,
  routes: FLOWCORE_AIA_ROUTE_IDS,
  route_selection: 'EXPLICIT_OPERATOR_SELECTION_ONLY',
  route_inference_forbidden: true,
  consequence_order: 'CONSEQUENCE_BEFORE_ONTOLOGY',
  internal_legibility: 'NOW_WHY_EXACT',
  outside_posture: 'MINIMUM_DISCLOSURE_NON_AUTHORITATIVE',
  fabricated_decoys: false,
  rest: { available: true, penalty: false },
  exit: { available: true, penalty: false },
  authority: {
    station_mutation_authorized: false,
    automatic_release: false,
    automatic_redesign: false,
    route_inference_allowed: false,
    authority_may_cross: false,
    human_closure_required: true
  }
});

function boundedText(value, fallback, max = 180) {
  const text = String(value ?? fallback ?? '').trim();
  return (text || String(fallback || '')).slice(0, max);
}

function boundedCount(value) {
  const number = Number(value ?? 0);
  return Number.isSafeInteger(number) && number >= 0 ? Math.min(number, 1000000) : 0;
}

function strings(value = []) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean))].slice(0, 128);
}

function boundedDate(value) {
  const text = boundedText(value, '', 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function normalizeObservationAperture(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const ids = strings(input.selected_source_ids).slice(0, 64);
  const declaredCount = boundedCount(input.selected_source_count);
  const sourceCount = Math.max(declaredCount, ids.length);
  return Object.freeze({
    schema: GIVING_OBSERVATION_APERTURE_SCHEMA,
    selected_source_count: sourceCount,
    selected_source_ids: Object.freeze(ids),
    date_from: boundedDate(input.date_from),
    date_to: boundedDate(input.date_to),
    exact_match: input.exact_match === true,
    alias_count: boundedCount(input.alias_count),
    amount_min_present: input.amount_min_present === true,
    amount_max_present: input.amount_max_present === true,
    practice_mode: input.practice_mode === true,
    query_identity_redacted: true,
    raw_records_included: false,
    donor_identity_included: false,
    authority_effect: 'NONE',
    absence_outside_aperture_unresolved: true
  });
}

function apertureSummary(aperture) {
  if (!aperture) return 'Observation aperture was not captured for this structural state.';
  const dates = aperture.date_from || aperture.date_to
    ? `${aperture.date_from || 'open'} → ${aperture.date_to || 'open'}`
    : 'date window not stated';
  return `${aperture.selected_source_count} selected source instance(s); ${dates}; normalized exact match ${aperture.exact_match ? 'on' : 'off'}; ${aperture.alias_count} alias(es); ${aperture.practice_mode ? 'practice' : 'live'} posture.`;
}

function structuralState(input = {}) {
  const apertureObserved = input.aperture_context_observed === true;
  const observationAperture = normalizeObservationAperture(input.observation_aperture);
  const sourceFamilies = strings(input.source_families);
  const missingness = strings(input.missingness);
  const contradictions = strings(input.contradictions);
  const authorizedActions = strings(input.authorized_actions);
  const governedReference = boundedText(input.governed_reference, 'giving-runtime-structural-state');
  const sourceStatus = boundedText(input.source_status, 'OBSERVED', 32).toUpperCase();
  const observationStatus = boundedText(input.observation_status, 'UNRESOLVED', 32).toUpperCase();

  return Object.freeze({
    governed_reference: governedReference,
    source_instance_count: boundedCount(input.source_instance_count),
    source_family_count: sourceFamilies.length,
    source_families: Object.freeze(sourceFamilies),
    source_receipt_count: boundedCount(input.source_receipt_count),
    held_route_count: boundedCount(input.held_route_count),
    aperture_context_observed: apertureObserved,
    observation_aperture: observationAperture,
    now: boundedText(input.now, 'Giving can research source-specific contribution records without flattening their custodians.'),
    why: boundedText(input.why, 'Each source keeps its own receipt, missingness, route history, and observation aperture so one returned view does not masquerade as total field.'),
    exact: boundedText(input.exact, 'Federal, state, municipal, custody, and reviewed-write paths remain non-equivalent and separately receipted.'),
    next_action: boundedText(input.next_action, 'Choose the next research or custody action deliberately.'),
    custody_posture: boundedText(input.custody_posture, 'Transient research results; client-selected dossier custody; hosted ciphertext only in Vault.'),
    missingness: Object.freeze(missingness),
    contradictions: Object.freeze(contradictions),
    authorized_actions: Object.freeze(authorizedActions),
    source_status: sourceStatus,
    observation_status: observationStatus
  });
}

function invariants(state) {
  return {
    provenance: {
      source_instance_count: state.source_instance_count,
      source_family_count: state.source_family_count,
      source_families: [...state.source_families],
      source_receipt_count: state.source_receipt_count,
      aperture_context_observed: state.aperture_context_observed,
      observation_aperture: state.observation_aperture
        ? { ...state.observation_aperture, selected_source_ids: [...state.observation_aperture.selected_source_ids] }
        : null
    },
    missingness: [...state.missingness],
    contradictions: [...state.contradictions],
    causal_structure: {
      retrieval: 'SOURCE_SPECIFIC',
      queue_settlement: 'PER_CONTACT_PER_SOURCE',
      route_memory: 'PRESERVED',
      observation_aperture: 'PRESERVED_WITH_NEGATIVE_OBSERVATION',
      mutation_boundary: 'CISTERN_HUMAN_LATCHED'
    },
    claim_ceiling: [
      'RESEARCH_RECORD_NOT_IDENTITY_PROOF',
      'SOURCE_RECEIPT_NOT_TOTAL_FIELD',
      'APERTURE_CONTEXT_NOT_AUTHORITY',
      'ABSENCE_OUTSIDE_OBSERVATION_APERTURE_UNRESOLVED',
      'ROUTE_DIVERGENCE_NOT_USER_DIAGNOSIS'
    ],
    station_ownership: ['Dome-World'],
    authorized_actions: [...state.authorized_actions],
    source_status: state.source_status,
    observation_status: state.observation_status
  };
}

const ROUTE_BUILDERS = Object.freeze({
  EXPERIENTIAL: (state) => ({
    order: ['now', 'action', 'world_answer', 'scope', 'why', 'exact', 'rest', 'exit'],
    now: state.now,
    action: state.next_action,
    world_answer: `${state.source_receipt_count} source receipt(s); ${state.held_route_count} held route(s).`,
    scope: apertureSummary(state.observation_aperture),
    why: state.why,
    exact: state.exact,
    rest: { available: true, penalty: false },
    exit: { available: true, penalty: false }
  }),
  CUSTODIAL: (state) => ({
    order: ['custody', 'source_relationship', 'observation_aperture', 'lawful_next_action', 'write_boundary', 'continuity', 'rest', 'exit'],
    custody: state.custody_posture,
    source_relationship: `${state.source_instance_count} source instance(s) remain separately receipted.`,
    observation_aperture: apertureSummary(state.observation_aperture),
    lawful_next_action: state.next_action,
    write_boundary: 'Cistern Law; human-latched consequential writes only.',
    continuity: 'Route history, missingness, receipt lineage, and observation aperture remain inspectable.',
    rest: { available: true, penalty: false },
    exit: { available: true, penalty: false }
  }),
  AUDIT: (state) => ({
    order: ['source_status', 'receipts', 'observation_aperture', 'missingness', 'contradictions', 'route_memory', 'negative_observation_ceiling', 'abstention'],
    source_status: state.source_status,
    observation_status: state.observation_status,
    receipts: { source_receipt_count: state.source_receipt_count, held_route_count: state.held_route_count },
    observation_aperture: state.observation_aperture
      ? { ...state.observation_aperture, selected_source_ids: [...state.observation_aperture.selected_source_ids] }
      : null,
    missingness: [...state.missingness],
    contradictions: [...state.contradictions],
    route_memory: 'Same endpoint does not erase route history.',
    aperture_context_observed: state.aperture_context_observed,
    negative_observation_ceiling: 'A missing match is bounded by the observed source, time, matching, and filter aperture. Absence outside that aperture remains unresolved.',
    abstention: 'Unresolved or withheld source state remains unresolved or withheld.'
  }),
  IMPLEMENTATION: (state) => ({
    order: ['schemas', 'binding', 'route_memory', 'aperture', 'cistern', 'bounded_projection'],
    schemas: {
      binding: AIA_SURFACE_BINDING_SCHEMA,
      runtime: GIVING_AIA_RUNTIME_SCHEMA,
      request: 'td613.giving.request/v1',
      observation_aperture: GIVING_OBSERVATION_APERTURE_SCHEMA
    },
    binding: {
      surface_reference: GIVING_AIA_SURFACE_REFERENCE,
      host_station: 'Dome-World',
      governance_context: 'TD613',
      route_selection: 'EXPLICIT_OPERATOR_SELECTION_ONLY'
    },
    route_memory: {
      model: 'DISCRETE_ROUTE_DIVERGENCE_SURROGATE',
      exact_geometric_holonomy_claim: false
    },
    aperture: {
      context_observed: state.aperture_context_observed,
      observation_scope: state.observation_aperture
        ? { ...state.observation_aperture, selected_source_ids: [...state.observation_aperture.selected_source_ids] }
        : null,
      absence_outside_aperture_unresolved: true,
      authority_effect: 'NONE'
    },
    cistern: {
      consequence_boundary: true,
      automatic_release: false,
      human_closure_required: true
    },
    bounded_projection: {
      raw_content_included: false,
      donor_identity_included: false,
      query_identity_redacted: true,
      individual_scoring_forbidden: true,
      comparative_structural_only: true
    }
  })
});

export function compileGivingAiaProjection(route, input = {}) {
  const routeId = String(route || '').trim().toUpperCase();
  const state = structuralState(input);
  const builder = ROUTE_BUILDERS[routeId];
  if (!builder) throw new Error('Giving AIA projection requires explicit canonical route selection.');
  return compileAiaSurfaceProjection(GIVING_AIA_SURFACE_BINDING, routeId, {
    governed_reference: state.governed_reference,
    invariants: invariants(state),
    surface: builder(state)
  });
}

export function compileGivingAiaProjectionFamily(input = {}) {
  const projections = GIVING_AIA_SURFACE_BINDING.routes.map((route) => compileGivingAiaProjection(route, input));
  const report = verifyAiaSurfaceProjectionFamily(GIVING_AIA_SURFACE_BINDING, projections);
  return Object.freeze({ schema: GIVING_AIA_RUNTIME_SCHEMA, binding: GIVING_AIA_SURFACE_BINDING, projections: Object.freeze(projections), report });
}

function stateFromSettledRun(detail = {}, apertureObserved = false) {
  const sourceStates = Array.isArray(detail.source_states) ? detail.source_states : [];
  const heldSources = Array.isArray(detail.held_sources) ? detail.held_sources : [];
  const terminalReceipts = sourceStates.filter((item) => ['COMPLETE', 'PARTIAL', 'FAILED', 'ERROR', 'DRIFTED', 'UNAVAILABLE', 'CANCELLED'].includes(String(item?.status || '').toUpperCase())).length;
  const heldCount = heldSources.length;
  const settledStatus = String(detail.status || 'UNRESOLVED').toUpperCase();
  const missingness = heldCount ? ['HELD_SOURCE_ROUTE_PRESENT'] : [];
  if (detail.client_error) missingness.push('CLIENT_OBSERVER_HELD');
  const observationAperture = normalizeObservationAperture(detail.observation_aperture);
  if (!observationAperture) missingness.push('OBSERVATION_APERTURE_NOT_CAPTURED');
  return {
    governed_reference: boundedText(detail.cycle_id, 'giving-runtime-cycle'),
    source_instance_count: sourceStates.length,
    source_receipt_count: terminalReceipts,
    held_route_count: heldCount,
    source_families: [],
    aperture_context_observed: apertureObserved,
    observation_aperture: observationAperture,
    source_status: 'OBSERVED',
    observation_status: settledStatus === 'COMPLETE' ? 'OBSERVED' : settledStatus === 'HELD' ? 'UNRESOLVED' : settledStatus,
    missingness,
    contradictions: [],
    authorized_actions: ['RESEARCH_REVIEW', 'DOSSIER_CUSTODY', 'HUMAN_LATCHED_WRITE'],
    now: settledStatus === 'COMPLETE'
      ? 'The research run reached terminal source states inside a declared observation aperture.'
      : 'The research run reached terminal state with one or more held source routes inside a declared observation aperture.',
    why: heldCount
      ? 'Held source routes remain visible rather than being flattened into the returned record set; negative observations remain bounded by the captured aperture.'
      : 'Each source route settled independently and remains separately receipted; negative observations remain bounded by the captured aperture.',
    exact: `${terminalReceipts} terminal source receipt(s); ${heldCount} held source route(s); ${apertureSummary(observationAperture)}`,
    next_action: heldCount ? 'Review or retry held source routes deliberately.' : 'Review the returned records or begin a new bounded research action.'
  };
}

function runtimeReceipt(family, state, revision) {
  const aperture = normalizeObservationAperture(state.observation_aperture);
  return Object.freeze({
    schema: GIVING_AIA_RUNTIME_RECEIPT_SCHEMA,
    revision,
    surface_reference: GIVING_AIA_SURFACE_REFERENCE,
    host_station: 'Dome-World',
    governance_context: 'TD613',
    governed_reference: family.report.governed_reference,
    source_instance_count: boundedCount(state.source_instance_count),
    source_receipt_count: boundedCount(state.source_receipt_count),
    held_route_count: boundedCount(state.held_route_count),
    observation_status: boundedText(state.observation_status, 'UNRESOLVED', 32).toUpperCase(),
    observation_aperture_present: Boolean(aperture),
    observation_selected_source_count: aperture?.selected_source_count || 0,
    observation_exact_match: aperture?.exact_match || false,
    observation_practice_mode: aperture?.practice_mode || false,
    absence_outside_aperture_unresolved: true,
    route_count: family.report.routes.length,
    pair_count: family.report.pair_count,
    all_invariants_preserved: family.report.all_invariants_preserved,
    all_surfaces_non_equivalent: family.report.all_surfaces_non_equivalent,
    route_inference_forbidden: family.report.route_inference_forbidden,
    authority_transferred: family.report.authority_transferred,
    human_closure_required: family.report.human_closure_required,
    query_identity_redacted: true,
    donor_identity_included: false,
    raw_records_included: false
  });
}

export function installGivingAiaSurface(runtime = globalThis) {
  const apertureObserved = runtime?.__TD613_GIVING_APERTURE_CONTEXT?.authority?.giving_authority === false;
  let revision = 0;
  let currentState = {
    governed_reference: 'giving-runtime-boot', source_instance_count: 0, source_receipt_count: 0, held_route_count: 0, source_families: [],
    aperture_context_observed: apertureObserved, observation_aperture: null, source_status: 'OBSERVED', observation_status: 'UNRESOLVED',
    missingness: [], contradictions: [], authorized_actions: ['RESEARCH_REVIEW', 'DOSSIER_CUSTODY', 'HUMAN_LATCHED_WRITE']
  };
  let currentFamily = compileGivingAiaProjectionFamily(currentState);
  let currentReceipt = runtimeReceipt(currentFamily, currentState, revision);

  const publish = (state, reason = 'runtime-update') => {
    currentState = { ...state, aperture_context_observed: state.aperture_context_observed ?? apertureObserved };
    currentFamily = compileGivingAiaProjectionFamily(currentState);
    revision += 1;
    currentReceipt = runtimeReceipt(currentFamily, currentState, revision);
    const root = runtime?.document?.documentElement;
    if (root?.dataset) {
      root.dataset.givingAiaSurface = 'bound';
      root.dataset.givingAiaRevision = String(revision);
      root.dataset.givingAiaObservation = currentReceipt.observation_status.toLowerCase();
      root.dataset.givingAiaObservationAperture = currentReceipt.observation_aperture_present ? 'qualified' : 'missing';
    }
    if (typeof runtime?.dispatchEvent === 'function' && typeof runtime?.CustomEvent === 'function') {
      runtime.dispatchEvent(new runtime.CustomEvent('td613:giving:aia-updated', { detail: { reason, receipt: currentReceipt } }));
    }
    return currentReceipt;
  };

  const api = Object.freeze({
    schema: GIVING_AIA_RUNTIME_SCHEMA,
    binding: GIVING_AIA_SURFACE_BINDING,
    get report() { return currentFamily.report; },
    get receipt() { return currentReceipt; },
    get revision() { return revision; },
    project(route, input = {}) {
      return compileGivingAiaProjection(route, { ...currentState, ...input, aperture_context_observed: input.aperture_context_observed ?? apertureObserved });
    },
    projectFamily(input = {}) {
      return compileGivingAiaProjectionFamily({ ...currentState, ...input, aperture_context_observed: input.aperture_context_observed ?? apertureObserved });
    },
    observeStructuralState(input = {}) { return publish({ ...currentState, ...input }, 'explicit-structural-observation'); }
  });

  try {
    Object.defineProperty(runtime, '__TD613_GIVING_AIA', { value: api, configurable: true, enumerable: false, writable: false });
  } catch {
    runtime.__TD613_GIVING_AIA = api;
  }

  const settledTarget = runtime?.document;
  if (settledTarget?.addEventListener) {
    settledTarget.addEventListener('td613:giving-run-settled', (event) => {
      const state = stateFromSettledRun(event?.detail || {}, apertureObserved);
      publish(state, 'giving-run-settled');
    });
  }

  const root = runtime?.document?.documentElement;
  if (root?.dataset) {
    root.dataset.givingAiaSurface = 'bound';
    root.dataset.givingAiaRevision = '0';
    root.dataset.givingAiaObservation = 'unresolved';
    root.dataset.givingAiaObservationAperture = 'missing';
  }
  if (typeof runtime?.dispatchEvent === 'function' && typeof runtime?.CustomEvent === 'function') {
    runtime.dispatchEvent(new runtime.CustomEvent('td613:giving:aia-bound', {
      detail: {
        surface_reference: GIVING_AIA_SURFACE_REFERENCE,
        routes: [...GIVING_AIA_SURFACE_BINDING.routes],
        runtime_receipt: currentReceipt,
        observation_aperture_required_for_negative_claims: true,
        human_closure_required: true
      }
    }));
  }
  return api;
}

export const _givingAiaSurface = Object.freeze({ normalizeObservationAperture, apertureSummary, stateFromSettledRun });