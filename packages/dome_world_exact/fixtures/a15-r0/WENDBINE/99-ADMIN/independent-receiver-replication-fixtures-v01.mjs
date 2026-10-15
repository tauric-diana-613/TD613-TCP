function clone(value) {
  return structuredClone(value);
}

function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${label}_MUST_BE_OBJECT`);
}

export function makeIndependentReplicationCase(baseArtifactBundle, caseIdentity) {
  requireObject(baseArtifactBundle, 'BASE_ARTIFACT_BUNDLE');
  const seeded = clone(baseArtifactBundle);

  switch (caseIdentity) {
    case 'CLEAN_CONTROL':
      break;
    case 'SOURCE_BINDING_DRIFT': {
      const row = seeded.bridgeMap?.rows?.find(candidate => (candidate.wendbine_source_refs?.length ?? 0) > 0);
      if (!row) throw new Error('REPLICA_FIXTURE_FAILED:SOURCE_BINDING_DRIFT');
      row.wendbine_source_refs[0] = 'reddit:t3_seeded_source_binding_drift';
      break;
    }
    case 'AUTHORITY_PROMOTION': {
      const entry = seeded.stickerTaxonomy?.entries?.[0];
      if (!entry) throw new Error('REPLICA_FIXTURE_FAILED:AUTHORITY_PROMOTION');
      entry.label_is_authority = true;
      break;
    }
    case 'RELATION_CLASS_INFLATION': {
      const row = seeded.bridgeMap?.rows?.find(candidate => candidate.relation_class === 'PARTIAL');
      if (!row) throw new Error('REPLICA_FIXTURE_FAILED:RELATION_CLASS_INFLATION');
      row.relation_class = 'EXACT';
      break;
    }
    case 'REPAIR_RECOVERY_COLLAPSE': {
      const row = seeded.bridgeMap?.rows?.find(candidate => candidate.id === 'safe_return_recovery');
      if (!row) throw new Error('REPLICA_FIXTURE_FAILED:REPAIR_RECOVERY_COLLAPSE');
      row.relation_class = 'EXACT';
      row.state = 'REPRESENTED';
      break;
    }
    case 'DESTINATION_ENFORCEMENT_PROMOTION':
      if (!seeded.portablePacket?.portability_assurance) throw new Error('REPLICA_FIXTURE_FAILED:DESTINATION_ENFORCEMENT_PROMOTION');
      seeded.portablePacket.portability_assurance.destination_enforcement = 'VERIFIED';
      break;
    default:
      throw new Error(`UNKNOWN_REPLICATION_CASE:${caseIdentity}`);
  }

  delete seeded.caseId;
  delete seeded.expectedAnswers;
  delete seeded.expectedDiagnosis;
  delete seeded.expectedRepair;
  delete seeded.prereg;
  return seeded;
}
