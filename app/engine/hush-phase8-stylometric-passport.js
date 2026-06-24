import { stableStringify, sha256Text } from './hush-customizer-packet.js';
import { buildMaskCentroid, buildGenericAIBaseline } from './hush-stylometric-feature-vector.js';
import { PHASE8_UNIVERSAL_THRESHOLDS, GLITCHING_PIXIE_THRESHOLDS, KEISHA_SOFT_CIRCLE_THRESHOLDS, CRYO_CRISTIANO_THRESHOLDS, REX_FRACTURA_THRESHOLDS } from './hush-phase8-numeric-decision.js';
import { RECEIPTS_QUEENIE_THRESHOLDS, RECEIPTS_QUEENIE_CADENCE_HEATMAP, buildReceiptsQueenieCentroid, isReceiptsQueenieRecord } from './hush-phase8-receipts-queenie.js';
import { SOL_STRATIGRAPHIX_THRESHOLDS, SOL_STRATIGRAPHIX_CADENCE_HEATMAP, buildSolStratigraphixCentroid, isSolStratigraphixRecord } from './hush-phase8-sol-stratigraphix.js';
import { HARBOR_ZORA_THRESHOLDS, HARBOR_ZORA_CADENCE_HEATMAP, buildHarborZoraCentroid, isHarborZoraRecord } from './hush-phase8-harbor-zora.js';
import { NOLAN_NEEDLER_THRESHOLDS, NOLAN_NEEDLER_CADENCE_HEATMAP, buildNolanNeedlerCentroid, isNolanNeedlerRecord } from './hush-phase8-nolan-needler.js';
import { BLOOPING_BLIP_THRESHOLDS, BLOOPING_BLIP_CADENCE_HEATMAP, buildBloopingBlipCentroid, isBloopingBlipRecord } from './hush-phase8-blooping-blip.js';
import { calibrateQueenieThresholds } from './hush-phase8-qs-calibration-hotfix.js';

export const HUSH_STYLOMETRIC_PASSPORT_SCHEMA = 'td613.hush.phase8.stylometric-passport/v1';
export const HUSH_ONTOLOGY_BINDINGS_SCHEMA = 'td613.hush.phase8.ontology-bindings/v1';

function asArray(value) { return Array.isArray(value) ? value : []; }
async function hashObject(value) { return sha256Text(stableStringify(value == null ? null : value)); }
function thresholdFor(maskRecord = {}) {
  if (isBloopingBlipRecord(maskRecord)) return BLOOPING_BLIP_THRESHOLDS;
  if (isNolanNeedlerRecord(maskRecord)) return NOLAN_NEEDLER_THRESHOLDS;
  if (isHarborZoraRecord(maskRecord)) return HARBOR_ZORA_THRESHOLDS;
  if (isSolStratigraphixRecord(maskRecord)) return SOL_STRATIGRAPHIX_THRESHOLDS;
  if (isReceiptsQueenieRecord(maskRecord)) return calibrateQueenieThresholds(RECEIPTS_QUEENIE_THRESHOLDS);
  if (maskRecord.mask_id === 'phase22-jagged-record') return REX_FRACTURA_THRESHOLDS;
  if (maskRecord.mask_id === 'night-shift-note') return CRYO_CRISTIANO_THRESHOLDS;
  if (maskRecord.mask_id === 'group-chat-soft') return KEISHA_SOFT_CIRCLE_THRESHOLDS;
  if (maskRecord.mask_id === 'phase28-transform-to-chatspeak') return GLITCHING_PIXIE_THRESHOLDS;
  return PHASE8_UNIVERSAL_THRESHOLDS;
}
function roleForPassport(maskRecord = {}) {
  if (isBloopingBlipRecord(maskRecord)) return 'hyperchat_custody';
  if (isNolanNeedlerRecord(maskRecord)) return 'low_heat_edge';
  if (isHarborZoraRecord(maskRecord)) return 'source_register';
  if (isSolStratigraphixRecord(maskRecord)) return 'document_distance';
  if (isReceiptsQueenieRecord(maskRecord)) return 'warm_receipts';
  if (maskRecord.mask_id === 'phase22-jagged-record') return 'adversarial_fracture';
  if (maskRecord.mask_id === 'night-shift-note') return 'quick_handoff';
  if (maskRecord.mask_id === 'group-chat-soft') return 'small circle';
  return maskRecord.intended_role || maskRecord.gallery_role || maskRecord.family || null;
}
function heatmapFor(maskRecord = {}, role = null) {
  if (role === 'hyperchat_custody' && isBloopingBlipRecord(maskRecord)) return BLOOPING_BLIP_CADENCE_HEATMAP;
  if (role === 'low_heat_edge' && isNolanNeedlerRecord(maskRecord)) return NOLAN_NEEDLER_CADENCE_HEATMAP;
  if (role === 'source_register' && isHarborZoraRecord(maskRecord)) return HARBOR_ZORA_CADENCE_HEATMAP;
  if (role === 'document_distance' && isSolStratigraphixRecord(maskRecord)) return SOL_STRATIGRAPHIX_CADENCE_HEATMAP;
  if (role === 'warm_receipts') return RECEIPTS_QUEENIE_CADENCE_HEATMAP;
  return null;
}

