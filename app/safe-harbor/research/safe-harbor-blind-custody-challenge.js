export const BLIND_CUSTODY_SCHEMA = 'td613.safe-harbor.blind-custody-challenge/v1';
export const HOLDOUT_SELECTION_POLICY = 'td613.safe-harbor.holdout-selection/v1';
export const PROFILE_POLICY = 'td613.safe-harbor.blind-profile/v1';
export const DISTANCE_POLICY = 'td613.safe-harbor.authorship-distance/v1';
export const THRESHOLD_POLICY = 'td613.safe-harbor.blind-challenge-thresholds/v1';
export const RESEARCH_GATE_POLICY = 'td613.safe-harbor.track-r-promotion/v1';
export const BLIND_OUTCOMES = Object.freeze([
  'SUPPORTED',
  'INCONCLUSIVE',
  'FAILED',
  'CONTAMINATED',
  'PROMPT-DOMINATED',
  'IMITATION-COLLISION'
]);

const CANONICAL_WINDOW_IDS = Object.freeze(['F1', 'F2', 'F3', 'P1', 'P2', 'P3', 'H1', 'H2', 'H3']);
const REQUIRED_CONTROL_COUNTS = Object.freeze({
  topic_matched_human: 2,
  semantic_paraphrase: 2,
  llm_style_imitation: 2,
  entrant_register_shift: 1
});
const RAW_TEXT_KEYS = new Set(['raw_text', 'source_text', 'entrant_text', 'window_text', 'candidate_text', 'text']);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!isObject(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
}

export function stableCanonicalJson(value) {
  return JSON.stringify(stableValue(value));
}

