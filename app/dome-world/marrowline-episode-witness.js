// Operator-invoked, local-only evidence from ONE existing Marrowline return.
// This module never calls a provider, reads another session, paints marks, or
// infers a missing boundary from an adjacent observation.
export const MARROWLINE_EPISODE_WITNESS_SCHEMA = 'td613.marrowline.same-episode-witness/v0.1';

export async function digestMarrowlineText(value, subtle = globalThis.crypto?.subtle) {
  if (typeof value !== 'string' || !subtle?.digest) return null;
  const bytes = new TextEncoder().encode(value);
  const digest = await subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function buildMarrowlineEpisodeWitness({
  entry = null, applicationCapture = null, domText = null,
  sourceAtExport = null, sourceObservedAt = null
} = {}, hash = digestMarrowlineText) {
  const receipt = entry?.receipt && typeof entry.receipt === 'object' ? entry.receipt : null;
  const server = receipt?.responseBoundary || null;
  const serverId = typeof server?.clientEpisodeId === 'string' ? server.clientEpisodeId : null;
  const localId = typeof entry?.clientEpisodeId === 'string' ? entry.clientEpisodeId : null;
  const id = serverId || localId || null;
  const identity = serverId && localId ? (serverId === localId ? 'MATCH' : 'CONFLICT') : 'UNBOUND';
  const captureMatches = identity === 'MATCH'
    && applicationCapture?.clientEpisodeId === id
    && typeof applicationCapture?.applicationReturnText === 'string';
  const applicationText = captureMatches ? applicationCapture.applicationReturnText : null;
  const storedText = typeof entry?.text === 'string' ? entry.text : null;
  const displayedText = typeof domText === 'string' ? domText : null;
  const expectedPart = Array.isArray(entry?.relay?.parts)
    ? entry.relay.parts.find(part => part?.present === true && typeof part.text === 'string')?.text ?? null
    : null;
  // Raw-packet envelopes can be lawfully unwrapped by the relay. In that case
  // the DOM hosts the unwrapped part, not the entire source body. Never pass
  // unlike bodies to a same-text boundary comparison as if they were equal.
  const comparableDom = expectedPart !== null && expectedPart === storedText
    ? displayedText : null;
  const values = [applicationText, storedText, comparableDom, expectedPart];
  const digests = await Promise.all(values.map(value => typeof value === 'string' ? hash(value) : null));
  const [applicationHash, historyHash, domHash, partHash] = digests;
  const serverCandidateHash = typeof server?.providerCandidateTextSha256 === 'string'
    ? server.providerCandidateTextSha256 : null;
  const serverReturnHash = typeof server?.applicationReturnTextSha256 === 'string'
    ? server.applicationReturnTextSha256 : receipt?.invocation?.responseSha256 || null;
  const matched = identity === 'MATCH' && applicationHash && historyHash && domHash
    && serverReturnHash && applicationHash === historyHash && historyHash === domHash
    && domHash === serverReturnHash;
  return {
    schema: MARROWLINE_EPISODE_WITNESS_SCHEMA,
    evidence_class: 'operator-copied-local-response-and-receipt; source labels not independently authenticated',
    episode_id: id,
    episode_identity: identity,
    attempt_id: id ? `${id}:assembled-response` : null,
    attempt_id_class: 'local assembled-response label; NOT a provider request/attempt ID',
    source_at_export: sourceAtExport,
    source_observed_at_export: sourceObservedAt,
    source_same_attempt_verified: false,
    provider_model_reported: receipt?.provider?.model || null,
    provider_request_id: null,
    provider_raw_http_body: null,
    provider_candidate_text_sha256: serverCandidateHash,
    provider_candidate_basis: server?.providerCandidateBasis || null,
    server_return_text_sha256: serverReturnHash,
    boundaries: {
      provider_ingress: null,
      application_return: applicationText,
      stored_history: storedText,
      dom_text: comparableDom
    },
    boundary_sha256: {
      application_return: applicationHash,
      stored_history: historyHash,
      dom_text: domHash
    },
    display_projection: {
      expected_part_text: expectedPart,
      actual_dom_text: displayedText,
      expected_part_sha256: partHash,
      actual_dom_sha256: displayedText === comparableDom ? domHash
        : (displayedText === null ? null : await hash(displayedText)),
      exact_match: expectedPart === null || displayedText === null ? null : expectedPart === displayedText,
      full_body_comparable: comparableDom !== null
    },
    comparisons: {
      assembled_response_to_browser: serverReturnHash && applicationHash
        ? (serverReturnHash === applicationHash ? 'MATCH' : 'DIFFER') : 'UNOBSERVED',
      browser_to_history: applicationHash && historyHash
        ? (applicationHash === historyHash ? 'MATCH' : 'DIFFER') : 'UNOBSERVED',
      history_to_dom: historyHash && domHash
        ? (historyHash === domHash ? 'MATCH' : 'DIFFER') : 'UNOBSERVED',
      exact_full_path: matched ? 'MATCH' : (identity === 'CONFLICT' ? 'CONFLICT'
        : applicationText === null || comparableDom === null || !serverReturnHash ? 'UNOBSERVED' : 'DIFFER')
    },
    claim_ceiling: 'Same local turn only. Aggregated provider candidate may include authored continuation assembly. No raw provider HTTP bytes, private Google telemetry, original Probe 3 authentication, external origin, or model-internal mechanism established. A stored turn after reload cannot recreate the prior application-return capture.'
  };
}
