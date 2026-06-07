export const REVIEW_MAP_LEAK_MARKERS = [
  /^Reviewed repair surface:/i,
  /^Architecture:/im,
  /^P\d+\s+(keeps|carries|holds|marks|routes|does not drop)/im,
  /^Global custody bank:/im,
  /^Strict review ledger for/i,
  /^Unit \d+:/im,
  /proposition custody remains intact/i,
  /contrast remains active/i,
  /review-map structure/i,
  /deterministic repair surface, not provider prose/i
];

export function isReviewMapLeak(text = '') {
  const value = String(text || '').trim();
  return REVIEW_MAP_LEAK_MARKERS.some((pattern) => pattern.test(value));
}

export function filterReviewMapCandidates(candidates = []) {
  const kept = [];
  const blocked = [];
  for (const candidate of Array.isArray(candidates) ? candidates : []) {
    const text = typeof candidate === 'string'
      ? candidate
      : String(candidate?.text || candidate?.output || candidate?.candidate || candidate?.rewrite || '').trim();
    if (isReviewMapLeak(text)) blocked.push(candidate);
    else kept.push(candidate);
  }
  return { kept, blocked };
}

export function reviewMapHeldPayload(extra = {}) {
  return {
    ok: false,
    status: 'held',
    held: true,
    released: false,
    reason: 'review_map_not_transform',
    candidates: [],
    warnings: [
      'review-map-contained',
      'release-guard-blocked-diagnostic-artifact',
      'review-map-not-release-candidate',
      ...(Array.isArray(extra.warnings) ? extra.warnings : [])
    ],
    ...extra
  };
}