async function sha256Hex(input) {
  const source = String(input ?? '');
  if (globalThis.crypto?.subtle && globalThis.TextEncoder) {
    const buffer = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
    return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  const crypto = await import('node:crypto');
  return crypto.createHash('sha256').update(source).digest('hex');
}

async function digest(value) {
  return `sha256:${await sha256Hex(typeof value === 'string' ? value : stableCanonicalJson(value))}`;
}

function containsRawText(value) {
  if (Array.isArray(value)) return value.some(containsRawText);
  if (!isObject(value)) return false;
  return Object.entries(value).some(([key, child]) => RAW_TEXT_KEYS.has(key) || containsRawText(child));
}

function numericLeaves(value, prefix = '', target = {}) {
  if (Number.isFinite(value)) {
    target[prefix] = Number(value);
    return target;
  }
  if (Array.isArray(value)) {
    value.forEach((child, index) => numericLeaves(child, `${prefix}[${index}]`, target));
    return target;
  }
  if (!isObject(value)) return target;
  for (const key of Object.keys(value).sort()) {
    if (/prompt|topic|semantic|raw|text/iu.test(key)) continue;
    numericLeaves(value[key], prefix ? `${prefix}.${key}` : key, target);
  }
  return target;
}

function vectorMean(vectors = []) {
  const keys = Array.from(new Set(vectors.flatMap((vector) => Object.keys(vector)))).sort();
  const mean = {};
  for (const key of keys) {
    const values = vectors.map((vector) => vector[key]).filter(Number.isFinite);
    if (values.length) mean[key] = values.reduce((sum, value) => sum + value, 0) / values.length;
  }
  return mean;
}

function normalizedDistance(left = {}, right = {}, weights = {}) {
  const keys = Array.from(new Set([...Object.keys(left), ...Object.keys(right)])).sort();
  if (!keys.length) return null;
  let numerator = 0;
  let denominator = 0;
  for (const key of keys) {
    const weight = Number.isFinite(weights[key]) ? Math.max(0, weights[key]) : 1;
    if (!weight) continue;
    const a = Number(left[key] ?? 0);
    const b = Number(right[key] ?? 0);
    const scale = Math.max(1, Math.abs(a), Math.abs(b));
    numerator += weight * Math.min(1, Math.abs(a - b) / scale);
    denominator += weight;
  }
  return denominator ? Number((numerator / denominator).toFixed(6)) : null;
}

function canonicalWindows(windows = []) {
  const byId = new Map(windows.map((window) => [window.window_id, window]));
  return CANONICAL_WINDOW_IDS.map((id) => byId.get(id)).filter(Boolean);
}

function validateWindows(windows = []) {
  const errors = [];
  if (containsRawText(windows)) errors.push('raw-text-present');
  const ordered = canonicalWindows(windows);
  if (ordered.length !== 9) errors.push('nine-window-source-required');
  const ids = ordered.map((window) => window.window_id);
  if (new Set(ids).size !== ids.length) errors.push('duplicate-window-id');
  for (const window of ordered) {
    if (!Number.isInteger(window.observed_words) || window.observed_words < 100) errors.push(`ineligible-window:${window.window_id}`);
    if (!isObject(window.features) || !Object.keys(numericLeaves(window.features)).length) errors.push(`missing-features:${window.window_id}`);
    if (window.used_for_calibration === true || window.used_for_threshold_tuning === true || window.used_for_model_fitting === true) {
      errors.push(`contaminated-window:${window.window_id}`);
    }
  }
  return { ordered, errors: Array.from(new Set(errors)) };
}

function policyDefaults(overrides = {}) {
  return {
    feature_policy_version: PROFILE_POLICY,
    distance_policy_version: DISTANCE_POLICY,
    threshold_policy_version: THRESHOLD_POLICY,
    prompt_conditioning_policy_version: 'td613.safe-harbor.prompt-separation/v1',
    rank_threshold: 2,
    minimum_separation_margin: 0.035,
    imitation_collision_margin: 0.02,
    tie_epsilon: 0.000001,
    missing_data_policy: 'zero-fill-declared-numeric-features',
    tie_policy: 'equal-distance-preserved-as-tie',
    candidate_ranking_policy: 'ascending-normalized-distance',
    weights: {},
    ...clone(overrides)
  };
}

export async function createBlindPrecommitment(input = {}) {
  const validation = validateWindows(input.windows || []);
  const nonce = String(input.selection_nonce || '');
  const packetHash = String(input.packet_hash_sha256 || '');
  const selectionSeedAuthority = input.selection_seed_authority || 'operator-declared-local-nonce';
  if (!nonce) validation.errors.push('selection-nonce-required');
  if (!/^sha256:[0-9a-f]{64}$/u.test(packetHash)) validation.errors.push('packet-hash-required');
  const policy = policyDefaults(input.profile_policy || {});
  const selectionNonceDigest = await digest(nonce);
  const seedMaterial = {
    packet_hash_sha256: packetHash,
    selection_nonce_digest: selectionNonceDigest,
    selection_policy_version: HOLDOUT_SELECTION_POLICY,
    eligible_window_ids: validation.ordered.map((window) => window.window_id),
    selection_seed_authority: selectionSeedAuthority
  };
  const seedHex = await sha256Hex(stableCanonicalJson(seedMaterial));
  const selectedIndex = validation.ordered.length ? Number(BigInt(`0x${seedHex.slice(0, 16)}`) % BigInt(validation.ordered.length)) : -1;
  const holdout = selectedIndex >= 0 ? validation.ordered[selectedIndex] : null;
  const holdoutChecksum = holdout
    ? await digest({ window_id: holdout.window_id, observed_words: holdout.observed_words, features: numericLeaves(holdout.features) })
    : null;
  const training = validation.ordered.filter((window) => window !== holdout);
  const profileVector = vectorMean(training.map((window) => numericLeaves(window.features)));
  const profileDigest = await digest({
    included_window_ids: training.map((window) => window.window_id),
    excluded_holdout_checksum: holdoutChecksum,
    policy,
    profile_vector: profileVector
  });
  const frozen = {
    included_window_ids: training.map((window) => window.window_id),
    excluded_holdout_window_commitment: holdoutChecksum,
    feature_policy_version: policy.feature_policy_version,
    distance_policy_version: policy.distance_policy_version,
    prompt_conditioning_policy_version: policy.prompt_conditioning_policy_version,
    threshold_policy_version: policy.threshold_policy_version,
    thresholds: {
      rank_threshold: policy.rank_threshold,
      minimum_separation_margin: policy.minimum_separation_margin,
      imitation_collision_margin: policy.imitation_collision_margin,
      tie_epsilon: policy.tie_epsilon
    },
    weights: clone(policy.weights),
    missing_data_policy: policy.missing_data_policy,
    tie_policy: policy.tie_policy,
    candidate_ranking_policy: policy.candidate_ranking_policy,
    profile_digest: profileDigest,
    raw_text_included: false
  };
  const publicPrecommitmentCore = {
    selection_method: 'deterministic-seeded-window-selection',
    selection_policy_version: HOLDOUT_SELECTION_POLICY,
    selection_nonce_digest: selectionNonceDigest,
    holdout_window_id: 'sealed',
    holdout_checksum: holdoutChecksum,
    holdout_lane: 'sealed',
    holdout_word_count: holdout?.observed_words ?? null,
    sequestered_at_utc: input.sequestered_at_utc || null,
    selection_seed_authority: selectionSeedAuthority,
    eligibility_basis: 'nine canonical non-overlapping sentence-aware windows; no calibration or model-fitting reuse',
    profile_policy_frozen_before_reveal: true,
    raw_text_included: false
  };
  const precommitmentDigest = await digest({ public_precommitment: publicPrecommitmentCore, profile_construction: frozen });
  return {
    status: validation.errors.length ? 'CONTAMINATED' : 'PRECOMMITTED',
    errors: Array.from(new Set(validation.errors)),
    precommitment: { ...publicPrecommitmentCore, precommitment_digest: precommitmentDigest },
    profile_construction: frozen,
    sealed_state: holdout ? {
      holdout_window_id: holdout.window_id,
      holdout_lane: holdout.lane || holdout.window_id[0],
      holdout_features: clone(holdout.features),
      holdout_checksum: holdoutChecksum,
      profile_vector: profileVector,
      seed_hex: seedHex
    } : null
  };
}

function countControls(controls = []) {
  const counts = Object.fromEntries(Object.keys(REQUIRED_CONTROL_COUNTS).map((key) => [key, 0]));
  for (const control of controls) if (Object.prototype.hasOwnProperty.call(counts, control.control_class)) counts[control.control_class] += 1;
  return counts;
}

function validateControls(controls = []) {
  const errors = [];
  if (containsRawText(controls)) errors.push('candidate-raw-text-present');
  const counts = countControls(controls);
  for (const [controlClass, required] of Object.entries(REQUIRED_CONTROL_COUNTS)) {
    if (counts[controlClass] !== required) errors.push(`control-count:${controlClass}:${counts[controlClass]}:${required}`);
  }
  for (const control of controls) {
    if (!control.candidate_id) errors.push('candidate-id-missing');
    if (!isObject(control.features) || !Object.keys(numericLeaves(control.features)).length) errors.push(`candidate-features-missing:${control.candidate_id || 'unknown'}`);
    if (!control.provenance) errors.push(`candidate-provenance-missing:${control.candidate_id || 'unknown'}`);
  }
  return { errors: Array.from(new Set(errors)), counts };
}

async function candidateCommitment(candidate) {
  return digest({
    candidate_id: candidate.candidate_id,
    control_class: candidate.control_class,
    provenance: candidate.provenance,
    features: numericLeaves(candidate.features)
  });
}

function rankWithTies(rows, epsilon) {
  const sorted = rows.slice().sort((a, b) => a.distance - b.distance || a.blind_id.localeCompare(b.blind_id));
  let rank = 0;
  let previousDistance = null;
  return sorted.map((row, index) => {
    if (previousDistance == null || Math.abs(row.distance - previousDistance) > epsilon) rank = index + 1;
    previousDistance = row.distance;
    return { ...row, rank };
  });
}

function failureEntry(code, detail, evidenceRefs = []) {
  return { code, detail, evidence_refs: evidenceRefs, adverse_result_preserved: true };
}

export async function runBlindCustodyChallenge(input = {}) {
  const pre = input.precommitment_bundle;
  const controls = clone(input.controls || []);
  const controlValidation = validateControls(controls);
  const failures = [];
  if (!pre || pre.status !== 'PRECOMMITTED' || !pre.sealed_state) failures.push(failureEntry('precommitment-invalid', 'A valid precommitment and sealed holdout are required.'));
  for (const error of pre?.errors || []) failures.push(failureEntry(error, 'Precommitment validation failed.'));
  for (const error of controlValidation.errors) failures.push(failureEntry(error, 'Challenge-set validation failed.'));
  const frozen = pre?.profile_construction || {};
  const recomputedPrecommitmentDigest = pre ? await digest({
    public_precommitment: Object.fromEntries(Object.entries(pre.precommitment || {}).filter(([key]) => key !== 'precommitment_digest')),
    profile_construction: frozen
  }) : null;
  if (pre && recomputedPrecommitmentDigest !== pre.precommitment?.precommitment_digest) {
    failures.push(failureEntry('post-freeze-policy-mutation', 'Frozen profile or precommitment material changed after commitment.'));
  }
  const genuine = pre?.sealed_state ? {
    candidate_id: 'genuine-holdout',
    control_class: 'genuine_holdout',
    provenance: 'packet-internal sequestered holdout',
    features: pre.sealed_state.holdout_features
  } : null;
  const candidates = genuine ? [genuine, ...controls] : controls;
  const committed = [];
  for (const candidate of candidates) {
    const commitment = await candidateCommitment(candidate);
    committed.push({ candidate, commitment });
  }
  const orderSeed = await digest({
    precommitment_digest: pre?.precommitment?.precommitment_digest || null,
    candidate_commitments: committed.map((entry) => entry.commitment).sort(),
    ranking_nonce_digest: await digest(String(input.ranking_nonce || ''))
  });
  const blinded = await Promise.all(committed.map(async (entry) => ({
    blind_id: `B-${(await sha256Hex(`${orderSeed}:${entry.commitment}`)).slice(0, 12).toUpperCase()}`,
    commitment: entry.commitment,
    candidate: entry.candidate
  })));
  blinded.sort((a, b) => a.blind_id.localeCompare(b.blind_id));
  const weights = frozen.weights || {};
  const profileVector = pre?.sealed_state?.profile_vector || {};
  const distanceRows = blinded.map((entry) => ({
    blind_id: entry.blind_id,
    candidate_id: entry.candidate.candidate_id,
    control_class: entry.candidate.control_class,
    commitment: entry.commitment,
    distance: normalizedDistance(profileVector, numericLeaves(entry.candidate.features), weights)
  }));
  if (distanceRows.some((row) => !Number.isFinite(row.distance))) failures.push(failureEntry('distance-unavailable', 'At least one candidate lacked a comparable feature vector.'));
  const ranked = rankWithTies(distanceRows.filter((row) => Number.isFinite(row.distance)), frozen.thresholds?.tie_epsilon ?? 0.000001);
  const genuineRow = ranked.find((row) => row.control_class === 'genuine_holdout');
  const impostors = ranked.filter((row) => row.control_class !== 'genuine_holdout');
  const nearestImpostor = impostors[0] || null;
  const margin = genuineRow && nearestImpostor ? Number((nearestImpostor.distance - genuineRow.distance).toFixed(6)) : null;
  const bestByClass = Object.fromEntries(Object.keys(REQUIRED_CONTROL_COUNTS).map((controlClass) => {
    const row = ranked.find((candidate) => candidate.control_class === controlClass);
    return [controlClass, row?.rank ?? null];
  }));
  const promptLeakage = Boolean(input.leakage_assessment?.prompt_dominated || input.leakage_assessment?.topic_leakage_detected);
  const semanticLeakage = Boolean(input.leakage_assessment?.semantic_leakage_detected);
  const imitationBest = ranked.find((row) => row.control_class === 'llm_style_imitation');
  const imitationCollision = Boolean(
    genuineRow && imitationBest && (
      imitationBest.rank <= genuineRow.rank ||
      (Number.isFinite(margin) && margin < (frozen.thresholds?.imitation_collision_margin ?? 0.02))
    )
  );
  const tieState = Boolean(genuineRow && ranked.some((row) => row !== genuineRow && row.rank === genuineRow.rank));
  let outcome = 'SUPPORTED';
  if (failures.length) outcome = 'CONTAMINATED';
  else if (promptLeakage || semanticLeakage) outcome = 'PROMPT-DOMINATED';
  else if (imitationCollision) outcome = 'IMITATION-COLLISION';
  else if (!genuineRow || genuineRow.rank > (frozen.thresholds?.rank_threshold ?? 2) || (Number.isFinite(margin) && margin < 0)) outcome = 'FAILED';
  else if (tieState || !Number.isFinite(margin) || margin < (frozen.thresholds?.minimum_separation_margin ?? 0.035)) outcome = 'INCONCLUSIVE';
  if (!BLIND_OUTCOMES.includes(outcome)) throw new Error(`Unsupported challenge outcome: ${outcome}`);
  if (outcome !== 'SUPPORTED') failures.push(failureEntry(`challenge-outcome:${outcome}`, 'The adverse or non-supportive outcome remains part of the packet.', ['BCC-RESULT']));
  const reveal = pre?.sealed_state ? {
    holdout_window_id: pre.sealed_state.holdout_window_id,
    holdout_lane: pre.sealed_state.holdout_lane,
    revealed_after_profile_freeze: true,
    holdout_checksum_matches_precommitment: pre.sealed_state.holdout_checksum === pre.precommitment.holdout_checksum
  } : null;
  const resultCore = {
    genuine_holdout_rank: genuineRow?.rank ?? null,
    genuine_holdout_distance: genuineRow?.distance ?? null,
    nearest_impostor_distance: nearestImpostor?.distance ?? null,
    separation_margin: margin,
    complete_blinded_rank_order: ranked.map(({ blind_id, rank, distance }) => ({ blind_id, rank, distance })),
    tie_state: tieState,
    best_human_control_rank: bestByClass.topic_matched_human,
    best_paraphrase_control_rank: bestByClass.semantic_paraphrase,
    best_llm_imitation_rank: bestByClass.llm_style_imitation,
    register_shifted_entrant_rank: bestByClass.entrant_register_shift,
    topic_leakage_detected: promptLeakage,
    semantic_leakage_detected: semanticLeakage,
    imitation_collision_state: imitationCollision ? 'present' : 'absent',
    challenge_result: outcome,
    replay_status: 'deterministic-material-present'
  };
  const resultDigest = await digest({
    precommitment_digest: pre?.precommitment?.precommitment_digest || null,
    profile_digest: frozen.profile_digest || null,
    candidate_commitments: committed.map((entry) => entry.commitment).sort(),
    result: resultCore,
    failures
  });
  return {
    schema_version: BLIND_CUSTODY_SCHEMA,
    research_gate: {
      policy_version: RESEARCH_GATE_POLICY,
      status: 'research-only-unpromoted',
      baseline_intake_authorized: false,
      production_promotion_authorized: false,
      calibration_triads_completed: Number(input.calibration_triads_completed || 0),
      calibration_triads_required: 12,
      promotion_blockers: Number(input.calibration_triads_completed || 0) >= 12 ? ['separate-operator-promotion-gesture-required'] : ['twelve-distinct-triads-not-complete', 'separate-operator-promotion-gesture-required']
    },
    precommitment: clone(pre?.precommitment || null),
    profile_construction: clone(frozen),
    challenge_set: {
      genuine_holdout_count: genuine ? 1 : 0,
      topic_matched_human_controls: controlValidation.counts.topic_matched_human,
      semantic_paraphrase_controls: controlValidation.counts.semantic_paraphrase,
      llm_style_transfer_controls: controlValidation.counts.llm_style_imitation,
      entrant_register_shift_control: controlValidation.counts.entrant_register_shift,
      candidate_order_randomized: true,
      candidate_labels_blinded_during_ranking: true,
      candidate_commitment_digest: await digest(committed.map((entry) => entry.commitment).sort()),
      candidate_text_exported: false
    },
    reveal,
    results: resultCore,
    failure_registry: failures.map((entry, index) => ({
      failure_id: `BCC-F-${String(index + 1).padStart(3, '0')}`,
      ...entry
    })),
    result_digest: resultDigest,
    raw_text_included: false,
    psychological_inference_performed: false,
    demographic_inference_performed: false,
    external_identity_data_consumed: false,
    claim_ceiling: 'Packet-internal out-of-sample stylometric recurrence only; not civil identity adjudication, exclusive ownership, third-party text attribution, or universal authorship proof.'
  };
}

export async function replayBlindCustodyChallenge(input = {}, expected = {}) {
  const replayed = await runBlindCustodyChallenge(input);
  return {
    status: replayed.result_digest === expected.result_digest ? 'pass' : 'fail',
    expected_result_digest: expected.result_digest || null,
    replay_result_digest: replayed.result_digest,
    outcome_matches: replayed.results.challenge_result === expected?.results?.challenge_result,
    adverse_results_preserved: true
  };
}

export function blindChallengeContainsRawText(value) {
  return containsRawText(value);
}
