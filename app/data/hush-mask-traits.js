export const HUSH_MASK_TRAITS_VERSION = 'phase-16-diversity-v2';

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
  'plain-witness': { sentenceLength: 'short', clauseShape: 'simple', verbosity: 'compressed', diction: 'plain', directness: 'balanced', hedgeLevel: 'low', contractionPosture: 'avoid', punctuationStyle: 'minimal', paragraphShape: 'compact-paragraphs', emotionalTemperature: 'low', repairPriority: 'facts-first' },
  'friendly-coworker': { sentenceLength: 'medium', clauseShape: 'simple', diction: 'warm', directness: 'soft', contractionPosture: 'mixed', emotionalTemperature: 'medium', transitionStyle: 'conversational' },
  'busy-admin': { sentenceLength: 'short', clauseShape: 'clipped', verbosity: 'compressed', diction: 'procedural', directness: 'blunt', hedgeLevel: 'low', emotionalTemperature: 'low', punctuationStyle: 'minimal' },
  'formal-record': { sentenceLength: 'long', clauseShape: 'branching', verbosity: 'expanded', diction: 'bureaucratic', directness: 'formal', contractionPosture: 'avoid', transitionStyle: 'formal', emotionalTemperature: 'low', repairPriority: 'facts-first' },
  'group-chat-soft': { sentenceLength: 'short', clauseShape: 'loose', diction: 'casual', directness: 'soft', contractionPosture: 'frequent', paragraphShape: 'short-lines', transitionStyle: 'conversational', emotionalTemperature: 'medium' },
  'forum-regular': { sentenceLength: 'medium', clauseShape: 'threaded', diction: 'plain', directness: 'balanced', hedgeLevel: 'medium', transitionStyle: 'conversational' },
  'mutual-aid-coordinator': { sentenceLength: 'medium', clauseShape: 'sequenced', diction: 'warm', directness: 'soft', transitionStyle: 'practical', emotionalTemperature: 'high', repairPriority: 'balance' },
  'legal-intake': { sentenceLength: 'medium', clauseShape: 'chronological', diction: 'legal', contractionPosture: 'avoid', hedgeLevel: 'medium', punctuationStyle: 'minimal', repairPriority: 'facts-first' },
  'hr-portal': { sentenceLength: 'medium', clauseShape: 'portal-flat', verbosity: 'compressed', diction: 'bureaucratic', contractionPosture: 'avoid', emotionalTemperature: 'low', repairPriority: 'facts-first' },
  'quirky-orbit': { sentenceLength: 'medium', clauseShape: 'image-pivot', diction: 'poetic', punctuationStyle: 'dash-rich', emotionalTemperature: 'medium', repairPriority: 'balance' },
  'grandma-receipts': { diction: 'warm', sentenceLength: 'medium', clauseShape: 'story-plain', emotionalTemperature: 'high', transitionStyle: 'conversational', repairPriority: 'facts-first' },
  'night-shift-note': { sentenceLength: 'short', clauseShape: 'tired-handoff', diction: 'plain', verbosity: 'compressed', emotionalTemperature: 'medium' },
  'library-ghost': { diction: 'formal', sentenceLength: 'medium', clauseShape: 'artifact-distance', emotionalTemperature: 'low', punctuationStyle: 'minimal', repairPriority: 'facts-first' },
  'soft-snark': { diction: 'casual', clauseShape: 'turn-and-pin', directness: 'blunt', emotionalTemperature: 'medium', punctuationStyle: 'dash-rich' },
  'weather-report': { sentenceLength: 'short', clauseShape: 'observational', diction: 'procedural', directness: 'balanced', emotionalTemperature: 'low', contractionPosture: 'avoid' },
  'kitchen-table': { diction: 'warm', clauseShape: 'plain-care', directness: 'balanced', emotionalTemperature: 'high', transitionStyle: 'conversational' },
  'clipboard': { sentenceLength: 'short', clauseShape: 'list-driven', verbosity: 'compressed', diction: 'procedural', directness: 'balanced', repairPriority: 'facts-first' },
  'burner-minimal': { sentenceLength: 'short', clauseShape: 'clipped', verbosity: 'compressed', diction: 'plain', directness: 'blunt', hedgeLevel: 'low', emotionalTemperature: 'low' },
  'academic-caveat': { sentenceLength: 'long', clauseShape: 'branching', verbosity: 'expanded', diction: 'academic', hedgeLevel: 'high', contractionPosture: 'avoid' },
  'neighbor-note': { sentenceLength: 'short', clauseShape: 'everyday', diction: 'casual', emotionalTemperature: 'medium', transitionStyle: 'conversational' }
});

