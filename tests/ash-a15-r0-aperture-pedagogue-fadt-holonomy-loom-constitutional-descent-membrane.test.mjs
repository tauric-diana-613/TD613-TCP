import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  runHeterostratigraphicHolonomyTomographyBridge,
} from '../app/dome-world/previews/a15-r0/heterostratigraphic-holonomy-tomography-bridge.js';
import {
  compileLoomHeterostratigraphicApparatusReceipt,
  compileAshReadOnlyTomographyProjection,
} from '../app/dome-world/previews/a15-r0/holonomy-loom-heterostratigraphic-apparatus-adapter.js';
import {
  compileHolonomyLoomHeterostratigraphicResearchBench,
} from '../app/dome-world/previews/a15-r0/holonomy-loom-heterostratigraphic-research-bench.js';
import {
  FADT_HOLO_LOOM_CONSTITUTIONAL_MEMBRANE_SCHEMA,
  FADT_RECEIPT,
  HOLO_LOOM_RESEARCH_BENCH_RECEIPT,
  auditDeclaredFiniteClaimSupportDescent,
  auditHolonomyLoomGlobalSummaryDescent,
  auditRouteLocalDisplayCompression,
  rejectFadtConstitutionalOverreach,
  fadtBenchConstitutionalInheritanceCertificate,
} from '../app/dome-world/previews/a15-r0/fadt-holonomy-loom-constitutional-descent-membrane.js';

const STRATA_FIXTURE_PATH = new URL(
  './fixtures/pedagogue/heterostratigraphic-holonomy-tomography-strata-lantern-v01.json',
  import.meta.url,
);
const BENCH_FIXTURE_PATH = new URL(
  './fixtures/pedagogue/holonomy-loom-heterostratigraphic-research-bench-v01.json',
  import.meta.url,
);

const strataFixture = JSON.parse(await readFile(STRATA_FIXTURE_PATH, 'utf8'));
const benchFixture = JSON.parse(await readFile(BENCH_FIXTURE_PATH, 'utf8'));
const bridge = runHeterostratigraphicHolonomyTomographyBridge(strataFixture);
const receipt = compileLoomHeterostratigraphicApparatusReceipt(bridge);
const projection = compileAshReadOnlyTomographyProjection(receipt);
const scene = compileHolonomyLoomHeterostratigraphicResearchBench(receipt, projection, benchFixture);

assert.equal(FADT_RECEIPT, '11eec2d52c7e1aa722e8664c0df4cd1a61d704f1');
assert.equal(HOLO_LOOM_RESEARCH_BENCH_RECEIPT, 'a1e59ec70fb9217e0e581a8c0eeeeb0f9b9d8cdb');

const global = auditHolonomyLoomGlobalSummaryDescent(scene);
assert.equal(global.schema, FADT_HOLO_LOOM_CONSTITUTIONAL_MEMBRANE_SCHEMA);
assert.equal(global.status, 'HELD_BY_FADT_IRREDUCIBLE_GAP');
assert.equal(global.fadt_receipt, FADT_RECEIPT);
assert.equal(global.bench_receipt, HOLO_LOOM_RESEARCH_BENCH_RECEIPT);
assert.equal(global.exact_descended_claim_support_authorized, false);
assert.equal(global.constitutional_hold_visible, true);
assert.equal(global.quotient, 'GLOBAL_SUMMARY');
assert.deepEqual(global.largest_universally_sound_support, ['LOCAL_RESULT']);
assert.deepEqual(
  [...global.smallest_universally_complete_support].sort(),
  [
    'FACE_HOLONOMY',
    'LOCAL_RESULT',
    'OBSERVABILITY_ECOLOGY',
    'ROUTE_HISTORY',
    'TEMPORAL_ORDER',
  ].sort(),
);
assert.deepEqual(
  [...global.irreducible_gap].sort(),
  ['FACE_HOLONOMY', 'OBSERVABILITY_ECOLOGY', 'ROUTE_HISTORY', 'TEMPORAL_ORDER'].sort(),
);
assert.equal(global.irreducible_gap_cardinality, 4);
assert.equal(global.descended_rule, null);
assert.equal(global.preferred_tight_rule_selected, false);
assert.equal(global.semantic_equivalence_inferred, false);
assert.equal(global.encoder_created, false);
assert.equal(global.incommensurable_resolved, false);
assert.equal(global.scientific_bridge_promoted, false);
assert.equal(global.claim_ceiling.finite_claim_support_descent_only, true);
assert.equal(global.claim_ceiling.semantic_equivalence_authority, false);
assert.equal(global.claim_ceiling.cross_stratum_encoder_authority, false);
assert.equal(global.claim_ceiling.scientific_bridge_promotion_authority, false);
assert.equal(rejectFadtConstitutionalOverreach(global).accepted, true);

