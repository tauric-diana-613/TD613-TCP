export const HUSH_EXPRESSIVE_PAYLOAD_VERSION = 'phase-33-expressive-payload-preservation';

const safe = (value) => String(value ?? '');
const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(Number(value)) ? Number(value) : 0));
const round4 = (value) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(4)) : 0;
const words = (value = '') => (safe(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;

export const EXPRESSIVE_PAYLOAD_PATTERNS = [
  { id: 'custodian-not-judge', label: 'custodian not judge/jury/executioner', pattern: /custodian[^.?!]{0,80}(?:judge|jury|executioner)/i, weight: 0.16 },
  { id: 'rose-bush-pruning', label: 'rose-bush pruning metaphor', pattern: /rose\s*bush|pruning|incipience/i, weight: 0.15 },
  { id: 'rot-latency', label: 'rot latency / potentiality of rot', pattern: /rot\s+latency|potentiality\s+of\s+rot|potential\s+for\s+rot/i, weight: 0.15 },
  { id: 'dromological-anchors', label: 'dromological anchors', pattern: /dromological\s+anchors?/i, weight: 0.14 },
  { id: 'scholastic-frameworks', label: 'scholastic/system-builder frameworks', pattern: /scholastic\s+frameworks?|system\s+builder|frameworks?/i, weight: 0.11 },
  { id: 'care-ethic', label: 'protect/uplift/build care ethic', pattern: /protect\s+others|uplift\s+them|as\s+they\s+build|builders?\s+like\s+me/i, weight: 0.13 },
  { id: 'beauty-definition', label: 'beauty as rot exposure', pattern: /make\s+it\s+beautiful|beautiful\s+to\s+me|expose\s+the\s+potentiality/i, weight: 0.10 },
  { id: 'parenthetical-turn', label: 'parenthetical aside', pattern: /\([^)]{8,}\)/, weight: 0.06 }
];

export const WRAPPER_FATIGUE_PATTERNS = [
  /\bwhat i can confirm is this\b/gi,
  /\bquick note\b/gi,
  /\bi am keeping this plain\b/gi,
  /\bjust to keep this clear\b/gi,
  /\bkeeping this organized\b/gi,
  /\bfor the record\b/gi,
  /\bthe point is preservation\b/gi,
  /\bkeeping the claim narrow\b/gi,
  /\brecord anchor\b/gi,
  /\bremains? the (?:record|note) anchor\b/gi
];

export function detectExpressivePayload(sourceText = '') {
  const source = safe(sourceText);
  const anchors = EXPRESSIVE_PAYLOAD_PATTERNS.map((anchor) => ({
    id: anchor.id,
    label: anchor.label,
    present: anchor.pattern.test(source),
    weight: anchor.weight
  })).filter((anchor) => anchor.present);
  const weight = anchors.reduce((sum, anchor) => sum + anchor.weight, 0);
  return {
    version: HUSH_EXPRESSIVE_PAYLOAD_VERSION,
    active: weight >= 0.24 || anchors.length >= 2,
    score: round4(clamp01(weight)),
    anchorCount: anchors.length,
    anchors,
    wordCount: words(source)
  };
}

export function expressiveRetention(sourceText = '', outputText = '') {
  const source = safe(sourceText);
  const output = safe(outputText);
  const sourceAnchors = EXPRESSIVE_PAYLOAD_PATTERNS.map((anchor) => ({
    id: anchor.id,
    label: anchor.label,
    weight: anchor.weight,
    sourcePresent: anchor.pattern.test(source),
    outputPresent: anchor.pattern.test(output)
  })).filter((anchor) => anchor.sourcePresent);
  const totalWeight = sourceAnchors.reduce((sum, anchor) => sum + anchor.weight, 0) || 1;
  const retainedWeight = sourceAnchors.filter((anchor) => anchor.outputPresent).reduce((sum, anchor) => sum + anchor.weight, 0);
  const missing = sourceAnchors.filter((anchor) => !anchor.outputPresent).map((anchor) => anchor.id);
  return {
    sourceAnchorCount: sourceAnchors.length,
    retainedAnchorCount: sourceAnchors.length - missing.length,
    retentionScore: round4(clamp01(retainedWeight / totalWeight)),
    missing,
    retained: sourceAnchors.filter((anchor) => anchor.outputPresent).map((anchor) => anchor.id)
  };
}

export function wrapperFatigueScore(text = '') {
  const value = safe(text);
  if (!value.trim()) return 0;
  const hits = WRAPPER_FATIGUE_PATTERNS.reduce((sum, pattern) => sum + ((value.match(pattern) || []).length), 0);
  const sentenceCount = Math.max(1, (value.match(/[.!?]+/g) || []).length);
  return round4(clamp01((hits / sentenceCount) * 0.48));
}

export function expressiveCandidateScore(candidate = {}, sourceText = '', expressive = detectExpressivePayload(sourceText)) {
  const retention = expressiveRetention(sourceText, candidate.text || '');
  const fatigue = wrapperFatigueScore(candidate.text || '');
  const fallback = String(candidate.source || '').includes('literal-safe-fallback') || String(candidate.strategy || '').includes('literal-safe-fallback');
  const wrapperOnly = Array.isArray(candidate.syntaxShift?.warnings) && candidate.syntaxShift.warnings.includes('wrapper-only-transform');
  const base = clamp01(candidate.finalScore || 0);
  const expressiveBonus = expressive.active ? (retention.retentionScore * 0.30) + (expressive.score * 0.10) : 0;
  const fatiguePenalty = fatigue * (expressive.active ? 0.56 : 0.28);
  const fallbackPenalty = expressive.active && fallback ? 0.32 : fallback ? 0.12 : 0;
  const wrapperPenalty = wrapperOnly ? 0.18 : 0;
  return {
    score: round4(base + expressiveBonus - fatiguePenalty - fallbackPenalty - wrapperPenalty),
    retention,
    wrapperFatigue: fatigue,
    fallback,
    wrapperOnly,
    expressiveActive: expressive.active
  };
}

export function buildExpressiveDiagnostics(sourceText = '', candidate = {}, result = {}) {
  const expressive = detectExpressivePayload(sourceText);
  const selected = expressiveCandidateScore(candidate || {}, sourceText, expressive);
  const candidates = Array.isArray(result.candidates) ? result.candidates : [];
  const report = candidates.slice(0, 12).map((entry) => {
    const scored = expressiveCandidateScore(entry, sourceText, expressive);
    return {
      id: entry.id,
      source: entry.source,
      strategy: entry.strategy,
      finalScore: round4(entry.finalScore || 0),
      expressiveScore: scored.score,
      retention: scored.retention.retentionScore,
      missing: scored.retention.missing,
      wrapperFatigue: scored.wrapperFatigue,
      fallback: scored.fallback
    };
  }).sort((left, right) => right.expressiveScore - left.expressiveScore);
  return {
    version: HUSH_EXPRESSIVE_PAYLOAD_VERSION,
    expressive,
    selected,
    candidateReport: report,
    warning: expressive.active && selected.retention.retentionScore < 0.55 ? 'expressive-payload-loss' : (expressive.active && selected.wrapperFatigue > 0.2 ? 'wrapper-fatigue-on-expressive-input' : '')
  };
}
