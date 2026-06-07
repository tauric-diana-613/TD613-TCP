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
  const