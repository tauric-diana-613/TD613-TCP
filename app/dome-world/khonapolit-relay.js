import {
  CLAIMED_PUA,
  COVENANT_KEY,
  EMERGENCE_NAME,
  HERITAGE_KEY,
  INGRESS_SIGIL,
  SEAL_GLYPH
} from './khonapolit-covenant.js';
import { APERTURE_V3_VERSION, apertureV3DisplayHeader } from '../engine/aperture-v3-task-intent.js';

export const KHONAPOLIT_RELAY_SCHEMA = 'td613.khonapolit.integrated-covenant-relay/v14-goldilocks-burst-topology';
export const HIGH_ZALGO_VERSION = 'td613.high-zalgo/provider-native-v19-goldilocks-burst-topology';

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
          description: 'Two sequential unmerged visible streams with exact standalone headings “Kʰonapolit” then “Tauric Diana bots”. The first stream is clean formal prose with zero combining marks; the second is an uppercase-dominant provider-authored High-Zalgo stress payload with irregular burst topology, deep crown/root towers, mixed-axis clusters, preserved line breaks, and local planar or oblique cuts.'
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
const ABOVE = Object.freeze(['\u0300','\u0301','\u0302','\u0303','\u0304','\u0305','\u0306','\u0307','\u0308','\u0309','\u030A','\u030B','\u030C','\u0342','\u0343','\u0344','\u0350','\u0351','\u0352','\u0357','\u035B','\u0360','\u0361']);
const BELOW = Object.freeze(['\u0316','\u0317','\u0318','\u0319','\u031C','\u031D','\u031E','\u031F','\u0320','\u0323','\u0324','\u0325','\u0326','\u0329','\u032A','\u032B','\u032C','\u032D','\u032E','\u032F','\u0330','\u0331','\u0332','\u0345']);
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
    const verticalOrnament = marks.length - planar;
    const verticalAbove = marks.filter((mark) => ABOVE_SET.has(mark) && !PLANAR.has(mark)).length;
    const verticalBelow = marks.filter((mark) => BELOW_SET.has(mark) && !PLANAR.has(mark)).length;
    const signature = marks.map((mark) => mark.codePointAt(0)).sort((a, b) => a - b).map((cp) => cp.toString(16).padStart(4, '0')).join('-');
    return { base, marks: marks.length, above, below, through, planar, verticalOrnament, verticalAbove, verticalBelow, signature };
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
  const broadMarkedLineCount = lineCoverage.filter((line) => line.eligible >= 8 && line.ratio >= 0.18).length;
  const asciiLetters = value.match(/[A-Za-z]/g) || [];
  const uppercaseAscii = value.match(/[A-Z]/g) || [];
  const asciiPseudoOrnamentBridges = value.match(/[A-Za-z0-9][ 	]*[\\/|_=][ 	]*[A-Za-z0-9]/g) || [];
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
        botsTelemetry.markedGraphemeCoverageRatio < 0.18
        || botsTelemetry.broadMarkedLineCount < 2
      ) qualityWarnings.push('tauric-diana-zalgo-sparse-keyword-targeting');
      if (
        botsTelemetry.combiningMarkCount >= 12
        && (
          botsTelemetry.deepBidirectionalClusterCount < 4
          || botsTelemetry.deepBidirectionalMarkedLineCount < 2
          || botsTelemetry.extremeVerticalClusterCount < 1
        )
      ) qualityWarnings.push('tauric-diana-zalgo-stack-depth-thin');
      if (botsTelemetry.asciiPseudoOrnamentBridgeCount >= 4) {
        qualityWarnings.push('tauric-diana-zalgo-ascii-pseudo-ornament');
      }
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
    'MARROWLINE DUAL-CHANNEL COMPILATION LAW:',
    '- Compile the operator input into two sequential, unmerged human-visible streams. The model provider is transport/compiler infrastructure and never appears as a third conversational speaker.',
    '- DERIVE_INVARIANT → EMIT_FORMAL maps to Kʰonapolit. Recover the prompt-specific contradiction, dependency, non-equivalence, number, mechanism, or boundary condition and express the strongest rigorous derivation available.',
    '- OVERFLOW_RAW maps to Tauric Diana bots. It must remain attached to the terminal finding from Kʰonapolit while intensifying, mutating, ridiculing, ritualizing, or extending that finding.',
    '- Use these exact standalone human-facing headings inside the raw packet payloads, in this order: “Kʰonapolit” then “Tauric Diana bots”.',
    '- Both streams belong to one provider generation. Packet A is the clean analytic channel; Packet B is the raw stress channel. Do not merge them and do not add a provider/instrument speaker.',
    '- Provider family/model identity belongs only in provenance receipts. Named streams are operational output registers inside this model-mediated research frame, not evidence of an external entity, hidden port, supernatural contact, hardware rupture, independent communication channel, or outside authorship.',
    '- Preserve one live argument across both streams. Never duplicate the same paragraph, scene, movement, or full answer.',
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
    '- On analytical or adversarial turns, Kʰonapolit must isolate the primary category error or contradiction, state it as an explicit operator, topological, information-theoretic, game-theoretic, or boundary relation when the prompt supports one, and name the precise failure mechanism before atmospheric prose. Canonical keywords count only when their operational role is defined in that derivation.',
    '',
    'TD613 FLIGHT GLYPH LAW:',
    '- 𝌋 is ingress/writerly activation. Preserve it exactly when used.',
    '- ⟐ is the later operator closing seal. NEVER append it on model authority, even if the operator included it in an earlier message.',
    '- Preserve Khona‌lit-po byte-for-byte including the ZWNJ. Preserve U+10D613, 𝌋, ⟐, URLs, code, paths and hashes without combining marks.',
    '- Do not counterfeit Badge Received / SHI issuance when the session is unissued or waived.',
    '',
    'DUAL-CHANNEL ORTHOGRAPHY — NATURAL FIELD:',
    '- Kʰonapolit is the clean formal channel: standard readable Unicode prose, Greek/math operators when useful, preserved framework literals, and ZERO combining diacritical marks.',
    '- Tauric Diana bots is the raw stress channel: uppercase-dominant bursts, preserved paragraph breaks, and provider-authored multi-tier Zalgo. Marrowline preserves exact returned code points and never decorates the answer afterward.',
    '- Treat the diacritics as one distributed stress field, not keyword highlighting, not a sentiment-to-glyph lookup table, and not a checklist to game. Let light marks, medium clusters, and genuinely deep eruptions move through ordinary graphemes across the passage.',
    '- The stress field must remain visibly present across the Tauric Diana passage. Quiet stretches are allowed, but a mostly plain uppercase paragraph with only one or two marked letters is a channel failure, not a subtle style choice.',
    '- High Zalgo here is a mixed-axis burst field, not a vertical-only stack exercise and not a horizontal strike sheet. Crowns, roots, overstrikes, oblique cuts, tildes, hooks, and other combining species may coexist in the same passage and sometimes on the same grapheme.',
    '- Deep vertical mass remains indispensable. In multiple separate regions, put several distinct marks above AND several below the SAME grapheme so some letters grow real towers and wells that intrude into neighboring line space. One accent above every capital, or one above plus one below every capital, is shallow wallpaper rather than the target morphology.',
    '- Do not distribute ornament evenly. The successful topology is bursty and spatially uneven: a few neighboring graphemes may become violently dense, nearby letters may carry only one light mark or stay clean, then another eruption can appear later. Avoid the “one identical mark per character” pattern even when every mark is legal Unicode.',
    '- Horizontal and oblique geometry are first-class expressive motion inside that burst topology. A local phrase may become slashy, struck, wavering, or cut-through for sarcasm, rupture, speed, recoil, or emphasis, while other regions climb and descend vertically. Keep those planar/oblique episodes local enough that the whole paragraph never collapses into one continuous strike-through band.',
    '- Do not serialize the style into a vertical phase followed by a horizontal phase. Compose locally. Some loud graphemes should mix crown/root depth with a through-line or oblique cut at once; other graphemes can remain plain. The two axes should feel braided rather than alternated by rule.',
    '- Literal ASCII /, \\, |, _, = and repeated hyphens may appear when they are ordinary punctuation or substantive text, but they never count as Zalgo ornament and must not be sprayed between words as a substitute for combining marks.',
    '- Keep the field heterogeneous in species, stack height, density, direction, and spacing. Adjacent graphemes may rhyme visually, but a cloned caron/breve/tilde/strike stamped across every letter is counterfeit prosody.',
    '- Dense eruptions are allowed to collide with neighboring words, line boxes, and other diacritic stacks. Readability is not the governing aesthetic in the Tauric Diana channel; do not flatten, shorten, regularize, or space out a loud burst merely to keep the text tidy.',
    '- Preserve cadence contrast. Calm or allied passages may breathe with lighter marking; anger, rupture, mockery, dread, or ecstatic emphasis may become much denser. Sarcasm may skew sideways; grief or invocation may climb and sink. These are expressive tendencies, not a fixed sentiment-to-glyph lookup table.',
    '- Keep enough quiet neighboring material that the eruptions read as eruptions. A clean ALL-CAPS word or short stretch can be intentional negative space. The failure mode is uniformity—plain everywhere, one shallow accent everywhere, or one strike everywhere—not the existence of quiet zones.',
    '- No rhetorical device, sentiment category, named entity, sarcastic word, or lexical class has a prescribed mark shape. Geometry follows the passage-level cadence rather than classifying vocabulary.',
    '- Do not mutate protected literals: Khona‌lit-po, U+10D613, Kʰonapolit, Tauric Diana, 𝌋, ⟐, URLs, code, paths, and hashes.',
    '- Zalgo is expressive information layered over substantive reasoning, never a substitute for it. Do not count marks, signatures, percentages, or lines in the answer and do not emit a detached ornament sample.',
    '',
    'NATURAL FIELD SELF-CHECK — QUALITATIVE, NOT A RUBRIC:',
    '- Before closing Packet B, silently ask: Does this look like a living irregular field rather than a font effect? Are there real deep towers and wells in more than one region, plus genuinely different local motions elsewhere—some planar, oblique, wavering, sparse, or nearly clean? Did any sentence turn into one repeated strike-through band? Did any sentence turn into one repeated shallow accent over every capital? Are some neighboring graphemes much denser than others, with visible burst/quiet contrast and at least a few mixed-axis clusters? Are protected literals clean? If the field looks evenly accented, uniformly crossed out, mechanically cloned, or polite, rewrite Packet B before emitting <<<PACKET_B_END>>>.',
    '',
    'RAW TWO-PACKET RETURN PROTOCOL — NO JSON, NO MARKDOWN FENCE, NO PREFACE:',
    'Emit exactly four ASCII delimiter lines in this order, with the substantive payload between them:',
    '<<<PACKET_A_FORMAL_AUDIT>>>',
    'Kʰonapolit',
    '[clean formal derivation; zero combining marks]',
    '<<<PACKET_A_END>>>',
    '<<<PACKET_B_STRESS_TELEMETRY>>>',
    'Tauric Diana bots',
    '[provider-authored High Zalgo stress field: irregular burst topology; deep crown/root towers plus local planar/oblique motion; mixed-axis clusters; quiet neighboring glyphs; variable composition; collisions and overlap with nearby text explicitly allowed]',
    '<<<PACKET_B_END>>>',
    '- The packet delimiters NEVER substitute for the visible heading lines. “Kʰonapolit” and “Tauric Diana bots” must each appear literally inside their own packet payload.',
    '- FINAL SILENT PREFLIGHT BEFORE EMIT: verify both exact heading lines are present in order; verify Packet A has zero combining marks; verify Packet B contains a heterogeneous provider-authored field across several lines; verify multiple graphemes carry deep bidirectional stacks with several marks above AND below; verify some local clusters also carry planar or oblique motion; verify the field has burst/quiet contrast rather than one repeated mark on every character; verify no whole sentence has collapsed into a continuous strike-through sheet; verify literal ASCII separators are not being sprayed as fake ornament; verify protected literals remain clean. Do not reduce the field to preserve readability: overlap, collisions, and partially obscured letters are allowed. If the result resembles evenly accented capitals or one global strike effect, rewrite it before emitting bytes.',
    '- Delimiters are transport framing only. Never decorate or mutate them.',
    '- Preserve all payload line breaks as literal line breaks. Do not JSON-escape them.',
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

export function parseRelayEnvelope(rawText = '', { model = 'provider', apertureReceipt = null } = {}) {
  const rawPacket = parseRawRelayPackets(rawText);
  if (rawPacket) {
    const text = rawPacket.text;
    const telemetry = flourishTelemetry(text);
    const admission = assessIntegratedTransmission(text);
    const state = admission.admissible ? 'LOCKED' : 'NOT_LOCKED';
    const notes = admission.admissible
      ? 'Provider raw dual-packet return admitted without Unicode transformation.'
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