export const HUSH_CUSTOMIZER_PACKET_SCHEMA = 'td613.hush.customizer-packet/v1';
export const HUSH_CUSTOMIZER_PACKET_VERSION = 'hush-customizer-packet/v1-safe-harbor-derived';
export const HUSH_CUSTOMIZER_PACKET_CLASS = 'local-stylometric-mask-corpus';

export const HUSH_CUSTOMIZER_CORPUS_POLICY = Object.freeze({
  minWordsPerSample: 75,
  provisionalSamples: 12,
  operationalSamples: 24,
  rigorousSamples: 40,
  provisionalWords: 900,
  operationalWords: 1800,
  rigorousWords: 3000,
  holdoutRatio: 0.2,
  rigorousPromptCategories: 5
});

export const HUSH_CUSTOMIZER_CLAIM_LIMITS = Object.freeze({
  stylometric_transformation_profile_only: true,
  not_identity_proof: true,
  not_authorship_ownership_proof: true,
  not_third_party_consent: true,
  not_impersonation_authorization: true,
  not_public_legal_civil_or_institutional_recognition: true,
  raw_corpus_text_not_safe_to_export: true
});

const safeText = (value) => String(value ?? '').trim();
const asArray = (value) => Array.isArray(value) ? value : [];
const round3 = (value) => Number(Number(value || 0).toFixed(3));

export function normalizeCustomizerKey(value = '', fallback = 'uncategorized') {
  return safeText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || fallback;
}

export function words(value = '') {
  return (String(value || '').match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;
}

function sentenceCount(value = '') {
  return (String(value || '').match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).map((item) => item.trim()).filter(Boolean).length;
}

function lineUnitCount(value = '') {
  return String(value || '').split(/\n+/).map((line) => line.trim()).filter(Boolean).length;
}

export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + stableStringify(value[key])).join(',') + '}';
}

