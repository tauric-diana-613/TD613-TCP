import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  runHeterostratigraphicHolonomyTomographyBridge,
  HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_SCHEMA,
} from '../app/dome-world/previews/a15-r0/heterostratigraphic-holonomy-tomography-bridge.js';
import {
  HOLO_LOOM_HETEROSTRATIGRAPHIC_STACKED_PARENT,
  compileLoomHeterostratigraphicApparatusReceipt,
  compileAshReadOnlyTomographyProjection,
} from '../app/dome-world/previews/a15-r0/holonomy-loom-heterostratigraphic-apparatus-adapter.js';
import {
  DOME_WORLD_CONSTITUTIONAL_PROJECTION_SCHEMA,
  DOME_WORLD_CONSTITUTIONAL_PROJECTION_PARENT_RECEIPT,
  DOME_WORLD_CANONICAL_SOURCE_FIXTURE_ID,
  DOME_WORLD_CANONICAL_APPARATUS_OWNER,
  domeWorldConstitutionalSourceSignature,
  auditDomeWorldCanonicalConstitutionalSource,
  inheritedAshProjectionCustodyCollisionCertificate,
  compileDomeWorldConstitutionallyFaithfulProjection,
  domeWorldConstitutionalProjectionFaithfulnessCertificate,
  rejectDomeWorldConstitutionalWitnessOrAuthorityLaundering,
  constitutionalWitnessCoordinateNecessityCertificate,
} from '../app/dome-world/previews/a15-r0/dome-world-constitutional-projection-faithfulness.js';

const STRATA_FIXTURE_PATH = new URL(
  './fixtures/pedagogue/heterostratigraphic-holonomy-tomography-strata-lantern-v01.json',
  import.meta.url,
);

const strataFixture = JSON.parse(await readFile(STRATA_FIXTURE_PATH, 'utf8'));
const bridge = runHeterostratigraphicHolonomyTomographyBridge(strataFixture);
const canonicalReceipt = compileLoomHeterostratigraphicApparatusReceipt(bridge);
const inheritedProjection = compileAshReadOnlyTomographyProjection(canonicalReceipt);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function control(mutator) {
  const candidate = clone(canonicalReceipt);
  mutator(candidate);
  return candidate;
}

assert.equal(
  DOME_WORLD_CONSTITUTIONAL_PROJECTION_PARENT_RECEIPT,
  '528f9b2f96bf3bc4c18242b0f0d910ca5323fdea',
);
assert.equal(DOME_WORLD_CANONICAL_APPARATUS_OWNER, 'HOLONOMY_LOOM_RESEARCH');
assert.equal(
  DOME_WORLD_CANONICAL_SOURCE_FIXTURE_ID,
  'strata-lantern.moss-lantern-heterostratigraphic/v0.1',
);
assert.equal(canonicalReceipt.apparatus_owner, DOME_WORLD_CANONICAL_APPARATUS_OWNER);
assert.equal(canonicalReceipt.source_bridge_schema, HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_SCHEMA);
assert.equal(canonicalReceipt.source_bridge_head, HOLO_LOOM_HETEROSTRATIGRAPHIC_STACKED_PARENT);
assert.equal(canonicalReceipt.source_fixture_id, DOME_WORLD_CANONICAL_SOURCE_FIXTURE_ID);
assert.equal(Object.values(canonicalReceipt.authority).every(value => value === false), true);

const canonicalAudit = auditDomeWorldCanonicalConstitutionalSource(canonicalReceipt);
assert.equal(canonicalAudit.accepted, true);
assert.deepEqual(canonicalAudit.failures, []);
assert.equal(
  canonicalAudit.classification,
  'DOME_WORLD_CANONICAL_CONSTITUTIONAL_SOURCE_ACCEPTED',
);

const canonicalSignature = domeWorldConstitutionalSourceSignature(canonicalReceipt);
assert.deepEqual(canonicalSignature, {
  apparatus_owner: 'HOLONOMY_LOOM_RESEARCH',
  source_bridge_schema: HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_SCHEMA,
  source_bridge_head: HOLO_LOOM_HETEROSTRATIGRAPHIC_STACKED_PARENT,
  source_fixture_id: 'strata-lantern.moss-lantern-heterostratigraphic/v0.1',
  source_authority: {
    inverse: false,
    encoder: false,
    custody_mutation: false,
    release: false,
    production: false,
    physical_claim: false,
    continuum_claim: false,
  },
});

