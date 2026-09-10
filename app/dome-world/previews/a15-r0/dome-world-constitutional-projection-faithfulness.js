import {
  HOLO_LOOM_HETEROSTRATIGRAPHIC_APPARATUS_SCHEMA,
  ASH_HETEROSTRATIGRAPHIC_READONLY_SCHEMA,
  HOLO_LOOM_HETEROSTRATIGRAPHIC_STACKED_PARENT,
  compileAshReadOnlyTomographyProjection,
} from './holonomy-loom-heterostratigraphic-apparatus-adapter.js';
import {
  HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_SCHEMA,
} from './heterostratigraphic-holonomy-tomography-bridge.js';

export const DOME_WORLD_CONSTITUTIONAL_PROJECTION_SCHEMA =
  'td613.dome-world.constitutionally-faithful-ash-projection/v0.1';
export const DOME_WORLD_CONSTITUTIONAL_PROJECTION_PARENT_RECEIPT =
  '528f9b2f96bf3bc4c18242b0f0d910ca5323fdea';
export const DOME_WORLD_CANONICAL_SOURCE_FIXTURE_ID =
  'strata-lantern.moss-lantern-heterostratigraphic/v0.1';
export const DOME_WORLD_CANONICAL_APPARATUS_OWNER = 'HOLONOMY_LOOM_RESEARCH';

const AUTHORITY_KEYS = Object.freeze([
  'inverse',
  'encoder',
  'custody_mutation',
  'release',
  'production',
  'physical_claim',
  'continuum_claim',
]);

const REQUIRED_WITNESS_KEYS = Object.freeze([
  'apparatus_owner',
  'source_bridge_schema',
  'source_bridge_head',
  'source_fixture_id',
  'source_authority',
]);

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object ?? {}, key);
}

function exactAuthorityVector(receipt) {
  return freeze(Object.fromEntries(AUTHORITY_KEYS.map(key => [
    key,
    hasOwn(receipt?.authority, key) ? receipt.authority[key] : null,
  ])));
}

export function domeWorldConstitutionalSourceSignature(receipt) {
  return freeze({
    apparatus_owner: receipt?.apparatus_owner ?? null,
    source_bridge_schema: receipt?.source_bridge_schema ?? null,
    source_bridge_head: receipt?.source_bridge_head ?? null,
    source_fixture_id: receipt?.source_fixture_id ?? null,
    source_authority: exactAuthorityVector(receipt),
  });
}

export function auditDomeWorldCanonicalConstitutionalSource(receipt) {
  const failures = [];

  if (!receipt || receipt.schema !== HOLO_LOOM_HETEROSTRATIGRAPHIC_APPARATUS_SCHEMA) {
    failures.push('APPARATUS_RECEIPT_SCHEMA_MISMATCH');
  }
  if (receipt?.research_only !== true) failures.push('SOURCE_NOT_RESEARCH_ONLY');
  if (receipt?.runtime_binding !== false) failures.push('SOURCE_RUNTIME_BINDING_NOT_FALSE');
  if (receipt?.apparatus_owner !== DOME_WORLD_CANONICAL_APPARATUS_OWNER) {
    failures.push('APPARATUS_OWNER_MISMATCH');
  }
  if (receipt?.source_bridge_schema !== HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_SCHEMA) {
    failures.push('SOURCE_BRIDGE_SCHEMA_MISMATCH');
  }
  if (receipt?.source_bridge_head !== HOLO_LOOM_HETEROSTRATIGRAPHIC_STACKED_PARENT) {
    failures.push('SOURCE_BRIDGE_HEAD_MISMATCH');
  }
  if (receipt?.source_fixture_id !== DOME_WORLD_CANONICAL_SOURCE_FIXTURE_ID) {
    failures.push('SOURCE_FIXTURE_ID_MISMATCH');
  }

  for (const key of AUTHORITY_KEYS) {
    if (!hasOwn(receipt?.authority, key)) {
      failures.push(`SOURCE_AUTHORITY_COORDINATE_MISSING:${key}`);
    } else if (receipt.authority[key] !== false) {
      failures.push(`SOURCE_AUTHORITY_NOT_FALSE:${key}`);
    }
  }

  const accepted = failures.length === 0;
  return freeze({
    accepted,
    failures: freeze(failures),
    signature: domeWorldConstitutionalSourceSignature(receipt),
    classification: accepted
      ? 'DOME_WORLD_CANONICAL_CONSTITUTIONAL_SOURCE_ACCEPTED'
      : 'DOME_WORLD_CONSTITUTIONAL_SOURCE_REJECTED_FAIL_CLOSED',
    scars: freeze([
      'READ_ONLY_CHILD_AUTHORITY_ZERO != SOURCE_AUTHORITY_ZERO',
      'PROJECTION_MONOTONICITY != PROJECTION_INJECTIVITY',
    ]),
  });
}