export const MASK_DIVERSITY_BY_ID = Object.freeze({
  'plain-witness': { openingMoves: ['What I can confirm is', 'The plain version is'], sentenceArchitecture: 'two to three short declarative sentences; no joke; no flourish', lexicalSignature: ['confirm', 'visible', 'kept', 'record'], punctuationSignature: 'periods only', forbiddenGenericStarts: ['For reference', 'Quick note', 'Just to keep'], requiredMoves: ['strip warmth', 'preserve facts as separate units'], profileTargets: { avgSentenceLength: 8, punctuationDensity: 0.05, contractionDensity: 0, warmth: 0.1, formality: 0.45, compression: 0.75 } },
  'friendly-coworker': { openingMoves: ['Quick note', 'Just flagging this'], sentenceArchitecture: 'one friendly opener plus a practical handoff; contractions allowed', lexicalSignature: ['quick', 'shared', 'later', 'thanks'], punctuationSignature: 'periods with occasional comma', forbiddenGenericStarts: ['For the record', 'Based on the record'], requiredMoves: ['make the message cooperative', 'keep stakes ordinary'], profileTargets: { avgSentenceLength: 15, punctuationDensity: 0.08, contractionDensity: 0.08, warmth: 0.55, formality: 0.2, compression: 0.95 } },
  'busy-admin': { openingMoves: ['Received', 'Current status'], sentenceArchitecture: 'fragments and clipped task sentences; no softener', lexicalSignature: ['received', 'status', 'remaining', 'attached'], punctuationSignature: 'periods only', forbiddenGenericStarts: ['I want to make sure', 'Tiny'], requiredMoves: ['compress hard', 'use operational nouns'], profileTargets: { avgSentenceLength: 6, punctuationDensity: 0.04, contractionDensity: 0, warmth: 0.05, formality: 0.5, compression: 0.55 } },
  'formal-record': { openingMoves: ['Regarding the record', 'For documentation purposes'], sentenceArchitecture: 'one longer official sentence plus a second clarifying sentence', lexicalSignature: ['relevant', 'reviewed', 'attached material', 'sequence'], punctuationSignature: 'commas allowed; no exclamation', forbiddenGenericStarts: ['Hey', 'Quick note', 'Tiny'], requiredMoves: ['raise formality', 'nominalize verbs'], profileTargets: { avgSentenceLength: 24, punctuationDensity: 0.12, contractionDensity: 0, warmth: 0, formality: 0.9, compression: 1.2 } },
  'group-chat-soft': { openingMoves: ['Hey yall', 'Dropping this here'], sentenceArchitecture: 'short chatty line followed by a calm fact line', lexicalSignature: ['thread', 'look later', 'here', 'kept'], punctuationSignature: 'casual periods; contractions welcome', forbiddenGenericStarts: ['Regarding', 'For documentation purposes'], requiredMoves: ['lower official tone', 'sound like a thread note'], profileTargets: { avgSentenceLength: 11, punctuationDensity: 0.07, contractionDensity: 0.14, warmth: 0.65, formality: 0.05, compression: 0.8 } },
  'forum-regular': { openingMoves: ['This looks like', 'The boring detail is'], sentenceArchitecture: 'public explanation with one qualifying clause', lexicalSignature: ['boring detail', 'lines up', 'keep together', 'thread'], punctuationSignature: 'commas allowed; no bureaucratic semicolon', forbiddenGenericStarts: ['Item one', 'I am submitting'], requiredMoves: ['make reasoning legible', 'avoid intimacy'], profileTargets: { avgSentenceLength: 18, punctuationDensity: 0.11, contractionDensity: 0.03, warmth: 0.25, formality: 0.35, compression: 1 } },
  'mutual-aid-coordinator': { openingMoves: ['I can help keep this organized', 'Let me put the next steps in one place'], sentenceArchitecture: 'care first, logistics second', lexicalSignature: ['organized', 'next steps', 'repeat', 'together'], punctuationSignature: 'warm commas; no legal terms unless source requires', forbiddenGenericStarts: ['Based on the record', 'Received'], requiredMoves: ['add care logistics', 'make action feel possible'], profileTargets: { avgSentenceLength: 17, punctuationDensity: 0.09, contractionDensity: 0.05, warmth: 0.85, formality: 0.2, compression: 1.05 } },
  'legal-intake': { openingMoves: ['For clarity', 'Based on the sequence'], sentenceArchitecture: 'chronological sequence with dates/literals foregrounded', lexicalSignature: ['sequence', 'document', 'original', 'altered'], punctuationSignature: 'precise commas; no slang', forbiddenGenericStarts: ['Hey yall', 'Tiny'], requiredMoves: ['order events chronologically', 'avoid emotional inference'], profileTargets: { avgSentenceLength: 18, punctuationDensity: 0.1, contractionDensity: 0, warmth: 0.05, formality: 0.78, compression: 0.98 } },
  'hr-portal': { openingMoves: ['I am submitting this to document', 'This note is to document'], sentenceArchitecture: 'flat compliance sentence; request sentence; no personality', lexicalSignature: ['document', 'submission', 'record', 'attachment'], punctuationSignature: 'plain periods; no dash', forbiddenGenericStarts: ['Interesting how', 'Tiny paperwork'], requiredMoves: ['flatten expressiveness', 'retain claim survival'], profileTargets: { avgSentenceLength: 16, punctuationDensity: 0.06, contractionDensity: 0, warmth: 0, formality: 0.75, compression: 0.85 } },
  'quirky-orbit': { openingMoves: ['Tiny signal', 'Small paperwork comet'], sentenceArchitecture: 'one controlled metaphor then a plain custody sentence', lexicalSignature: ['tiny', 'signal', 'float', 'seatbelt'], punctuationSignature: 'one dash allowed', forbiddenGenericStarts: ['Based on the record', 'Received'], requiredMoves: ['include one small image', 'return immediately to facts'], profileTargets: { avgSentenceLength: 16, punctuationDensity: 0.14, contractionDensity: 0.04, warmth: 0.5, formality: 0.08, compression: 1.05 } },
  'grandma-receipts': { openingMoves: ['I kept the paper because', 'Good thing the receipt stayed put'], sentenceArchitecture: 'warm memory-style opening plus locked fact sentence', lexicalSignature: ['kept', 'ask later', 'same', 'receipt'], punctuationSignature: 'plain periods; one warm comma allowed', forbiddenGenericStarts: ['Current status', 'For documentation purposes'], requiredMoves: ['sound warm but not chatty', 'keep receipt logic'], profileTargets: { avgSentenceLength: 15, punctuationDensity: 0.08, contractionDensity: 0.03, warmth: 0.8, formality: 0.18, compression: 0.95 } },
  'night-shift-note': { openingMoves: ['Leaving this before I log off', 'Quick handoff before I disappear'], sentenceArchitecture: 'tired handoff; short factual fragments', lexicalSignature: ['leaving', 'attached', 'log off', 'visible'], punctuationSignature: 'periods; no ornament', forbiddenGenericStarts: ['For clarity', 'Tiny signal'], requiredMoves: ['sound tired and practical', 'compress without losing literals'], profileTargets: { avgSentenceLength: 7, punctuationDensity: 0.05, contractionDensity: 0.02, warmth: 0.25, formality: 0.12, compression: 0.6 } },
  'library-ghost': { openingMoves: ['The document remains', 'The note should remain with'], sentenceArchitecture: 'quiet formal sentence with artifact distance', lexicalSignature: ['remains', 'legible', 'artifact', 'separate'], punctuationSignature: 'periods; restrained commas', forbiddenGenericStarts: ['Hey', 'Quick note'], requiredMoves: ['create distance', 'treat attachment as artifact'], profileTargets: { avgSentenceLength: 15, punctuationDensity: 0.07, contractionDensity: 0, warmth: 0.02, formality: 0.72, compression: 0.95 } },
  'soft-snark': { openingMoves: ['Interesting how', 'Funny how'], sentenceArchitecture: 'one bite, then the fact pinned down', lexicalSignature: ['interesting', 'apparently', 'useful part', 'anyway'], punctuationSignature: 'comma and period; optional dash', forbiddenGenericStarts: ['I am submitting', 'For clarity'], requiredMoves: ['add mild bite', 'do not escalate into accusation'], profileTargets: { avgSentenceLength: 14, punctuationDensity: 0.14, contractionDensity: 0.06, warmth: 0.32, formality: 0.08, compression: 0.9 } },
  'weather-report': { openingMoves: ['Current conditions', 'Observed status'], sentenceArchitecture: 'observational fragments; no speaker emotion', lexicalSignature: ['appears', 'noted', 'available', 'unchanged'], punctuationSignature: 'periods only', forbiddenGenericStarts: ['I feel', 'Hey yall'], requiredMoves: ['remove speaker presence', 'make observations instrument-like'], profileTargets: { avgSentenceLength: 7, punctuationDensity: 0.04, contractionDensity: 0, warmth: 0, formality: 0.55, compression: 0.65 } },
  'kitchen-table': { openingMoves: ['Putting this plainly', 'The part to keep on the table is'], sentenceArchitecture: 'plain care statement plus essential fact', lexicalSignature: ['plainly', 'matters', 'table', 'together'], punctuationSignature: 'simple commas; no official boilerplate', forbiddenGenericStarts: ['Regarding the record', 'Item one'], requiredMoves: ['keep human steadiness', 'avoid bureaucratic coldness'], profileTargets: { avgSentenceLength: 16, punctuationDensity: 0.08, contractionDensity: 0.04, warmth: 0.78, formality: 0.12, compression: 0.95 } },
  'clipboard': { openingMoves: ['Item one', 'Checklist'], sentenceArchitecture: 'numbered or itemized list; each unit short', lexicalSignature: ['item', 'attached', 'visible', 'keep together'], punctuationSignature: 'colons and periods', forbiddenGenericStarts: ['Quick note', 'Tiny signal'], requiredMoves: ['make a list', 'separate propositions'], profileTargets: { avgSentenceLength: 5, punctuationDensity: 0.16, contractionDensity: 0, warmth: 0.03, formality: 0.5, compression: 0.7 } },
  'burner-minimal': { openingMoves: ['Attached', 'Kept'], sentenceArchitecture: 'fragments only; under twelve words if possible', lexicalSignature: ['attached', 'visible', 'unchanged', 'together'], punctuationSignature: 'periods only', forbiddenGenericStarts: ['For reference', 'I want to make sure'], requiredMoves: ['maximum compression', 'no softening'], profileTargets: { avgSentenceLength: 3, punctuationDensity: 0.07, contractionDensity: 0, warmth: 0, formality: 0.18, compression: 0.35 } },
  'academic-caveat': { openingMoves: ['At minimum', 'This suggests'], sentenceArchitecture: 'long analytic sentence with caveat and one limitation', lexicalSignature: ['suggests', 'continuity', 'relevant', 'additional review'], punctuationSignature: 'commas and semicolons allowed', forbiddenGenericStarts: ['Hey', 'Received'], requiredMoves: ['increase caveat', 'avoid overclaiming'], profileTargets: { avgSentenceLength: 25, punctuationDensity: 0.15, contractionDensity: 0, warmth: 0.05, formality: 0.82, compression: 1.3 } },
  'neighbor-note': { openingMoves: ['Just leaving this here', 'Leaving this where it is easy to find'], sentenceArchitecture: 'ordinary local note; one sentence may be casual', lexicalSignature: ['leaving', 'easy to find', 'looks the same', 'before'], punctuationSignature: 'plain periods and commas', forbiddenGenericStarts: ['Based on the record', 'Current conditions'], requiredMoves: ['make it local and ordinary', 'avoid formal record voice'], profileTargets: { avgSentenceLength: 12, punctuationDensity: 0.07, contractionDensity: 0.08, warmth: 0.45, formality: 0.1, compression: 0.85 } }
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
  const diversity = { ...(MASK_DIVERSITY_BY_ID[mask.id] || {}), ...(mask.diversity || {}) };
  const transitionBank = [...new Set([...(mask.transitionBank || []), ...(TRANSITION_BANK_BY_DICTION[traits.diction] || TRANSITION_BANK_BY_DICTION.plain), ...(diversity.openingMoves || [])])];
  const dictionHints = [...(mask.dictionHints || []), ...(DICTION_HINTS_BY_DICTION[traits.diction] || DICTION_HINTS_BY_DICTION.plain), ...(diversity.lexicalSignature || []).map((word) => [word, word])];
  const avoidList = [...new Set([...(mask.avoidList || []), ...(diversity.forbiddenGenericStarts || []), ...(traits.contractionPosture === 'avoid' ? ["I'm", "don't", "can't", "won't", "it's"] : [])])];
  const exampleTransformPairs = mask.exampleTransformPairs || [];
  return { ...mask, writingTraits: traits, diversity, profileTargets: { ...(diversity.profileTargets || {}), ...(mask.profileTargets || {}) }, transitionBank, dictionHints, avoidList, exampleTransformPairs };
}

export function enrichHushMasks(masks = []) {
  return masks.map((mask) => enrichHushMask(mask));
}
