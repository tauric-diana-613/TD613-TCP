export const TEMPORAL_BLOOM_SCHEMA = 'td613.safe-harbor.temporal-bloom/v1';
export const PROVENANCE_PRESENTATION_SCHEMA = 'td613.safe-harbor.provenance-presentation/v1';
export const ATTESTATION_METADATA_SCHEMA = 'td613.safe-harbor.pua-provenance-attestation/v1';
export const TEMPORAL_MATURE_WORDS = 360;
export const HISTORICAL_EXAMPLE = 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload 5 · 2025-10-17 · ⟐';
export const SHI_PATTERN = /^TD613-SH-9B07D8B-[0-9A-F]{8}$/u;

const LANE_COPY = Object.freeze({
  future_self: Object.freeze([
    Object.freeze({ max: 119, band: 'waiting', color: 'grey', copy: 'This page is waiting with you.' }),
    Object.freeze({ max: 239, band: 'noticed', color: 'magenta', copy: 'A Future Has Noticed You' }),
    Object.freeze({ max: 359, band: 'carrying', color: 'yellow', copy: 'The Message Is Carrying' }),
    Object.freeze({ max: Infinity, band: 'receiving', color: 'cyan', copy: 'The Next Self Can Hear You' })
  ]),
  past_self: Object.freeze([
    Object.freeze({ max: 119, band: 'waiting', color: 'grey', copy: 'This page is listening behind you.' }),
    Object.freeze({ max: 239, band: 'noticed', color: 'magenta', copy: 'Memory Has Turned Toward You' }),
    Object.freeze({ max: 359, band: 'carrying', color: 'yellow', copy: 'The Message Is Finding Its Way Back' }),
    Object.freeze({ max: Infinity, band: 'receiving', color: 'cyan', copy: 'The Past Can Receive You' })
  ]),
  higher_self: Object.freeze([
    Object.freeze({ max: 119, band: 'waiting', color: 'grey', copy: 'This page is holding the open field.' }),
    Object.freeze({ max: 239, band: 'noticed', color: 'magenta', copy: 'A Witness Has Gathered' }),
    Object.freeze({ max: 359, band: 'carrying', color: 'yellow', copy: 'The Pattern Is Holding' }),
    Object.freeze({ max: Infinity, band: 'receiving', color: 'cyan', copy: 'The Higher Self Can Receive You' })
  ])
});

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function getPath(value, path) {
  return String(path || '').split('.').reduce((node, key) => (
    node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined
  ), value);
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null) ?? null;
}

function unique(values) {
  return Array.from(new Set(values.filter((value) => value !== undefined && value !== null)));
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/gu, '&amp;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;')
    .replace(/"/gu, '&quot;')
    .replace(/'/gu, '&apos;');
}

export function stableCanonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableCanonicalJson).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableCanonicalJson(value[key])}`).join(',')}}`;
}

export function temporalBloomLaneState(lane, countedWords) {
  const policy = LANE_COPY[lane];
  if (!policy) throw new Error(`Unknown Temporal Bloom lane: ${lane}`);
  const observed = Math.max(0, Math.floor(Number(countedWords) || 0));
  const selected = policy.find((entry) => observed <= entry.max) || policy[policy.length - 1];
  return Object.freeze({
    schema_version: TEMPORAL_BLOOM_SCHEMA,
    lane,
    band: selected.band,
    color_token: selected.color,
    recognition_copy: selected.copy,
    mature: observed >= TEMPORAL_MATURE_WORDS,
    counts_publicly_visible: false,
    progress_bar_semantics: false,
    motion_required_for_state: false
  });
}

export function buildTemporalBloomPresentation(countedState = {}) {
  const laneCounts = isObject(countedState.lane_counts) ? countedState.lane_counts : {};
  const lanes = {};
  for (const lane of Object.keys(LANE_COPY)) lanes[lane] = temporalBloomLaneState(lane, laneCounts[lane]);
  const currentLane = Object.prototype.hasOwnProperty.call(lanes, countedState.current_lane)
    ? countedState.current_lane
    : 'future_self';
  return Object.freeze({
    schema_version: TEMPORAL_BLOOM_SCHEMA,
    current_lane: currentLane,
    current: lanes[currentLane],
    lanes,
    public_mode: countedState.public_mode !== false,
    mature_threshold_source: 'safe-harbor-main-counted-state',
    independent_tokenization_performed: false,
    raw_counts_exposed_in_public_presentation: false,
    telemetry_collected: false
  });
}

