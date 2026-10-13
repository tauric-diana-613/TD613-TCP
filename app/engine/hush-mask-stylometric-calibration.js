import { stableStringify, sha256Text } from './hush-customizer-packet.js';

export const HUSH_MASK_STYLOMETRIC_CALIBRATION_SCHEMA = 'td613.hush.phase8.stylometric-calibration/v1';
export const HUSH_HUMAN_IMPERFECTION_LEDGER_SCHEMA = 'td613.hush.phase8.human-imperfection-ledger/v1';

const BENCH_PROMPTS = Object.freeze([
  'factual_handoff',
  'warm_note_with_receipt',
  'rushed_record_fragment',
  'document_centered_note',
  'small_circle_message',
  'public_pseudonymous_note',
  'high_custody_checklist',
  'hedged_uncertainty',
  'compression_stress',
  'over_polish_trap'
]);

function asArray(value) { return Array.isArray(value) ? value : []; }
function text(value) { return String(value || ''); }
function lower(value) { return text(value).toLowerCase(); }
function wordCount(value) { return (text(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length; }
function ratio(numerator, denominator) { return denominator ? Number((numerator / denominator).toFixed(4)) : 0; }
async function hashObject(value) { return sha256Text(stableStringify(value == null ? null : value)); }

function inferCompression(record = {}) {
  const role = lower(record.gallery_role || record.intended_role);
  const family = lower(record.family || '');
  if (role.includes('checklist')) return 'structured';
  if (role.includes('low_signature') || family.includes('minimal')) return 'high';
  if (role.includes('shorthand') || family.includes('chat')) return 'medium-high';
  if (role.includes('document')) return 'medium';
  return 'medium-low';
}

function inferWarmth(record = {}) {
  const family = lower(record.family || '');
  const intended = lower(record.intended_use || '');
  if (family.includes('warm') || intended.includes('warm')) return 'high';
  if (family.includes('low signature') || family.includes('checklist') || family.includes('document')) return 'low';
  if (family.includes('small circle') || family.includes('chat')) return 'medium';
  return 'medium-low';
}

function inferOrnament(record = {}) {
  const role = lower(record.gallery_role || record.intended_role || '');
  const family = lower(record.family || '');
  if (role.includes('document') || role.includes('checklist') || family.includes('low signature')) return 'low';
  if (family.includes('strange') || family.includes('low heat') || family.includes('target register')) return 'medium';
  return 'low-medium';
}

function cadenceProfile(record = {}) {
  const words = record.profile_evidence?.word_count || 0;
  const role = record.gallery_role || record.intended_role || 'baseline';
  return Object.freeze({
    sentence_length_distribution: role === 'checklist' ? 'short-structured' : role === 'shorthand' ? 'short-to-mid-compressed' : role === 'document_distance' ? 'mid-cool' : 'varied-mid',
    punctuation_density: role === 'checklist' ? 'bounded-high' : role === 'shorthand' ? 'irregular-medium' : 'medium',
    contraction_density: role === 'shorthand' || role === 'register' ? 'allowed' : 'low-to-medium',
    recurrence_pressure: 'low',
    lexical_density: words >= 40 ? 'strong-seed-signal' : words >= 8 ? 'usable-seed-signal' : 'thin-signal',
    modifier_density: inferOrnament(record),
    line_break_density: role === 'checklist' ? 'allowed' : 'low',
    lexical_entropy: 'bounded-variable',
    warmth_pressure: inferWarmth(record),
    ornament_pressure: inferOrnament(record),
    custody_pressure: 'high',
    compression_behavior: inferCompression(record),
    hedge_behavior: 'preserve-source-hedge',
    rhythm_irregularity: 'allowed-bounded',
    allowed_asymmetry: 'controlled',
    forbidden_flattening: true
  });
}

export async function buildPerMaskStylometricCalibration(maskRecord = {}, options = {}) {
  const profile = cadenceProfile(maskRecord);
  const calibration = {
    schema: HUSH_MASK_STYLOMETRIC_CALIBRATION_SCHEMA,
    calibration_status: options.blocked ? 'blocked' : maskRecord.profile_evidence?.profile_status === 'empty' ? 'warning' : 'passed',
    calibration_basis: 'phase7-registry-record-with-pattern-only-sample-policy',
    metric_set_version: 'hush-per-mask-calibration-core/v1',
    feature_profile_hash_sha256: null,
    cadence_profile: profile,
    distribution: Object.freeze({
      source_word_count: maskRecord.profile_evidence?.word_count || 0,
      warning_count: asArray(maskRecord.profile_evidence?.warnings).length,
      prompt_bench_count: BENCH_PROMPTS.length
    }),
    profile_targets: Object.freeze({
      family: maskRecord.family || null,
      gallery_role: maskRecord.gallery_role || maskRecord.intended_role || null,
      intended_use_hash_sha256: await sha256Text(maskRecord.intended_use || ''),
      risk_tell_hash_sha256: await sha256Text(maskRecord.risk_tell || '')
    }),
    prompt_bench: BENCH_PROMPTS,
    acceptance_bounds: Object.freeze({
      anti_slop_required: true,
      source_custody_required: true,
      sample_reuse_blocked: true,
      public_default_allowed: false,
      raw_sample_text_allowed: false,
      candidate_material_is_authority: false
    }),
    limitations: Object.freeze([
      'stylometric calibration governs transformation behavior only',
      'profile evidence remains pattern-level',
      'sample wording cannot be reused',
      'human review remains required for high-stakes mask use'
    ])
  };
  const featureHash = await hashObject({ cadence_profile: calibration.cadence_profile, distribution: calibration.distribution, profile_targets: calibration.profile_targets, prompt_bench: calibration.prompt_bench, acceptance_bounds: calibration.acceptance_bounds });
  return Object.freeze({ ...calibration, feature_profile_hash_sha256: featureHash });
}

export async function buildHumanImperfectionLedger(maskRecord = {}, calibration = {}) {
  const role = maskRecord.gallery_role || maskRecord.intended_role || 'baseline';
  const allowed = ['uneven sentence length', 'controlled fragment', 'non-uniform punctuation', 'local rhythm drift', 'source-hedge preservation', 'bounded relational pressure'];
  if (role === 'shorthand') allowed.push('occasional compression');
  if (role === 'document_distance') allowed.push('cool distance with restrained atmosphere');
  if (role === 'checklist') allowed.push('numbered structure with small human care marker');
  if (role === 'register') allowed.push('operator-selected register architecture under cultural review');
  const ledger = {
    schema: HUSH_HUMAN_IMPERFECTION_LEDGER_SCHEMA,
    imperfection_status: calibration.calibration_status === 'blocked' ? 'blocked' : 'passed',
    doctrine: 'imperfection is a controlled pressure signature, not random noise',
    allowed_asymmetries: Object.freeze(allowed),
    forbidden_noise: Object.freeze([
      'factual damage',
      'invented roughness',
      'fake dialect',
      'random typo seasoning',
      'source-unit deletion',
      'over-glitching',
      'over-casualization',
      'human cosplay',
      'stereotype texture',
      'overfitted catchphrase',
      'sample-seed phrase reuse'
    ]),
    breath_markers: Object.freeze(['source pressure retained', 'risk tell visible', 'asymmetry bounded', 'facts survive texture']),
    overfit_markers: Object.freeze(['sample wording echo', 'mascot phrase repetition', 'rare phrase clustering', 'signature punctuation cloning']),
    notes: Object.freeze(['living edge is permitted only when evidence survives'])
  };
  return Object.freeze({ ...ledger, ledger_hash_sha256: await hashObject(ledger) });
}

export { BENCH_PROMPTS as PHASE8_CALIBRATION_PROMPT_CLASSES };
