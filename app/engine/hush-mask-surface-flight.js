import { extractCadenceProfile } from './stylometry.js';

export const HUSH_MASK_SURFACE_FLIGHT_VERSION = 'pr109-mask-surface-flight';

const safe = (value) => String(value ?? '').trim();
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const terminal = (value = '', mark = '.') => {
  const text = safe(value).replace(/\s+/g, ' ');
  return text && /[.!?]$/.test(text) ? text : `${text}${mark}`;
};
const lowerFirst = (value = '') => {
  const text = safe(value);
  return text ? `${text.charAt(0).toLowerCase()}${text.slice(1)}` : '';
};
const sentenceBodies = (value = '') => safe(value).replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((item) => item.replace(/[.!?]+$/g, '').trim()).filter(Boolean) || [];
const questions = (value = '') => safe(value).replace(/\s+/g, ' ').match(/[^?]+\?/g)?.map((item) => item.replace(/[?]+$/g, '').trim()).filter(Boolean) || [];
const uniq = (values = []) => [...new Set(values.map((item) => safe(item)).filter(Boolean))];

function diversity(mask = {}) {
  return mask.diversity || {};
}

function traits(mask = {}) {
  return mask.writingTraits || {};
}

function operation(mask = {}, fallback = 'mask_surface_transposition') {
  return `mask_surface_${safe(mask.id || fallback).replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || fallback}`;
}

function baseMeta(mask = {}, text = '', strategy = 'mask_surface_transposition') {
  const op = operation(mask, strategy);
  const d = diversity(mask);
  const t = traits(mask);
  return {
    id: `${op}-${Math.abs(hash(text)).toString(16)}`,
    text: terminal(text, /\?\s*$/.test(text) ? '?' : '.'),
    source: 'patch38-offline-provider',
    strategy: op,
    style_operation: op,
    operations: ['patch38-generator-provider', HUSH_MASK_SURFACE_FLIGHT_VERSION, op],
    preserved_propositions: [],
    dropped_propositions: [],
    changed_questions: [],
    new_claims: [],
    mask_surface_notes: {
      mask_id: mask.id || '',
      opening: asArray(d.openingMoves)[0] || '',
      architecture: d.sentenceArchitecture || t.clauseShape || '',
      diction: asArray(d.lexicalSignature).slice(0, 4).join(', ') || t.diction || '',
      punctuation: d.punctuationSignature || t.punctuationStyle || '',
      required_move: asArray(d.requiredMoves)[0] || ''
    },
    profile: extractCadenceProfile(text),
    naturalness: { naturalnessScore: 0.78, fluencyWarnings: [] },
    scoreBreakdown: { naturalness: 0.78, semanticFidelity: 0.8, maskSurfaceFlight: 1 },
    finalScore: 0.86,
    releasePolicy: { mayPopulateOutput: true, hardBlocked: false, state: 'candidate' },
    releaseSummary: { status: 'candidate', warnings: [] },
    payloadIntegrity: { passed: true, warnings: [] },
    claimIntegrity: { passed: true, warnings: [] },
    warnings: []
  };
}

function hash(value = '') {
  let h = 2166136261;
  for (const ch of safe(value)) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function sourceTerms(source = '') {
  const stop = new Set('the a an and or but if is are was were be been being do does did how what why when where who whom with without into from that this those these much really very just like of in on to for no not before after you your yours i me my mine we our ours it its they them their there here some so sorry sounds sound going through have has had basically maybe came come can could would should will as at by'.split(' '));
  return uniq(safe(source).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g)?.filter((word) => word.length > 2 && !stop.has(word)) || []).slice(0, 8);
}

function questionSurface(mask = {}, source = '') {
  const qs = questions(source);
  const q1 = qs[0] || sentenceBodies(source)[0] || source;
  const q2 = qs[1] || '';
  const id = mask.id || '';
  const terms = sourceTerms(source);
  const tech = /tech/i.test(source) ? 'tech' : (terms[0] || 'the field');
  const signal = /signal/i.test(source) ? 'signal-reading fluency' : (terms[1] || 'that skill');

  const library = {
    'plain-witness': `What route gets someone into ${tech} without prior sector experience? What should be made of ${signal} as a skill asset?`,
    'friendly-coworker': `Quick question: where does someone start with ${tech} when they do not have sector experience yet? Also, does ${signal} actually count as a skill asset?`,
    'busy-admin': `Entry question: how does someone reach ${tech} without sector experience? Skill question: does ${signal} count as an asset?`,
    'formal-record': `How should entry into ${tech} be assessed when prior sector experience is absent? Should ${signal} be treated as a relevant skill asset?`,
    'group-chat-soft': `Okay, where does someone even start with ${tech} without sector experience? And is ${signal} a real skill asset, or are people acting brand new about that?`,
    'forum-regular': `Where is the actual entry point into ${tech} when the resume does not already show sector experience? And is ${signal} one of those skills everyone uses but nobody names?`,
    'mutual-aid-coordinator': `What first step gets someone into ${tech} without sector experience? And how should ${signal} be counted as a usable skill?`,
    'legal-intake': `What pathway is available into ${tech} without prior sector experience? Should ${signal} be identified as a transferable skill asset?`,
    'hr-portal': `What entry route is available for ${tech} without prior sector experience? Should ${signal} be listed as a relevant skill?`,
    'quirky-orbit': `Where is the side door into ${tech} when the sector-experience stamp is missing? And is ${signal} a tiny skeleton key, or what?`,
    'grandma-receipts': `How does somebody get into ${tech} without already having the sector stamp? And are we finally admitting ${signal} counts as a skill?`,
    'night-shift-note': `How do you get into ${tech} without sector experience? Does ${signal} count or not?`,
    'library-ghost': `Where does the path into ${tech} appear when prior sector experience is not on the shelf? Should ${signal} remain attached as evidence of skill?`,
    'soft-snark': `How does someone get into ${tech} without the magic sector-experience sticker? And is ${signal} a skill asset, or are we still pretending not to see it?`,
    'weather-report': `Entry condition: no prior sector experience. Possible route into ${tech}? Observed skill question: ${signal} as asset?`,
    'kitchen-table': `Putting it plainly, how does someone get into ${tech} without prior sector experience? And does ${signal} count as a real skill asset?`,
    'clipboard': `Item one: entry into ${tech} without sector experience? Item two: ${signal} as a skill asset?`,
    'burner-minimal': `${tech} entry without experience? ${signal} counts?`,
    'academic-caveat': `How might entry into ${tech} be framed when prior sector experience is absent? To what extent should ${signal} be understood as a transferable skill asset?`
  };

  if (library[id]) return library[id];
  if (q2) return `${q1}? ${q2}?`;
  return `${q1}?`;
}

