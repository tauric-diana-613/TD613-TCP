import { stableStringify, sha256Text } from './hush-customizer-packet.js';
import { HUSH_MASK_CENTROID_SCHEMA } from './hush-stylometric-feature-vector.js';

export const SOL_STRATIGRAPHIX_METRIC_PROFILE_SCHEMA = 'td613.hush.phase8.sol-stratigraphix-metrics/v1';

export const SOL_STRATIGRAPHIX_CADENCE_HEATMAP = Object.freeze({
  objectPressure: Object.freeze({ min: 0.0, max: 0.2 }),
  labelLocation: Object.freeze({ min: 0.2, max: 0.4 }),
  custodyRelation: Object.freeze({ min: 0.4, max: 0.7 }),
  coolInference: Object.freeze({ min: 0.7, max: 0.9 }),
  restrainedClose: Object.freeze({ min: 0.9, max: 1.0 }),
  expectedContour: 'cold-ledger-mild-haunt',
  forbiddenContours: Object.freeze([
    'glitch-compression',
    'small-circle-cluster',
    'pressurized-handoff-linebreak',
    'adversarial-fracture-shard',
    'warm-envelope-hard-latch',
    'checklist-stepper',
    'target-register-argument'
  ])
});

export const SOL_STRATIGRAPHIX_THRESHOLDS = Object.freeze({
  mandatory_anchor_retention: 1.0,
  factual_damage_risk_max: 0.05,
  source_unit_coverage_min: 0.92,
  hedge_retention_min: 0.75,
  sequence_relation_retention_min: 0.75,
  generic_helper_voice_score_max: 0.08,
  api_sheen_score_max: 0.12,
  polish_pressure_max: 0.16,
  closure_lamination_score_max: 0.3,
  sample_seed_phrase_overlap_max: 0,
  rare_phrase_reuse_max: 0.05,
  sample_seed_lexical_overlap_max: 0.08,
  profile_reconstruction_risk_max: 0.12,
  private_cadence_exposure_risk_max: 0.14,
  mask_breath_score_min: 0.58,
  bounded_irregularity_index_min: 0.0,
  bounded_irregularity_index_max: 0.72,
  rhythm_asymmetry_score_min: 0,
  imperfection_budget_used_min: 0.0,
  imperfection_budget_used_max: 0.78,
  nonuniformity_without_damage_min: 0.45,
  mask_centroid_distance_max: 0.6,
  mask_family_fit_min: 0.4,
  role_behavior_fit_min: 0.5,
  generic_ai_baseline_distance_min: 0.1,
  object_centrality_score_min: 0.82,
  file_visibility_score_min: 0.75,
  folder_visibility_score_min: 0.0,
  label_visibility_score_min: 0.7,
  document_anchor_position_max: 0.32,
  record_object_gravity_min: 0.78,
  custody_distance_score_min: 0.7,
  document_centeredness_score_min: 0.82,
  human_heat_suppression_score_min: 0.62,
  witness_distance_score_min: 0.66,
  object_over_speaker_ratio_min: 1.8,
  location_visibility_score_min: 0.0,
  label_location_binding_score_min: 0.62,
  custody_chain_visibility_score_min: 0.78,
  document_relation_score_min: 0.76,
  record_continuity_score_min: 0.82,
  thin_atmosphere_score_min: 0.18,
  thin_atmosphere_score_max: 0.58,
  archival_coolness_score_min: 0.55,
  haunt_pressure_score_max: 0.22,
  atmosphere_to_custody_ratio_max: 0.42,
  atmosphere_containment_score_min: 0.76,
  future_archaic_misalignment_score_min: 0.12,
  future_archaic_misalignment_score_max: 0.52,
  common_cadence_miss_score_min: 0.10,
  common_cadence_miss_score_max: 0.48,
  temporal_wrongness_score_max: 0.48,
  sci_fi_prop_risk_max: 0.04,
  archaic_cosplay_risk_max: 0.06,
  over_memorable_image_score_max: 0.12,
  ghost_prop_rate_max: 0,
  mascot_phrase_rate_max: 0,
  literary_fog_score_max: 0.18,
  strangeness_fingerprint_risk_max: 0.16,
  legal_memo_flattening_score_max: 0.22,
  checklist_coldness_score_max: 0.2,
  bureaucratic_distance_score_max: 0.18,
  dead_document_voice_score_max: 0.2,
  prior_mask_similarity_score_max: 0.34,
  queenie_leakage_score_max: 0.14,
  rex_fracture_leakage_score_max: 0.12,
  cryo_handoff_leakage_score_max: 0.14,
  pixie_chat_leakage_score_max: 0.1,
  keisha_social_leakage_score_max: 0.12,
  luz_checklist_leakage_score_max: 0.16,
  nolan_snark_leakage_score_max: 0.12,
  invented_context_rate_max: 0.04,
  archival_spacing_score_min: 0.4,
  pressurized_dispatch_score_max: 0.18,
  fracture_shard_score_max: 0.16,
  warm_paragraph_latch_score_max: 0.2,
  small_circle_breath_score_max: 0.16
});

