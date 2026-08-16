import {
  AIA_SURFACE_BINDING_SCHEMA,
  compileAiaSurfaceBinding,
  compileAiaSurfaceProjection,
  verifyAiaSurfaceProjectionFamily
} from '../../engine/flowcore-aia-surface-binding.js';
import { FLOWCORE_AIA_ROUTE_IDS } from '../../dome-world/data/flowcore-aia-route-registry-v01.js';

export const GIVING_AIA_SURFACE_REFERENCE = 'td613.giving.history';
export const GIVING_AIA_RUNTIME_SCHEMA = 'td613.giving.aia-runtime/v0.1';

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

function structuralState(input = {}) {
  const apertureObserved = input.aperture_context_observed === true;
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
    now: boundedText(input.now, 'Giving can research source-specific contribution records without flattening their custodians.'),
    why: boundedText(input.why, 'Each source keeps its own receipt, missingness, and route history so one returned view does not masquerade as total field.'),
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
      aperture_context_observed: state.aperture_context_observed
    },
    missingness: [...state.missingness],
    contradictions: [...state.contradictions],
    causal_structure: {
      retrieval: 'SOURCE_SPECIFIC',
      queue_settlement: 'PER_CONTACT_PER_SOURCE',
      route_memory: 'PRESERVED',
      mutation_boundary: 'CISTERN_HUMAN_LATCHED'
    },
    claim_ceiling: [
      'RESEARCH_RECORD_NOT_IDENTITY_PROOF',
      'SOURCE_RECEIPT_NOT_TOTAL_FIELD',
      'APERTURE_CONTEXT_NOT_AUTHORITY',
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
    order: ['now', 'action', 'world_answer', 'why', 'exact', 'rest', 'exit'],
    now: state.now,
    action: state.next_action,
    world_answer: `${state.source_receipt_count} source receipt(s); ${state.held_route_count} held route(s).`,
    why: state.why,
    exact: state.exact,
    rest: { available: true, penalty: false },
    exit: { available: true, penalty: false }
  }),
  CUSTODIAL: (state) => ({
    order: ['custody', 'source_relationship', 'lawful_next_action', 'write_boundary', 'continuity', 'rest', 'exit'],
    custody: state.custody_posture,
    source_relationship: `${state.source_instance_count} source instance(s) remain separately receipted.`,
    lawful_next_action: state.next_action,
    write_boundary: 'Cistern Law; human-latched consequential writes only.',
    continuity: 'Route history, missingness, and receipt lineage remain inspectable.',
    rest: { available: true, penalty: false },
    exit: { available: true, penalty: false }
  }),
  AUDIT: (state) => ({
    order: ['source_status', 'receipts', 'missingness', 'contradictions', 'route_memory', 'abstention'],
    source_status: state.source_status,
    observation_status: state.observation_status,
    receipts: { source_receipt_count: state.source_receipt_count, held_route_count: state.held_route_count },
    missingness: [...state.missingness],
    contradictions: [...state.contradictions],
    route_memory: 'Same endpoint does not erase route history.',
    aperture_context_observed: state.aperture_context_observed,
    abstention: 'Unresolved or withheld source state remains unresolved or withheld.'
  }),
  IMPLEMENTATION: (state) => ({
    order: ['schemas', 'binding', 'route_memory', 'aperture', 'cistern', 'bounded_projection'],
    schemas: {
      binding: AIA_SURFACE_BINDING_SCHEMA,
      runtime: GIVING_AIA_RUNTIME_SCHEMA,
      request: 'td613.giving.request/v1'
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
      user_level_score: null
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
  return Object.freeze({
    schema: GIVING_AIA_RUNTIME_SCHEMA,
    binding: GIVING_AIA_SURFACE_BINDING,
    projections: Object.freeze(projections),
    report
  });
}

export function installGivingAiaSurface(runtime = globalThis) {
  const apertureObserved = runtime?.__TD613_GIVING_APERTURE_CONTEXT?.authority?.giving_authority === false;
  const family = compileGivingAiaProjectionFamily({ aperture_context_observed: apertureObserved });
  const api = Object.freeze({
    schema: GIVING_AIA_RUNTIME_SCHEMA,
    binding: GIVING_AIA_SURFACE_BINDING,
    report: family.report,
    project(route, input = {}) {
      return compileGivingAiaProjection(route, {
        ...input,
        aperture_context_observed: input.aperture_context_observed ?? apertureObserved
      });
    },
    projectFamily(input = {}) {
      return compileGivingAiaProjectionFamily({
        ...input,
        aperture_context_observed: input.aperture_context_observed ?? apertureObserved
      });
    }
  });
  try {
    Object.defineProperty(runtime, '__TD613_GIVING_AIA', {
      value: api,
      configurable: true,
      enumerable: false,
      writable: false
    });
  } catch {
    runtime.__TD613_GIVING_AIA = api;
  }
  const root = runtime?.document?.documentElement;
  if (root?.dataset) root.dataset.givingAiaSurface = 'bound';
  if (typeof runtime?.dispatchEvent === 'function' && typeof runtime?.CustomEvent === 'function') {
    runtime.dispatchEvent(new runtime.CustomEvent('td613:giving:aia-bound', {
      detail: {
        surface_reference: GIVING_AIA_SURFACE_REFERENCE,
        routes: [...GIVING_AIA_SURFACE_BINDING.routes],
        human_closure_required: true
      }
    }));
  }
  return api;
}
