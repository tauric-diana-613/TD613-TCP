import { buildPropositionMap } from './hush-proposition-map.js';

export const HUSH_ONTOLOGY_ROUTE_VERSION = 'phase-35-ontology-route';

const safe = (value) => String(value ?? '').trim();
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const lower = (value) => safe(value).toLowerCase();

const FORBIDDEN_COLLAPSE = [
  'Just keeping this organized',
  'should stay with the note',
  'That keeps the context together',
  'For the record',
  'record anchor',
  'The point is preservation'
];

function sourceType(map) {
  if (map.questionCount && map.propositionCount <= 3) return 'short-question';
  if (map.claimCount) return 'witness-record';
  if (map.metaphorCount) return 'expressive-theory';
  if (map.uncertaintyCount) return 'uncertainty-reflection';
  return 'general-prose';
}

function routeType(map, mask = {}) {
  const maskText = lower(`${mask.id || ''} ${mask.label || ''} ${mask.family || ''} ${mask.description || ''}`);
  if (map.questionCount && /signal|skill|tech|career|question/.test(maskText + ' ' + map.routeHint)) return 'question-legibility';
  if (map.questionCount) return 'everyday-question';
  if (map.claimCount && /witness|plain|legal|record/.test(maskText)) return 'plain-witness';
  if (map.claimCount) return 'witness-safe';
  if (map.metaphorCount && /lyric|oracle|goth|alien|theory|expressive/.test(maskText)) return 'lyric-cadence';
  if (map.metaphorCount) return 'expressive-theory';
  if (/jagged|glitch|fracture|blip/.test(maskText)) return 'jagged-disguise';
  if (/chat|casual|text|blip/.test(maskText)) return 'casual-register';
  return 'mask-surface';
}

function semanticRisk(map) {
  if (map.claimCount || map.negationCount) return 'high';
  if (map.questionCount || map.uncertaintyCount) return 'medium';
  return 'low';
}

function transformationDepth(map, mask = {}) {
  const maskText = lower(`${mask.family || ''} ${mask.description || ''}`);
  if (map.claimCount) return 'light';
  if (/jagged|lyric|oracle|expressive|goth/.test(maskText)) return 'deep';
  return 'medium';
}

function maskSurface(mask = {}) {
  const profile = mask.profile || {};
  return {
    maskId: mask.id || '',
    displayName: mask.label || mask.name || '',
    register: mask.family || '',
    rhythm: profile.rhythm || profile.sentenceRhythm || '',
    formality: profile.formality || '',
    warmth: profile.warmth || '',
    compression: profile.compression || '',
    metaphorTolerance: profile.metaphorTolerance || 'medium',
    forbiddenPhrases: FORBIDDEN_COLLAPSE,
    desiredMoves: asArray(mask.transformHints?.desiredMoves).slice(0, 8)
  };
}

function directives(map, route) {
  const list = [];
  if (map.questionCount) list.push('preserve questions as questions', 'do not answer the questions', 'preserve curiosity and uncertainty');
  if (map.uncertaintyCount) list.push('preserve uncertainty rather than resolving it');
  if (map.claimCount) list.push('do not invent actors', 'do not strengthen accusation', 'preserve witness caution');
  if (map.metaphorCount) list.push('preserve metaphor payload when possible');
  if (route === 'jagged-disguise') list.push('shift surface rhythm without damaging proposition map');
  if (route === 'lyric-cadence') list.push('allow metaphor and line-level image pressure');
  list.push('avoid custody-wrapper framing', 'do not add new factual claims');
  return [...new Set(list)].slice(0, 12);
}

export function buildOntologyRoute(input = {}) {
  const sourceText = input.sourceText || input.messageDraftText || '';
  const propositionMap = input.propositionMap || buildPropositionMap(sourceText);
  const route = routeType(propositionMap, input.mask || {});
  return {
    version: HUSH_ONTOLOGY_ROUTE_VERSION,
    routeType: route,
    sourceType: sourceType(propositionMap),
    propositionMap,
    maskSurface: maskSurface(input.mask || {}),
    ontologyHints: {
      allowedMoves: directives(propositionMap, route),
      forbiddenMoves: [...FORBIDDEN_COLLAPSE, ...propositionMap.forbiddenChanges],
      cadencePressure: route,
      semanticRisk: semanticRisk(propositionMap),
      transformationDepth: transformationDepth(propositionMap, input.mask || {})
    }
  };
}

export function compileRemoteRoutePayload(route = {}) {
  return {
    version: route.version || HUSH_ONTOLOGY_ROUTE_VERSION,
    routeType: route.routeType || 'mask-surface',
    sourceType: route.sourceType || 'general-prose',
    maskSurface: route.maskSurface || {},
    ontologyHints: route.ontologyHints || {},
    propositionSummary: {
      propositionCount: route.propositionMap?.propositionCount || 0,
      questionCount: route.propositionMap?.questionCount || 0,
      claimCount: route.propositionMap?.claimCount || 0,
      uncertaintyCount: route.propositionMap?.uncertaintyCount || 0,
      negationCount: route.propositionMap?.negationCount || 0,
      metaphorCount: route.propositionMap?.metaphorCount || 0,
      propositions: asArray(route.propositionMap?.propositions).map((p) => ({ id: p.id, type: p.type, intent: p.intent, mustRemainQuestion: p.mustRemainQuestion, coreTerms: p.coreTerms })).slice(0, 8)
    }
  };
}
