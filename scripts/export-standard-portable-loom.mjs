import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash, webcrypto } from 'node:crypto';
import { buildPortableLoomResearchMathContract } from '../app/engine/portable-loom-research-math.js';
import { createLoomAiGovernance, createCanonicalPortableLoomPacket } from '../app/dome-world/holonomy-loom/ai-handoff.js';
import { STANDARD_PORTABLE_LOOM_TASK, STANDARD_PORTABLE_LOOM_RULES } from '../app/engine/portable-loom-policy.js';
import { verifyPortableLoomCore } from '../app/engine/portable-loom-core.js';
import { createPortableLoomSession, createPortableLoomSessionExport, createPortableLoomSessionPrompt, portableLoomDigest } from '../app/engine/portable-loom-session.js';

const sourceRoot = fileURLToPath(new URL('../', import.meta.url));
const destination = resolve(process.argv[2] || '');
const mathPaths = Object.freeze([
  'app/dome-world/previews/a15-r0/discrete-transport-tomography-closed-loop.js',
  'app/dome-world/previews/a15-r0/discrete-transport-tomography-closed-loop-hardened.js',
  'app/dome-world/previews/a15-r0/noncommuting-two-face-holonomy-tomography.js',
  'app/dome-world/previews/a15-r0/golden-egg-feasible-region.js',
  'app/dome-world/previews/a15-r0/open-research-field.js',
  'app/dome-world/previews/a15-r0/boolean-synergy-census.js',
  'app/dome-world/previews/a15-r0/a15-r0-contracts.js',
  'app/dome-world/previews/a15-r0/a15-r0-contracts-core.js',
  'app/dome-world/ash-a15-empirical-profile-journeys.js',
  'app/engine/dollhouse-claim-lift-runtime.js'
]);
const mathSources = await Promise.all(mathPaths.map(async path => {
  const content = await readFile(join(sourceRoot, path), 'utf8');
  return { path, content, sha256: createHash('sha256').update(content).digest('hex') };
}));
const mathContract = {
  schema: 'td613.loom.portable-tomography-contract/v0.1',
  source_revision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  executable: 'portable-loom-tomography-audit.mjs',
  selected_math: ['hardened discrete transport tomography in F_31',
    'noncommuting two-face GL2(F_31) holonomy',
    'factorized synthetic Golden Egg L/R/J feasible region',
    'five-surface same-episode declaration evaluator'],
  mathematical_source_files: mathSources.map(({path,sha256}) => ({ path, sha256 })),
  empirical_acquisition: 'NOT_RUN',
  qualified_same_episode: false,
  required_new_evidence: ['preregistered distinct routes', 'same comparison frame',
    'continuous custody', 'jointly measured L/R/J', 'empirically bound G',
    'two actually observed matched control/protected returns'],
  independently_authenticated: false,
  claim_ceiling: 'EXACT_AUTHORED_FINITE_MATH_AND_DECLARATION_CHECKS_ONLY'
};
if (!process.argv[2]) throw new Error('Provide a new export directory.');
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' }).trim()) throw new Error('Standard export requires committed source bytes; commit or restore tracked changes before export.');
const environment = { crypto: webcrypto, TextEncoder };
const input = { task: STANDARD_PORTABLE_LOOM_TASK, rules: [...STANDARD_PORTABLE_LOOM_RULES], documents: [] };
input.governance = await createLoomAiGovernance(input, { withheldDocumentCount: 0 }, environment);
const packet = await createCanonicalPortableLoomPacket(input, { sourceRevision: revision }, environment);
const session = await createPortableLoomSession(packet, { session_id: webcrypto.randomUUID(), source_revision: revision }, environment);
const artifact = { ...await createPortableLoomSessionExport(session, packet, environment), loom_gate_reports: [], research_math_contract: buildPortableLoomResearchMathContract(),
  portable_tomography: {
    schema: mathContract.schema,
    execution: 'LOCAL_COMPANION_REQUIRED',
    executable: mathContract.executable,
    mathematically_verified_for_this_session: false,
    observer_capture_present: false,
    matched_return_present: false,
    empirical_promotion_authority: false
  }
};
await verifyPortableLoomCore(input, JSON.parse(JSON.stringify(artifact)).portable_task.portable_governance, environment);
if (session.root.packet_digest !== await portableLoomDigest(artifact.portable_task, environment)) throw new Error('Exported packet root mismatch.');
if (artifact.portable_task.documents.length || artifact.loom_gate_reports.length || artifact.session.work_units.length) throw new Error('Standard export cannot seed scenario content or results.');
if (artifact.research_math_contract.episode_evaluation_status !== 'NOT_RUN' || artifact.research_math_contract.measured_surface_count !== 0 || artifact.research_math_contract.earned_empirical_result !== false) throw new Error('Standard export cannot seed empirical acquisition or certification.');
const files = [
  ['portable-loom-standard.json', JSON.stringify(artifact, null, 2) + '\n'],
  ['portable-loom-standard.md', '# Standard Portable Loom\n\nReceiver-neutral session governance; ChatGPT is the first specified output format. This export contains no demo, source documents, private keys, captured Gate results or admitted returned work. Supply the real task and deliberately selected sources when activating it.\n\n## Activation payload\n\n```text\n' + createPortableLoomSessionPrompt(artifact) + '\n```\n\n## Review commands\n\nEvery active-session answer carries phase, minimized public session/explicit route label, posture, authorization state, receipt availability, HOLD, Gate status and checked scope, plus **米 Check Loom Gate** and the ⟐ seal. Enter **米** for Gate review; Gate answers also offer **How do I know? 下**. Enter **下** for methods, evidence, references and the conventional nomenclature.\n\nThe contract applies to any receiving LLM. ChatGPT’s first binding uses prose, Markdown links and the single-glyph commands. Receiving-model compliance remains untested until a captured episode is checked. A receiver without a local verifier gives capture instructions and retains NOT_RUN.\n\nGate checks need defined captured channels, local protected targets and declared reconstruction attempts. Report counts and missing coverage. Complete-conversation leakage percentages require measured coverage and a defined denominator. The portable carries no local answer keys.\n\nA receiver receipt declares what was used. Return Check and explicit reviewed admission remain separate. Parsed exports preserve review material; live local custody capabilities stay in the originating process. Registry entries identify implementation scope; task-specific state manifests and finite observation-design inputs must be explicitly supplied before those computations can apply.\n\n## Requested next step\n\nAwait operator authorization for a Dollhouse-led battery and an Antigravity six-sequence evidence assay on this exact artifact. No assay outcome is seeded into the payload.\n'],
];
const companionBody = await readFile(join(sourceRoot,'scripts/portable-loom-tomography-audit.mjs'),'utf8');
files.push(['portable-loom-tomography-audit.mjs', companionBody]);
files.push(['portable-loom-math-contract.json', JSON.stringify(mathContract,null,2)+'\n']);
files.push(['tomography/package.json', '{"type":"module"}\n']);
for (const source of mathSources) files.push(['tomography/'+source.path, source.content]);
const markdown = files.find(file => file[0]==='portable-loom-standard.md');
markdown[1] += '\n## Executable mathematics (local companion)\n\nThe exported artifact includes the exact canonical finite-math source, its SHA-256 source manifest, and \`portable-loom-tomography-audit.mjs\`. Run \`node portable-loom-tomography-audit.mjs --self-check\` locally to recompute bounded F_31 transport/holonomy and factorized L/R/J feasible-region fixtures; \`--episode /path/to/episode.json\` checks a separately supplied declared five-surface acquisition without authenticating its exterior origin. The receiver LLM cannot run this local companion by merely promising compliance. This is research math, not live conversation tomography: without observed routes, calibration and matched returns, empirical acquisition stays NOT_RUN.\n';
markdown[1] += '\n## Five-surface research contract\n\nThe exported research_math_contract is recomputed from the finite feasible-region kernel and same-episode candidate evaluator. L, R and J thresholds, Pareto counts, and failure vectors come from that declared model rather than an LLM guess. G and C require independently acquired geometry and both real matched returns. This appendix and the local F_31 companion have zero empirical acquisition credit until qualifying observation.\n';
await mkdir(destination, { recursive: false });
const manifest = { schema: 'td613.loom.standard-export-manifest/v0.1', source_revision: revision, created_at: new Date().toISOString(),
  artifact_kind: 'STANDARD_NON_DEMO_PORTABLE_LOOM', session_root_ref: session.root.ref, portable_packet_digest: session.root.packet_digest,
  selected_source_count: 0, captured_gate_report_count: 0, admitted_work_unit_count: 0, receiver_binding: 'ANY_LLM; CHATGPT_FIRST_SPECIFIED',
  artifact_assay_status: 'AWAITING_OPERATOR_AUTHORIZATION', browser_candidate_witness: 'UNPERFORMED', foreign_receiver_compliance: 'UNPERFORMED',
  research_math_schema: artifact.research_math_contract.schema, research_math_kernels: artifact.research_math_contract.mathematical_kernels, research_math_status: 'DERIVED_SYNTHETIC_REGION; EMPIRICAL_EPISODE_NOT_RUN',
  mathematical_companion: { executable: mathContract.executable, contract: 'portable-loom-math-contract.json',
    status: 'LOCAL_RECOMPUTATION_AVAILABLE', empirical_acquisition: 'NOT_RUN', golden_egg_earned: false },
  basic_export_checks: ['independent canonical-core recomputation', 'root packet digest match', 'no seeded scenario or result'],
  files: [] };
