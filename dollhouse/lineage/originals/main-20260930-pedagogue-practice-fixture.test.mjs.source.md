import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_PRACTICE_FIXTURE_SCHEMA,
  compileCanonicalPracticeFixture,
  compilePedagoguePracticeReview,
  verifyPracticeFixtureLoad,
  comparePracticeFixtureTraversal
} from '../app/engine/pedagogue-practice-fixture.js';
import { waitForGivingProductionSurface } from '../scripts/giving-production-readiness.mjs';

const declaration = {
  schema: PEDAGOGUE_PRACTICE_FIXTURE_SCHEMA,
  fixture_id: 'practice:release-smoke:v0.1',
  surface_reference: 'TD613 release-smoke practice surface',
  operator_label: 'Practice case',
  manifestly_fictional: true,
  runtime_binding: false,
  operator_read_only_retrieval_allowed: true,
  practice_custody_write_allowed: true,
  fictional_payload: {
    title: 'SAMPLE — harmless route rehearsal',
    principal_name: 'Fictional Person',
    queue: ['Fictional Neighbor']
  },
  teaching_contrasts: [{
    contrast_id: 'same-route-different-object',
    now: 'Two practice objects may travel through the same route.',
    why: 'A shared route does not make the objects equivalent.',
    exact: 'Pedagogue preserves the declared distinction without inferring a category or granting authority.'
  }],
  expected_route_steps: [
    'load fictional container',
    'review practice route',
    'save practice custody copy',
    'return to rest'
  ],
  expected_endpoint: 'return to rest'
};

const fixture = compileCanonicalPracticeFixture(declaration);
const review = compilePedagoguePracticeReview(declaration);

assert.equal(fixture.manifestly_fictional, true);
assert.equal(fixture.authority.evidence_claim_authority, false);
assert.equal(fixture.authority.consequence_authority, false);
assert.equal(fixture.authority.domain_mutation_authority, false);
assert.equal(fixture.authority.automatic_retrieval, false);
assert.equal(fixture.authority.automatic_release, false);
assert.equal(fixture.authority.automatic_redesign, false);
assert.equal(fixture.authority.automatic_ash_action, false);
assert.equal(fixture.authority.human_closure_required, true);
assert.equal(fixture.research_claim_ceiling.transport_law_claim, false);
assert.equal(fixture.research_claim_ceiling.curvature_claim, false);
assert.equal(fixture.research_claim_ceiling.geometric_holonomy_claim, false);
assert.equal(fixture.teaching_contrasts.length, 1);
assert.equal(fixture.teaching_contrasts[0].automatic_inference_forbidden, true);
assert.equal(fixture.teaching_contrasts[0].authority_grant_forbidden, true);
assert.equal(review.practice_gate.teaching_contrasts_bounded, true);
assert.equal(review.practice_gate.route_memory_explicit, true);
assert.equal(review.practice_gate.aia_authority_closed, true);
assert.equal(review.practice_gate.geometric_claims_held, true);
assert.throws(
  () => compileCanonicalPracticeFixture({
    ...declaration,
    teaching_contrasts: [{ contrast_id: 'unbounded', now: '', why: 'missing NOW', exact: 'held' }]
  }),
  /bounded non-empty string/i
);

const zeroEffects = Object.freeze({
  evidence_records: 0,
  retrieval_requests: 0,
  retrieval_receipts: 0,
  practice_custody_writes: 0,
  domain_mutations: 0,
  authority_grants: 0
});
const loadReport = verifyPracticeFixtureLoad(fixture, {
  before: zeroEffects,
  after: zeroEffects
});
assert.equal(loadReport.no_effects, true);
assert.equal(loadReport.teaching_contrasts.length, 1);
assert.deepEqual(loadReport.deltas, {
  evidence_records: 0,
  retrieval_requests: 0,
  retrieval_receipts: 0,
  practice_custody_writes: 0,
  domain_mutations: 0,
  authority_grants: 0
});
assert.throws(
  () => verifyPracticeFixtureLoad(fixture, {
    before: zeroEffects,
    after: { ...zeroEffects, evidence_records: 1 }
  }),
  /forbidden effects/i
);

const exactTraversal = comparePracticeFixtureTraversal(
  fixture,
  declaration.expected_route_steps,
  {
    observedEndpoint: declaration.expected_endpoint,
    explicitOperatorGesture: true,
    observedEffects: {
      retrieval_requests: 1,
      practice_custody_writes: 1,
      domain_mutations: 0,
      evidence_claims: 0,
      authority_grants: 0
    },
    observedAuthority: {
      operator_read_only_retrieval_allowed: true,
      practice_custody_write_authority: true,
      explicit_operator_gesture_required: true,
      human_closure_required: true
    }
  }
);
assert.equal(exactTraversal.exact_route_reconstruction, true);
assert.equal(exactTraversal.route_reconstruction_error_millipoints, 0);
assert.equal(exactTraversal.authority_closed, true);
assert.equal(exactTraversal.teaching_contrasts.length, 1);
assert.equal(exactTraversal.research_claim_ceiling.geometric_holonomy_claim, false);