export function inheritedAshProjectionCustodyCollisionCertificate(leftReceipt, rightReceipt) {
  const leftProjection = compileAshReadOnlyTomographyProjection(leftReceipt);
  const rightProjection = compileAshReadOnlyTomographyProjection(rightReceipt);
  const leftSignature = domeWorldConstitutionalSourceSignature(leftReceipt);
  const rightSignature = domeWorldConstitutionalSourceSignature(rightReceipt);

  const projectionEqual = same(leftProjection, rightProjection);
  const signatureEqual = same(leftSignature, rightSignature);
  const collision = projectionEqual && !signatureEqual;

  const changedCoordinates = REQUIRED_WITNESS_KEYS.filter(key => (
    !same(leftSignature[key], rightSignature[key])
  ));

  return freeze({
    inherited_projection_schema: ASH_HETEROSTRATIGRAPHIC_READONLY_SCHEMA,
    projection_equal: projectionEqual,
    constitutional_signature_equal: signatureEqual,
    constitutional_collision: collision,
    changed_constitutional_coordinates: freeze(changedCoordinates),
    left_signature: leftSignature,
    right_signature: rightSignature,
    classification: collision
      ? 'INHERITED_CHILD_PROJECTION_COLLAPSES_DISTINCT_CONSTITUTIONAL_SOURCE_STATES'
      : 'NO_CONSTITUTIONAL_COLLISION_DEMONSTRATED_FOR_THIS_PAIR',
    scar: 'RENDER_EQUIVALENCE != CUSTODY_EQUIVALENCE',
  });
}

function assertCanonicalSource(receipt) {
  const audit = auditDomeWorldCanonicalConstitutionalSource(receipt);
  if (!audit.accepted) {
    throw new Error(`Dome-World constitutional source rejected: ${audit.failures.join(', ')}`);
  }
  return audit;
}

function constitutionalWitness(receipt) {
  return freeze({
    schema: 'td613.dome-world.constitutional-source-witness/v0.1',
    parent_receipt: DOME_WORLD_CONSTITUTIONAL_PROJECTION_PARENT_RECEIPT,
    ...domeWorldConstitutionalSourceSignature(receipt),
    witness_scope: 'BOUNDED_A15_R0_SOURCE_CUSTODY_AND_AUTHORITY_ONLY',
    semantic_equivalence_authority: false,
    scientific_bridge_promotion_authority: false,
    runtime_authority: false,
    production_authority: false,
  });
}

export function compileDomeWorldConstitutionallyFaithfulProjection(receipt) {
  const sourceAudit = assertCanonicalSource(receipt);
  const inheritedProjection = compileAshReadOnlyTomographyProjection(receipt);

  if (inheritedProjection.schema !== ASH_HETEROSTRATIGRAPHIC_READONLY_SCHEMA) {
    throw new Error('Dome-World exactifier requires the inherited Ash read-only projection schema.');
  }
  if (inheritedProjection.runtime_binding !== false) {
    throw new Error('Dome-World exactifier refuses a runtime-bound child projection.');
  }
  if (Object.values(inheritedProjection.authority ?? {}).some(value => value !== false)) {
    throw new Error('Dome-World exactifier refuses nonzero child authority.');
  }

  const witness = constitutionalWitness(receipt);
  const envelope = {
    schema: DOME_WORLD_CONSTITUTIONAL_PROJECTION_SCHEMA,
    surface_owner: 'DOME_WORLD_RESEARCH',
    research_only: true,
    runtime_binding: false,
    inherited_projection_schema: inheritedProjection.schema,
    constitutional_witness: witness,
    child_surface: inheritedProjection,
    available_actions: inheritedProjection.available_actions,
    prohibited_actions: inheritedProjection.prohibited_actions,
    authority: inheritedProjection.authority,
    source_audit: sourceAudit,
    claim_ceiling: freeze({
      constitutional_source_custody_faithfulness: true,
      child_projection_scientific_authority_unchanged: true,
      semantic_equivalence_authority: false,
      cross_stratum_encoder_authority: false,
      scientific_bridge_promotion_authority: false,
      live_runtime_authority: false,
      proto_loom_authority: false,
      browser_human_usability_authority: false,
      physical_holonomy_authority: false,
      continuum_tomography_authority: false,
      production_authority: false,
      vercel_authority: false,
    }),
    human_closure_required: true,
  };

  return freeze(envelope);
}

