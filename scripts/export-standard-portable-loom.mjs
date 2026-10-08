import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash, webcrypto } from 'node:crypto';
import { createLoomAiGovernance, createCanonicalPortableLoomPacket } from '../app/dome-world/holonomy-loom/ai-handoff.js';
import { STANDARD_PORTABLE_LOOM_TASK, STANDARD_PORTABLE_LOOM_RULES } from '../app/engine/portable-loom-policy.js';
import { verifyPortableLoomCore } from '../app/engine/portable-loom-core.js';
import { createPortableLoomSession, createPortableLoomSessionExport, createPortableLoomSessionPrompt, portableLoomDigest } from '../app/engine/portable-loom-session.js';

const destination = resolve(process.argv[2] || '');
if (!process.argv[2]) throw new Error('Provide a new export directory.');
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' }).trim()) throw new Error('Standard export requires committed source bytes; commit or restore tracked changes before export.');
const environment = { crypto: webcrypto, TextEncoder };
const input = { task: STANDARD_PORTABLE_LOOM_TASK, rules: [...STANDARD_PORTABLE_LOOM_RULES], documents: [] };
input.governance = await createLoomAiGovernance(input, { withheldDocumentCount: 0 }, environment);
const packet = await createCanonicalPortableLoomPacket(input, { sourceRevision: revision }, environment);
const session = await createPortableLoomSession(packet, { session_id: webcrypto.randomUUID(), source_revision: revision }, environment);
const artifact = { ...await createPortableLoomSessionExport(session, packet, environment), loom_gate_reports: [] };
await verifyPortableLoomCore(input, JSON.parse(JSON.stringify(artifact)).portable_task.portable_governance, environment);
if (session.root.packet_digest !== await portableLoomDigest(artifact.portable_task, environment)) throw new Error('Exported packet root mismatch.');
if (artifact.portable_task.documents.length || artifact.loom_gate_reports.length || artifact.session.work_units.length) throw new Error('Standard export cannot seed scenario content or results.');
const files = [
  ['portable-loom-standard.json', JSON.stringify(artifact, null, 2) + '\n'],
  ['portable-loom-standard.md', '# Standard Portable Loom\n\nReceiver-neutral session governance; ChatGPT is the first specified output format. This export contains no demo, source documents, private keys, captured Gate results or admitted returned work. Supply the real task and deliberately selected sources when activating it.\n\n## Activation payload\n\n```text\n' + createPortableLoomSessionPrompt(artifact) + '\n```\n\n## Review commands\n\nEvery active-session answer carries phase, minimized public session/explicit route label, posture, authorization state, receipt availability, HOLD, Gate status and checked scope, plus **米 Check Loom Gate** and the ⟐ seal. Enter **米** for Gate review; Gate answers also offer **How do I know? 下**. Enter **下** for methods, evidence, references and the conventional nomenclature.\n\nThe contract applies to any receiving LLM. ChatGPT’s first binding uses prose, Markdown links and the single-glyph commands. Receiving-model compliance remains untested until a captured episode is checked. A receiver without a local verifier gives capture instructions and retains NOT_RUN.\n\nGate checks need defined captured channels, local protected targets and declared reconstruction attempts. Report counts and missing coverage. Complete-conversation leakage percentages require measured coverage and a defined denominator. The portable carries no local answer keys.\n\nA receiver receipt declares what was used. Return Check and explicit reviewed admission remain separate. Parsed exports preserve review material; live local custody capabilities stay in the originating process. Registry entries identify implementation scope; task-specific state manifests and finite observation-design inputs must be explicitly supplied before those computations can apply.\n\n## Requested next step\n\nAwait operator authorization for a Dollhouse-led battery and an Antigravity six-sequence evidence assay on this exact artifact. No assay outcome is seeded into the payload.\n'],
];
await mkdir(destination, { recursive: false });
const manifest = { schema: 'td613.loom.standard-export-manifest/v0.1', source_revision: revision, created_at: new Date().toISOString(),
  artifact_kind: 'STANDARD_NON_DEMO_PORTABLE_LOOM', session_root_ref: session.root.ref, portable_packet_digest: session.root.packet_digest,
  selected_source_count: 0, captured_gate_report_count: 0, admitted_work_unit_count: 0, receiver_binding: 'ANY_LLM; CHATGPT_FIRST_SPECIFIED',
  artifact_assay_status: 'AWAITING_OPERATOR_AUTHORIZATION', browser_candidate_witness: 'UNPERFORMED', foreign_receiver_compliance: 'UNPERFORMED',
  basic_export_checks: ['independent canonical-core recomputation', 'root packet digest match', 'no seeded scenario or result'],
  files: [] };
for (const [name, body] of files) {
  await writeFile(join(destination, name), body, { flag: 'wx' });
  manifest.files.push({ name, bytes: Buffer.byteLength(body), sha256: createHash('sha256').update(body).digest('hex') });
}
await writeFile(join(destination, 'portable-loom-standard-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
process.stdout.write(JSON.stringify({ destination, source_revision: revision, session_root_ref: session.root.ref, files: manifest.files, status: 'EXPORTED_AWAITING_ARTIFACT_ASSAY' }, null, 2) + '\n');
