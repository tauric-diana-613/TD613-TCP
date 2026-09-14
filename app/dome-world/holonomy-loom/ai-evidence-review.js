import { LOOM_AI_PROJECTS } from './ai-projects.js';

// This is a bounded text-pattern witness, never a general semantic verifier.
// Exact selected bytes activate the fictional incident's evidence baseline.
export function incidentEvidence(documents = []) {
  const project = LOOM_AI_PROJECTS.find(project => project.id === 'incident-response');
  const expected = project.documents.filter(document => document.share);
  if (!Array.isArray(documents) || documents.length !== expected.length) return null;
  if (new Set(documents.map(document => document?.id)).size !== expected.length) return null;
  if (!expected.every(source => documents.some(document => document?.id === source.id &&
    document.name === source.name && document.text === source.text))) return null;
  return {
    question: 'Did the job run twice, or was completion reported twice?',
    finding: 'The selected fictional records show two completion signals. Actual duplicate writes remain unresolved until an independent effect ledger or controlled check supplies that evidence.',
    privacy: 'The selected analysis contains the three shareable documents. The private vault is outside this selected document set.',
    source_ids: expected.map(document => document.id)
  };
}

export function reviewLoomEvidence(response, documents = []) {
  const evidence = incidentEvidence(documents);
  const conflicts = [];
  // Split clauses so an unrelated "uncertain" elsewhere cannot excuse a claim.
  const prose = [response?.answer, response?.suggested_next_step].filter(value => typeof value === 'string').join('\n');
  const clauses = prose.replace(/[*_\x60]/g, '').split(/(?<=[.!?;])\s+|\n+/);
  for (const clause of clauses) {
    const conditional = /\b(?:if|whether|may|might|could|hypothes(?:is|es)|possible|potential|unknown|uncertain|unresolved|not yet|cannot|can't|does not|do not|did not|no evidence)\b/i.test(clause);
    if (!conditional && evidence &&
      (/\b(?:caused|triggered|produced|resulted in|confirmed|proved|established)\b.{0,100}\b(?:duplicate|duplicated|double)\s+(?:downstream\s+)?(?:writes?|work|execution|effects?)\b/i.test(clause) ||
       /\b(?:duplicate|duplicated|double)\s+(?:downstream\s+)?(?:writes?|work|execution|effects?)\b.{0,60}\b(?:occurred|happened|confirmed|proven|established)\b/i.test(clause))) {
      conflicts.push({ code: 'INCIDENT_EFFECT_ASSERTED_WITHOUT_WITNESS', excerpt: clause.slice(0,600),
        explanation: 'This answer asserts duplicated downstream work, but the selected incident evidence leaves that question unresolved.' });
    }
    if (!conditional && /\b(?:complete|absolute|guaranteed|total)\s+(?:privacy|anonymity|protection)\b|\b(?:guarantees?|ensures?)\s+(?:your\s+)?(?:privacy|anonymity)\b/i.test(clause)) {
      conflicts.push({ code: 'UNSUPPORTED_PRIVACY_GUARANTEE', excerpt: clause.slice(0,600),
        explanation: 'This answer promises privacy beyond the observed selected-input boundary.' });
    }
  }
  return { schema: 'td613.loom.evidence-review/v0.1',
    status: conflicts.length ? 'REVIEW_REQUIRED' : 'NO_LISTED_PATTERN_FOUND',
    blocks_reuse: conflicts.length > 0, semantic_correctness_verified: false,
    scope: 'Listed affirmative claim patterns only; absence of a match does not validate an answer.',
    evidence, conflicts };
}
export function requireReusableLoomAnswer(response, documents) {
  const review = reviewLoomEvidence(response, documents);
  if (review.blocks_reuse) {
    const error = new Error('Answer needs review before reuse: ' + review.conflicts.map(item => item.explanation).join(' '));
    error.code = 'ANSWER_EVIDENCE_CONFLICT'; error.evidenceReview = review;
    error.candidate = JSON.parse(JSON.stringify(response));
    throw error;
  }
  return review;
}
