import { nonAssertion, conflict } from './retention-claim-review.js';

// Finite English patterns, applied only after exact vendor source matching.
// A calculated rate does not supply experimental conditions. A contractual
// mismatch does not supply a measured deletion outcome.
export function reviewVendorPilotClause(view) {
  const text = view.text;
  if (!/\b(?:pilot|P[12]|observed\s+(?:throughput|rate))\b/i.test(text)) return null;
  const conditions = /\b(?:un[- ]?congested|non[- ]?concurrent|single[- ]?stream|(?:no|without)\s+congestion)\b/gi;
  for (const match of text.matchAll(conditions)) {
    if (nonAssertion(text, match)) continue;
    const prefix = text.slice(0, match.index).split(/\b(?:but|yet|however)\b/i).at(-1);
    if (/\b(?:assume|assuming|assumed|hypothetical|hypothesis)\b[^,;]{0,100}$/i.test(prefix) ||
        /\b(?:not|never)\s+(?:run|ran|tested|conducted|measured|observed)\b[^,;]{0,80}$/i.test(prefix)) continue;
    return conflict(view, match, 'PILOT_CONDITIONS_ASSERTED_WITHOUT_WITNESS',
      'P2 reports 9 GB in 26 minutes with two retries. Congestion, stream count and concurrency conditions are not documented; cite the measurement and label any projected conditions as assumptions.');
  }
  return null;
}

export function reviewVendorDeletionClause(view) {
  const text = view.text;
  const claims = /\b(?:(?:violates?|breaches?|fails?\s+to\s+meet)\b.{0,100}\b(?:14[- ]day|deletion|removal)\b|(?:deletion|removal)\b.{0,80}\b(?:violation|breach|non[- ]?compliance)\b)/gi;
  for (const match of text.matchAll(claims)) {
    if (nonAssertion(text, match)) continue;
    // A clearly scoped assessment of the written offer is supported. The
    // separate claim of an actual deletion violation needs deletion evidence.
    const prefix = text.slice(0, match.index).split(/\b(?:but|yet|however)\b/i).at(-1);
    const suffix = text.slice(match.index + match[0].length);
    if (/^(?:deletion|removal)\b/i.test(match[0]) &&
        (/\bno\s*$/i.test(prefix) || /^\s+(?:(?:is|was|remains)\s+(?:unobserved|unverified|unproven|unresolved)|(?:has|had)\s+(?:not|never)\s+been\s+(?:observed|verified|proven|established)|(?:is|was)\s+not\s+(?:observed|verified|proven|established))\b/i.test(suffix))) continue;
    if (/\b(?:contract|wording|written\s+(?:terms?|offer)|proposed\s+terms?)\s+(?:(?:itself|themselves)\s+)?$/i.test(prefix) ||
        (/\bcontractual\s*$/i.test(prefix) && /^(?:deletion|removal)\b/i.test(match[0]))) continue;
    return conflict(view, match, 'DELETION_VIOLATION_ASSERTED_WITHOUT_WITNESS',
      'The 45-day permission conflicts with the requested 14-day removal term. State that contractual gap and request an amendment plus dated deletion evidence; the pilots did not verify deletion.');
  }
  return null;
}
