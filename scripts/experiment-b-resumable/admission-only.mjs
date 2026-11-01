import { ControlledArchiveIntake } from '../../docs/research/experiment-b-preflight/02_four_arm_harness/controlled-archive-intake.mjs';
import { digest } from './journal.mjs';

// Called by a separately controlled offline custodian, never by the model runner.
// Hash acquisition has its own prior human authorization or authenticated escrow.
export function admitOnly({ target, grant, authority, policy }) {
  if (!authority || !policy) throw Error('ADMISSION_ONLY_PROVISIONING_REQUIRED');
  const intake = new ControlledArchiveIntake({ ...policy, syntheticMode: false, allowProtectedAdmission: true, bootstrapAuthority: authority });
  const admission = intake.admitArchive(target, { admissionOnlyGrant: grant });
  const brokerManifest = admission.documents.map(d => ({ id: d.id, sha256: d.sha256,
    content_sha256: typeof d.content === 'string' ? digest(d.content) : null }));
  return { admission, escrow: { operation: 'EXPERIMENT_B_ADMISSION_ONLY', inferenceAuthorized: false,
    archiveSHA256: admission.archive_sha256, metadataPolicyDigest: grant.metadataPolicyDigest,
    intakeManifestDigest: admission.manifest_sha256, brokerManifest, sourceManifestDigest: digest(brokerManifest) } };
}