export function validateShiSurfaces(surfaces = {}) {
  const names = ['packet_shi', 'canon_shi', 'binding_shi', 'dom_shi', 'svg_shi'];
  const values = names.map((name) => typeof surfaces[name] === 'string' ? surfaces[name].trim().toUpperCase() : null);
  if (values.some((value) => !value)) return Object.freeze({ status: 'hold', reason: 'missing-shi', names, values });
  if (values.some((value) => !SHI_PATTERN.test(value))) return Object.freeze({ status: 'hold', reason: 'invalid-shi-format', names, values });
  if (!values.every((value) => value === values[0])) return Object.freeze({ status: 'hold', reason: 'shi-mismatch', names, values });
  return Object.freeze({ status: 'pass', reason: null, shi_number: values[0], names, values });
}

export function buildAuthorityChronology(packetSummary = {}, presentationTimestamp = null) {
  const lineage = isObject(packetSummary.temporal_lineage) ? packetSummary.temporal_lineage : {};
  const bindingTs = firstDefined(
    getPath(lineage, 'root_binding_authority.recorded_ts_utc'),
    '2025-08-11T03:58:39Z'
  );
  const historicalDate = firstDefined(
    getPath(lineage, 'badge_protocol_history.recorded_date'),
    '2025-10-17'
  );
  const historicalExample = firstDefined(
    getPath(lineage, 'badge_protocol_history.historical_example'),
    packetSummary.historical_example,
    HISTORICAL_EXAMPLE
  );
  const intakeTs = firstDefined(
    getPath(lineage, 'entrant_credential_authority.recorded_ts_utc'),
    packetSummary.entrant_intake_ts
  );
  const countersignatureTs = firstDefined(
    getPath(lineage, 'entrant_countersignature_authority.recorded_ts_utc'),
    getPath(packetSummary, 'countersignature.signed_at_utc')
  );
  return Object.freeze({
    binding_authority: Object.freeze({ authority_class: 'root namespace and covenant binding authority', timestamp: bindingTs }),
    badge_protocol_history: Object.freeze({ authority_class: 'first preserved operational badge-protocol specimen', date: historicalDate, historical_example: historicalExample }),
    entrant_credential_authority: Object.freeze({ authority_class: 'packet-specific credential authority', timestamp: intakeTs }),
    entrant_countersignature_authority: Object.freeze({ authority_class: 'packet-scoped custody and authorship-assertion authority', timestamp: countersignatureTs, state: countersignatureTs ? 'COUNTERSIGNED' : 'UNSIGNED' }),
    presentation_authority: Object.freeze({ authority_class: 'presentation and integrity-attestation authority', timestamp: presentationTimestamp || packetSummary.presentation_timestamp || null })
  });
}

export function researchAuthorityReduction(packetSummary = {}) {
  const blind = isObject(packetSummary.blind_challenge) ? packetSummary.blind_challenge : {};
  const outcome = String(firstDefined(blind.outcome, blind.status, packetSummary.blind_challenge_outcome, 'NOT-RUN')).toUpperCase();
  const collisionValue = firstDefined(
    blind.imitation_collision,
    blind.imitation_collision_state,
    packetSummary.imitation_collision_state,
    false
  );
  const collision = collisionValue === true || /PRESENT|COLLISION|TRUE/iu.test(String(collisionValue));
  const adverseOutcomes = new Set(['FAILED', 'CONTAMINATED', 'PROMPT-DOMINATED', 'IMITATION-COLLISION']);
  const reduced = collision || adverseOutcomes.has(outcome);
  const reasons = [];
  if (collision) reasons.push('AI imitation collision present');
  if (adverseOutcomes.has(outcome)) reasons.push(`Blind challenge outcome: ${outcome}`);
  return Object.freeze({
    blind_challenge_outcome: outcome,
    imitation_collision_present: collision,
    authority_claim_reduced: reduced,
    reasons,
    adverse_result_preserved: true
  });
}

