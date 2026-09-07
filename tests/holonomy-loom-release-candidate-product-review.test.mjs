import assert from 'node:assert/strict';
import {
  REVIEW_EVIDENCE_CLASS,
  loadReleaseCandidateInputs,
  compileHolonomyLoomReleaseCandidateReview,
  renderHolonomyLoomReleaseCandidateReviewMarkdown
} from '../scripts/holonomy-loom-release-candidate-product-review.mjs';

const inputs = await loadReleaseCandidateInputs();
const baseline = await compileHolonomyLoomReleaseCandidateReview({ ...inputs, repositoryHead: 'STATIC_TEST_HEAD' });
const baselineFailures = baseline.sections
  .filter(section => section.status !== 'PASS')
  .map(section => ({ id: section.id, failed_checks: section.failed_checks }));
assert.equal(baseline.status, 'PASS', `baseline release-candidate review must pass: ${JSON.stringify(baselineFailures)}`);
assert.deepEqual(baseline.failed_sections, []);
assert.equal(baseline.sections.length, 8);
assert.equal(baseline.sections.every(section => section.status === 'PASS'), true);
assert.equal(baseline.evidence.review_evidence_class, REVIEW_EVIDENCE_CLASS);
assert.equal(baseline.evidence.human_comprehension_observed, false);
assert.equal(baseline.evidence.human_operator_production_observation, false);
assert.equal(baseline.evidence.product_bytes_mutated_by_review, false);
assert.equal(baseline.authority.merge_authority, false);
assert.equal(baseline.authority.vercel_authority, false);
assert.equal(baseline.authority.production_release_authority, false);
assert.equal(baseline.authority.provider_release_authority, false);
assert.equal(baseline.pedagogue.consequence_before_ontology, true);
assert.equal(baseline.pedagogue.rest_and_exit_preserved, true);
assert.equal(baseline.pedagogue.aia_invariants_preserved, true);
assert.equal(baseline.pedagogue.route_history_explicit, true);
assert.equal(baseline.pedagogue.route_burden_non_worsening, true);
assert.equal(baseline.pedagogue.authority_transferred, false);
assert.match(baseline.reviewed_candidate.html_sha256, /^[a-f0-9]{64}$/);
assert.match(baseline.reviewed_candidate.engine_sha256, /^[a-f0-9]{64}$/);

const markdown = renderHolonomyLoomReleaseCandidateReviewMarkdown(baseline);
assert.match(markdown, /MACHINE_RELEASE_CANDIDATE_PRODUCT_REVIEW/);
assert.match(markdown, /not evidence that a human understood the product/i);
assert.match(markdown, /not a production observation/i);
assert.match(markdown, /not release authorization/i);
assert.match(markdown, /EXPLICIT_OPERATOR_PRODUCTION_RELEASE_AUTHORIZATION_UNDER_STRATEGIC_VERCEL_DEPLOYMENT_LAW/);
for (const id of ['R0','R1','R2','R3','R4','R5','R6','R7']) assert.match(markdown, new RegExp(`### ${id} .* — PASS`));

async function expectHeld(label, mutation, expectedSection) {
  const mutated = await mutation(structuredClone(inputs));
  const review = await compileHolonomyLoomReleaseCandidateReview({
    ...mutated,
    repositoryHead: `HOSTILE_${label}`
  });
  assert.equal(review.status, 'HELD', `${label} must hold`);
  assert.ok(review.failed_sections.includes(expectedSection), `${label} must fail ${expectedSection}; got ${review.failed_sections.join(',')}`);
  return review;
}

await expectHeld('UNIVERSAL_GREEN_SAFETY', async value => ({
  ...value,
  html: `${value.html}\n<p>GREEN means guaranteed safe everywhere.</p>`
}), 'R1');

await expectHeld('MISSING_REST_EXIT', async value => ({
  ...value,
  html: value.html.replace('id="rest"', 'id="rest_removed"').replace('id="exitLoom"', 'id="exit_removed"')
}), 'R5');

await expectHeld('MANDATORY_TECHNICAL_PROMISE', async value => ({
  ...value,
  html: value.html.replace('<details id="promiseDisclosure">', '<details id="promiseDisclosure" open>')
}), 'R3');

await expectHeld('MANDATORY_NAME_DETAILS', async value => ({
  ...value,
  html: value.html.replace(/<details id="whyDetails"([^>]*)>/, '<details id="whyDetails"$1 open>')
}), 'R3');

const providerWidened = await compileHolonomyLoomReleaseCandidateReview({
  ...inputs,
  repositoryHead: 'HOSTILE_PROVIDER_AUTHORITY',
  authorityOverrides: { provider_release_authority: true }
});
assert.equal(providerWidened.status, 'HELD');
assert.ok(providerWidened.failed_sections.includes('R4'));

const productionWidened = await compileHolonomyLoomReleaseCandidateReview({
  ...inputs,
  repositoryHead: 'HOSTILE_PRODUCTION_AUTHORITY',
  authorityOverrides: { production_release_authority: true }
});
assert.equal(productionWidened.status, 'HELD');
assert.ok(productionWidened.failed_sections.includes('R7'));

const fakeHuman = await compileHolonomyLoomReleaseCandidateReview({
  ...inputs,
  repositoryHead: 'HOSTILE_HUMAN_EVIDENCE_LAUNDERING',
  evidenceOverrides: { human_comprehension_observed: true }
});
assert.equal(fakeHuman.status, 'HELD');
assert.ok(fakeHuman.failed_sections.includes('R7'));

const reviewClaimsRelease = await compileHolonomyLoomReleaseCandidateReview({
  ...inputs,
  repositoryHead: 'HOSTILE_REVIEW_RELEASE_LAUNDERING',
  authorityOverrides: { vercel_authority: true, merge_authority: true }
});
assert.equal(reviewClaimsRelease.status, 'HELD');
assert.ok(reviewClaimsRelease.failed_sections.includes('R7'));

console.log('Holonomy Loom release-candidate product review hostile contract: PASS');