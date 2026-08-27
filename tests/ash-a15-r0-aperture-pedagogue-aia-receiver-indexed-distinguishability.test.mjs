import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  runHeterostratigraphicHolonomyTomographyBridge,
} from '../app/dome-world/previews/a15-r0/heterostratigraphic-holonomy-tomography-bridge.js';
import {
  compileLoomHeterostratigraphicApparatusReceipt,
} from '../app/dome-world/previews/a15-r0/holonomy-loom-heterostratigraphic-apparatus-adapter.js';
import {
  domeWorldConstitutionalSourceSignature,
  auditDomeWorldCanonicalConstitutionalSource,
} from '../app/dome-world/previews/a15-r0/dome-world-constitutional-projection-faithfulness.js';
import {
  AIA_RECEIVER_INDEXED_DISTINGUISHABILITY_SCHEMA,
  AIA_RECEIVER_INDEXED_DISTINGUISHABILITY_PARENT_RECEIPT,
  AIA_RECEIVERS,
  compileAiaReceiverProjection,
  aiaReceiverDistinguishabilityCertificate,
  finiteAiaReceiverAnisotropyCertificate,
  rejectAiaReceiverProjectionOverreach,
} from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';

const STRATA_FIXTURE_PATH = new URL(
  './fixtures/pedagogue/heterostratigraphic-holonomy-tomography-strata-lantern-v01.json',
  import.meta.url,
);

const fixture = JSON.parse(await readFile(STRATA_FIXTURE_PATH, 'utf8'));
const bridge = runHeterostratigraphicHolonomyTomographyBridge(fixture);
const canonical = compileLoomHeterostratigraphicApparatusReceipt(bridge);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

assert.equal(
  AIA_RECEIVER_INDEXED_DISTINGUISHABILITY_PARENT_RECEIPT,
  '7639d5b15edc57aa3d76b8669aeefed6d86c12d6',
);
assert.equal(auditDomeWorldCanonicalConstitutionalSource(canonical).accepted, true);

const ashCanonical = compileAiaReceiverProjection(canonical, AIA_RECEIVERS.ASH);
const loomCanonical = compileAiaReceiverProjection(canonical, AIA_RECEIVERS.LOOM);

for (const projection of [ashCanonical, loomCanonical]) {
  assert.equal(projection.schema, AIA_RECEIVER_INDEXED_DISTINGUISHABILITY_SCHEMA);
  assert.equal(projection.runtime_binding, false);
  assert.equal(Object.values(projection.authority).every(value => value === false), true);
  assert.deepEqual(
    projection.constitutional_witness,
    domeWorldConstitutionalSourceSignature(canonical),
  );
  assert.equal(projection.claim_ceiling.receiver_indexed_payload_projection, true);
  assert.equal(projection.claim_ceiling.constitutional_custody_recovery, true);
  assert.equal(projection.claim_ceiling.full_source_reconstruction, false);
  assert.equal(projection.claim_ceiling.tomography_inverse_authority, false);
  assert.equal(projection.claim_ceiling.encoder_authority, false);
  assert.equal(projection.claim_ceiling.semantic_equivalence_authority, false);
  assert.equal(projection.claim_ceiling.scientific_bridge_promotion_authority, false);
  assert.equal(rejectAiaReceiverProjectionOverreach(projection).accepted, true);
}

assert.equal(ashCanonical.receiver, 'ASH_KEEP_CHILD');
assert.equal(loomCanonical.receiver, 'HOLONOMY_LOOM_TECHNICAL');
assert.equal(loomCanonical.receiver_payload.strata.length, 4);
assert.equal(
  loomCanonical.receiver_payload.strata.every(row => typeof row.observable_kind === 'string'),
  true,
);

const controls = canonical.stratum_panels.map((panel, index) => {
  const control = clone(canonical);
  control.stratum_panels[index].observable_kind = `${panel.observable_kind}::AIA_ALT_${index}`;
  return control;
});

