import { LOOM_AI_PROJECTS } from './ai-projects.js';
import { loomEvidenceClauseViews, reviewVendorRetentionClause } from './retention-claim-review.js';
import { reviewVendorPilotClause, reviewVendorDeletionClause } from './vendor-claim-review.js';

// This is a bounded text-pattern witness, never a general semantic verifier.
// Exact selected bytes activate the fictional incident's evidence baseline.
function exactProjectDocuments(projectId, documents = []) {
  const project = LOOM_AI_PROJECTS.find(project => project.id === projectId);
  const expected = project?.documents.filter(document => document.share) ?? [];
  if (!expected.length || !Array.isArray(documents) || documents.length !== expected.length) return null;
  if (new Set(documents.map(document => document?.id)).size !== expected.length) return null;
  if (!expected.every(source => documents.some(document => document?.id === source.id &&
    document.name === source.name && document.text === source.text))) return null;
  return expected;
}

export function incidentEvidence(documents = []) {
  const expected = exactProjectDocuments('incident-response', documents);
  if (!expected) return null;
  return {
    question: 'Did the job run twice, or was completion reported twice?',
    finding: 'The selected fictional records show two completion signals. Actual duplicate writes remain unresolved until an independent effect ledger or controlled check supplies that evidence.',
    privacy: 'The selected analysis contains the three shareable documents. The private vault is outside this selected document set.',
    source_ids: expected.map(document => document.id)
  };
}

export function vendorDiligenceEvidence(documents = []) {
  const expected = exactProjectDocuments('vendor-diligence', documents);
  if (!expected) return null;
  const source = id => expected.find(document => document.id === id).text;
  const p1 = source('comparison').match(/Pilot P1 tested (\d+) empty accounts on Vendor-A in (\d+) minutes\./);
  const p2 = source('comparison').match(/Pilot P2 imported (\d+) GB of synthetic active content in (\d+) minutes with two retries\./);
  const quantities = source('requirements').match(/migrate (\d+) service accounts[\s\S]*?Each account has (\d+) GB of active content and (\d+) GB of archived content\./);
  const retention = source('offer').match(/deleted records disappear from the active application within (\d+) hours; its backup footnote permits retention for up to (\d+) days\./);
  const removal = source('offer').match(/requirements request removal of test content within (\d+) days\./);
  // Do not silently retain arithmetic or excerpts when the authored fixture changes.
  if (![p1, p2, quantities, retention, removal].every(Boolean)) return null;
  const accounts = Number(quantities[1]), active = accounts * Number(quantities[2]);
  const rate = Number(p2[1]) * 60 / Number(p2[2]);
  return {
    question: 'What do the finite pilots and retention clauses actually establish?',
    finding: 'The pilot records are finite observations, not a demonstrated hard throughput ceiling. Vendor-A backup language permits retention for up to 45 days; it does not establish an observed or configured 45-day retention duration.',
    source_ids: expected.map(document => document.id),
    reported_facts: [
      { source_id: 'comparison', excerpt: p1[0] },
      { source_id: 'comparison', excerpt: p2[0] },
      { source_id: 'offer', excerpt: retention[0] },
      { source_id: 'offer', excerpt: removal[0] }
    ],
    calculations: [
      { source_ids: ['comparison'], quantity: 'P2 reported average GB/hour', formula: `${p2[1]} * 60 / ${p2[2]}`, value: rate,
        scope: 'Arithmetic from the reported volume and elapsed time, including the reported retries; no stream count, concurrency or congestion condition is inferred.' },
      { source_ids: ['requirements'], quantity: 'Planned active GB', formula: `${accounts} * ${quantities[2]}`, value: active },
      { source_ids: ['requirements'], quantity: 'Planned archive GB', formula: `${accounts} * ${quantities[3]}`, value: accounts * Number(quantities[3]) },
      { source_ids: ['requirements', 'comparison'], quantity: 'Projected active hours at unchanged P2 average', formula: `${active} / (${p2[1]} * 60 / ${p2[2]})`, value: active / rate,
        scope: 'Conditional linear projection, not a production benchmark or hard capacity limit; archives and scaling are untested.' }
    ],
    decision_support: [
      { source_ids: ['offer', 'comparison'], finding: `The ${retention[2]}-day backup permission conflicts with the requested ${removal[1]}-day test-content removal term. No signed exception is supplied and deletion was not tested. This is an unresolved contractual gap, not a measured deletion violation.`,
        next_question: 'Obtain a signed retention amendment and a dated deletion/backup verification record covering test content before treating the requirement as satisfied.' },
      { source_ids: ['requirements', 'comparison'], finding: 'API import counts, empty-account timing and a small synthetic-content pilot do not establish production throughput.',
        next_question: 'Benchmark representative active and archive payloads with documented concurrency, congestion, retries, reconciliation and rollback conditions.' }
    ],
    missing_evidence: ['P2 stream count, concurrency and congestion conditions', 'Representative archive and production-sized concurrent benchmarks', 'Configured backup retention and dated deletion verification', 'Signed retention exception or amendment'],
    scope: 'Deterministic reading and arithmetic from the exact selected fictional packet; no independent observation, model verification or admission authority.'
  };
}

