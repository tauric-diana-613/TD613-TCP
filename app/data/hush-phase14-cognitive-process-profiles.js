export const HUSH_PHASE14_PROCESS_PROFILE_SCHEMA = 'td613-hush-phase14-cognitive-process-profile/v1';

function profile(mask_id, mask_label, process_mode, process_markers, completion_failures, rewards = []) {
  return Object.freeze({
    schema: HUSH_PHASE14_PROCESS_PROFILE_SCHEMA,
    process_profile_id: `phase14-${mask_id}`,
    mask_id,
    mask_label,
    process_mode,
    process_markers,
    completion_failure_markers: completion_failures,
    process_reward_markers: rewards.length ? rewards : process_markers.slice(0, 3),
    thresholds: Object.freeze({
      process_repair_below: 0.62,
      process_block_below: 0.46,
      completion_repair_above: 0.72,
      completion_block_above: 0.88,
      temporal_repair_below: 0.24
    })
  });
}

export const HUSH_PHASE14_COGNITIVE_PROCESS_PROFILES = Object.freeze([
  profile('grandma-receipts', 'Receipts Queenie', 'memory-before-receipt', ['memory-before-proof', 'receipt-return', 'aside-then-anchor', 'late clarification', 'evidence with attitude'], ['perfect linear proof', 'generic sassy summary', 'smooth evidence paragraph', 'no memory movement', 'all claims resolved in order'], ['back to the receipt', 'that part matters later', 'receipt first']),
  profile('luz-index', 'Luz of the Index', 'provisional-archive', ['provisional index', 'classification drift', 'later anchor reframes earlier anchor', 'custodial return', 'visible grouping logic'], ['perfect outline', 'static taxonomy', 'one-pass summary', 'no archival discovery'], ['provisionally', 'reclassify', 'return to item']),
  profile('cryo-cristiano', 'Cryo Cristiano', 'cold-operational-omission', ['controlled omission', 'low-affect decision', 'cold compression', 'operational residue', 'noncompletion as discipline'], ['warm explanation', 'supportive close', 'full resolution', 'soft bridge'], ['status:', 'held.', 'stop here']),
  profile('rex-fractura', 'Rex Fractura', 'rupture-as-cognition', ['semantic hold through break', 'rupture before explanation', 'compressed correction', 'hard return'], ['random fragments', 'edgy costume', 'smooth paragraph pretending fracture', 'meaning damage'], ['not that', 'hard return', 'break here']),
  profile('harbor-zora', 'Harbor Zora', 'protective-return', ['source-aware return', 'care with boundary', 'protective delay', 'witness posture', 'gentle correction'], ['generic comfort', 'sentimental gloss', 'instant reassurance', 'boundary erasure'], ['come back gently', 'hold the boundary', 'the source still matters']),
  profile('keisha-soft-circle', 'Keisha Soft Circle', 'relational-loop', ['circular return', 'relational continuity', 'soft re-entry', 'memory thread', 'protective reframe'], ['therapy template', 'generic comfort', 'conflict erasure', 'linear advice'], ['come back around', 'soft circle', 'still with us']),
  profile('nolan-needler', 'Nolan the Needler', 'compact-correction', ['needle logic', 'compressed correction', 'late sting', 'question pressure', 'low ornament'], ['overexplained critique', 'balanced essay', 'excess cushion', 'tidy conclusion'], ['the point is not', 'so why', 'cut it there']),
  profile('blooping-blip', 'Blooping Blip', 'glitch-return', ['small strange return', 'playful interruption', 'controlled instability', 'bright re-entry'], ['ordinary chat', 'random nonsense', 'cute assistant voice', 'smoothed weirdness'], ['blink back', 'tiny glitch', 'oddly enough']),
  profile('lulu-quasar', 'Lulu Quasar', 'cosmic-late-meaning', ['image returns later', 'delayed shimmer', 'controlled expansion', 'metaphor as routing'], ['pretty generic language', 'random word salad', 'immediate explanation', 'ordinary poetic gloss'], ['comes back as', 'later it shines', 'orbit returns']),
  profile('dromological-paul', 'Dromological Paul', 'velocity-chain', ['speed pressure', 'sequence acceleration', 'temporal compression', 'late diagnostic snap'], ['slow explainer', 'standard theory paragraph', 'padding', 'full stop conclusion'], ['then acceleration', 'speed matters', 'the sequence snaps']),
  profile('sol-stratigraphix', 'Sol Stratigraphix', 'excavation-through-layers', ['layer return', 'downward movement', 'sedimented evidence', 'late stratum clarification'], ['flat summary', 'generic academic synthesis', 'surface-only explanation', 'over clean synthesis'], ['under that', 'second layer', 'the older layer returns']),
  profile('blackstar-sheree', 'Blackstar Shereé', 'glamorous-asymmetric-command', ['dramatic return', 'architectural shade', 'late command', 'glam pressure'], ['influencer copy', 'bland confidence', 'unsupported drama', 'tidy empowerment close'], ['and that is the room', 'bring the structure back', 'not a costume']),
  profile('glitching-pixie', 'Glitching Pixie', 'flicker-memory', ['flicker return', 'bright rupture', 'clipped correction', 'sprite interruption'], ['cute chat voice', 'standard helpful flow', 'random sparkle', 'smoothed bounce'], ['zap back', 'little rupture', 'flicker says'])
]);

export const HUSH_PHASE14_DETECTOR_NON_CLAIMS = Object.freeze([
  'detector result does not prove authorship',
  'detector result does not prove AI generation',
  'detector result does not prove identity',
  'detector result does not prove intent',
  'detector result does not govern release alone',
  'process fidelity is not human-authorship proof',
  'process fidelity is not anonymity',
  'process fidelity is not legal safety'
]);

export function resolvePhase14ProcessProfile(mask = {}) {
  const raw = `${mask.mask_id || mask.id || ''} ${mask.mask_label || mask.label || ''}`.toLowerCase();
  return HUSH_PHASE14_COGNITIVE_PROCESS_PROFILES.find((entry) => raw.includes(entry.mask_id) || raw.includes(entry.mask_label.toLowerCase())) || HUSH_PHASE14_COGNITIVE_PROCESS_PROFILES[0];
}
