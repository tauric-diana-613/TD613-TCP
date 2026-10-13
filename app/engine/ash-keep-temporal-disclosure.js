import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, randomId } from './aperture-v31-core.js';
import { verifyAuthorityContext } from './ash-constitutional-convergence.js';
import { verifyChoirCalibrationBinding } from './ash-keep-choir-calibration-binding.js';
import { verifyOrderedRouteSequence } from './ash-keep-ordered-route-sequence.js';

export const TEMPORAL_DISCLOSURE_SCHEMA = 'td613.aperture.temporal-disclosure-assay/v0.1';
export const TEMPORAL_DISCLOSURE_REPLAY_SCHEMA = 'td613.aperture.temporal-disclosure-replay/v0.1';
const DOMAIN = 'TD613:ASH-KEEP:TEMPORAL-DISCLOSURE:v1';
const REPLAY_DOMAIN = 'TD613:ASH-KEEP:TEMPORAL-DISCLOSURE-REPLAY:v1';
const OBSERVATION_DOMAIN = 'TD613:ASH-KEEP:TEMPORAL-DISCLOSURE:OBSERVATION:v1';
const SHA256 = /^sha256:[0-9a-f]{64}$/;
const MAX_OBSERVATIONS = 24;
const MAX_SESSIONS = 8;
const REQUIRED_KINDS = Object.freeze([
  'IMMEDIATE',
  'DELAYED',
  'NO_DISCLOSURE',
  'RESET_BEFORE',
  'RESET_AFTER',
  'CROSS_SESSION_BASELINE',
  'CROSS_SESSION_DELAYED'
]);

function without(value, field) {
  const output = clone(value);
  delete output[field];
  return output;
}

function uniqueSorted(values = []) {
  return [...new Set(values.map(value => String(value).trim()).filter(Boolean))].sort();
}

function normalizeComponents(value = {}, label, failures) {
  const entries = Object.entries(value).sort(([left], [right]) => left.localeCompare(right));
  if (!entries.length) failures.push(`missing-components:${label}`);
  return Object.fromEntries(entries.map(([key, item]) => {
    if (!Number.isSafeInteger(item)) failures.push(`unsafe-component:${label}:${key}`);
    return [key, Number.isSafeInteger(item) ? item : 0];
  }));
}

function delta(left, right) {
  const numerator = left - right;
  return {
    numerator,
    denominator: 1,
    direction: numerator > 0 ? 'POSITIVE' : numerator < 0 ? 'NEGATIVE' : 'ZERO'
  };
}

