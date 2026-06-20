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
  not_identity_proof: true,
  not_authorship_ownership_proof: true,
  not_third_party_consent: true,
  not_impersonation_authorization: true,
  not_public_legal_or_institutional_recognition: true,
  not_raw_corpus_export_clearance: true
});

export const HUSH_CUSTOMIZER_RELEASE_CLASSES = Object.freeze({
  EMPTY: 'empty',
  CORPUS_BUILDING: 'corpus-building',
  PREVIEW_ONLY: 'preview-only',
  OPERATIONAL_LOCAL: 'operational-local',
  RIGOROUS_LOCAL: 'rigorous-local',
  EXPORTABLE_REDACTED: 'exportable-redacted',
  OPERATOR_PRIVATE: 'operator-private',
  BLOCKED: 'blocked'
});

const DISCOURSE_ALIASES = Object.freeze({ reflective: 'reflective-affective', casual: 'casual-conversational', technical: 'technical-operational', repair: 'corrective-repair', uncategorized: 'explanatory' });
const RETRIEVAL_ALIASES = Object.freeze({ uncategorized: 'baseline-voice', '': 'baseline-voice' });

const safeText = (value) => String(value ?? '').trim();
const asArray = (value) => Array.isArray(value) ? value : [];
const round3 = (value) => Number(Number(value || 0).toFixed(3));

export function normalizeDiscourseMode(value = '') {
  const raw = safeText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return DISCOURSE_ALIASES[raw] || raw || 'explanatory';
}

export function normalizeRetrievalTrigger(value = '') {
  const raw = safeText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return RETRIEVAL_ALIASES[raw] || raw || 'baseline-voice';
}

function preserveLineBreaks(value = '') {
  return String(value ?? '').replace(/\r\n?/g, '\n').split('\n').map((line) => line.replace(/[\t ]+/g, ' ').trimEnd()).join('\n').replace(/^\n+|\n+$/g, '').trim();
}

