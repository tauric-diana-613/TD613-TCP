import { buildSafeHarborLaneProfile, buildSafeHarborRichDivergence } from './safe-harbor-rich-stylometry-adapter.js';
import { stableCanonicalJson } from './safe-harbor-stylometry-v3.js';

const LANES = ['future_self', 'past_self', 'higher_self'];
const CHALLENGE_SCHEMA = 'td613.safe-harbor.recall-challenge/v1';
const SCALAR_FIELDS = ['contentWordComplexity', 'modifierDensity', 'hedgeDensity', 'abstractionPosture', 'directness', 'latinatePreference', 'abbreviationDensity', 'orthographicLooseness', 'fragmentPressure', 'conversationalPosture', 'syntacticBranchingDepth', 'structuralFriction', 'lexicalEntropyScore', 'characterEntropyBits', 'tokenEntropyBits', 'transitionVariance', 'acousticWeight'];

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function compactProfile(profile = {}) {
  const out = {
    wordCount: Number(profile.wordCount || 0),
    sentenceCount: Number(profile.sentenceCount || 0),
    avgSentenceLength: Number(Number(profile.avgSentenceLength || 0).toFixed(4)),
    registerMode: String(profile.registerMode || '')
  };
  for (const key of SCALAR_FIELDS) out[key] = Number(Number(profile[key] || 0).toFixed(4));
  out.surfaceMarkerProfile = clone(profile.surfaceMarkerProfile || {});
  out.functionWordProfile = clone(profile.functionWordProfile || {});
  out.wordLengthProfile = clone(profile.wordLengthProfile || {});
  out.charTrigramProfile = Object.fromEntries(Object.entries(profile.charTrigramProfile || {}).filter(([, value]) => Number(value || 0) > 0).sort((left, right) => Number(right[1] || 0) - Number(left[1] || 0)).slice(0, 64));
  return out;
}
async function sha256Hex(text) {
  const value = String(text || '');
  if (globalThis.crypto && globalThis.crypto.subtle && globalThis.TextEncoder) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  const nodeCrypto = await import('node:crypto');
  return nodeCrypto.createHash('sha256').update(value).digest('hex');
}
function distributionDistance(a = {}, b = {}) {
  const keys = [...new Set([...Object.keys(a || {}), ...Object.keys(b || {})])];
  if (!keys.length) return 0;
  const sumA = keys.reduce((sum, key) => sum + Number(a[key] || 0), 0) || 1;
  const sumB = keys.reduce((sum, key) => sum + Number(b[key] || 0), 0) || 1;
  let js = 0;
  for (const key of keys) {
    const p = Number(a[key] || 0) / sumA;
    const q = Number(b[key] || 0) / sumB;
    const m = (p + q) / 2;
    if (p > 0) js += 0.5 * p * Math.log2(p / m);
    if (q > 0) js += 0.5 * q * Math.log2(q / m);
  }
  return Number(Math.max(0, Math.min(1, Math.sqrt(js))).toFixed(4));
}
function laneDistance(stored = {}, fresh = {}) {
  const scalarDeltas = SCALAR_FIELDS.map((key) => ({ key, delta: Number(Math.abs(Number(stored[key] || 0) - Number(fresh[key] || 0)).toFixed(4)) }));
  const scalarMean = scalarDeltas.reduce((sum, item) => sum + Math.min(1, item.delta), 0) / Math.max(scalarDeltas.length, 1);
  const distributions = [['surfaceMarkerProfile', distributionDistance(stored.surfaceMarkerProfile, fresh.surfaceMarkerProfile)], ['functionWordProfile', distributionDistance(stored.functionWordProfile, fresh.functionWordProfile)], ['wordLengthProfile', distributionDistance(stored.wordLengthProfile, fresh.wordLengthProfile)], ['charTrigramProfile', distributionDistance(stored.charTrigramProfile, fresh.charTrigramProfile)]].map(([key, delta]) => ({ key, delta }));
  const distributionMean = distributions.reduce((sum, item) => sum + item.delta, 0) / Math.max(distributions.length, 1);
  const registerShift = stored.registerMode && fresh.registerMode && stored.registerMode !== fresh.registerMode ? 1 : 0;
  const compositeDistance = Number(((scalarMean * 0.52) + (distributionMean * 0.38) + (registerShift * 0.10)).toFixed(4));
  const drift_axes = scalarDeltas.concat(distributions).sort((a, b) => b.delta - a.delta).slice(0, 6).filter((item) => item.delta >= 0.12).map((item) => ({ key: item.key, delta: item.delta }));
  return { compositeDistance, scalarMean: Number(scalarMean.toFixed(4)), distributionMean: Number(distributionMean.toFixed(4)), registerShift, drift_axes };
}
function storedLaneProfiles(packet) {
  const signatures = packet && packet.analysis && packet.analysis.segment_cadence_signatures;
  if (!signatures || typeof signatures !== 'object') return null;
  const profiles = {};
  for (const key of LANES) {
    const lane = signatures[key];
    if (!lane || !lane.rich_profile || typeof lane.rich_profile !== 'object') return null;
    profiles[key] = lane.rich_profile;
  }
  return profiles;
}
export async function buildRecallChallengeProfile(texts = {}) {
  const perLaneProfiles = {};
  for (const key of LANES) perLaneProfiles[key] = compactProfile(buildSafeHarborLaneProfile(key, String(texts[key] || ''), { compactCharTrigrams: true, maxCharTrigrams: 64 }));
  const profileOnly = { lanes: perLaneProfiles, cross_lane_divergence: clone(buildSafeHarborRichDivergence(perLaneProfiles)) };
  return Object.freeze({ schema_version: CHALLENGE_SCHEMA, mode: 'triad-fresh-sample', raw_text_retained: false, profile_only: true, fresh_profile_hash: 'sha256:' + await sha256Hex(stableCanonicalJson(profileOnly)), lanes: profileOnly.lanes, cross_lane_divergence: profileOnly.cross_lane_divergence });
}
export function compareRecallChallengeToPacket(packet, challengeProfile) {
  const stored = storedLaneProfiles(packet);
  if (!stored) return Object.freeze({ continuity_score_v3: 0, continuity_band: 'fail', drift_axes: [{ key: 'native-rich-profile', delta: 1 }], lane_results: {} });
  const fresh = challengeProfile && challengeProfile.lanes ? challengeProfile.lanes : {};
  const lane_results = {};
  const drift_axes = [];
  let distanceSum = 0;
  for (const key of LANES) {
    const result = laneDistance(stored[key], fresh[key] || {});
    lane_results[key] = result;
    distanceSum += result.compositeDistance;
    result.drift_axes.forEach((axis) => drift_axes.push({ lane: key, key: axis.key, delta: axis.delta }));
  }
  const continuity = Number(Math.max(0, Math.min(1, 1 - (distanceSum / LANES.length))).toFixed(4));
  const band = continuity >= 0.72 ? 'pass' : continuity >= 0.52 ? 'review' : 'fail';
  return Object.freeze({ continuity_score_v3: continuity, continuity_band: band, drift_axes: drift_axes.sort((a, b) => b.delta - a.delta).slice(0, 12), lane_results });
}
export function buildRecallChallengeReceipt(packet, challengeProfile) {
  const comparison = compareRecallChallengeToPacket(packet, challengeProfile);
  const issuance = packet && packet.issuance ? packet.issuance : {};
  const v3 = issuance.v3 || {};
  return Object.freeze({ schema_version: CHALLENGE_SCHEMA, mode: 'triad-fresh-sample', raw_text_retained: false, profile_only: true, badge_number: issuance.badge_number || null, badge_number_v3: v3.badge_number_v3 || null, fresh_profile_hash: challengeProfile && challengeProfile.fresh_profile_hash ? challengeProfile.fresh_profile_hash : null, continuity_score_v3: comparison.continuity_score_v3, continuity_band: comparison.continuity_band, drift_axes: comparison.drift_axes, recommended_action: comparison.continuity_band === 'pass' ? 'continue-dual-recall' : comparison.continuity_band === 'review' ? 'operator-review' : 'block-recall' });
}
if (typeof window !== 'undefined') {
  window.TD613_SAFE_HARBOR_RECALL_CHALLENGE = Object.freeze({ buildRecallChallengeProfile, compareRecallChallengeToPacket, buildRecallChallengeReceipt });
  window.dispatchEvent(new CustomEvent('td613:safe-harbor:recall-challenge-ready', { detail: { version: CHALLENGE_SCHEMA } }));
}