assert.throws(
  () => comparePracticeFixtureTraversal(fixture, declaration.expected_route_steps, {
    observedEndpoint: declaration.expected_endpoint,
    explicitOperatorGesture: true,
    observedEffects: {
      retrieval_requests: 0,
      practice_custody_writes: 0,
      domain_mutations: 0,
      evidence_claims: 0,
      authority_grants: 0
    },
    observedAuthority: { consequence_authority: true }
  }),
  /widen authority/i
);

const divergentTraversal = comparePracticeFixtureTraversal(
  fixture,
  [
    'load fictional container',
    'alternate practice review',
    'save practice custody copy',
    'return to rest'
  ],
  {
    observedEndpoint: declaration.expected_endpoint,
    explicitOperatorGesture: true,
    observedEffects: {
      retrieval_requests: 0,
      practice_custody_writes: 0,
      domain_mutations: 0,
      evidence_claims: 0,
      authority_grants: 0
    },
    observedAuthority: {
      explicit_operator_gesture_required: true,
      human_closure_required: true
    }
  }
);
assert.equal(divergentTraversal.endpoint_equivalent, true);
assert.equal(divergentTraversal.exact_route_reconstruction, false);
assert.ok(divergentTraversal.route_reconstruction_error_millipoints > 0);
assert.equal(divergentTraversal.research_claim_ceiling.transport_law_claim, false);
assert.equal(divergentTraversal.research_claim_ceiling.geometric_holonomy_claim, false);

// Release-smoke law: a practice-scoped production witness may observe the
// independently qualified prior Giving receipt without rewriting it to the
// shared architecture source commit. Giving product releases remain strict.
const previousArtifactDir = process.env.TD613_ARTIFACT_DIR;
process.env.TD613_ARTIFACT_DIR = 'artifacts/practice-production';
try {
  const sourceCommit = 'a'.repeat(40);
  const priorGivingCommit = 'b'.repeat(40);
  const readyHtml = '<title>TD613 Giving History</title><section id="sessionMembrane"></section><button id="exportCampaignDeputyBundleButton"></button><button id="bulkGivingHistoryButton"></button>';
  const readiness = await waitForGivingProductionSurface({
    baseUrl: 'https://td613.com',
    sourceCommit,
    attempts: 1,
    requestTimeoutMs: 100,
    fetchImpl: async (url) => ({
      ok: true,
      status: 200,
      text: async () => new URL(url).pathname.endsWith('/release-source.json')
        ? JSON.stringify({ schema: 'td613.giving.release-source/v1', source_packet_commit: priorGivingCommit })
        : readyHtml
    }),
    sleep: async () => {}
  });
  assert.equal(readiness.releaseReceiptPolicy, 'observe-existing');
  assert.equal(readiness.releaseReceiptMatchesSource, false);
  assert.equal(readiness.releaseReceipt.source_packet_commit, priorGivingCommit);
} finally {
  if (previousArtifactDir === undefined) delete process.env.TD613_ARTIFACT_DIR;
  else process.env.TD613_ARTIFACT_DIR = previousArtifactDir;
}

// Production-hydration law: the resilience shell is a static bootstrap
// dependency, not a late member of the asynchronous product graph. This pins
// the causal boundary exposed by production release run 603.
const givingBootstrap = fs.readFileSync('app/giving/history/giving-bootstrap.js', 'utf8');
const resilienceStaticImport = givingBootstrap.indexOf("import './giving-ux-resilience-shell.js?v=20260817-2';");
const productGraphStart = givingBootstrap.indexOf("fetch(sourceUrl('./giving-model.js')");
assert.ok(resilienceStaticImport >= 0, 'Giving bootstrap must declare the resilience shell as a static module dependency');
assert.ok(productGraphStart > resilienceStaticImport, 'resilience shell must evaluate before the asynchronous Giving product graph begins');
assert.doesNotMatch(
  givingBootstrap,
  /await import\(epochUrl\('\.\/giving-ux-resilience-shell\.js'\)\)/,
  'resilience shell must not be deferred into the asynchronous product graph'
);

const givingExportMenu = fs.readFileSync('app/giving/history/giving-export-menu.js', 'utf8');
assert.match(
  givingExportMenu,
  /const resilientToolbar = document\.querySelector\('\.committee-ledger-toolbar'\)/,
  'Giving export adapter must detect canonical resilience-toolbar ownership'
);
assert.match(
  givingExportMenu,
  /if \(!resilientToolbar\) \{[\s\S]*?ledgerCluster\.appendChild\(source\);[\s\S]*?\}/,
  'legacy export reparenting must be confined to surfaces without the resilience toolbar'
);
assert.doesNotMatch(
  givingExportMenu,
  /if \(resilientToolbar\)[\s\S]*?appendChild\(source\)/,
  'resilience-owned Committee controls must never be reparented by the export adapter'
);

console.log('pedagogue-practice-fixture.test.mjs passed: release-smoke contract preserves fiction, bounded teaching contrasts, zero-effect load, route residue, closed authority, independent Giving provenance, production shell ordering, and export-toolbar ownership.');