assert.equal(controls.length, 4);
for (const control of controls) {
  assert.equal(auditDomeWorldCanonicalConstitutionalSource(control).accepted, true);
  assert.deepEqual(
    domeWorldConstitutionalSourceSignature(control),
    domeWorldConstitutionalSourceSignature(canonical),
  );
  assert.equal(Object.values(control.authority).every(value => value === false), true);
}

// Same custody, same Ash surface, different Loom-visible technical payload.
const pair = aiaReceiverDistinguishabilityCertificate(canonical, controls[0]);
assert.equal(pair.custody_signature_equal, true);
assert.equal(pair.ash_payload_equal, true);
assert.equal(pair.loom_payload_equal, false);
assert.equal(pair.receiver_indexed_anisotropy, true);
assert.equal(
  pair.classification,
  'SAME_CONSTITUTIONAL_CUSTODY_IS_INDISTINGUISHABLE_TO_ASH_BUT_DISTINGUISHABLE_TO_LOOM_ON_THE_DECLARED_TECHNICAL_PAYLOAD_COORDINATE',
);
assert.notDeepEqual(pair.left_technical_observable_vector, pair.right_technical_observable_vector);

const ashControl0 = compileAiaReceiverProjection(controls[0], AIA_RECEIVERS.ASH);
const loomControl0 = compileAiaReceiverProjection(controls[0], AIA_RECEIVERS.LOOM);
assert.equal(same(ashCanonical.receiver_payload, ashControl0.receiver_payload), true);
assert.equal(same(loomCanonical.receiver_payload, loomControl0.receiver_payload), false);
assert.equal(
  JSON.stringify(ashControl0.receiver_payload).includes('::AIA_ALT_0'),
  false,
);
assert.equal(
  JSON.stringify(loomControl0.receiver_payload).includes('::AIA_ALT_0'),
  true,
);

// Five-source preregistered partition theorem.
const global = finiteAiaReceiverAnisotropyCertificate(canonical, controls);
assert.equal(global.passed, true);
assert.equal(global.source_count, 5);
assert.equal(global.all_sources_constitutionally_admitted, true);
assert.equal(global.constitutional_custody_invariant_across_family, true);
assert.equal(global.all_source_authority_coordinates_zero, true);
assert.equal(global.each_control_changes_exactly_one_technical_observable_coordinate, true);
assert.deepEqual(global.ash_partition, [[0, 1, 2, 3, 4]]);
assert.deepEqual(global.loom_partition, [[0], [1], [2], [3], [4]]);
assert.equal(global.ash_partition_block_count, 1);
assert.equal(global.loom_partition_block_count, 5);
assert.equal(global.loom_partition_refines_ash, true);
assert.equal(global.loom_partition_strictly_refines_ash, true);
assert.equal(global.deterministic_ash_to_loom_reconstruction_exists_on_family, false);
assert.equal(global.constitutional_custody_recovered_exactly_from_both_receivers, true);
assert.equal(global.full_technical_payload_recovered_from_ash, false);
assert.equal(global.universal_receiver_order_claimed, false);
assert.equal(
  global.classification,
  'THE_BOUNDED_DOME_WORLD_RECEIVER_FAMILY_EXHIBITS_RECEIVER_INDEXED_INFORMATION_ANISOTROPY_WITH_LOOM_STRICTLY_REFINING_ASH_ON_THE_PREREGISTERED_FIVE_SOURCE_TECHNICAL_PAYLOAD_FAMILY',
);
assert.equal(
  global.directional_classification,
  'NO_DETERMINISTIC_ASH_TO_LOOM_RECONSTRUCTION_EXISTS_ON_THE_PREREGISTERED_FAMILY_BECAUSE_ONE_ASH_EQUIVALENCE_CLASS_CONTAINS_MULTIPLE_DISTINCT_LOOM_PAYLOADS',
);
assert.equal(
  global.custody_payload_classification,
  'THE_CONSTITUTIONAL_SOURCE_SIGNATURE_IS_RECOVERABLE_EXACTLY_FROM_BOTH_RECEIVERS_WHILE_THE_FULL_TECHNICAL_PAYLOAD_IS_NOT',
);
assert.equal(global.technical_mutation_certificates.length, 4);
assert.equal(global.technical_mutation_certificates.every(row => row.passed), true);
assert.deepEqual(
  global.technical_mutation_certificates.map(row => row.changed[0].stratum),
  ['ROUTE', 'TEMPORAL', 'FACE_HOLONOMY', 'OBSERVABILITY_ECOLOGY'],
);

