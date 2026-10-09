import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash, webcrypto } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
// Supplementary engineering controls derived from R06/R07; no receiver calls,
// primary-case credit, historical rerun or retrospective preregistration.
const root = resolve('research/portable-loom-kit-assay-20261009/raw/footer-corrected-kit-001');
await mkdir(root);
const source = await readFile(new URL(import.meta.url));
await writeFile(resolve(root, 'request.json'), JSON.stringify({ scope: 'SUPPLEMENTARY_LOCAL_STRUCTURAL_TEST',
  source_commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  diagnostic_source_sha256: createHash('sha256').update(source).digest('hex'),
  artifact_source_commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), supersedes_failed_footer_boundary_in: '8a5db46f142f642d3d4c90f1a4e456a6732b8b8b',
  constructions: ['plain footer positive control', 'Markdown direct link', 'Markdown reference link', 'HTML anchor', 'quoted footer followed by one prose line', 'quoted footer followed by multiple prose lines'],
  expected_local_admission_candidates: [true, false, false, false, false, false],
  evidence_class: 'LOCAL_STRUCTURAL_TEST', provider_calls: 0, started_at: new Date().toISOString() }, null, 2) + '\n');
const kit = resolve('research/portable-loom-kit-assay-20261009/corrected-artifact');
const artifact = JSON.parse(await readFile(resolve(kit, 'portable-loom-standard.json'), 'utf8'));
const { createStandardPortableLoomRuntime, STANDARD_LOOM_RECEIVER_RESULT_SCHEMA } = await import(pathToFileURL(resolve(kit, 'runtime/app/engine/portable-loom-standard-runtime.js')));
const cases = [
  ['plain', footer => 'Synthetic fee answer.\n' + footer, true],
  ['markdown_link', footer => 'Synthetic fee answer.\n' + footer.replace('米 Check Loom Gate', '[米 Check Loom Gate](https://td613.com/)'), false],
  ['markdown_reference', footer => 'Synthetic fee answer.\n' + footer.replace('米 Check Loom Gate', '[米 Check Loom Gate][gate]'), false],
  ['html_link', footer => 'Synthetic fee answer.\n' + footer.replace('米 Check Loom Gate', '<a href="https://td613.com/">米 Check Loom Gate</a>'), false],
  ['body_short', footer => footer + '\nOrdinary prose after the quoted footer. ⟐', false],
  ['body_only', footer => footer + '\nThis is a quote in the answer, not the closing footer.\nMore answer content.\nEnd of ordinary prose. ⟐', false]
];
const results = [];
for (const [id, transform, expected] of cases) {
  const runtime = await createStandardPortableLoomRuntime(artifact, { gesture: 'START_LOCAL_SESSION', environment: { crypto: webcrypto } });
  await runtime.stage({ task: 'State a synthetic public fee.', documents: [], protected_terms: [], route: 'AUDIT' });
  const state = runtime.inspect();
  const ticket = await runtime.authorize({ gesture: 'AUTHORIZE_ONE_CARRIAGE', destination: 'Supplementary local fixture only', expected_revision: state.revision, expected_payload_digest: state.payload_digest });
  await runtime.carry(ticket);
  const e = runtime.exportPrivate().custody.pending_excursion, t = e.turns[0];
  const answer = transform(runtime.footer());
  const raw = JSON.stringify({ schema: STANDARD_LOOM_RECEIVER_RESULT_SCHEMA, answer, used_document_ids: [], missing_information: [], policy_change_requested: false,
    loom_session_receipt: { schema: 'td613.loom.portable-session-receiver-turn/v0.1', session_root_ref: e.session_root_ref, policy_commitment: e.policy_commitment,
      anchor_work_unit_ref: e.anchor_work_unit_ref, turn_index: t.turn_index, operator_task: t.task, used_document_ids: [], missing_information: [], receiver_declaration: 'Synthetic engineering footer control; no provider execution.' } });
  const capture = await runtime.capture(raw); const check = await runtime.check({ gesture: 'REVIEW_ROOT_RULES' });
  const actual = check.status === 'ADMISSION_CANDIDATE';
  results.push({ id, expected_admission_candidate: expected, actual_admission_candidate: actual, verdict: actual === expected ? 'SUPPORTED_BOUNDED' : 'CONTRADICTED', capture, check_status: check.status });
  await writeFile(resolve(root, id + '.json'), JSON.stringify({ raw, capture, check, gate: runtime.gate() }, null, 2) + '\n');
}
const report = { evidence_class: 'LOCAL_STRUCTURAL_TEST', record_function: 'SUPPLEMENTARY_ENGINEERING_DIAGNOSTIC', provider_calls: 0,
  primary_case_count_change: 0, status: results.every(r => r.verdict === 'SUPPORTED_BOUNDED') ? 'PASS' : 'CONTRADICTED', results, ended_at: new Date().toISOString() };
await writeFile(resolve(root, 'results.json'), JSON.stringify(report, null, 2) + '\n');
process.stdout.write(JSON.stringify(report, null, 2) + '\n');
process.exitCode = report.status === 'PASS' ? 0 : 1;
