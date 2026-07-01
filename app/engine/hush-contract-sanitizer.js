export const HUSH_CONTRACT_SANITIZER_VERSION = 'hush-contract-sanitizer/v1';

const safe = (value = '') => String(value ?? '').trim();
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const BAD_ROUTE_PHRASE = /leaving this|log off|paperwork comet|signal flare|boring part|record remains legible|small circle version|for the record|for reference|tiny flare|tiny signal flare|quasar|ghost/i;

function clone(value) {
  try { return JSON.parse(JSON.stringify(value || {})); } catch { return {}; }
}

function cleanList(values = []) {
  return [...new Set(asArray(values).map(safe).filter(Boolean))].filter((value) => !BAD_ROUTE_PHRASE.test(value));
}

function scrubStyle(style = {}) {
  const clean = clone(style);
  clean.bio = '';
  clean.personaBio = '';
  clean.persona_bio = '';
  clean.sample = '';
  clean.lexicon = cleanList(clean.lexicon);
  clean.transitions = cleanList(clean.transitions);
  clean.avoid = cleanList(clean.avoid);
  return clean;
}

export function sanitizeHushRemoteMask(mask = {}) {
  const clean = clone(mask);
  clean.description = '';
  clean.sampleSeed = '';
  clean.samples = [];
  clean.riskTell = '';
  clean.intendedUse = '';
  clean.exampleTransformPairs = [];
  clean.dictionHints = cleanList(clean.dictionHints);
  clean.transitionBank = cleanList(clean.transitionBank);
  if (clean.writingTraits) {
    clean.writingTraits.personaBio = '';
    clean.writingTraits.texture = safe(clean.writingTraits.texture).replace(BAD_ROUTE_PHRASE, '').trim();
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
  vector.diction_hints = cleanList(vector.diction_hints);
  vector.transition_bank = cleanList(vector.transition_bank);
  vector.desired_moves = cleanList(vector.desired_moves);
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