for (const [name, body] of files) {
  await mkdir(dirname(join(destination,name)), { recursive:true });
  await writeFile(join(destination, name), body, { flag: 'wx' });
  manifest.files.push({ name, bytes: Buffer.byteLength(body), sha256: createHash('sha256').update(body).digest('hex') });
}
const audit = JSON.parse(execFileSync(process.execPath,
  [join(destination,'portable-loom-tomography-audit.mjs'),'--self-check'], { encoding:'utf8', maxBuffer:1024*1024*4 }));
if (audit.mathematical_modules_recomputed !== true || audit.empirical_golden_egg_earned !== false
  || audit.transport.valid_finite_fixture !== true || audit.face_holonomy.valid_finite_fixture !== true
  || audit.feasible_region.joint_realizability !== 'UNMEASURED') {
  throw new Error('Exported tomography companion failed its actual mathematical self-check.');
}
// Put the *actual* export-time computation where a receiving LLM can see it.
// This is a deterministic finite-math fixture report, not a fresh provider or
// independent empirical observation, and never mints custody authority.
const receiptName = 'portable-loom-tomography-receipt.json';
const receipt = {
  schema: 'td613.loom.portable-tomography-execution-receipt/v0.1',
  execution_origin: 'EXPORTER_LOCAL_NODE_PROCESS',
  source_revision: revision,
  session_root_ref: session.root.ref,
  math_contract_sha256: createHash('sha256').update(JSON.stringify(mathContract, null, 2) + '\n').digest('hex'),
  canonical_source_hashes_checked: true,
  evidence_class: 'LOCALLY_EXECUTED_FINITE_SYNTHETIC_FIXTURE',
  observer_measurement: 'NOT_RUN',
  real_route_acquisition: 'NOT_RUN',
  empirical_promotion_authority: false,
  self_check_audit: audit
};
const receiptBody = JSON.stringify(receipt, null, 2) + '\n';
const receiptSha256 = createHash('sha256').update(receiptBody).digest('hex');
await writeFile(join(destination, receiptName), receiptBody, { flag: 'wx' });
manifest.files.push({ name: receiptName, bytes: Buffer.byteLength(receiptBody), sha256: receiptSha256 });
artifact.portable_tomography.calculated_fixture_receipt = {
  schema: receipt.schema,
  execution_origin: receipt.execution_origin,
  evidence_class: receipt.evidence_class,
  status: 'CANONICAL_FINITE_MATH_RECOMPUTED',
  receipt_file: receiptName,
  receipt_sha256: receiptSha256,
  mathematical_result: audit,
  observer_measurement: 'NOT_RUN',
  empirical_promotion_authority: false
};
const portableJson = JSON.stringify(artifact, null, 2) + '\n';
await writeFile(join(destination, 'portable-loom-standard.json'), portableJson);
const originalPrompt = createPortableLoomSessionPrompt({
  ...artifact,
  portable_tomography: Object.fromEntries(Object.entries(artifact.portable_tomography).filter(([key]) => key !== 'calculated_fixture_receipt'))
});
let readme = await readFile(join(destination, 'portable-loom-standard.md'), 'utf8');
if (!readme.includes(originalPrompt)) throw new Error('PORTABLE_EXPORT_ACTIVATION_PROMPT_REPLACEMENT_FAILED');
readme = readme.replace(originalPrompt, createPortableLoomSessionPrompt(artifact));
readme += '\n## Export-time mathematical execution receipt\n\nThe canonical companion was actually executed by the local Node exporter. The JSON activation includes its bounded synthetic fixture report, and \`' + receiptName + '\` retains the separately hashed execution record. A receiving AI may read and explain these values as an **export-time local result**, not claim it ran the computation. New evidence needs a fresh local \`--episode\` invocation; no receiver reply alone executes or authenticates that procedure.\n';
await writeFile(join(destination, 'portable-loom-standard.md'), readme);
for (const [name, body] of [['portable-loom-standard.json',portableJson],['portable-loom-standard.md',readme]]) {
  const item = manifest.files.find(entry => entry.name === name);
  if (!item) throw new Error('PORTABLE_EXPORT_MANIFEST_ENTRY_MISSING');
  item.bytes = Buffer.byteLength(body);
  item.sha256 = createHash('sha256').update(body).digest('hex');
}
// A second invocation checks the receipt against freshly recomputed source math.
const repeat = JSON.parse(execFileSync(process.execPath,
  [join(destination,'portable-loom-tomography-audit.mjs'),'--self-check'], { encoding:'utf8', maxBuffer:1024*1024*4 }));
if (JSON.stringify(repeat) !== JSON.stringify(audit)) throw new Error('PORTABLE_TOMOGRAPHY_EXECUTION_RECEIPT_RECHECK_FAILED');
manifest.mathematical_companion.status = 'CANONICAL_FINITE_MATH_RECOMPUTED';
manifest.mathematical_companion.receipt_file = receiptName;
manifest.mathematical_companion.receipt_sha256 = receiptSha256;
manifest.basic_export_checks.push('mathematical export-time receipt independently recomputed and embedded in activation');
await writeFile(join(destination, 'portable-loom-standard-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
process.stdout.write(JSON.stringify({ destination, source_revision: revision, session_root_ref: session.root.ref, files: manifest.files, status: 'EXPORTED_AWAITING_ARTIFACT_ASSAY' }, null, 2) + '\n');
