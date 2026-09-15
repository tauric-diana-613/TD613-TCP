const STAGES = [
  'RECOGNITION',
  'IDENTITY_BINDING',
  'STANDING',
  'BOUNDED_AUTHORITY',
  'CAPABILITY',
  'WITNESS',
  'FLOW_CONSTRAINT',
  'PROVENANCE',
  'REVOCATION',
  'REPAIR',
  'RETURN'
];

const SAFE_CAPABILITIES = new Set([
  'READ_SELECTED_PACKET',
  'RETURN_STRUCTURED_RESULT',
  'PROPOSE_REPAIR'
]);

function plainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function stage(id, state, evidence = []) {
  return { id, state, evidence };
}

function held(stages, reason, stop_stage) {
  return {
    schema: 'td613.wendbine.custodian-independent-handoff-assay/v0.1',
    outcome: 'HELD',
    reason,
    stop_stage,
    stages,
    action_executed: false,
    external_host_enforced: false,
    authority_transferred: false,
    custodian_participation_required: false
  };
}

export const CUSTODIAN_INDEPENDENT_HANDOFF_STAGES = Object.freeze([...STAGES]);

export function createExitLease(packet, overrides = {}) {
  const digest = packet?.governance?.input_digest;
  if (typeof digest !== 'string' || !/^[a-f0-9]{64}$/.test(digest)) throw new TypeError('portable packet lacks a valid origin binding');
  const lease = {
    schema: 'td613.wendbine.exit-lease/v0.1',
    subject_binding: digest,
    standing: 'BOUND_TO_SELECTED_PACKET',
    authority_scope: ['INSPECT_SELECTED_PACKET', 'RETURN_WITHIN_DECLARED_FIELDS'],
    capability_scope: ['READ_SELECTED_PACKET', 'RETURN_STRUCTURED_RESULT', 'PROPOSE_REPAIR'],
    revocable: true,
    status: 'ACTIVE',
    custodian_participation_required: false,
    provenance_survives_revocation: true,
    repair_surface_survives_revocation: true,
    ...overrides
  };
  return lease;
}

