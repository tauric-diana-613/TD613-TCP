export const HUSH_INTERVENTION_VOCABULARY_SCHEMA = 'td613.hush.intervention-vocabulary/v0.1';
export const HUSH_INTERVENTION_VOCABULARY_VERSION = 'v0.1';

export const HUSH_DISCOURSE_MODES = Object.freeze([
  'NEUTRAL_RECORDS_REQUEST',
  'PUBLIC_SUMMARY',
  'PROTECTIVE_PARAPHRASE',
  'STRUCTURAL_SURROGATE',
  'QUESTION_PRESERVING_BRIEF',
  'LOCAL_SYNTHETIC_READER_FIXTURE'
]);

export const HUSH_PROPOSITION_OBLIGATIONS = Object.freeze([
  'PRESERVE_EXACTLY',
  'PRESERVE_MEANING',
  'MAY_GENERALIZE',
  'MAY_OMIT',
  'QUESTION_ONLY',
  'MUST_ABSTAIN'
]);

export const HUSH_PROTECTED_LITERAL_POLICIES = Object.freeze([
  'PRESERVE_EXACTLY',
  'REDACT',
  'GENERALIZE',
  'STRUCTURAL_SURROGATE',
  'KEEP_LOCAL'
]);

export const HUSH_TRANSFORMATION_DIMENSIONS = Object.freeze([
  'REGISTER',
  'SYNTAX',
  'CADENCE',
  'LEXICON',
  'FORMATTING',
  'LINE_BREAKS',
  'NAMING',
  'NORMALIZATION'
]);

export const HUSH_READER_CLASSES = Object.freeze([
  'LOCAL_DETERMINISTIC',
  'LOCAL_HUSH',
  'SYNTHETIC_DECLARED',
  'IMPORTED_PROVIDER_OUTPUT'
]);

export const HUSH_INTERVENTION_VOCABULARY = Object.freeze({
  schema: HUSH_INTERVENTION_VOCABULARY_SCHEMA,
  version: HUSH_INTERVENTION_VOCABULARY_VERSION,
  discourse_modes: HUSH_DISCOURSE_MODES,
  proposition_obligations: HUSH_PROPOSITION_OBLIGATIONS,
  protected_literal_policies: HUSH_PROTECTED_LITERAL_POLICIES,
  transformation_dimensions: HUSH_TRANSFORMATION_DIMENSIONS,
  reader_classes: HUSH_READER_CLASSES,
  authority_ceiling: Object.freeze({
    candidate_only: true,
    candidate_kept: false,
    provider_use_requires_explicit_provider_draft_gesture: true,
    release_authorized: false,
    transport_authorized: false,
    cinder_action_authorized: false,
    automatic_hold: false,
    automatic_ash_action: false
  })
});

export function assertHushVocabularyValue(value, allowed, label) {
  const normalized = String(value || '').trim().toUpperCase();
  if (!allowed.includes(normalized)) throw new Error(`Unsupported ${label}: ${value}`);
  return normalized;
}
