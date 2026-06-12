import { buildHushLlmPromptContract, HUSH_GENERATOR_PROVIDER_VERSION, buildProtectedLiteralList } from './hush-generator-provider.js';
import { buildPropositionMap } from './hush-proposition-map.js';
import { buildOntologyRoute, compileRemoteRoutePayload } from './hush-ontology-route.js';
import { extractCadenceProfile, cadenceModFromProfile, StylometricDeepMetrics } from './stylometry.js';
import { getStyleDiversity, HUSH_STYLE_DIVERSITY_VERSION } from './hush-style-diversity.js';
import { withHumanSampleResidue } from './hush-human-sample-residue.js';

export const HUSH_PROVIDER_PHASE35_VERSION = 'phase-35-provider-contract-v3-style-diversity';
export const HUSH_PROVIDER_PHASE37_VERSION = 'phase-37-ontology-carrying-generator-flight-pr151-sample-residue';
export const HUSH_FLIGHT_PACKET_VERSION = 'hush-flight-packet/v5-style-diversity-sample-residue';
export const HUSH_LLM_CANDIDATE_V3 = 'hush-llm-candidate-v3';
export const HUSH_MASK_ENRICHMENT_VERSION = 'hush-mask-stylometry-enrichment/v3-sample-residue';
export const HUSH_PACKET_STYLE_VERSION = 'pr151-packet-style-diversity/v2-sample-residue';

export const HUSH_STYLE_OPERATIONS = Object.freeze([
  'syntax_inversion',
  'cadence_alias',
  'register_lowering',
  'register_lifting',
  'lyric_pressure',
  'friction_insert',
  'fracture_softening',
  'witness_plainness',
  'question_preservation',
  'heat_calibration'
]);

const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const safe = (value) => String(value ?? '').trim();
const uniq = (values = []) => [...new Set(asArray(values).map((value) => safe(value)).filter(Boolean))];
const round3 = (value) => Number(Number(value || 0).toFixed(3));

function compactNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? round3(n) : fallback;
}

function wordList(value = '') {
  return safe(value).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || [];
}

