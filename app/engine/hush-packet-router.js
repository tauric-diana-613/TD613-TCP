import { buildPropositionMap } from './hush-proposition-map.js';

export const HUSH_PACKET_ROUTER_VERSION = 'pr124-packet-router/v1';

const safe = (value) => String(value ?? '').trim();
const lower = (value) => safe(value).toLowerCase();
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const uniq = (values = []) => [...new Set(asArray(values).map((v) => safe(v)).filter(Boolean))];
const round3 = (value) => Number(Number(value || 0).toFixed(3));

const CHAT_RE = /\b(chat|text|thread|threaded|group|casual|aave|blip|blips|marisol|keisha|dm|dms|small circle|internet|abbrev|abbreviation)\b/i;
const PLAIN_RE = /\b(plain|witness|record|legal|intake|hr|portal|formal|official|compliance|procedural|clipboard|weather|facts first|low heat|flat compliance)\b/i;
const LYRIC_RE = /\b(lyric|oracle|goth|alien|expressive|theory|archive|ghost|strange|playful|deflection|lulu|ophelia)\b/i;
const JAGGED_RE = /\b(jagged|glitch|fracture|fractured|blip|blips)\b/i;
const LOW_SIG_RE = /\b(burner|minimal|low signature|spare|nico|brief)\b/i;

function maskHaystack(mask = {}) {
  return lower([
    mask.id,
    mask.label,
    mask.name,
    mask.family,
    mask.description,
    mask.intendedUse,
    mask.riskTell,
    ...(asArray(mask.pressureWarnings)),
    ...(asArray(mask.dictionHints)),
    ...(asArray(mask.transitionBank)),
    ...(asArray(mask.transformHints?.desiredMoves))
  ].join(' '));
}

function nonZeroObject(obj = {}, limit = 36) {
  const out = {};
  for (const [key, value] of Object.entries(obj || {})) {
    const n = Number(value);
    if (Number.isFinite(n) && n !== 0) out[key] = round3(n);
    else if (!Number.isFinite(n) && value) out[key] = value;
    if (Object.keys(out).length >= limit) break;
  }
  return out;
}

function compactNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? round3(n) : fallback;
}