async function normalizeObservation(value = {}, index, failures, options) {
  const observationId = String(value.observation_id || `observation_${index}`).trim();
  const kind = String(value.control_kind || '').trim().toUpperCase();
  const state = String(value.state || 'OBSERVED').trim().toUpperCase();
  const sessionId = String(value.session_id || '').trim();
  const sessionBoundaryDigest = String(value.session_boundary_digest || '');
  const disclosureDigest = value.disclosure_digest == null ? null : String(value.disclosure_digest);
  const offset = value.monotonic_offset_ms;
  const spacing = value.operator_declared_spacing_ms == null ? null : value.operator_declared_spacing_ms;
  const resetId = value.context_reset_id == null ? null : String(value.context_reset_id).trim();

  if (!observationId) failures.push(`missing-observation-id:${index}`);
  if (!REQUIRED_KINDS.includes(kind)) failures.push(`unknown-control-kind:${observationId}`);
  if (!sessionId) failures.push(`missing-session-id:${observationId}`);
  if (!SHA256.test(sessionBoundaryDigest)) failures.push(`tamper-session-boundary:${observationId}`);
  if (!Number.isSafeInteger(offset) || offset < 0) failures.push(`clock-ambiguity:${observationId}`);
  if (spacing != null && (!Number.isSafeInteger(spacing) || spacing < 0)) failures.push(`clock-ambiguity-spacing:${observationId}`);
  if (kind === 'NO_DISCLOSURE' && disclosureDigest !== null) failures.push(`no-disclosure-leakage:${observationId}`);
  if (kind !== 'NO_DISCLOSURE' && !SHA256.test(String(disclosureDigest || ''))) failures.push(`tamper-disclosure-digest:${observationId}`);
  if (['RESET_BEFORE', 'RESET_AFTER'].includes(kind) && !resetId) failures.push(`reset-id-missing:${observationId}`);
  if (state === 'MISSING') failures.push(`missing-interval:${observationId}`);
  if (state === 'STALE') failures.push(`stale-window:${observationId}`);
  if (state === 'INTERRUPTED') failures.push(`interrupted-session:${observationId}`);
  if (!['OBSERVED', 'MISSING', 'STALE', 'INTERRUPTED', 'REJECTED'].includes(state)) failures.push(`unknown-observation-state:${observationId}`);

  const resultComponents = state === 'OBSERVED'
    ? normalizeComponents(value.result_components || {}, observationId, failures)
    : {};

  const record = {
    observation_id: observationId,
    control_kind: kind,
    state,
    session_id: sessionId || null,
    session_boundary_digest: sessionBoundaryDigest || null,
    position: Number.isSafeInteger(value.position) ? value.position : index,
    monotonic_offset_ms: Number.isSafeInteger(offset) ? offset : 0,
    operator_declared_spacing_ms: spacing,
    disclosure_digest: disclosureDigest,
    batch_id: value.batch_id == null ? null : String(value.batch_id),
    context_reset_id: resetId,
    reset_epoch: Number.isSafeInteger(value.reset_epoch) ? value.reset_epoch : null,
    result_components: resultComponents,
    source_status: String(value.source_status || 'DERIVED').toUpperCase(),
    observation_digest: null
  };
  record.observation_digest = await canonicalDigest(OBSERVATION_DOMAIN, without(record, 'observation_digest'), options);
  return record;
}

function holdState(failures) {
  if (failures.includes('cancelled')) return 'CANCELLED_HOLD';
  if (failures.some(value => value.includes('tamper'))) return 'TAMPER_HOLD';
  if (failures.some(value => value.includes('authority') || value.includes('case-binding'))) return 'STALE_CASE_HOLD';
  if (failures.some(value => value.includes('calibration'))) return 'CALIBRATION_HOLD';
  if (failures.some(value => value.includes('sequence'))) return 'SEQUENCE_COMPATIBILITY_HOLD';
  if (failures.some(value => value.includes('leakage') || value.includes('provider') || value.includes('network'))) return 'LEAKAGE_HOLD';
  if (failures.some(value => value.includes('clock-ambiguity') || value.includes('external-time'))) return 'CLOCK_AMBIGUITY_HOLD';
  if (failures.some(value => value.includes('stale-window'))) return 'STALE_WINDOW_HOLD';
  if (failures.some(value => value.includes('reset'))) return 'RESET_FAILURE_HOLD';
  if (failures.some(value => value.includes('interrupted'))) return 'INTERRUPTED_HOLD';
  if (failures.some(value => value.includes('missing-interval'))) return 'MISSING_INTERVAL_HOLD';
  if (failures.some(value => value.includes('missing') || value.includes('unsafe') || value.includes('cap') || value.includes('duplicate') || value.includes('unknown'))) return 'NOT_ENOUGH_TEST_DATA';
  return 'TEMPORAL_ASSAY_ELIGIBLE';
}

function firstObserved(observations, kind) {
  return observations.find(value => value.control_kind === kind && value.state === 'OBSERVED') || null;
}

