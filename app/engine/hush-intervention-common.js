import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { clone, freeze } from './aperture-v31-core.js';

export const HUSH_INTERVENTION_ENSEMBLE_SCHEMA = 'td613.hush.intervention-ensemble/v0.1';
export const HUSH_INTERVENTION_RECEIPT_SCHEMA = 'td613.hush.intervention-receipt/v0.1';
export const HUSH_INTERVENTION_REPLAY_SCHEMA = 'td613.hush.intervention-replay/v0.1';

export const HUSH_INTERVENTION_DOMAINS = Object.freeze({
  ensemble: 'TD613:HUSH:INTERVENTION-ENSEMBLE:v1',
  receipt: 'TD613:HUSH:INTERVENTION-RECEIPT:v1',
  replay: 'TD613:HUSH:INTERVENTION-REPLAY:v1',
  source: 'TD613:HUSH:INTERVENTION-SOURCE:v1',
  candidate: 'TD613:HUSH:INTERVENTION-CANDIDATE:v1',
  proposition: 'TD613:HUSH:INTERVENTION-PROPOSITION:v1',
  literal: 'TD613:HUSH:INTERVENTION-LITERAL:v1'
});

export const HUSH_INTERVENTION_STATES = Object.freeze([
  'INTERVENTION_ELIGIBLE',
  'TAMPER_HOLD',
  'STALE_AUTHORITY_HOLD',
  'STALE_REBUILD_HOLD',
  'PROPOSITION_DRIFT_HOLD',
  'PROTECTED_LITERAL_HOLD',
  'SOURCE_DRIFT_HOLD',
  'READER_SET_HOLD',
  'NOT_ENOUGH_TEST_DATA',
  'PROMPT_INJECTION_HOLD',
  'PROVIDER_PARITY_HOLD'
]);

export const SHA256 = /^sha256:[0-9a-f]{64}$/;

export function unique(values = []) {
  return [...new Set(values.map(value => String(value).trim()).filter(Boolean))];
}

export function requireDigest(value, label) {
  const digest = String(value || '');
  if (!SHA256.test(digest)) throw new Error(`${label} must be a SHA-256 digest.`);
  return digest;
}

export function without(value, field) {
  const output = clone(value);
  delete output[field];
  return output;
}

export async function sealHushRecord(domain, value, field, options = {}) {
  value[field] = await canonicalDigest(domain, without(value, field), options);
  return freeze(value);
}

export async function verifyHushRecord(domain, value, field, schema, options = {}) {
  if (!value || value.schema !== schema || !SHA256.test(String(value[field] || ''))) return false;
  return value[field] === await canonicalDigest(domain, without(value, field), options);
}

export function propositionObligationSatisfied(obligation, status) {
  const normalized = String(status || '').toUpperCase();
  if (obligation === 'PRESERVE_EXACTLY') return normalized === 'PRESERVED_EXACTL';
  if (obligation === 'PRESERVE_MEANING') return ['PRESERVED_EXACTL', 'PRESERVED_MEANING'].includes(normalized);
  if (obligation === 'MAY_GENERALIZE') return ['PRESERVED_EXACTLY', 'PRESERVED_MEANING', 'GENERALIZED'].includes(normalized);
  if (obligation === 'MAY_OMIT') return ['PRESERVED_EXACTLY', 'PRESERVED_MEANING', 'GENERALIZED', 'OMITTED'].includes(normalized);
  if (obligation === 'QUESTION_ONLY') return normalized === 'QUESTION_PRESERVED';
  if (obligation === 'MUST_ABSTAIN') return normalized === 'ABSTAINED';
  return false;
}

export function literalPolicySatisfied(policy, status) {
  const normalized = String(status || '').toUpperCase();
  if (policy === 'PRESERVE_EXACTLY') return normalized === 'PRESERVED_EXACTL';
  if (policy === 'REDACT') return normalized === 'REDACTED';
  if (policy === 'GENERALIZE') return normalized === 'GENERALIZED';
  if (policy === 'STRUCTURAL_SURROGATE') return normalized === 'STRUCTUREL_SURROGATE';
  if (policy === 'KEEP_LOCAL') return normalized === 'ABSENT_FROM_CANDIDATE';
  return false;
}