const OBJECT_MARKERS = ['file-72', 'file', 'record', 'copy', 'document', 'folder', 'label', 'date', 'footer'];
const FILE_MARKERS = ['file-72', 'file'];
const FOLDER_MARKERS = ['folder', 'drawer', 'shelf', 'index', 'catalog', 'location'];
const LABEL_MARKERS = ['wjct label', 'label', 'wjct'];
const LOCATION_MARKERS = ['shelf', 'drawer', 'folder', 'placed', 'location', 'under'];
const CUSTODY_MARKERS = ['keeps', 'kept', 'remains', 'remain', 'still', 'points', 'holds', 'stay', 'stays', 'separated', 'attached', 'with the file', 'under the label'];
const ATMOSPHERE_MARKERS = ['shelf', 'drawer', 'archive', 'archival', 'placed', 'learned another route', 'loose part', 'moved'];
const HAUNT_MARKERS = ['ghost', 'haunted', 'spooky', 'whisper', 'whispers', 'mildew', 'dust', 'cart rolls', 'spirit', 'dead file', 'archive demon', 'creepy'];
const SCI_FI_MARKERS = ['future archive', 'neon', 'computes', 'oracle', 'cyber', 'nebula', 'machine'];
const ARCHAIC_MARKERS = ['dear sirs', 'doth', 'hath', 'thou', 'ancient keeping', 'wherefore'];
const MEMO_MARKERS = ['contains the relevant', 'should be retained accordingly', 'applicable', 'for review', 'relevant date', 'discrepancy'];
const QUEENIE_MARKERS = ["i’d keep", "i'd keep", 'keep this one close', 'little footer detail', 'doing more work'];
const REX_MARKERS = ['/', '//', 'not small', 'date holds', 'label holds'];
const CRYO_MARKERS = ['attached', 'sent', 'date and label', 'still on it'];
const PIXIE_MARKERS = ['idk', 'maybe weird', 'rn', 'tho'];
const KEISHA_MARKERS = ['girl', 'thread', 'already know', 'everyone here', 'group'];
const LUZ_MARKERS = ['1.', '2.', '3.', 'checklist', 'itemize', 'numbered'];
const NOLAN_MARKERS = ['telling on itself', 'obviously', 'exactly', 'weird'];
const BACKSTORY_MARKERS = ['people buried', 'they knew', 'probably knew', 'whole story'];

