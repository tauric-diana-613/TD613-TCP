export const HUSH_MASK_TRAITS_VERSION = 'phase-16';

const DEFAULT_TRAITS = Object.freeze({
  sentenceLength: 'medium',
  clauseShape: 'simple',
  verbosity: 'balanced',
  diction: 'plain',
  directness: 'balanced',
  hedgeLevel: 'medium',
  contractionPosture: 'mixed',
  punctuationStyle: 'minimal',
  paragraphShape: 'compact-paragraphs',
  transitionStyle: 'practical',
  emotionalTemperature: 'medium',
  repairPriority: 'balance'
});

export const WRITING_TRAITS_BY_ID = Object.freeze({
  'plain-witness': { sentenceLength: 'short', diction: 'plain', directness: 'balanced', emotionalTemperature: 'low', repairPriority: 'facts-first' },
  'friendly-coworker': { diction: 'warm', contractionPosture: 'mixed', emotionalTemperature: 'medium', transitionStyle: 'conversational' },
  'busy-admin': { sentenceLength: 'short', clauseShape: 'clipped', verbosity: 'compressed', diction: 'procedural', emotionalTemperature: 'low' },
  'formal-record': { sentenceLength: 'long', clauseShape: 'branching', diction: 'bureaucratic', contractionPosture: 'avoid', transitionStyle: 'formal', emotionalTemperature: 'low', repairPriority: 'facts-first' },
  'group-chat-soft': { sentenceLength: 'short', diction: 'casual', contractionPosture: 'frequent', paragraphShape: 'short-lines', transitionStyle: 'conversational' },
  'forum-regular': { sentenceLength: 'medium', diction: 'plain', directness: 'balanced', transitionStyle: 'conversational' },
  'mutual-aid-coordinator': { diction: 'warm', transitionStyle: 'practical', emotionalTemperature: 'high', repairPriority: 'balance' },
  'legal-intake': { diction: 'legal', contractionPosture: 'avoid', hedgeLevel: 'medium', repairPriority: 'facts-first' },
  'hr-portal': { diction: 'bureaucratic', contractionPosture: 'avoid', verbosity: 'compressed', emotionalTemperature: 'low', repairPriority: 'facts-first' },
  'quirky-orbit': { diction: 'poetic', punctuationStyle: 'dash-rich', emotionalTemperature: 'medium', repairPriority: 'balance' },
  'grandma-receipts': { diction: 'warm', sentenceLength: 'medium', emotionalTemperature: 'high', transitionStyle: 'conversational', repairPriority: 'facts-first' },
  'night-shift-note': { sentenceLength: 'short', diction: 'plain', verbosity: 'compressed', emotionalTemperature: 'medium' },
  'library-ghost': { diction: 'formal', sentenceLength: 'medium', emotionalTemperature: 'low', punctuationStyle: 'minimal', repairPriority: 'facts-first' },
  'soft-snark': { diction: 'casual', directness: 'blunt', emotionalTemperature: 'medium', punctuationStyle: 'dash-rich' },
  'weather-report': { sentenceLength: 'short', diction: 'procedural', directness: 'balanced', emotionalTemperature: 'low', contractionPosture: 'avoid' },
  'kitchen-table': { diction: 'warm', directness: 'balanced', emotionalTemperature: 'high', transitionStyle: 'conversational' },
  'clipboard': { sentenceLength: 'short', clauseShape: 'list-driven', verbosity: 'compressed', diction: 'procedural', repairPriority: 'facts-first' },
  'burner-minimal': { sentenceLength: 'short', clauseShape: 'clipped', verbosity: 'compressed', diction: 'plain', directness: 'blunt', emotionalTemperature: 'low' },
  'academic-caveat': { sentenceLength: 'long', clauseShape: 'branching', diction: 'academic', hedgeLevel: 'high', contractionPosture: 'avoid' },
  'neighbor-note': { sentenceLength: 'short', diction: 'casual', emotionalTemperature: 'medium', transitionStyle: 'conversational' }
});

export const TRANSITION_BANK_BY_DICTION = Object.freeze({
  plain: ['For reference', 'The main point is', 'Also'],
  bureaucratic: ['Regarding', 'For reference', 'At this stage', 'The relevant issue is'],
  legal: ['For clarity', 'Based on the record', 'At this point', 'The relevant sequence is'],
  warm: ['Just to keep this together', 'I want to make sure', 'The helpful part is', 'Also'],
  casual: ['Quick note', 'Also', 'Just flagging this', 'The main thing is'],
  academic: ['This suggests', 'At minimum', 'The relevant continuity is', 'However'],
  procedural: ['First', 'Next', 'For reference', 'Current status'],
  poetic: ['Small note', 'Tiny signal', 'For the record', 'Here is the thread']
});

export const DICTION_HINTS_BY_DICTION = Object.freeze({
  plain: [['problem', 'issue'], ['talked to', 'spoke with'], ['showed', 'indicated']],
  bureaucratic: [['help', 'assist'], ['problem', 'issue'], ['look at', 'review'], ['changed', 'was updated']],
  legal: [['said', 'stated'], ['showed', 'reflected'], ['changed', 'altered'], ['proof', 'supporting material']],
  warm: [['issue', 'part'], ['assist', 'help'], ['document', 'file'], ['review', 'look at']],
  casual: [['regarding', 'about'], ['assist', 'help'], ['issue', 'thing']],
  academic: [['shows', 'suggests'], ['important', 'relevant'], ['clear', 'legible']],
  procedural: [['issue', 'item'], ['changed', 'updated'], ['help', 'support']],
  poetic: [['document', 'paperwork'], ['label', 'little tag'], ['kept', 'held']]
});

export function enrichHushMask(mask = {}) {
  const traits = { ...DEFAULT_TRAITS, ...(WRITING_TRAITS_BY_ID[mask.id] || {}), ...(mask.writingTraits || {}) };
  const transitionBank = [...new Set([...(mask.transitionBank || []), ...(TRANSITION_BANK_BY_DICTION[traits.diction] || TRANSITION_BANK_BY_DICTION.plain)])];
  const dictionHints = [...(mask.dictionHints || []), ...(DICTION_HINTS_BY_DICTION[traits.diction] || DICTION_HINTS_BY_DICTION.plain)];
  const avoidList = [...new Set([...(mask.avoidList || []), ...(traits.contractionPosture === 'avoid' ? ["I'm", "don't", "can't", "won't"] : [])])];
  const exampleTransformPairs = mask.exampleTransformPairs || [];
  return { ...mask, writingTraits: traits, transitionBank, dictionHints, avoidList, exampleTransformPairs };
}

export function enrichHushMasks(masks = []) {
  return masks.map((mask) => enrichHushMask(mask));
}
