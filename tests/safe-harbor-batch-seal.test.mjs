import assert from 'assert';
import { buildSealedBatchArtifact, splitPrimaryPersonas } from '../app/safe-harbor/app/operator-batch-seal.js';

assert.deepStrictEqual(
  splitPrimaryPersonas('The Archivist, The Matron, The Cross-Examiner'),
  ['The Archivist', 'The Matron', 'The Cross-Examiner'],
  'splitPrimaryPersonas keeps the manifest persona names intact'
);

const artifact = buildSealedBatchArtifact({
  batchId: 'batch-003a',
  sealedAt: '2026-04-21T12:00:00.000Z',
  registryEntry: {
    primary_persona: 'The Archivist, The Matron'
  },
  batch: {
    batch_id: 'batch-003a',
    family_name: 'Tauric Diana bots Core',
    verification_status: 'Draft'
  },
  packet: {
    packet_id: 'SH-TEST',
    created_at: '2026-04-21T11:59:00.000Z',
    packet_hash_sha256: 'sha256:test',
    receipt: { receipt_id: 'SHR-TEST' },
    analysis: {
      route: {
        state: 'harbor-eligible',
        recommended_harbor: 'provenance.seal',
        membrane_note: 'sealed'
      }
    },
    issuance: {
      badge_number: 'TD613-SH-9B07D8B-ABCD1234',
      canonical_header: 'SHI#:TD613-SH-9B07D8B-ABCD1234',
      extended_footer: 'footer',
      assignment_basis: 'stylometric',
      stylometric_fingerprint: 'future=...',
    }
  },
  signature: {
    sig_type: 'PGP-detached',
    alg: 'OpenPGP',
    sig: '-----BEGIN PGP SIGNATURE-----'
  }
});

assert.equal(artifact.route_status, 'provenance.seal', 'sealed batch is force-routed to provenance.seal');
assert.equal(artifact.verification_status, 'Provenance Seal', 'sealed batch advertises the new verification state');
assert.equal(artifact.safe_harbor.route.status, 'provenance.seal', 'safe harbor route block preserves provenance.seal');
assert.equal(artifact.safe_harbor.signature.sig, '-----BEGIN PGP SIGNATURE-----', 'detached signature text is carried unchanged');
assert.deepStrictEqual(
  artifact.safe_harbor.personas.map((persona) => persona.name),
  ['The Archivist', 'The Matron'],
  'sealed batch carries the manifest personas into the provenance wrapper'
);
assert.equal(
  artifact.safe_harbor.issuance.badge_number,
  'TD613-SH-9B07D8B-ABCD1234',
  'sealed batch keeps the minted SHI number in the issuance wrapper'
);

console.log('safe-harbor-batch-seal.test.mjs passed');