function wordList(value = '') {
  return lower(value).match(/[a-z0-9][a-z0-9'-]*/g) || [];
}

function semanticAnchorsFromText(sourceText = '', protectedLiterals = []) {
  const text = safe(sourceText);
  const anchors = [];
  for (const literal of asArray(protectedLiterals)) anchors.push(literal);
  for (const match of text.matchAll(/\b[A-Z]{2,}\b|\b[A-Za-z]+\/[A-Za-z]+\b|\b[A-Za-z]+-[A-Za-z]+\b|\b(?:epistemically|ontology|sigil|ingress|LLM|TD613|SHI|SAC)\b/gi)) anchors.push(match[0]);
  return uniq(anchors).slice(0, 18);
}

function softTermsFromMap(propositionMap = {}, sourceText = '', anchors = []) {
  const anchorSet = new Set(anchors.map((x) => lower(x)));
  const stop = new Set('the a an and or but if is are was were be been being do does did how what why when where who whom with without into from that this those these much really very just like of in on to for no not before after you your yours i me my mine we our ours it its they them their there here some so sorry sounds sound going through have has had basically maybe came come can could would should will as at by lot holding people used name thought good gives other know'.split(' '));
  const mapped = asArray(propositionMap.propositions).flatMap((p) => asArray(p.coreTerms));
  const textTerms = wordList(sourceText).filter((word) => word.length > 2 && !stop.has(word) && !anchorSet.has(word));
  return uniq([...mapped, ...textTerms]).filter((term) => !anchorSet.has(lower(term))).slice(0, 24);
}

export function classifyMaskPacketTier({ mask = {}, ontologyRoute = {}, propositionMap = {} } = {}) {
  const hay = maskHaystack(mask);
  const route = lower(ontologyRoute.routeType || ontologyRoute.route_type || '');
  const hasClaims = Boolean(propositionMap.claimCount || propositionMap.claim_count);
  let tier = 'general_mask_packet';
  if (LOW_SIG_RE.test(hay)) tier = 'low_signature_packet';
  else if (hasClaims && PLAIN_RE.test(hay)) tier = 'legal_witness_packet';
  else if (CHAT_RE.test(hay) || route === 'casual-register') tier = 'chat_cadence_packet';
  else if (JAGGED_RE.test(hay) || route === 'jagged-disguise') tier = 'jagged_disguise_packet';
  else if (LYRIC_RE.test(hay) || route === 'lyric-cadence' || route === 'expressive-theory') tier = 'lyric_pressure_packet';
  else if (PLAIN_RE.test(hay) || route === 'plain-witness' || route === 'witness-safe') tier = hasClaims ? 'legal_witness_packet' : 'plain_record_packet';
  return {
    version: HUSH_PACKET_ROUTER_VERSION,
    tier,
    includeChatOntology: tier === 'chat_cadence_packet',
    includeDeepMetrics: ['lyric_pressure_packet', 'jagged_disguise_packet', 'chat_cadence_packet'].includes(tier),
    includeLegalMaps: ['legal_witness_packet', 'plain_record_packet'].includes(tier),
    includeSurfaceMarkers: tier === 'chat_cadence_packet',
    semanticAnchorMode: ['plain_record_packet', 'legal_witness_packet', 'low_signature_packet'].includes(tier) ? 'strict' : 'balanced',
    candidateCount: 4
  };
}

export function compactProfileForPacketTier(profile = {}, tier = 'general_mask_packet') {
  const base = {
    register_mode: profile.register_mode || profile.registerMode || 'plain',
    word_count: Number(profile.word_count || profile.wordCount || 0),
    sentence_count: Number(profile.sentence_count || profile.sentenceCount || 0),
    avg_sentence_length: compactNumber(profile.avg_sentence_length ?? profile.avgSentenceLength),
    punctuation_density: compactNumber(profile.punctuation_density ?? profile.punctuationDensity),
    contraction_density: compactNumber(profile.contraction_density ?? profile.contractionDensity),
    recurrence_pressure: compactNumber(profile.recurrence_pressure ?? profile.recurrencePressure),
    hedge_density: compactNumber(profile.hedge_density ?? profile.hedgeDensity),
    abstraction_posture: compactNumber(profile.abstraction_posture ?? profile.abstractionPosture),
    directness: compactNumber(profile.directness),
    structural_friction: compactNumber(profile.structural_friction ?? profile.structuralFriction),
    lexical_entropy_score: compactNumber(profile.lexical_entropy_score ?? profile.lexicalEntropyScore),
    transition_variance: compactNumber(profile.transition_variance ?? profile.transitionVariance),
    acoustic_weight: compactNumber(profile.acoustic_weight ?? profile.acousticWeight)
  };
  if (tier === 'plain_record_packet' || tier === 'legal_witness_packet' || tier === 'low_signature_packet') {
    return {
      register_mode: base.register_mode,
      word_count: base.word_count,
      sentence_count: base.sentence_count,
      avg_sentence_length: base.avg_sentence_length,
      punctuation_density: base.punctuation_density,
      recurrence_pressure: base.recurrence_pressure,
      hedge_density: base.hedge_density,
      directness: base.directness,
      abstraction_posture: base.abstraction_posture,
      structural_friction: base.structural_friction
    };
  }
  if (tier === 'chat_cadence_packet') {
    return {
      ...base,
      line_break_density: compactNumber(profile.line_break_density ?? profile.lineBreakDensity),
      conversational_posture: compactNumber(profile.conversational_posture ?? profile.conversationalPosture),
      abbreviation_density: compactNumber(profile.abbreviation_density ?? profile.abbreviationDensity),
      orthographic_looseness: compactNumber(profile.orthographic_looseness ?? profile.orthographicLooseness),
      fragment_pressure: compactNumber(profile.fragment_pressure ?? profile.fragmentPressure),
      surface_marker_profile: nonZeroObject(profile.surface_marker_profile || profile.surfaceMarkerProfile || {}, 48),
      punctuation_mix: nonZeroObject(profile.punctuation_mix || profile.punctuationMix || {}, 12)
    };
  }
  if (tier === 'lyric_pressure_packet' || tier === 'jagged_disguise_packet') {
    return {
      ...base,
      fragment_pressure: compactNumber(profile.fragment_pressure ?? profile.fragmentPressure),
      syntactic_branching_depth: compactNumber(profile.syntactic_branching_depth ?? profile.syntacticBranchingDepth),
      punctuation_mix: nonZeroObject(profile.punctuation_mix || profile.punctuationMix || {}, 12)
    };
  }
  return base;
}

function slimSourceManifest(manifest = {}, sourceText = '', tier = 'general_mask_packet') {
  const protectedLiterals = asArray(manifest.protected_literals);
  const semanticAnchors = semanticAnchorsFromText(sourceText, protectedLiterals);
  const propositionMap = manifest.proposition_summary || buildPropositionMap(sourceText);
  const softTerms = softTermsFromMap(propositionMap, sourceText, semanticAnchors);
  return {
    source_units: asArray(manifest.source_units).slice(0, tier === 'low_signature_packet' ? 6 : 10),
    protected_literals: protectedLiterals.slice(0, 24),
    semantic_anchors: semanticAnchors,
    soft_terms: softTerms,
    question_map: asArray(manifest.question_map).slice(0, 8),
    negation_map: asArray(manifest.negation_map).slice(0, 8),
    uncertainty_map: asArray(manifest.uncertainty_map).slice(0, 8),
    claim_map: asArray(manifest.claim_map).slice(0, 8),
    proposition_summary: propositionMap
  };
}

export function buildPacketPreflight({ mask = {}, maskReferenceText = '', sourceText = '' } = {}) {
  const profile = mask.profile || {};
  const words = Number(profile.wordCount || profile.word_count || 0) || wordList(maskReferenceText || mask.sampleSeed || '').length;
  const hasAxes = Boolean(profile.registerMode || profile.register_mode || profile.avgSentenceLength || profile.avg_sentence_length || profile.averageSentenceLength || profile.punctuationDensity || profile.punctuation_density || profile.rhythm || profile.sentenceRhythm || profile.structuralFriction || profile.structural_friction || profile.lexicalEntropyScore || profile.lexical_entropy_score);
  const seedDerived = Boolean(mask.__td613MaskEnrichment?.applied || (!hasAxes && (mask.sampleSeed || mask.description)));
  const thin = !Object.keys(profile || {}).length || words < 28 || !hasAxes;
  const state = thin ? (seedDerived ? 'seed_derived' : 'thin') : 'rich';
  return {
    version: HUSH_PACKET_ROUTER_VERSION,
    maskEvidenceState: state,
    maskEvidenceWarnings: [
      thin ? 'mask-profile-thin' : '',
      seedDerived ? 'using-canonical-seed' : '',
      thin ? 'add-sample-for-stronger-transform' : ''
    ].filter(Boolean),
    mayContinue: Boolean(safe(sourceText)),
    sourceWordCount: wordList(sourceText).length,
    maskReferenceWordCount: words
  };
}

export function buildRoutedProviderPacket({ flightPacket = {}, tier = 'general_mask_packet', sourceText = '', preflight = null } = {}) {
  const styl = flightPacket.stylometry_engine || {};
  const sourceProfile = compactProfileForPacketTier(styl.source_profile || {}, tier);
  const maskProfile = compactProfileForPacketTier(styl.mask_reference_profile || {}, tier);
  const routed = {
    ...flightPacket,
    packet_version: `${flightPacket.packet_version || 'hush-flight-packet/v3'}+pr124-routed`,
    packet_tier: tier,
    packet_router_version: HUSH_PACKET_ROUTER_VERSION,
    mask_evidence: preflight || null,
    source_manifest: slimSourceManifest(flightPacket.source_manifest || {}, sourceText, tier),
    stylometry_engine: {
      engine_version: styl.engine_version || 'hush-stylometry-engine/v1',
      enrichment_version: styl.enrichment_version || '',
      source_profile: sourceProfile,
      mask_reference_profile: maskProfile,
      cadence_shell: styl.cadence_shell || null,
      target_shell: styl.target_shell || null,
      canonical_mask_seed_hash: styl.canonical_mask_seed_hash || '',
      generator_constraints: styl.generator_constraints || {},
      audit: {
        warnings: asArray(styl.audit?.warnings).slice(0, 12),
        enrichment: styl.audit?.enrichment ? {
          version: styl.audit.enrichment.version || '',
          applied: Boolean(styl.audit.enrichment.applied),
          sparseBeforeEnrichment: Boolean(styl.audit.enrichment.sparseBeforeEnrichment),
          canonicalSeedHash: styl.audit.enrichment.canonicalSeedHash || '',
          canonicalSeedWordCount: styl.audit.enrichment.canonicalSeedWordCount || 0,
          profileWordCount: styl.audit.enrichment.profileWordCount || 0,
          source: styl.audit.enrichment.source || ''
        } : null,
        note: 'PR124 routed packet; profile fields are tier-gated.'
      }
    },
    flight_controls: {
      ...(flightPacket.flight_controls || {}),
      candidate_count: 4,
      packet_tier: tier,
      chat_ontology_enabled: tier === 'chat_cadence_packet'
    }
  };
  if (tier !== 'chat_cadence_packet') {
    delete routed.stylometry_engine.source_profile.surface_marker_profile;
    delete routed.stylometry_engine.mask_reference_profile.surface_marker_profile;
  }
  return routed;
}