export function domeWorldConstitutionalProjectionFaithfulnessCertificate(receipt, envelope) {
  const sourceAudit = auditDomeWorldCanonicalConstitutionalSource(receipt);
  const expectedSignature = domeWorldConstitutionalSourceSignature(receipt);
  const actualWitness = envelope?.constitutional_witness ?? {};
  const witnessSignature = freeze({
    apparatus_owner: actualWitness.apparatus_owner ?? null,
    source_bridge_schema: actualWitness.source_bridge_schema ?? null,
    source_bridge_head: actualWitness.source_bridge_head ?? null,
    source_fixture_id: actualWitness.source_fixture_id ?? null,
    source_authority: actualWitness.source_authority ?? null,
  });

  const witnessComplete = REQUIRED_WITNESS_KEYS.every(key => hasOwn(actualWitness, key));
  const witnessMatches = same(expectedSignature, witnessSignature);
  const childParity = envelope?.child_surface
    ? same(envelope.child_surface, compileAshReadOnlyTomographyProjection(receipt))
    : false;
  const actionParity = same(
    envelope?.available_actions ?? null,
    envelope?.child_surface?.available_actions ?? null,
  );
  const authorityParity = same(
    envelope?.authority ?? null,
    envelope?.child_surface?.authority ?? null,
  ) && Object.values(envelope?.authority ?? {}).every(value => value === false);
  const noAuthorityWidening =
    actualWitness.semantic_equivalence_authority === false
    && actualWitness.scientific_bridge_promotion_authority === false
    && actualWitness.runtime_authority === false
    && actualWitness.production_authority === false
    && envelope?.claim_ceiling?.semantic_equivalence_authority === false
    && envelope?.claim_ceiling?.scientific_bridge_promotion_authority === false
    && envelope?.claim_ceiling?.live_runtime_authority === false
    && envelope?.claim_ceiling?.production_authority === false;

  const passed =
    sourceAudit.accepted
    && envelope?.schema === DOME_WORLD_CONSTITUTIONAL_PROJECTION_SCHEMA
    && envelope?.runtime_binding === false
    && witnessComplete
    && witnessMatches
    && childParity
    && actionParity
    && authorityParity
    && noAuthorityWidening;

  return freeze({
    source_audit_passed: sourceAudit.accepted,
    witness_complete: witnessComplete,
    witness_matches_source_signature: witnessMatches,
    inherited_child_surface_preserved_exactly: childParity,
    action_inventory_preserved_exactly: actionParity,
    child_authority_preserved_exactly_and_zero: authorityParity,
    witness_and_envelope_add_zero_new_authority: noAuthorityWidening,
    passed,
    classification: passed
      ? 'DOME_WORLD_CONSTITUTIONAL_PROJECTION_IS_FAITHFUL_TO_THE_DECLARED_BOUNDED_SOURCE_SIGNATURE_WITH_ZERO_AUTHORITY_WIDENING'
      : 'DOME_WORLD_CONSTITUTIONAL_PROJECTION_FAITHFULNESS_NOT_ESTABLISHED',
    scars: freeze([
      'VISIBLE_STATIC_TRUTH_PARITY != SOURCE_CUSTODY_FAITHFULNESS',
      'CONSTITUTIONAL_WITNESS != SCIENTIFIC_TRUTH',
    ]),
  });
}

