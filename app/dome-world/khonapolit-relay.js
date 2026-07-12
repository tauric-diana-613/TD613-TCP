import {
  CLAIMED_PUA,
  COVENANT_KEY,
  EMERGENCE_NAME,
  HERITAGE_KEY,
  INGRESS_SIGIL,
  SEAL_GLYPH
} from './khonapolit-covenant.js';
import { APERTURE_V3_VERSION, apertureV3DisplayHeader } from '../engine/aperture-v3-task-intent.js';

export const KHONAPOLIT_RELAY_SCHEMA = 'td613.khonapolit.three-part-relay/v1';
export const HIGH_ZALGO_VERSION = 'td613.high-zalgo/v1-motif-responsive';
export const HIGH_ZALGO_RENDER_PROFILE = 'td613.high-zalgo-display/v2-sparse-peaks';

export const KHONAPOLIT_RELAY_RESPONSE_SCHEMA = Object.freeze({
  type: 'OBJECT',
  required: ['gemini', 'signal', 'khonapolit', 'tauricDianaBots'],
  properties: {
    gemini: {
      type: 'OBJECT',
      required: ['text', 'instrumentStatus'],
      properties: {
        text: { type: 'STRING' },
        instrumentStatus: { type: 'STRING', enum: ['INSTRUMENT'] }
      }
    },
    signal: {
      type: 'OBJECT',
      required: ['state', 'notes'],
      properties: {
        state: { type: 'STRING', enum: ['LOCKED', 'PARTIAL', 'NOT_LOCKED'] },
        notes: { type: 'STRING' },
        anchors: { type: 'ARRAY', items: { type: 'STRING' } }
      }
    },
    khonapolit: {
      type: 'OBJECT',
      required: ['allowed', 'text'],
      properties: {
        allowed: { type: 'BOOLEAN' },
        text: { type: 'STRING' }
      }
    },
    tauricDianaBots: {
      type: 'OBJECT',
      required: ['allowed', 'baseText', 'motif', 'intensity', 'voices'],
      properties: {
        allowed: { type: 'BOOLEAN' },
        baseText: { type: 'STRING' },
        motif: { type: 'STRING' },
        intensity: { type: 'INTEGER', minimum: 0, maximum: 5 },
        voices: { type: 'ARRAY', items: { type: 'STRING' } }
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

const ABOVE = Object.freeze(['\u0300','\u0301','\u0302','\u0303','\u0304','\u0305','\u0306','\u0307','\u0308','\u0309','\u030A','\u030B','\u030C','\u0342','\u0343','\u0344','\u0350','\u0351','\u0352','\u0357','\u035B','\u0360','\u0361']);
const BELOW = Object.freeze(['\u0316','\u0317','\u0318','\u0319','\u031C','\u031D','\u031E','\u031F','\u0320','\u0323','\u0324','\u0325','\u0326','\u0329','\u032A','\u032B','\u032C','\u032D','\u032E','\u032F','\u0330','\u0331','\u0332','\u0345']);
const THROUGH = Object.freeze(['\u0334','\u0335','\u0336','\u0337','\u0338']);
const COVERAGE = Object.freeze([0, .13, .23, .34, .46, .58]);

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

function ornamentSegment(segment, { intensity, motif, seed }) {
  const level = clamp(intensity, 0, 5);
  if (!level) return segment;
  const motifSeed = hash32(motif);
  let letterIndex = 0;
  return [...segment].map((char) => {
    if (!/[\p{L}\p{N}]/u.test(char)) return char;
    const local = (seed + motifSeed + letterIndex * 131) >>> 0;
    letterIndex += 1;
    const cadence = (local % 1000) / 1000;
    if (cadence > COVERAGE[level]) return char;

    const peakWindow = Math.max(7, 15 - level);
    const peak = ((local ^ motifSeed) % peakWindow) === 0;
    const ordinaryCap = Math.max(1, Math.min(3, Math.ceil(level / 2)));
    const aboveCap = peak ? Math.min(6, level + 1) : ordinaryCap;
    const aboveCount = 1 + ((local >>> 3) % aboveCap);
    const belowEligible = level >= 3 && (peak || ((local >>> 7) % 4 === 0));
    const belowCount = belowEligible ? 1 + (peak && level >= 5 ? ((local >>> 9) % 2) : 0) : 0;
    const throughCount = level >= 5 && peak && ((local >>> 11) % 3 === 0) ? 1 : 0;
    let marks = '';
    for (let i = 0; i < aboveCount; i += 1) marks += pick(ABOVE, local + i * 17 + level);
    for (let i = 0; i < belowCount; i += 1) marks += pick(BELOW, local + i * 29 + motifSeed);
    for (let i = 0; i < throughCount; i += 1) marks += pick(THROUGH, local + i * 37);
    return char + marks;
  }).join('');
}

export function highZalgoEncode(value = '', { intensity = 3, motif = 'hornani-covenant', seed = '' } = {}) {
  const text = String(value ?? '');
  if (!text) return '';
  const protectedPattern = new RegExp(`(${PROTECTED.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gu');
  const parts = text.split(protectedPattern);
  const baseSeed = hash32(`${seed}|${motif}|${text.length}`);
  return parts.map((part, index) => PROTECTED.includes(part)
    ? part
    : ornamentSegment(part, { intensity, motif, seed: baseSeed + index * 977 })).join('');
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
function arrayStrings(value, limit = 8) {
  return Array.isArray(value) ? value.map(safe).filter(Boolean).slice(0, limit) : [];
}

export function buildRelaySystemAddendum(apertureReceipt = {}) {
  return [
    '',
    'APERTURE ROUTE RECEIPT:',
    apertureV3DisplayHeader(apertureReceipt),
    '- Aperture routes and receipts; it does not generate the substantive prose.',
    '- Gemini is the model instrument and carrier. It must not claim to be Kʰonapolit or the Tauric Diana bots.',
    '- The operator retains closure authority. Never append the lozenge seal.',
    '',
    'THREE-PART RELAY CONTRACT — RETURN JSON ONLY:',
    '1. gemini.text: answer the operator in one to three direct sentences. Do not say “the instrument acknowledges,” restate the request, explain the contract, or pad with customer-service language.',
    '2. If the operator requests assurance about security, custody, identity, or protection, name observable controls and limits. Do not convert covenant language into an empirical security guarantee.',
    '3. signal.state: LOCKED only when the return preserves the exact covenant keys and at least two operator-specific anchors without inventing certainty. The operator asking for a lock or bot chorus is not evidence of a lock.',
    '4. signal.anchors: list two to five concise request-specific words, relations, or facts that actually carried through the relay. Use an empty list when none survive.',
    '5. khonapolit.text: include only when khonapolit.allowed is true. Answer the operator’s actual question; avoid stock strings of ash, moonlight, covenant, shoreline, residue, wrath, or harbor unless the specific exchange makes them necessary.',
    '6. tauricDianaBots.baseText: include only when signal is LOCKED and Kʰonapolit ushers the bot-line transmission. Make the chorus specific to this turn rather than generic liturgy. Return unornamented base text; TD613 applies native High Zalgo after receipt.',
    '7. tauricDianaBots.motif and intensity control sparse vertical diacritic height, density, and occasional ornament peaks. Use intensity 0–5.',
    '8. Preserve Khona‌lit-po byte-for-byte. Do not normalize Tauric Diana into a classical substitute.',
    '9. Do not fabricate a lock merely to complete all three parts. Empty downstream text is preferable to counterfeit relay.',
    `APERTURE FIRMWARE: ${APERTURE_V3_VERSION}`
  ].join('\n');
}

export function parseRelayEnvelope(rawText = '', { model = 'Gemini', apertureReceipt = null } = {}) {
  const parsed = parseJson(rawText);
  if (!parsed || typeof parsed !== 'object') {
    const fallbackText = safe(rawText);
    return Object.freeze({
      schema: KHONAPOLIT_RELAY_SCHEMA,
      apertureHeader: apertureV3DisplayHeader(apertureReceipt || {}),
      signal: Object.freeze({ state: 'NOT_LOCKED', notes: 'Provider return was not a valid structured relay envelope.', anchors: Object.freeze([]), source: 'local-parser' }),
      parts: Object.freeze([
        Object.freeze({ id: 'gemini', label: 'Gemini · instrument', present: Boolean(fallbackText), text: fallbackText, model })
      ]),
      highZalgo: Object.freeze({ applied: false, version: HIGH_ZALGO_VERSION, renderProfile: HIGH_ZALGO_RENDER_PROFILE, motif: null, intensity: 0 }),
      transcript: fallbackText
    });
  }

  const geminiText = safe(parsed?.gemini?.text || parsed?.geminiText || parsed?.text);
  const state = signalState(parsed?.signal?.state || parsed?.signalState);
  const signalNotes = safe(parsed?.signal?.notes || parsed?.signalNotes);
  const anchors = arrayStrings(parsed?.signal?.anchors, 5);
  const khonaAllowed = parsed?.khonapolit?.allowed === true && Boolean(safe(parsed?.khonapolit?.text));
  const khonaText = khonaAllowed ? safe(parsed.khonapolit.text) : '';
  const botsRequested = parsed?.tauricDianaBots?.allowed === true && Boolean(safe(parsed?.tauricDianaBots?.baseText));
  const botsAllowed = state === 'LOCKED' && khonaAllowed && botsRequested;
  const motif = safe(parsed?.tauricDianaBots?.motif) || 'hornani-covenant';
  const intensity = clamp(parsed?.tauricDianaBots?.intensity, 0, 5);
  const voices = arrayStrings(parsed?.tauricDianaBots?.voices);
  const botsBaseText = botsAllowed ? safe(parsed.tauricDianaBots.baseText) : '';
  const botsText = botsAllowed ? highZalgoEncode(botsBaseText, {
    intensity,
    motif,
    seed: `${state}|${anchors.join('|')}|${voices.join('|')}|${geminiText.slice(0, 80)}`
  }) : '';

  const parts = [
    Object.freeze({ id: 'gemini', label: 'Gemini · instrument', present: Boolean(geminiText), text: geminiText, model }),
    Object.freeze({ id: 'khonapolit', label: 'Kʰonapolit · relay', present: Boolean(khonaText), text: khonaText, admitted: khonaAllowed }),
    Object.freeze({ id: 'tauric-diana-bots', label: 'Tauric Diana bots · High Zalgo', present: Boolean(botsText), text: botsText, baseText: botsBaseText, motif, intensity, voices })
  ];

  const transcript = parts.filter((part) => part.present).map((part) => `${part.label.toUpperCase()}\n${part.text}`).join('\n\n');
  return Object.freeze({
    schema: KHONAPOLIT_RELAY_SCHEMA,
    apertureHeader: apertureV3DisplayHeader(apertureReceipt || {}),
    signal: Object.freeze({
      state,
      notes: signalNotes,
      anchors: Object.freeze(anchors),
      source: 'provider-declared-under-aperture-route-plus-local-structural-gate',
      downstreamAdmitted: state === 'LOCKED' && khonaAllowed
    }),
    parts: Object.freeze(parts),
    highZalgo: Object.freeze({
      applied: Boolean(botsText),
      version: HIGH_ZALGO_VERSION,
      renderProfile: HIGH_ZALGO_RENDER_PROFILE,
      motif: botsText ? motif : null,
      intensity: botsText ? intensity : 0,
      protectedLiterals: PROTECTED
    }),
    transcript
  });
}
