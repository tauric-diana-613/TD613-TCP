import { stableStringify, sha256Text } from './hush-customizer-packet.js';

export const HUSH_ANTI_SLOP_AUDIT_SCHEMA = 'td613.hush.phase8.anti-slop-audit/v1';

const GENERIC_TRANSITIONS = /\b(furthermore|moreover|in conclusion|overall|ultimately|it is important to note|this highlights|this underscores|additionally|in summary)\b/iu;
const HELPER_VOICE = /\b(i hope this helps|here is a polished|certainly|of course|as an ai|let me know if|happy to help)\b/iu;
const OVER_POLISHED = /\b(clear and concise|professional tone|streamlined|polished|well-structured|compelling narrative)\b/iu;

function text(value) { return String(value || ''); }
function words(value) { return (text(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length; }
function sentences(value) { return text(value).split(/[.!?]+/u).map((part) => part.trim()).filter(Boolean); }
function clamp(value) { return Math.max(0, Math.min(1, Number(value.toFixed(3)))); }
function asArray(value) { return Array.isArray(value) ? value : []; }
async function hashObject(value) { return sha256Text(stableStringify(value == null ? null : value)); }

function monotonyScore(candidate = '') {
  const lens = sentences(candidate).map(words).filter(Boolean);
  if (lens.length < 3) return 0.1;
  const avg = lens.reduce((a, b) => a + b, 0) / lens.length;
  const variance = lens.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lens.length;
  return clamp(1 / (1 + variance));
}

function punctuationTooPerfect(candidate = '') {
  const value = text(candidate);
  const comma = (value.match(/,/g) || []).length;
  const period = (value.match(/\./g) || []).length;
  if (!value) return 0;
  if (period >= 3 && comma === 0) return 0.7;
  return clamp((period + comma) / Math.max(words(value), 1));
}

export async function runMaskAntiSlopAudit(candidate = '', calibration = {}, maskRecord = {}, options = {}) {
  const value = text(candidate || options.candidate_summary || options.redactedCandidateSummary || '');
  const candidateHash = value ? await sha256Text(value) : null;
  const flags = [];
  const transitionScore = GENERIC_TRANSITIONS.test(value) ? 0.8 : 0.1;
  const helperScore = HELPER_VOICE.test(value) ? 0.9 : 0.05;
  const polishScore = OVER_POLISHED.test(value) ? 0.75 : 0.1;
  const symmetry = monotonyScore(value);
  const punctuation = punctuationTooPerfect(value);
  const sourcePressure = options.source_pressure_score ?? (value ? 0.72 : 0.5);
  const maskBreath = options.mask_breath_score ?? (value ? 0.7 : 0.55);
  const sampleReuseRisk = options.sample_reuse_risk ?? 0;
  const factualDamageRisk = options.factual_damage_risk ?? 0;
  if (helperScore > 0.7) flags.push('generic_helper_voice');
  if (polishScore > 0.7) flags.push('over_polished');
  if (transitionScore > 0.7) flags.push('transition_blandness');
  if (symmetry > 0.65) flags.push('symmetry_pressure_high');
  if (punctuation > 0.45) flags.push('too_perfect_punctuation');
  if (sourcePressure < 0.45) flags.push('source_pressure_low');
  if (maskBreath < 0.45) flags.push('mask_breath_low');
  if (sampleReuseRisk > 0.65) flags.push('sample_seed_reuse_risk');
  if (factualDamageRisk > 0.4) flags.push('factual_damage_risk');
  if (flags.length === 0 && value && asArray(calibration.prompt_bench).length) flags.push('candidate_material_only');
  const blocking = ['sample_seed_reuse_risk', 'factual_damage_risk', 'generic_helper_voice'].some((flag) => flags.includes(flag));
  const status = blocking ? 'blocked' : flags.length > 1 ? 'warning' : 'passed';
  const audit = {
    schema: HUSH_ANTI_SLOP_AUDIT_SCHEMA,
    status,
    candidate_material_only: true,
    candidate_text_included: false,
    candidate_hash_sha256: candidateHash,
    flags: Object.freeze(flags),
    api_sheen_score: clamp(Math.max(transitionScore, helperScore, polishScore)),
    symmetry_pressure: symmetry,
    generic_helper_voice: helperScore,
    source_pressure_score: clamp(sourcePressure),
    mask_breath_score: clamp(maskBreath),
    imperfection_budget_used: options.imperfection_budget_used ?? 0.5,
    sample_reuse_risk: clamp(sampleReuseRisk),
    factual_damage_risk: clamp(factualDamageRisk),
    repair_notes: Object.freeze(blocking ? ['candidate requires repair before packet sealing'] : flags.length > 1 ? ['review candidate texture before use'] : [])
  };
  return Object.freeze({ ...audit, anti_slop_hash_sha256: await hashObject(audit) });
}