function hashSeed(value = '') {
  let hash = 2166136261;
  for (const ch of safe(value)) {
    hash ^= ch.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function styleProfile(mask = {}) {
  const base = mask.styleDiversity || getStyleDiversity(mask) || getStyleDiversity({ id: mask.id, label: mask.label || mask.name }) || null;
  return withHumanSampleResidue(mask.id, base) || base;
}

function compactStyleProfile(profile = null) {
  if (!profile) return null;
  return {
    version: profile.version || HUSH_STYLE_DIVERSITY_VERSION,
    packet_style_version: HUSH_PACKET_STYLE_VERSION,
    human_sample_residue_version: profile.humanSampleResidueVersion || '',
    id: profile.id || '',
    label: profile.label || '',
    active: profile.active !== false,
    surface: profile.surface || '',
    persona_bio: profile.bio || '',
    architecture: profile.architecture || '',
    punctuation: profile.punctuation || '',
    grammar: profile.grammar || '',
    typo_policy: profile.typo || '',
    chat_speak_profile: profile.chat || '',
    lexicon: asArray(profile.lexicon).slice(0, 16),
    transitions: asArray(profile.transitions).slice(0, 16),
    axes: profile.axes || {},
    evidence_law: asArray(profile.evidenceLaw).slice(0, 8),
    avoid: asArray(profile.avoid).slice(0, 14),
    sample: profile.sample || '',
    doctrine: profile.doctrine || 'futurecore-goth opacity mask: distinct human texture, minimum exposure, zero evidence drift'
  };
}

function maskProfileSparse(profile = {}, referenceText = '') {
  const keys = Object.keys(profile || {});
  const words = Number(profile.wordCount || profile.word_count || 0) || wordList(referenceText).length;
  const hasAxes = Boolean(profile.registerMode || profile.avgSentenceLength || profile.averageSentenceLength || profile.punctuationDensity || profile.rhythm || profile.sentenceRhythm || profile.structuralFriction || profile.lexicalEntropyScore);
  return !keys.length || profile.empty || words < 28 || !hasAxes;
}

function canonicalSeedLines(mask = {}, referenceText = '') {
  const writingTraits = mask.writingTraits || {};
  const transformHints = mask.transformHints || {};
  const style = compactStyleProfile(styleProfile(mask));
  const preferredSample = style?.human_sample_residue_version ? style.sample : '';
  const lines = [
    safe(referenceText || preferredSample || mask.sampleSeed || style?.sample || ''),
    `Mask voice: ${safe(style?.label || mask.label || mask.name || mask.id || 'unnamed mask')}.`,
    mask.family ? `Register lane: ${safe(mask.family)}.` : '',
    mask.description ? `Scene pressure: ${safe(mask.description)}.` : '',
    mask.intendedUse ? `Use condition: ${safe(mask.intendedUse)}.` : '',
    mask.riskTell ? `Risk tell: ${safe(mask.riskTell)}.` : '',
    writingTraits.sentenceLength ? `Sentence length tendency: ${safe(writingTraits.sentenceLength)}.` : '',
    writingTraits.rhythm ? `Rhythm tendency: ${safe(writingTraits.rhythm)}.` : '',
    writingTraits.diction ? `Diction tendency: ${safe(writingTraits.diction)}.` : '',
    writingTraits.emotionalTemperature ? `Heat tendency: ${safe(writingTraits.emotionalTemperature)}.` : '',
    style ? `Style surface: ${style.surface}.` : '',
    style ? `Persona bio: ${style.persona_bio}.` : '',
    style ? `Architecture: ${style.architecture}.` : '',
    style ? `Punctuation law: ${style.punctuation}.` : '',
    style ? `Grammar texture: ${style.grammar}.` : '',
    style ? `Typo law: ${style.typo_policy}.` : '',
    style ? `Chat-speak profile: ${style.chat_speak_profile}.` : '',
    style?.human_sample_residue_version ? `Canonical sample residue: ${style.human_sample_residue_version}.` : '',
    style ? `Style doctrine: ${style.doctrine}.` : '',
    asArray(style?.evidence_law).length ? `Evidence law: ${style.evidence_law.join('; ')}.` : '',
    asArray(mask.dictionHints).length || asArray(style?.lexicon).length ? `Diction anchors: ${uniq([...(mask.dictionHints || []), ...(style?.lexicon || [])]).slice(0, 16).join('; ')}.` : '',
    asArray(mask.transitionBank).length || asArray(style?.transitions).length ? `Transition anchors: ${uniq([...(mask.transitionBank || []), ...(style?.transitions || [])]).slice(0, 16).join('; ')}.` : '',
    asArray(transformHints.desiredMoves).length ? `Desired movement: ${uniq(transformHints.desiredMoves).slice(0, 12).join('; ')}.` : '',
    asArray(mask.exampleTransformPairs).length ? `Example transform pressure: ${asArray(mask.exampleTransformPairs).slice(0, 3).map((pair) => Array.isArray(pair) ? pair.join(' -> ') : safe(pair)).join(' | ')}.` : '',
    'Canonical mask rule: the user source supplies propositions; this mask supplies sentence architecture, register pressure, cadence movement, and diction weather.'
  ].filter(Boolean);
  return lines;
}

export function buildCanonicalMaskSeed(mask = {}, referenceText = '') {
  const joined = canonicalSeedLines(mask, referenceText).join('\n');
  if (wordList(joined).length >= 48) return joined;
  const name = safe(mask.label || mask.name || mask.id || 'Selected mask');
  const family = safe(mask.family || 'mask-surface');
  return `${joined}\n${name} repeats as a stable public instrument in the ${family} lane. It should move openings, sentence boundaries, transitions, pressure, and cadence while preserving propositions.`;
}

function compactDeepMetrics(metrics = {}) {
  return {
    structural_friction: compactNumber(metrics.structuralFriction),
    acoustic_weight: compactNumber(metrics.acousticWeight),
    composite_density: compactNumber(metrics.compositeDensity),
    syntactic_branching: metrics.syntacticBranchingDepth || {},
    lexical_entropy: metrics.lexicalEntropyScore || {},
    transition_variance: metrics.transitionVariance || {}
  };
}

function lineBreakTendency(lineBreaks = {}) {
  if ((lineBreaks.paragraph_break_count || 0) > 0 && (lineBreaks.average_paragraph_words || 0) >= 90) return 'long-paragraph-sensitive';
  if ((lineBreaks.paragraph_break_count || 0) > 0) return 'paragraph-sensitive';
  if ((lineBreaks.line_break_density || 0) >= 0.08 || (lineBreaks.non_empty_line_count || 0) >= 4) return 'line-broken';
  if ((lineBreaks.line_break_count || 0) > 0) return 'light-breaks';
  return 'flat';
}

function punctuationStyle(punctuation = {}) {
  const density = punctuation.punctuation_density || 0;
  if (density <= 0.025) return 'sparse';
  if ((punctuation.semicolon_density || 0) + (punctuation.colon_density || 0) + (punctuation.dash_density || 0) >= 0.035) return 'jointed';
  if ((punctuation.question_density || 0) + (punctuation.exclamation_density || 0) + (punctuation.ellipsis_density || 0) >= 0.035 || (punctuation.repeated_punctuation_count || 0) > 0) return 'expressive';
  return 'moderate';
}

function buildLayoutCadenceFromProfile(profile = {}, text = '') {
  const value = String(text ?? '').replace(/\r\n?/g, '\n').replace(/^\n+|\n+$/g, '').trim();
  const chars = Math.max(1, value.length);
  const words = Math.max(1, wordList(value).length);
  const lineBreakCount = (value.match(/\n/g) || []).length;
  const paragraphBreakCount = (value.match(/\n{2,}/g) || []).length;
  const lines = value.split('\n').map((line) => line.trim()).filter(Boolean);
  const paragraphs = value.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const paragraphWordCounts = paragraphs.map((paragraph) => wordList(paragraph).length);
  const sentenceChunks = value.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((item) => item.trim()).filter(Boolean) || [];
  const lineBreaks = {
    line_break_count: lineBreakCount,
    paragraph_break_count: paragraphBreakCount,
    non_empty_line_count: lines.length,
    paragraph_count: paragraphs.length,
    average_paragraph_words: compactNumber(paragraphWordCounts.reduce((sum, count) => sum + count, 0) / Math.max(1, paragraphWordCounts.length)),
    average_line_words: compactNumber(words / Math.max(1, lines.length)),
    max_paragraph_words: paragraphWordCounts.length ? Math.max(...paragraphWordCounts) : 0,
    min_paragraph_words: paragraphWordCounts.length ? Math.min(...paragraphWordCounts) : 0,
    line_break_density: compactNumber(profile.lineBreakDensity ?? (lineBreakCount / words)),
    paragraph_break_density: compactNumber(paragraphBreakCount / words),
    tendency: ''
  };
  lineBreaks.tendency = lineBreakTendency(lineBreaks);
  const repeated = (value.match(/[!?.,;:]{2,}|…{2,}/g) || []).length;
  const lowercaseStarts = (value.match(/(^|[.!?]\s+|\n+)[a-z]/g) || []).length;
  const punctuation = {
    punctuation_density: compactNumber(profile.punctuationDensity ?? ((value.match(/[.,;:!?—–-]|\.\.\.|…/g) || []).length / chars)),
    comma_density: compactNumber((value.match(/,/g) || []).length / chars),
    period_density: compactNumber((value.match(/\./g) || []).length / chars),
    semicolon_density: compactNumber((value.match(/;/g) || []).length / chars),
    colon_density: compactNumber((value.match(/:/g) || []).length / chars),
    dash_density: compactNumber((value.match(/[—–-]/g) || []).length / chars),
    question_density: compactNumber((value.match(/\?/g) || []).length / chars),
    exclamation_density: compactNumber((value.match(/!/g) || []).length / chars),
    ellipsis_density: compactNumber((value.match(/\.\.\.|…/g) || []).length / chars),
    apostrophe_density: compactNumber((value.match(/[’']/g) || []).length / chars),
    repeated_punctuation_count: repeated,
    missing_terminal_punctuation_ratio: compactNumber(sentenceChunks.filter((chunk) => chunk && !/[.!?…]$/.test(chunk)).length / Math.max(1, sentenceChunks.length)),
    lowercase_sentence_start_ratio: compactNumber(profile.surfaceMarkerProfile?.lowercaseLead ?? profile.lowercaseLead ?? (lowercaseStarts / Math.max(1, sentenceChunks.length)))
  };
  punctuation.style = punctuationStyle(punctuation);
  return {
    version: 'layout-cadence/v1',
    line_breaks: lineBreaks,
    punctuation,
    surface_markers: {
      lowercase_lead: compactNumber(profile.surfaceMarkerProfile?.lowercaseLead ?? profile.lowercaseLead ?? punctuation.lowercase_sentence_start_ratio),
      apostrophe_drop: compactNumber(profile.surfaceMarkerProfile?.apostropheDrop ?? profile.apostropheDrop ?? 0),
      abbreviation_density: compactNumber(profile.abbreviationDensity ?? profile.abbreviationPressure ?? 0),
      conversational_posture: compactNumber(profile.conversationalPosture ?? profile.conversationalPressure ?? 0)
    },
    instruction: 'Line breaks and paragraph breaks are cadence evidence. Punctuation density, punctuation scarcity, repeated punctuation, lowercase sentence-start behavior, and apostrophe/contraction surface are mask cues when present.'
  };
}

function compactLayoutCadence(cadence = null, fallbackProfile = {}, fallbackText = '') {
  const source = cadence || fallbackProfile.surfaceCadence || fallbackProfile.layoutCadence || null;
  if (!source) return buildLayoutCadenceFromProfile(fallbackProfile, fallbackText);
  const lineBreaks = source.line_breaks || source.lineBreaks || {};
  const punctuation = source.punctuation || {};
  const markers = source.surface_markers || source.surfaceMarkers || {};
  return {
    version: source.version || 'layout-cadence/v1',
    line_breaks: {
      line_break_count: compactNumber(lineBreaks.line_break_count ?? lineBreaks.lineBreakCount),
      paragraph_break_count: compactNumber(lineBreaks.paragraph_break_count ?? lineBreaks.paragraphBreakCount),
      non_empty_line_count: compactNumber(lineBreaks.non_empty_line_count ?? lineBreaks.nonEmptyLineCount),
      paragraph_count: compactNumber(lineBreaks.paragraph_count ?? lineBreaks.paragraphCount),
      average_paragraph_words: compactNumber(lineBreaks.average_paragraph_words ?? lineBreaks.averageParagraphWords),
      average_line_words: compactNumber(lineBreaks.average_line_words ?? lineBreaks.averageLineWords),
      max_paragraph_words: compactNumber(lineBreaks.max_paragraph_words ?? lineBreaks.maxParagraphWords),
      min_paragraph_words: compactNumber(lineBreaks.min_paragraph_words ?? lineBreaks.minParagraphWords),
      line_break_density: compactNumber(lineBreaks.line_break_density ?? lineBreaks.lineBreakDensity),
      paragraph_break_density: compactNumber(lineBreaks.paragraph_break_density ?? lineBreaks.paragraphBreakDensity),
      tendency: lineBreaks.tendency || 'flat'
    },
    punctuation: {
      punctuation_density: compactNumber(punctuation.punctuation_density ?? punctuation.punctuationDensity),
      comma_density: compactNumber(punctuation.comma_density ?? punctuation.commaDensity),
      period_density: compactNumber(punctuation.period_density ?? punctuation.periodDensity),
      semicolon_density: compactNumber(punctuation.semicolon_density ?? punctuation.semicolonDensity),
      colon_density: compactNumber(punctuation.colon_density ?? punctuation.colonDensity),
      dash_density: compactNumber(punctuation.dash_density ?? punctuation.dashDensity),
      question_density: compactNumber(punctuation.question_density ?? punctuation.questionDensity),
      exclamation_density: compactNumber(punctuation.exclamation_density ?? punctuation.exclamationDensity),
      ellipsis_density: compactNumber(punctuation.ellipsis_density ?? punctuation.ellipsisDensity),
      apostrophe_density: compactNumber(punctuation.apostrophe_density ?? punctuation.apostropheDensity),
      repeated_punctuation_count: compactNumber(punctuation.repeated_punctuation_count ?? punctuation.repeatedPunctuationCount),
      missing_terminal_punctuation_ratio: compactNumber(punctuation.missing_terminal_punctuation_ratio ?? punctuation.missingTerminalPunctuationRatio),
      lowercase_sentence_start_ratio: compactNumber(punctuation.lowercase_sentence_start_ratio ?? punctuation.lowercaseSentenceStartRatio),
      style: punctuation.style || 'moderate'
    },
    surface_markers: {
      lowercase_lead: compactNumber(markers.lowercase_lead ?? markers.lowercaseLead),
      apostrophe_drop: compactNumber(markers.apostrophe_drop ?? markers.apostropheDrop),
      abbreviation_density: compactNumber(markers.abbreviation_density ?? markers.abbreviationDensity),
      conversational_posture: compactNumber(markers.conversational_posture ?? markers.conversationalPosture)
    },
    instruction: source.instruction || buildLayoutCadenceFromProfile(fallbackProfile, fallbackText).instruction
  };
}

function surfaceMarkerWarnings(layout = {}) {
  const markers = layout.surface_markers || {};
  return (markers.lowercase_lead || 0) > 0.08 || (markers.apostrophe_drop || 0) > 0.01 || (markers.abbreviation_density || 0) > 0.08 || (markers.conversational_posture || 0) > 0.12;
}

function layoutWarnings(sourceLayout = {}, maskLayout = {}) {
  const warnings = [];
  if (['line-broken', 'paragraph-sensitive', 'long-paragraph-sensitive'].includes(sourceLayout.line_breaks?.tendency)) warnings.push('source-layout-sensitive');
  if (['line-broken', 'paragraph-sensitive', 'long-paragraph-sensitive'].includes(maskLayout.line_breaks?.tendency)) warnings.push('mask-layout-sensitive');
  if (['sparse', 'jointed', 'expressive'].includes(sourceLayout.punctuation?.style) || ['sparse', 'jointed', 'expressive'].includes(maskLayout.punctuation?.style)) warnings.push('punctuation-style-sensitive');
  if (surfaceMarkerWarnings(sourceLayout) || surfaceMarkerWarnings(maskLayout)) warnings.push('surface-marker-sensitive');
  return warnings;
}

export function enrichMaskForStylometry(mask = {}, referenceText = '') {
  const style = compactStyleProfile(styleProfile(mask));
  const seedText = buildCanonicalMaskSeed(mask, referenceText);
  const existingProfile = mask.profile || {};
  const sparse = maskProfileSparse(existingProfile, referenceText || mask.sampleSeed || style?.sample || '');
  const generatedProfile = sparse ? extractCadenceProfile(seedText) : existingProfile;
  const generatedDeep = StylometricDeepMetrics.analyze(seedText);
  const targetShell = generatedProfile && !generatedProfile.empty ? cadenceModFromProfile(generatedProfile) : null;
  const layoutCadence = compactLayoutCadence(mask.layoutCadence || mask.surfaceCadence || generatedProfile.layoutCadence || generatedProfile.surfaceCadence, generatedProfile, seedText);
  return {
    ...mask,
    label: style?.label || mask.label,
    profile: { ...generatedProfile, layoutCadence, surfaceCadence: layoutCadence },
    surfaceCadence: layoutCadence,
    layoutCadence,
    sampleSeed: safe(referenceText || style?.sample || mask.sampleSeed) || seedText,
    canonicalMaskSeed: seedText,
    styleDiversity: style,
    __td613MaskEnrichment: {
      version: HUSH_MASK_ENRICHMENT_VERSION,
      applied: sparse,
      sparseBeforeEnrichment: sparse,
      canonicalSeedHash: hashSeed(seedText),
      canonicalSeedWordCount: wordList(seedText).length,
      profileWordCount: Number(generatedProfile.wordCount || 0),
      targetShell,
      deepMetrics: compactDeepMetrics(generatedDeep),
      layoutCadence,
      styleDiversityVersion: style?.version || '',
      humanSampleResidueVersion: style?.human_sample_residue_version || '',
      source: sparse ? 'generated-from-canonical-mask-fields-via-stylometry-engine' : 'existing-mask-profile'
    }
  };
}

function sourceUnitText(propositionMap = {}, sourceText = '') {
  const propositionUnits = asArray(propositionMap.propositions).map((p) => safe(p.text)).filter(Boolean);
  const lineUnits = safe(sourceText).split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const sentenceUnits = safe(sourceText).match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((line) => line.trim()).filter(Boolean) || [];
  return uniq([...propositionUnits, ...lineUnits, ...sentenceUnits]).slice(0, 18);
}

function termBank(propositionMap = {}, sourceText = '') {
  const fromMap = asArray(propositionMap.propositions).flatMap((p) => asArray(p.coreTerms));
  const stop = new Set('the a an and or but if is are was were be been being do does did how what why when where who whom with without into from that this those these much really very just like of in on to for no not before after you your yours i me my mine we our ours it its they them their there here some so sorry sounds sound going through have has had basically maybe came come from can could would should will as at by'.split(' '));
  const fromText = safe(sourceText).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g)?.filter((word) => word.length > 2 && !stop.has(word)) || [];
  return uniq([...fromMap, ...fromText]).slice(0, 36);
}

function compactQuestionMap(propositionMap = {}) {
  return asArray(propositionMap.propositions).filter((p) => p.mustRemainQuestion || p.type === 'question').map((p) => ({ id: p.id, text: p.text, coreTerms: asArray(p.coreTerms), mustRemainQuestion: true })).slice(0, 10);
}

function compactClaimMap(propositionMap = {}) {
  return asArray(propositionMap.propositions).filter((p) => p.type === 'claim').map((p) => ({ id: p.id, text: p.text, coreTerms: asArray(p.coreTerms), intent: p.intent || 'claim-preservation' })).slice(0, 10);
}

function compactFlagMap(propositionMap = {}, key = 'uncertainty') {
  return asArray(propositionMap.propositions).filter((p) => p.intent === key || (key === 'negation' && p.hasNegation) || (key === 'uncertainty' && p.hasUncertainty)).map((p) => ({ id: p.id, text: p.text, coreTerms: asArray(p.coreTerms) })).slice(0, 10);
}

function maskStyleVector(mask = {}) {
  const profile = mask.profile || {};
  const writingTraits = mask.writingTraits || {};
  const enrichment = mask.__td613MaskEnrichment || {};
  const style = compactStyleProfile(mask.styleDiversity || styleProfile(mask));
  const layoutCadence = compactLayoutCadence(mask.layoutCadence || mask.surfaceCadence || profile.layoutCadence || profile.surfaceCadence, profile, mask.canonicalMaskSeed || mask.sampleSeed || style?.sample || '');
  return {
    mask_id: mask.id || '',
    display_name: style?.label || mask.label || mask.name || '',
    register: mask.family || '',
    intended_use: mask.intendedUse || '',
    risk_tell: mask.riskTell || '',
    sentence_length_target: profile.averageSentenceLength || profile.avgSentenceLength || writingTraits.sentenceLength || style?.architecture || '',
    rhythm_target: profile.rhythm || profile.sentenceRhythm || writingTraits.rhythm || style?.architecture || '',
    formality_target: profile.formality || writingTraits.diction || style?.surface || '',
    warmth_target: profile.warmth || writingTraits.emotionalTemperature || style?.chat_speak_profile || '',
    compression_target: profile.compression || writingTraits.verbosity || '',
    metaphor_tolerance: profile.metaphorTolerance || writingTraits.metaphorTolerance || 'medium',
    punctuation_law: writingTraits.punctuationLaw || style?.punctuation || '',
    grammar_variance: writingTraits.grammarVariance || style?.grammar || '',
    typo_policy: writingTraits.typoPolicy || style?.typo_policy || '',
    chat_speak_profile: writingTraits.chatSpeakProfile || style?.chat_speak_profile || '',
    human_sample_residue_version: style?.human_sample_residue_version || enrichment.humanSampleResidueVersion || '',
    layout_cadence: layoutCadence,
    surface_markers: layoutCadence.surface_markers,
    style_diversity: style,
    diction_hints: uniq([...(mask.dictionHints || []), ...(writingTraits.dictionHints || []), ...(style?.lexicon || [])]).slice(0, 20),
    transition_bank: uniq([...(mask.transitionBank || []), ...(style?.transitions || [])]).slice(0, 20),
    avoid_list: uniq([...(mask.avoidList || []), ...(style?.avoid || [])]).slice(0, 28),
    desired_moves: uniq([...(mask.transformHints?.desiredMoves || []), style?.surface, style?.architecture, style?.punctuation, style?.grammar, style?.chat_speak_profile]).slice(0, 20),
    example_transform_pairs: asArray(mask.exampleTransformPairs).slice(0, 5),
    protected_literals: buildProtectedLiteralList(mask.protectedLiterals || []),
    canonical_seed_hash: enrichment.canonicalSeedHash || hashSeed(mask.canonicalMaskSeed || mask.sampleSeed || ''),
    sample_seed_excerpt: safe(mask.sampleSeed || style?.sample || '').slice(0, 800)
  };
}

function buildFlightPacket({ sourceText = '', mask = {}, candidateCount = 8, protectedLiterals = [], operatorMode = 'neutralize' } = {}) {
  const propositionMap = buildPropositionMap(sourceText);
  const route = buildOntologyRoute({ sourceText, mask, propositionMap, operatorMode });
  const enrichedMask = enrichMaskForStylometry(mask);
  const sourceProfile = extractCadenceProfile(sourceText);
  const sourceLayoutCadence = compactLayoutCadence(sourceProfile.layoutCadence || sourceProfile.surfaceCadence, sourceProfile, sourceText);
  const maskLayoutCadence = compactLayoutCadence(enrichedMask.layoutCadence || enrichedMask.surfaceCadence || enrichedMask.profile?.layoutCadence || enrichedMask.profile?.surfaceCadence, enrichedMask.profile || {}, enrichedMask.canonicalMaskSeed || enrichedMask.sampleSeed || '');
  const auditWarnings = layoutWarnings(sourceLayoutCadence, maskLayoutCadence);
  return {
    packet_version: HUSH_FLIGHT_PACKET_VERSION,
    provider_version: HUSH_GENERATOR_PROVIDER_VERSION,
    phase35_version: HUSH_PROVIDER_PHASE35_VERSION,
    phase37_version: HUSH_PROVIDER_PHASE37_VERSION,
    llm_candidate_version: HUSH_LLM_CANDIDATE_V3,
    source_manifest: {
      source_hash: hashSeed(sourceText),
      source_word_count: wordList(sourceText).length,
      source_layout_cadence: sourceLayoutCadence,
      proposition_summary: propositionMap.summary,
      proposition_units: sourceUnitText(propositionMap, sourceText),
      term_bank: termBank(propositionMap, sourceText),
      question_map: compactQuestionMap(propositionMap),
      claim_map: compactClaimMap(propositionMap),
      uncertainty_map: compactFlagMap(propositionMap, 'uncertainty'),
      negation_map: compactFlagMap(propositionMap, 'negation')
    },
    ontology_route: route,
    remote_route_payload: compileRemoteRoutePayload(route),
    mask_style_vector: maskStyleVector(enrichedMask),
    stylometry_engine: {
      source_profile: sourceProfile,
      source_deep_metrics: compactDeepMetrics(StylometricDeepMetrics.analyze(sourceText)),
      source_surface_markers: sourceLayoutCadence.surface_markers,
      mask_reference_profile: enrichedMask.profile || {},
      mask_reference_deep_metrics: compactDeepMetrics(StylometricDeepMetrics.analyze(enrichedMask.canonicalMaskSeed || enrichedMask.sampleSeed || '')),
      mask_surface_markers: maskLayoutCadence.surface_markers,
      layout_cadence_instruction: sourceLayoutCadence.instruction || maskLayoutCadence.instruction,
      target_shell: enrichedMask.__td613MaskEnrichment?.targetShell || null,
      cadence_shell: cadenceModFromProfile(enrichedMask.profile || {}),
      generator_constraints: {
        must_change_surface: true,
        preserve_questions_as_questions: true,
        preserve_negation: true,
        preserve_uncertainty: true,
        no_new_claims: true,
        no_private_ledger: true,
        no_mask_memory_exfiltration: true,
        avoid_source_sentence_order: true,
        avoid_verbatim_tail: true,
        preserve_layout_cadence: true,
        do_not_flatten_paragraph_sensitive_source: true,
        custom_mask_line_break_behavior_active: ['line-broken', 'paragraph-sensitive', 'long-paragraph-sensitive'].includes(maskLayoutCadence.line_breaks?.tendency),
        apply_human_sample_residue: Boolean(enrichedMask.__td613MaskEnrichment?.humanSampleResidueVersion)
      },
      audit: { warnings: auditWarnings, enrichment: enrichedMask.__td613MaskEnrichment || null }
    },
    flight_controls: {
      candidate_count: candidateCount,
      required_operations: HUSH_STYLE_OPERATIONS,
      preferred_operations: route.preferred_operations || HUSH_STYLE_OPERATIONS,
      approval_floor: route.approval_floor || 'local-selector-only',
      reject_if: ['answers-source-question', 'adds-new-facts', 'drops-negation', 'flattens-uncertainty', 'quotes-private-ledger', 'copies-source-tail']
    },
    custody_boundaries: {
      protected_literals: buildProtectedLiteralList(protectedLiterals),
      no_private_text_fields: true,
      no_mask_memory_payload: true,
      operator_review_required: true
    }
  };
}

export function buildPhase37ProviderTelemetry(input = {}) {
  const flightPacket = buildFlightPacket(input);
  return {
    version: HUSH_PROVIDER_PHASE37_VERSION,
    flightPacketVersion: HUSH_FLIGHT_PACKET_VERSION,
    promptVersion: HUSH_LLM_CANDIDATE_V3,
    ontologyRoute: flightPacket.ontology_route,
    flightPacket,
    styleDiversityVersion: HUSH_STYLE_DIVERSITY_VERSION,
    maskEnrichmentVersion: HUSH_MASK_ENRICHMENT_VERSION,
    packetStyleVersion: HUSH_PACKET_STYLE_VERSION
  };
}

export function buildHushLlmPromptContractV2(input = {}) {
  const base = buildHushLlmPromptContract(input);
  const telemetry = buildPhase37ProviderTelemetry(input);
  return { ...base, promptVersion: HUSH_LLM_CANDIDATE_V3, flightPacketVersion: HUSH_FLIGHT_PACKET_VERSION, flightPacket: telemetry.flightPacket, ontologyRoute: telemetry.ontologyRoute, operationTaxonomy: HUSH_STYLE_OPERATIONS };
}

export function buildHushLlmPromptContractV3(input = {}) {
  return buildHushLlmPromptContractV2(input);
}