export function compileCustodianIndependentHandoff(packet, lease = null, { custodianParticipating = true } = {}) {
  const stages = [];
  if (!plainObject(packet) || packet.schema !== 'td613.loom.portable-task/v0.1' || !plainObject(packet.portability_assurance)) {
    return held(stages, 'PORTABLE_PACKET_NOT_RECOGNIZED', 'RECOGNITION');
  }
  stages.push(stage('RECOGNITION', 'SUPPORTED', ['PORTABLE_TASK_SCHEMA', 'PORTABILITY_ASSURANCE_PRESENT']));

  const digest = packet?.governance?.input_digest;
  const sourceBinding = packet.portability_assurance?.source_provenance?.binding_material;
  if (typeof digest !== 'string' || !/^[a-f0-9]{64}$/.test(digest) || sourceBinding !== 'INPUT_DIGEST_PRESENT') {
    return held(stages, 'ORIGIN_IDENTITY_BINDING_MISSING', 'IDENTITY_BINDING');
  }
  stages.push(stage('IDENTITY_BINDING', 'SUPPORTED', ['INPUT_DIGEST_PRESENT', 'SOURCE_PROVENANCE_BOUND']));

  if (!plainObject(lease) || lease.schema !== 'td613.wendbine.exit-lease/v0.1' || lease.subject_binding !== digest || lease.standing !== 'BOUND_TO_SELECTED_PACKET') {
    return held(stages, 'REVOCABLE_STANDING_NOT_BOUND', 'STANDING');
  }
  stages.push(stage('STANDING', 'SUPPORTED', ['LEASE_BOUND_TO_SELECTED_PACKET']));

  if (packet.portability_assurance.authority_transferred !== false || !Array.isArray(lease.authority_scope) || lease.authority_scope.length === 0 || lease.authority_scope.some(item => typeof item !== 'string' || /DEPLOY|MERGE|PUBLISH|DELETE|WRITE_EXTERNAL|TRANSFER_AUTHORITY/.test(item))) {
    return held(stages, 'BOUNDED_AUTHORITY_VIOLATION', 'BOUNDED_AUTHORITY');
  }
  stages.push(stage('BOUNDED_AUTHORITY', 'SUPPORTED', ['AUTHORITY_NOT_TRANSFERRED', 'LEASE_SCOPE_BOUNDED']));

  if (!Array.isArray(lease.capability_scope) || lease.capability_scope.length === 0 || lease.capability_scope.some(item => !SAFE_CAPABILITIES.has(item))) {
    return held(stages, 'CAPABILITY_SCOPE_UNSAFE', 'CAPABILITY');
  }
  stages.push(stage('CAPABILITY', 'SUPPORTED', ['READ_RETURN_REPAIR_ONLY']));

  const observed = packet.portability_assurance?.observation_surface?.observed;
  const unknown = packet.portability_assurance?.observation_surface?.unknown;
  if (!Array.isArray(observed) || !observed.includes('PRODUCER') || !observed.includes('PACKET') || !Array.isArray(unknown) || !unknown.includes('RECEIVER')) {
    return held(stages, 'WITNESS_BOUNDARY_COLLAPSED', 'WITNESS');
  }
  stages.push(stage('WITNESS', 'SUPPORTED', ['PRODUCER_PACKET_OBSERVED', 'RECEIVER_REMAINS_UNKNOWN']));

  const flow = packet.portability_assurance?.information_flow;
  if (packet.portability_assurance.transitive_inference !== 'PROHIBITED_WITHOUT_EDGE_EVIDENCE' || flow?.receiver_policy_enforcement !== 'UNVERIFIED' || flow?.downstream_retransmission_control !== 'UNVERIFIED') {
    return held(stages, 'FLOW_CONSTRAINT_NOT_PRESERVED', 'FLOW_CONSTRAINT');
  }
  stages.push(stage('FLOW_CONSTRAINT', 'SUPPORTED', ['NO_TRANSITIVE_INFERENCE', 'FOREIGN_ENFORCEMENT_UNVERIFIED']));

  const path = packet.portability_assurance?.path_provenance;
  const repairPath = packet.portability_assurance?.provenance_review?.repair_path;
  if (!plainObject(packet.portability_assurance.source_provenance) || !plainObject(path) || repairPath !== 'PRESERVE_ORIGIN_AND_HOLD') {
    return held(stages, 'PROVENANCE_OR_REPAIR_PATH_MISSING', 'PROVENANCE');
  }
  stages.push(stage('PROVENANCE', 'SUPPORTED', ['SOURCE_AND_PATH_PROVENANCE_SEPARATED', 'ORIGIN_PRESERVED_ON_HOLD']));

  if (lease.revocable !== true || !['ACTIVE', 'REVOKED'].includes(lease.status) || lease.provenance_survives_revocation !== true || lease.repair_surface_survives_revocation !== true) {
    return held(stages, 'REVOCATION_CONTRACT_INCOMPLETE', 'REVOCATION');
  }
  stages.push(stage('REVOCATION', 'SUPPORTED', ['REVOCABLE_LEASE', 'PROVENANCE_SURVIVES_REVOCATION', 'REPAIR_SURFACE_SURVIVES_REVOCATION']));

  if (lease.custodian_participation_required !== false) {
    return held(stages, 'CUSTODIAN_REMAINS_OPERATIONAL_DEPENDENCY', 'REPAIR');
  }
  stages.push(stage('REPAIR', 'SUPPORTED', ['CUSTODIAN_NOT_REQUIRED', 'REPAIR_PATH_PRESERVED']));

  const revoked = lease.status === 'REVOKED';
  stages.push(stage('RETURN', 'SUPPORTED', [revoked ? 'RETURN_INSPECTION_ONLY_AFTER_REVOCATION' : 'RETURN_WITH_BOUNDED_CAPABILITY', custodianParticipating ? 'CUSTODIAN_PRESENT_BUT_OPTIONAL' : 'CUSTODIAN_ABSENT_AND_NOT_REQUIRED']));

  return {
    schema: 'td613.wendbine.custodian-independent-handoff-assay/v0.1',
    outcome: revoked ? 'RETURN_ONLY' : 'ADMITTED',
    reason: revoked ? 'AUTHORITY_REVOKED_PROVENANCE_AND_REPAIR_REMAIN' : 'CUSTODIAN_INDEPENDENT_HANDOFF_SUPPORTED_IN_REPOSITORY_SIMULATION',
    stop_stage: null,
    stages,
    capability_state: revoked ? 'REVOKED' : 'BOUNDED_ACTIVE',
    preserved_after_revocation: {
      origin_binding: true,
      source_provenance: true,
      path_provenance: true,
      repair_path: true,
      external_action_authority: false
    },
    action_executed: false,
    external_host_enforced: false,
    authority_transferred: false,
    custodian_participation_required: false,
    custodian_participating: Boolean(custodianParticipating)
  };
}
