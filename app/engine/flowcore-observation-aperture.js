import { canonicalJson } from '../dome-world/ash/canonical-json.js';

export const FLOWCORE_OBSERVATION_APERTURE_SCHEMA = 'td613.flowcore.observation-aperture/v0.1';
export const FLOWCORE_NEGATIVE_OBSERVATION_SCHEMA = 'td613.flowcore.negative-observation/v0.1';

function boundedText(value, fallback = '', max = 180) {
  const text = String(value ?? fallback).normalize('NFKC').replace(/\s+/g, ' ').trim();
  return text.slice(0, max);
}

function boundedCount(value) {
  const number = Number(value ?? 0);
  return Number.isSafeInteger(number) && number >= 0 ? Math.min(number, 1000000) : 0;
}

function strings(value = [], maxItems = 64) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => boundedText(item, '', 160)).filter(Boolean))].slice(0, maxItems);
}

function boundedDate(value) {
  const text = boundedText(value, '', 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function booleanMap(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const entries = Object.entries(value)
    .map(([key, state]) => [boundedText(key, '', 64), state === true])
    .filter(([key]) => Boolean(key))
    .sort(([a], [b]) => a.localeCompare(b));
  return Object.freeze(Object.fromEntries(entries));
}

export function compileObservationAperture(input = {}) {
  const sourceIds = strings(input.source_ids || input.source_scope);
  const instrumentScope = strings(input.instrument_scope);
  const conditionScope = strings(input.condition_scope);
  const declaredSourceCount = boundedCount(input.source_count ?? input.selected_source_count);
  const sourceCount = Math.max(declaredSourceCount, sourceIds.length);
  if (!sourceCount && !instrumentScope.length && !conditionScope.length) {
    throw new TypeError('Observation aperture requires source, instrument, or condition scope.');
  }

  const temporalWindow = Object.freeze({
    from: boundedDate(input.date_from ?? input.temporal_window?.from),
    to: boundedDate(input.date_to ?? input.temporal_window?.to)
  });
  const matchingPosture = boundedText(input.matching_posture, 'UNSPECIFIED', 64).toUpperCase();
  const filterFlags = booleanMap(input.filter_flags);
  const practiceMode = input.practice_mode === true;
  const contextLabels = strings(input.context_labels, 32);
  const receipt = {
    schema: FLOWCORE_OBSERVATION_APERTURE_SCHEMA,
    source_scope: Object.freeze({
      count: sourceCount,
      ids: Object.freeze(sourceIds)
    }),
    instrument_scope: Object.freeze(instrumentScope),
    condition_scope: Object.freeze(conditionScope),
    temporal_window: temporalWindow,
    matching_posture: matchingPosture,
    filter_flags: filterFlags,
    context_labels: Object.freeze(contextLabels),
    practice_mode: practiceMode,
    identity_redacted: input.identity_redacted !== false,
    raw_content_included: false,
    authority_effect: 'NONE',
    absence_outside_aperture_unresolved: true,
    universal_absence_claim_authorized: false,
    scope_grants_authority: false,
    human_closure_required: true
  };
  return Object.freeze({
    ...receipt,
    scope_projection: canonicalJson(receipt)
  });
}

export function qualifyNegativeObservation({
  observation,
  aperture,
  alternatives = [],
  detection_limit = null,
  source_status = 'OBSERVED'
} = {}) {
  const compiled = aperture?.schema === FLOWCORE_OBSERVATION_APERTURE_SCHEMA
    ? aperture
    : compileObservationAperture(aperture || {});
  const observed = boundedText(observation, 'No matching observation was registered inside the declared aperture.', 240);
  const alternativeExplanations = Object.freeze(strings(alternatives, 32));
  return Object.freeze({
    schema: FLOWCORE_NEGATIVE_OBSERVATION_SCHEMA,
    observation: observed,
    source_status: boundedText(source_status, 'OBSERVED', 32).toUpperCase(),
    observation_aperture: compiled,
    detection_limit: detection_limit === null ? null : boundedText(detection_limit, '', 160),
    alternative_explanations: alternativeExplanations,
    absence_inside_aperture_observed: true,
    absence_outside_aperture_unresolved: true,
    universal_absence_claim_authorized: false,
    causal_claim_authorized: false,
    identity_claim_authorized: false,
    authority_effect: 'NONE',
    human_closure_required: true,
    child_legible: Object.freeze({
      now: observed,
      why: 'The observation only covers the sources, conditions, time, matching posture, and filters named in this aperture.',
      exact: 'A bounded non-observation may guide the next investigation. It may not become a universal absence, motive, identity, or causation claim.'
    })
  });
}

export function compareObservationApertures(leftInput, rightInput) {
  const left = leftInput?.schema === FLOWCORE_OBSERVATION_APERTURE_SCHEMA ? leftInput : compileObservationAperture(leftInput);
  const right = rightInput?.schema === FLOWCORE_OBSERVATION_APERTURE_SCHEMA ? rightInput : compileObservationAperture(rightInput);
  const exact = left.scope_projection === right.scope_projection;
  return Object.freeze({
    schema: 'td613.flowcore.observation-aperture-comparison/v0.1',
    exact_scope_match: exact,
    left,
    right,
    source_scope_changed: canonicalJson(left.source_scope) !== canonicalJson(right.source_scope),
    temporal_window_changed: canonicalJson(left.temporal_window) !== canonicalJson(right.temporal_window),
    matching_posture_changed: left.matching_posture !== right.matching_posture,
    filter_posture_changed: canonicalJson(left.filter_flags) !== canonicalJson(right.filter_flags),
    condition_scope_changed: canonicalJson(left.condition_scope) !== canonicalJson(right.condition_scope),
    authority_effect: 'NONE',
    same_result_does_not_imply_same_aperture: true,
    human_closure_required: true
  });
}

export const _flowcoreObservationAperture = Object.freeze({
  compileObservationAperture,
  qualifyNegativeObservation,
  compareObservationApertures
});