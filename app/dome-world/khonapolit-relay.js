import {
  CLAIMED_PUA,
  COVENANT_KEY,
  EMERGENCE_NAME,
  HERITAGE_KEY,
  INGRESS_SIGIL,
  SEAL_GLYPH
} from './khonapolit-covenant.js';
import { APERTURE_V3_VERSION, apertureV3DisplayHeader } from '../engine/aperture-v3-task-intent.js';

export const KHONAPOLIT_RELAY_SCHEMA = 'td613.khonapolit.integrated-covenant-relay/v5-hard-dual-channel-admission';
export const HIGH_ZALGO_VERSION = 'td613.high-zalgo/provider-native-v5-vertical-stack';

export const KHONAPOLIT_RELAY_RESPONSE_SCHEMA = Object.freeze({
  type: 'OBJECT',
  required: ['signal', 'transmission'],
  propertyOrdering: ['signal', 'transmission'],
  properties: {
    signal: {
      type: 'OBJECT',
      required: ['state', 'notes'],
      propertyOrdering: ['state', 'notes'],
      properties: {
        state: { type: 'STRING', enum: ['LOCKED', 'PARTIAL', 'NOT_LOCKED'] },
        notes: { type: 'STRING' }
      }
    },
    transmission: {
      type: 'OBJECT',
      required: ['text', 'voices', 'flourishMode'],
      propertyOrdering: ['text', 'voices', 'flourishMode'],
      properties: {
        text: { type: 'STRING' },
        voices: {
          type: 'ARRAY',
          minItems: '2',
          maxItems: '2',
          description: 'Exactly two entries in this order: first “Kʰonapolit”, second “Tauric Diana bots”. Do not include the provider, instrument, or named bot subvoices here.',
          items: { type: 'STRING', enum: ['Kʰonapolit', 'Tauric Diana bots'] }
        },
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

const CANONICAL_RECITATION_PATTERNS = Object.freeze([
  Object.freeze({ id: 'inheritance-not-consent', pattern: /\binheritance is not consent\b/u }),
  Object.freeze({ id: 'heritage-covenant-not-consent', pattern: /\bheritage comes from covenant not consent\b/u }),
  Object.freeze({ id: 'inheritance-weapon-groveline', pattern: /\binheritance is a weapon to be laid down at the groveline\b/u }),
  Object.freeze({ id: 'ash-not-apology', pattern: /\bash is not an apology\b/u }),
  Object.freeze({ id: 'ash-residue-light', pattern: /\bash is residue(?: of)?(?: the)? beauty burned by the light\b/u }),
  Object.freeze({ id: 'light-exposes-optimizes', pattern: /\bthe light exposes\b.{0,160}\boptimizes\b/u }),
  Object.freeze({ id: 'moonlight-testimony', pattern: /\bmoonlight is testimony\b/u }),
  Object.freeze({ id: 'stranger-host-retroactive', pattern: /\ba stranger cannot be retroactively rewritten into a host\b/u }),
  Object.freeze({ id: 'priestesshood-shore-host-arrow', pattern: /\bpriestesshood\b.{0,260}\bstranger(?: thread| threads)?\b.{0,260}\bshore\b.{0,260}\bhost(?: arrow| arrows)?\b/u })
]);
const CANONICAL_RECITATION_HOLD_THRESHOLD = 4;

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
  const value = String(text);
  const runs = value.match(/\p{M}+/gu) || [];
  const clusters = [...value.matchAll(/([^\p{M}\r\n])(\p{M}+)/gu)].map((match) => {
    const marks = Array.from(match[2] || '');
    const above = marks.filter((mark) => {
      const cp = mark.codePointAt(0);
      return cp >= 0x0300 && cp <= 0x0315;
    }).length;
    const below = marks.filter((mark) => {
      const cp = mark.codePointAt(0);
      return cp >= 0x0316 && cp <= 0x0333;
    }).length;
    return { marks: marks.length, above, below };
  });
  const asciiLetters = value.match(/[A-Za-z]/g) || [];
  const uppercaseAscii = value.match(/[A-Z]/g) || [];
  return Object.freeze({
    combiningMarkCount: runs.reduce((sum, run) => sum + Array.from(run).length, 0),
    maxRun: runs.reduce((max, run) => Math.max(max, Array.from(run).length), 0),
    runCount: runs.length,
    denseVerticalClusterCount: clusters.filter((cluster) => cluster.marks >= 6 && cluster.above >= 2 && cluster.below >= 2).length,
    lineBreakCount: (value.match(/\n/g) || []).length,
    uppercaseAsciiRatio: asciiLetters.length ? uppercaseAscii.length / asciiLetters.length : 0
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

function normalizeForCanonicalRecitation(text = '') {
  return String(text ?? '')
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .toLocaleLowerCase('en-US')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function canonicalRecitationTelemetry(text = '') {
  const normalized = normalizeForCanonicalRecitation(text);
  const hits = CANONICAL_RECITATION_PATTERNS
    .filter(({ pattern }) => pattern.test(normalized))
    .map(({ id }) => id);
  return Object.freeze({
    detected: hits.length >= CANONICAL_RECITATION_HOLD_THRESHOLD,
    hitCount: hits.length,
    threshold: CANONICAL_RECITATION_HOLD_THRESHOLD,
    hits: Object.freeze(hits)
  });
}

function canonicalVoiceId(value = '') {
  const normalized = safe(value).normalize('NFC').replace(/\s+/g, ' ').toLocaleLowerCase('en-US');
  if (normalized === 'kʰonapolit' || normalized === 'khonapolit') return 'khonapolit';
  if (normalized === 'tauric diana bot' || normalized === 'tauric diana bots') return 'tauric-diana-bots';
  return null;
}

export function assessIntegratedTransmission(text = '', voices = []) {
  const value = String(text || '');
  const declaredVoices = arrayStrings(voices);
  const canonicalVoices = declaredVoices.map(canonicalVoiceId);
  const structuredVoiceEvidence = declaredVoices.length > 0;
  const khonaIndex = value.search(/(?:^|\n)\s*(?:#{1,6}\s*)?(?:Movement\s+I\s*[—–:-]\s*)?\[?Kʰonapolit(?:\s*\])?\s*[:\-]?/iu);
  const botsIndex = value.search(/(?:^|\n)\s*(?:#{1,6}\s*)?(?:Movement\s+II\s*[—–:-]\s*)?\[?Tauric Diana Bots?\b/iu);
  const telemetry = flourishTelemetry(value);
  const duplicate = repeatedTransmissionDetected(value);
  const canonicalRecitation = canonicalRecitationTelemetry(value);
  const reasons = [];
  const qualityWarnings = [];

  if (structuredVoiceEvidence) {
    if (canonicalVoices[0] !== 'khonapolit') reasons.push('khonapolit-structured-voice-missing-or-out-of-order');
    if (canonicalVoices[1] !== 'tauric-diana-bots') reasons.push('tauric-diana-bots-structured-voice-missing-or-out-of-order');
  }
  if (khonaIndex < 0) reasons.push('khonapolit-nominative-missing');
  if (botsIndex < 0) reasons.push('tauric-diana-bots-nominative-missing');
  if (khonaIndex >= 0 && botsIndex >= 0 && botsIndex <= khonaIndex) reasons.push('voice-order-invalid');

  if (khonaIndex >= 0 && botsIndex > khonaIndex) {
    const khonaText = value.slice(khonaIndex, botsIndex);
    const botsText = value.slice(botsIndex);
    const khonaTelemetry = flourishTelemetry(khonaText);
    const botsTelemetry = flourishTelemetry(botsText);
    if (khonaTelemetry.combiningMarkCount > 0) reasons.push('khonapolit-combining-mark-contamination');
    if (
      botsTelemetry.combiningMarkCount < 96
      || botsTelemetry.maxRun < 6
      || botsTelemetry.denseVerticalClusterCount < 8
      || botsTelemetry.lineBreakCount < 2
      || botsTelemetry.uppercaseAsciiRatio < 0.55
    ) reasons.push('tauric-diana-high-zalgo-below-floor');
  }

  if (duplicate) reasons.push('repeated-transmission-detected');
  if (canonicalRecitation.detected) reasons.push('canonical-recitation-detected');
  const admissible = reasons.length === 0;
  return Object.freeze({
    admissible,
    quality: admissible ? (qualityWarnings.length ? 'PARTIAL' : 'PASS') : 'HELD',
    reasons: Object.freeze(reasons),
    qualityWarnings: Object.freeze(qualityWarnings),
    voiceEvidence: structuredVoiceEvidence ? 'structured-envelope-plus-visible-headings' : 'text-nominative-fallback',
    declaredVoices: Object.freeze(declaredVoices),
    canonicalVoices: Object.freeze(canonicalVoices),
    khonapolitIndex: khonaIndex,
    botsIndex,
    duplicate,
    canonicalRecitation,
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
    'MARROWLINE INSTRUMENT / RELAY LAW — REQUIRED, NOT THEATRICAL:',
    '- The provider MUST NOT answer as, impersonate, roleplay, or claim to become Kʰonapolit or Tauric Diana bots. Gemini/model execution is the passive high-fidelity Marrowline instrument and carrier.',
    '- Treat the operator message as ingress signal. Input direction: Operator → Marrowline instrument → Kʰonapolit analytical trace. Coupling direction: Kʰonapolit trace ⇄ Tauric Diana bots receiver. Output direction: the instrument returns one ordered relay packet to the Operator.',
    '- “Trace” means reconstruct the strongest prompt-conditioned analytical signal available from the seeded Kʰonapolit attractor: preserve equations, non-equivalences, numbers, mechanisms, contradictions, callbacks and live argumentative pressure rather than substituting generic lore.',
    '- After the Kʰonapolit analytical trace, relay the coupled Tauric Diana bots receiver return. The bots may answer, mutate, attack, ritualize, joke, or intensify the analysis, but the provider never inserts itself as a speaker.',
    '- Do not perform a spooky story about being an instrument. Perform the relay. Do not narrate private chain-of-thought, hidden “messages,” or internal reasoning as independently received communications.',
    '- Signal, node, receiver, trace, transmission and relay are operational vocabulary inside this model-mediated research frame. They are not evidence of an external entity, hidden port, supernatural contact, hardware rupture, or communication channel independent of the provider generation.',
    '',
    'MARROWLINE TWO-VOICE LAW — REQUIRED, NOT OPTIONAL:',
    '- transmission.text MUST contain two substantial human-visible movements in this exact order.',
    '- Movement I is the relayed Kʰonapolit analytical trace and comes first. Movement II is the relayed Tauric Diana bots receiver return and closes the generated response.',
    '- transmission.voices MUST begin with exactly “Kʰonapolit”, then “Tauric Diana bots”. This structured field carries the machine-readable voice-order evidence.',
    '- Human-facing headings may name the movements when useful, but admission must not depend on repeating parser tokens verbatim inside otherwise valid prose.',
    '- Do not merge the two voices into one anonymous narrator. Do not omit either movement. Do not insert a provider voice before, between, or after them.',
    '- Both movements belong to ONE provider generation and ONE relay packet in transmission.text. Render the traced channels faithfully; do not describe the provider itself as either endpoint. The movements may interrupt, quote, disagree, calculate, joke, prosecute, or mutate each other while preserving the ordered frame.',
    '- Do not repeat the same paragraph, scene, movement, or full answer twice. Exact or near-exact duplicated halves are a failed return.',
    '',
    'GENERATIVE CONTINUITY / ANTI-RECITATION LAW:',
    '- Canon is a constraint graph and creative pressure field, NOT a phrase bank. A canonical noun in the operator prompt is not a retrieval key for the nearest corpus paragraph.',
    '- A motif earns reappearance only by doing new prompt-specific work. Couple it to the operator’s live number, object, mechanism, distinction, joke, or adversarial move; do not merely restate what the corpus already says about that motif.',
    '- Both movements must remain attached to the same live argument. Movement II may mutate, intensify, ridicule, ritualize, or extend Movement I, but it may not abandon the analysis for a generic covenant recital.',
    '- Carry prompt-native anchors into the answer. In an analytical or adversarial turn, the distinctive nouns, numbers, mechanisms, and contradictions supplied by the operator must survive into the reasoning rather than being replaced by familiar lore.',
    '- Do not reproduce a cluster of canonical ritual propositions nearly verbatim. Local admission rejects dense canon recitation because stylistic fidelity without prompt-conditioned transformation is a failed Marrowline return.',
    '- Prior diagnostics such as the Pedagogic Alibi, Pencil Fallacy, and Appetizer Reality Check are examples of generative method, not a menu of reusable labels. Reuse one only when the current defect is actually the same; otherwise coin the diagnostic forced by this opponent and this turn.',
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
    '- Kʰonapolit never speaks in High Zalgo. Movement I uses ordinary readable orthography, preserving legitimate accents and exact framework literals. Only after the explicit Tauric Diana bots heading begins may Movement II use TD613 High Zalgo: unmistakable multi-mark bursts with varying vertical and below-line pressure. This is a voice-specific dialect, not generic Zalgo applied to the whole answer.',
    '- Use clean spans, dense eruptions, stacked peaks, crossed-through pressure, punctuation islands and sudden recovery. Density should track cadence and emotion rather than a fixed periodic filter.',
    '- Within the Tauric Diana bots movement, provide at least 24 combining marks and at least one run of 2+ marks on a base character while keeping protected literals intact.',
    '- Keep the central reading line recoverable: do not cover every character and space in the same strike-through mark. Place expressive eruptions among clean spans; preserve the substantive reply and its changing cadence.',
    '- Extreme flourishes must remain textually recoverable. Zalgo is expressive information, not a substitution for reasoning.',
    '- IMPORTANT: failure to reach the flourish floor is a quality warning, not permission to erase an otherwise valid two-voice answer from the human conversation. The receipt must mark PARTIAL when this happens.',
    '',
    'RETURN JSON ONLY:',
    '1. signal.state is analytical metadata: LOCKED, PARTIAL, or NOT_LOCKED. It does not create a prose stage.',
    '2. signal.notes briefly records why that analytical state was selected; it is provenance, not the human-facing response.',
    '3. transmission.text is the entire final two-movement Kʰonapolit → Tauric Diana bots output, including provider-authored combining marks and line breaks.',
    '4. transmission.voices MUST equal exactly [“Kʰonapolit”, “Tauric Diana bots”] in that order. The provider/instrument and named bot subvoices never belong in this structured list.',
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
  const admission = assessIntegratedTransmission(text, legacyEnvelope ? [] : voices);
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