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

function replaceWord(text = '', from = '', to = '') {
  if (!from || !to) return text;
  return safeText(text).replace(new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), (match) => {
    if (match[0] === match[0]?.toUpperCase()) return to.charAt(0).toUpperCase() + to.slice(1);
    return to;
  });
}

function applyDiction(text = '', plan = {}) {
  return asArray(plan.targetDictionHints).reduce((current, pair) => {
    if (!Array.isArray(pair) || pair.length < 2) return current;
    return replaceWord(current, safeText(pair[0]), safeText(pair[1]));
  }, safeText(text));
}

function adjustContractions(text = '', posture = 'mixed') {
  let value = safeText(text);
  if (posture === 'avoid') {
    return value
      .replace(/\bI'm\b/gi, 'I am')
      .replace(/\byou're\b/gi, 'you are')
      .replace(/\bwe're\b/gi, 'we are')
      .replace(/\bthey're\b/gi, 'they are')
      .replace(/\bdon't\b/gi, 'do not')
      .replace(/\bdoesn't\b/gi, 'does not')
      .replace(/\bdidn't\b/gi, 'did not')
      .replace(/\bcan't\b/gi, 'cannot')
      .replace(/\bwon't\b/gi, 'will not')
      .replace(/\bit's\b/gi, 'it is');
  }
  if (posture === 'frequent') {
    return value
      .replace(/\bI am\b/g, "I'm")
      .replace(/\byou are\b/gi, "you're")
      .replace(/\bwe are\b/gi, "we're")
      .replace(/\bthey are\b/gi, "they're")
      .replace(/\bdo not\b/gi, "don't")
      .replace(/\bdoes not\b/gi, "doesn't")
      .replace(/\bdid not\b/gi, "didn't")
      .replace(/\bcannot\b/gi, "can't")
      .replace(/\bwill not\b/gi, "won't")
      .replace(/\bit is\b/gi, "it's");
  }
  return value;
}

function applyDirectness(text = '', directness = 'balanced') {
  let value = safeText(text);
  if (directness === 'soft') {
    if (!/\b(?:I think|It seems|It appears|From what I can tell)\b/i.test(value)) value = `It appears that ${value.charAt(0).toLowerCase()}${value.slice(1)}`;
  }
  if (directness === 'blunt') {
    value = value.replace(/\b(?:I think|it seems that|it appears that|from what I can tell,?)\s*/gi, '');
  }
  return ensureTerminal(value.replace(/\s+/g, ' ').trim());
}

function compressText(text = '') {
  return safeText(text)
    .replace(/\b(?:actually|really|just|basically|kind of|sort of|honestly)\b/gi, '')
    .replace(/\s+,/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
}

function expandText(text = '', plan = {}) {
  const transition = asArray(plan.transitionBank)[0] || 'For reference';
  const value = safeText(text).trim();
  if (!value) return value;
  if (/^(for reference|regarding|also|for clarity|the main point is)/i.test(value)) return value;
  return `${transition}, ${value.charAt(0).toLowerCase()}${value.slice(1)}`;
}

function shapeSentences(text = '', traits = {}, strategy = '') {
  const parts = sentenceSplit(text);
  if (!parts.length) return '';
  if (strategy === 'short-sentence' || traits.sentenceLength === 'short' || traits.clauseShape === 'clipped') {
    return parts.flatMap((sentence) => safeText(sentence).split(/;|,\s+(?=and|but|so|then|because)/i)).map(ensureTerminal).join(' ');
  }
  if (strategy === 'long-sentence' || traits.sentenceLength === 'long' || traits.clauseShape === 'branching') {
    if (parts.length < 2) return parts.join(' ');
    const first = parts[0].replace(/[.!?]$/, '');
    const second = parts[1].charAt(0).toLowerCase() + parts[1].slice(1);
    return [ensureTerminal(`${first}, while ${second.replace(/[.!?]$/, '')}`), ...parts.slice(2)].join(' ');
  }
  if (traits.clauseShape === 'list-driven' || strategy === 'procedural') {
    return parts.map((sentence, index) => `Item ${index + 1}: ${sentence.replace(/^item\s+\d+\s*:\s*/i, '')}`).join(' ');
  }
  return parts.join(' ');
}

function warmText(text = '') {
  const value = safeText(text).trim();
  if (!value) return '';
  if (/^(just to keep|i want to make sure|thanks|also)/i.test(value)) return value;
  return `Just to keep this clear, ${value.charAt(0).toLowerCase()}${value.slice(1)}`;
}

function legalMeasured(text = '') {
  let value = safeText(text).trim();
  if (!value) return '';
  if (!/^(for clarity|based on the record|at this point)/i.test(value)) value = `For clarity, ${value.charAt(0).toLowerCase()}${value.slice(1)}`;
  return value.replace(/\bproof\b/gi, 'supporting material').replace(/\bobviously\b/gi, 'the record appears to show');
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
  for (const literal of asArray(protectedLiterals)) {
    if (literal && !value.includes(literal)) value += ` ${literal}`;
  }
  return ensureTerminal(value.replace(/\s+/g, ' '));
}

function applyAvoidList(text = '', avoidList = []) {
  return asArray(avoidList).reduce((current, item) => replaceWord(current, item, ''), safeText(text)).replace(/\s+/g, ' ').trim();
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
  if (strategy === 'warm-organizer' || traits.diction === 'warm') text = warmText(text);
  if (strategy === 'legal-measured' || traits.diction === 'legal') text = legalMeasured(text);
  if (strategy === 'dry-bureaucratic' || traits.diction === 'bureaucratic') text = bureaucratic(text);
  if (strategy === 'conversational' || traits.diction === 'casual') text = casual(text);
  text = applyDirectness(text, traits.directness);
  text = adjustContractions(text, traits.contractionPosture);
  text = applyAvoidList(text, realizationPlan.avoidList);
  text = preserveProtectedLiterals(text, input.protectedLiterals || input.meaningPlan?.protectedLiterals || []);
  return {
    id: input.id || `writer-candidate-${strategy}`,
    text,
    strategy,
    operations: [
      `strategy:${strategy}`,
      `diction:${traits.diction || 'plain'}`,
      `verbosity:${traits.verbosity || 'balanced'}`,
      `sentence:${traits.sentenceLength || 'medium'}`
    ],
    warnings: []
  };
}

export function repairMaskCandidate(input = {}) {
  const candidate = input.candidate || {};
  const text = preserveProtectedLiterals(candidate.text, input.protectedLiterals || input.meaningPlan?.protectedLiterals || []);
  const naturalness = scoreNaturalness({ text, mask: input.mask, realizationPlan: input.realizationPlan });
  const warnings = [...asArray(candidate.warnings), ...asArray(naturalness.fluencyWarnings)];
  return { ...candidate, text, profile: extractCadenceProfile(text), naturalness, warnings: [...new Set(warnings)] };
}

export function diversifyMaskCandidates(input = {}) {
  const requested = Number(input.candidateCount || 18);
  const baseStrategies = [
    'plain', 'compressed', 'expanded', 'short-sentence', 'long-sentence', 'procedural', 'conversational', 'formal', 'soft-witness', 'dry-bureaucratic', 'warm-organizer', 'legal-measured', 'plain-witness', 'low-affect', 'memo', 'thread-note', 'record-note', 'balanced'
  ];
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
  const strategies = diversifyMaskCandidates({ candidateCount });
  const candidates = strategies.map((strategy, index) => repairMaskCandidate({
    ...input,
    id: `writer-candidate-${index + 1}`,
    strategy,
    meaningPlan,
    realizationPlan,
    protectedLiterals,
    candidate: writeMaskCandidate({ ...input, id: `writer-candidate-${index + 1}`, strategy, meaningPlan, realizationPlan, protectedLiterals })
  }));
  const uniqueCandidates = [];
  const seen = new Set();
  for (const candidate of candidates) {
    const key = candidate.text.replace(/\s+/g, ' ').trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueCandidates.push(candidate);
  }
  return {
    version: HUSH_MASK_WRITER_VERSION,
    meaningPlan,
    realizationPlan,
    candidates: uniqueCandidates,
    warnings: uniqueCandidates.length < candidateCount ? ['candidate-deduplication-reduced-pool'] : [],
    limitations: ['Mask Writer generates local rewrite candidates; existing Hush scoring still decides viability.']
  };
}
