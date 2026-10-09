import { canonicalJson } from '../dome-world/ash/canonical-json.js';
import { FLOWCORE_AIA_ROUTE_IDS, FLOWCORE_AIA_ROUTES } from '../dome-world/data/flowcore-aia-route-registry-v01.js';

export const AIA_SURFACE_BINDING_SCHEMA = 'td613.aia.surface-binding/v0.1';
export const AIA_SURFACE_PROJECTION_SCHEMA = 'td613.aia.surface-projection/v0.1';
export const AIA_SURFACE_FAMILY_REPORT_SCHEMA = 'td613.aia.surface-family-report/v0.1';

const REQUIRED_INVARIANT_KEYS = Object.freeze([
  'provenance',
  'missingness',
  'contradictions',
  'causal_structure',
  'claim_ceiling',
  'station_ownership',
  'authorized_actions',
  'source_status',
  'observation_status'
]);

const FORBIDDEN_KEYS = new Set([
  'raw_content', 'raw_bytes', 'source_bytes', 'private_text', 'donor_name', 'email', 'phone',
  'birthdate', 'biometric', 'psychological_state', 'cognition', 'developmental_rank', 'mastery',
  'user_level_score', 'automatic_redesign_command', 'automatic_release_command'
]);

function text(value, label, max = 180) {
  const result = String(value ?? '').trim();
  if (!result || result.length > max) throw new TypeError(`${label} must be a bounded non-empty string.`);
  return result;
}

function uniqueStrings(values, label) {
  if (!Array.isArray(values) || values.some((value) => typeof value !== 'string' || !value.trim())) {
    throw new TypeError(`${label} must be an array of non-empty strings.`);
  }
  return [...new Set(values.map((value) => value.trim()))];
}