export function buildProvenancePresentation(packetSummary = {}, domShi = null, presentationTimestamp = null) {
  const packetShi = firstDefined(packetSummary.shi_number, packetSummary.packet_shi);
  const canonShi = firstDefined(packetSummary.canon_shi, packetShi);
  const bindingShi = firstDefined(packetSummary.binding_shi, packetShi);
  const exact = validateShiSurfaces({
    packet_shi: packetShi,
    canon_shi: canonShi,
    binding_shi: bindingShi,
    dom_shi: domShi || packetShi,
    svg_shi: packetShi
  });
  const chronology = buildAuthorityChronology(packetSummary, presentationTimestamp);
  const reduction = researchAuthorityReduction(packetSummary);
  const countersignature = isObject(packetSummary.countersignature) ? clone(packetSummary.countersignature) : {
    status: 'unsigned', signed_at_utc: null, signature_digest: null
  };
  return Object.freeze({
    schema_version: PROVENANCE_PRESENTATION_SCHEMA,
    principal: packetSummary.principal || 'tauric.diana.613',
    badge_id: packetSummary.badge_id || 'bdg_glyph_U10D613',
    claimed_pua: packetSummary.claimed_pua || 'U+10D613',
    canonical_phrase: packetSummary.canonical_phrase || 'Tauric Diana — Crimean heritage custodianship',
    binding_fragment: packetSummary.binding_fragment || '#9B07D8B',
    sac: packetSummary.sac || 'SAC[X6ZNK5NO51]',
    shi_number: packetShi,
    footer_mode: packetSummary.footer_mode || null,
    packet_hash_sha256: packetSummary.packet_hash_sha256 || null,
    stylometric_fingerprint: packetSummary.stylometric_fingerprint || null,
    stability_digest: packetSummary.stability_digest || null,
    blind_challenge_precommitment_digest: packetSummary.blind_challenge_precommitment_digest || null,
    blind_challenge_result_digest: packetSummary.blind_challenge_result_digest || null,
    restoration_receipt_digest: packetSummary.restoration_receipt_digest || null,
    countersignature,
    chronology,
    shi_exact_match: exact,
    authority_reduction: reduction,
    claim_ceiling: packetSummary.claim_ceiling || 'Packet-scoped stylometric evidence and custody assertion only; independent identity and universal authorship adjudication are not claimed.',
    raw_text_included: false,
    telemetry_collected: false
  });
}

export function buildAttestationMetadata(presentation = {}) {
  const chronology = isObject(presentation.chronology) ? clone(presentation.chronology) : buildAuthorityChronology(presentation);
  const reduction = isObject(presentation.authority_reduction) ? clone(presentation.authority_reduction) : researchAuthorityReduction(presentation);
  const exact = isObject(presentation.shi_exact_match)
    ? clone(presentation.shi_exact_match)
    : validateShiSurfaces({
      packet_shi: presentation.shi_number,
      canon_shi: presentation.shi_number,
      binding_shi: presentation.shi_number,
      dom_shi: presentation.shi_number,
      svg_shi: presentation.shi_number
    });
  return Object.freeze({
    schema_version: ATTESTATION_METADATA_SCHEMA,
    namespace_anchor: 'U+10D613',
    principal: presentation.principal || 'tauric.diana.613',
    claimed_pua: presentation.claimed_pua || 'U+10D613',
    shi_number: presentation.shi_number || null,
    svg_shi: presentation.shi_number || null,
    packet_hash_sha256: presentation.packet_hash_sha256 || null,
    stylometric_fingerprint: presentation.stylometric_fingerprint || null,
    stability_digest: presentation.stability_digest || null,
    blind_challenge_precommitment_digest: presentation.blind_challenge_precommitment_digest || null,
    blind_challenge_result_digest: presentation.blind_challenge_result_digest || null,
    restoration_receipt_digest: presentation.restoration_receipt_digest || null,
    genuine_holdout_rank: firstDefined(presentation.genuine_holdout_rank, getPath(presentation, 'blind_challenge.genuine_holdout_rank')),
    nearest_impostor_margin: firstDefined(presentation.nearest_impostor_margin, getPath(presentation, 'blind_challenge.nearest_impostor_margin')),
    imitation_collision_state: reduction.imitation_collision_present ? 'PRESENT' : 'ABSENT',
    countersignature_status: String(getPath(presentation, 'countersignature.status') || 'unsigned').toUpperCase(),
    countersignature_digest: getPath(presentation, 'countersignature.signature_digest') || null,
    authority_chronology: chronology,
    shi_exact_match: exact,
    authority_claim_reduced: reduction.authority_claim_reduced,
    authority_reduction_reasons: reduction.reasons,
    historical_example: HISTORICAL_EXAMPLE,
    claim_ceiling: presentation.claim_ceiling || 'Independent identity adjudication and universal authorship attribution are not claimed.',
    raw_text_included: false
  });
}