function wordCount(value = '') { return (String(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length; }
function charCount(value = '') { return preserveLineBreaks(value).length; }
function sentenceCount(value = '') { return (preserveLineBreaks(value).match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).map((item) => item.trim()).filter(Boolean).length; }
function lineUnitCount(value = '') { return preserveLineBreaks(value).split(/\n+/).map((line) => line.trim()).filter(Boolean).length; }
function slug(value = 'customizer') { return safeText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'customizer'; }

function stable(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + stable(value[key])).join(',') + '}';
}

export async function sha256Hex(value = '') {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi || !cryptoApi.subtle) throw new Error('WebCrypto subtle API is required for Hush Customizer packet hashes');
  const digest = await cryptoApi.subtle.digest('SHA-256', new TextEncoder().encode(String(value ?? '')));
  return 'sha256:' + Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function sampleWarnings(value = '', metrics = {}) {
  const warnings = [];
  if (metrics.word_count < HUSH_CUSTOMIZER_CORPUS_POLICY.minWordsPerSample) warnings.push('below-75-word-floor');
  if (metrics.sentence_count < 2 && metrics.line_unit_count < 3) warnings.push('low-structure-sample');
  if (/^(?:[\s"'“”‘’.,;:!?-]|\d)+$/.test(value)) warnings.push('non-linguistic-sample');
  return warnings;
}

function sampleEligibility(metrics = {}) {
  if ((metrics.word_count || 0) < HUSH_CUSTOMIZER_CORPUS_POLICY.minWordsPerSample) return 'rejected-too-short';
  if ((metrics.sentence_count || 0) < 2 && (metrics.line_unit_count || 0) < 3) return 'accepted-low-structure';
  return 'accepted';
}

export async function buildCustomizerSampleLedger(samples = [], options = {}) {
  const includePrivateText = Boolean(options.includePrivateText);
  const ledger = [];
  let index = 0;
  for (const entry of asArray(samples)) {
    const rawText = preserveLineBreaks(typeof entry === 'string' ? entry : (entry?.text || entry?.sample || ''));
    const hasText = Boolean(rawText);
    const metrics = {
      word_count: wordCount(rawText),
      char_count: charCount(rawText),
      sentence_count: sentenceCount(rawText),
      line_unit_count: lineUnitCount(rawText)
    };
    const discourse_mode = normalizeDiscourseMode(entry?.discourseMode || entry?.promptCategory || entry?.sampleCategory || entry?.category || 'explanatory');
    const retrieval_trigger = normalizeRetrievalTrigger(entry?.retrievalTrigger || entry?.contextLabel || 'baseline-voice');
    const text_hash = hasText ? await sha256Hex(rawText) : null;
    const sample = {
      id: entry?.id || `sample-${index + 1}-${text_hash ? text_hash.slice(7, 13) : 'legacy'}`,
      text_hash,
      legacy_text_hash: entry?.textHash || entry?.legacy_text_hash || null,
      text_included: includePrivateText && hasText,
      raw_text_exported: includePrivateText && hasText,
      text: includePrivateText && hasText ? rawText : null,
      ...metrics,
      discourse_mode,
      retrieval_trigger,
      promptCategory: discourse_mode,
      contextLabel: retrieval_trigger,
      eligibility: sampleEligibility(metrics),
      warnings: [...new Set([...(asArray(entry?.warnings)), ...sampleWarnings(rawText, metrics), ...(!hasText ? ['missing-sample-text-for-sha256'] : [])])],
      created_at: entry?.createdAt || entry?.created_at || new Date().toISOString()
    };
    ledger.push(sample);
    index += 1;
  }
  return ledger;
}

export function buildCorpusReadiness(sampleLedger = []) {
  const clean = asArray(sampleLedger);
  const accepted = clean.filter((sample) => (sample.word_count || 0) >= HUSH_CUSTOMIZER_CORPUS_POLICY.minWordsPerSample && sample.eligibility !== 'rejected-too-short');
  const accepted_words = accepted.reduce((sum, sample) => sum + (sample.word_count || 0), 0);
  const discourse_modes = [...new Set(accepted.map((sample) => sample.discourse_mode).filter(Boolean))].sort();
  const retrieval_triggers = [...new Set(accepted.map((sample) => sample.retrieval_trigger).filter(Boolean))].sort();
  const accepted_sample_count = accepted.length;
  const status = accepted_sample_count >= HUSH_CUSTOMIZER_CORPUS_POLICY.rigorousSamples && accepted_words >= HUSH_CUSTOMIZER_CORPUS_POLICY.rigorousWords && discourse_modes.length >= HUSH_CUSTOMIZER_CORPUS_POLICY.rigorousPromptCategories
    ? 'rigorous'
    : accepted_sample_count >= HUSH_CUSTOMIZER_CORPUS_POLICY.operationalSamples && accepted_words >= HUSH_CUSTOMIZER_CORPUS_POLICY.operationalWords
      ? 'operational'
      : accepted_sample_count >= HUSH_CUSTOMIZER_CORPUS_POLICY.provisionalSamples && accepted_words >= HUSH_CUSTOMIZER_CORPUS_POLICY.provisionalWords
        ? 'provisional'
        : accepted_sample_count ? 'corpus-building' : 'empty';
  return Object.freeze({
    policy_version: HUSH_CUSTOMIZER_PACKET_VERSION,
    status,
    sample_count: clean.length,
    accepted_sample_count,
    rejected_sample_count: clean.length - accepted_sample_count,
    accepted_words,
    total_words: clean.reduce((sum, sample) => sum + (sample.word_count || 0), 0),
    discourse_mode_count: discourse_modes.length,
    retrieval_trigger_count: retrieval_triggers.length,
    discourse_modes,
    retrieval_triggers,
    readiness_score: round3(Math.min(1, Math.max(accepted_sample_count / HUSH_CUSTOMIZER_CORPUS_POLICY.rigorousSamples, accepted_words / HUSH_CUSTOMIZER_CORPUS_POLICY.rigorousWords))),
    generation_allowed: status === 'operational' || status === 'rigorous',
    rigorous_eligible: status === 'rigorous'
  });
}

export function buildRoutingProfile(sampleLedger = []) {
  const accepted = asArray(sampleLedger).filter((sample) => sample.eligibility !== 'rejected-too-short');
  const discourse_modes = {};
  const retrieval_triggers = {};
  const matrix = new Map();
  for (const sample of accepted) {
    const mode = sample.discourse_mode || 'explanatory';
    const trigger = sample.retrieval_trigger || 'baseline-voice';
    discourse_modes[mode] = (discourse_modes[mode] || 0) + 1;
    retrieval_triggers[trigger] = (retrieval_triggers[trigger] || 0) + 1;
    const key = `${mode}::${trigger}`;
    const prior = matrix.get(key) || { discourse_mode: mode, retrieval_trigger: trigger, sample_count: 0, accepted_words: 0 };
    prior.sample_count += 1;
    prior.accepted_words += sample.word_count || 0;
    matrix.set(key, prior);
  }
  const warnings = [];
  if (Object.keys(retrieval_triggers).length > 0 && Object.keys(retrieval_triggers).length < 2) warnings.push('low-trigger-diversity');
  if (Object.keys(discourse_modes).length > 0 && Object.keys(discourse_modes).length < 2) warnings.push('discourse-mode-collapse');
  return Object.freeze({ schema_version: 'td613.hush.routing-profile/v1', discourse_modes, retrieval_triggers, mode_trigger_matrix: [...matrix.values()], routing_warnings: warnings });
}

export function buildCustomizerReleaseDiscipline(readiness = {}, options = {}) {
  const warnings = [];
  if (readiness.status === 'empty') warnings.push('no-accepted-samples');
  if (readiness.status === 'corpus-building') warnings.push('under-provisional-corpus-floor');
  if (readiness.status === 'provisional') warnings.push('preview-only-corpus');
  if (readiness.status === 'operational') warnings.push('operational-not-rigorous');
  if ((readiness.discourse_mode_count || 0) > 0 && readiness.discourse_mode_count < HUSH_CUSTOMIZER_CORPUS_POLICY.rigorousPromptCategories) warnings.push('low-discourse-diversity');
  let release_class = HUSH_CUSTOMIZER_RELEASE_CLASSES.CORPUS_BUILDING;
  if (readiness.status === 'empty') release_class = HUSH_CUSTOMIZER_RELEASE_CLASSES.EMPTY;
  else if (readiness.status === 'provisional') release_class = HUSH_CUSTOMIZER_RELEASE_CLASSES.PREVIEW_ONLY;
  else if (readiness.status === 'operational') release_class = HUSH_CUSTOMIZER_RELEASE_CLASSES.OPERATIONAL_LOCAL;
  else if (readiness.status === 'rigorous') release_class = options.exportableRedacted ? HUSH_CUSTOMIZER_RELEASE_CLASSES.EXPORTABLE_REDACTED : HUSH_CUSTOMIZER_RELEASE_CLASSES.RIGOROUS_LOCAL;
  if (options.includePrivateText) release_class = HUSH_CUSTOMIZER_RELEASE_CLASSES.OPERATOR_PRIVATE;
  return Object.freeze({
    schema_version: 'td613.hush.customizer-release-discipline/v1',
    release_class,
    operator_next_action: release_class === HUSH_CUSTOMIZER_RELEASE_CLASSES.BLOCKED ? 'repair-packet' : readiness.generation_allowed ? 'local-mask-use' : 'collect-more-samples',
    generation_allowed: Boolean(readiness.generation_allowed),
    raw_samples_exported: Boolean(options.includePrivateText),
    claim_limits_attached: true,
    warnings: [...new Set(warnings)]
  });
}

export function buildPrivateTextPolicy(options = {}) {
  return Object.freeze({
    schema_version: 'td613.hush.private-text-policy/v1',
    raw_samples_local_only: true,
    sample_text_exported: Boolean(options.includePrivateText),
    redacted_profile_export_allowed: !options.includePrivateText,
    operator_private_export_allowed: Boolean(options.includePrivateText),
    clipboard_raw_text_blocked: !options.includePrivateText,
    import_raw_text_requires_operator_confirmation: true
  });
}

export async function buildCustomizerPacket(input = {}, options = {}) {
  const mask = input.activeMask || input.mask || input;
  const label = safeText(input.label || mask.label || mask.name || 'Unsaved Custom Mask') || 'Unsaved Custom Mask';
  const sampleLedger = await buildCustomizerSampleLedger(input.samples || mask.samples || [], options);
  const corpus_readiness = buildCorpusReadiness(sampleLedger);
  const routing_profile = buildRoutingProfile(sampleLedger);
  const private_text_policy = buildPrivateTextPolicy(options);
  const customizer_release_discipline = buildCustomizerReleaseDiscipline(corpus_readiness, options);
  const ontology_profile = Object.freeze({
    schema_version: 'td613.hush.customizer-ontology/v1',
    dominant_registers: Object.keys(routing_profile.discourse_modes),
    pressure_modes: Object.keys(routing_profile.retrieval_triggers),
    risk_tells: asArray(mask.riskTells || mask.risk_tells),
    protected_literals: asArray(mask.protectedLiterals || mask.protected_literals),
    forbidden_transformations: ['identity-proof', 'authorship-ownership-proof', 'third-party-impersonation'],
    style_permissions: { self_owned_corpus: options.selfOwnedCorpus !== false, third_party_voice: Boolean(options.thirdPartyVoice), impersonation_allowed: false }
  });
  const base = {
    schema_version: HUSH_CUSTOMIZER_PACKET_SCHEMA,
    packet_version: HUSH_CUSTOMIZER_PACKET_VERSION,
    packet_class: HUSH_CUSTOMIZER_PACKET_CLASS,
    customizer_packet_id: input.customizer_packet_id || `TD613-HUSH-CUSTOMIZER-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${slug(label).slice(0, 12).toUpperCase()}`,
    mask_id: mask.id || `custom-${slug(label)}`,
    mask_label: label,
    created_at: input.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    corpus_policy: HUSH_CUSTOMIZER_CORPUS_POLICY,
    corpus_readiness,
    sample_ledger: sampleLedger,
    composite_profile: mask.compositeProfile || mask.profile || {},
    surface_cadence: mask.surfaceCadence || mask.layoutCadence || {},
    distribution: mask.distribution || mask.profileTargets || {},
    variance_summary: mask.varianceSummary || mask.sampleVariance || {},
    holdout_validation: mask.holdoutValidation || {},
    routing_profile,
    ontology_profile,
    private_text_policy,
    customizer_release_discipline,
    claim_limits: HUSH_CUSTOMIZER_CLAIM_LIMITS,
    export_policy: { schema_version: 'td613.hush.customizer-export-policy/v1', default_export_class: options.includePrivateText ? 'operator-private' : 'redacted-profile' },
    clipboard_policy: { schema_version: 'td613.hush.customizer-clipboard-policy/v1', claim_limits_required: true, raw_samples_clipboard_blocked: !options.includePrivateText }
  };
  const sample_ledger_hash_sha256 = await sha256Hex(stable(sampleLedger.map((sample) => ({ ...sample, text: null }))));
  const profile_hash_sha256 = await sha256Hex(stable(base.composite_profile));
  const routing_hash_sha256 = await sha256Hex(stable(routing_profile));
  const policy_hash_sha256 = await sha256Hex(stable({ private_text_policy, customizer_release_discipline, claim_limits: HUSH_CUSTOMIZER_CLAIM_LIMITS }));
  const hash_topology = { schema_version: 'td613.hush.hash-topology/v1', sample_ledger_hash_sha256, profile_hash_sha256, routing_hash_sha256, policy_hash_sha256, packet_hash_sha256: null };
  const packetWithoutHash = { ...base, hash_topology, packet_hash_sha256: null };
  const packet_hash_sha256 = await sha256Hex(stable(packetWithoutHash));
  hash_topology.packet_hash_sha256 = packet_hash_sha256;
  return Object.freeze({
    ...base,
    hash_topology,
    packet_hash_sha256,
    pipeline_state: { schema_version: 'td613.hush.customizer-pipeline-state/v1', packet_version: HUSH_CUSTOMIZER_PACKET_VERSION, release_class: customizer_release_discipline.release_class, raw_samples_exported: private_text_policy.sample_text_exported, sample_hashes_present: sampleLedger.every((sample) => Boolean(sample.text_hash)) }
  });
}
