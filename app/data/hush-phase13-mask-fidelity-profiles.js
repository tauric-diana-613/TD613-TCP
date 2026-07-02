export const HUSH_PHASE13_PROFILE_SCHEMA = 'td613-hush-phase13-mask-fidelity-profile/v1';

function profile(id, label, layout_mode, positive_markers, failure_markers, variance_markers = []) {
  return Object.freeze({
    schema: HUSH_PHASE13_PROFILE_SCHEMA,
    profile_id: `phase13-${id}`,
    mask_id: id,
    mask_label: label,
    layout_mode,
    positive_fidelity_markers: positive_markers,
    synthetic_failure_markers: failure_markers,
    mask_native_variance_markers: variance_markers.length ? variance_markers : positive_markers.slice(0, 3),
    thresholds: Object.freeze({
      profile_repair_below: 0.62,
      profile_block_below: 0.48,
      smoothness_repair_above: 0.72,
      smoothness_block_above: 0.86,
      generic_repair_above: 0.7,
      generic_block_above: 0.84
    })
  });
}

export const HUSH_PHASE13_MASK_FIDELITY_PROFILES = Object.freeze([
  profile('cryo-cristiano', 'Cryo Cristiano', 'short-handoff-paragraphs', ['short handoff', 'low flourish', 'compressed refusal', 'direct status'], ['warm support chat', 'soft apology spiral', 'essay close'], ['short paragraphs', 'cold directness']),
  profile('luz-index', 'Luz of the Index', 'indexed-anchor-blocks', ['indexed blocks', 'line unit grouping', 'anchor preservation', 'receipt sequence'], ['single summary paragraph', 'hidden sequence', 'smooth replacement'], ['numbered lines', 'custody grouping']),
  profile('rex-fractura', 'Rex Fractura', 'bounded-fracture-lines', ['controlled rupture', 'hard edge', 'abrupt pivot', 'semantic hold'], ['smooth edge voice', 'random fragments', 'softened closure'], ['short lines', 'fracture marks']),
  profile('harbor-zora', 'Harbor Zora', 'warm-boundary-paragraphs', ['warm boundary', 'source aware care', 'protective cadence', 'grounded witness'], ['generic comfort', 'sentimental gloss', 'therapy padding'], ['care with boundary', 'uneven breath']),
  profile('receipts-queenie', 'Receipts Queenie', 'evidence-first-bite', ['evidence first', 'sharp turn', 'documented shade', 'receipt anchor'], ['sassy but thin', 'defanged politeness', 'fact light punchline'], ['receipt lead', 'short bite']),
  profile('keisha-soft-circle', 'Keisha Soft Circle', 'soft-circle-return', ['circular return', 'relational continuity', 'gentle reframe', 'memory thread'], ['therapy template', 'generic comfort', 'conflict erasure'], ['return motion', 'soft edge']),
  profile('nolan-needler', 'Nolan the Needler', 'compact-needle', ['compact pressure', 'corrective sting', 'low ornament', 'question pressure'], ['over explained critique', 'excess cushion', 'long throat clearing'], ['short corrective turns']),
  profile('blooping-blip', 'Blooping Blip', 'glitch-pop-motion', ['controlled weirdness', 'playful compression', 'small strange turn', 'light instability'], ['quirky assistant', 'full nonsense drift', 'ordinary chat'], ['odd turn', 'compressed playful line']),
  profile('lulu-quasar', 'Lulu Quasar', 'quasar-shimmer', ['strange shimmer', 'unusual metaphor', 'controlled expansion', 'cosmic register'], ['pretty generic language', 'random word salad', 'ordinary poetic gloss'], ['metaphor density', 'bright expansion']),
  profile('dromological-paul', 'Dromological Paul', 'speed-pressure-chain', ['speed pressure', 'sequence velocity', 'temporal compression', 'diagnostic acceleration'], ['slow explainer', 'standard theory paragraph', 'padding'], ['fast chain', 'motion markers']),
  profile('sol-stratigraphix', 'Sol Stratigraphix', 'stratified-excavation', ['visible layers', 'downward movement', 'structured excavation', 'sedimented evidence'], ['generic academic synthesis', 'flat summary', 'over clean synthesis'], ['layer headers', 'excavation pacing']),
  profile('blackstar-sheree', 'Blackstar Shereé', 'glam-pressure', ['controlled drama', 'architectural shade', 'declarative force', 'glamour with structure'], ['influencer copy', 'bland confidence', 'unsupported drama'], ['declarative turns', 'style pressure']),
  profile('glitching-pixie', 'Glitching Pixie', 'flicker-syntax', ['flicker syntax', 'bright rupture', 'punctuation play', 'clipped burst'], ['cute chat voice', 'standard helpful flow', 'random sparkle'], ['clipped bursts', 'punctuation play'])
]);

export const HUSH_PHASE13_NON_CLAIMS = Object.freeze([
  'authorship proof',
  'identity proof',
  'anonymity',
  'non-attribution',
  'human equivalence',
  'perfect voice match',
  'legal protection',
  'truth adjudication',
  'provider certainty'
]);

export function resolvePhase13Profile(mask = {}) {
  const raw = `${mask.mask_id || mask.id || ''} ${mask.mask_label || mask.label || ''}`.toLowerCase();
  return HUSH_PHASE13_MASK_FIDELITY_PROFILES.find((entry) => raw.includes(entry.mask_id) || raw.includes(entry.mask_label.toLowerCase())) || HUSH_PHASE13_MASK_FIDELITY_PROFILES.find((entry) => entry.mask_id === 'luz-index');
}
