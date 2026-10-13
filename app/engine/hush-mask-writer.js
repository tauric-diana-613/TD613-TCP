import { extractCadenceProfile } from './stylometry.js';
import { buildMeaningPlan } from './hush-meaning-plan.js';
import { buildRealizationPlan } from './hush-realization-plan.js';
import { scoreNaturalness } from './hush-naturalness.js';
import { auditHushCatchphraseQuarantine } from './hush-catchphrase-quarantine.js';

export const HUSH_MASK_WRITER_VERSION = 'phase-16.2-living-key-detox';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const uniq = (items) => [...new Set(asArray(items))];

function sentenceSplit(text = '') {
  const value = safeText(text).replace(/\s+/g, ' ').trim();
  if (!value) return [];
  return value.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((item) => item.trim()).filter(Boolean) || [value];
}

function ensureTerminal(text = '') {
  const value = safeText(text).trim();
  if (!value) return '';
  return /[.!?]$/.test(value) ? value : `${value}.`;
}

function replacePlain(text = '', from = '', to = '') {
  if (!from || !to) return text;
  return safeText(text).split(from).join(to).split(from.charAt(0).toUpperCase() + from.slice(1)).join(to.charAt(0).toUpperCase() + to.slice(1));
}

function applyDiction(text = '', plan = {}) {
  return asArray(plan.targetDictionHints).reduce((current, pair) => {
    if (!Array.isArray(pair) || pair.length < 2) return current;
    return replacePlain(current, safeText(pair[0]), safeText(pair[1]));
  }, safeText(text));
}

function adjustContractions(text = '', posture = 'mixed') {
  const value = safeText(text);
  if (posture === 'avoid') {
    return value.replaceAll("I'm", 'I am').replaceAll("don't", 'do not').replaceAll("doesn't", 'does not').replaceAll("can't", 'cannot').replaceAll("won't", 'will not').replaceAll("it's", 'it is');
  }
  if (posture === 'frequent') {
    return value.replaceAll('I am', "I'm").replaceAll('do not', "don't").replaceAll('does not', "doesn't").replaceAll('cannot', "can't").replaceAll('will not', "won't").replaceAll('it is', "it's");
  }
  return value;
}

function applyDirectness(text = '', directness = 'balanced') {
  let value = safeText(text).replace(/\s+/g, ' ').trim();
  if (directness === 'soft') value = value.replace(/^\s*(?:obviously|clearly)\s*,?\s*/i, '');
  if (directness === 'blunt') value = value.replace(/^I think\s+/i, '').replace(/^It appears that\s+/i, '');
  return ensureTerminal(value);
}

function compressText(text = '') {
  return safeText(text).replace(/\b(?:actually|really|just|basically|honestly)\b/gi, '').replace(/\s+/g, ' ').trim();
}

function expandText(text = '') {
  return safeText(text).trim();
}

function fragments(text = '') {
  return sentenceSplit(text).flatMap((part) => safeText(part).split(/,\s+|;\s+|\s+and\s+/i)).map((part) => safeText(part).replace(/[.!?]$/g, '').trim()).filter(Boolean);
}

function shapeSentences(text = '', traits = {}, strategy = '') {
  const parts = sentenceSplit(text);
  if (!parts.length) return '';
  if (strategy === 'short-sentence' || traits.sentenceLength === 'short' || traits.clauseShape === 'clipped') {
    return parts.flatMap((sentence) => safeText(sentence).split(/,\s+(?=and|but|so|then|because)/i)).map(ensureTerminal).join(' ');
  }
  if (strategy === 'long-sentence' || traits.sentenceLength === 'long' || traits.clauseShape === 'branching') {
    if (parts.length < 2) return parts.join(' ');
    return `${parts[0].replace(/[.!?]$/, '')}, while ${parts[1].charAt(0).toLowerCase()}${parts[1].slice(1)}`;
  }
  if (traits.clauseShape === 'list-driven' || strategy === 'procedural') {
    return parts.map((sentence, index) => `Item ${index + 1}: ${sentence.replace(/^item\s+\d+\s*:\s*/i, '')}`).join(' ');
  }
  return parts.join(' ');
}

