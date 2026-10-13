import { sha256Text } from './hush-customizer-packet.js';

export const HUSH_PHASE8_CANDIDATE_PRESENCE_GATE_SCHEMA = 'td613.hush.phase8.candidate-presence-gate/v1';
export const HUSH_PHASE8_ENTRYPOINT_ASSERTION_SCHEMA = 'td613.hush.phase8.entrypoint-assertion/v1';
export const PHASE8_REQUIRED_ENTRYPOINT = 'buildHushPerMaskPacketWithMetricPassport';
export const PHASE8_METRIC_WRAPPER_SCHEMA = 'td613.hush.phase8.metric-passport-wrapper/v1';

function text(value) { return String(value ?? ''); }
function normalized(value) { return text(value).trim().replace(/\s+/gu, ' '); }
function unique(values) { return [...new Set(values.filter(Boolean))]; }

export async function buildCandidatePresenceGate(candidate = '', sourceText = '', options = {}) {
  const candidateRequired = options.candidate_required !== false;
  const candidateValue = normalized(candidate);
  const sourceValue = normalized(sourceText);
  const candidatePresent = candidateValue.length > 0;
  const candidateHash = candidatePresent ? await sha256Text(candidateValue) : null;
  const sourceHash = sourceValue ? await sha256Text(sourceValue) : null;
  const sourceTextUsedAsCandidate = Boolean(candidatePresent && sourceHash && candidateHash === sourceHash);
  const reasons = [];
  if (candidateRequired && !candidatePresent) reasons.push('candidate_present');
  if (candidateRequired && !candidateHash) reasons.push('candidate_hash_sha256');
  if (sourceTextUsedAsCandidate) reasons.push('source_candidate_separation');
  const status = reasons.length ? (options.missing_candidate_status || 'blocked') : 'passed';
  return Object.freeze({
    schema: HUSH_PHASE8_CANDIDATE_PRESENCE_GATE_SCHEMA,
    candidate_required: candidateRequired,
    candidate_present: candidatePresent,
    candidate_hash_sha256: candidateHash,
    source_hash_sha256: sourceHash,
    raw_candidate_included: false,
    source_text_used_as_candidate: sourceTextUsedAsCandidate,
    source_candidate_separation: sourceTextUsedAsCandidate ? 'blocked' : 'held',
    missing_candidate_status: options.missing_candidate_status || 'blocked',
    status,
    block_reasons: Object.freeze(unique(reasons))
  });
}

export function buildPhase8EntrypointAssertion(packet = {}, options = {}) {
  const observedWrapperSchema = packet.schema || null;
  const metricWrapperPresent = observedWrapperSchema === PHASE8_METRIC_WRAPPER_SCHEMA;
  const baseAllowedAlone = options.base_packet_builder_allowed_alone === true;
  const reasons = [];
  if (!metricWrapperPresent) reasons.push('metric_wrapper_present');
  if (options.required_entrypoint && options.required_entrypoint !== PHASE8_REQUIRED_ENTRYPOINT) reasons.push('required_entrypoint');
  if (baseAllowedAlone) reasons.push('base_packet_builder_allowed_alone');
  return Object.freeze({
    schema: HUSH_PHASE8_ENTRYPOINT_ASSERTION_SCHEMA,
    required_entrypoint: PHASE8_REQUIRED_ENTRYPOINT,
    observed_wrapper_schema: observedWrapperSchema,
    base_packet_builder_allowed_alone: false,
    metric_wrapper_present: metricWrapperPresent,
    phase8_1_valid: metricWrapperPresent && !baseAllowedAlone,
    status: reasons.length ? 'blocked' : 'passed',
    block_reasons: Object.freeze(unique(reasons))
  });
}

export function assertPhase8MetricWrapperEntrypoint(packet = {}) {
  return buildPhase8EntrypointAssertion(packet);
}
