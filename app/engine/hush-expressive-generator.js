import { extractCadenceProfile } from './stylometry.js';
import { detectExpressivePayload, expressiveCandidateScore, HUSH_EXPRESSIVE_PAYLOAD_VERSION } from './hush-expressive-payload.js';

export const HUSH_EXPRESSIVE_GENERATOR_VERSION = 'phase-34-expressive-generation';

const safe = (value) => String(value ?? '').trim();
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const uniq = (values = []) => [...new Set(values.filter(Boolean))];

function terminal(text = '') {
  const value = safe(text).replace(/\s+/g, ' ');
  if (!value) return '';
  return /[.!?]$/.test(value) ? value : `${value}.`;
}

function sentenceSplit(text = '') {
  const value = safe(text).replace(/\s+/g, ' ');
  return value.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((item) => item.trim()).filter(Boolean) || (value ? [value] : []);
}

function has(text = '', pattern) {
  return pattern.test(String(text || ''));
}

export function buildExpressivePayloadMap(sourceText = '') {
  const source = safe(sourceText);
  const sentences = sentenceSplit(source);
  const expressive = detectExpressivePayload(source);
  const anchors = expressive.anchors.map((anchor) => anchor.id);
  const fragments = {
    custodian: has(source, /custodian/i) ? 'I am a custodian, not a judge, jury, or executioner' : '',
    rose: has(source, /rose\s*bush|pruning|incipience/i) ? 'the rose bush has to be pruned in its incipience' : '',
    rot: has(source, /rot\s+latency|potentiality\s+of\s+rot|potential\s+for\s+rot/i) ? 'rot latency has to be exposed before it becomes infrastructure' : '',
    dromology: has(source, /dromological\s+anchors?/i) ? 'dromological anchors belong inside the builder’s own framework' : '',
    frameworks: has(source, /scholastic\s+frameworks?|system\s+builder|frameworks?/i) ? 'scholastic frameworks can forecast where rot may hide' : '',
    care: has(source, /protect\s+others|uplift\s+them|as\s+they\s+build|builders?\s+like\s+me/i) ? 'the aim is to protect builders and uplift their work' : '',
    beauty: has(source, /make\s+it\s+beautiful|beautiful\s+to\s+me|expose\s+the\s+potentiality/i) ? 'beauty begins by exposing the potentiality of rot' : '',
    aside: has(source, /\([^)]{8,}\)/) ? '(do they still have those?)' : ''
  };
  return { version: HUSH_EXPRESSIVE_GENERATOR_VERSION, expressive, anchors, fragments, sentences };
}

function maskFlavor(mask = {}) {
  const text = `${mask.label || ''} ${mask.family || ''} ${mask.description || ''} ${mask.intendedUse || ''}`.toLowerCase();
  if (/jagged|glitch|fracture|hard|chaos|blip/.test(text)) return 'jagged';
  if (/legal|witness|record|plain|formal/.test(text)) return 'plain';
  if (/warm|care|soft|sister|hearth/.test(text)) return 'warm';
  if (/bureau|clerk|memo|administrative/.test(text)) return 'bureaucratic';
  if (/lyric|poetic|oracle|goth|alien|theory/.test(text)) return 'lyric';
  return 'balanced';
}

function compose(map, style = 'balanced') {
  const f = map.fragments;
  const base = [];
  if (f.custodian) base.push(f.custodian);
  if (f.beauty || f.rot) base.push(`${f.beauty || 'beauty begins in diagnosis'}; ${f.rot || 'the risk has to be seen early'}`);
  if (f.rose) base.push(`The rose-bush lesson stays intact: ${f.rose}${f.aside ? ` ${f.aside}` : ''}`);
  if (f.frameworks || f.dromology) base.push(`${f.frameworks || 'the framework should forecast strain'}, and ${f.dromology || 'the anchor should sit where builders can use it'}`);
  if (f.care) base.push(f.care);
  const complete = base.map(terminal);
  if (style === 'jagged') return complete.map((line, index) => index % 2 ? line : line.replace(/;\s*/g, '. ')).join(' ');
  if (style === 'plain') return complete.join(' ');
  if (style === 'warm') return complete.join(' ').replace('the aim is', 'my aim is');
  if (style === 'bureaucratic') return complete.join(' ').replace('beauty begins', 'The design standard begins').replace('the aim is', 'The stated purpose is');
  if (style === 'lyric') return complete.join(' ').replace('rot latency has to be exposed before it becomes infrastructure', 'rot latency has to be named before it hardens into the house').replace('the rose bush has to be pruned in its incipience', 'the rose bush teaches the mercy of early pruning');
  return complete.join(' ');
}

function operations(style, map) {
  return uniq(['phase34-expressive-generation', `style:${style}`, ...map.anchors.map((anchor) => `anchor:${anchor}`)]);
}

export function generateExpressiveCandidates(input = {}) {
  const sourceText = safe(input.sourceText || input.messageDraftText || '');
  const map = buildExpressivePayloadMap(sourceText);
  if (!map.expressive.active) return { version: HUSH_EXPRESSIVE_GENERATOR_VERSION, expressive: map.expressive, candidates: [], warnings: ['expressive-payload-inactive'] };
  const flavor = maskFlavor(input.mask || {});
  const styles = uniq([flavor, 'balanced', 'plain', 'lyric', 'warm', 'jagged']).slice(0, 6);
  const candidates = styles.map((style, index) => {
    const text = compose(map, style);
    const candidate = {
      id: `phase34-expressive-${style}-${index + 1}`,
      text,
      source: 'phase34-expressive-generator',
      strategy: `expressive-${style}`,
      operations: operations(style, map),
      warnings: [],
      profile: extractCadenceProfile(text),
      naturalness: { naturalnessScore: 0.72, fluencyWarnings: [] },
      scoreBreakdown: { naturalness: 0.72, semanticFidelity: 0.72, expressiveGeneration: 1 },
      finalScore: 0.72
    };
    const expressiveScore = expressiveCandidateScore(candidate, sourceText, map.expressive);
    return { ...candidate, expressiveScore, finalScore: Math.max(candidate.finalScore, expressiveScore.score) };
  });
  return { version: HUSH_EXPRESSIVE_GENERATOR_VERSION, expressive: map.expressive, payloadMap: map, candidates, warnings: [] };
}