const local = auditRouteLocalDisplayCompression();
assert.equal(local.status, 'EXACT_FADT_DESCENT_AUTHORIZED');
assert.equal(local.exact_descended_claim_support_authorized, true);
assert.equal(local.occupied_fibers.length, 1);
assert.equal(local.occupied_fibers[0].irreducible_gap_cardinality, 0);
assert.deepEqual(
  [...local.descended_rule[0].support].sort(),
  ['LOCAL_RESULT', 'ROUTE_HISTORY'].sort(),
);

// Exact finite descent still does not create semantic or encoder authority.
const fakeSemanticPromotion = { ...local, semantic_equivalence: true };
assert.equal(rejectFadtConstitutionalOverreach(fakeSemanticPromotion).accepted, false);
assert.deepEqual(rejectFadtConstitutionalOverreach(fakeSemanticPromotion).forbidden_fields, ['semantic_equivalence']);

const fakeEncoder = { ...local, encoder_created: true };
assert.equal(rejectFadtConstitutionalOverreach(fakeEncoder).accepted, false);
assert.deepEqual(rejectFadtConstitutionalOverreach(fakeEncoder).forbidden_fields, ['encoder_created']);

const fakeGlobalTruth = { ...global, global_truth: 0.97 };
assert.equal(rejectFadtConstitutionalOverreach(fakeGlobalTruth).accepted, false);
assert.deepEqual(rejectFadtConstitutionalOverreach(fakeGlobalTruth).forbidden_fields, ['global_truth']);

const hiddenGap = { ...global };
delete hiddenGap.irreducible_gap;
assert.equal(rejectFadtConstitutionalOverreach(hiddenGap).accepted, false);
assert.equal(rejectFadtConstitutionalOverreach(hiddenGap).hid_irreducible_gap, true);

const preferredRule = { ...global, preferred_tight_rule_selected: true };
assert.equal(rejectFadtConstitutionalOverreach(preferredRule).accepted, false);
assert.equal(rejectFadtConstitutionalOverreach(preferredRule).chose_preferred_tight_rule, true);

const illegalAuthorization = {
  ...global,
  exact_descended_claim_support_authorized: true,
};
assert.equal(rejectFadtConstitutionalOverreach(illegalAuthorization).accepted, false);
assert.equal(rejectFadtConstitutionalOverreach(illegalAuthorization).authorized_exact_descent_against_nonempty_gap, true);

const incompatible = auditDeclaredFiniteClaimSupportDescent([
  { antecedent: 'a', quotient: 'y', support: ['A'] },
  { antecedent: 'b', quotient: 'y', support: ['B'] },
]);
assert.equal(incompatible.status, 'HELD_BY_FADT_IRREDUCIBLE_GAP');
assert.equal(incompatible.exact_descended_claim_support_authorized, false);
assert.equal(incompatible.descended_rule, null);
assert.equal(incompatible.occupied_fibers[0].irreducible_gap_cardinality, 2);

const invalid = auditDeclaredFiniteClaimSupportDescent([]);
assert.equal(invalid.status, 'FADT_INPUT_ABSTAIN');

const certificate = fadtBenchConstitutionalInheritanceCertificate(scene);
assert.equal(certificate.passed, true);
assert.equal(certificate.fadt_receipt, FADT_RECEIPT);
assert.equal(certificate.bench_receipt, HOLO_LOOM_RESEARCH_BENCH_RECEIPT);
assert.equal(certificate.fadt_is_explicit_provenance_dependency, true);
assert.equal(certificate.method_used_downstream_without_pin_closed_here, true);
assert.equal(certificate.no_retroactive_scientific_promotion, true);
assert.equal(certificate.global_summary_hold.irreducible_gap_cardinality, 4);
assert.equal(certificate.local_positive_control.status, 'EXACT_FADT_DESCENT_AUTHORIZED');
assert.equal(certificate.overreach_certificate.accepted, true);
assert.equal(
  certificate.classification,
  'FADT_EXPLICITLY_GOVERNS_FINITE_CLAIM_SUPPORT_DESCENT_AT_THE_WITNESSED_HOLONOMY_LOOM_RESEARCH_BENCH_BOUNDARY_WITH_NONCONSTANT_STRATUM_SUPPORTS_FORCING_VISIBLE_HOLDS_AND_ZERO_SEMANTIC_OR_SCIENTIFIC_AUTHORITY_WIDENING',
);

console.log('FADT Holonomy Loom constitutional descent membrane hostile tests passed.');