export async function sha256Text(value = '') {
  const body = String(value || '');
  if (!globalThis.crypto || !globalThis.crypto.subtle) throw new Error('WebCrypto SHA-256 support is required for Hush Customizer packets');
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
  return 'sha256:' + Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function isSha256(value) {
  return /^sha256:[a-f0-9]{64}$/iu.test(String(value || '').trim());
}

function releaseClassFor(readiness = {}, options = {}) {
  if (options.blocked) return 'blocked';
  if (!readiness.acceptedSampleCount || !readiness.acceptedWords) return 'empty';
  if (readiness.status === 'rigorous' && options.exportableRedacted) return 'exportable-redacted';
  if (readiness.status === 'rigorous') return 'rigorous-local';
  if (readiness.status === 'operational') return 'operational-local';
  if (readiness.status === 'provisional') return 'preview-only';
  return 'corpus-building';
}

function sampleWarnings(sample = {}, metric = {}) {
  const warnings = [...asArray(sample.warnings)];
  if ((metric.wordCount || 0) < HUSH_CUSTOMIZER_CORPUS_POLICY.minWordsPerSample) warnings.push('below-75-word-floor');
  if ((metric.sentenceCount || 0) < 2 && (metric.lineUnitCount || 0) < 3) warnings.push('low-structure-sample');
  return [...new Set(warnings)];
}

export async function normalizeCustomizerSample(entry = {}, index = 0, options = {}) {
  const rawText = typeof entry === 'string' ? entry : safeText(entry.text || entry.rawText || entry.sample || '');
  const discourseMode = normalizeCustomizerKey(
    typeof entry === 'string' ? options.discourseMode : (entry.discourseMode || entry.promptCategory || entry.sampleCategory || entry.category || options.discourseMode || 'uncategorized'),
    'uncategorized'
  );
  const retrievalTrigger = normalizeCustomizerKey(
    typeof entry === 'string' ? options.retrievalTrigger : (entry.retrievalTrigger || entry.contextLabel || entry.trigger || options.retrievalTrigger || 'baseline-voice'),
    'baseline-voice'
  );
  const metric = {
    wordCount: Number(entry.wordCount || words(rawText)),
    charCount: Number(entry.charCount || rawText.length || 0),
    sentenceCount: Number(entry.sentenceCount || sentenceCount(rawText)),
    lineUnitCount: Number(entry.lineUnitCount || lineUnitCount(rawText))
  };
  const material = rawText || stableStringify({ legacyTextHash: entry.textHash || entry.legacy_text_hash || '', index, discourseMode, retrievalTrigger, metric });
  const textHashSha256 = await sha256Text(material);
  return Object.freeze({
    id: entry.id || `sample-${index + 1}-${textHashSha256.slice(7, 13)}`,
    text_hash_sha256: textHashSha256,
    legacy_text_hash: entry.textHash || entry.legacy_text_hash || null,
    text_included: Boolean(options.includePrivateText),
    text: options.includePrivateText ? rawText : null,
    raw_text_exported: Boolean(options.includePrivateText),
    ...metric,
    discourse_mode: discourseMode,
    retrieval_trigger: retrievalTrigger,
    promptCategory: discourseMode,
    contextLabel: retrievalTrigger,
    eligibility: metric.wordCount >= HUSH_CUSTOMIZER_CORPUS_POLICY.minWordsPerSample ? 'accepted' : 'rejected-too-short',
    warnings: sampleWarnings(entry, metric),
    profile_summary: entry.profileSummary || entry.profile_summary || null,
    surface_cadence: entry.surfaceCadence || entry.layoutCadence || entry.surface_cadence || null,
    created_at: entry.createdAt || entry.created_at || new Date().toISOString()
  });
}

function readinessFor(samples = []) {
  const accepted = samples.filter((sample) => sample.eligibility !== 'rejected-too-short' && (sample.wordCount || 0) >= HUSH_CUSTOMIZER_CORPUS_POLICY.minWordsPerSample);
  const acceptedWords = accepted.reduce((sum, sample) => sum + (sample.wordCount || 0), 0);
  const categories = [...new Set(accepted.map((sample) => sample.discourse_mode || 'uncategorized'))].sort();
  let status = 'empty';
  if (accepted.length >= HUSH_CUSTOMIZER_CORPUS_POLICY.rigorousSamples && acceptedWords >= HUSH_CUSTOMIZER_CORPUS_POLICY.rigorousWords && categories.length >= HUSH_CUSTOMIZER_CORPUS_POLICY.rigorousPromptCategories) status = 'rigorous';
  else if (accepted.length >= HUSH_CUSTOMIZER_CORPUS_POLICY.operationalSamples && acceptedWords >= HUSH_CUSTOMIZER_CORPUS_POLICY.operationalWords) status = 'operational';
  else if (accepted.length >= HUSH_CUSTOMIZER_CORPUS_POLICY.provisionalSamples && acceptedWords >= HUSH_CUSTOMIZER_CORPUS_POLICY.provisionalWords) status = 'provisional';
  else if (accepted.length || samples.length) status = 'corpus-building';
  return Object.freeze({
    schema_version: 'td613.hush.customizer-readiness/v1',
    status,
    sampleCount: samples.length,
    acceptedSampleCount: accepted.length,
    rejectedSampleCount: samples.length - accepted.length,
    acceptedWords,
    totalWords: samples.reduce((sum, sample) => sum + (sample.wordCount || 0), 0),
    promptCategoryCount: categories.length,
    discourseModeCount: categories.length,
    promptCategories: categories,
    heldoutSampleCount: accepted.length >= HUSH_CUSTOMIZER_CORPUS_POLICY.provisionalSamples ? Math.max(1, Math.floor(accepted.length * HUSH_CUSTOMIZER_CORPUS_POLICY.holdoutRatio)) : 0,
    readinessScore: round3(Math.min(1, Math.max(accepted.length / HUSH_CUSTOMIZER_CORPUS_POLICY.rigorousSamples, acceptedWords / HUSH_CUSTOMIZER_CORPUS_POLICY.rigorousWords))),
    generationAllowed: status === 'operational' || status === 'rigorous',
    rigorousEligible: status === 'rigorous'
  });
}

function routingProfile(samples = []) {
  const discourse_modes = {};
  const retrieval_triggers = {};
  const matrix = new Map();
  for (const sample of samples) {
    const mode = sample.discourse_mode || 'uncategorized';
    const trigger = sample.retrieval_trigger || 'baseline-voice';
    discourse_modes[mode] = (discourse_modes[mode] || 0) + 1;
    retrieval_triggers[trigger] = (retrieval_triggers[trigger] || 0) + 1;
    const key = mode + '::' + trigger;
    const current = matrix.get(key) || { discourse_mode: mode, retrieval_trigger: trigger, sample_count: 0, accepted_words: 0 };
    current.sample_count += 1;
    current.accepted_words += sample.wordCount || 0;
    matrix.set(key, current);
  }
  const warnings = [];
  if (Object.keys(retrieval_triggers).length > 0 && Object.keys(retrieval_triggers).length < 2) warnings.push('low-trigger-diversity');
  if (Object.keys(discourse_modes).length > 0 && Object.keys(discourse_modes).length < 2) warnings.push('discourse-mode-overconcentration');
  return Object.freeze({ schema_version: 'td613.hush.routing-profile/v1', discourse_modes, retrieval_triggers, mode_trigger_matrix: [...matrix.values()], routing_warnings: warnings });
}

function privateTextPolicy(options = {}) {
  const privateExport = Boolean(options.includePrivateText);
  return Object.freeze({
    schema_version: 'td613.hush.private-text-policy/v1',
    raw_samples_local_only: !privateExport,
    sample_text_exported: privateExport,
    redacted_profile_export_allowed: !privateExport,
    operator_private_export_allowed: privateExport,
    clipboard_raw_text_blocked: !privateExport,
    import_raw_text_requires_operator_confirmation: true
  });
}

function releaseDiscipline(readiness = {}, samples = [], options = {}) {
  const warnings = [];
  if (samples.some((sample) => sample.raw_text_exported)) warnings.push('raw-sample-export-requested');
  if (readiness.status === 'corpus-building') warnings.push('under-provisional-floor');
  if (readiness.status === 'provisional') warnings.push('provisional-mask-corpus');
  if (readiness.status === 'operational') warnings.push('operational-not-rigorous');
  if ((readiness.promptCategoryCount || 0) > 0 && readiness.promptCategoryCount < HUSH_CUSTOMIZER_CORPUS_POLICY.rigorousPromptCategories) warnings.push('low-context-diversity');
  return Object.freeze({
    schema_version: 'td613.hush.customizer-release-discipline/v1',
    release_class: releaseClassFor(readiness, options),
    operator_next_action: readiness.generationAllowed ? 'use-local-mask-or-export-redacted-profile' : 'collect-more-samples',
    generation_allowed: Boolean(readiness.generationAllowed),
    raw_samples_exported: samples.some((sample) => sample.raw_text_exported),
    claim_limits_attached: true,
    warnings: [...new Set(warnings)]
  });
}

export async function buildCustomizerPacket(input = {}, options = {}) {
  const mask = input.activeMask || input.mask || input;
  const sourceSamples = asArray(input.samples || mask.samples || []);
  const sampleLedger = [];
  for (let index = 0; index < sourceSamples.length; index += 1) sampleLedger.push(await normalizeCustomizerSample(sourceSamples[index], index, options));
  const readiness = mask.corpusReadiness || readinessFor(sampleLedger);
  const routing = routingProfile(sampleLedger);
  const privacy = privateTextPolicy(options);
  const release = releaseDiscipline(readiness, sampleLedger, options);
  const ontology = Object.freeze({
    schema_version: 'td613.hush.customizer-ontology/v1',
    dominant_registers: Object.keys(routing.discourse_modes),
    pressure_modes: Object.keys(routing.retrieval_triggers),
    risk_tells: asArray(mask.riskTells || mask.risk_tells || []),
    protected_literals: asArray(options.protectedLiterals || []),
    forbidden_transformations: ['identity-proof-claim', 'third-party-impersonation', 'raw-sample-redacted-export'],
    style_permissions: { self_owned_corpus: true, third_party_voice: false, impersonation_allowed: false }
  });
  const now = options.updatedAt || new Date().toISOString();
  const baseIdMaterial = stableStringify({ label: mask.label || mask.name || 'custom-mask', sampleHashes: sampleLedger.map((sample) => sample.text_hash_sha256), now: options.stableId ? '' : now });
  const idHash = await sha256Text(baseIdMaterial);
  const packetId = options.customizerPacketId || `TD613-HUSH-CUSTOMIZER-${now.slice(0, 10).replace(/-/g, '')}-${idHash.slice(7, 15).toUpperCase()}`;
  const hashTopology = {
    schema_version: 'td613.hush.hash-topology/v1',
    sample_ledger_hash_sha256: await sha256Text(stableStringify(sampleLedger.map(({ text, ...sample }) => sample))),
    profile_hash_sha256: await sha256Text(stableStringify(mask.compositeProfile || mask.profile || {})),
    routing_hash_sha256: await sha256Text(stableStringify(routing)),
    policy_hash_sha256: await sha256Text(stableStringify({ privacy, release, claim_limits: HUSH_CUSTOMIZER_CLAIM_LIMITS }))
  };
  const packetWithoutHash = {
    schema_version: HUSH_CUSTOMIZER_PACKET_SCHEMA,
    packet_version: HUSH_CUSTOMIZER_PACKET_VERSION,
    packet_class: HUSH_CUSTOMIZER_PACKET_CLASS,
    customizer_packet_id: packetId,
    mask_id: mask.id || 'custom-unsaved-phase31-1',
    mask_label: mask.label || mask.name || 'Unsaved Custom Mask',
    created_at: options.createdAt || mask.createdAt || now,
    updated_at: now,
    td613_lineage: options.td613Lineage || { derived_from_packet_discipline: 'safe-harbor-phase9.1c', binding: 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51]' },
    corpus_policy: HUSH_CUSTOMIZER_CORPUS_POLICY,
    corpus_readiness: readiness,
    sample_ledger: sampleLedger,
    sample_hash_topology: hashTopology,
    composite_profile: mask.compositeProfile || mask.profile || null,
    surface_cadence: mask.surfaceCadence || mask.layoutCadence || null,
    distribution: mask.distribution || mask.profileTargets || null,
    variance_summary: mask.distribution ? { stable_dimensions: mask.distribution.stableDimensions || [], volatile_dimensions: mask.distribution.volatileDimensions || [], overfit_dimensions: mask.distribution.overfitDimensions || [] } : null,
    holdout_validation: mask.holdoutValidation || { required: readiness.acceptedSampleCount >= HUSH_CUSTOMIZER_CORPUS_POLICY.provisionalSamples, ratio: HUSH_CUSTOMIZER_CORPUS_POLICY.holdoutRatio, heldoutSampleCount: readiness.heldoutSampleCount || 0, status: readiness.rigorousEligible ? 'pass-required' : 'pending' },
    routing_profile: routing,
    ontology_profile: ontology,
    private_text_policy: privacy,
    customizer_release_discipline: release,
    claim_limits: HUSH_CUSTOMIZER_CLAIM_LIMITS,
    pipeline_state: { schema_version: 'td613.hush.customizer-pipeline-state/v1', pipeline_version: HUSH_CUSTOMIZER_PACKET_VERSION, sample_count: sampleLedger.length, release_class: release.release_class }
  };
  const packetHash = await sha256Text(stableStringify(packetWithoutHash));
  return Object.freeze({ ...packetWithoutHash, sample_hash_topology: Object.freeze({ ...hashTopology, packet_hash_sha256: packetHash }), packet_hash_sha256: packetHash });
}

if (typeof window !== 'undefined') {
  window.TD613_HUSH_CUSTOMIZER_PACKET = Object.freeze({ HUSH_CUSTOMIZER_PACKET_SCHEMA, HUSH_CUSTOMIZER_PACKET_VERSION, HUSH_CUSTOMIZER_PACKET_CLASS, HUSH_CUSTOMIZER_CORPUS_POLICY, HUSH_CUSTOMIZER_CLAIM_LIMITS, normalizeCustomizerKey, words, stableStringify, sha256Text, isSha256, normalizeCustomizerSample, buildCustomizerPacket });
}
