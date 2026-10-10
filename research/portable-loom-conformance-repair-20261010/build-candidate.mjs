import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash, webcrypto } from 'node:crypto';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLoomAiGovernance, createCanonicalPortableLoomPacket } from '../../app/dome-world/holonomy-loom/ai-handoff.js';
import { STANDARD_PORTABLE_LOOM_TASK, STANDARD_PORTABLE_LOOM_RULES } from '../../app/engine/portable-loom-policy.js';
import { createPortableLoomSession, createPortableLoomSessionExport, createPortableLoomSessionPrompt, portableLoomDigest } from '../../app/engine/portable-loom-session.js';
import { verifyPortableLoomCore } from '../../app/engine/portable-loom-core.js';

const [revision, directory] = process.argv.slice(2);
if (!/^[a-f0-9]{40}$/.test(revision ?? '') || !directory) throw new Error('Supply the independently byte-verified GitHub implementation commit and a new output directory.');
const environment = { crypto: webcrypto, TextEncoder };
const input = { task: STANDARD_PORTABLE_LOOM_TASK, rules: [...STANDARD_PORTABLE_LOOM_RULES], documents: [] };
input.governance = await createLoomAiGovernance(input, { withheldDocumentCount: 0 }, environment);
const packet = await createCanonicalPortableLoomPacket(input, { sourceRevision: revision }, environment);
const session = await createPortableLoomSession(packet, { session_id: webcrypto.randomUUID(), source_revision: revision }, environment);
const artifact = { ...await createPortableLoomSessionExport(session, packet, environment), loom_gate_reports: [] };
await verifyPortableLoomCore(input, artifact.portable_task.portable_governance, environment);
if (session.root.packet_digest !== await portableLoomDigest(artifact.portable_task, environment)) throw new Error('Candidate root packet digest differs.');
if (artifact.portable_task.documents.length || artifact.session.work_units.length || artifact.loom_gate_reports.length) throw new Error('Prospective candidate must contain no sources, results or admitted work.');
const destination = resolve(directory), files = [
  ['portable-loom-conformance-candidate.json', JSON.stringify(artifact, null, 2) + '\n'],
  ['portable-loom-conformance-candidate.md', '# Portable Loom conformance candidate\n\nProspective receiver instructions. NOT_FROZEN · NOT_ENROLLED · NOT_RUN. No captured answer is rewritten or admitted. Offline declaration checks do not establish receiving-model compliance.\n\n```text\n' + createPortableLoomSessionPrompt(artifact) + '\n```\n']
];
await mkdir(destination, { recursive: false });
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const sourceFiles = [];
const repo = fileURLToPath(new URL('../../', import.meta.url));
for (const path of ['app/engine/portable-loom-output.js', 'app/engine/portable-loom-session.js', 'app/engine/portable-loom-receiver-conformance.js']) {
  const bytes = await readFile(join(repo, path)); sourceFiles.push({ path, bytes: bytes.length, sha256: sha256(bytes) });
}
const manifest = { schema: 'td613.loom.conformance-candidate-manifest/v0.1', source_revision: revision, created_at: new Date().toISOString(),
  status: 'NOT_FROZEN_NOT_ENROLLED_NOT_RUN', source_revision_authentication: 'CALLER_MUST_VERIFY_EXACT_GITHUB_SOURCE_BYTES',
  session_root_ref: session.root.ref, policy_commitment: session.root.policy_commitment,
  selected_source_count: 0, admitted_work_unit_count: 0, provider_requests: 0, basic_export_integrity: 'PASS', source_files: sourceFiles, files: [] };
for (const [name, body] of files) { await writeFile(join(destination, name), body, { flag: 'wx' }); manifest.files.push({ name, bytes: Buffer.byteLength(body), sha256: sha256(body) }); }
await writeFile(join(destination, 'CANDIDATE_MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
process.stdout.write(JSON.stringify(manifest, null, 2) + '\n');