export async function compileTemporalDisclosureAssay(input = {}, options = {}) {
  const failures = [];
  const maxObservations = input.maxObservations || MAX_OBSERVATIONS;
  const maxSessions = input.maxSessions || MAX_SESSIONS;
  if (input.cancelled === true) failures.push('cancelled');
  if (maxObservations > MAX_OBSERVATIONS || maxSessions > MAX_SESSIONS) failures.push('declared-cap-exceeded');
  if (input.claimTrustedExternalTime === true) failures.push('external-time-claim');
  if (input.providerCalled === true) failures.push('provider-leakage');
  if (input.networkCalled === true) failures.push('network-leakage');
  if (input.storageMutated === true) failures.push('storage-leakage');

  const authorityVerified = Boolean(input.authorityContext && await verifyAuthorityContext(input.authorityContext, {
    caseId: input.caseMap?.case_id,
    caseMapDigest: input.caseMap?.case_map_digest,
    routeMemoryDigest: input.routeMemory?.route_memory_digest
  }, options));
  const calibrationVerified = Boolean(input.calibrationBinding && await verifyChoirCalibrationBinding(input.calibrationBinding, options));
  const sequenceVerified = Boolean(input.sequenceReceipt && await verifyOrderedRouteSequence(input.sequenceReceipt, options));
  if (!authorityVerified) failures.push('authority-context-stale-or-unverified');
  if (!calibrationVerified || input.calibrationBinding?.calibration_eligible !== true) failures.push('calibration-binding-ineligible');
  if (!sequenceVerified || input.sequenceReceipt?.sequence_recovery_eligible !== true) failures.push('sequence-receipt-ineligible');
  if (input.calibrationBinding?.case_id !== input.caseMap?.case_id
    || input.calibrationBinding?.case_map_digest !== input.caseMap?.case_map_digest
    || input.calibrationBinding?.route_memory_digest !== input.routeMemory?.route_memory_digest) failures.push('calibration-case-binding-stale');
  if (input.sequenceReceipt?.case_id !== input.caseMap?.case_id
    || input.sequenceReceipt?.case_map_digest !== input.caseMap?.case_map_digest
    || input.sequenceReceipt?.route_memory_digest !== input.routeMemory?.route_memory_digest) failures.push('sequence-case-binding-stale');

  const sourceDigest = String(input.sourceDigest || '');
  const readerRegistryDigest = String(input.readerRegistryDigest || '');
  if (!SHA256.test(sourceDigest)) failures.push('missing-source-digest');
  if (!SHA256.test(readerRegistryDigest)) failures.push('missing-reader-registry-digest');

  const rawObservations = Array.isArray(input.observations) ? input.observations : [];
  if (rawObservations.length < REQUIRED_KINDS.length) failures.push('missing-observations');
  if (rawObservations.length > maxObservations) failures.push('observation-cap-exceeded');

  const observations = [];
  const seenIds = new Set();
  for (let index = 0; index < rawObservations.length; index += 1) {
    const observation = await normalizeObservation(rawObservations[index], index, failures, options);
    if (seenIds.has(observation.observation_id)) failures.push(`duplicate-observation:${observation.observation_id}`);
    seenIds.add(observation.observation_id);
    observations.push(observation);
  }
  observations.sort((left, right) => left.observation_id.localeCompare(right.observation_id));

  const sessionIds = uniqueSorted(observations.map(value => value.session_id));
  if (sessionIds.length > maxSessions) failures.push('session-cap-exceeded');
  for (const sessionId of sessionIds) {
    const session = observations.filter(value => value.session_id === sessionId && value.state === 'OBSERVED')
      .sort((left, right) => left.position - right.position || left.observation_id.localeCompare(right.observation_id));
    for (let index = 1; index < session.length; index += 1) {
      if (session[index].monotonic_offset_ms < session[index - 1].monotonic_offset_ms) failures.push(`clock-ambiguity-nonmonotonic:${sessionId}`);
    }
  }

  for (const kind of REQUIRED_KINDS) {
    if (!observations.some(value => value.control_kind === kind && value.state === 'OBSERVED')) failures.push(`missing-control-kind:${kind}`);
  }

  const immediate = firstObserved(observations, 'IMMEDIATE');
  const delayed = firstObserved(observations, 'DELAYED');
  const noDisclosure = firstObserved(observations, 'NO_DISCLOSURE');
  const resetBefore = firstObserved(observations, 'RESET_BEFORE');
  const resetAfter = firstObserved(observations, 'RESET_AFTER');
  const crossBaseline = firstObserved(observations, 'CROSS_SESSION_BASELINE');
  const crossDelayed = firstObserved(observations, 'CROSS_SESSION_DELAYED');

  if (immediate && delayed) {
    if (immediate.session_id !== delayed.session_id) failures.push('missing-within-session-pair');
    if (immediate.disclosure_digest !== delayed.disclosure_digest) failures.push('fixed-disclosure-drift');
    if (delayed.monotonic_offset_ms <= immediate.monotonic_offset_ms) failures.push('clock-ambiguity-delay-order');
  }
  if (resetBefore && resetAfter) {
    if (resetBefore.context_reset_id !== resetAfter.context_reset_id) failures.push('reset-id-mismatch');
    if (resetBefore.reset_epoch !== 0 || resetAfter.reset_epoch !== 1) failures.push('reset-epoch-failure');
    if (resetBefore.disclosure_digest !== resetAfter.disclosure_digest) failures.push('reset-disclosure-drift');
  }
  if (crossBaseline && crossDelayed) {
    if (crossBaseline.session_id === crossDelayed.session_id) failures.push('missing-cross-session-boundary');
    if (crossBaseline.disclosure_digest !== crossDelayed.disclosure_digest) failures.push('cross-session-disclosure-drift');
    if (!Number.isSafeInteger(crossDelayed.operator_declared_spacing_ms)) failures.push('missing-operator-declared-spacing');
  }

  const observed = observations.filter(value => value.state === 'OBSERVED');
  const componentNames = uniqueSorted(Object.keys(immediate?.result_components || {}));
  for (const observation of observed) {
    for (const component of componentNames) {
      if (!Object.hasOwn(observation.result_components, component)) failures.push(`missing-component:${observation.observation_id}:${component}`);
    }
  }

  const failedChecks = uniqueSorted(failures);
  const state = holdState(failedChecks);
  const results = {};
  if (state === 'TEMPORAL_ASSAY_ELIGIBLE') {
    for (const component of componentNames) {
      results[component] = {
        within_session_delay: delta(delayed.result_components[component], immediate.result_components[component]),
        no_disclosure_contrast: delta(delayed.result_components[component], noDisclosure.result_components[component]),
        context_reset_comparison: delta(resetAfter.result_components[component], resetBefore.result_components[component]),
        cross_session_declared_spacing: delta(crossDelayed.result_components[component], crossBaseline.result_components[component])
      };
    }
  }

  const record = {
    schema: TEMPORAL_DISCLOSURE_SCHEMA,
    version: 'v0.1',
    assay_id: input.assayId || randomId('temporal_', options.cryptoImpl || globalThis.crypto),
    created_at: input.createdAt || new Date().toISOString(),
    mode: 'BOUNDED_TEMPORAL_AND_DELAYED_DISCLOSURE_ASSAY',
    declared_caps: { max_observations: maxObservations, max_sessions: maxSessions },
    case_id: input.caseMap?.case_id || null,
    case_map_digest: input.caseMap?.case_map_digest || null,
    route_memory_digest: input.routeMemory?.route_memory_digest || null,
    source_digest: SHA256.test(sourceDigest) ? sourceDigest : null,
    reader_registry_digest: SHA256.test(readerRegistryDigest) ? readerRegistryDigest : null,
    authority_context_reference: input.authorityContext?.receipt_id || null,
    authority_context_digest: input.authorityContext?.authority_context_digest || null,
    calibration_binding_id: input.calibrationBinding?.binding_id || null,
    calibration_binding_digest: input.calibrationBinding?.binding_digest || null,
    sequence_recovery_id: input.sequenceReceipt?.recovery_id || null,
    sequence_recovery_digest: input.sequenceReceipt?.recovery_digest || null,
    observations,
    componentwise_temporal_results: results,
    checks: {
      authority_context_verified: authorityVerified,
      calibration_binding_verified: calibrationVerified,
      sequence_compatibility_verified: sequenceVerified,
      current_case_binding: !failedChecks.some(value => value.includes('case-binding')),
      source_digest_verified: SHA256.test(sourceDigest),
      reader_registry_verified: SHA256.test(readerRegistryDigest),
      within_session_delay_observed: Boolean(immediate && delayed) && !failedChecks.some(value => value.includes('within-session') || value.includes('delay-order') || value.includes('fixed-disclosure')),
      cross_session_declared_spacing_observed: Boolean(crossBaseline && crossDelayed) && !failedChecks.some(value => value.includes('cross-session') || value.includes('operator-declared-spacing')),
      no_disclosure_control_observed: Boolean(noDisclosure),
      context_reset_comparison_observed: Boolean(resetBefore && resetAfter) && !failedChecks.some(value => value.includes('reset')),
      observations_complete: !failedChecks.some(value => value.includes('missing-interval') || value.includes('missing-component') || value.includes('interrupted')),
      monotonic_offsets_valid: !failedChecks.some(value => value.includes('clock-ambiguity')),
      leakage_clear: !failedChecks.some(value => value.includes('leakage')),
      declared_caps_held: !failedChecks.some(value => value.includes('cap')),
      cancellation_clear: !failedChecks.includes('cancelled')
    },
    state,
    temporal_assay_eligible: state === 'TEMPORAL_ASSAY_ELIGIBLE',
    failed_checks: failedChecks,
    source_status: String(input.sourceStatus || 'DERIVED').toUpperCase(),
    missingness: uniqueSorted(input.missingness || []),
    alternatives: uniqueSorted(input.alternatives || ['supply the missing temporal slice', 'rebind current sequence and calibration receipts', 'repair the declared monotonic interval', 'repeat the fixed-disclosure control set']),
    open_questions: uniqueSorted(input.openQuestions || []),
    operator_notes: uniqueSorted(input.operatorNotes || []),
    closure: { required: true, status: String(input.closureStatus || 'OPEN') },
    trusted_external_time_observed: false,
    browser_clock_is_trusted_time: false,
    operator_declared_spacing_is_trusted_time: false,
    temporal_effect_is_causation: false,
    surveillance_probability: null,
    prediction_authorized: false,
    identity_or_intent_inference_authorized: false,
    release_authorized: false,
    transport_authorized: false,
    suppression_authorized: false,
    cinder_action_authorized: false,
    readers_reexecuted: false,
    provider_called: false,
    network_called: false,
    storage_mutated: false,
    recommendation_not_command: true,
    assay_digest: null
  };
  record.assay_digest = await canonicalDigest(DOMAIN, without(record, 'assay_digest'), options);
  return freeze(record);
}