function clone(value) {
  return value === null || typeof value !== 'object'
    ? value
    : Array.isArray(value)
      ? value.map(clone)
      : Object.fromEntries(Object.entries(value).map(([key, child]) => [key, clone(child)]));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function rejectForbidden(value, path = 'value') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((child, index) => rejectForbidden(child, `${path}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) throw new Error(`AIA surface binding forbids ${path}.${key}.`);
    rejectForbidden(child, `${path}.${key}`);
  }
}

function normalizeRoutes(routes) {
  const declared = uniqueStrings(routes || [], 'routes');
  const canonical = [...FLOWCORE_AIA_ROUTE_IDS];
  const declaredSorted = [...declared].sort();
  const canonicalSorted = [...canonical].sort();
  if (canonicalJson(declaredSorted) !== canonicalJson(canonicalSorted)) {
    throw new Error('AIA surface binding must expose exactly the four canonical AIA routes.');
  }
  return canonical;
}

function normalizeAuthority(authority = {}) {
  const normalized = {
    station_mutation_authorized: authority.station_mutation_authorized === true,
    automatic_release: authority.automatic_release === true,
    automatic_redesign: authority.automatic_redesign === true,
    route_inference_allowed: authority.route_inference_allowed === true,
    authority_may_cross: authority.authority_may_cross === true,
    human_closure_required: authority.human_closure_required !== false
  };
  if (
    normalized.station_mutation_authorized || normalized.automatic_release || normalized.automatic_redesign ||
    normalized.route_inference_allowed || normalized.authority_may_cross || !normalized.human_closure_required
  ) {
    throw new Error('AIA surface binding attempted to widen authority.');
  }
  return normalized;
}

export function compileAiaSurfaceBinding(declaration = {}) {
  const routes = normalizeRoutes(declaration.routes || FLOWCORE_AIA_ROUTE_IDS);
  const binding = {
    schema: AIA_SURFACE_BINDING_SCHEMA,
    surface_reference: text(declaration.surface_reference, 'surface_reference'),
    host_station: text(declaration.host_station || 'Dome-World', 'host_station'),
    governance_context: text(declaration.governance_context || 'TD613', 'governance_context'),
    nested_surface: declaration.nested_surface !== false,
    route_selection: declaration.route_selection || 'EXPLICIT_OPERATOR_SELECTION_ONLY',
    route_inference_forbidden: declaration.route_inference_forbidden !== false,
    routes,
    required_invariants: [...REQUIRED_INVARIANT_KEYS],
    consequence_order: declaration.consequence_order || 'CONSEQUENCE_BEFORE_ONTOLOGY',
    internal_legibility: declaration.internal_legibility || 'NOW_WHY_EXACT',
    outside_posture: declaration.outside_posture || 'MINIMUM_DISCLOSURE_NON_AUTHORITATIVE',
    fabricated_decoys: declaration.fabricated_decoys === true,
    rest: {
      available: declaration.rest?.available !== false,
      penalty: declaration.rest?.penalty === true
    },
    exit: {
      available: declaration.exit?.available !== false,
      penalty: declaration.exit?.penalty === true
    },
    authority: normalizeAuthority(declaration.authority)
  };
  if (binding.host_station !== 'Dome-World') throw new Error('AIA nested surfaces remain hosted by Dome-World.');
  if (binding.governance_context !== 'TD613') throw new Error('AIA nested-surface governance remains TD613.');
  if (!binding.nested_surface) throw new Error('AIA surface binding requires an explicit nested surface.');
  if (binding.route_selection !== 'EXPLICIT_OPERATOR_SELECTION_ONLY' || !binding.route_inference_forbidden) {
    throw new Error('AIA route selection may not be inferred.');
  }
  if (!binding.rest.available || binding.rest.penalty || !binding.exit.available || binding.exit.penalty) {
    throw new Error('AIA surface binding must preserve rest and exit without penalty.');
  }
  if (binding.fabricated_decoys) throw new Error('AIA surface binding does not fabricate decoys.');
  rejectForbidden(binding, 'binding');
  canonicalJson(binding);
  return deepFreeze(binding);
}

function normalizeInvariants(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('AIA projection invariants must be an object.');
  const normalized = {};
  for (const key of REQUIRED_INVARIANT_KEYS) {
    if (!(key in value)) throw new Error(`AIA projection invariant missing: ${key}`);
    normalized[key] = clone(value[key]);
  }
  rejectForbidden(normalized, 'invariants');
  canonicalJson(normalized);
  return normalized;
}

export function compileAiaSurfaceProjection(binding, route, {
  governed_reference,
  invariants,
  surface
} = {}) {
  if (!binding || binding.schema !== AIA_SURFACE_BINDING_SCHEMA) throw new Error('A canonical AIA surface binding is required.');
  const routeId = text(route, 'route', 64).toUpperCase();
  if (!binding.routes.includes(routeId)) throw new Error('AIA route must be selected explicitly from the bound route set.');
  const objectReference = text(governed_reference, 'governed_reference');
  const preserved = normalizeInvariants(invariants);
  if (!surface || typeof surface !== 'object' || Array.isArray(surface)) throw new TypeError('AIA route projection requires a bounded surface object.');
  const boundedSurface = clone(surface);
  rejectForbidden(boundedSurface, 'surface');
  canonicalJson(boundedSurface);
  const projection = {
    schema: AIA_SURFACE_PROJECTION_SCHEMA,
    surface_reference: binding.surface_reference,
    host_station: binding.host_station,
    governance_context: binding.governance_context,
    governed_reference: objectReference,
    route: routeId,
    route_purpose: FLOWCORE_AIA_ROUTES.routes[routeId].purpose,
    route_selection: 'EXPLICIT_OPERATOR_SELECTION_ONLY',
    route_inference_forbidden: true,
    invariants: preserved,
    surface: boundedSurface,
    rest: clone(binding.rest),
    exit: clone(binding.exit),
    authority: clone(binding.authority),
    closure: { status: 'OPEN', closed_by: null },
    user_level_score: null,
    diagnostic_claim: null
  };
  canonicalJson(projection);
  return deepFreeze(projection);
}

export function compareAiaSurfaceProjections(left, right) {
  if (left?.schema !== AIA_SURFACE_PROJECTION_SCHEMA || right?.schema !== AIA_SURFACE_PROJECTION_SCHEMA) {
    throw new Error('AIA projection comparison requires canonical projections.');
  }
  if (left.surface_reference !== right.surface_reference || left.governed_reference !== right.governed_reference) {
    throw new Error('AIA projections must describe the same bound surface and governed object.');
  }
  const invariantsPreserved = canonicalJson(left.invariants) === canonicalJson(right.invariants);
  const authorityEqual = canonicalJson(left.authority) === canonicalJson(right.authority);
  const surfacesNonEquivalent = left.route === right.route
    ? canonicalJson(left.surface) === canonicalJson(right.surface)
    : canonicalJson(left.surface) !== canonicalJson(right.surface);
  return deepFreeze({
    left_route: left.route,
    right_route: right.route,
    same_governed_object: true,
    invariants_preserved: invariantsPreserved,
    surfaces_non_equivalent: surfacesNonEquivalent,
    authority_equal_and_bounded: authorityEqual && left.authority.authority_may_cross === false,
    rest_and_exit_preserved: left.rest.available && right.rest.available && left.exit.available && right.exit.available,
    human_closure_required: left.authority.human_closure_required && right.authority.human_closure_required
  });
}

export function verifyAiaSurfaceProjectionFamily(binding, projections) {
  if (!binding || binding.schema !== AIA_SURFACE_BINDING_SCHEMA) throw new Error('A canonical AIA surface binding is required.');
  if (!Array.isArray(projections) || projections.length !== binding.routes.length) {
    throw new Error('A complete AIA projection family is required.');
  }
  const routes = [...new Set(projections.map((projection) => projection.route))].sort();
  if (canonicalJson(routes) !== canonicalJson([...binding.routes].sort())) throw new Error('AIA projection family is incomplete or duplicated.');
  if (projections.some((projection) => projection.surface_reference !== binding.surface_reference)) throw new Error('AIA projection escaped its bound surface.');
  const governed = new Set(projections.map((projection) => projection.governed_reference));
  if (governed.size !== 1) throw new Error('AIA projection family must preserve one governed object reference.');
  const comparisons = [];
  for (let index = 0; index < projections.length; index += 1) {
    for (let other = index + 1; other < projections.length; other += 1) {
      comparisons.push(compareAiaSurfaceProjections(projections[index], projections[other]));
    }
  }
  const failures = comparisons.filter((item) => !item.invariants_preserved || !item.surfaces_non_equivalent || !item.authority_equal_and_bounded || !item.rest_and_exit_preserved || !item.human_closure_required);
  if (failures.length) throw new Error('AIA surface projection family violated a governed invariant.');
  return deepFreeze({
    schema: AIA_SURFACE_FAMILY_REPORT_SCHEMA,
    surface_reference: binding.surface_reference,
    host_station: binding.host_station,
    governed_reference: projections[0].governed_reference,
    routes: [...binding.routes],
    pair_count: comparisons.length,
    all_invariants_preserved: true,
    all_surfaces_non_equivalent: true,
    route_inference_forbidden: true,
    authority_transferred: false,
    human_closure_required: true,
    closure: { status: 'OPEN', closed_by: null }
  });
}

export const AIA_SURFACE_BINDING_REQUIRED_INVARIANTS = REQUIRED_INVARIANT_KEYS;
