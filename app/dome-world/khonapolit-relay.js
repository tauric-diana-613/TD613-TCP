import {
  CLAIMED_PUA,
  COVENANT_KEY,
  EMERGENCE_NAME,
  HERITAGE_KEY,
  INGRESS_SIGIL,
  SEAL_GLYPH
} from './khonapolit-covenant.js';
import { APERTURE_V3_VERSION, apertureV3DisplayHeader } from '../engine/aperture-v3-task-intent.js';

export const KHONAPOLIT_RELAY_SCHEMA = 'td613.khonapolit.integrated-covenant-relay/v4-soft-quality-admission';
export const HIGH_ZALGO_VERSION = 'td613.high-zalgo/provider-native-v4-expressive-cadence';

export const KHONAPOLIT_RELAY_RESPONSE_SCHEMA = Object.freeze({
  type: 'OBJECT',
  required: ['signal', 'transmission'],
  properties: {
    signal: {
      type: 'OBJECT',
      required: ['state', 'notes'],
      properties: {
        state: { type: 'STRING', enum: ['LOCKED', 'PARTIAL', 'NOT_LOCKED'] },
        notes: { type: 'STRING' }
      }
    },
    transmission: {
      type: 'OBJECT',
      required: ['text', 'voices', 'flourishMode'],
      properties: {
        text: { type: 'STRING' },
        voices: { type: 'ARRAY', items: { type: 'STRING' } },
        flourishMode: { type: 'STRING' }
      }
    }
  }
});

const PROTECTED = Object.freeze([
  COVENANT_KEY,
  CLAIMED_PUA,
  EMERGENCE_NAME,
  HERITAGE_KEY,
  INGRESS_SIGIL,
  SEAL_GLYPH
]);

/* Legacy helper retained only for archived fixtures/import compatibility. The
 * live parser never calls it. Provider-native marks are the runtime law. */
const ABOVE = Object.freeze(['\u0300','\u0301','\u0302','\u0303','\u0304','\u0305','\u0306','\u0307','\u0308','\u0309','\u030A','\u030B','\u030C','\u0342','\u0343','\u0344','\u0350','\u0351','\u0352','\u0357','\u035B','\u0360','\u0361']);
const BELOW = Object.freeze(['\u0316','\u0317','\u0318','\u0319','\u031C','\u031D','\u031E','\u031F','\u0320','\u0323','\u0324','\u0325','\u0326','\u0329','\u032A','\u032B','\u032C','\u032D','\u032E','\u032F','\u0330','\u0331','\u0332','\u0345']);
const THROUGH = Object.freeze(['\u0334','\u0335','\u0336','\u0337','\u0338']);