export function validateAttestationMetadata(metadata = {}) {
  const exact = isObject(metadata.shi_exact_match) ? metadata.shi_exact_match : { status: 'hold', reason: 'missing-shi-exact-match' };
  if (exact.status !== 'pass') return Object.freeze({ status: 'hold', reason: exact.reason || 'shi-exact-match-hold' });
  const chronology = metadata.authority_chronology || {};
  if (getPath(chronology, 'binding_authority.timestamp') !== '2025-08-11T03:58:39Z') return Object.freeze({ status: 'hold', reason: 'binding-authority-timestamp-conflict' });
  if (getPath(chronology, 'badge_protocol_history.historical_example') !== HISTORICAL_EXAMPLE) return Object.freeze({ status: 'hold', reason: 'historical-example-conflict' });
  const signed = String(metadata.countersignature_status || '').toUpperCase() === 'COUNTERSIGNED';
  if (signed && !metadata.countersignature_digest) return Object.freeze({ status: 'hold', reason: 'invalid-countersignature' });
  if (!getPath(chronology, 'presentation_authority.timestamp')) return Object.freeze({ status: 'hold', reason: 'missing-presentation-authority' });
  return Object.freeze({ status: 'pass', reason: null, authority_claim_reduced: metadata.authority_claim_reduced === true });
}

export function buildDeterministicAttestationSvg(metadata = {}) {
  const validation = validateAttestationMetadata(metadata);
  if (validation.status !== 'pass') throw new Error(`SVG export hold: ${validation.reason}`);
  const metaJson = stableCanonicalJson(metadata);
  const authorityLine = metadata.authority_claim_reduced ? 'AUTHORITY CLAIM REDUCED' : 'PACKET-BOUND AUTHORITY';
  const collisionLine = `AI IMITATION COLLISION: ${metadata.imitation_collision_state || 'ABSENT'}`;
  return [
    '<svg viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="td613Title td613Desc">',
    '<title id="td613Title">TD613 PUA Provenance Attestation</title>',
    `<desc id="td613Desc">${escapeXml(authorityLine)}. ${escapeXml(collisionLine)}.</desc>`,
    `<metadata id="safeHarborGen3Provenance">${escapeXml(metaJson)}</metadata>`,
    '<rect x="1" y="1" width="638" height="358" rx="24" fill="#071018" stroke="#78dce8" stroke-width="2"/>',
    '<text x="40" y="64" fill="#f5f7fa" font-size="24" font-family="ui-monospace, monospace">TD613 · U+10D613</text>',
    `<text x="40" y="112" fill="#78dce8" font-size="20" font-family="ui-monospace, monospace">${escapeXml(metadata.shi_number)}</text>`,
    `<text x="40" y="164" fill="#f5f7fa" font-size="16" font-family="ui-monospace, monospace">${escapeXml(collisionLine)}</text>`,
    `<text x="40" y="204" fill="#f5f7fa" font-size="16" font-family="ui-monospace, monospace">${escapeXml(authorityLine)}</text>`,
    '<text x="40" y="252" fill="#c9d1d9" font-size="14" font-family="ui-monospace, monospace">INDEPENDENT IDENTITY ADJUDICATION: NOT CLAIMED</text>',
    '<text x="40" y="302" fill="#c9d1d9" font-size="12" font-family="ui-monospace, monospace">Presentation and integrity attestation; packet-scoped custody only.</text>',
    '</svg>'
  ].join('');
}

export function presentationContainsRawText(value = {}) {
  const serialized = stableCanonicalJson(value);
  return /"(?:raw_text|source_text|entrant_text|window_text|prompt_text|revision_history|keystroke_timing|pause_timing)"\s*:/u.test(serialized);
}

export function laneNames() {
  return Object.keys(LANE_COPY);
}

export function allowedAuthorityStates() {
  return unique(['PACKET-BOUND AUTHORITY', 'AUTHORITY CLAIM REDUCED']);
}
