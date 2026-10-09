import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { loadFrozenInputs, prepareComparisonPrompt, prepareReceiverMessages, validateTransportBinding,
  buildBoundedWire, captureOneBoundCall, loadRetainedCapture, admitGovernedRoleCaptures, sha256 } from './assay-harness.mjs';
import { loadReceiverContinuation } from './assay-harness.mjs';

function saveNew(path, data) {
  if (existsSync(path)) throw new Error('Prepared/captured file already exists.');
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', { flag: 'wx' });
}
function assertSourceFrozen(binding) {
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  if (head !== binding.protocol_commit) throw new Error('Exact premeasurement runtime/protocol HEAD required.');
  const root = process.cwd();
  for (const relative of ['research/portable-loom-provider-conduit-20261009/assay-harness.mjs',
    'research/portable-loom-provider-conduit-20261009/run-model-assay.mjs']) {
    if (sha256(readFileSync(resolve(root, relative))) !== sha256(execFileSync('git', ['show', `${head}:${relative}`]))) throw new Error('Uncommitted capture runtime.');
  }
  loadFrozenInputs(root);
}
const [mode, ...args] = process.argv.slice(2);
try {
  if (mode === 'prepare-comparison') {
    const [caseId, role, output] = args;
    if (args.length !== 3) throw new Error('prepare-comparison <case-id> <role|MONOLITH> <new-file>');
    saveNew(output, { status: 'PREPARED_NOT_EXECUTED', ...prepareComparisonPrompt(caseId, role) });
  } else if (mode === 'prepare-receiver') {
    const [caseId, priorCaptureFile, output] = args;
    if (args.length !== 3) throw new Error('prepare-receiver <R-case-id> <prior-turns-json|EMPTY> <new-file>');
    const prior = priorCaptureFile === 'EMPTY' ? [] : JSON.parse(readFileSync(priorCaptureFile));
    saveNew(output, { status: 'PREPARED_NOT_EXECUTED', ...prepareReceiverMessages(caseId, prior) });
  } else if (mode === 'call-comparison') {
    const [bindingFile, caseId, role, trialId, attemptDir, journal] = args;
    if (args.length !== 6) throw new Error('call-comparison <binding> <case-id> <role|MONOLITH> <registered-trial-id> <new-attempt-directory> <budget-journal>');
    const binding = validateTransportBinding(JSON.parse(readFileSync(bindingFile))); assertSourceFrozen(binding);
    const prompt = prepareComparisonPrompt(caseId, role), wire = buildBoundedWire(binding, [{ role: 'user', content: prompt.prompt }], prompt.maximum_output_tokens);
    const result = await captureOneBoundCall(binding, wire, attemptDir, journal, { trialIdentity: { trial_id: trialId, case_id: caseId, role, turn_index: 0 } });
    console.log(JSON.stringify({ case_id: caseId, role, status: result.status, request_sha256: result.request_sha256, response_sha256: result.response_sha256 }));
  } else if (mode === 'call-receiver') {
    const [bindingFile, caseId, trialId, priorCaptureFile, attemptDir, journal, outputLimit] = args;
    if (args.length !== 7) throw new Error('call-receiver <binding> <case-id> <registered-trial-id> <prior-capture-refs-json|EMPTY> <new-attempt-directory> <budget-journal> <output-token-limit>');
    const binding = validateTransportBinding(JSON.parse(readFileSync(bindingFile))); assertSourceFrozen(binding);
    const prior = loadReceiverContinuation(priorCaptureFile, binding, trialId, caseId);
    const input = prepareReceiverMessages(caseId, prior);
    const wire = buildBoundedWire(binding, input.messages, Number(outputLimit));
    const result = await captureOneBoundCall(binding, wire, attemptDir, journal, { trialIdentity: { trial_id: trialId, case_id: caseId, role: 'RECEIVER', turn_index: input.turn_index } });
    console.log(JSON.stringify({ case_id: caseId, turn_index: input.turn_index, status: result.status, request_sha256: result.request_sha256, response_sha256: result.response_sha256 }));
  } else if (mode === 'admit-D') {
    const [bindingFile, caseId, captureDirectory, output] = args;
    if (args.length !== 4) throw new Error('admit-D <binding> <case-id> <four-role-capture-directory> <new-result-file>');
    const binding = validateTransportBinding(JSON.parse(readFileSync(bindingFile)));
    const corpus = JSON.parse(readFileSync('research/portable-loom-dollhouse-execution-20261009/CASE_SET.json'));
    const c = corpus.cases.find(c => c.case_id === caseId); if (!c) throw new Error('Unregistered case.');
    const captures = ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT'].map(role => {
      const cap = loadRetainedCapture(join(captureDirectory, role), binding, { case_id: caseId, role, capture_id: `${caseId}-${role}` });
      const expected = prepareComparisonPrompt(caseId, role);
      const expectedWire = buildBoundedWire(binding, [{ role: 'user', content: expected.prompt }], expected.maximum_output_tokens);
      if (expectedWire.sha256 !== cap.request_sha256) throw new Error('Role request differs from frozen prompt envelope.');
      return cap;
    });
    saveNew(output, admitGovernedRoleCaptures(c, captures));
  } else throw new Error('Supported modes: prepare-comparison, prepare-receiver, call-comparison, call-receiver, admit-D.');
} catch (error) {
  console.error(JSON.stringify({ status: 'HELD', reason: error.message, retries: 0 }));
  process.exitCode = 2;
}