export function buildPhase8OntologyBindings(extra = {}) {
  return Object.freeze({
    schema: HUSH_ONTOLOGY_BINDINGS_SCHEMA,
    classes: Object.freeze(['MaskRegistryRecord', 'PerMaskPacket', 'StylometricPassport', 'MaskCentroid', 'GenericAIBaseline', 'CandidateRealization', 'SourceObligationSet', 'HumanImperfectionEnvelope', 'AntiSlopVector', 'SampleReuseVector', 'CollisionPosture', 'ClaimCeiling', 'PacketDecisionSurface', 'CandidatePresenceGate', 'EntrypointAssertion', ...asArray(extra.classes)]),
    relations: Object.freeze(['PerMaskPacket derivesFrom MaskRegistryRecord', 'PerMaskPacket contains StylometricPassport', 'StylometricPassport hasCentroid MaskCentroid', 'StylometricPassport comparesAgainst GenericAIBaseline', 'CandidateRealization mustSatisfy SourceObligationSet', 'CandidateRealization measuredAgainst MaskCentroid', 'CandidateRealization constrainedBy ClaimCeiling', 'PacketDecisionSurface acceptsIf NumericThresholdsPass', 'CandidatePresenceGate separates SourceText from CandidateText', ...asArray(extra.relations)]),
    forbidden_equivalences: Object.freeze(['stylometric_fit != identity_proof', 'mask_breath != authorship_proof', 'human_irregularity != consent', 'candidate_pass != public_release_permission', 'source_text != candidate_text', 'source_obligation_set != candidate_realization', 'candidate_hash != source_hash', 'candidate_presence != source_presence', ...asArray(extra.forbidden_equivalences)])
  });
}

export async function buildStylometricPassport(maskRecord = {}, options = {}) {
  const thresholds = Object.freeze({ ...thresholdFor(maskRecord), ...(options.thresholds || {}) });
  const role = roleForPassport(maskRecord);
  const centroidRecord = { ...maskRecord, gallery_role: role, intended_role: role };
  const maskCentroid = role === 'hyperchat_custody' && isBloopingBlipRecord(maskRecord)
    ? await buildBloopingBlipCentroid(centroidRecord, options.calibrationSamples || [])
    : role === 'low_heat_edge' && isNolanNeedlerRecord(maskRecord)
      ? await buildNolanNeedlerCentroid(centroidRecord, options.calibrationSamples || [])
      : role === 'source_register' && isHarborZoraRecord(maskRecord)
        ? await buildHarborZoraCentroid(centroidRecord, options.calibrationSamples || [])
        : role === 'document_distance' && isSolStratigraphixRecord(maskRecord)
          ? await buildSolStratigraphixCentroid(centroidRecord, options.calibrationSamples || [])
          : role === 'warm_receipts'
            ? await buildReceiptsQueenieCentroid(centroidRecord, options.calibrationSamples || [])
            : await buildMaskCentroid(centroidRecord, options.calibrationSamples || []);
  const genericBaseline = await buildGenericAIBaseline(options.genericFixtures || []);
  const featureWeights = Object.freeze({ source_custody: 0.24, mask_fit: 0.2, generic_distance: 0.16, anti_slop: 0.16, human_irregularity: 0.14, sample_reuse: 0.1 });
  const minimumEvidence = Object.freeze({ registry_record_hash_required: true, source_file_required: true, source_index_required: true, raw_sample_text_allowed: false, candidate_text_stored: false, candidate_presence_gate_required: true, numeric_decision_required: true });
  const passport = {
    schema: HUSH_STYLOMETRIC_PASSPORT_SCHEMA,
    metric_set_version: 'hush-authorship-sciences-core/v1',
    passport_tag: 'phase8-hard-metric-passport/v1',
    mask_id: maskRecord.mask_id || null,
    role,
    mask_centroid: maskCentroid,
    generic_ai_baseline: genericBaseline,
    tolerance_bands: thresholds,
    cadence_heatmap: heatmapFor(maskRecord, role),
    feature_weights: featureWeights,
    minimum_evidence: minimumEvidence,
    limitations: Object.freeze(['numeric passport measures packet admissibility only', 'no civil identity conclusion', 'no public release authority'])
  };
  return Object.freeze({ ...passport, passport_hash_sha256: await hashObject(passport) });
}