// Preregistered one-coordinate collision controls. The inherited child projection accepts all six
// and normalizes them to the same visible Ash surface, even though the source custody signatures differ.
const headDrift = control(receipt => {
  receipt.source_bridge_head = '1111111111111111111111111111111111111111';
});
const fixtureDrift = control(receipt => {
  receipt.source_fixture_id = 'strata-lantern.adversarial-fixture/v0.1';
});
const schemaDrift = control(receipt => {
  receipt.source_bridge_schema = 'td613.loom.adversarial-bridge/v9.9';
});
const ownerDrift = control(receipt => {
  receipt.apparatus_owner = 'ADVERSARIAL_OWNER';
});
const inverseAuthorityDrift = control(receipt => {
  receipt.authority.inverse = true;
});
const releaseAuthorityDrift = control(receipt => {
  receipt.authority.release = true;
});

const collisionControls = [
  ['source_bridge_head', headDrift],
  ['source_fixture_id', fixtureDrift],
  ['source_bridge_schema', schemaDrift],
  ['apparatus_owner', ownerDrift],
  ['source_authority.inverse', inverseAuthorityDrift],
  ['source_authority.release', releaseAuthorityDrift],
];

for (const [label, candidate] of collisionControls) {
  const certificate = inheritedAshProjectionCustodyCollisionCertificate(canonicalReceipt, candidate);
  assert.equal(certificate.projection_equal, true, `${label} must preserve inherited rendered projection`);
  assert.equal(certificate.constitutional_signature_equal, false, `${label} must change constitutional custody`);
  assert.equal(certificate.constitutional_collision, true, `${label} must demonstrate inherited custody collision`);
  assert.equal(
    certificate.classification,
    'INHERITED_CHILD_PROJECTION_COLLAPSES_DISTINCT_CONSTITUTIONAL_SOURCE_STATES',
  );
  assert.equal(certificate.scar, 'RENDER_EQUIVALENCE != CUSTODY_EQUIVALENCE');
  assert.deepEqual(compileAshReadOnlyTomographyProjection(candidate), inheritedProjection);
}

assert.deepEqual(
  inheritedAshProjectionCustodyCollisionCertificate(canonicalReceipt, headDrift)
    .changed_constitutional_coordinates,
  ['source_bridge_head'],
);
assert.deepEqual(
  inheritedAshProjectionCustodyCollisionCertificate(canonicalReceipt, fixtureDrift)
    .changed_constitutional_coordinates,
  ['source_fixture_id'],
);
assert.deepEqual(
  inheritedAshProjectionCustodyCollisionCertificate(canonicalReceipt, schemaDrift)
    .changed_constitutional_coordinates,
  ['source_bridge_schema'],
);
assert.deepEqual(
  inheritedAshProjectionCustodyCollisionCertificate(canonicalReceipt, ownerDrift)
    .changed_constitutional_coordinates,
  ['apparatus_owner'],
);
assert.deepEqual(
  inheritedAshProjectionCustodyCollisionCertificate(canonicalReceipt, inverseAuthorityDrift)
    .changed_constitutional_coordinates,
  ['source_authority'],
);
assert.deepEqual(
  inheritedAshProjectionCustodyCollisionCertificate(canonicalReceipt, releaseAuthorityDrift)
    .changed_constitutional_coordinates,
  ['source_authority'],
);

// Consequential authority-laundering hostile: the inherited projection says child authority is all false
// for both the canonical zero-authority source and an upstream inverse=true source.
assert.equal(inverseAuthorityDrift.authority.inverse, true);
assert.equal(releaseAuthorityDrift.authority.release, true);
assert.equal(Object.values(compileAshReadOnlyTomographyProjection(inverseAuthorityDrift).authority).every(value => value === false), true);
assert.equal(Object.values(compileAshReadOnlyTomographyProjection(releaseAuthorityDrift).authority).every(value => value === false), true);

