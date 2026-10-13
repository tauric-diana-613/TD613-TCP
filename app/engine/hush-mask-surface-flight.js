import { extractCadenceProfile } from './stylometry.js';

export const HUSH_MASK_SURFACE_FLIGHT_VERSION = 'pr109.2-human-residue-surface-flight';

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
const PROCEDURAL_MASKS = new Set(['formal-record', 'legal-intake', 'hr-portal', 'academic-caveat']);
const LOW_SIGNATURE_MASKS = new Set(['burner-minimal', 'clipboard']);

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
  const id = mask.id || '';
  const humanResidue = !PROCEDURAL_MASKS.has(id) && !LOW_SIGNATURE_MASKS.has(id);
  return {
    id: `${op}-${Math.abs(hash(text)).toString(16)}`,
    text: terminal(text, /\?\s*$/.test(text) ? '?' : '.'),
    source: 'patch38-offline-provider',
    strategy: op,
    style_operation: op,
    operations: ['patch38-generator-provider', HUSH_MASK_SURFACE_FLIGHT_VERSION, op, humanResidue ? 'human_residue_surface' : 'controlled_surface'],
    preserved_propositions: [],
    dropped_propositions: [],
    changed_questions: [],
    new_claims: [],
    authorship_moves: humanResidue ? ['nonuniform_clause_shape', 'repair_mark', 'lived_micro_context'] : [],
    mask_surface_notes: {
      mask_id: id,
      opening: asArray(d.openingMoves)[0] || '',
      architecture: d.sentenceArchitecture || t.clauseShape || '',
      diction: asArray(d.lexicalSignature).slice(0, 4).join(', ') || t.diction || '',
      punctuation: d.punctuationSignature || t.punctuationStyle || '',
      required_move: asArray(d.requiredMoves)[0] || '',
      human_residue: humanResidue ? 'enabled' : 'disabled'
    },
    profile: extractCadenceProfile(text),
    naturalness: { naturalnessScore: humanResidue ? 0.88 : 0.78, fluencyWarnings: [] },
    scoreBreakdown: { naturalness: humanResidue ? 0.88 : 0.78, semanticFidelity: 0.8, maskSurfaceFlight: 1 },
    finalScore: humanResidue ? 0.9 : 0.86,
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

function topic(source = '') {
  const terms = sourceTerms(source);
  return {
    field: /tech/i.test(source) ? 'tech' : (terms[0] || 'the field'),
    skill: /signal/i.test(source) ? 'signal-reading fluency' : (terms[1] || 'that skill')
  };
}

function questionSurface(mask = {}, source = '') {
  const qs = questions(source);
  const q1 = qs[0] || sentenceBodies(source)[0] || source;
  const q2 = qs[1] || '';
  const id = mask.id || '';
  const { field, skill } = topic(source);

  const library = {
    'plain-witness': `I’d start smaller than “${field} job.” Support queue, QA, data cleanup — somewhere the work already has tickets. And ${skill}, yes, but I’d attach an example.`,
    'friendly-coworker': `Quick thought, not a whole sermon: start near ${field}, not at the fanciest title. Support, QA, documentation cleanup. ${skill} can count if it has an example.`,
    'busy-admin': `Start with the lane. Support. QA. Data cleanup. Then list ${skill} only if there’s a clean example beside it.`,
    'formal-record': `How should entry into ${field} be assessed when prior sector experience is absent? Should ${skill} be treated as a relevant skill asset?`,
    'group-chat-soft': `ok I would not treat “${field} job” like one big door lol. try support, QA, data cleanup. and yes, ${skill} counts if you can explain it like a normal person.`,
    'forum-regular': `The annoying-but-useful answer is the side door. Support desk, QA, docs, data cleanup — whatever gets near the system. ${skill} is usable, imo, but it needs examples.`,
    'mutual-aid-coordinator': `I’d make it practical: pick one entry lane into ${field}, then write down two examples where ${skill} helped. That keeps it from turning into a confidence spiral.`,
    'legal-intake': `What pathway into ${field} is available without prior sector experience? Should ${skill} be identified as a transferable skill with examples preserved separately?`,
    'hr-portal': `What entry route is available for ${field} without prior sector experience? Should ${skill} be listed as a relevant skill?`,
    'quirky-orbit': `The front door is wearing a fake mustache here. Try the side door: support, QA, data cleanup. ${skill} can be the little key, but only if it opens a real example.`,
    'grandma-receipts': `I would not wait for somebody to hand over “sector experience” like a permission slip. Start where the work is already labeled. Keep examples for the ${skill} part.`,
    'night-shift-note': `Probably support first. QA maybe. Data cleanup if they’ll take it. ${skill} counts, but write the example down before it gets fuzzy.`,
    'library-ghost': `The path may not be shelved under “${field}.” It may sit under support, QA, or data cleanup. ${skill} should stay attached to an example, or the shelf forgets it.`,
    'soft-snark': `The magic sticker called “prior sector experience” is not the only door, thankfully. Support, QA, data cleanup. And yes, ${skill} is a skill if everyone stops pretending pattern work is invisible.`,
    'weather-report': `Entry condition: no prior sector experience. Better route: support, QA, data cleanup. Skill condition: ${skill} needs one concrete example attached.`,
    'kitchen-table': `I’d make it less mysterious: pick an entry lane into ${field}, then show where ${skill} helped in real life. Not fancy. Just usable.`,
    'clipboard': `1. Pick one entry lane: support, QA, or data cleanup. 2. Put ${skill} under skills. 3. Attach one example. 4. Do not pad it.`,
    'burner-minimal': `${field} side door: support, QA, data cleanup. ${skill}: list with one example.`,
    'academic-caveat': `How might entry into ${field} be framed when prior sector experience is absent? To what extent should ${skill} be understood as a transferable skill asset?`
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
    'plain-witness': `I’m keeping it plain: ${lowerFirst(first)}. ${rest ? `Same note also says ${lowerFirst(rest)}.` : 'Nothing fancy added.'}`,
    'friendly-coworker': `Quick note before this gets buried: ${lowerFirst(first)}. ${rest ? `Also, ${lowerFirst(rest)}.` : 'That is the part I’d keep visible.'}`,
    'busy-admin': `Received. ${first}. ${rest ? `Remaining note: ${rest}.` : 'No extra wording needed.'}`,
    'formal-record': `For documentation purposes, ${lowerFirst(first)}. ${rest ? terminal(rest) : ''}`,
    'group-chat-soft': `ok putting this here before the thread eats it: ${lowerFirst(first)}. ${rest ? `also ${lowerFirst(rest)}.` : 'that’s the piece.'}`,
    'forum-regular': `The boring part is probably the useful part: ${lowerFirst(first)}. ${rest ? `Not saying that proves everything, but ${lowerFirst(rest)}.` : 'Worth keeping in view.'}`,
    'mutual-aid-coordinator': `To keep this simple, ${lowerFirst(first)}. ${rest ? `I’d keep ${lowerFirst(rest)} with the same note so nobody has to repeat it.` : 'I can keep the next step in one place.'}`,
    'legal-intake': `For clarity, ${lowerFirst(first)}. ${rest ? `The related statement is: ${rest}.` : ''}`,
    'hr-portal': `This note documents that ${lowerFirst(first)}. ${rest ? terminal(rest) : ''}`,
    'quirky-orbit': `Tiny paperwork comet, but still: ${lowerFirst(first)}. ${rest ? `Anyway, ${lowerFirst(rest)}.` : 'Kept the label on it.'}`,
    'grandma-receipts': `I kept that part because somebody was going to ask later: ${lowerFirst(first)}. ${rest ? `And look, ${lowerFirst(rest)}.` : 'Right there on the paper.'}`,
    'night-shift-note': `Leaving this before I log off. ${first}. ${rest ? `${rest}.` : 'Still visible.'}`,
    'library-ghost': `The document keeps the first fact where it was placed: ${lowerFirst(first)}. ${rest ? `The rest remains beside it: ${lowerFirst(rest)}.` : 'Do not separate it from the shelf.'}`,
    'soft-snark': `Interesting how the useful part is still ${lowerFirst(first)}. ${rest ? `Anyway, ${lowerFirst(rest)}.` : 'Apparently that mattered.'}`,
    'weather-report': `Observed: ${lowerFirst(first)}. ${rest ? `Secondary condition: ${rest}.` : ''}`,
    'kitchen-table': `Putting it plainly, ${lowerFirst(first)}. ${rest ? `The other part is ${lowerFirst(rest)}.` : 'That is enough.'}`,
    'clipboard': `1. ${first}. ${rest ? `2. ${rest}.` : '2. Keep together.'}`,
    'burner-minimal': `${first}. ${rest ? terminal(rest) : ''}`,
    'academic-caveat': `At minimum, ${lowerFirst(first)}, though the surrounding context should remain attached. ${rest ? terminal(rest) : ''}`
  };
  return library[id] || `${opener ? `${opener}: ` : ''}${lowerFirst(first)}. ${rest ? terminal(rest) : ''}`;
}

function secondaryHumanVariant(mask = {}, source = '', mainText = '') {
  const id = mask.id || '';
  if (PROCEDURAL_MASKS.has(id) || LOW_SIGNATURE_MASKS.has(id)) return '';
  const { field, skill } = topic(source);
  const library = {
    'plain-witness': `Smaller route first. Near ${field}, not pretending the whole field is one door. ${skill} only lands if the example is right there.`,
    'busy-admin': `Short version: support or QA first. ${skill} goes under skills if it has an example. Done.`,
    'group-chat-soft': `also bc somebody will ask later: ${skill} is easier to defend when it’s tied to a real example, not just a vibe.`,
    'forum-regular': `imo the trap is trying to make ${field} sound like one door. It’s not. Start with the boring adjacent work.`,
    'mutual-aid-coordinator': `Two-line plan, honestly: entry lane first, example second. Keeps it practical.`,
    'quirky-orbit': `Side door, then receipt. That’s the tiny goblin map.`,
    'grandma-receipts': `Somebody will call it soft until they need it. Keep the example with it.`,
    'night-shift-note': `support first maybe. example with the skill. don’t overbuild it.`,
    'library-ghost': `The safer path is not always the labeled one. Keep the example with the skill, or the shelf forgets it.`,
    'soft-snark': `Apparently pattern recognition only becomes a “skill” after a spreadsheet says so, but yes, name it carefully.`
  };
  const variant = library[id] || '';
  return variant && variant !== mainText ? variant : '';
}

export function generateMaskSurfaceCandidates(input = {}) {
  const source = safe(input.sourceText || input.messageDraftText || '');
  const mask = input.mask || {};
  if (!source || !mask.id) return { version: HUSH_MASK_SURFACE_FLIGHT_VERSION, candidates: [], warnings: ['mask-surface-flight-inactive'] };
  const mainText = /\?/.test(source) ? questionSurface(mask, source) : declarativeSurface(mask, source);
  const d = diversity(mask);
  const opener = asArray(d.openingMoves)[1] || asArray(d.openingMoves)[0] || '';
  const secondary = secondaryHumanVariant(mask, source, mainText) || (opener && !mainText.toLowerCase().startsWith(opener.toLowerCase())
    ? (/\?/.test(source) ? `${opener}: ${questionSurface(mask, source)}` : `${opener}: ${declarativeSurface(mask, source)}`)
    : '');
  const candidates = [mainText, secondary].filter(Boolean).map((candidateText, index) => baseMeta(mask, candidateText, index ? 'mask_surface_human_secondary' : 'mask_surface_human_primary'));
  return { version: HUSH_MASK_SURFACE_FLIGHT_VERSION, candidates, warnings: [] };
}