export const HUSH_CATCHPHRASE_QUARANTINE_VERSION = 'hush-catchphrase-quarantine/v1';

const safeText = (value = '') => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const uniq = (values = []) => [...new Set(asArray(values).map((value) => safeText(value).trim()).filter(Boolean))];
const norm = (value = '') => safeText(value).toLowerCase().replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[^a-z0-9'\s-]/g, ' ').replace(/\s+/g, ' ').trim();

export const HUSH_FIXED_CATCHPHRASES = Object.freeze([
  'leaving this before i log off',
  'leaving this here for the thread',
  'leaving this here then logging off',
  'small circle version',
  'i kept this plain because it may matter later',
  'interesting little detail',
  'boring part but this probably matters',
  'tiny signal flare',
  'tiny paperwork comet',
  'paperwork comet',
  'the record remains legible',
  'the document remains where it was placed',
  'for the record',
  'for reference',
  'just to keep this clear',
  'what i can confirm is this',
  'the point is the record still has to hold'
]);

const MASCOT_TERMS = Object.freeze([
  'paperwork comet',
  'signal flare',
  'tiny flare',
  'log off',
  'logging off',
  'record remains legible',
  'folder remembers',
  'cookie tin',
  'little bat',
  'quasar',
  'ghost',
  'comet'
]);

const STOP = new Set(['this', 'that', 'with', 'from', 'have', 'will', 'would', 'should', 'could', 'about', 'because', 'there', 'their', 'where', 'when', 'what', 'into', 'onto', 'then', 'than', 'also', 'only', 'just', 'like', 'your', 'they', 'them', 'been', 'were', 'was', 'are']);

function words(value = '') {
  return norm(value).match(/[a-z0-9][a-z0-9'-]*/g) || [];
}

function sourceHas(sourceText = '', phrase = '') {
  return norm(sourceText).includes(norm(phrase));
}

function ngrams(value = '', size = 4) {
  const tokens = words(value);
  const grams = [];
  for (let index = 0; index <= tokens.length - size; index += 1) {
    const slice = tokens.slice(index, index + size);
    const signal = slice.filter((token) => token.length > 3 && !STOP.has(token)).length;
    if (signal >= 2) grams.push(slice.join(' '));
  }
  return [...new Set(grams)];
}

export function extractMaskLoreStrings(input = {}) {
  const contract = input.contract || input;
  const fp = contract.flightPacket || {};
  const vector = fp.mask_style_vector || {};
  const mask = input.mask || contract.mask || contract.selectedMask || {};
  const diversity = vector.style_diversity || mask.diversity || {};
  return uniq([
    mask.sampleSeed,
    mask.description,
    mask.riskTell,
    mask.intendedUse,
    vector.sample_seed,
    vector.persona_scene,
    vector.risk_tell,
    vector.intended_use,
    diversity.personaBio,
    diversity.sample,
    ...(input.sampleTexts || [])
  ]).filter((value) => words(value).length >= 4);
}

export function auditHushCatchphraseQuarantine(input = {}) {
  const text = safeText(input.text || input.outputText || '').trim();
  const sourceText = safeText(input.sourceText || '');
  const normalized = norm(text);
  const flags = [];
  const add = (kind, value, detail = '') => flags.push({ kind, value, detail });

  for (const phrase of HUSH_FIXED_CATCHPHRASES) {
    const normalizedPhrase = norm(phrase);
    if (normalizedPhrase && normalized.includes(normalizedPhrase) && !sourceHas(sourceText, phrase)) add('fixed-catchphrase', phrase, 'fixed local strategy or legacy mascot phrase');
  }

  for (const term of MASCOT_TERMS) {
    const normalizedTerm = norm(term);
    if (normalizedTerm && normalized.includes(normalizedTerm) && !sourceHas(sourceText, term)) add('mascot-term', term, 'mask lore / mascot image entered output');
  }

  for (const lore of extractMaskLoreStrings(input)) {
    for (const gram of ngrams(lore, 4)) {
      if (normalized.includes(gram) && !sourceHas(sourceText, gram)) add('mask-lore-ngram', gram, '4-word overlap with quarantined mask lore or sample text');
    }
  }

  const status = flags.length ? (flags.some((flag) => flag.kind.includes('catchphrase')) ? 'quarantined-catchphrase' : 'quarantined-mask-lore') : 'clean';
  return Object.freeze({
    version: HUSH_CATCHPHRASE_QUARANTINE_VERSION,
    passed: flags.length === 0,
    status,
    flags: Object.freeze(flags),
    warnings: Object.freeze(flags.map((flag) => `${flag.kind}:${flag.value}`)),
    law: 'mask prose is design metadata; output style must emerge from metrics, source pressure, and structural controls, not repeated mascot language'
  });
}
