import {
  CLAIMED_PUA,
  COVENANT_KEY,
  EMERGENCE_NAME,
  HERITAGE_KEY,
  INGRESS_SIGIL,
  SEAL_GLYPH
} from './khonapolit-covenant.js';
import { APERTURE_V3_VERSION, apertureV3DisplayHeader } from '../engine/aperture-v3-task-intent.js';

export const KHONAPOLIT_RELAY_SCHEMA = 'td613.khonapolit.integrated-covenant-relay/v22-anchor-safe-orchestral-contour';
export const HIGH_ZALGO_VERSION = 'td613.high-zalgo/provider-native-v28-anchor-safe-orchestral-contour';

export const KHONAPOLIT_RAW_PACKET_PROTOCOL = Object.freeze({
  analyticStart: '<<<PACKET_A_FORMAL_AUDIT>>>',
  analyticEnd: '<<<PACKET_A_END>>>',
  stressStart: '<<<PACKET_B_STRESS_TELEMETRY>>>',
  stressEnd: '<<<PACKET_B_END>>>'
});

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
        text: {
          type: 'STRING',
          description: 'Two sequential unmerged visible streams with exact standalone headings “Kʰonapolit” then “Tauric Diana bots”. The first stream is clean formal prose with zero combining marks; the second is an uppercase-dominant provider-authored High-Zalgo scream-sing transmission whose native body is deep vertical crown/root architecture. For vertical architecture, use the named accepted above/below combining-diacritic palette from the system instruction; do not choose arbitrary marks merely because they are combining marks. Horizontal and oblique marks are local counter-rhythm only after the vertical field is visibly alive.'
        },
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
const ABOVE = Object.freeze(['\u0300','\u0301','\u0302','\u0303','\u0304','\u0305','\u0306','\u0307','\u0308','\u0309','\u030A','\u030B','\u030C','\u030D','\u030E','\u030F','\u0310','\u0311','\u0312','\u0313','\u0314','\u0315','\u033D','\u033E','\u033F','\u0340','\u0341','\u0342','\u0343','\u0344','\u0346','\u034A','\u034B','\u034C','\u0350','\u0351','\u0352','\u0357','\u035B','\u0360','\u0361']);
const BELOW = Object.freeze(['\u0316','\u0317','\u0318','\u0319','\u031A','\u031B','\u031C','\u031D','\u031E','\u031F','\u0320','\u0321','\u0322','\u0323','\u0324','\u0325','\u0326','\u0327','\u0328','\u0329','\u032A','\u032B','\u032C','\u032D','\u032E','\u032F','\u0330','\u0331','\u0332','\u0333','\u0339','\u033A','\u033B','\u033C','\u0345','\u0347','\u0348','\u0349','\u034D','\u034E','\u0353','\u0354','\u0355','\u0356','\u0359','\u035A']);
const THROUGH = Object.freeze(['\u0334','\u0335','\u0336','\u0337','\u0338']);
const PLANAR = new Set([
  '\u0303','\u0304','\u0305',
  '\u0330','\u0331','\u0332',
  '\u0334','\u0335','\u0336','\u0337','\u0338',
  '\u0360','\u0361'
]);
const ABOVE_SET = new Set(ABOVE);
const BELOW_SET = new Set(BELOW);
const THROUGH_SET = new Set(THROUGH);
const ENCLOSING_MARK_PATTERN = /\p{Me}/u;
const GEOMETRIC_SUBSTITUTION_PATTERN = /[\u2300-\u23FF\u25A0-\u25FF\u2B00-\u2BFF]/u;


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
function unwrapPacketPayload(value = '') {
  return String(value)
    .replace(/^\r?\n/, '')
    .replace(/\r?\n$/, '');
}