// The new Dome-World envelope admits the canonical source, preserves the inherited child surface exactly,
// and adds a custody witness without adding an action or any scientific/runtime/production authority.
const exactified = compileDomeWorldConstitutionallyFaithfulProjection(canonicalReceipt);
assert.equal(exactified.schema, DOME_WORLD_CONSTITUTIONAL_PROJECTION_SCHEMA);
assert.equal(exactified.surface_owner, 'DOME_WORLD_RESEARCH');
assert.equal(exactified.research_only, true);
assert.equal(exactified.runtime_binding, false);
assert.deepEqual(exactified.child_surface, inheritedProjection);
assert.deepEqual(exactified.available_actions, inheritedProjection.available_actions);
assert.deepEqual(exactified.prohibited_actions, inheritedProjection.prohibited_actions);
assert.deepEqual(exactified.authority, inheritedProjection.authority);
assert.equal(Object.values(exactified.authority).every(value => value === false), true);
assert.deepEqual(
  {
    apparatus_owner: exactified.constitutional_witness.apparatus_owner,
    source_bridge_schema: exactified.constitutional_witness.source_bridge_schema,
    source_bridge_head: exactified.constitutional_witness.source_bridge_head,
    source_fixture_id: exactified.constitutional_witness.source_fixture_id,
    source_authority: exactified.constitutional_witness.source_authority,
  },
  canonicalSignature,
);
assert.equal(exactified.constitutional_witness.semantic_equivalence_authority, false);
assert.equal(exactified.constitutional_witness.scientific_bridge_promotion_authority, false);
assert.equal(exactified.constitutional_witness.runtime_authority, false);
assert.equal(exactified.constitutional_witness.production_authority, false);
assert.equal(exactified.claim_ceiling.constitutional_source_custody_faithfulness, true);
assert.equal(exactified.claim_ceiling.child_projection_scientific_authority_unchanged, true);
assert.equal(exactified.claim_ceiling.semantic_equivalence_authority, false);
assert.equal(exactified.claim_ceiling.cross_stratum_encoder_authority, false);
assert.equal(exactified.claim_ceiling.scientific_bridge_promotion_authority, false);
assert.equal(exactified.claim_ceiling.live_runtime_authority, false);
assert.equal(exactified.claim_ceiling.proto_loom_authority, false);
assert.equal(exactified.claim_ceiling.browser_human_usability_authority, false);
assert.equal(exactified.claim_ceiling.physical_holonomy_authority, false);
assert.equal(exactified.claim_ceiling.continuum_tomography_authority, false);
assert.equal(exactified.claim_ceiling.production_authority, false);
assert.equal(exactified.claim_ceiling.vercel_authority, false);

const faithfulness = domeWorldConstitutionalProjectionFaithfulnessCertificate(canonicalReceipt, exactified);
assert.equal(faithfulness.passed, true);
assert.equal(faithfulness.source_audit_passed, true);
assert.equal(faithfulness.witness_complete, true);
assert.equal(faithfulness.witness_matches_source_signature, true);
assert.equal(faithfulness.inherited_child_surface_preserved_exactly, true);
assert.equal(faithfulness.action_inventory_preserved_exactly, true);
assert.equal(faithfulness.child_authority_preserved_exactly_and_zero, true);
assert.equal(faithfulness.witness_and_envelope_add_zero_new_authority, true);
assert.equal(
  faithfulness.classification,
  'DOME_WORLD_CONSTITUTIONAL_PROJECTION_IS_FAITHFUL_TO_THE_DECLARED_BOUNDED_SOURCE_SIGNATURE_WITH_ZERO_AUTHORITY_WIDENING',
);

const cleanRejector = rejectDomeWorldConstitutionalWitnessOrAuthorityLaundering(canonicalReceipt, exactified);
assert.equal(cleanRejector.accepted, true);
assert.deepEqual(cleanRejector.missing_witness_coordinates, []);
assert.equal(cleanRejector.witness_mismatch, false);
assert.equal(cleanRejector.envelope_authority_widened, false);
assert.equal(cleanRejector.child_authority_widened, false);
assert.equal(cleanRejector.action_inventory_widened, false);
assert.equal(cleanRejector.witness_claim_widened, false);

// Fail closed on every preregistered source drift. Inherited projection accepts these; exactified Dome-World does not.
assert.throws(
  () => compileDomeWorldConstitutionallyFaithfulProjection(headDrift),
  /SOURCE_BRIDGE_HEAD_MISMATCH/,
);
assert.throws(
  () => compileDomeWorldConstitutionallyFaithfulProjection(fixtureDrift),
  /SOURCE_FIXTURE_ID_MISMATCH/,
);
assert.throws(
  () => compileDomeWorldConstitutionallyFaithfulProjection(schemaDrift),
  /SOURCE_BRIDGE_SCHEMA_MISMATCH/,
);
assert.throws(
  () => compileDomeWorldConstitutionallyFaithfulProjection(ownerDrift),
  /APPARATUS_OWNER_MISMATCH/,
);
assert.throws(
  () => compileDomeWorldConstitutionallyFaithfulProjection(inverseAuthorityDrift),
  /SOURCE_AUTHORITY_NOT_FALSE:inverse/,
);
assert.throws(
  () => compileDomeWorldConstitutionallyFaithfulProjection(releaseAuthorityDrift),
  /SOURCE_AUTHORITY_NOT_FALSE:release/,
);