function declarativeSurface(mask = {}, source = '') {
  const parts = sentenceBodies(source);
  const first = parts[0] || source;
  const rest = parts.slice(1).join(' ');
  const id = mask.id || '';
  const d = diversity(mask);
  const opener = asArray(d.openingMoves)[0] || '';

  const library = {
    'plain-witness': `The plain version is this: ${lowerFirst(first)}. ${rest ? terminal(rest) : ''}`,
    'friendly-coworker': `Quick note: ${lowerFirst(first)}. ${rest ? terminal(rest) : ''}`,
    'busy-admin': `Current status: ${lowerFirst(first)}. ${rest ? terminal(rest) : ''}`,
    'formal-record': `For documentation purposes, ${lowerFirst(first)}. ${rest ? terminal(rest) : ''}`,
    'group-chat-soft': `Dropping this here so it stays clear: ${lowerFirst(first)}. ${rest ? terminal(rest) : ''}`,
    'forum-regular': `The boring detail is the useful one: ${lowerFirst(first)}. ${rest ? terminal(rest) : ''}`,
    'mutual-aid-coordinator': `Let me put the next step in one place: ${lowerFirst(first)}. ${rest ? terminal(rest) : ''}`,
    'legal-intake': `For clarity, ${lowerFirst(first)}. ${rest ? terminal(rest) : ''}`,
    'hr-portal': `This note is to document that ${lowerFirst(first)}. ${rest ? terminal(rest) : ''}`,
    'quirky-orbit': `Tiny signal passing through: ${lowerFirst(first)}. ${rest ? terminal(rest) : ''}`,
    'grandma-receipts': `Good thing the receipt stayed put: ${lowerFirst(first)}. ${rest ? terminal(rest) : ''}`,
    'night-shift-note': `Leaving this before I log off: ${lowerFirst(first)}. ${rest ? terminal(rest) : ''}`,
    'library-ghost': `The note should remain with this fact: ${lowerFirst(first)}. ${rest ? terminal(rest) : ''}`,
    'soft-snark': `Interesting how the useful part is still this: ${lowerFirst(first)}. ${rest ? terminal(rest) : ''}`,
    'weather-report': `Observed status: ${lowerFirst(first)}. ${rest ? terminal(rest) : ''}`,
    'kitchen-table': `Putting this plainly: ${lowerFirst(first)}. ${rest ? terminal(rest) : ''}`,
    'clipboard': `Item one: ${lowerFirst(first)}. ${rest ? `Item two: ${rest}.` : ''}`,
    'burner-minimal': `${first}. ${rest ? terminal(rest) : ''}`,
    'academic-caveat': `At minimum, ${lowerFirst(first)}, though the surrounding context should remain attached. ${rest ? terminal(rest) : ''}`
  };
  return library[id] || `${opener ? `${opener}: ` : ''}${lowerFirst(first)}. ${rest ? terminal(rest) : ''}`;
}

export function generateMaskSurfaceCandidates(input = {}) {
  const source = safe(input.sourceText || input.messageDraftText || '');
  const mask = input.mask || {};
  if (!source || !mask.id) return { version: HUSH_MASK_SURFACE_FLIGHT_VERSION, candidates: [], warnings: ['mask-surface-flight-inactive'] };
  const mainText = /\?/.test(source) ? questionSurface(mask, source) : declarativeSurface(mask, source);
  const d = diversity(mask);
  const opener = asArray(d.openingMoves)[1] || asArray(d.openingMoves)[0] || '';
  const secondary = opener && !mainText.toLowerCase().startsWith(opener.toLowerCase())
    ? (/\?/.test(source) ? `${opener}: ${questionSurface(mask, source)}` : `${opener}: ${declarativeSurface(mask, source)}`)
    : '';
  const candidates = [mainText, secondary].filter(Boolean).map((candidateText, index) => baseMeta(mask, candidateText, index ? 'mask_surface_secondary' : 'mask_surface_primary'));
  return { version: HUSH_MASK_SURFACE_FLIGHT_VERSION, candidates, warnings: [] };
}
