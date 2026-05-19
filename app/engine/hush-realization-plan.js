export const HUSH_REALIZATION_PLAN_VERSION = 'phase-16';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

export const DEFAULT_WRITING_TRAITS = Object.freeze({
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

const FAMILY_TRAITS = Object.freeze({
  'low heat record': { sentenceLength: 'short', diction: 'plain', emotionalTemperature: 'low', repairPriority: 'facts-first' },
  'warm practical': { diction: 'warm', emotionalTemperature: 'medium', contractionPosture: 'mixed' },
  'clipped procedural': { sentenceLength: 'short', clauseShape: 'clipped', verbosity: 'compressed', diction: 'procedural', emotionalTemperature: 'low' },
  'cold official': { sentenceLength: 'long', diction: 'bureaucratic', contractionPosture: 'avoid', transitionStyle: 'formal', emotionalTemperature: 'low' },
  'small circle': { diction: 'casual', contractionPosture: 'frequent', emotionalTemperature: 'medium', paragraphShape: 'short-lines' },
  'public pseudonym': { sentenceLength: 'medium', diction: 'plain', directness: 'balanced', transitionStyle: 'conversational' },
  'care logistics': { diction: 'warm', transitionStyle: 'practical', emotionalTemperature: 'high' },
  'facts first': { diction: 'legal', contractionPosture: 'avoid', repairPriority: 'facts-first', hedgeLevel: 'medium' },
  'flat compliance': { diction: 'bureaucratic', contractionPosture: 'avoid', emotionalTemperature: 'low', repairPriority: 'facts-first' },
  'procedural bullets': { sentenceLength: 'short', clauseShape: 'list-driven', verbosity: 'compressed', diction: 'procedural' },
  'careful analysis': { sentenceLength: 'long', clauseShape: 'branching', diction: 'academic', hedgeLevel: 'high' }
});

export function normalizeMaskWritingTraits(mask = {}) {
  const familyDefaults = FAMILY_TRAITS[safeText(mask.family).toLowerCase()] || {};
  const hint = mask.transformHints || {};
  const hintTraits = {};
  if (hint.sentence === 'short' || hint.sentence === 'very-short') hintTraits.sentenceLength = 'short';
  if (hint.sentence === 'longer') hintTraits.sentenceLength = 'long';
  if (hint.warmth === 'high') hintTraits.emotionalTemperature = 'high';
  if (hint.warmth === 'low') hintTraits.emotionalTemperature = 'low';
  if (hint.ornament === 'none') hintTraits.verbosity = 'compressed';
  if (hint.custody === 'high') hintTraits.repairPriority = 'facts-first';
  return { ...DEFAULT_WRITING_TRAITS, ...familyDefaults, ...hintTraits, ...(mask.writingTraits || {}) };
}

function directivesForTraits(traits = {}) {
  const directives = [];
  directives.push(`sentence:${traits.sentenceLength}`);
  directives.push(`clause:${traits.clauseShape}`);
  directives.push(`verbosity:${traits.verbosity}`);
  directives.push(`diction:${traits.diction}`);
  directives.push(`directness:${traits.directness}`);
  directives.push(`hedge:${traits.hedgeLevel}`);
  directives.push(`contractions:${traits.contractionPosture}`);
  directives.push(`punctuation:${traits.punctuationStyle}`);
  directives.push(`paragraph:${traits.paragraphShape}`);
  directives.push(`temperature:${traits.emotionalTemperature}`);
  return directives;
}

function defaultTransitionBank(traits = {}) {
  if (traits.transitionStyle === 'formal') return ['Regarding', 'For reference', 'At this stage', 'The relevant point is'];
  if (traits.transitionStyle === 'conversational') return ['Also', 'That said', 'For what it is worth', 'The main thing is'];
  if (traits.diction === 'legal') return ['For clarity', 'Based on the record', 'At this point', 'The relevant sequence is'];
  if (traits.diction === 'warm') return ['Also', 'Just to keep this together', 'I want to make sure', 'The helpful part is'];
  if (traits.diction === 'procedural') return ['First', 'Next', 'Also', 'For reference'];
  return ['For reference', 'Also', 'The main point is'];
}

function defaultDictionHints(traits = {}) {
  const plain = [['problem', 'issue'], ['talked to', 'spoke with'], ['help', 'assist'], ['showed', 'indicated']];
  if (traits.diction === 'casual') return [['I am', "I'm"], ['do not', "don't"], ['regarding', 'about'], ['assist', 'help'], ['issue', 'thing']];
  if (traits.diction === 'warm') return [['issue', 'part'], ['assist', 'help'], ['document', 'file'], ['review', 'look at']];
  if (traits.diction === 'legal') return [['said', 'stated'], ['showed', 'reflected'], ['changed', 'altered'], ['problem', 'concern']];
  if (traits.diction === 'bureaucratic') return [['help', 'assist'], ['problem', 'issue'], ['talked to', 'spoke with'], ['look at', 'review']];
  if (traits.diction === 'academic') return [['shows', 'suggests'], ['important', 'relevant'], ['proof', 'supporting material'], ['clear', 'legible']];
  return plain;
}

export function buildRealizationPlan(input = {}) {
  const mask = input.mask || {};
  const traits = normalizeMaskWritingTraits(mask);
  const transitionBank = [...new Set([...asArray(mask.transitionBank), ...defaultTransitionBank(traits)])];
  const targetDictionHints = [...asArray(mask.dictionHints), ...defaultDictionHints(traits)];
  const compressionRatio = traits.verbosity === 'compressed' ? 0.75 : traits.verbosity === 'expansive' ? 1.25 : 1;
  const expansionRatio = traits.verbosity === 'expansive' ? 1.25 : traits.verbosity === 'compressed' ? 0.85 : 1.05;
  const forbiddenMoves = [
    'drop-protected-literals',
    'erase-negation',
    'invent-new-facts',
    ...(traits.repairPriority === 'facts-first' ? ['sacrifice-facts-for-style'] : []),
    ...(traits.emotionalTemperature === 'low' ? ['add-emotional-flourish'] : []),
    ...(traits.contractionPosture === 'avoid' ? ['add-contractions'] : [])
  ];
  return {
    version: HUSH_REALIZATION_PLAN_VERSION,
    maskId: mask.id || 'hush-mask',
    label: mask.label || 'Hush Mask',
    traits,
    rewriteDirectives: directivesForTraits(traits),
    forbiddenMoves: [...new Set(forbiddenMoves)],
    targetDictionHints,
    transitionBank,
    avoidList: asArray(mask.avoidList),
    compressionRatio,
    expansionRatio,
    warnings: traits.repairPriority === 'mask-first' ? ['mask-first-can-weaken-meaning'] : []
  };
}

export function summarizeRealizationPlan(plan = {}) {
  const traits = plan.traits || {};
  return {
    version: plan.version || HUSH_REALIZATION_PLAN_VERSION,
    maskId: plan.maskId || '',
    label: plan.label || '',
    directiveCount: asArray(plan.rewriteDirectives).length,
    forbiddenMoveCount: asArray(plan.forbiddenMoves).length,
    transitionCount: asArray(plan.transitionBank).length,
    dictionHintCount: asArray(plan.targetDictionHints).length,
    sentenceLength: traits.sentenceLength || DEFAULT_WRITING_TRAITS.sentenceLength,
    diction: traits.diction || DEFAULT_WRITING_TRAITS.diction,
    verbosity: traits.verbosity || DEFAULT_WRITING_TRAITS.verbosity,
    warnings: asArray(plan.warnings)
  };
}