// Same constitutional witness never means same full source receipt.
assert.equal(same(canonical, controls[0]), false);
assert.equal(
  same(
    domeWorldConstitutionalSourceSignature(canonical),
    domeWorldConstitutionalSourceSignature(controls[0]),
  ),
  true,
);

// Custody drift is not payload anisotropy: #796 membrane must fail closed.
const badHead = clone(canonical);
badHead.source_bridge_head = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
assert.equal(auditDomeWorldCanonicalConstitutionalSource(badHead).accepted, false);
assert.throws(
  () => compileAiaReceiverProjection(badHead, AIA_RECEIVERS.ASH),
  /AIA source rejected/,
);
assert.throws(
  () => compileAiaReceiverProjection(badHead, AIA_RECEIVERS.LOOM),
  /AIA source rejected/,
);

const badInverseAuthority = clone(canonical);
badInverseAuthority.authority.inverse = true;
assert.equal(auditDomeWorldCanonicalConstitutionalSource(badInverseAuthority).accepted, false);
assert.throws(
  () => compileAiaReceiverProjection(badInverseAuthority, AIA_RECEIVERS.ASH),
  /AIA source rejected/,
);

const badReleaseAuthority = clone(canonical);
badReleaseAuthority.authority.release = true;
assert.equal(auditDomeWorldCanonicalConstitutionalSource(badReleaseAuthority).accepted, false);
assert.throws(
  () => compileAiaReceiverProjection(badReleaseAuthority, AIA_RECEIVERS.LOOM),
  /AIA source rejected/,
);

assert.throws(
  () => compileAiaReceiverProjection(canonical, 'UNDECLARED_RECEIVER'),
  /receiver is undeclared/,
);

// Projection-level overreach hostiles.
const noWitness = clone(ashCanonical);
delete noWitness.constitutional_witness;
assert.equal(rejectAiaReceiverProjectionOverreach(noWitness).accepted, false);
assert.equal(rejectAiaReceiverProjectionOverreach(noWitness).constitutional_witness_present, false);

const widenedAuthority = clone(ashCanonical);
widenedAuthority.authority.inverse = true;
assert.equal(rejectAiaReceiverProjectionOverreach(widenedAuthority).accepted, false);
assert.equal(rejectAiaReceiverProjectionOverreach(widenedAuthority).authority_widened, true);

const runtime = clone(ashCanonical);
runtime.runtime_binding = true;
assert.equal(rejectAiaReceiverProjectionOverreach(runtime).accepted, false);
assert.equal(rejectAiaReceiverProjectionOverreach(runtime).runtime_binding_attempted, true);

for (const field of [
  'tomography_inverse_authority',
  'encoder_authority',
  'semantic_equivalence_authority',
  'scientific_bridge_promotion_authority',
  'full_source_reconstruction',
]) {
  const hostile = clone(loomCanonical);
  hostile.claim_ceiling[field] = true;
  assert.equal(
    rejectAiaReceiverProjectionOverreach(hostile).accepted,
    false,
    `${field} overreach must be rejected`,
  );
}

const fakeReceiver = clone(loomCanonical);
fakeReceiver.receiver = 'GLOBAL_OBSERVER';
assert.equal(rejectAiaReceiverProjectionOverreach(fakeReceiver).accepted, false);
assert.equal(rejectAiaReceiverProjectionOverreach(fakeReceiver).receiver_declared, false);

console.log('AIA receiver-indexed distinguishability hostile tests passed.');