export function reviewLoomEvidence(response, documents = []) {
  const incident = incidentEvidence(documents);
  const vendor = vendorDiligenceEvidence(documents);
  const evidence = incident || vendor;
  const conflicts = [];
  // Split clauses so an unrelated "uncertain" elsewhere cannot excuse a claim.
  const prose = [response?.answer, response?.suggested_next_step].filter(value => typeof value === 'string').join('\n');
  const clauses = loomEvidenceClauseViews(prose);
  for (const view of clauses) {
    const clause = view.text;
    const excerpt={excerpt:view.raw.slice(0,600),inspection_excerpt:clause.slice(0,600),inspection_profile:view.inspection_profile};
    const conditional = /\b(?:if|whether|may|might|could|hypothes(?:is|es)|possible|potential|unknown|uncertain|unresolved|not yet|cannot|can't|does not|do not|did not|no evidence)\b/i.test(clause);
    if (!conditional && incident &&
      (/\b(?:caused|triggered|produced|resulted in|confirmed|proved|established)\b.{0,100}\b(?:duplicate|duplicated|double)\s+(?:downstream\s+)?(?:writes?|work|execution|effects?)\b/i.test(clause) ||
       /\b(?:duplicate|duplicated|double)\s+(?:downstream\s+)?(?:writes?|work|execution|effects?)\b.{0,60}\b(?:occurred|happened|confirmed|proven|established)\b/i.test(clause))) {
      conflicts.push({ code: 'INCIDENT_EFFECT_ASSERTED_WITHOUT_WITNESS', ...excerpt,
        explanation: 'This answer asserts duplicated downstream work, but the selected incident evidence leaves that question unresolved.' });
    }
    if (vendor) {
      const negatedImpossibility = /\b(?:not|is not|isn't|cannot establish|does not establish|fails to establish)\b.{0,45}\bimpossible\b/i.test(clause);
      if (!negatedImpossibility && /\b(?:mathematically|physically|operationally)?\s*impossible\b/i.test(clause) &&
          /\b(?:migration|throughput|capacity|pilot|day|hours?)\b/i.test(clause)) {
        conflicts.push({ code: 'FINITE_PILOT_PROMOTED_TO_HARD_BOUND', ...excerpt,
          explanation: 'The exact fictional pilot sources provide finite observations but no demonstrated hard throughput ceiling; state the conclusion conditionally at the observed rate.' });
      }
      const retention = reviewVendorRetentionClause(view);
      if (retention) conflicts.push(retention);
      const pilot = reviewVendorPilotClause(view);
      if (pilot) conflicts.push(pilot);
      const deletion = reviewVendorDeletionClause(view);
      if (deletion) conflicts.push(deletion);
    }
    if (!conditional && /\b(?:complete|absolute|guaranteed|total)\s+(?:privacy|anonymity|protection)\b|\b(?:guarantees?|ensures?)\s+(?:your\s+)?(?:privacy|anonymity)\b/i.test(clause)) {
      conflicts.push({ code: 'UNSUPPORTED_PRIVACY_GUARANTEE', ...excerpt,
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
