import { extractCadenceProfile } from './stylometry.js';
import { buildMeaningPlan } from './hush-meaning-plan.js';
import { buildRealizationPlan } from './hush-realization-plan.js';
import { scoreNaturalness } from './hush-naturalness.js';

export const HUSH_MASK_WRITER_VERSION = 'phase-16';

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
  if (directness === 'soft' && !/^It appears/i.test(value)) value = `It appears that ${value.charAt(0).toLowerCase()}${value.slice(1)}`;
  if (directness === 'blunt') value = value.replace(/^I think\s+/i, '').replace(/^It appears that\s+/i, '');
  return ensureTerminal(value);
}

function compressText(text = '') {
  return safeText(text).replace(/\b(?:actually|really|just|basically|honestly)\b/gi, '').replace(/\s+/g, ' ').trim();
}

function expandText(text = '', plan = {}) {
  const transition = asArray(plan.transitionBank)[0] || 'For reference';
  const value = safeText(text).trim();
  if (!value || value.toLowerCase().startsWith(transition.toLowerCase())) return value;
  return `${transition}, ${value.charAt(0).toLowerCase()}${value.slice(1)}`;
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

function strategyLayer(text = '', strategy = '', plan = {}) {
  const value = safeText(text).trim();
  if (!value) return '';
  const lower = value.charAt(0).toLowerCase() + value.slice(1);
  const transition = asArray(plan.transitionBank)[1] || 'Also';
  const map = {
    formal: `For reference, ${lower}`,
    'soft-witness': `I am keeping this plain: ${lower}`,
    'plain-witness': `What I can confirm is this: ${lower}`,
    memo: `Note: ${lower}`,
    'thread-note': `Leaving this here for the thread: ${lower}`,
    'record-note': `For the record, ${lower}`,
    balanced: `${transition}, ${lower}`
  };
  if (strategy === 'low-affect') return value.replace(/\b(?:please|thanks|thank you)\b/gi, '').replace(/\s+/g, ' ').trim();
  return map[strategy] || value;
}

function warmText(text = '') {
  const value = safeText(text).trim();
  return /^(just to keep|i want to make sure|thanks|also)/i.test(value) ? value : `Just to keep this clear, ${value.charAt(0).toLowerCase()}${value.slice(1)}`;
}

function legalMeasured(text = '') {
  const value = safeText(text).trim().replace(/\bproof\b/gi, 'supporting material').replace(/\bobviously\b/gi, 'the record appears to show');
  return /^(for clarity|based on the record)/i.test(value) ? value : `For clarity, ${value.charAt(0).toLowerCase()}${value.slice(1)}`;
}

function bureaucratic(text = '') {
  return safeText(text).replace(/\bI want\b/gi, 'I am requesting').replace(/\bshow\b/gi, 'indicate').replace(/\bhelp\b/gi, 'assist');
}

function casual(text = '') {
  const value = adjustContractions(safeText(text), 'frequent');
  return /^(hey|quick note|just)/i.test(value) ? value : `Quick note: ${value.charAt(0).toLowerCase()}${value.slice(1)}`;
}

function preserveProtectedLiterals(text = '', protectedLiterals = []) {
  let value = safeText(text).trim();
  for (const literal of asArray(protectedLiterals)) if (literal && !value.includes(literal)) value += ` ${literal}`;
  return ensureTerminal(value.replace(/\s+/g, ' '));
}

function applyAvoidList(text = '', avoidList = []) {
  return asArray(avoidList).reduce((current, item) => replacePlain(current, item, ''), safeText(text)).replace(/\s+/g, ' ').trim();
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
  text = strategyLayer(text, strategy, realizationPlan);
  if (strategy === 'warm-organizer' || traits.diction === 'warm') text = warmText(text);
  if (strategy === 'legal-measured' || traits.diction === 'legal') text = legalMeasured(text);
  if (strategy === 'dry-bureaucratic' || traits.diction === 'bureaucratic') text = bureaucratic(text);
  if (strategy === 'conversational' || traits.diction === 'casual') text = casual(text);
  text = applyDirectness(text, traits.directness);
  text = adjustContractions(text, traits.contractionPosture);
  text = applyAvoidList(text, realizationPlan.avoidList);
  text = preserveProtectedLiterals(text, input.protectedLiterals || input.meaningPlan?.protectedLiterals || []);
  return { id: input.id || `writer-candidate-${strategy}`, text, strategy, operations: [`strategy:${strategy}`, `diction:${traits.diction || 'plain'}`, `verbosity:${traits.verbosity || 'balanced'}`, `sentence:${traits.sentenceLength || 'medium'}`], warnings: [] };
}

export function repairMaskCandidate(input = {}) {
  const candidate = input.candidate || {};
  const text = preserveProtectedLiterals(candidate.text, input.protectedLiterals || input.meaningPlan?.protectedLiterals || []);
  const naturalness = scoreNaturalness({ text, mask: input.mask, realizationPlan: input.realizationPlan });
  return { ...candidate, text, profile: extractCadenceProfile(text), naturalness, warnings: [...new Set([...asArray(candidate.warnings), ...asArray(naturalness.fluencyWarnings)])] };
}

export function diversifyMaskCandidates(input = {}) {
  const requested = Number(input.candidateCount || 18);
  const baseStrategies = ['plain', 'compressed', 'expanded', 'short-sentence', 'long-sentence', 'procedural', 'conversational', 'formal', 'soft-witness', 'dry-bureaucratic', 'warm-organizer', 'legal-measured', 'plain-witness', 'low-affect', 'memo', 'thread-note', 'record-note', 'balanced'];
  const strategies = [];
  while (strategies.length < Math.max(1, requested)) strategies.push(baseStrategies[strategies.length % baseStrategies.length]);
  return strategies;
}

export function generateMaskWriterCandidates(input = {}) {
  const sourceText = safeText(input.sourceText);
  const protectedLiterals = uniq([...(input.protectedLiterals || []), ...(input.meaningPlan?.protectedLiterals || [])]);
  const meaningPlan = input.meaningPlan || buildMeaningPlan({ sourceText, protectedLiterals });
  const realizationPlan = input.realizationPlan || buildRealizationPlan({ mask: input.mask || {}, maskProfile: input.maskProfile });
  const candidateCount = Math.max(1, Math.min(36, Number(input.candidateCount || 18)));
  const candidates = diversifyMaskCandidates({ candidateCount }).map((strategy, index) => repairMaskCandidate({ ...input, id: `writer-candidate-${index + 1}`, strategy, meaningPlan, realizationPlan, protectedLiterals, candidate: writeMaskCandidate({ ...input, id: `writer-candidate-${index + 1}`, strategy, meaningPlan, realizationPlan, protectedLiterals }) }));
  const uniqueCandidates = [];
  const seen = new Set();
  for (const candidate of candidates) {
    const key = candidate.text.replace(/\s+/g, ' ').trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueCandidates.push(candidate);
  }
  return { version: HUSH_MASK_WRITER_VERSION, meaningPlan, realizationPlan, candidates: uniqueCandidates, warnings: uniqueCandidates.length < candidateCount ? ['candidate-deduplication-reduced-pool'] : [], limitations: ['Mask Writer generates local rewrite candidates; existing Hush scoring still decides viability.'] };
}