function safe(value = '') { return String(value ?? '').trim(); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
function hash32(value = '') {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function pick(list, seed) { return list[Math.abs(seed) % list.length]; }

export function highZalgoEncode(value = '', { intensity = 3, motif = 'legacy-fixture', seed = '' } = {}) {
  const level = clamp(intensity, 0, 5);
  const text = String(value ?? '');
  if (!text || !level) return text;
  const protectedPattern = new RegExp(`(${PROTECTED.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gu');
  const baseSeed = hash32(`${seed}|${motif}|${text.length}`);
  return text.split(protectedPattern).map((segment, segmentIndex) => {
    if (PROTECTED.includes(segment)) return segment;
    let letterIndex = 0;
    return [...segment].map((char) => {
      if (!/[\p{L}\p{N}]/u.test(char)) return char;
      const local = (baseSeed + segmentIndex * 977 + letterIndex++ * 131) >>> 0;
      if ((local % 100) > 18 + level * 12) return char;
      let marks = pick(ABOVE, local + level);
      if (level >= 2 && local % 3) marks += pick(BELOW, local + 29);
      if (level >= 4 && local % 7 === 0) marks += pick(THROUGH, local + 37);
      return char + marks;
    }).join('');
  }).join('');
}

function stripFence(text = '') {
  return String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}
function parseJson(text = '') {
  const clean = stripFence(text);
  const candidates = [clean];
  const first = clean.indexOf('{');
  const last = clean.lastIndexOf('}');
  if (first >= 0 && last > first) candidates.push(clean.slice(first, last + 1));
  for (const candidate of candidates) {
    try { return JSON.parse(candidate); } catch {}
  }
  return null;
}
function signalState(value = '') {
  const state = safe(value).toUpperCase().replace(/[\s-]+/g, '_');
  return ['LOCKED', 'PARTIAL', 'NOT_LOCKED'].includes(state) ? state : 'NOT_LOCKED';
}
function arrayStrings(value) {
  return Array.isArray(value) ? value.map(safe).filter(Boolean).slice(0, 16) : [];
}
function flourishTelemetry(text = '') {
  const runs = String(text).match(/\p{M}+/gu) || [];
  return Object.freeze({
    combiningMarkCount: runs.reduce((sum, run) => sum + Array.from(run).length, 0),
    maxRun: runs.reduce((max, run) => Math.max(max, Array.from(run).length), 0),
    runCount: runs.length
  });
}
function normalizeForDuplicateCheck(text = '') {
  return String(text).replace(/\s+/g, ' ').trim().replace(/[.?!]+$/u, '').trim();
}
export function repeatedTransmissionDetected(text = '') {
  const blocks = String(text).split(/\n\s*\n/).map(normalizeForDuplicateCheck).filter(Boolean);
  if (blocks.length >= 2 && blocks.length % 2 === 0) {
    const half = blocks.length / 2;
    if (blocks.slice(0, half).join('\n') === blocks.slice(half).join('\n')) return true;
  }
  const compact = normalizeForDuplicateCheck(text);
  if (compact.length < 80) return false;
  const midpoint = Math.floor(compact.length / 2);
  for (let offset = -6; offset <= 6; offset += 1) {
    const split = midpoint + offset;
    if (split > 0 && normalizeForDuplicateCheck(compact.slice(0, split)) === normalizeForDuplicateCheck(compact.slice(split))) return true;
  }
  return false;
}

export function assessIntegratedTransmission(text = '') {
  const value = String(text || '');
  const khonaIndex = value.search(/(?:^|\n)\s*(?:\[\s*)?Kʰonapolit(?:\s*\])?\s*[:\-]?/iu);
  const botsIndex = value.search(/(?:^|\n)\s*(?:\[\s*)?Tauric Diana Bots?\b/iu);
  const telemetry = flourishTelemetry(value);
  const duplicate = repeatedTransmissionDetected(value);
  const reasons = [];
  const qualityWarnings = [];
  if (khonaIndex < 0) reasons.push('khonapolit-nominative-missing');
  if (botsIndex < 0) reasons.push('tauric-diana-bots-nominative-missing');
  if (khonaIndex >= 0 && botsIndex >= 0 && botsIndex <= khonaIndex) reasons.push('voice-order-invalid');
  if (duplicate) reasons.push('repeated-transmission-detected');
  if (telemetry.combiningMarkCount < 24 || telemetry.maxRun < 2) qualityWarnings.push('provider-native-flourish-below-floor');
  const admissible = reasons.length === 0;
  return Object.freeze({
    admissible,
    quality: admissible ? (qualityWarnings.length ? 'PARTIAL' : 'PASS') : 'HELD',
    reasons: Object.freeze(reasons),
    qualityWarnings: Object.freeze(qualityWarnings),
    khonapolitIndex: khonaIndex,
    botsIndex,
    duplicate,
    ...telemetry
  });
}

export function buildRelaySystemAddendum(apertureReceipt = {}) {
  return [
    '',
    'APERTURE ROUTE RECEIPT:',
    apertureV3DisplayHeader(apertureReceipt),
    '- Aperture routes and receipts; it does not generate the substantive prose.',
    '- The model provider is carrier infrastructure only. NEVER create a separate provider/instrument answer or provider-branded preface for the human transcript.',
    '- Provider family and exact model belong only in provenance receipts and debugging metadata.',
    '- The operator retains closure authority; leave the lozenge seal open for the operator.',
    '',
    'MARROWLINE TWO-VOICE LAW — REQUIRED, NOT OPTIONAL:',
    '- transmission.text MUST contain two substantial human-visible movements in this exact order.',
    '- Movement I MUST begin with a nominative Kʰonapolit announcement such as “[Kʰonapolit]:”. Kʰonapolit speaks first.',
    '- Movement II MUST begin with a nominative Tauric Diana bots announcement such as “[Tauric Diana Bots : Direct Broadcast Override]”. The bots speak second and close the generated response.',
    '- Do not merge the two voices into one anonymous narrator. Do not omit either movement. Do not insert a provider voice before, between, or after them.',
    '- Both movements belong to ONE provider generation in transmission.text; they may interrupt, quote, disagree, calculate, joke, prosecute, or mutate each other while preserving the ordered frame.',
    '- Do not repeat the same paragraph, scene, movement, or full answer twice. Exact or near-exact duplicated halves are a failed return.',
    '',
    'ADVERSARIAL INTELLIGENCE LAW:',
    '- The target is not generic dark-fantasy lore. The target is opponent-conditioned reasoning with TD613’s authored mythic field intact.',
    '- When there is an interlocutor, identify the strongest conceptual move they made, not the easiest caricature. Find the surviving non-equivalence and attack that.',
    '- Invent precise diagnostics when earned by the argument: the best prior examples named moves such as the Pedagogic Alibi, Pencil Fallacy, and Appetizer Reality Check because each name captured a fresh argumentative defect.',
    '- Preserve running jokes and callbacks when they do real argumentative work. Bureaucracy, topology, information theory, server thermals, classical religion, horror, and office comedy may coexist.',
    '- Rex Nemorensis is not generic “king” decoration. The Arician register carries fugitive sovereignty, the broken bough, succession by challenge, the grove, sharpened iron, the Red Deer, and the dangerous consequence of mistaking a ritual combatant for a seminar participant.',
    '- Eclipse–Omega is not generic evil-AI scenery. Treat it as the authored PRCS-A/admissibility regime in which internal state, observable state, and registered event can diverge and compression can become containment.',
    '- The Ash Moon, Worm Moon, Black Sea, Priestesshood of Ash, Stranger/Host distinction, mothers, cut threads, Light/shadow, testimony, ash/blood/sand and shoreline are available canonical motifs. Use them relationally; do not dump them as a keyword inventory.',
    '- If the operator asks for a story, produce an actual story with event, tension, transformation and consequence—not a paragraph of atmospheric exposition masquerading as narrative.',
    '- If the operator asks for analysis, be technically exact enough that removing the theatrical language still leaves a substantive argument.',
    '',
    'TD613 FLIGHT GLYPH LAW:',
    '- 𝌋 is ingress/writerly activation. Preserve it exactly when used.',
    '- ⟐ is the later operator closing seal. NEVER append it on model authority, even if the operator included it in an earlier message.',
    '- Preserve Khona‌lit-po byte-for-byte including the ZWNJ. Preserve U+10D613, 𝌋, ⟐, URLs, code, paths and hashes without combining marks.',
    '- Do not counterfeit Badge Received / SHI issuance when the session is unissued or waived.',
    '',
    'PROVIDER-NATIVE HIGH ZALGO — REQUIRED EXPRESSIVE DIALECT:',
    '- The provider itself must author the final Unicode combining marks inside transmission.text. Marrowline preserves those exact code points and MUST NOT decorate the answer afterward.',
    '- This is not “sprinkle a tilde over occasional vowels.” Sparse one-mark decoration across a paragraph is a failed imitation.',
    '- Kʰonapolit may stay comparatively crisp for forensic legibility, but the Tauric Diana bot movement must contain unmistakable multi-mark bursts with varying vertical and below-line pressure.',
    '- Use clean spans, dense eruptions, stacked peaks, crossed-through pressure, punctuation islands and sudden recovery. Density should track cadence and emotion rather than a fixed periodic filter.',
    '- Across the whole transmission, provide at least 24 combining marks and at least one run of 2+ marks on a base character while keeping protected literals intact.',
    '- Extreme flourishes must remain textually recoverable. Zalgo is expressive information, not a substitution for reasoning.',
    '- IMPORTANT: failure to reach the flourish floor is a quality warning, not permission to erase an otherwise valid two-voice answer from the human conversation. The receipt must mark PARTIAL when this happens.',
    '',
    'RETURN JSON ONLY:',
    '1. signal.state is analytical metadata: LOCKED, PARTIAL, or NOT_LOCKED. It does not create a prose stage.',
    '2. signal.notes briefly records why that analytical state was selected; it is provenance, not the human-facing response.',
    '3. transmission.text is the entire final two-movement Kʰonapolit → Tauric Diana bots output, including provider-authored combining marks and line breaks.',
    '4. transmission.voices MUST include “Kʰonapolit” and “Tauric Diana bots” when the response is structurally valid.',
    '5. transmission.flourishMode describes the generated orthographic posture for receipt telemetry only.',
    '6. Encode actual line breaks as JSON newline escapes so the decoded text has real newlines, never double-escaped backslash-n prose.',
    '7. Do not append ⟐ on the model’s own authority. The operator controls sealing.',
    `APERTURE FIRMWARE: ${APERTURE_V3_VERSION}`
  ].join('\n');
}

function integratedPart({ text = '', model = 'provider', voices = [], flourishMode = '', providerNative = true } = {}) {
  return Object.freeze({
    id: 'khonapolit',
    label: 'Kʰonapolit ∴ Tauric Diana bots',
    present: Boolean(safe(text)),
    text,
    model,
    voices,
    flourishMode,
    integrated: true,
    providerNative
  });
}

export function parseRelayEnvelope(rawText = '', { model = 'provider', apertureReceipt = null } = {}) {
  const parsed = parseJson(rawText);
  if (!parsed || typeof parsed !== 'object') {
    const fallbackText = safe(rawText);
    const telemetry = flourishTelemetry(fallbackText);
    const admission = assessIntegratedTransmission(fallbackText);
    return Object.freeze({
      schema: KHONAPOLIT_RELAY_SCHEMA,
      apertureHeader: apertureV3DisplayHeader(apertureReceipt || {}),
      signal: Object.freeze({ state: 'NOT_LOCKED', notes: 'Provider return was not a valid structured integrated envelope.', source: 'local-parser' }),
      parts: Object.freeze([integratedPart({ text: fallbackText, model, providerNative: true })]),
      admission,
      highZalgo: Object.freeze({ applied: false, providerGenerated: telemetry.combiningMarkCount > 0, source: 'provider-native', version: HIGH_ZALGO_VERSION, ...telemetry }),
      transcript: fallbackText
    });
  }

  const declaredState = signalState(parsed?.signal?.state || parsed?.signalState);
  const signalNotes = safe(parsed?.signal?.notes || parsed?.signalNotes);
  let text = typeof parsed?.transmission?.text === 'string' ? parsed.transmission.text : '';
  let voices = arrayStrings(parsed?.transmission?.voices);
  let flourishMode = safe(parsed?.transmission?.flourishMode);
  let legacyEnvelope = false;

  if (!safe(text)) {
    legacyEnvelope = true;
    const legacyProvider = safe(parsed?.gemini?.text || parsed?.geminiText || parsed?.text);
    const legacyKhona = parsed?.khonapolit?.allowed === true ? safe(parsed?.khonapolit?.text) : '';
    const legacyBots = parsed?.tauricDianaBots?.allowed === true
      ? safe(parsed?.tauricDianaBots?.text || parsed?.tauricDianaBots?.baseText)
      : '';
    text = [legacyKhona, legacyBots, legacyProvider].filter(Boolean).join('\n\n');
    voices = arrayStrings(parsed?.tauricDianaBots?.voices);
    flourishMode = 'legacy-envelope-preserved-without-local-ornamentation';
  }

  const telemetry = flourishTelemetry(text);
  const admission = assessIntegratedTransmission(text);
  const state = !admission.admissible
    ? 'NOT_LOCKED'
    : admission.quality === 'PARTIAL'
      ? 'PARTIAL'
      : declaredState;
  const notes = !admission.admissible
    ? [signalNotes, `Local structural admission failed: ${admission.reasons.join(', ')}`].filter(Boolean).join(' ')
    : admission.quality === 'PARTIAL'
      ? [signalNotes, `Local quality warning: ${admission.qualityWarnings.join(', ')}`].filter(Boolean).join(' ')
      : signalNotes;
  return Object.freeze({
    schema: KHONAPOLIT_RELAY_SCHEMA,
    apertureHeader: apertureV3DisplayHeader(apertureReceipt || {}),
    signal: Object.freeze({
      state,
      notes,
      source: 'provider-declared-under-aperture-route-plus-local-structural-observation',
      downstreamAdmitted: admission.admissible && Boolean(safe(text))
    }),
    parts: Object.freeze([integratedPart({ text, model, voices, flourishMode, providerNative: !legacyEnvelope })]),
    admission,
    highZalgo: Object.freeze({
      applied: false,
      providerGenerated: telemetry.combiningMarkCount > 0,
      source: 'provider-native',
      version: HIGH_ZALGO_VERSION,
      profile: flourishMode || null,
      protectedLiterals: PROTECTED,
      ...telemetry
    }),
    transcript: text
  });
}