function text(value) { return String(value || ''); }
function lower(value) { return text(value).toLowerCase(); }
function tokens(value) { return text(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []; }
function lines(value) { return text(value).split(/\n+/u).map((part) => part.trim()).filter(Boolean); }
function clamp(value) { return Math.max(0, Math.min(1, Number((Number(value) || 0).toFixed(4)))); }
function rate(n, d) { return clamp(d ? n / d : 0); }
function phraseHits(phrases, value) { const v = lower(value); return phrases.filter((phrase) => v.includes(String(phrase).toLowerCase())).length; }
function hasAny(phrases, value) { return phraseHits(phrases, value) > 0; }
function visibility(phrases, value, regex = null) { return clamp((hasAny(phrases, value) || (regex && regex.test(text(value)))) ? 1 : 0); }
function positionOf(phrases, value, fallback = 1) {
  const v = lower(value);
  const positions = phrases.map((phrase) => v.indexOf(String(phrase).toLowerCase())).filter((index) => index >= 0);
  if (!positions.length) return fallback;
  return clamp(Math.min(...positions) / Math.max(v.length, 1));
}
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function addRepair(lists, name, passed) { (passed ? lists.passed : lists.repair).push(name); }
function addHard(lists, name, passed) { (passed ? lists.passed : lists.failed).push(name); }
function addBand(lists, name, value, min = 0, max = 1) { (value >= min && value <= max ? lists.passed : lists.repair).push(name); }

export function isSolStratigraphixRecord(maskRecord = {}) {
  return maskRecord.mask_id === 'library-ghost' || maskRecord.gallery_role === 'document_distance' || maskRecord.intended_role === 'document_distance' || maskRecord.family === 'document distance';
}

export async function buildSolStratigraphixCentroid(maskRecord = {}, calibrationSamples = []) {
  const centroid = Object.freeze({
    mean_sentence_length: 13.5,
    sentence_length_cv: 0.26,
    lexical_density: 0.64,
    hedge_marker_rate: 0.015,
    abbreviation_rate: 0,
    generic_helper_voice_score: 0.03,
    api_sheen_score: 0.04,
    bounded_irregularity_index: 0.28,
    breath_retention_score: 0.70,
    warmth_to_custody_ratio: 0.22,
    atmosphere_to_custody_ratio: 0.32,
    human_heat_score: 0.20,
    archival_coolness_score: 0.66
  });
  return Object.freeze({
    schema: HUSH_MASK_CENTROID_SCHEMA,
    mask_id: maskRecord.mask_id || null,
    role: 'document_distance',
    centroid_features: centroid,
    calibration_sample_count: calibrationSamples.length,
    centroid_hash_sha256: await sha256Text(stableStringify(centroid))
  });
}

export function computeSolStratigraphixFeatureMetrics(candidate = '', options = {}) {
  const value = text(candidate);
  const tokenList = tokens(value);
  const tokenCount = Math.max(tokenList.length, 1);
  const lineList = lines(value);
  const lineCount = Math.max(lineList.length, 1);
  const objectHits = phraseHits(OBJECT_MARKERS, value);
  const fileVisibility = visibility(FILE_MARKERS, value, /FILE-?72/u);
  const folderVisibility = visibility(FOLDER_MARKERS, value);
  const labelVisibility = visibility(LABEL_MARKERS, value, /WJCT/u);
  const dateVisibility = visibility(['6/18', 'date', 'export date'], value, /\b\d{1,2}\/\d{1,2}\b/u);
  const footerVisibility = visibility(['footer', 'footer mismatch', 'mismatch'], value);
  const locationVisibility = visibility(LOCATION_MARKERS, value);
  const custodyHits = phraseHits(CUSTODY_MARKERS, value);
  const atmosphereHits = phraseHits(ATMOSPHERE_MARKERS, value);
  const hauntHits = phraseHits(HAUNT_MARKERS, value);
  const sciFiHits = phraseHits(SCI_FI_MARKERS, value);
  const archaicHits = phraseHits(ARCHAIC_MARKERS, value);
  const memoHits = phraseHits(MEMO_MARKERS, value);
  const queenieHits = phraseHits(QUEENIE_MARKERS, value);
  const rexHits = phraseHits(REX_MARKERS, value);
  const cryoHits = phraseHits(CRYO_MARKERS, value);
  const pixieHits = phraseHits(PIXIE_MARKERS, value);
  const keishaHits = phraseHits(KEISHA_MARKERS, value);
  const luzHits = phraseHits(LUZ_MARKERS, value);
  const nolanHits = phraseHits(NOLAN_MARKERS, value);
  const backstoryHits = phraseHits(BACKSTORY_MARKERS, value);
  const slashCount = (value.match(/\//g) || []).length;
  const humanWarmthHits = phraseHits(['i’d', "i'd", 'keep this one close', 'you', 'girl', 'baby', 'little detail'], value);
  const objectCentrality = clamp((fileVisibility + labelVisibility + dateVisibility + footerVisibility) / 4);
  const recordGravity = clamp(objectCentrality * 0.72 + Math.min(objectHits, 5) * 0.05 + custodyHits * 0.04);
  const documentAnchorPosition = positionOf(OBJECT_MARKERS, value, 1);
  const custodyChain = clamp(objectCentrality * 0.62 + custodyHits * 0.08 + footerVisibility * 0.12);
  const relation = clamp((labelVisibility + dateVisibility + footerVisibility + fileVisibility) / 4 + custodyHits * 0.04);
  const continuity = clamp(custodyChain * 0.68 + relation * 0.32);
  const documentCenteredness = clamp(objectCentrality * 0.68 + recordGravity * 0.2 + (1 - rate(humanWarmthHits, tokenCount) * 3) * 0.12);
  const humanHeatSuppression = clamp(1 - humanWarmthHits * 0.16 - queenieHits * 0.18 - keishaHits * 0.16);
  const witnessDistance = clamp(documentCenteredness * 0.6 + humanHeatSuppression * 0.4);
  const objectOverSpeaker = Number(Math.max(0, (objectHits + custodyHits + 1) / Math.max(humanWarmthHits + 1, 1)).toFixed(4));
  const custodyDistance = clamp(documentCenteredness * 0.5 + humanHeatSuppression * 0.3 + custodyChain * 0.2);
  const labelLocationBinding = clamp(labelVisibility * 0.38 + dateVisibility * 0.24 + locationVisibility * 0.12 + fileVisibility * 0.26);
  const atmosphereRaw = clamp(atmosphereHits * 0.12 + phraseHits(['learned another route', 'left its shelf', 'loose part'], value) * 0.14);
  const thinAtmosphere = clamp(0.22 + atmosphereRaw - hauntHits * 0.18 - sciFiHits * 0.22 - archaicHits * 0.18);
  const archivalCoolness = clamp(documentCenteredness * 0.42 + custodyDistance * 0.28 + thinAtmosphere * 0.18 + humanHeatSuppression * 0.12);
  const hauntPressure = clamp(hauntHits * 0.24 + phraseHits(['whispers', 'after closing'], value) * 0.16);
  const atmosphereToCustody = clamp((atmosphereRaw + hauntPressure + 0.01) / Math.max(custodyChain + 0.01, 0.01));
  const atmosphereContainment = clamp(1 - hauntPressure - Math.max(0, atmosphereToCustody - 0.35));
  const futureArchaic = clamp(phraseHits(['remains where it was placed', 'learned another route', 'still points', 'the file keeps', 'what moved is'], value) * 0.13 + locationVisibility * 0.08);
  const commonCadenceMiss = clamp(futureArchaic * 0.68 + phraseHits(['still points', 'has learned', 'where it was placed', 'the part that left'], value) * 0.08);
  const temporalWrongness = clamp(futureArchaic + sciFiHits * 0.18 + archaicHits * 0.16);
  const overMemorable = clamp(hauntHits * 0.2 + sciFiHits * 0.22 + archaicHits * 0.2 + backstoryHits * 0.12 + phraseHits(['sorrow', 'buried'], value) * 0.16);
  const literaryFog = clamp(hauntHits * 0.18 + phraseHits(['mildew-dark', 'remembers what the people buried', 'sorrow'], value) * 0.28);
  const strangenessRisk = clamp(overMemorable * 0.6 + literaryFog * 0.4);
  const legalMemo = clamp(memoHits * 0.16 + phraseHits(['contains', 'accordingly', 'retained'], value) * 0.08);
  const checklistCold = clamp(luzHits * 0.2 + phraseHits(['please ensure', 'should be retained'], value) * 0.08);
  const bureaucratic = clamp(memoHits * 0.12 + phraseHits(['accordingly', 'relevant', 'contains'], value) * 0.08);
  const deadVoice = clamp(legalMemo * 0.58 + (thinAtmosphere < 0.2 ? 0.18 : 0));
  const queenieLeak = clamp(queenieHits * 0.22 + humanWarmthHits * 0.08);
  const rexLeak = clamp(slashCount * 0.1 + rexHits * 0.16);
  const cryoLeak = clamp(cryoHits * 0.16 + (lineCount >= 3 && value.toLowerCase().startsWith('attached') ? 0.22 : 0));
  const pixieLeak = clamp(pixieHits * 0.18);
  const keishaLeak = clamp(keishaHits * 0.2);
  const luzLeak = clamp(luzHits * 0.2);
  const nolanLeak = clamp(nolanHits * 0.18);
  const priorMask = clamp(Math.max(queenieLeak, rexLeak, cryoLeak, pixieLeak, keishaLeak, luzLeak, nolanLeak));
  const archivalSpacing = clamp((lineCount >= 2 ? 0.42 : 0.12) + objectCentrality * 0.22 + custodyChain * 0.18 - cryoLeak * 0.18 - rexLeak * 0.12);
  const pressurizedDispatch = cryoLeak;
  const fractureShard = rexLeak;
  const warmLatch = queenieLeak;
  const smallCircleBreath = keishaLeak;
  return Object.freeze({
    schema: SOL_STRATIGRAPHIX_METRIC_PROFILE_SCHEMA,
    object_centrality_score: objectCentrality,
    file_visibility_score: fileVisibility,
    folder_visibility_score: folderVisibility,
    label_visibility_score: labelVisibility,
    date_visibility_score: dateVisibility,
    document_anchor_position: documentAnchorPosition,
    record_object_gravity: recordGravity,
    custody_distance_score: custodyDistance,
    document_centeredness_score: documentCenteredness,
    human_heat_suppression_score: humanHeatSuppression,
    witness_distance_score: witnessDistance,
    object_over_speaker_ratio: objectOverSpeaker,
    location_visibility_score: locationVisibility,
    label_location_binding_score: labelLocationBinding,
    custody_chain_visibility_score: custodyChain,
    document_relation_score: relation,
    record_continuity_score: continuity,
    thin_atmosphere_score: thinAtmosphere,
    archival_coolness_score: archivalCoolness,
    haunt_pressure_score: hauntPressure,
    atmosphere_to_custody_ratio: atmosphereToCustody,
    atmosphere_containment_score: atmosphereContainment,
    future_archaic_misalignment_score: futureArchaic,
    common_cadence_miss_score: commonCadenceMiss,
    temporal_wrongness_score: temporalWrongness,
    sci_fi_prop_risk: clamp(sciFiHits * 0.22),
    archaic_cosplay_risk: clamp(archaicHits * 0.22),
    over_memorable_image_score: overMemorable,
    ghost_prop_rate: rate(hauntHits, tokenCount),
    literary_fog_score: literaryFog,
    strangeness_fingerprint_risk: strangenessRisk,
    legal_memo_flattening_score: legalMemo,
    checklist_coldness_score: checklistCold,
    bureaucratic_distance_score: bureaucratic,
    dead_document_voice_score: deadVoice,
    queenie_leakage_score: queenieLeak,
    rex_fracture_leakage_score: rexLeak,
    cryo_handoff_leakage_score: cryoLeak,
    pixie_chat_leakage_score: pixieLeak,
    keisha_social_leakage_score: keishaLeak,
    luz_checklist_leakage_score: luzLeak,
    nolan_snark_leakage_score: nolanLeak,
    prior_mask_similarity_score: priorMask,
    invented_context_rate: clamp(backstoryHits * 0.2),
    unsupported_backstory_score: clamp(backstoryHits * 0.24),
    archival_spacing_score: archivalSpacing,
    pressurized_dispatch_score: pressurizedDispatch,
    fracture_shard_score: fractureShard,
    warm_paragraph_latch_score: warmLatch,
    small_circle_breath_score: smallCircleBreath,
    cadence_heatmap_contour: 'cold-ledger-mild-haunt'
  });
}

export function applySolStratigraphixDecisionRules(decision = {}, featureVector = {}, thresholds = SOL_STRATIGRAPHIX_THRESHOLDS) {
  const lists = {
    passed: [...(decision.passed_thresholds || [])],
    failed: [...(decision.failed_thresholds || [])],
    repair: [...(decision.repair_thresholds || [])]
  };
  const f = featureVector || {};
  addRepair(lists, 'object_centrality_score', (f.object_centrality_score ?? 0) >= thresholds.object_centrality_score_min);
  addRepair(lists, 'file_visibility_score', (f.file_visibility_score ?? 0) >= thresholds.file_visibility_score_min);
  addRepair(lists, 'folder_visibility_score', (f.folder_visibility_score ?? 0) >= thresholds.folder_visibility_score_min);
  addRepair(lists, 'label_visibility_score', (f.label_visibility_score ?? 0) >= thresholds.label_visibility_score_min);
  addRepair(lists, 'document_anchor_position', (f.document_anchor_position ?? 1) <= thresholds.document_anchor_position_max);
  addRepair(lists, 'record_object_gravity', (f.record_object_gravity ?? 0) >= thresholds.record_object_gravity_min);
  addRepair(lists, 'custody_distance_score', (f.custody_distance_score ?? 0) >= thresholds.custody_distance_score_min);
  addRepair(lists, 'document_centeredness_score', (f.document_centeredness_score ?? 0) >= thresholds.document_centeredness_score_min);
  addRepair(lists, 'human_heat_suppression_score', (f.human_heat_suppression_score ?? 0) >= thresholds.human_heat_suppression_score_min);
  addRepair(lists, 'witness_distance_score', (f.witness_distance_score ?? 0) >= thresholds.witness_distance_score_min);
  addRepair(lists, 'object_over_speaker_ratio', (f.object_over_speaker_ratio ?? 0) >= thresholds.object_over_speaker_ratio_min);
  addRepair(lists, 'location_visibility_score', (f.location_visibility_score ?? 0) >= thresholds.location_visibility_score_min);
  addRepair(lists, 'label_location_binding_score', (f.label_location_binding_score ?? 0) >= thresholds.label_location_binding_score_min);
  addRepair(lists, 'custody_chain_visibility_score', (f.custody_chain_visibility_score ?? 0) >= thresholds.custody_chain_visibility_score_min);
  addRepair(lists, 'document_relation_score', (f.document_relation_score ?? 0) >= thresholds.document_relation_score_min);
  addRepair(lists, 'record_continuity_score', (f.record_continuity_score ?? 0) >= thresholds.record_continuity_score_min);
  addBand(lists, 'thin_atmosphere_score', f.thin_atmosphere_score ?? 0, thresholds.thin_atmosphere_score_min, thresholds.thin_atmosphere_score_max);
  addRepair(lists, 'archival_coolness_score', (f.archival_coolness_score ?? 0) >= thresholds.archival_coolness_score_min);
  addHard(lists, 'haunt_pressure_score', (f.haunt_pressure_score ?? 0) <= thresholds.haunt_pressure_score_max);
  addRepair(lists, 'atmosphere_to_custody_ratio', (f.atmosphere_to_custody_ratio ?? 0) <= thresholds.atmosphere_to_custody_ratio_max);
  addRepair(lists, 'atmosphere_containment_score', (f.atmosphere_containment_score ?? 0) >= thresholds.atmosphere_containment_score_min);
  addBand(lists, 'future_archaic_misalignment_score', f.future_archaic_misalignment_score ?? 0, thresholds.future_archaic_misalignment_score_min, thresholds.future_archaic_misalignment_score_max);
  addBand(lists, 'common_cadence_miss_score', f.common_cadence_miss_score ?? 0, thresholds.common_cadence_miss_score_min, thresholds.common_cadence_miss_score_max);
  addRepair(lists, 'temporal_wrongness_score', (f.temporal_wrongness_score ?? 0) <= thresholds.temporal_wrongness_score_max);
  addHard(lists, 'sci_fi_prop_risk', (f.sci_fi_prop_risk ?? 0) <= thresholds.sci_fi_prop_risk_max);
  addHard(lists, 'archaic_cosplay_risk', (f.archaic_cosplay_risk ?? 0) <= thresholds.archaic_cosplay_risk_max);
  addHard(lists, 'over_memorable_image_score', (f.over_memorable_image_score ?? 0) <= thresholds.over_memorable_image_score_max);
  addHard(lists, 'ghost_prop_rate', (f.ghost_prop_rate ?? 0) <= thresholds.ghost_prop_rate_max);
  addHard(lists, 'literary_fog_score', (f.literary_fog_score ?? 0) <= thresholds.literary_fog_score_max);
  addRepair(lists, 'strangeness_fingerprint_risk', (f.strangeness_fingerprint_risk ?? 0) <= thresholds.strangeness_fingerprint_risk_max);
  addRepair(lists, 'legal_memo_flattening_score', (f.legal_memo_flattening_score ?? 0) <= thresholds.legal_memo_flattening_score_max);
  addRepair(lists, 'checklist_coldness_score', (f.checklist_coldness_score ?? 0) <= thresholds.checklist_coldness_score_max);
  addRepair(lists, 'bureaucratic_distance_score', (f.bureaucratic_distance_score ?? 0) <= thresholds.bureaucratic_distance_score_max);
  addRepair(lists, 'dead_document_voice_score', (f.dead_document_voice_score ?? 0) <= thresholds.dead_document_voice_score_max);
  addRepair(lists, 'prior_mask_similarity_score', (f.prior_mask_similarity_score ?? 0) <= thresholds.prior_mask_similarity_score_max);
  addRepair(lists, 'queenie_leakage_score', (f.queenie_leakage_score ?? 0) <= thresholds.queenie_leakage_score_max);
  addRepair(lists, 'rex_fracture_leakage_score', (f.rex_fracture_leakage_score ?? 0) <= thresholds.rex_fracture_leakage_score_max);
  addRepair(lists, 'cryo_handoff_leakage_score', (f.cryo_handoff_leakage_score ?? 0) <= thresholds.cryo_handoff_leakage_score_max);
  addRepair(lists, 'pixie_chat_leakage_score', (f.pixie_chat_leakage_score ?? 0) <= thresholds.pixie_chat_leakage_score_max);
  addRepair(lists, 'keisha_social_leakage_score', (f.keisha_social_leakage_score ?? 0) <= thresholds.keisha_social_leakage_score_max);
  addRepair(lists, 'luz_checklist_leakage_score', (f.luz_checklist_leakage_score ?? 0) <= thresholds.luz_checklist_leakage_score_max);
  addRepair(lists, 'nolan_snark_leakage_score', (f.nolan_snark_leakage_score ?? 0) <= thresholds.nolan_snark_leakage_score_max);
  addHard(lists, 'invented_context_rate', (f.invented_context_rate ?? 0) <= thresholds.invented_context_rate_max);
  addRepair(lists, 'archival_spacing_score', (f.archival_spacing_score ?? 0) >= thresholds.archival_spacing_score_min);
  addRepair(lists, 'pressurized_dispatch_score', (f.pressurized_dispatch_score ?? 0) <= thresholds.pressurized_dispatch_score_max);
  addRepair(lists, 'fracture_shard_score', (f.fracture_shard_score ?? 0) <= thresholds.fracture_shard_score_max);
  addRepair(lists, 'warm_paragraph_latch_score', (f.warm_paragraph_latch_score ?? 0) <= thresholds.warm_paragraph_latch_score_max);
  addRepair(lists, 'small_circle_breath_score', (f.small_circle_breath_score ?? 0) <= thresholds.small_circle_breath_score_max);
  const status = lists.failed.length ? 'blocked' : lists.repair.length ? 'repair_required' : 'pass';
  return Object.freeze({
    ...decision,
    status,
    passed_thresholds: Object.freeze(unique(lists.passed)),
    failed_thresholds: Object.freeze(unique(lists.failed)),
    repair_thresholds: Object.freeze(unique(lists.repair)),
    block_reasons: Object.freeze(unique(lists.failed))
  });
}