function applyChatShorthand(text = '') {
  return safeText(text)
    .replace(/\bI do not know\b/gi, 'idk')
    .replace(/\bdo not\b/gi, 'dont')
    .replace(/\bbecause\b/gi, 'bc')
    .replace(/\bright now\b/gi, 'rn')
    .replace(/\band\b/gi, '+')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function lowSignature(text = '') {
  const bits = fragments(text).slice(0, 3);
  return bits.length ? bits.map((bit) => ensureTerminal(bit)).join(' ') : ensureTerminal(text);
}

function indexed(text = '') {
  const bits = fragments(text).slice(0, 4);
  if (!bits.length) return ensureTerminal(text);
  return bits.map((bit, index) => `${index + 1}. ${ensureTerminal(bit)}`).join(' ');
}

function slashShape(text = '') {
  return lowSignature(text).replace(/\.\s+/g, ' / ').replace(/[.]$/g, '');
}

function sourceDerivedIrregularity(text = '') {
  const value = safeText(text).trim();
  const parts = fragments(value);
  if (parts.length < 2) return ensureTerminal(value);
  return `${ensureTerminal(parts[0])} ${parts.slice(1, 3).map((part) => part.replace(/^\w/, (c) => c.toLowerCase())).map(ensureTerminal).join(' ')}`;
}

function sentenceStems(text = '') {
  return sentenceSplit(text).map((part) => part.replace(/[.!?]+$/g, '').trim()).filter(Boolean);
}

function sequenceShape(text = '', marker = 'numeric') {
  const parts = sentenceStems(text);
  if (parts.length < 2) return ensureTerminal(text);
  const labels = {
    alpha: (index) => `(${String.fromCharCode(97 + index)})`,
    bracket: (index) => `[${index + 1}]`,
    item: (index) => `Item ${index + 1}:`,
    padded: (index) => `${String(index + 1).padStart(2, '0')} /`,
    numeric: (index) => `${index + 1}.`
  };
  const label = labels[marker] || labels.numeric;
  return parts.map((part, index) => `${label(index)} ${ensureTerminal(part)}`).join(' ');
}

function joinedShape(text = '', separator = '; ') {
  const parts = sentenceStems(text);
  if (parts.length < 2) return ensureTerminal(text);
  const shaped = parts.map((part, index) => {
    if (!index) return part;
    const continuation = part.replace(/^(?:and|but|so)\s+/i, '');
    return /^[A-Z][a-z]/.test(continuation) ? continuation.charAt(0).toLowerCase() + continuation.slice(1) : continuation;
  });
  return ensureTerminal(shaped.join(separator));
}

function strategyLayer(text = '', strategy = '', plan = {}, mask = {}) {
  const value = safeText(text).trim();
  if (!value) return '';
  const id = safeText(mask.id);
  if (strategy === 'chat-shorthand') return applyChatShorthand(value);
  if (strategy === 'low-signature') return lowSignature(value);
  if (strategy === 'indexed') return indexed(value);
  if (strategy === 'jagged-note') return slashShape(value);
  if (strategy === 'small-circle') return sourceDerivedIrregularity(adjustContractions(value, 'frequent')).replace(/^Please\s+/i, '');
  if (strategy === 'night-handoff') return lowSignature(compressText(value));
  if (strategy === 'receipt-warm') return sourceDerivedIrregularity(adjustContractions(value, 'frequent'));
  if (strategy === 'snark-pin') return compressText(value);
  if (strategy === 'forum-slowdown') return shapeSentences(expandText(value, plan), { sentenceLength: 'long', clauseShape: 'branching' }, 'long-sentence');
  if (strategy === 'weird-orbit') return shapeSentences(value, { sentenceLength: 'short', clauseShape: 'clipped' }, 'short-sentence');
  if (strategy === 'archive-ghost') return adjustContractions(value, 'avoid');
  if (strategy === 'source-preserve') return value;
  if (strategy === 'register-turn') return adjustContractions(value, 'frequent');
  if (strategy === 'argument-cadence') return shapeSentences(value, { sentenceLength: 'long', clauseShape: 'branching' }, 'long-sentence');
  if (strategy === 'low-affect') return value.replace(/\b(?:please|thanks|thank you)\b/gi, '').replace(/\s+/g, ' ').trim();
  if (strategy === 'compressed') return joinedShape(value, '; ');
  if (strategy === 'expanded') return joinedShape(value, '. Also, ');
  if (strategy === 'conversational') return joinedShape(value, ' — ');
  if (strategy === 'formal') return sequenceShape(adjustContractions(value, 'avoid'), 'numeric');
  if (strategy === 'soft-witness') return joinedShape(applyDirectness(value, 'soft'), '; meanwhile, ');
  if (strategy === 'dry-bureaucratic') return sequenceShape(value, 'item');
  if (strategy === 'warm-organizer') return joinedShape(value, '; and ');
  if (strategy === 'legal-measured') return sequenceShape(value, 'alpha');
  if (strategy === 'plain-witness') return joinedShape(applyDirectness(value, 'soft'), ' / ');
  if (strategy === 'memo') return sequenceShape(value, 'padded');
  if (strategy === 'thread-note') return sequenceShape(value, 'bracket');
  if (strategy === 'record-note') return joinedShape(value, ' | ');
  if (strategy === 'balanced') return joinedShape(value, ': ');
  if (id === 'burner-minimal') return lowSignature(value);
  return value;
}

function warmText(text = '') {
  return sourceDerivedIrregularity(adjustContractions(safeText(text), 'frequent'));
}

function legalMeasured(text = '') {
  return safeText(text).trim().replace(/\bproof\b/gi, 'supporting material').replace(/\bobviously\b/gi, 'the record appears to show');
}

function bureaucratic(text = '') {
  return safeText(text).replace(/\bI want\b/gi, 'I am requesting').replace(/\bshow\b/gi, 'indicate').replace(/\bhelp\b/gi, 'assist');
}

function casual(text = '') {
  return adjustContractions(safeText(text), 'frequent');
}

function preserveProtectedLiterals(text = '', protectedLiterals = []) {
  let value = safeText(text).trim();
  for (const literal of asArray(protectedLiterals)) if (literal && !value.includes(literal)) value += ` ${literal}`;
  return ensureTerminal(value.replace(/\s+/g, ' '));
}

function applyAvoidList(text = '', avoidList = []) {
  return asArray(avoidList).reduce((current, item) => replacePlain(current, item, ''), safeText(text)).replace(/\s+/g, ' ').trim();
}

export function styleStrategiesForMask(mask = {}) {
  const id = safeText(mask.id);
  const family = safeText(mask.family).toLowerCase();
  const map = {
    'phase28-transform-to-chatspeak': ['chat-shorthand', 'low-signature', 'compressed', 'short-sentence'],
    'phase28-transform-to-aave': ['register-turn', 'argument-cadence', 'compressed', 'source-preserve'],
    'phase27-register-preserve': ['source-preserve', 'plain', 'low-affect', 'balanced'],
    'phase22-jagged-record': ['jagged-note', 'compressed', 'short-sentence', 'low-affect'],
    'group-chat-soft': ['small-circle', 'conversational', 'warm-organizer', 'soft-witness'],
    'night-shift-note': ['night-handoff', 'low-signature', 'compressed', 'short-sentence'],
    'burner-minimal': ['low-signature', 'compressed', 'low-affect', 'short-sentence'],
    'quirky-orbit': ['weird-orbit', 'balanced', 'expanded', 'short-sentence'],
    'grandma-receipts': ['receipt-warm', 'warm-organizer', 'soft-witness', 'plain-witness'],
    'soft-snark': ['snark-pin', 'low-affect', 'compressed', 'balanced'],
    'forum-regular': ['forum-slowdown', 'thread-note', 'balanced', 'expanded'],
    clipboard: ['indexed', 'procedural', 'compressed', 'memo'],
    'library-ghost': ['archive-ghost', 'formal', 'record-note', 'low-affect']
  };
  if (map[id]) return map[id];
  if (family.includes('chat')) return ['chat-shorthand', 'conversational', 'compressed'];
  if (family.includes('low signature')) return ['low-signature', 'compressed', 'low-affect'];
  if (family.includes('index')) return ['indexed', 'procedural', 'memo'];
  return [];
}

export function writeMaskCandidate(input = {}) {
  const unitText = asArray(input.meaningPlan?.units).map((unit) => unit.text).join(' ') || safeText(input.sourceText);
  const realizationPlan = input.realizationPlan || buildRealizationPlan({ mask: input.mask });
  const traits = realizationPlan.traits || {};
  const strategy = input.strategy || 'plain';
  let text = unitText;
  if (strategy === 'compressed' || traits.verbosity === 'compressed') text = compressText(text);
  if (strategy === 'expanded' || traits.verbosity === 'expansive') text = expandText(text, realizationPlan);
  text = applyDiction(text, realizationPlan);
  text = shapeSentences(text, traits, strategy);
  text = strategyLayer(text, strategy, realizationPlan, input.mask || {});
  if (strategy === 'warm-organizer' || traits.diction === 'warm') text = warmText(text);
  if (strategy === 'legal-measured' || traits.diction === 'legal') text = legalMeasured(text);
  if (strategy === 'dry-bureaucratic' || traits.diction === 'bureaucratic') text = bureaucratic(text);
  if (strategy === 'conversational' || traits.diction === 'casual') text = casual(text);
  text = applyDirectness(text, traits.directness);
  text = adjustContractions(text, traits.contractionPosture);
  text = applyAvoidList(text, realizationPlan.avoidList);
  text = preserveProtectedLiterals(text, input.protectedLiterals || input.meaningPlan?.protectedLiterals || []);
  return { id: input.id || `writer-candidate-${strategy}`, text, strategy, operations: [`strategy:${strategy}`, `diction:${traits.diction || 'plain'}`, `verbosity:${traits.verbosity || 'balanced'}`, `sentence:${traits.sentenceLength || 'medium'}`, 'catchphrase-detox:structural-operator'], warnings: [] };
}

export function repairMaskCandidate(input = {}) {
  const candidate = input.candidate || {};
  const text = preserveProtectedLiterals(candidate.text, input.protectedLiterals || input.meaningPlan?.protectedLiterals || []);
  const naturalness = scoreNaturalness({ text, mask: input.mask, realizationPlan: input.realizationPlan });
  const catchphraseQuarantine = auditHushCatchphraseQuarantine({ text, sourceText: input.sourceText, mask: input.mask, sampleTexts: [input.mask?.sampleSeed, input.mask?.description] });
  return { ...candidate, text, profile: extractCadenceProfile(text), naturalness, catchphraseQuarantine, warnings: [...new Set([...asArray(candidate.warnings), ...asArray(naturalness.fluencyWarnings), ...asArray(catchphraseQuarantine.warnings)])] };
}

export function diversifyMaskCandidates(input = {}) {
  const requested = Number(input.candidateCount || 18);
  const baseStrategies = ['plain', 'compressed', 'expanded', 'short-sentence', 'long-sentence', 'procedural', 'conversational', 'formal', 'soft-witness', 'dry-bureaucratic', 'warm-organizer', 'legal-measured', 'plain-witness', 'low-affect', 'memo', 'thread-note', 'record-note', 'balanced'];
  const maskStrategies = styleStrategiesForMask(input.mask || {});
  const pool = uniq([...maskStrategies, ...baseStrategies]);
  const strategies = [];
  while (strategies.length < Math.max(1, requested)) strategies.push(pool[strategies.length % pool.length]);
  return strategies;
}

export function generateMaskWriterCandidates(input = {}) {
  const sourceText = safeText(input.sourceText);
  const protectedLiterals = uniq([...(input.protectedLiterals || []), ...(input.meaningPlan?.protectedLiterals || [])]);
  const meaningPlan = input.meaningPlan || buildMeaningPlan({ sourceText, protectedLiterals });
  const realizationPlan = input.realizationPlan || buildRealizationPlan({ mask: input.mask || {}, maskProfile: input.maskProfile });
  const candidateCount = Math.max(1, Math.min(36, Number(input.candidateCount || 18)));
  const candidates = diversifyMaskCandidates({ candidateCount, mask: input.mask || {} }).map((strategy, index) => repairMaskCandidate({ ...input, id: `writer-candidate-${index + 1}`, strategy, sourceText, meaningPlan, realizationPlan, protectedLiterals, candidate: writeMaskCandidate({ ...input, id: `writer-candidate-${index + 1}`, strategy, meaningPlan, realizationPlan, protectedLiterals }) }));
  const uniqueCandidates = [];
  const seen = new Set();
  for (const candidate of candidates) {
    const key = candidate.text.replace(/\s+/g, ' ').trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueCandidates.push(candidate);
  }
  const detoxedCandidates = uniqueCandidates.filter((candidate) => candidate.catchphraseQuarantine?.passed !== false);
  return { version: HUSH_MASK_WRITER_VERSION, meaningPlan, realizationPlan, candidates: detoxedCandidates.length ? detoxedCandidates : uniqueCandidates, warnings: [...(uniqueCandidates.length < candidateCount ? ['candidate-deduplication-reduced-pool'] : []), ...(detoxedCandidates.length < uniqueCandidates.length ? ['catchphrase-quarantine-filtered-local-writer-candidates'] : [])], limitations: ['Mask Writer generates local rewrite candidates; existing Hush scoring still decides viability.', 'Mask Writer uses structural style operators only; fixed persona slogans are quarantined.'] };
}