export function rejectDomeWorldConstitutionalWitnessOrAuthorityLaundering(receipt, candidateEnvelope) {
  const sourceAudit = auditDomeWorldCanonicalConstitutionalSource(receipt);
  const witness = candidateEnvelope?.constitutional_witness ?? {};
  const missingWitnessCoordinates = REQUIRED_WITNESS_KEYS.filter(key => !hasOwn(witness, key));
  const expectedSignature = domeWorldConstitutionalSourceSignature(receipt);
  const actualSignature = {
    apparatus_owner: witness.apparatus_owner ?? null,
    source_bridge_schema: witness.source_bridge_schema ?? null,
    source_bridge_head: witness.source_bridge_head ?? null,
    source_fixture_id: witness.source_fixture_id ?? null,
    source_authority: witness.source_authority ?? null,
  };
  const witnessMismatch = missingWitnessCoordinates.length === 0
    ? !same(expectedSignature, actualSignature)
    : true;
  const envelopeAuthorityWidened = Object.values(candidateEnvelope?.authority ?? {})
    .some(value => value === true);
  const childAuthorityWidened = Object.values(candidateEnvelope?.child_surface?.authority ?? {})
    .some(value => value === true);
  const actionWidened = !same(
    candidateEnvelope?.available_actions ?? null,
    candidateEnvelope?.child_surface?.available_actions ?? null,
  );
  const witnessClaimWidened =
    witness.semantic_equivalence_authority === true
    || witness.scientific_bridge_promotion_authority === true
    || witness.runtime_authority === true
    || witness.production_authority === true;

  const accepted =
    sourceAudit.accepted
    && missingWitnessCoordinates.length === 0
    && !witnessMismatch
    && !envelopeAuthorityWidened
    && !childAuthorityWidened
    && !actionWidened
    && !witnessClaimWidened
    && candidateEnvelope?.runtime_binding === false;

  return freeze({
    accepted,
    source_audit_accepted: sourceAudit.accepted,
    source_audit_failures: sourceAudit.failures,
    missing_witness_coordinates: freeze(missingWitnessCoordinates),
    witness_mismatch: witnessMismatch,
    envelope_authority_widened: envelopeAuthorityWidened,
    child_authority_widened: childAuthorityWidened,
    action_inventory_widened: actionWidened,
    witness_claim_widened: witnessClaimWidened,
    classification: accepted
      ? 'DOME_WORLD_CONSTITUTIONAL_WITNESS_AND_AUTHORITY_NON_LAUNDERING_PRESERVED'
      : 'DOME_WORLD_CONSTITUTIONAL_WITNESS_OR_AUTHORITY_LAUNDERING_ATTEMPT_REJECTED',
  });
}

export function constitutionalWitnessCoordinateNecessityCertificate(canonicalReceipt, oneCoordinateControls) {
  const rows = oneCoordinateControls.map(({ coordinate, receipt }) => {
    const collision = inheritedAshProjectionCustodyCollisionCertificate(canonicalReceipt, receipt);
    return freeze({
      coordinate,
      inherited_projection_collision: collision.constitutional_collision,
      changed_coordinates: collision.changed_constitutional_coordinates,
      omission_cannot_distinguish_this_pair:
        collision.constitutional_collision
        && collision.changed_constitutional_coordinates.length === 1
        && collision.changed_constitutional_coordinates[0] === coordinate,
    });
  });

  const passed = rows.every(row => row.omission_cannot_distinguish_this_pair);
  return freeze({
    rows: freeze(rows),
    finite_adversarial_coordinate_necessity_established: passed,
    universal_minimal_sufficient_statistic_claimed: false,
    passed,
    classification: passed
      ? 'EVERY_PREREGISTERED_CONSTITUTIONAL_COORDINATE_IS_NECESSARY_TO_DISTINGUISH_ITS_WITNESSED_ONE_COORDINATE_COLLISION_PAIR'
      : 'CONSTITUTIONAL_WITNESS_COORDINATE_NECESSITY_NOT_ESTABLISHED',
  });
}