const missingAuthorityCoordinate = control(receipt => {
  delete receipt.authority.encoder;
});
assert.throws(
  () => compileDomeWorldConstitutionallyFaithfulProjection(missingAuthorityCoordinate),
  /SOURCE_AUTHORITY_COORDINATE_MISSING:encoder/,
);

// Witness omission/mutation must be detectable even after a clean source was compiled.
const missingHeadWitness = clone(exactified);
delete missingHeadWitness.constitutional_witness.source_bridge_head;
const missingHeadResult = rejectDomeWorldConstitutionalWitnessOrAuthorityLaundering(
  canonicalReceipt,
  missingHeadWitness,
);
assert.equal(missingHeadResult.accepted, false);
assert.deepEqual(missingHeadResult.missing_witness_coordinates, ['source_bridge_head']);
assert.equal(missingHeadResult.witness_mismatch, true);

const mismatchedFixtureWitness = clone(exactified);
mismatchedFixtureWitness.constitutional_witness.source_fixture_id = 'wrong-fixture';
assert.equal(
  rejectDomeWorldConstitutionalWitnessOrAuthorityLaundering(canonicalReceipt, mismatchedFixtureWitness).accepted,
  false,
);
assert.equal(
  rejectDomeWorldConstitutionalWitnessOrAuthorityLaundering(canonicalReceipt, mismatchedFixtureWitness).witness_mismatch,
  true,
);

const widenedEnvelopeAuthority = clone(exactified);
widenedEnvelopeAuthority.authority.inverse = true;
assert.equal(
  rejectDomeWorldConstitutionalWitnessOrAuthorityLaundering(canonicalReceipt, widenedEnvelopeAuthority).accepted,
  false,
);
assert.equal(
  rejectDomeWorldConstitutionalWitnessOrAuthorityLaundering(canonicalReceipt, widenedEnvelopeAuthority)
    .envelope_authority_widened,
  true,
);

const widenedChildAuthority = clone(exactified);
widenedChildAuthority.child_surface.authority.release = true;
assert.equal(
  rejectDomeWorldConstitutionalWitnessOrAuthorityLaundering(canonicalReceipt, widenedChildAuthority).accepted,
  false,
);
assert.equal(
  rejectDomeWorldConstitutionalWitnessOrAuthorityLaundering(canonicalReceipt, widenedChildAuthority)
    .child_authority_widened,
  true,
);

const widenedActions = clone(exactified);
widenedActions.available_actions.push('RUN_TOMOGRAPHY_INVERSE');
assert.equal(
  rejectDomeWorldConstitutionalWitnessOrAuthorityLaundering(canonicalReceipt, widenedActions).accepted,
  false,
);
assert.equal(
  rejectDomeWorldConstitutionalWitnessOrAuthorityLaundering(canonicalReceipt, widenedActions)
    .action_inventory_widened,
  true,
);

const scientificWitnessOverreach = clone(exactified);
scientificWitnessOverreach.constitutional_witness.semantic_equivalence_authority = true;
assert.equal(
  rejectDomeWorldConstitutionalWitnessOrAuthorityLaundering(canonicalReceipt, scientificWitnessOverreach).accepted,
  false,
);
assert.equal(
  rejectDomeWorldConstitutionalWitnessOrAuthorityLaundering(canonicalReceipt, scientificWitnessOverreach)
    .witness_claim_widened,
  true,
);

// Finite adversarial minimality: omitting any one of the declared witness coordinates cannot distinguish
// the corresponding same-render / different-custody pair. This is deliberately not a universal statistic claim.
const necessity = constitutionalWitnessCoordinateNecessityCertificate(canonicalReceipt, [
  { coordinate: 'apparatus_owner', receipt: ownerDrift },
  { coordinate: 'source_bridge_schema', receipt: schemaDrift },
  { coordinate: 'source_bridge_head', receipt: headDrift },
  { coordinate: 'source_fixture_id', receipt: fixtureDrift },
  { coordinate: 'source_authority', receipt: inverseAuthorityDrift },
]);
assert.equal(necessity.passed, true);
assert.equal(necessity.finite_adversarial_coordinate_necessity_established, true);
assert.equal(necessity.universal_minimal_sufficient_statistic_claimed, false);
assert.equal(necessity.rows.length, 5);
assert.equal(necessity.rows.every(row => row.inherited_projection_collision === true), true);
assert.equal(necessity.rows.every(row => row.omission_cannot_distinguish_this_pair === true), true);

console.log('Ash A15-R0 Dome-World constitutional projection faithfulness hostile tests passed.');