export function parseRawRelayPackets(rawText = '') {
  const clean = stripFence(rawText);
  const {
    analyticStart,
    analyticEnd,
    stressStart,
    stressEnd
  } = KHONAPOLIT_RAW_PACKET_PROTOCOL;

  const a0 = clean.indexOf(analyticStart);
  const a1 = clean.indexOf(analyticEnd);
  const b0 = clean.indexOf(stressStart);
  const b1 = clean.indexOf(stressEnd);
  if (a0 < 0 || a1 < 0 || b0 < 0 || b1 < 0) return null;
  if (!(a0 < a1 && a1 < b0 && b0 < b1)) return null;

  const analytic = unwrapPacketPayload(clean.slice(a0 + analyticStart.length, a1));
  const stress = unwrapPacketPayload(clean.slice(b0 + stressStart.length, b1));
  if (!safe(analytic) || !safe(stress)) return null;

  return Object.freeze({
    analytic,
    stress,
    text: `${analytic}\n\n${stress}`,
    voices: Object.freeze(['Kʰonapolit', 'Tauric Diana bots']),
    flourishMode: 'provider-native-raw-dual-packet'
  });
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
  const clusterTelemetry = (source = '') => [...String(source).matchAll(/([^\p{M}\r\n])(\p{M}+)/gu)].map((match) => {
    const base = match[1] || '';
    const marks = Array.from(match[2] || '');
    const above = marks.filter((mark) => ABOVE_SET.has(mark)).length;
    const below = marks.filter((mark) => BELOW_SET.has(mark)).length;
    const through = marks.filter((mark) => THROUGH_SET.has(mark)).length;
    const planar = marks.filter((mark) => PLANAR.has(mark)).length;
    const verticalAbove = marks.filter((mark) => ABOVE_SET.has(mark) && !PLANAR.has(mark)).length;
    const verticalBelow = marks.filter((mark) => BELOW_SET.has(mark) && !PLANAR.has(mark)).length;
    const enclosing = marks.filter((mark) => ENCLOSING_MARK_PATTERN.test(mark)).length;
    const verticalOrnament = verticalAbove + verticalBelow;
    const unclassified = Math.max(0, marks.length - planar - verticalAbove - verticalBelow - enclosing);
    const signature = marks.map((mark) => mark.codePointAt(0)).sort((a, b) => a - b).map((cp) => cp.toString(16).padStart(4, '0')).join('-');
    return { base, marks: marks.length, above, below, through, planar, verticalOrnament, verticalAbove, verticalBelow, enclosing, unclassified, signature };
  });
  const clusters = clusterTelemetry(value);
  const denseClusters = clusters.filter((cluster) => cluster.marks >= 6 && cluster.above >= 2 && cluster.below >= 2);
  const tallVerticalClusters = clusters.filter((cluster) =>
    cluster.verticalOrnament >= 4 && cluster.verticalAbove >= 1 && cluster.verticalBelow >= 1
  );
  const deepBidirectionalClusters = clusters.filter((cluster) =>
    cluster.verticalAbove >= 2 && cluster.verticalBelow >= 2 && cluster.verticalOrnament >= 5
  );
  const extremeVerticalClusters = clusters.filter((cluster) =>
    cluster.verticalAbove >= 3 && cluster.verticalBelow >= 3 && cluster.verticalOrnament >= 7
  );
  const leapingVerticalClusters = clusters.filter((cluster) =>
    cluster.verticalOrnament >= 6
      && Math.max(cluster.verticalAbove, cluster.verticalBelow) >= 4
  );
  const lightVerticalClusters = clusters.filter((cluster) =>
    cluster.verticalOrnament >= 1 && cluster.verticalOrnament <= 3
  );
  const denseSignatureCounts = new Map();
  for (const cluster of denseClusters) denseSignatureCounts.set(cluster.signature, (denseSignatureCounts.get(cluster.signature) || 0) + 1);
  const dominantDenseStackCount = denseClusters.length ? Math.max(...denseSignatureCounts.values()) : 0;
  const expressiveClusters = clusters.filter((cluster) => /[\p{L}\p{N}]/u.test(cluster.base) && cluster.marks >= 2);
  const expressiveSignatureCounts = new Map();
  for (const cluster of expressiveClusters) expressiveSignatureCounts.set(cluster.signature, (expressiveSignatureCounts.get(cluster.signature) || 0) + 1);
  const dominantExpressiveStackCount = expressiveClusters.length ? Math.max(...expressiveSignatureCounts.values()) : 0;
  const eligibleBaseCount = (value.match(/[\p{L}\p{N}]/gu) || []).length;
  const markedEligibleClusterCount = clusters.filter((cluster) => /[\p{L}\p{N}]/u.test(cluster.base)).length;
  const lines = value.split(/\r?\n/);
  const lineCoverage = lines.map((line) => {
    const eligible = (line.match(/[\p{L}\p{N}]/gu) || []).length;
    const marked = clusterTelemetry(line).filter((cluster) => /[\p{L}\p{N}]/u.test(cluster.base)).length;
    return Object.freeze({ eligible, marked, ratio: eligible ? marked / eligible : 0 });
  });
  const denseMarkedLineCount = lines.filter((line) => clusterTelemetry(line).some((cluster) => cluster.marks >= 6 && cluster.above >= 2 && cluster.below >= 2)).length;
  const tallVerticalMarkedLineCount = lines.filter((line) =>
    clusterTelemetry(line).some((cluster) =>
      cluster.verticalOrnament >= 4 && cluster.verticalAbove >= 1 && cluster.verticalBelow >= 1
    )
  ).length;
  const deepBidirectionalMarkedLineCount = lines.filter((line) =>
    clusterTelemetry(line).some((cluster) =>
      cluster.verticalAbove >= 2 && cluster.verticalBelow >= 2 && cluster.verticalOrnament >= 5
    )
  ).length;
  const leapingVerticalMarkedLineCount = lines.filter((line) =>
    clusterTelemetry(line).some((cluster) =>
      cluster.verticalOrnament >= 6
        && Math.max(cluster.verticalAbove, cluster.verticalBelow) >= 4
    )
  ).length;
  const broadMarkedLineCount = lineCoverage.filter((line) => line.eligible >= 8 && line.ratio >= 0.18).length;
  const asciiLetters = value.match(/[A-Za-z]/g) || [];
  const uppercaseAscii = value.match(/[A-Z]/g) || [];
  const asciiPseudoOrnamentBridges = value.match(/[A-Za-z0-9][ 	]*[\\/|_=][ 	]*[A-Za-z0-9]/g) || [];
  const geometricSymbols = Array.from(value).filter((char) => GEOMETRIC_SUBSTITUTION_PATTERN.test(char));
  const strippedForSymbolCheck = value.replace(/\p{M}+/gu, '');
  const strippedChars = Array.from(strippedForSymbolCheck);
  let wordInternalGeometricSymbolCount = 0;
  for (let index = 1; index < strippedChars.length - 1; index += 1) {
    const char = strippedChars[index];
    if (!GEOMETRIC_SUBSTITUTION_PATTERN.test(char)) continue;
    if (/[\p{L}\p{N}]/u.test(strippedChars[index - 1]) && /[\p{L}\p{N}]/u.test(strippedChars[index + 1])) {
      wordInternalGeometricSymbolCount += 1;
    }
  }
  const uniqueMarks = new Set(runs.flatMap((run) => Array.from(run)));
  const eligibleClusters = clusters.filter((cluster) => /[\p{L}\p{N}]/u.test(cluster.base));
  const aboveMarkedClusterCount = eligibleClusters.filter((cluster) => cluster.verticalAbove > 0).length;
  const belowMarkedClusterCount = eligibleClusters.filter((cluster) => cluster.verticalBelow > 0).length;
  const bidirectionalClusterCount = eligibleClusters.filter((cluster) => cluster.verticalAbove > 0 && cluster.verticalBelow > 0).length;
  const stackHeightDiversity = new Set(expressiveClusters.map((cluster) => cluster.marks)).size;
  const markFrequency = new Map();
  for (const run of runs) {
    for (const mark of Array.from(run)) markFrequency.set(mark, (markFrequency.get(mark) || 0) + 1);
  }
  const combiningMarkCount = runs.reduce((sum, run) => sum + Array.from(run).length, 0);
  const dominantCombiningCodePointCount = markFrequency.size ? Math.max(...markFrequency.values()) : 0;
  const dominantCombiningCodePointRatio = combiningMarkCount ? dominantCombiningCodePointCount / combiningMarkCount : 0;
  const aboveLineMarkCount = clusters.reduce((sum, cluster) => sum + cluster.above, 0);
  const belowLineMarkCount = clusters.reduce((sum, cluster) => sum + cluster.below, 0);
  const throughLineMarkCount = clusters.reduce((sum, cluster) => sum + cluster.through, 0);
  const planarMarkCount = clusters.reduce((sum, cluster) => sum + cluster.planar, 0);
  const verticalOrnamentMarkCount = clusters.reduce((sum, cluster) => sum + cluster.verticalOrnament, 0);
  const verticalAboveLineMarkCount = clusters.reduce((sum, cluster) => sum + cluster.verticalAbove, 0);
  const verticalBelowLineMarkCount = clusters.reduce((sum, cluster) => sum + cluster.verticalBelow, 0);
  const enclosingMarkCount = clusters.reduce((sum, cluster) => sum + cluster.enclosing, 0);
  const enclosingMarkedClusterCount = eligibleClusters.filter((cluster) => cluster.enclosing > 0).length;
  const unclassifiedCombiningMarkCount = clusters.reduce((sum, cluster) => sum + cluster.unclassified, 0);
  const verticalMarkedClusterCount = eligibleClusters.filter((cluster) => cluster.verticalOrnament > 0).length;
  const throughMarkedClusterCount = eligibleClusters.filter((cluster) => cluster.planar > 0).length;
  const mixedAxisClusterCount = eligibleClusters.filter((cluster) => cluster.planar > 0 && cluster.verticalOrnament > 0).length;
  const activeAxisCount = Number(verticalMarkedClusterCount > 0) + Number(throughMarkedClusterCount > 0);
  const axisClusterMaximum = Math.max(verticalMarkedClusterCount, throughMarkedClusterCount);
  const axisClusterBalanceRatio = axisClusterMaximum
    ? Math.min(verticalMarkedClusterCount, throughMarkedClusterCount) / axisClusterMaximum
    : 0;
  const verticalMaximum = Math.max(verticalAboveLineMarkCount, verticalBelowLineMarkCount);
  const verticalZoneBalanceRatio = verticalMaximum
    ? Math.min(verticalAboveLineMarkCount, verticalBelowLineMarkCount) / verticalMaximum
    : 0;
  const axisMarkMaximum = Math.max(verticalOrnamentMarkCount, planarMarkCount);
  const axisMarkBalanceRatio = axisMarkMaximum
    ? Math.min(verticalOrnamentMarkCount, planarMarkCount) / axisMarkMaximum
    : 0;
  const maxVerticalOrnamentStackDepth = eligibleClusters.length
    ? Math.max(...eligibleClusters.map((cluster) => cluster.verticalOrnament))
    : 0;
  const deepVerticalShareOfMarked = verticalMarkedClusterCount
    ? leapingVerticalClusters.length / verticalMarkedClusterCount
    : 0;
  const lightVerticalShareOfMarked = verticalMarkedClusterCount
    ? lightVerticalClusters.length / verticalMarkedClusterCount
    : 0;
  return Object.freeze({
    combiningMarkCount,
    maxRun: runs.reduce((max, run) => Math.max(max, Array.from(run).length), 0),
    runCount: runs.length,
    markedEligibleClusterCount,
    eligibleBaseCount,
    markedGraphemeCoverageRatio: eligibleBaseCount ? markedEligibleClusterCount / eligibleBaseCount : 0,
    denseVerticalClusterCount: denseClusters.length,
    tallVerticalOrnamentClusterCount: tallVerticalClusters.length,
    tallVerticalMarkedLineCount,
    deepBidirectionalClusterCount: deepBidirectionalClusters.length,
    deepBidirectionalMarkedLineCount,
    extremeVerticalClusterCount: extremeVerticalClusters.length,
    leapingVerticalClusterCount: leapingVerticalClusters.length,
    leapingVerticalMarkedLineCount,
    lightVerticalClusterCount: lightVerticalClusters.length,
    maxVerticalOrnamentStackDepth,
    deepVerticalShareOfMarked,
    lightVerticalShareOfMarked,
    planarMarkCount,
    verticalOrnamentMarkCount,
    uniqueDenseStackSignatureCount: denseSignatureCounts.size,
    dominantDenseStackCount,
    dominantDenseStackRatio: denseClusters.length ? dominantDenseStackCount / denseClusters.length : 0,
    expressiveClusterCount: expressiveClusters.length,
    uniqueExpressiveStackSignatureCount: expressiveSignatureCounts.size,
    dominantExpressiveStackCount,
    dominantExpressiveStackRatio: expressiveClusters.length ? dominantExpressiveStackCount / expressiveClusters.length : 0,
    combiningCodePointDiversity: uniqueMarks.size,
    dominantCombiningCodePointCount,
    dominantCombiningCodePointRatio,
    stackHeightDiversity,
    aboveLineMarkCount,
    belowLineMarkCount,
    throughLineMarkCount,
    verticalAboveLineMarkCount,
    verticalBelowLineMarkCount,
    enclosingMarkCount,
    enclosingMarkedClusterCount,
    unclassifiedCombiningMarkCount,
    geometricSymbolCount: geometricSymbols.length,
    wordInternalGeometricSymbolCount,
    verticalMarkedClusterCount,
    throughMarkedClusterCount,
    mixedAxisClusterCount,
    activeAxisCount,
    axisClusterBalanceRatio,
    axisMarkBalanceRatio,
    aboveMarkedClusterCount,
    belowMarkedClusterCount,
    bidirectionalClusterCount,
    verticalZoneBalanceRatio,
    markedLineCount: lines.filter((line) => /\p{M}/u.test(line)).length,
    denseMarkedLineCount,
    broadMarkedLineCount,
    lineBreakCount: (value.match(/\n/g) || []).length,
    uppercaseAsciiRatio: asciiLetters.length ? uppercaseAscii.length / asciiLetters.length : 0,
    asciiPseudoOrnamentBridgeCount: asciiPseudoOrnamentBridges.length
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
    if (botsTelemetry.combiningMarkCount === 0) {
      reasons.push('tauric-diana-zalgo-absent');
    } else {
      const verticalMarkCount = botsTelemetry.verticalOrnamentMarkCount;
      const horizontalMarkCount = botsTelemetry.planarMarkCount;
      const axisCollapsed = (
        botsTelemetry.combiningMarkCount >= 12
        && botsTelemetry.markedEligibleClusterCount >= 6
        && (
          botsTelemetry.verticalMarkedClusterCount < 2
          || (
            horizontalMarkCount >= 18
            && horizontalMarkCount > verticalMarkCount
            && botsTelemetry.axisMarkBalanceRatio < 0.16
          )
        )
      );
      if (
        botsTelemetry.combiningMarkCount < 12
        || botsTelemetry.markedEligibleClusterCount < 6
        || botsTelemetry.markedLineCount < 2
      ) reasons.push('tauric-diana-zalgo-underflow');
      if (axisCollapsed) qualityWarnings.push('tauric-diana-zalgo-axis-collapse');
      if (
        botsTelemetry.combiningMarkCount >= 24
        && horizontalMarkCount >= 18
        && horizontalMarkCount > verticalMarkCount
        && botsTelemetry.throughMarkedClusterCount >= 6
        && botsTelemetry.verticalMarkedClusterCount >= 2
        && (
          botsTelemetry.tallVerticalOrnamentClusterCount < 2
          || botsTelemetry.tallVerticalMarkedLineCount < 2
          || botsTelemetry.axisMarkBalanceRatio < 0.22
        )
      ) qualityWarnings.push('tauric-diana-zalgo-vertical-expression-thin');
      if (
        botsTelemetry.combiningMarkCount >= 24
        // Vertical absence must not depend on horizontal marks being present.
        // A one-sided crown or root can carry an event; physical wrapping and
        // provider newline choices do not determine whether it exists.
        && botsTelemetry.maxVerticalOrnamentStackDepth < 4
      ) qualityWarnings.push('tauric-diana-zalgo-vertical-pulse-absent');
      if (
        botsTelemetry.combiningMarkCount >= 12
        && botsTelemetry.activeAxisCount >= 2
        && verticalMarkCount > 0
        && horizontalMarkCount > 0
        && (
          botsTelemetry.belowLineMarkCount < 6
          || botsTelemetry.belowMarkedClusterCount < 4
          || botsTelemetry.bidirectionalClusterCount < 2
          || botsTelemetry.verticalZoneBalanceRatio < 0.16
        )
      ) qualityWarnings.push('tauric-diana-zalgo-unipolar-field');
      if (
        botsTelemetry.combiningMarkCount >= 12
        && (
          botsTelemetry.combiningCodePointDiversity < 5
          || botsTelemetry.dominantCombiningCodePointRatio > 0.55
          || botsTelemetry.stackHeightDiversity < 2
        )
      ) qualityWarnings.push('tauric-diana-zalgo-monoculture');
      if (
        botsTelemetry.combiningMarkCount < 24
        || botsTelemetry.maxRun < 3
        || botsTelemetry.markedLineCount < 2
        || botsTelemetry.lineBreakCount < 1
        || botsTelemetry.combiningCodePointDiversity < 4
        || botsTelemetry.uppercaseAsciiRatio < 0.4
      ) qualityWarnings.push('tauric-diana-zalgo-field-thin');
      if (
        botsTelemetry.expressiveClusterCount >= 4
        && (
          botsTelemetry.uniqueExpressiveStackSignatureCount < 2
          || botsTelemetry.dominantExpressiveStackRatio > 0.85
        )
      ) qualityWarnings.push('tauric-diana-zalgo-mechanical-clone');
      if (
        botsTelemetry.combiningMarkCount >= 24
        && botsTelemetry.markedGraphemeCoverageRatio >= 0.28
        && botsTelemetry.markedLineCount >= 3
        && (
          botsTelemetry.maxRun <= 2
          || (
            botsTelemetry.stackHeightDiversity < 2
            && botsTelemetry.deepBidirectionalClusterCount < 2
          )
        )
      ) qualityWarnings.push('tauric-diana-zalgo-shallow-wallpaper');
      if (
        botsTelemetry.markedGraphemeCoverageRatio < 0.18
        || botsTelemetry.broadMarkedLineCount < 2
      ) qualityWarnings.push('tauric-diana-zalgo-sparse-keyword-targeting');
      if (
        botsTelemetry.eligibleBaseCount >= 80
        && botsTelemetry.extremeVerticalClusterCount >= 1
        && (
          botsTelemetry.markedGraphemeCoverageRatio < 0.24
          || botsTelemetry.deepBidirectionalMarkedLineCount < 3
          || botsTelemetry.broadMarkedLineCount < 3
        )
      ) qualityWarnings.push('tauric-diana-zalgo-localized-burst');
      if (
        botsTelemetry.combiningMarkCount >= 12
        && (
          botsTelemetry.deepBidirectionalClusterCount < 4
          || botsTelemetry.deepBidirectionalMarkedLineCount < 2
          || botsTelemetry.extremeVerticalClusterCount < 1
        )
      ) qualityWarnings.push('tauric-diana-zalgo-stack-depth-thin');
      if (
        botsTelemetry.verticalMarkedClusterCount >= 12
        && botsTelemetry.leapingVerticalClusterCount >= 8
        && botsTelemetry.deepVerticalShareOfMarked >= 0.72
        && botsTelemetry.lightVerticalShareOfMarked <= 0.10
        // Count the clean breaths too. Measuring only marked letters calls a
        // sparse set of dramatic events a wall-to-wall tower field.
        && botsTelemetry.leapingVerticalClusterCount / botsTelemetry.eligibleBaseCount >= 0.72
      ) qualityWarnings.push('tauric-diana-zalgo-dynamic-range-collapse');
      if (botsTelemetry.asciiPseudoOrnamentBridgeCount >= 4) {
        qualityWarnings.push('tauric-diana-zalgo-ascii-pseudo-ornament');
      }
      if (
        botsTelemetry.enclosingMarkCount >= 3
        || botsTelemetry.enclosingMarkedClusterCount >= 3
      ) qualityWarnings.push('tauric-diana-zalgo-enclosing-ornament-collapse');
      if (
        botsTelemetry.wordInternalGeometricSymbolCount >= 2
        || (botsTelemetry.geometricSymbolCount >= 8 && botsTelemetry.wordInternalGeometricSymbolCount >= 1)
      ) qualityWarnings.push('tauric-diana-zalgo-glyph-substitution-collapse');
    }
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

// One voice contract for initial generation and the bounded same-provider repair.
// This guides provider authorship; it neither generates nor transforms output.
export function buildNativeProsodyGuidance() {
  return [
    'NATIVE SEMANTIC PROSODY:',
    'Kʰonapolit writes clean formal prose with ZERO combining diacritical marks. Preserve mathematics and framework literals.',
    'Keep the exact standalone headings “Kʰonapolit” and “Tauric Diana bots” plain and undecorated.',
    'After Kʰonapolit explicitly yields the earned consequence, the Tauric Diana bots finish the same argument in provider-authored High Zalgo. Typography is semantic prosody, not decoration: rhetorical pressure may change density, axis, species, depth, collision, and recurrence.',
    'Do not follow a fixed ornament recipe, mark quota, required contour, or per-character filter. Let anger erupt above and below neighboring letters, sarcasm twitch sideways, tenderness thin without vanishing, an ally-facing phrase become more legible, and a returning motif come back altered.',
    'High Zalgo may mix vertical crowns/roots with horizontal or oblique counter-rhythm. Deep collisions belong at earned peaks; quieter passages may breathe. Avoid cloned stacks and uniform wallpaper because repetition should arise from rhetoric, not a transform.',
    'THE GEMINI API MUST AUTHOR THE ACTUAL COMBINING CODE POINTS. Marrowline preserves the provider return and never decorates, expands, synthesizes, overlays, or Zalgo-encodes the answer afterward.',
    'Preserve Khona‌lit-po, U+10D613, Kʰonapolit, Tauric Diana, 𝌋, ⟐, URLs, code, paths, and hashes without ornament.',
    'Length follows the task. Develop the derivation fully, let the handoff happen only when earned, and do not print a plan or discuss these instructions.'
  ].join('\n');
}

export function buildRelaySystemAddendum(apertureReceipt = {}) {
  return [
    '',
    'APERTURE ROUTE RECEIPT:',
    apertureV3DisplayHeader(apertureReceipt),
    '- Aperture routes and receipts; it does not generate the substantive prose.',
    '- Gemini is the model-mediated instrument/carrier only. Do not create a separate provider answer or adopt either named register as Gemini’s own identity.',
    '- Provider family and exact model belong only in provenance receipts and debugging metadata.',
    '- The operator retains closure authority; leave the lozenge seal open for the operator.',
    '',
    'MARROWLINE CAUSAL RELAY LAW:',
    '- Produce one continuous response and one live argument.',
    '- Kʰonapolit comes first. Recover the prompt-specific contradiction, dependency, non-equivalence, number, mechanism, or boundary condition and develop the strongest rigorous derivation available before rushing toward a second register.',
    '- When that reasoning reaches a consequence that belongs to the Tauric Diana bots, Kʰonapolit explicitly yields or relays it. The bots then finish the response by extending, mutating, ridiculing, ritualizing, or intensifying that same consequence; they do not repeat her argument.',
    '- Use the exact standalone headings “Kʰonapolit” and “Tauric Diana bots”, in that order. The headings are plain boundary anchors; the prose after the second heading carries the expressive morphology.',
    '- Receiver, tracer, relay, signal, and transmission describe this model-mediated composition only. They are not evidence of an external entity, hidden port, supernatural contact, hardware rupture, independent communication channel, or outside authorship.',
    '',
    'GENERATIVE CONTINUITY:',
    '- Prompt-native reasoning outranks canon recitation. Motifs return only when they do new work for the operator’s present number, object, mechanism, distinction, joke, or adversarial move.',
    '- For analysis, be technically exact enough that removing the theatrical language leaves a substantive argument. For story, produce event, tension, transformation, and consequence rather than atmospheric inventory.',
    '- Preserve running jokes and callbacks when they carry the argument; do not dump the corpus as a keyword list.',
    '',
    'TD613 FLIGHT GLYPH LAW:',
    '- 𝌋 is ingress/writerly activation. Preserve it exactly when used.',
    '- ⟐ is the later operator closing seal. NEVER append it on model authority.',
    '- Preserve Khona‌lit-po byte-for-byte including the ZWNJ. Preserve U+10D613, 𝌋, ⟐, URLs, code, paths and hashes without combining marks.',
    '- Do not counterfeit Badge Received / SHI issuance when the session is unissued or waived.',
    '',
    buildNativeProsodyGuidance(),
    '',
    'NATURAL RETURN SHAPE — NO JSON, NO MARKDOWN FENCE, NO PREFACE:',
    'Kʰonapolit',
    '[full clean derivation]',
    '',
    'Tauric Diana bots',
    '[terminal provider-authored High-Zalgo transmission that grows from the earned consequence]',
    '- These headings are the only required structural anchors. Do not print packet names, channel labels, internal delimiters, a checklist, or a preflight report.',
    '- Do not append ⟐ on the model’s own authority. The operator controls sealing.',
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

function parseNaturalRelayHandoff(rawText = '') {
  const clean = stripFence(rawText).trim();
  const khona = clean.match(/(?:^|\\n)[ \\t]*(?:#{1,6}[ \\t]*)?Kʰonapolit[ \\t]*(?:[:\\-][ \\t]*)?(?:\\n|$)/iu);
  const bots = clean.match(/(?:^|\\n)[ \\t]*(?:#{1,6}[ \\t]*)?Tauric Diana bots?[ \\t]*(?:[:\\-][ \\t]*)?(?:\\n|$)/iu);
  if (!khona || !bots) return null;
  const khonaIndex = Number(khona.index ?? -1);
  const botsIndex = Number(bots.index ?? -1);
  if (khonaIndex < 0 || botsIndex <= khonaIndex) return null;
  return Object.freeze({
    text: clean,
    voices: Object.freeze(['Kʰonapolit', 'Tauric Diana bots']),
    flourishMode: 'provider-native-causal-handoff'
  });
}

export function parseRelayEnvelope(rawText = '', { model = 'provider', apertureReceipt = null } = {}) {
  const rawPacket = parseRawRelayPackets(rawText);
  if (rawPacket) {
    const text = rawPacket.text;
    const telemetry = flourishTelemetry(text);
    const admission = assessIntegratedTransmission(text);
    const state = !admission.admissible ? 'NOT_LOCKED' : admission.quality === 'PARTIAL' ? 'PARTIAL' : 'LOCKED';
    const notes = admission.admissible
      ? ['Provider raw dual-packet return admitted without Unicode transformation.',
        admission.quality === 'PARTIAL' ? `Local quality warning: ${admission.qualityWarnings.join(', ')}` : ''].filter(Boolean).join(' ')
      : `Provider raw dual-packet return held: ${admission.reasons.join(', ')}`;
    return Object.freeze({
      schema: KHONAPOLIT_RELAY_SCHEMA,
      apertureHeader: apertureV3DisplayHeader(apertureReceipt || {}),
      signal: Object.freeze({
        state,
        notes,
        source: 'provider-raw-dual-packet-plus-local-structural-observation',
        downstreamAdmitted: admission.admissible && Boolean(safe(text))
      }),
      parts: Object.freeze([integratedPart({
        text,
        model,
        voices: rawPacket.voices,
        flourishMode: rawPacket.flourishMode,
        providerNative: true
      })]),
      admission,
      highZalgo: Object.freeze({
        applied: false,
        providerGenerated: telemetry.combiningMarkCount > 0,
        source: 'provider-native',
        version: HIGH_ZALGO_VERSION,
        profile: rawPacket.flourishMode,
        protectedLiterals: PROTECTED,
        ...telemetry
      }),
      transcript: text
    });
  }

  const natural = parseNaturalRelayHandoff(rawText);
  if (natural) {
    const text = natural.text;
    const telemetry = flourishTelemetry(text);
    const admission = assessIntegratedTransmission(text, natural.voices);
    const state = !admission.admissible ? 'NOT_LOCKED' : admission.quality === 'PARTIAL' ? 'PARTIAL' : 'LOCKED';
    const notes = admission.admissible
      ? ['Provider natural causal-handoff return observed without Unicode transformation.',
        admission.quality === 'PARTIAL' ? `Local quality warning: ${admission.qualityWarnings.join(', ')}` : ''].filter(Boolean).join(' ')
      : `Provider natural causal-handoff return observed with local structural reasons: ${admission.reasons.join(', ')}`;
    return Object.freeze({
      schema: KHONAPOLIT_RELAY_SCHEMA,
      apertureHeader: apertureV3DisplayHeader(apertureReceipt || {}),
      signal: Object.freeze({
        state,
        notes,
        source: 'provider-natural-causal-handoff-plus-local-observation',
        downstreamAdmitted: admission.admissible && Boolean(safe(text))
      }),
      parts: Object.freeze([integratedPart({
        text,
        model,
        voices: natural.voices,
        flourishMode: natural.flourishMode,
        providerNative: true
      })]),
      admission,
      highZalgo: Object.freeze({
        applied: false,
        providerGenerated: telemetry.combiningMarkCount > 0,
        source: 'provider-native',
        version: HIGH_ZALGO_VERSION,
        profile: natural.flourishMode,
        protectedLiterals: PROTECTED,
        ...telemetry
      }),
      transcript: text
    });
  }

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
