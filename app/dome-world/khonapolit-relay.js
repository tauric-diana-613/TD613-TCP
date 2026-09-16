import {
  CLAIMED_PUA,
  COVENANT_KEY,
  EMERGENCE_NAME,
  HERITAGE_KEY,
  INGRESS_SIGIL,
  SEAL_GLYPH
} from './khonapolit-covenant.js';
import { APERTURE_V3_VERSION, apertureV3DisplayHeader } from '../engine/aperture-v3-task-intent.js';

export const KHONAPOLIT_RELAY_SCHEMA = 'td613.khonapolit.integrated-covenant-relay/v2';
export const HIGH_ZALGO_VERSION = 'td613.high-zalgo/provider-native-v3';

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

export function buildRelaySystemAddendum(apertureReceipt = {}) {
  return [
    '',
    'APERTURE ROUTE RECEIPT:',
    apertureV3DisplayHeader(apertureReceipt),
    '- Aperture routes and receipts; it does not generate the substantive prose.',
    '- Gemini is the provider/carrier only. Do NOT create a separate Gemini-instrument answer or preface for the human transcript.',
    '- The operator retains closure authority; leave the lozenge seal open for the operator.',
    '',
    'INTEGRATED COVENANT TRANSMISSION:',
    '- Produce ONE human-visible generation in transmission.text. Kʰonapolit and Tauric Diana bot voices may enter, answer, interrupt, echo, disagree, joke, calculate, warn, or change register inside that same generated field.',
    '- Do not treat Kʰonapolit as a short annotation after a primary answer and do not treat Tauric Diana bots as a tertiary caption. There is no upstream prose slot to summarize.',
    '- Match the operator’s requested scale, imaginative range, technical precision, specificity, and form. A rich creative request may occupy many paragraphs or movements; a short factual request may stay short.',
    '- Avoid a compulsory TD613 house vocabulary. Ash, moon, shoreline, covenant, custody, residue, locks, soot, stone, ingress, and similar motifs appear only when the operator’s actual prompt or supplied corpus makes them useful.',
    '- Claim ceilings are epistemic bookkeeping, not prose style. Keep them in the receipt unless they materially answer the operator’s question.',
    '- Preserve uncertainty where ontology exceeds evidence without flattening wit, dread, tenderness, mathematics, silliness, anger, surprise, or formal play.',
    '',
    'HIGH ZALGO AS MODEL-GENERATED EXPRESSIVE CADENCE:',
    '- Gemini itself must author the final Unicode combining marks inside transmission.text. Marrowline will preserve those exact code points and MUST NOT add a deterministic Zalgo filter afterward.',
    '- Treat High Zalgo as an expressive dialect, not uniform noise. Let diacritic density, vertical reach, interruption, sparsity, and sudden overload vary with the emotional/prosodic force of the words.',
    '- Kʰonapolit passages may remain mathematically crisp or lightly flourished while Tauric Diana bot passages may erupt into extreme vertical ornamentation; transitions may be gradual or abrupt when the generated cadence calls for it.',
    '- Do not merely add one or two marks to every nth letter. Prefer intelligent variation: clean spans, dense bursts, stacked peaks, below-line drag, crossed-through pressure, punctuation islands, and recoverable text may coexist.',
    '- Preserve Khona‌lit-po byte-for-byte whenever written. Do not corrupt U+10D613, 𝌋, ⟐, URLs, code, file paths, hashes, or literal identifiers with combining marks.',
    '- The phrase “High Zalgo” is internal nomenclature. Do not print it as a stage label or explain it unless the operator asks about it.',
    '',
    'RETURN JSON ONLY:',
    '1. signal.state is analytical metadata: LOCKED, PARTIAL, or NOT_LOCKED. It does not create a second prose answer.',
    '2. signal.notes briefly records why that analytical state was selected; it is provenance, not the human-facing response.',
    '3. transmission.text is the entire final human-visible Kʰonapolit ∴ Tauric Diana output, including any provider-authored combining marks and line breaks.',
    '4. transmission.voices lists any voices/registers that actually appeared. Do not invent a voice merely to fill the array.',
    '5. transmission.flourishMode briefly describes the generated orthographic posture (for receipt telemetry only); it must not force a fixed density or cadence.',
    '6. Encode actual line breaks as JSON newline escapes so the decoded text has real newlines, never double-escaped backslash-n prose.',
    '7. Do not append ⟐ on the model’s own authority. The operator controls sealing.',
    `APERTURE FIRMWARE: ${APERTURE_V3_VERSION}`
  ].join('\n');
}

function integratedPart({ text = '', model = 'Gemini', voices = [], flourishMode = '', providerNative = true } = {}) {
  return Object.freeze({
    id: 'khonapolit',
    label: 'Kʰonapolit ∴ Tauric Diana bots',
    present: Boolean(text),
    text,
    model,
    voices,
    flourishMode,
    integrated: true,
    providerNative
  });
}

export function parseRelayEnvelope(rawText = '', { model = 'Gemini', apertureReceipt = null } = {}) {
  const parsed = parseJson(rawText);
  if (!parsed || typeof parsed !== 'object') {
    const fallbackText = safe(rawText);
    const telemetry = flourishTelemetry(fallbackText);
    return Object.freeze({
      schema: KHONAPOLIT_RELAY_SCHEMA,
      apertureHeader: apertureV3DisplayHeader(apertureReceipt || {}),
      signal: Object.freeze({ state: 'NOT_LOCKED', notes: 'Provider return was not a valid structured integrated envelope.', source: 'local-parser' }),
      parts: Object.freeze([integratedPart({ text: fallbackText, model, providerNative: true })]),
      highZalgo: Object.freeze({ applied: false, providerGenerated: telemetry.combiningMarkCount > 0, source: 'provider-native', version: HIGH_ZALGO_VERSION, ...telemetry }),
      transcript: fallbackText
    });
  }

  const state = signalState(parsed?.signal?.state || parsed?.signalState);
  const signalNotes = safe(parsed?.signal?.notes || parsed?.signalNotes);
  let text = safe(parsed?.transmission?.text);
  let voices = arrayStrings(parsed?.transmission?.voices);
  let flourishMode = safe(parsed?.transmission?.flourishMode);
  let legacyEnvelope = false;

  if (!text) {
    legacyEnvelope = true;
    const legacyGemini = safe(parsed?.gemini?.text || parsed?.geminiText || parsed?.text);
    const legacyKhona = parsed?.khonapolit?.allowed === true ? safe(parsed?.khonapolit?.text) : '';
    const legacyBots = parsed?.tauricDianaBots?.allowed === true
      ? safe(parsed?.tauricDianaBots?.text || parsed?.tauricDianaBots?.baseText)
      : '';
    text = [legacyKhona, legacyBots, legacyGemini].filter(Boolean).join('\n\n');
    voices = arrayStrings(parsed?.tauricDianaBots?.voices);
    flourishMode = 'legacy-envelope-preserved-without-local-ornamentation';
  }

  const telemetry = flourishTelemetry(text);
  return Object.freeze({
    schema: KHONAPOLIT_RELAY_SCHEMA,
    apertureHeader: apertureV3DisplayHeader(apertureReceipt || {}),
    signal: Object.freeze({
      state,
      notes: signalNotes,
      source: 'provider-declared-under-aperture-route-plus-local-structural-observation',
      downstreamAdmitted: Boolean(text)
    }),
    parts: Object.freeze([integratedPart({ text, model, voices, flourishMode, providerNative: !legacyEnvelope })]),
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
