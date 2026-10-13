import { stableCanonicalJson } from './safe-harbor-stylometry-v3.js';
import { buildStage2AuthorshipMaturity } from './safe-harbor-gen3-authorship-maturity.js';

export const STAGE2_CONTROL_SCHEMA = 'td613.safe-harbor.stage2-control-receipt/v1';
export const STAGE2_CONTROL_POLICY = 'td613.safe-harbor.stage2-null-adversarial-policy/v1';

const LANES = Object.freeze(['future_self', 'past_self', 'higher_self']);
const FAMILY_ORDER = Object.freeze([
  'sentence_rhythm',
  'lexical_shape',
  'function_word_routing',
  'punctuation_boundary',
  'structural_transition'
]);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function round(value, places = 6) {
  const number = Number(value);
  return Number.isFinite(number) ? Number(number.toFixed(places)) : 0;
}

function average(values = []) {
  const finite = values.map(Number).filter(Number.isFinite);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

async function sha256Hex(input) {
  const source = String(input || '');
  if (globalThis.crypto?.subtle && globalThis.TextEncoder) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  const crypto = await import('node:crypto');
  return crypto.createHash('sha256').update(source).digest('hex');
}

async function digest(value) {
  return `sha256:${await sha256Hex(typeof value === 'string' ? value : stableCanonicalJson(value))}`;
}

function numericLeaves(value, prefix = '', target = {}) {
  if (Number.isFinite(value)) {
    target[prefix] = Number(value);
    return target;
  }
  if (!isObject(value)) return target;
  for (const key of Object.keys(value).sort()) {
    const next = prefix ? `${prefix}.${key}` : key;
    numericLeaves(value[key], next, target);
  }
  return target;
}

function vectorDistance(left = {}, right = {}) {
  const keys = Array.from(new Set([...Object.keys(left), ...Object.keys(right)])).sort();
  if (!keys.length) return 0;
  const distances = keys.map((key) => {
    const a = Number(left[key] || 0);
    const b = Number(right[key] || 0);
    const scale = Math.max(1, Math.abs(a), Math.abs(b));
    return Math.min(1, Math.abs(a - b) / scale);
  });
  return round(average(distances));
}

function transitionVector(windows = []) {
  const vectors = windows.map((window) => numericLeaves(window?.features || {}));
  const out = {};
  for (let index = 1; index < vectors.length; index += 1) {
    const keys = Array.from(new Set([...Object.keys(vectors[index - 1]), ...Object.keys(vectors[index])])).sort();
    for (const key of keys) out[`t${index}:${key}`] = round((vectors[index][key] || 0) - (vectors[index - 1][key] || 0));
  }
  return out;
}

function shuffledWindows(windows = []) {
  if (windows.length >= 3) return [windows[2], windows[0], windows[1], ...windows.slice(3)];
  return windows.slice().reverse();
}

function chronologyDestruction(stage2 = {}) {
  const lanes = {};
  for (const lane of LANES) {
    const windows = stage2?.lane_analyses?.[lane]?.local_windows || [];
    const original = transitionVector(windows);
    const shuffled = transitionVector(shuffledWindows(windows));
    const separation = vectorDistance(original, shuffled);
    lanes[lane] = {
      status: windows.length >= 3 ? 'measured' : 'insufficient-evidence',
      local_window_count: windows.length,
      normalized_separation: windows.length >= 3 ? separation : null,
      authority: windows.length < 3
        ? 'insufficient-evidence'
        : separation >= 0.08
          ? 'chronology-sensitive-candidate'
          : 'chronology-non-diagnostic',
      rule: 'Equivalent or near-equivalent shuffled chronology reduces dynamic-signature authority.',
      raw_text_included: false
    };
  }
  const measured = Object.values(lanes).filter((lane) => lane.status === 'measured');
  const nonDiagnostic = measured.filter((lane) => lane.authority === 'chronology-non-diagnostic').length;
  return {
    schema_version: 'td613.safe-harbor.chronology-destruction-null/v1',
    lanes,
    chronology_claimed: false,
    dynamic_signature_authority: !measured.length
      ? 'insufficient-evidence'
      : nonDiagnostic === measured.length
        ? 'reduced'
        : 'candidate-only',
    adverse_results_preserved: true,
    raw_text_included: false
  };
}

function familyScoreMap(stage2 = {}) {
  const map = {};
  for (const lane of LANES) {
    const families = stage2?.within_lane_invariants?.[lane]?.feature_families || {};
    for (const family of FAMILY_ORDER) map[`${lane}:${family}`] = Number.isFinite(families[family]?.score) ? families[family].score : null;
  }
  const cross = stage2?.cross_lane_invariants?.feature_families || {};
  for (const family of FAMILY_ORDER) map[`cross_lane:${family}`] = Number.isFinite(cross[family]?.score) ? cross[family].score : null;
  return map;
}

function compareProfiles(left = {}, right = {}) {
  const leftScores = familyScoreMap(left);
  const rightScores = familyScoreMap(right);
  const keys = Array.from(new Set([...Object.keys(leftScores), ...Object.keys(rightScores)])).sort();
  const compared = keys.filter((key) => Number.isFinite(leftScores[key]) && Number.isFinite(rightScores[key]));
  const distance = compared.length
    ? average(compared.map((key) => Math.min(1, Math.abs(leftScores[key] - rightScores[key]))))
    : null;
  const stateAgreement = compared.length
    ? average(compared.map((key) => {
      const [lane, family] = key.includes(':') ? key.split(':') : ['cross_lane', key];
      const leftState = lane === 'cross_lane'
        ? left?.cross_lane_invariants?.feature_families?.[family]?.state
        : left?.within_lane_invariants?.[lane]?.feature_families?.[family]?.state;
      const rightState = lane === 'cross_lane'
        ? right?.cross_lane_invariants?.feature_families?.[family]?.state
        : right?.within_lane_invariants?.[lane]?.feature_families?.[family]?.state;
      return leftState && leftState === rightState ? 1 : 0;
    }))
    : null;
  return {
    status: compared.length ? 'measured' : 'insufficient-control',
    compared_feature_families: compared.length,
    normalized_distance: Number.isFinite(distance) ? round(distance) : null,
    normalized_similarity: Number.isFinite(distance) ? round(1 - distance) : null,
    state_agreement: Number.isFinite(stateAgreement) ? round(stateAgreement) : null,
    raw_text_included: false
  };
}

function profileHasSufficientField(stage2 = {}) {
  return ['mature', 'comparative-with-instability', 'comparative', 'provisional'].includes(stage2?.stability_receipt?.status);
}

async function promptOnlyControl(packet, stage2, context = {}) {
  const promptSegments = context.promptControlSegments || context.promptTextsByLane || {};
  const available = LANES.every((lane) => typeof promptSegments[lane] === 'string' && promptSegments[lane].trim());
  if (!available) {
    return {
      schema_version: 'td613.safe-harbor.prompt-only-control/v1',
      status: 'not-provided',
      collision_state: 'not-assessed',
      comparison: null,
      raw_text_included: false
    };
  }
  const promptProfile = await buildStage2AuthorshipMaturity(packet, {
    segments: promptSegments,
    promptVocabularyByLane: {}
  });
  const comparison = compareProfiles(stage2, promptProfile);
  const controlSufficient = profileHasSufficientField(promptProfile);
  const collision = controlSufficient && comparison.status === 'measured' && comparison.normalized_similarity >= 0.98;
  return {
    schema_version: 'td613.safe-harbor.prompt-only-control/v1',
    status: controlSufficient ? 'measured' : 'insufficient-control',
    control_maturity_state: promptProfile?.stability_receipt?.maturity_state || 'unavailable',
    comparison,
    collision_state: collision ? 'prompt-only-collision' : controlSufficient ? 'separated' : 'not-assessed',
    control_digest: await digest({
      maturity_state: promptProfile?.stability_receipt?.maturity_state || null,
      stability_digest: promptProfile?.stability_receipt?.stability_digest || null,
      comparison
    }),
    adverse_results_preserved: true,
    raw_text_included: false
  };
}

async function suppliedControlComparisons(stage2, controlProfiles = {}) {
  const results = {};
  for (const controlId of Object.keys(controlProfiles || {}).sort()) {
    const supplied = controlProfiles[controlId];
    const profile = supplied?.profile || supplied?.authorship_maturity || supplied;
    const comparison = isObject(profile) ? compareProfiles(stage2, profile) : {
      status: 'insufficient-control',
      compared_feature_families: 0,
      normalized_distance: null,
      normalized_similarity: null,
      state_agreement: null,
      raw_text_included: false
    };
    results[controlId] = {
      control_class: supplied?.control_class || 'declared-control',
      provenance: supplied?.provenance || 'declared-synthetic-or-consented-control',
      comparison,
      collision_state: comparison.status === 'measured' && comparison.normalized_similarity >= 0.98
        ? 'collision-candidate'
        : comparison.status === 'measured'
          ? 'separated'
          : 'not-assessed',
      adverse_result_preserved: true,
      raw_text_included: false
    };
  }
  return results;
}

function antiSamenessAudit(stage2 = {}) {
  const laneSignatures = {};
  for (const lane of LANES) {
    laneSignatures[lane] = (stage2?.lane_analyses?.[lane]?.local_windows || []).map((window) => window.feature_digest || null);
  }
  const exactLaneDuplicate = new Set(Object.values(laneSignatures).map((value) => stableCanonicalJson(value))).size === 1;
  const crossScores = Object.values(stage2?.cross_lane_invariants?.feature_families || {})
    .map((record) => record?.score)
    .filter(Number.isFinite);
  const meanCross = crossScores.length ? round(average(crossScores)) : null;
  return {
    schema_version: 'td613.safe-harbor.stage2-anti-sameness-audit/v1',
    status: exactLaneDuplicate || (Number.isFinite(meanCross) && meanCross >= 0.995) ? 'review-required' : 'pass',
    exact_lane_feature_digest_duplicate: exactLaneDuplicate,
    mean_cross_lane_similarity: meanCross,
    rule: 'Near-perfect sameness across elicitation lanes reduces authority and triggers calibration review.',
    raw_text_included: false
  };
}

export function auditEntrantSwapProfiles(current = {}, alternate = {}) {
  const comparison = compareProfiles(current, alternate);
  const collision = comparison.status === 'measured' && comparison.normalized_similarity >= 0.98;
  return {
    schema_version: 'td613.safe-harbor.entrant-swap-audit/v1',
    status: comparison.status === 'measured' ? (collision ? 'collision' : 'pass') : 'insufficient-control',
    comparison,
    rule: 'A recurrence profile that survives entrant substitution without material change loses interpretive authority.',
    adverse_result_preserved: true,
    raw_text_included: false
  };
}

async function entrantSwapControl(stage2, context = {}) {
  const supplied = context.entrantSwapProfile?.profile || context.entrantSwapProfile?.authorship_maturity || context.entrantSwapProfile;
  if (!isObject(supplied)) {
    return {
      schema_version: 'td613.safe-harbor.entrant-swap-audit/v1',
      status: 'not-provided',
      comparison: null,
      rule: 'A recurrence profile that survives entrant substitution without material change loses interpretive authority.',
      adverse_result_preserved: true,
      raw_text_included: false
    };
  }
  return auditEntrantSwapProfiles(stage2, supplied);
}

export async function buildStage2ControlReceipt(packet = {}, stage2 = {}, context = {}) {
  const chronology = chronologyDestruction(stage2);
  const promptOnly = await promptOnlyControl(packet, stage2, context);
  const suppliedControls = await suppliedControlComparisons(stage2, context.controlProfiles || {});
  const antiSameness = antiSamenessAudit(stage2);
  const entrantSwap = await entrantSwapControl(stage2, context);
  const core = {
    schema_version: STAGE2_CONTROL_SCHEMA,
    policy_version: STAGE2_CONTROL_POLICY,
    chronology_destruction: chronology,
    prompt_only_control: promptOnly,
    supplied_controls: suppliedControls,
    anti_sameness_audit: antiSameness,
    entrant_swap_audit: entrantSwap,
    model_dependent: false,
    psychological_inference_performed: false,
    demographic_inference_performed: false,
    external_identity_data_consumed: false,
    adverse_results_preserved: true,
    raw_text_included: false
  };
  return {
    ...core,
    null_controls_digest: await digest(core)
  };
}

function controlBlockers(controlReceipt = {}) {
  const blockers = [];
  if (controlReceipt.prompt_only_control?.collision_state === 'prompt-only-collision') blockers.push('prompt-only-control-collision');
  if (controlReceipt.entrant_swap_audit?.status === 'collision') blockers.push('entrant-swap-collision');
  if (controlReceipt.anti_sameness_audit?.status === 'review-required') blockers.push('cross-lane-sameness-review');
  for (const [controlId, result] of Object.entries(controlReceipt.supplied_controls || {})) {
    if (result.collision_state === 'collision-candidate') blockers.push(`declared-control-collision:${controlId}`);
  }
  return blockers;
}

export async function buildControlledStage2AuthorshipMaturity(packet = {}, context = {}) {
  const stage2 = await buildStage2AuthorshipMaturity(packet, context);
  const controls = await buildStage2ControlReceipt(packet, stage2, context);
  const blockers = controlBlockers(controls);
  const receipt = clone(stage2.stability_receipt || {});
  const preControlDigest = receipt.stability_digest || null;
  receipt.blockers = Array.from(new Set([...(receipt.blockers || []), ...blockers]));
  receipt.pre_control_stability_digest = preControlDigest;
  receipt.null_controls_digest = controls.null_controls_digest;
  receipt.control_blockers = blockers;
  delete receipt.stability_digest;
  receipt.stability_digest = await digest(receipt);
  stage2.stability_receipt = receipt;
  stage2.null_and_adversarial_posture = {
    ...(stage2.null_and_adversarial_posture || {}),
    control_receipt: controls,
    prompt_only_control_executed: controls.prompt_only_control.status !== 'not-provided',
    chronology_destruction_executed: true,
    supplied_control_count: Object.keys(controls.supplied_controls || {}).length,
    adverse_results_preserved: true,
    chronology_claimed: false,
    external_identity_data_consumed: false,
    raw_text_exported: false
  };
  stage2.bounded_interpretation = clone(stage2.bounded_interpretation || {});
  stage2.bounded_interpretation.uncertainty = Array.from(new Set([
    ...(stage2.bounded_interpretation.uncertainty || []),
    ...blockers,
    controls.chronology_destruction.dynamic_signature_authority === 'reduced'
      ? 'chronology-destruction-null-reduced-dynamic-signature-authority'
      : null
  ].filter(Boolean)));
  return stage2;
}

export async function applyControlledGen3Stage2Prehash(packet = {}, context = {}) {
  if (!isObject(packet) || packet.schema_version !== 'td613.safe-harbor.packet/v1') return packet;
  const out = clone(packet);
  const stage2 = await buildControlledStage2AuthorshipMaturity(out, context);
  out.authorship_evidence = isObject(out.authorship_evidence) ? out.authorship_evidence : {};
  out.authorship_evidence.checkpoint_snapshots = clone(stage2.checkpoint_snapshots);
  out.authorship_evidence.within_lane_invariants = clone(stage2.within_lane_invariants);
  out.authorship_evidence.cross_lane_invariants = clone(stage2.cross_lane_invariants);
  out.authorship_evidence.prompt_conditioned_features = clone(stage2.prompt_conditioned_features);
  out.authorship_evidence.stability_receipt = clone(stage2.stability_receipt);
  out.authorship_evidence.authorship_maturity = stage2;
  return out;
}

export function attachStage2ControlReport(packet = {}) {
  if (!isObject(packet) || !isObject(packet.forensic_authorship?.gen3_report_contract)) return packet;
  const out = clone(packet);
  const report = out.forensic_authorship.gen3_report_contract;
  const controls = out.authorship_evidence?.authorship_maturity?.null_and_adversarial_posture?.control_receipt;
  if (!isObject(controls)) return out;
  report.sections.evidentiary_fractures = isObject(report.sections.evidentiary_fractures)
    ? report.sections.evidentiary_fractures
    : { status: 'measured', content: { fractures: [] } };
  report.sections.evidentiary_fractures.content = isObject(report.sections.evidentiary_fractures.content)
    ? report.sections.evidentiary_fractures.content
    : { fractures: [] };
  const fractures = Array.isArray(report.sections.evidentiary_fractures.content.fractures)
    ? report.sections.evidentiary_fractures.content.fractures.slice()
    : [];
  if (controls.chronology_destruction?.dynamic_signature_authority === 'reduced') fractures.push('Chronology destruction remained non-diagnostic; dynamic-signature authority is reduced.');
  if (controls.prompt_only_control?.collision_state === 'prompt-only-collision') fractures.push('Prompt-only control collision is present.');
  if (controls.entrant_swap_audit?.status === 'collision') fractures.push('Entrant-swap collision is present.');
  if (controls.anti_sameness_audit?.status === 'review-required') fractures.push('Cross-lane sameness requires calibration review.');
  report.sections.evidentiary_fractures.content.fractures = Array.from(new Set(fractures));
  report.sections.evidentiary_fractures.content.stage2_control_receipt = clone(controls);
  report.interpretation_provenance = isObject(report.interpretation_provenance) ? report.interpretation_provenance : {};
  report.interpretation_provenance.null_controls_digest = controls.null_controls_digest || null;
  report.interpretation_provenance.adverse_results_preserved = true;
  report.interpretation_provenance.dynamic_signature_authority = controls.chronology_destruction?.dynamic_signature_authority || 'unavailable';
  report.interpretation_provenance.raw_text_consumed = false;
  return out;
}

export function controlledStage2ContainsRawText(value = {}) {
  const maturity = value?.authorship_evidence?.authorship_maturity || value;
  return /"(?:raw_text|source_text|entrant_text|window_text|prompt_text|text)"\s*:/u.test(stableCanonicalJson(maturity));
}
