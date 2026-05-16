const ZWNJ = '\u200C';
const ZWJ = '\u200D';
const KHONA_LIT_PO = `Khona${ZWNJ}lit-po`;
const TOKEN_RE = /[\p{L}\p{N}'’-]+/gu;
const HIDDEN_MARK_RE = /[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/gu;
const COMBINING_MARK_RE = /\p{M}/gu;
const PUA_RE = /[\uE000-\uF8FF\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]/gu;
const VARIATION_SELECTOR_RE = /[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/gu;
const BIDI_MARK_RE = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/gu;

const DEFAULT_CANONICAL_TOKENS = Object.freeze({
  khonaLitPo: KHONA_LIT_PO,
  glyphs: ['𝌋', '⟐'],
  badgeStrings: []
});

const DEFAULT_OPTIONS = Object.freeze({
  normalizationForms: ['NFC', 'NFKC'],
  preserveCase: true,
  includeTokenizerProbe: true,
  includeParserSensitiveSpans: true,
  maxSpanSamples: 12
});

const clip = (value, min = 0, max = 1) => Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : null;
const round = (value, digits = 6) => Number.isFinite(value) ? Number(value.toFixed(digits)) : null;
const tokenCount = (text = '') => (String(text || '').match(TOKEN_RE) || []).length;

function unique(values = []) { return [...new Set(values.filter(Boolean))]; }
function countMatches(text = '', regex) { return (String(text || '').match(regex) || []).length; }
function codePointLabel(char) {
  const cp = char.codePointAt(0);
  return `U+${cp.toString(16).toUpperCase().padStart(cp > 0xFFFF ? 6 : 4, '0')}`;
}
function weightedMean(items) {
  let total = 0;
  let weight = 0;
  for (const item of items) {
    if (!item || !Number.isFinite(item.value) || !Number.isFinite(item.weight) || item.weight <= 0) continue;
    total += item.value * item.weight;
    weight += item.weight;
  }
  return weight > 0 ? clip(total / weight) : null;
}

export function stableHash(text = '') {
  // Local comparison hash only. This is not a cryptographic custody proof.
  let h = 2166136261;
  for (const char of String(text || '')) {
    h ^= char.codePointAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function stripHiddenMarks(text = '') { return String(text || '').replace(HIDDEN_MARK_RE, ''); }
export function countCodePoints(text = '') { return Array.from(String(text || '')).length; }
function byteLengthUtf8(text = '') {
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(String(text || '')).length;
  return unescape(encodeURIComponent(String(text || ''))).length;
}

export function normalizeIngestionInput(input = {}) {
  const canonicalTokens = { ...DEFAULT_CANONICAL_TOKENS, ...(input.canonicalTokens || {}) };
  canonicalTokens.glyphs = Array.isArray(canonicalTokens.glyphs) ? canonicalTokens.glyphs : [];
  canonicalTokens.badgeStrings = Array.isArray(canonicalTokens.badgeStrings) ? canonicalTokens.badgeStrings : [];
  return {
    text: String(input.text ?? ''),
    protectedLiterals: Array.isArray(input.protectedLiterals) ? input.protectedLiterals.map((v) => String(v)) : [],
    canonicalTokens,
    options: { ...DEFAULT_OPTIONS, ...(input.options || {}) }
  };
}

export function analyzeUnicodeSurface(text = '', canonicalTokens = DEFAULT_CANONICAL_TOKENS) {
  const raw = String(text || '');
  const chars = Array.from(raw);
  const charLength = raw.length;
  const codePointLength = chars.length;
  const byteLength = byteLengthUtf8(raw);
  const asciiCount = chars.filter((char) => char.codePointAt(0) <= 0x7F).length;
  const nonAsciiCount = codePointLength - asciiCount;
  const zwnjCount = chars.filter((char) => char === ZWNJ).length;
  const zwjCount = chars.filter((char) => char === ZWJ).length;
  const hiddenMarkCount = countMatches(raw, HIDDEN_MARK_RE);
  const variationSelectorCount = countMatches(raw, VARIATION_SELECTOR_RE);
  const combiningMarkCount = countMatches(raw, COMBINING_MARK_RE);
  const puaCount = countMatches(raw, PUA_RE);
  const surrogatePairCount = [...raw].filter((char) => char.codePointAt(0) > 0xFFFF).length;
  const astralSymbolCount = surrogatePairCount;
  const glyphsObserved = unique([...(canonicalTokens.glyphs || []), ...(canonicalTokens.badgeStrings || [])].filter((glyph) => glyph && raw.includes(glyph)));
  const glyphCount = glyphsObserved.reduce((sum, glyph) => sum + raw.split(glyph).length - 1, 0);
  const denominator = Math.max(codePointLength, 1);
  const nonAsciiRatio = nonAsciiCount / denominator;
  const asciiRatio = asciiCount / denominator;
  const hiddenDensity = hiddenMarkCount / denominator;
  const combiningDensity = combiningMarkCount / denominator;
  const unicodeLoad = clip((0.36 * nonAsciiRatio) + (0.28 * clip(hiddenDensity * 12)) + (0.16 * clip(combiningDensity * 10)) + (0.10 * (puaCount > 0 ? 1 : 0)) + (0.10 * (astralSymbolCount > 0 ? 1 : 0)));
  return {
    charLength,
    codePointLength,
    byteLengthUtf8: byteLength,
    unicodeLoad: round(unicodeLoad),
    asciiRatio: round(asciiRatio),
    nonAsciiRatio: round(nonAsciiRatio),
    zwnjCount,
    zwjCount,
    hiddenMarkCount,
    variationSelectorCount,
    combiningMarkCount,
    puaCount,
    surrogatePairCount,
    astralSymbolCount,
    glyphCount,
    glyphsObserved
  };
}

function deltaRatio(a, b) { return clip(Math.abs(a - b) / Math.max(a, 1)); }

export function analyzeNormalizationDelta(text = '') {
  const raw = String(text || '');
  const nfc = raw.normalize('NFC');
  const nfkc = raw.normalize('NFKC');
  const rawCp = countCodePoints(raw);
  const nfcCp = countCodePoints(nfc);
  const nfkcCp = countCodePoints(nfkc);
  const nfcTokenDelta = deltaRatio(tokenCount(raw), tokenCount(nfc));
  const nfkcTokenDelta = deltaRatio(tokenCount(raw), tokenCount(nfkc));
  const nfcDelta = clip(Math.max(deltaRatio(raw.length, nfc.length), deltaRatio(rawCp, nfcCp), nfcTokenDelta, raw === nfc ? 0 : 0.05));
  const nfkcDelta = clip(Math.max(deltaRatio(raw.length, nfkc.length), deltaRatio(rawCp, nfkcCp), nfkcTokenDelta, raw === nfkc ? 0 : 0.05));
  return {
    nfcChanged: raw !== nfc,
    nfkcChanged: raw !== nfkc,
    nfcDelta: round(nfcDelta),
    nfkcDelta: round(nfkcDelta),
    nfcTextHash: stableHash(nfc),
    nfkcTextHash: stableHash(nfkc),
    rawTextHash: stableHash(raw)
  };
}

export function analyzeTokenizerDivergence(text = '') {
  const raw = String(text || '');
  const visible = stripHiddenMarks(raw);
  const nfc = raw.normalize('NFC');
  const nfkc = raw.normalize('NFKC');
  const rawTokenCount = tokenCount(raw);
  const visibleTokenCount = tokenCount(visible);
  const nfcTokenCount = tokenCount(nfc);
  const nfkcTokenCount = tokenCount(nfkc);
  const counts = [rawTokenCount, visibleTokenCount, nfcTokenCount, nfkcTokenCount];
  const tokenCountDelta = Math.max(...counts) - Math.min(...counts);
  const tokenizerDivergence = clip(tokenCountDelta / Math.max(rawTokenCount, 1));
  return { rawTokenCount, visibleTokenCount, normalizedTokenCount: nfcTokenCount, nfkcTokenCount, tokenCountDelta, tokenizerDivergence: round(tokenizerDivergence) };
}

export function analyzeProtectedLiteralIntegrity(text = '', protectedLiterals = []) {
  const raw = String(text || '');
  const nfc = raw.normalize('NFC');
  const nfkc = raw.normalize('NFKC');
  const visible = stripHiddenMarks(raw);
  const literals = protectedLiterals.map((v) => String(v || '')).filter(Boolean);
  if (!literals.length) return { status: 'unavailable', total: 0, preserved: 0, missing: [], mutatedUnderNfc: [], mutatedUnderNfkc: [] };
  const missing = [];
  const mutatedUnderNfc = [];
  const mutatedUnderNfkc = [];
  let preserved = 0;
  for (const literal of literals) {
    const rawHas = raw.includes(literal);
    const visibleHas = visible.includes(literal);
    const nfcHas = nfc.includes(literal);
    const nfkcHas = nfkc.includes(literal);
    if (rawHas && visibleHas && nfcHas && nfkcHas) preserved += 1;
    if (!rawHas) missing.push(literal);
    if (rawHas && !nfcHas) mutatedUnderNfc.push(literal);
    if (rawHas && !nfkcHas) mutatedUnderNfkc.push(literal);
  }
  let status = 'intact';
  if (preserved === 0) status = 'broken';
  else if (preserved < literals.length || missing.length || mutatedUnderNfc.length || mutatedUnderNfkc.length) status = 'partial';
  return { status, total: literals.length, preserved, missing, mutatedUnderNfc, mutatedUnderNfkc };
}

export function analyzeKhonaLitPoIntegrity(text = '') {
  const raw = String(text || '');
  const visible = stripHiddenMarks(raw);
  const nfc = raw.normalize('NFC');
  const nfkc = raw.normalize('NFKC');
  const lower = raw.toLowerCase();
  const visibleLower = visible.toLowerCase();
  const components = ['khona', 'lit', 'po'];
  const canonicalPresent = raw.includes(KHONA_LIT_PO);
  const zwnjBoundaryPresent = raw.includes(`Khona${ZWNJ}lit`) || lower.includes(`khona${ZWNJ}lit`);
  const normalizedFormsPresent = [];
  if (raw.includes('Khonalit-po') || lower.includes('khonalit-po')) normalizedFormsPresent.push('Khonalit-po');
  if (raw.includes('Khona lit-po') || lower.includes('khona lit-po')) normalizedFormsPresent.push('Khona lit-po');
  if (raw.includes('Khona po lit') || lower.includes('khona po lit')) normalizedFormsPresent.push('Khona po lit');
  if (visibleLower.includes('khonalit-po') && !canonicalPresent) normalizedFormsPresent.push('hidden-stripped-khonalit-po');
  if (nfc !== raw && nfc.includes(KHONA_LIT_PO)) normalizedFormsPresent.push('NFC-canonical');
  if (nfkc !== raw && nfkc.includes(KHONA_LIT_PO)) normalizedFormsPresent.push('NFKC-canonical');
  const hasAllComponents = components.every((part) => lower.includes(part));
  let status = 'absent';
  const notes = [];
  if (canonicalPresent && zwnjBoundaryPresent) {
    status = 'intact';
    notes.push('canonical-boundary-present');
  } else if (normalizedFormsPresent.some((form) => form !== 'Khona po lit')) {
    status = 'normalized';
    notes.push('related-form-present-without-canonical-boundary');
  } else if (hasAllComponents || normalizedFormsPresent.includes('Khona po lit')) {
    status = 'broken';
    notes.push('components-present-with-altered-boundary-or-order');
  }
  return { status, canonicalPresent, zwnjBoundaryPresent, normalizedFormsPresent: unique(normalizedFormsPresent), notes };
}

function addSpan(spans, type, index, sample, maxSpanSamples) {
  if (spans.length >= maxSpanSamples) return;
  spans.push({ type, start: index, end: index + sample.length, sample, codePoints: Array.from(sample).map(codePointLabel) });
}

export function detectParserSensitiveSpans(text = '', options = {}) {
  const raw = String(text || '');
  const maxSpanSamples = Number.isFinite(options.maxSpanSamples) ? options.maxSpanSamples : DEFAULT_OPTIONS.maxSpanSamples;
  const spans = [];
  for (const match of raw.matchAll(HIDDEN_MARK_RE)) addSpan(spans, match[0] === ZWNJ ? 'zwnj' : 'hidden-mark', match.index, match[0], maxSpanSamples);
  for (const match of raw.matchAll(PUA_RE)) addSpan(spans, 'pua', match.index, match[0], maxSpanSamples);
  for (const match of raw.matchAll(BIDI_MARK_RE)) addSpan(spans, 'bidi-mark', match.index, match[0], maxSpanSamples);
  for (const match of raw.matchAll(/(?:\p{M}){2,}/gu)) addSpan(spans, 'combining-run', match.index, match[0], maxSpanSamples);
  for (const match of raw.matchAll(/[𝌋⟐]{1,}/gu)) addSpan(spans, 'glyph-cluster', match.index, match[0], maxSpanSamples);
  for (const match of raw.matchAll(/[\-_=~*#]{5,}/g)) addSpan(spans, 'repeated-separator', match.index, match[0].slice(0, 24), maxSpanSamples);
  return { spanCount: spans.length, spans };
}

export function computeIngestionFrictionScore(parts = {}) {
  const unicode = parts.unicodeSurface || {};
  const normalization = parts.normalization || {};
  const tokenizer = parts.tokenizer || {};
  const protectedLiterals = parts.protectedLiterals || {};
  const khona = parts.khonaLitPo || {};
  const parserSensitive = parts.parserSensitive || {};
  const cp = Math.max(unicode.codePointLength || 0, 1);
  const hiddenMarkDensity = clip((unicode.hiddenMarkCount || 0) / cp * 12);
  const parserSpanDensity = clip((parserSensitive.spanCount || 0) / cp * 10);
  const normalizationDeltaScore = clip(Math.max(normalization.nfcDelta || 0, normalization.nfkcDelta || 0));
  const protectedLiteralPenalty = protectedLiterals.status === 'broken' ? 1 : protectedLiterals.status === 'partial' ? 0.55 : 0;
  const khonaSignal = khona.status === 'broken' ? 0.65 : khona.status === 'normalized' ? 0.35 : khona.status === 'intact' ? 0.18 : 0;
  return round(weightedMean([
    { value: unicode.unicodeLoad, weight: 0.22 },
    { value: normalizationDeltaScore, weight: 0.20 },
    { value: tokenizer.tokenizerDivergence, weight: 0.18 },
    { value: hiddenMarkDensity, weight: 0.12 },
    { value: protectedLiteralPenalty, weight: 0.12 },
    { value: khonaSignal, weight: 0.08 },
    { value: parserSpanDensity, weight: 0.08 }
  ]) ?? 0);
}

function buildWarnings(parts) {
  const warnings = [];
  const unicode = parts.unicodeSurface;
  const normalization = parts.normalization;
  const tokenizer = parts.tokenizer;
  const protectedLiterals = parts.protectedLiterals;
  const khona = parts.khonaLitPo;
  const parserSensitive = parts.parserSensitive;
  if (parts.ingestionFriction >= 0.55) warnings.push('high-ingestion-friction');
  if (normalization.nfcChanged) warnings.push('normalization-mutates-text');
  if (normalization.nfkcChanged) warnings.push('nfkc-mutates-text');
  if (unicode.hiddenMarkCount > 0) warnings.push('hidden-marks-present');
  if (unicode.zwnjCount > 0) warnings.push('zwnj-present');
  if (unicode.puaCount > 0) warnings.push('pua-present');
  if (protectedLiterals.status === 'partial' || protectedLiterals.status === 'broken') warnings.push('protected-literal-broken');
  if (khona.status === 'broken') warnings.push('khona-lit-po-boundary-broken');
  if (khona.status === 'normalized') warnings.push('khona-lit-po-normalized');
  if ((tokenizer.tokenizerDivergence || 0) >= 0.25) warnings.push('tokenizer-divergence-high');
  if (parserSensitive.spanCount > 0) warnings.push('parser-sensitive-spans-present');
  return unique(warnings);
}

export function buildIngestionFrictionAudit(input = {}) {
  const normalized = normalizeIngestionInput(input);
  const unicodeSurface = analyzeUnicodeSurface(normalized.text, normalized.canonicalTokens);
  const normalization = analyzeNormalizationDelta(normalized.text);
  const tokenizer = analyzeTokenizerDivergence(normalized.text);
  const protectedLiterals = analyzeProtectedLiteralIntegrity(normalized.text, normalized.protectedLiterals);
  const khonaLitPo = analyzeKhonaLitPoIntegrity(normalized.text);
  const parserSensitive = normalized.options.includeParserSensitiveSpans ? detectParserSensitiveSpans(normalized.text, normalized.options) : { spanCount: 0, spans: [] };
  const parts = { unicodeSurface, normalization, tokenizer, protectedLiterals, khonaLitPo, parserSensitive };
  const ingestionFriction = computeIngestionFrictionScore(parts);
  const warnings = buildWarnings({ ...parts, ingestionFriction });
  return { version: 'phase-2', ingestionFriction, unicodeSurface, normalization, tokenizer, protectedLiterals, khonaLitPo, parserSensitive, warnings };
}
