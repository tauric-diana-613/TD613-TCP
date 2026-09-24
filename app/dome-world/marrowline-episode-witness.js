// A human-armed, one-turn, browser-local witness. No provider call, persistence,
// telemetry promotion, text transformation, automatic grading or release authority.
export const MARROWLINE_EPISODE_WITNESS_SCHEMA = 'td613.marrowline.same-turn-boundary-witness/v0.1';

const scalarCount = value => Array.from(value).length;
const markCount = value => (value.match(/\p{M}/gu) || []).length;

export async function describeMarrowlineBoundary(value, cryptoImpl = globalThis.crypto) {
  // Missing is not empty. A plain/failed capture must never masquerade as a
  // provider's unmarked response.
  if (typeof value !== 'string') return { observed: false, text: null, sha256: null };
  const bytes = new TextEncoder().encode(value);
  let digest = null;
  if (cryptoImpl?.subtle?.digest) {
    const result = await cryptoImpl.subtle.digest('SHA-256', bytes);
    digest = Array.from(new Uint8Array(result)).map(byte => byte.toString(16).padStart(2, '0')).join('');
  }
  return {
    observed: true, text: value, sha256: digest,
    utf8_bytes: bytes.length, unicode_scalars: scalarCount(value),
    combining_marks: markCount(value)
  };
}

export function firstMarrowlineDifference(before, after) {
  if (typeof before !== 'string' || typeof after !== 'string') return null;
  const a = Array.from(before), b = Array.from(after);
  const limit = Math.min(a.length, b.length);
  let offset = 0;
  while (offset < limit && a[offset] === b[offset]) offset += 1;
  if (offset === a.length && offset === b.length) return null;
  return {
    unicode_scalar_offset: offset,
    before: offset < a.length ? 'U+' + a[offset].codePointAt(0).toString(16).toUpperCase().padStart(4, '0') : null,
    after: offset < b.length ? 'U+' + b[offset].codePointAt(0).toString(16).toUpperCase().padStart(4, '0') : null
  };
}

export async function buildMarrowlineEpisodeWitness({
  requestId = null, requestStartedAt = null, responseObservedAt = null,
  prompt = null, historyCount = null, httpStatus = null, transportError = null,
  responseBodyText = null, relayText = null, savedHistoryText = null, domText = null,
  receipt = null, failure = null, sourceBefore = null, sourceAfter = null,
  display = null
} = {}, cryptoImpl = globalThis.crypto) {
  const entries = [
    ['provider_ingress', null], // Not disclosed by the ordinary server response.
    ['application_response_body', responseBodyText],
    ['relay_transcript', relayText],
    ['saved_history', savedHistoryText],
    ['dom_text_content', domText]
  ];
  const boundaries = Object.fromEntries(await Promise.all(entries.map(async ([name, value]) =>
    [name, await describeMarrowlineBoundary(value, cryptoImpl)])));
  const intervals = [];
  for (let i = 1; i < entries.length - 1; i += 1) {
    const [from, before] = entries[i], [to, after] = entries[i + 1];
    intervals.push({
      from, to, observed_pair: typeof before === 'string' && typeof after === 'string',
      equal_decoded_text: typeof before === 'string' && typeof after === 'string' ? before === after : null,
      first_difference: firstMarrowlineDifference(before, after)
    });
  }
  const sameSourceWindow = Boolean(
    sourceBefore?.source_packet_commit
    && sourceAfter?.source_packet_commit
    && sourceBefore.source_packet_commit === sourceAfter.source_packet_commit
  );
  const observedProviderOutput = receipt?.provider?.output || null;
  return {
    schema: MARROWLINE_EPISODE_WITNESS_SCHEMA,
    evidence_class: 'browser-local-normal-human-turn; operator-exported-only',
    request_id: requestId,
    request_id_authority: 'client-assigned-episode-correlator-not-provider-attempt-id',
    request_started_at: requestStartedAt,
    response_observed_at: responseObservedAt,
    prompt: typeof prompt === 'string' ? prompt : null,
    history_turn_count: Number.isSafeInteger(historyCount) ? historyCount : null,
    transport: { http_status: httpStatus, error_class: transportError },
    source_window: {
      before: sourceBefore, after: sourceAfter, identical_claimed_source: sameSourceWindow,
      claim_ceiling: 'pre/post public release manifest; does not independently authenticate provider ingress or internal origin'
    },
    boundaries,
    intervals,
    receipt: receipt || null,
    failure: failure || null,
    provider_observation: {
      model: typeof receipt?.provider?.model === 'string' ? receipt.provider.model : null,
      output: observedProviderOutput,
      provider_ingress_capture: null,
      provider_request_id: null,
      submitted_request_bytes: null
    },
    display: display || null,
    screenshot: null,
    screenshot_status: 'not captured by a DOM text witness; operator may retain a separate same-turn screenshot',
    claim_ceiling: 'compares observed decoded browser strings only; no hidden provider telemetry, screenshot pixels, external origin, or literary quality inference'
  };
}