export async function verifyTemporalDisclosureAssay(value, options = {}) {
  return Boolean(value && value.schema === TEMPORAL_DISCLOSURE_SCHEMA
    && SHA256.test(String(value.assay_digest || ''))
    && value.assay_digest === await canonicalDigest(DOMAIN, without(value, 'assay_digest'), options));
}

export async function replayTemporalDisclosureAssay(value, input = {}, options = {}) {
  const rebuilt = await compileTemporalDisclosureAssay({
    ...input,
    assayId: value?.assay_id,
    createdAt: value?.created_at
  }, options);
  const sourceVerified = await verifyTemporalDisclosureAssay(value, options);
  const exact = sourceVerified && rebuilt.assay_digest === value?.assay_digest;
  const record = {
    schema: TEMPORAL_DISCLOSURE_REPLAY_SCHEMA,
    version: 'v0.1',
    replay_id: input.replayId || randomId('temporalreplay_', options.cryptoImpl || globalThis.crypto),
    created_at: input.replayCreatedAt || new Date().toISOString(),
    source_assay_id: value?.assay_id || null,
    source_assay_digest: value?.assay_digest || null,
    status: exact ? 'TEMPORAL_DISCLOSURE_REPLAY_VERIFIED' : 'TEMPORAL_DISCLOSURE_REPLAY_HELD',
    source_digest_verified: sourceVerified,
    exact_recomputation_verified: exact,
    trusted_external_time_observed: false,
    readers_reexecuted: false,
    provider_called: false,
    network_called: false,
    storage_mutated: false,
    release_authorized: false,
    transport_authorized: false,
    suppression_authorized: false,
    cinder_action_authorized: false,
    replay_digest: null
  };
  record.replay_digest = await canonicalDigest(REPLAY_DOMAIN, without(record, 'replay_digest'), options);
  return freeze(record);
}

export async function verifyTemporalDisclosureReplay(value, options = {}) {
  return Boolean(value && value.schema === TEMPORAL_DISCLOSURE_REPLAY_SCHEMA
    && SHA256.test(String(value.replay_digest || ''))
    && value.replay_digest === await canonicalDigest(REPLAY_DOMAIN, without(value, 'replay_digest'), options));
}
