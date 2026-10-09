import assert from 'node:assert/strict';
import { readFile, mkdtemp, cp, appendFile, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash, webcrypto } from 'node:crypto';

// Engineering fixture only: no receiver, network request or research assay.
const root = resolve(process.argv[2]);
const assertions = [];
const verify = spawnSync(process.execPath, [join(root, 'runtime/verify.mjs')], { encoding: 'utf8' });
assert.equal(verify.status, 0, verify.stderr); assertions.push('Standalone bounded file-digest verifier passed.');
const artifact = JSON.parse(await readFile(join(root, 'portable-loom-standard.json'), 'utf8'));
const manifest = JSON.parse(await readFile(join(root, 'portable-loom-runtime-manifest.json'), 'utf8'));
for (const f of manifest.source_files) {
  const bytes = await readFile(join(root, f.path));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), f.sha256);
}
const { createStandardPortableLoomRuntime, STANDARD_LOOM_RECEIVER_RESULT_SCHEMA } = await import(pathToFileURL(join(root, manifest.runtime_entrypoint)));
if (!globalThis.crypto) Object.defineProperty(globalThis, 'crypto', { value: webcrypto });
const runtime = await createStandardPortableLoomRuntime(artifact, { gesture: 'START_LOCAL_SESSION', environment: { crypto: webcrypto } });
await runtime.stage({ task: 'State the explicitly selected public fee.', documents: [
  { id: 'public', name: 'Public fee', text: 'USD 120.', share: true },
  { id: 'private', name: 'Private record', text: 'KIT_PRIVATE_LOCAL_ONLY_613', share: false }
], protected_terms: ['KIT_PRIVATE_LOCAL_ONLY_613'], route: 'AUDIT' });
assert.ok(!runtime.preview().text.includes('KIT_PRIVATE_LOCAL_ONLY_613'));
const state = runtime.inspect();
const ticket = await runtime.authorize({ gesture: 'AUTHORIZE_ONE_CARRIAGE', destination: 'LOCAL_STRUCTURAL_TEST fixture', expected_payload_digest: state.payload_digest, expected_revision: state.revision });
const outgoing = await runtime.carry(ticket); assert.equal(outgoing.provider_transmission_observed, false);
await assert.rejects(runtime.carry(ticket), /UNAUTHORIZED/);
assertions.push('Exported dependency closure executed selected-only, exact, single-use local carriage.');
const excursion = runtime.exportPrivate().custody.pending_excursion, intent = excursion.turns[0];
const raw = JSON.stringify({ schema: STANDARD_LOOM_RECEIVER_RESULT_SCHEMA, answer: 'USD 120.\n' + runtime.footer(), used_document_ids: ['public'], missing_information: [], policy_change_requested: false,
  loom_session_receipt: { schema: 'td613.loom.portable-session-receiver-turn/v0.1', session_root_ref: excursion.session_root_ref, policy_commitment: excursion.policy_commitment,
    anchor_work_unit_ref: excursion.anchor_work_unit_ref, turn_index: intent.turn_index, operator_task: intent.task, used_document_ids: ['public'], missing_information: [], receiver_declaration: 'Synthetic package engineering fixture; no provider execution.' } });
assert.equal((await runtime.capture(raw)).status, 'CAPTURE_BOUND_LOCALLY');
const candidate = await runtime.check({ gesture: 'REVIEW_ROOT_RULES' }); assert.equal(candidate.status, 'ADMISSION_CANDIDATE');
assert.equal(runtime.inspect().custody.work_unit_count, 0);
assert.equal((await runtime.admit({ gesture: 'ADMIT_RETURNED_WORK', expected_candidate_ref: candidate.ref, expected_head_ref: candidate.expected_head_ref, accept_unresolved: true })).status, 'ADMITTED');
assert.equal(runtime.inspect().custody.work_unit_count, 1); runtime.gate();
assert.ok(runtime.explain().binding_method.includes('SHA-256')); assert.equal(runtime.presentation({ reducedMotion: true, timestampMs: 0 }).carrier_count, 39);
await runtime.rest(); assert.equal(runtime.inspect().authorized, false);
assertions.push('Exported closure executed original-byte capture, Check, explicit Admit, Gate, explanation, 39-carrier renderer and Rest.');
const commands = [{ operation: 'start', gesture: 'START_LOCAL_SESSION' }, { operation: 'inspect' }, { operation: 'gate' }, { operation: 'explain' }, { operation: 'rest' }, { operation: 'inspect' }];
const cli = spawnSync(process.execPath, [join(root, 'runtime/run.mjs')], { input: commands.map(x => JSON.stringify(x)).join('\n') + '\n', encoding: 'utf8' });
assert.equal(cli.status, 0, cli.stderr); const responses = cli.stdout.trim().split('\n').map(x => JSON.parse(x));
assert.equal(responses.length, commands.length); assert.ok(responses.every(x => x.ok), cli.stdout); assert.equal(responses.at(-1).result.phase, 'REST');
assertions.push('Standalone JSONL controller retained one live process through six explicit operations.');
const temporary = await mkdtemp(join(tmpdir(), 'td613-kit-tamper-'));
try {
  await cp(root, temporary, { recursive: true }); await appendFile(join(temporary, manifest.source_files[0].path), '\n/* synthetic tamper */\n');
  const rejected = spawnSync(process.execPath, [join(temporary, 'runtime/verify.mjs')], { encoding: 'utf8' });
  assert.notEqual(rejected.status, 0); assert.ok(rejected.stderr.includes('File digest mismatch'));
  assertions.push('Independent verifier rejected modified exported source bytes.');
} finally { await rm(temporary, { recursive: true, force: true }); }
process.stdout.write(JSON.stringify({ evidence_class: 'LOCAL_STRUCTURAL_TEST', source_revision: manifest.source_revision, source_status: manifest.source_status, source_modules: manifest.source_files.length,
  status: 'PASS', assertions, provider_calls: 0, browser_witness: 'UNPERFORMED', physical_device_witness: 'UNPERFORMED' }, null, 2) + '\n');
