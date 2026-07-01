export const HUSH_CONTRACT_SANITIZER_VERSION = 'hush-contract-sanitizer/v1.1-style-control-only';

const safe = (value = '') => String(value ?? '').trim();
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const BAD_ROUTE_PHRASE = /leaving this|log off|paperwork comet|signal flare|boring part|record remains legible|small circle version|for the record|for reference|tiny flare|tiny signal flare|quasar|ghost/i;

function clone(value) {
  try { return JSON.parse(JSON.stringify(value || {})); } catch { return {}; }
}

function cleanList(values = []) {
  return [...new Set(asArray(values).map(safe).filter(Boolean))].filter((value) => !BAD_ROUTE_PHRASE.test(value));
}

function blankLoreFields(target = {}) {
  for (const key of [
    'bio',
    'personaBio',
    'persona_bio',
    'description',
    'sample',
    'sampleSeed',
    'sample_seed',
    'sample_seed_excerpt',
    'personaScene',
    'persona_scene',
    'riskTell',
    'risk_tell',
    'intendedUse',
    'intended_use',
    'scene',
    'risk',
    'ornament',
    'warmth',
    'custody',
    'sentence'
  ]) {
    if (Object.prototype.hasOwnProperty.call(target, key)) target[key] = '';
  }
  for (const key of [
    'samples',
    'exampleTransformPairs',
    'lexicon',
    'transitions',
    'dictionHints',
    'transitionBank',
    'pressureWarnings',
    'diction_hints',
    'transition_bank',
    'desired_moves',
    'avoid_moves',
    'pressure_warnings'
  ]) {
    if (Object.prototype.hasOwnProperty.call(target, key)) target[key] = [];
  }
  return target;
}

function scrubStyle(style = {}) {
  const clean = clone(style);
  blankLoreFields(clean);
  clean.avoid = [];
  return clean;
}

function scrubTransformHints(hints = {}) {
  const clean = clone(hints);
  blankLoreFields(clean);
  clean.desiredMoves = [];
  clean.avoidMoves = [];
  clean.desired_moves = [];
  clean.avoid_moves = [];
  return clean;
}

export function sanitizeHushRemoteMask(mask = {}) {
  const clean = clone(mask);
  blankLoreFields(clean);
  clean.description = '';
  clean.sampleSeed = '';
  clean.samples = [];
  clean.riskTell = '';
  clean.intendedUse = '';
  clean.exampleTransformPairs = [];
  clean.dictionHints = [];
  clean.transitionBank = [];
  clean.pressureWarnings = [];
  if (clean.transformHints) clean.transformHints = scrubTransformHints(clean.transformHints);
  if (clean.writingTraits) {
    clean.writingTraits.personaBio = '';
    clean.writingTraits.texture = '';
  }
  if (clean.diversity) clean.diversity = scrubStyle(clean.diversity);
  if (clean.styleDiversity) clean.styleDiversity = scrubStyle(clean.styleDiversity);
  clean.__hushRemoteLoreQuarantine = Object.freeze({ active: true, sampleSeedExportedToProvider: false, maskLoreExportedToProvider: false, sanitizedContractVersion: HUSH_CONTRACT_SANITIZER_VERSION });
  return clean;
}

export function sanitizeHushFlightPacket(packet = {}) {
  const clean = clone(packet);
  const vector = clean.mask_style_vector || {};
  vector.intended_use = '';
  vector.risk_tell = '';
  vector.persona_scene = '';
  vector.sample_seed = '';
  vector.sample_seed_excerpt = '';
  vector.sentence = '';
  vector.warmth = '';
  vector.custody = '';
  vector.ornament = '';
  vector.diction_hints = [];
  vector.transition_bank = [];
  vector.desired_moves = [];
  vector.avoid_list = [];
  vector.avoid_moves = [];
  vector.pressure_warnings = [];
  if (vector.transform_hints) vector.transform_hints = scrubTransformHints(vector.transform_hints);
  if (vector.style_diversity) vector.style_diversity = scrubStyle(vector.style_diversity);
  clean.mask_style_vector = vector;
  clean.lore_quarantine = Object.freeze({ active: true, sample_seed_exported_to_provider: false, mask_lore_exported_to_provider: false, hook: HUSH_CONTRACT_SANITIZER_VERSION });
  return clean;
}

export function sanitizeHushRemoteContract(contract = {}) {
  const clean = clone(contract);
  clean.mask = sanitizeHushRemoteMask(clean.mask || {});
  clean.selectedMask = sanitizeHushRemoteMask(clean.selectedMask || clean.mask || {});
  clean.maskReferenceText = '';
  clean.referenceText = '';
  clean.promptDetox = Object.freeze({ active: true, sampleSeedExportedToProvider: false, maskLoreExportedToProvider: false, hook: HUSH_CONTRACT_SANITIZER_VERSION });
  if (clean.flightPacket) clean.flightPacket = sanitizeHushFlightPacket(clean.flightPacket);
  return clean;
}

export function hushSanitizerReceipt(extra = {}) {
  return Object.freeze({
    promptDetoxActive: true,
    sampleSeedExportedToProvider: false,
    maskLoreExportedToProvider: false,
    catchphraseRejected: Number(extra.catchphraseRejected || 0),
    sanitizedContractVersion: HUSH_CONTRACT_SANITIZER_VERSION
  });
}
